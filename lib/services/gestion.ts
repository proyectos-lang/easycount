// SERVER-ONLY. Portal de gestión interna de EasyCount (/gestion): CRM +
// cobros + finanzas del negocio. Usa el service role (tablas gestion_* sin
// políticas RLS) y valida SIEMPRE que el usuario sea super-admin
// (plataforma_admins). NUNCA importar desde un Client Component.
import type { SupabaseClient } from "@supabase/supabase-js"
import { createAdminClient } from "@/lib/supabase/admin"
import { getSuperadmin, type Superadmin } from "@/lib/services/plataforma"
import { getHondurasNowISO, getHondurasTodayISODate } from "@/lib/utils/honduras-time"
import {
  basePeriodoPago, estadoCobro, estadoDesdeEtapa, estadoEmpresaPorCobro, etapaDesdeEstado, etapaPorResultado, finPrueba, periodoCubierto, primerProximoPago,
  proximoPago, sumarDias, diasEntre, DIAS_PRUEBA_DEFAULT, ETIQUETA_ESTADO, ETIQUETA_ETAPA, ETIQUETA_RESULTADO,
  type Ciclo, type EstadoCobro, type EstadoEmpresa, type EtapaPipeline, type MetodoPago, type MotivoPerdida, type ResultadoReunion,
  type RolGestion, type TipoReunion, type EstadoReunion,
} from "@/lib/gestion/reglas"

export const GESTION_FEATURE_PENDING = "El portal de gestión necesita la base de datos: aplica scripts/076-gestion-portal.sql en Supabase."

// ==================== TIPOS ====================

export interface GConfig {
  dias_prueba: number
  moneda: string
  planes: { nombre: string; cuota: number; ciclo: Ciclo }[]
  categorias_gasto: string[]
  plantillas_recordatorio: { nombre: string; texto: string }[]
}
export interface GCuenta { id: number; nombre: string; banco: string | null; moneda: string; activo: boolean }

export interface GEmpresa {
  id: number
  nombre: string
  nombre_comercial: string | null
  dueno: string | null
  contacto_principal: string | null
  telefono: string | null
  whatsapp: string | null
  correo: string | null
  ciudad: string | null
  pais: string
  redes: string | null
  plan: string | null
  cuota: number
  moneda: string
  ciclo_cobro: Ciclo
  fecha_instalacion: string | null
  fecha_inicio_prueba: string | null
  dia_cobro: number | null
  fecha_proximo_pago: string | null
  sucursales: number
  observaciones: string | null
  estado: EstadoEmpresa
  etapa_pipeline: EtapaPipeline
  motivo_perdida: MotivoPerdida | null
  ultima_interaccion: string | null
  proxima_accion: string | null
  razon_social_id: number | null
  created_at: string
  updated_at: string | null
  // Derivados (no se guardan)
  fin_prueba: string | null
  estado_cobro: EstadoCobro
  ultimo_pago: string | null
  cubierto_hasta: string | null
  total_pagado: number
}

export interface GPago {
  id: number
  empresa_id: number
  fecha: string
  monto: number
  metodo: MetodoPago
  cuenta_id: number | null
  referencia: string | null
  observaciones: string | null
  ciclo_aplicado: Ciclo
  periodo_cubierto_desde: string | null
  periodo_cubierto_hasta: string | null
  usuario: string | null
  created_at: string
  empresa_nombre?: string
  cuenta_nombre?: string | null
}

export interface GReunion {
  id: number
  empresa_id: number
  contacto: string | null
  fecha: string
  hora: string | null
  tipo: TipoReunion
  estado: EstadoReunion
  resultado: ResultadoReunion | null
  motivo_perdida: MotivoPerdida | null
  notas: string | null
  proximo_paso: string | null
  created_at: string
  empresa_nombre?: string
}

export interface GGasto {
  id: number
  fecha: string
  categoria: string
  descripcion: string | null
  monto: number
  metodo: string | null
  comprobante_path: string | null
  observaciones: string | null
  usuario: string | null
  created_at: string
  /** Quién pagó el gasto: null = EasyCount; id = socio (script 077). */
  socio_id: number | null
}

export interface GSocio { id: number; nombre: string; porcentaje: number; correo: string | null; notas: string | null; activo: boolean }
export interface GLiquidacion { id: number; socio_id: number; fecha: string; monto: number; periodo: string | null; cuenta_id: number | null; notas: string | null; usuario: string | null; created_at: string }

/** Marca la ausencia del script 077 (socios). El resto del portal sigue funcionando. */
export const SOCIOS_FEATURE_PENDING = "Socios y liquidaciones necesitan la base de datos: aplica scripts/077-gestion-socios.sql en Supabase."

export interface GCampana {
  id: number
  nombre: string
  plataforma: string
  fecha_inicio: string | null
  fecha_fin: string | null
  monto_invertido: number
  prospectos_generados: number
  reuniones_generadas: number
  clientes_obtenidos: number
}

export interface GActividad { id: number; empresa_id: number; tipo: string; descripcion: string | null; fecha: string; usuario: string | null }
export interface GNotificacion { id: number; clave: string; tipo: string; empresa_id: number | null; mensaje: string; fecha: string; leida: boolean }
export interface GAdmin { user_id: string; email: string | null; nombre: string | null; rol: RolGestion }

export type Resultado<T> = { data: T; error: null } | { data: null; error: string }

// ==================== AYUDAS ====================

type Fila = Record<string, unknown>

function mensajeError(e: unknown): string {
  const err = e as { message?: string; code?: string } | null
  const msg = err?.message || String(e)
  const low = msg.toLowerCase()
  if (err?.code === "42P01" || err?.code === "PGRST205" || low.includes("could not find the table") || /relation .*gestion_.* does not exist/.test(low)) {
    return GESTION_FEATURE_PENDING
  }
  return msg
}

/** Contexto autorizado: super-admin + cliente service role + nombre para sellar. */
async function ctx(): Promise<{ admin: SupabaseClient; sa: Superadmin; usuario: string } | { error: string }> {
  const sa = await getSuperadmin()
  if (!sa) return { error: "No autorizado." }
  const admin = createAdminClient()
  if (!admin) return { error: "Service role no configurado." }
  return { admin, sa, usuario: sa.nombre || sa.email || "admin" }
}

/** Ejecuta `fn` con el contexto autorizado y normaliza errores. */
async function con<T>(fn: (c: { admin: SupabaseClient; sa: Superadmin; usuario: string; hoy: string }) => Promise<T>): Promise<Resultado<T>> {
  const c = await ctx()
  if ("error" in c) return { data: null, error: c.error }
  try {
    return { data: await fn({ ...c, hoy: getHondurasTodayISODate() }), error: null }
  } catch (e) {
    return { data: null, error: mensajeError(e) }
  }
}

/** Lee todas las filas paginando de 1000 (tope de PostgREST). */
async function todas(fn: (desde: number, hasta: number) => PromiseLike<{ data: unknown[] | null; error: { message: string; code?: string } | null }>): Promise<Fila[]> {
  const out: Fila[] = []
  for (let a = 0; a < 200_000; a += 1000) {
    const { data, error } = await fn(a, a + 999)
    if (error) throw error
    out.push(...((data || []) as Fila[]))
    if ((data || []).length < 1000) break
  }
  return out
}

const num = (v: unknown) => Number(v) || 0
const txt = (v: unknown): string | null => (v == null || v === "" ? null : String(v))

async function bitacora(admin: SupabaseClient, empresaId: number, tipo: string, descripcion: string, usuario: string): Promise<void> {
  await admin.from("gestion_actividades").insert({ empresa_id: empresaId, tipo, descripcion, usuario, fecha: getHondurasNowISO() })
}

// ==================== CONFIG / CUENTAS / ROL ====================

export async function getConfigGestion(): Promise<Resultado<GConfig>> {
  return con(async ({ admin }) => {
    const { data, error } = await admin.from("gestion_config").select("*").eq("id", 1).maybeSingle()
    if (error) throw error
    const c = (data || {}) as Fila
    return {
      dias_prueba: num(c.dias_prueba) || DIAS_PRUEBA_DEFAULT,
      moneda: txt(c.moneda) || "L",
      planes: Array.isArray(c.planes) ? (c.planes as GConfig["planes"]) : [],
      categorias_gasto: Array.isArray(c.categorias_gasto) ? (c.categorias_gasto as string[]) : [],
      plantillas_recordatorio: Array.isArray(c.plantillas_recordatorio) ? (c.plantillas_recordatorio as GConfig["plantillas_recordatorio"]) : [],
    }
  })
}

export async function saveConfigGestion(parcial: Partial<GConfig>): Promise<Resultado<true>> {
  return con(async ({ admin }) => {
    const { error } = await admin.from("gestion_config").upsert({ id: 1, ...parcial, updated_at: new Date().toISOString() })
    if (error) throw error
    return true as const
  })
}

export async function getCuentasGestion(): Promise<Resultado<GCuenta[]>> {
  return con(async ({ admin }) => {
    const { data, error } = await admin.from("gestion_cuentas").select("*").order("id")
    if (error) throw error
    return ((data || []) as Fila[]).map((r) => ({ id: num(r.id), nombre: String(r.nombre), banco: txt(r.banco), moneda: String(r.moneda || "HNL"), activo: r.activo !== false }))
  })
}

export async function saveCuentaGestion(input: { id?: number; nombre: string; banco?: string | null; moneda?: string; activo?: boolean }): Promise<Resultado<true>> {
  return con(async ({ admin }) => {
    const payload = { nombre: input.nombre.trim(), banco: txt(input.banco), moneda: input.moneda || "HNL", activo: input.activo ?? true }
    const q = input.id ? admin.from("gestion_cuentas").update(payload).eq("id", input.id) : admin.from("gestion_cuentas").insert(payload)
    const { error } = await q
    if (error) throw error
    return true as const
  })
}

/** Rol del super-admin logueado en el portal (null en BD = administrador). */
export async function getRolGestion(): Promise<RolGestion> {
  const c = await ctx()
  if ("error" in c) return "administrador"
  try {
    const { data } = await c.admin.from("plataforma_admins").select("rol").eq("user_id", c.sa.id).maybeSingle()
    const rol = (data as Fila | null)?.rol
    return rol === "ventas" || rol === "contabilidad" ? rol : "administrador"
  } catch {
    return "administrador"
  }
}

export async function getAdminsGestion(): Promise<Resultado<GAdmin[]>> {
  return con(async ({ admin }) => {
    const { data, error } = await admin.from("plataforma_admins").select("user_id, email, nombre, rol").order("created_at")
    if (error) throw error
    return ((data || []) as Fila[]).map((r) => ({ user_id: String(r.user_id), email: txt(r.email), nombre: txt(r.nombre), rol: (r.rol === "ventas" || r.rol === "contabilidad" ? r.rol : "administrador") as RolGestion }))
  })
}

export async function setRolAdminGestion(userId: string, rol: RolGestion): Promise<Resultado<true>> {
  return con(async ({ admin }) => {
    const { error } = await admin.from("plataforma_admins").update({ rol }).eq("user_id", userId)
    if (error) throw error
    return true as const
  })
}

// ==================== EMPRESAS ====================

function mapEmpresa(r: Fila, pagos: Fila[], diasPrueba: number, hoy: string): GEmpresa {
  const mios = pagos.filter((p) => num(p.empresa_id) === num(r.id))
  const ultimo = mios.reduce<string | null>((m, p) => (!m || String(p.fecha) > m ? String(p.fecha) : m), null)
  const cubierto = mios.reduce<string | null>((m, p) => (p.periodo_cubierto_hasta && (!m || String(p.periodo_cubierto_hasta) > m) ? String(p.periodo_cubierto_hasta) : m), null)
  const estado = (r.estado as EstadoEmpresa) || "prospecto"
  const inst = txt(r.fecha_instalacion)
  return {
    id: num(r.id), nombre: String(r.nombre), nombre_comercial: txt(r.nombre_comercial), dueno: txt(r.dueno), contacto_principal: txt(r.contacto_principal),
    telefono: txt(r.telefono), whatsapp: txt(r.whatsapp), correo: txt(r.correo), ciudad: txt(r.ciudad), pais: String(r.pais || "Honduras"), redes: txt(r.redes),
    plan: txt(r.plan), cuota: num(r.cuota), moneda: String(r.moneda || "L"), ciclo_cobro: (r.ciclo_cobro as Ciclo) || "mensual",
    fecha_instalacion: inst, fecha_inicio_prueba: txt(r.fecha_inicio_prueba), dia_cobro: r.dia_cobro == null ? null : num(r.dia_cobro),
    fecha_proximo_pago: txt(r.fecha_proximo_pago), sucursales: num(r.sucursales) || 1, observaciones: txt(r.observaciones), estado,
    etapa_pipeline: (r.etapa_pipeline as EtapaPipeline) || "nuevo", motivo_perdida: (txt(r.motivo_perdida) as MotivoPerdida | null),
    ultima_interaccion: txt(r.ultima_interaccion), proxima_accion: txt(r.proxima_accion), razon_social_id: r.razon_social_id == null ? null : num(r.razon_social_id),
    created_at: String(r.created_at), updated_at: txt(r.updated_at),
    fin_prueba: inst ? finPrueba(inst, diasPrueba) : null,
    estado_cobro: estadoCobro({ fechaProximoPago: txt(r.fecha_proximo_pago), hoy, cubiertoHasta: cubierto }),
    ultimo_pago: ultimo, cubierto_hasta: cubierto, total_pagado: mios.reduce((s, p) => s + num(p.monto), 0),
  }
}

async function leerEmpresas(admin: SupabaseClient, hoy: string): Promise<GEmpresa[]> {
  const [emp, pagos, cfg] = await Promise.all([
    todas((a, b) => admin.from("gestion_empresas").select("*").order("nombre").range(a, b)),
    todas((a, b) => admin.from("gestion_pagos").select("empresa_id, fecha, monto, periodo_cubierto_hasta").range(a, b)),
    admin.from("gestion_config").select("dias_prueba").eq("id", 1).maybeSingle(),
  ])
  const diasPrueba = num((cfg.data as Fila | null)?.dias_prueba) || DIAS_PRUEBA_DEFAULT
  return emp.map((r) => mapEmpresa(r, pagos, diasPrueba, hoy))
}

export async function getEmpresasGestion(): Promise<Resultado<GEmpresa[]>> {
  return con(({ admin, hoy }) => leerEmpresas(admin, hoy))
}

export interface EmpresaInput {
  id?: number
  nombre: string
  nombre_comercial?: string | null
  dueno?: string | null
  contacto_principal?: string | null
  telefono?: string | null
  whatsapp?: string | null
  correo?: string | null
  ciudad?: string | null
  pais?: string | null
  redes?: string | null
  plan?: string | null
  cuota?: number
  moneda?: string
  ciclo_cobro?: Ciclo
  fecha_instalacion?: string | null
  fecha_inicio_prueba?: string | null
  dia_cobro?: number | null
  fecha_proximo_pago?: string | null
  sucursales?: number
  observaciones?: string | null
  estado?: EstadoEmpresa
  razon_social_id?: number | null
}

/** Crea o edita una empresa. Sincroniza etapa ↔ estado y deja bitácora. */
export async function saveEmpresaGestion(input: EmpresaInput): Promise<Resultado<number>> {
  return con(async ({ admin, usuario, hoy }) => {
    const anterior = input.id ? ((await admin.from("gestion_empresas").select("*").eq("id", input.id).maybeSingle()).data as Fila | null) : null
    const estado: EstadoEmpresa = input.estado ?? ((anterior?.estado as EstadoEmpresa) || "prospecto")
    const ciclo: Ciclo = input.ciclo_cobro ?? ((anterior?.ciclo_cobro as Ciclo) || "mensual")
    const diaCobro = input.dia_cobro === undefined ? (anterior?.dia_cobro == null ? null : num(anterior.dia_cobro)) : input.dia_cobro
    const inst = input.fecha_instalacion === undefined ? txt(anterior?.fecha_instalacion) : input.fecha_instalacion
    let proximo = input.fecha_proximo_pago === undefined ? txt(anterior?.fecha_proximo_pago) : input.fecha_proximo_pago
    // Cliente que se activa sin fecha de cobro: primer vencimiento según el ciclo.
    if ((estado === "activo" || estado === "pago_pendiente") && !proximo) proximo = primerProximoPago(hoy, ciclo, diaCobro, inst)

    const payload: Fila = {
      nombre: input.nombre.trim(), nombre_comercial: txt(input.nombre_comercial), dueno: txt(input.dueno), contacto_principal: txt(input.contacto_principal),
      telefono: txt(input.telefono), whatsapp: txt(input.whatsapp), correo: txt(input.correo), ciudad: txt(input.ciudad), pais: txt(input.pais) || "Honduras",
      redes: txt(input.redes), plan: txt(input.plan), cuota: num(input.cuota ?? anterior?.cuota), moneda: input.moneda || String(anterior?.moneda || "L"),
      ciclo_cobro: ciclo, fecha_instalacion: inst, fecha_inicio_prueba: input.fecha_inicio_prueba === undefined ? txt(anterior?.fecha_inicio_prueba) : (input.fecha_inicio_prueba || inst),
      dia_cobro: ciclo === "mensual" ? diaCobro : null, fecha_proximo_pago: proximo, sucursales: num(input.sucursales ?? anterior?.sucursales) || 1,
      observaciones: txt(input.observaciones), estado, etapa_pipeline: etapaDesdeEstado(estado),
      razon_social_id: input.razon_social_id === undefined ? (anterior?.razon_social_id ?? null) : input.razon_social_id,
      updated_at: new Date().toISOString(),
    }
    if (input.id && anterior?.etapa_pipeline === "no_interesado" && estado === "cancelado") payload.etapa_pipeline = "no_interesado"

    if (input.id) {
      const { error } = await admin.from("gestion_empresas").update(payload).eq("id", input.id)
      if (error) throw error
      if (anterior && anterior.estado !== estado) await bitacora(admin, input.id, "estado", `Estado: ${ETIQUETA_ESTADO[anterior.estado as EstadoEmpresa] ?? anterior.estado} → ${ETIQUETA_ESTADO[estado]}`, usuario)
      if (anterior && txt(anterior.fecha_instalacion) !== inst && inst) await bitacora(admin, input.id, "instalada", `Instalación: ${inst}`, usuario)
      if (anterior && anterior.estado !== "activo" && estado === "activo") await bitacora(admin, input.id, "activada", "Cliente activado", usuario)
      return input.id
    }
    const { data, error } = await admin.from("gestion_empresas").insert(payload).select("id").single()
    if (error) throw error
    const id = num((data as Fila).id)
    await bitacora(admin, id, "creada", `Empresa creada como ${ETIQUETA_ESTADO[estado]}`, usuario)
    if (inst) await bitacora(admin, id, "instalada", `Instalación: ${inst}`, usuario)
    if (estado === "activo") await bitacora(admin, id, "activada", "Cliente activado", usuario)
    return id
  })
}

/** Mueve una tarjeta del pipeline (persistiendo etapa + estado derivado). */
export async function setEtapaGestion(id: number, etapa: EtapaPipeline, motivo?: MotivoPerdida | null): Promise<Resultado<true>> {
  return con(async ({ admin, usuario, hoy }) => {
    const { data: cur } = await admin.from("gestion_empresas").select("estado, ciclo_cobro, dia_cobro, fecha_instalacion, fecha_proximo_pago").eq("id", id).maybeSingle()
    const c = (cur || {}) as Fila
    const estado = estadoDesdeEtapa(etapa, c.estado as EstadoEmpresa)
    const payload: Fila = { etapa_pipeline: etapa, estado, ultima_interaccion: getHondurasNowISO(), updated_at: new Date().toISOString() }
    if (etapa === "no_interesado") payload.motivo_perdida = motivo ?? null
    if (etapa === "cliente" && !c.fecha_proximo_pago) payload.fecha_proximo_pago = primerProximoPago(hoy, (c.ciclo_cobro as Ciclo) || "mensual", c.dia_cobro == null ? null : num(c.dia_cobro), txt(c.fecha_instalacion))
    const { error } = await admin.from("gestion_empresas").update(payload).eq("id", id)
    if (error) throw error
    await bitacora(admin, id, "etapa", `Pipeline: ${ETIQUETA_ETAPA[etapa]}`, usuario)
    if (etapa === "cliente" && c.estado !== "activo") await bitacora(admin, id, "activada", "Cliente activado", usuario)
    return true as const
  })
}

export async function deleteEmpresaGestion(id: number): Promise<Resultado<true>> {
  return con(async ({ admin }) => {
    const { error } = await admin.from("gestion_empresas").delete().eq("id", id)
    if (error) throw error
    return true as const
  })
}

export async function getEmpresaGestion(id: number): Promise<Resultado<{ empresa: GEmpresa; pagos: GPago[]; reuniones: GReunion[]; actividades: GActividad[] }>> {
  return con(async ({ admin, hoy }) => {
    const [empresas, pagosRes, reuRes, actRes, cuentasRes] = await Promise.all([
      leerEmpresas(admin, hoy),
      admin.from("gestion_pagos").select("*").eq("empresa_id", id).order("fecha", { ascending: false }).limit(500),
      admin.from("gestion_reuniones").select("*").eq("empresa_id", id).order("fecha", { ascending: false }).limit(200),
      admin.from("gestion_actividades").select("*").eq("empresa_id", id).order("fecha", { ascending: false }).limit(300),
      admin.from("gestion_cuentas").select("id, nombre"),
    ])
    const empresa = empresas.find((e) => e.id === id)
    if (!empresa) throw new Error("Empresa no encontrada.")
    if (pagosRes.error) throw pagosRes.error
    if (reuRes.error) throw reuRes.error
    if (actRes.error) throw actRes.error
    const cuentas = new Map(((cuentasRes.data || []) as Fila[]).map((c) => [num(c.id), String(c.nombre)]))
    return {
      empresa,
      pagos: ((pagosRes.data || []) as Fila[]).map((p) => mapPago(p, empresa.nombre, cuentas)),
      reuniones: ((reuRes.data || []) as Fila[]).map((r) => mapReunion(r, empresa.nombre)),
      actividades: ((actRes.data || []) as Fila[]).map((a) => ({ id: num(a.id), empresa_id: id, tipo: String(a.tipo), descripcion: txt(a.descripcion), fecha: String(a.fecha), usuario: txt(a.usuario) })),
    }
  })
}

export async function agregarNotaGestion(empresaId: number, texto: string): Promise<Resultado<true>> {
  return con(async ({ admin, usuario }) => {
    await bitacora(admin, empresaId, "nota", texto.trim(), usuario)
    await admin.from("gestion_empresas").update({ ultima_interaccion: getHondurasNowISO() }).eq("id", empresaId)
    return true as const
  })
}

// ==================== PAGOS ====================

function mapPago(p: Fila, empresaNombre: string | undefined, cuentas: Map<number, string>): GPago {
  return {
    id: num(p.id), empresa_id: num(p.empresa_id), fecha: String(p.fecha), monto: num(p.monto), metodo: (p.metodo as MetodoPago) || "transferencia",
    cuenta_id: p.cuenta_id == null ? null : num(p.cuenta_id), referencia: txt(p.referencia), observaciones: txt(p.observaciones),
    ciclo_aplicado: (p.ciclo_aplicado as Ciclo) || "mensual", periodo_cubierto_desde: txt(p.periodo_cubierto_desde), periodo_cubierto_hasta: txt(p.periodo_cubierto_hasta),
    usuario: txt(p.usuario), created_at: String(p.created_at), empresa_nombre: empresaNombre, cuenta_nombre: p.cuenta_id == null ? null : (cuentas.get(num(p.cuenta_id)) ?? null),
  }
}

export async function getPagosGestion(opts: { desde?: string; hasta?: string } = {}): Promise<Resultado<GPago[]>> {
  return con(async ({ admin }) => {
    const [pagos, emp, cue] = await Promise.all([
      todas((a, b) => {
        let q = admin.from("gestion_pagos").select("*")
        if (opts.desde) q = q.gte("fecha", opts.desde)
        if (opts.hasta) q = q.lte("fecha", opts.hasta)
        return q.order("fecha", { ascending: false }).order("id", { ascending: false }).range(a, b)
      }),
      admin.from("gestion_empresas").select("id, nombre"),
      admin.from("gestion_cuentas").select("id, nombre"),
    ])
    const nombres = new Map(((emp.data || []) as Fila[]).map((e) => [num(e.id), String(e.nombre)]))
    const cuentas = new Map(((cue.data || []) as Fila[]).map((c) => [num(c.id), String(c.nombre)]))
    return pagos.map((p) => mapPago(p, nombres.get(num(p.empresa_id)), cuentas))
  })
}

export interface PagoInput {
  empresa_id: number
  fecha: string
  monto: number
  metodo: MetodoPago
  cuenta_id: number | null
  referencia?: string | null
  observaciones?: string | null
  ciclo_aplicado: Ciclo
}

/**
 * Regla 2: registra el pago, calcula el período cubierto y el próximo pago
 * (mensual: día de cobro del mes siguiente; anual: +12 meses) y deja al
 * cliente en `activo`.
 */
export async function registrarPagoGestion(input: PagoInput): Promise<Resultado<{ id: number; proximo_pago: string }>> {
  return con(async ({ admin, usuario }) => {
    if (!(input.monto > 0)) throw new Error("El monto debe ser mayor que cero.")
    const { data: emp, error: e1 } = await admin.from("gestion_empresas").select("id, nombre, estado, dia_cobro, ciclo_cobro, fecha_proximo_pago").eq("id", input.empresa_id).maybeSingle()
    if (e1) throw e1
    if (!emp) throw new Error("Empresa no encontrada.")
    const c = emp as Fila
    const diaCobro = c.dia_cobro == null ? null : num(c.dia_cobro)
    const ciclo = input.ciclo_aplicado || ((c.ciclo_cobro as Ciclo) || "mensual")
    // El pago salda el cobro programado (aunque llegue tarde), no "desde hoy".
    const base = basePeriodoPago(input.fecha, txt(c.fecha_proximo_pago), String(c.estado))
    const periodo = periodoCubierto(base, ciclo, diaCobro)
    const proximo = proximoPago(base, ciclo, diaCobro)
    const { data, error } = await admin.from("gestion_pagos").insert({
      empresa_id: input.empresa_id, fecha: input.fecha, monto: input.monto, metodo: input.metodo, cuenta_id: input.cuenta_id,
      referencia: txt(input.referencia), observaciones: txt(input.observaciones), ciclo_aplicado: ciclo,
      periodo_cubierto_desde: periodo.desde, periodo_cubierto_hasta: periodo.hasta, usuario,
    }).select("id").single()
    if (error) throw error
    const estadoNuevo: EstadoEmpresa = c.estado === "cancelado" ? "cancelado" : "activo"
    const { error: e2 } = await admin.from("gestion_empresas").update({
      fecha_proximo_pago: proximo, estado: estadoNuevo, etapa_pipeline: etapaDesdeEstado(estadoNuevo), ultima_interaccion: getHondurasNowISO(), updated_at: new Date().toISOString(),
    }).eq("id", input.empresa_id)
    if (e2) throw e2
    await bitacora(admin, input.empresa_id, "pago", `Pago de ${input.monto.toFixed(2)} (${ciclo}); próximo pago ${proximo}`, usuario)
    if (c.estado !== "activo" && estadoNuevo === "activo") await bitacora(admin, input.empresa_id, "activada", "Cliente activado por pago", usuario)
    return { id: num((data as Fila).id), proximo_pago: proximo }
  })
}

export async function deletePagoGestion(id: number): Promise<Resultado<true>> {
  return con(async ({ admin, usuario }) => {
    const { data: p } = await admin.from("gestion_pagos").select("empresa_id, monto, fecha").eq("id", id).maybeSingle()
    const { error } = await admin.from("gestion_pagos").delete().eq("id", id)
    if (error) throw error
    if (p) await bitacora(admin, num((p as Fila).empresa_id), "pago", `Pago del ${(p as Fila).fecha} por ${num((p as Fila).monto).toFixed(2)} eliminado`, usuario)
    return true as const
  })
}

// ==================== REUNIONES ====================

function mapReunion(r: Fila, empresaNombre?: string): GReunion {
  return {
    id: num(r.id), empresa_id: num(r.empresa_id), contacto: txt(r.contacto), fecha: String(r.fecha), hora: r.hora ? String(r.hora).slice(0, 5) : null,
    tipo: (r.tipo as TipoReunion) || "videollamada", estado: (r.estado as EstadoReunion) || "pendiente", resultado: (txt(r.resultado) as ResultadoReunion | null),
    motivo_perdida: (txt(r.motivo_perdida) as MotivoPerdida | null), notas: txt(r.notas), proximo_paso: txt(r.proximo_paso), created_at: String(r.created_at), empresa_nombre: empresaNombre,
  }
}

export async function getReunionesGestion(): Promise<Resultado<GReunion[]>> {
  return con(async ({ admin }) => {
    const [reu, emp] = await Promise.all([
      todas((a, b) => admin.from("gestion_reuniones").select("*").order("fecha", { ascending: false }).order("hora", { ascending: false }).range(a, b)),
      admin.from("gestion_empresas").select("id, nombre"),
    ])
    const nombres = new Map(((emp.data || []) as Fila[]).map((e) => [num(e.id), String(e.nombre)]))
    return reu.map((r) => mapReunion(r, nombres.get(num(r.empresa_id))))
  })
}

export interface ReunionInput { id?: number; empresa_id: number; contacto?: string | null; fecha: string; hora?: string | null; tipo: TipoReunion; estado: EstadoReunion; notas?: string | null; proximo_paso?: string | null }

export async function saveReunionGestion(input: ReunionInput): Promise<Resultado<number>> {
  return con(async ({ admin, usuario }) => {
    const payload = { empresa_id: input.empresa_id, contacto: txt(input.contacto), fecha: input.fecha, hora: txt(input.hora), tipo: input.tipo, estado: input.estado, notas: txt(input.notas), proximo_paso: txt(input.proximo_paso), usuario, updated_at: new Date().toISOString() }
    let id = input.id
    if (id) {
      const { error } = await admin.from("gestion_reuniones").update(payload).eq("id", id)
      if (error) throw error
    } else {
      const { data, error } = await admin.from("gestion_reuniones").insert(payload).select("id").single()
      if (error) throw error
      id = num((data as Fila).id)
      // Un prospecto nuevo con reunión agendada pasa a "reunión pendiente".
      const { data: e } = await admin.from("gestion_empresas").select("etapa_pipeline").eq("id", input.empresa_id).maybeSingle()
      if ((e as Fila | null)?.etapa_pipeline === "nuevo") {
        await admin.from("gestion_empresas").update({ etapa_pipeline: "reunion_pendiente", estado: "reunion_pendiente", ultima_interaccion: getHondurasNowISO(), proxima_accion: `Reunión ${input.fecha}${input.hora ? " " + input.hora : ""}` }).eq("id", input.empresa_id)
      } else {
        await admin.from("gestion_empresas").update({ ultima_interaccion: getHondurasNowISO() }).eq("id", input.empresa_id)
      }
      await bitacora(admin, input.empresa_id, "reunion", `Reunión agendada ${input.fecha}${input.hora ? " " + input.hora : ""}`, usuario)
    }
    return id
  })
}

export interface ResultadoReunionInput { id: number; resultado: ResultadoReunion; motivo_perdida?: MotivoPerdida | null; notas?: string | null; proximo_paso?: string | null }

/** Registra el resultado de una reunión y mueve el pipeline de la empresa. */
export async function resultadoReunionGestion(input: ResultadoReunionInput): Promise<Resultado<true>> {
  return con(async ({ admin, usuario, hoy }) => {
    if (input.resultado === "no_interesado" && !input.motivo_perdida) throw new Error("Indica el motivo de pérdida.")
    const { data: r, error: e0 } = await admin.from("gestion_reuniones").select("empresa_id").eq("id", input.id).maybeSingle()
    if (e0) throw e0
    if (!r) throw new Error("Reunión no encontrada.")
    const empresaId = num((r as Fila).empresa_id)
    const { error } = await admin.from("gestion_reuniones").update({
      resultado: input.resultado, motivo_perdida: input.resultado === "no_interesado" ? input.motivo_perdida : null, notas: txt(input.notas), proximo_paso: txt(input.proximo_paso), estado: "confirmada", updated_at: new Date().toISOString(),
    }).eq("id", input.id)
    if (error) throw error
    const { data: e } = await admin.from("gestion_empresas").select("estado, etapa_pipeline, ciclo_cobro, dia_cobro, fecha_instalacion, fecha_proximo_pago").eq("id", empresaId).maybeSingle()
    const c = (e || {}) as Fila
    const payload: Fila = { ultima_interaccion: getHondurasNowISO(), proxima_accion: txt(input.proximo_paso), updated_at: new Date().toISOString() }
    // Los clientes vigentes no retroceden en el pipeline por una reunión.
    if (c.estado !== "activo" && c.estado !== "pago_pendiente") {
      const etapa = etapaPorResultado(input.resultado)
      payload.etapa_pipeline = etapa
      payload.estado = estadoDesdeEtapa(etapa, c.estado as EstadoEmpresa)
      if (etapa === "no_interesado") payload.motivo_perdida = input.motivo_perdida
      if (etapa === "prueba" && !c.fecha_instalacion) { payload.fecha_instalacion = hoy; payload.fecha_inicio_prueba = hoy }
      if (etapa === "cliente" && !c.fecha_proximo_pago) payload.fecha_proximo_pago = primerProximoPago(hoy, (c.ciclo_cobro as Ciclo) || "mensual", c.dia_cobro == null ? null : num(c.dia_cobro), txt(c.fecha_instalacion))
    }
    await admin.from("gestion_empresas").update(payload).eq("id", empresaId)
    await bitacora(admin, empresaId, "reunion", `Resultado de reunión: ${ETIQUETA_RESULTADO[input.resultado]}${input.proximo_paso ? ` · Próximo paso: ${input.proximo_paso}` : ""}`, usuario)
    return true as const
  })
}

export async function deleteReunionGestion(id: number): Promise<Resultado<true>> {
  return con(async ({ admin }) => {
    const { error } = await admin.from("gestion_reuniones").delete().eq("id", id)
    if (error) throw error
    return true as const
  })
}

// ==================== GASTOS ====================

function mapGasto(g: Fila): GGasto {
  return { id: num(g.id), fecha: String(g.fecha), categoria: String(g.categoria || "otros"), descripcion: txt(g.descripcion), monto: num(g.monto), metodo: txt(g.metodo), comprobante_path: txt(g.comprobante_path), observaciones: txt(g.observaciones), usuario: txt(g.usuario), created_at: String(g.created_at), socio_id: g.socio_id == null ? null : num(g.socio_id) }
}

export async function getGastosGestion(opts: { desde?: string; hasta?: string } = {}): Promise<Resultado<GGasto[]>> {
  return con(async ({ admin }) => {
    const rows = await todas((a, b) => {
      let q = admin.from("gestion_gastos").select("*")
      if (opts.desde) q = q.gte("fecha", opts.desde)
      if (opts.hasta) q = q.lte("fecha", opts.hasta)
      return q.order("fecha", { ascending: false }).order("id", { ascending: false }).range(a, b)
    })
    return rows.map(mapGasto)
  })
}

export interface GastoInput { id?: number; fecha: string; categoria: string; descripcion?: string | null; monto: number; metodo?: string | null; observaciones?: string | null; comprobante_path?: string | null; socio_id?: number | null }

export async function saveGastoGestion(input: GastoInput): Promise<Resultado<number>> {
  return con(async ({ admin, usuario }) => {
    if (!(input.monto > 0)) throw new Error("El monto debe ser mayor que cero.")
    const payload: Fila = { fecha: input.fecha, categoria: input.categoria || "otros", descripcion: txt(input.descripcion), monto: input.monto, metodo: txt(input.metodo), observaciones: txt(input.observaciones), usuario }
    if (input.comprobante_path !== undefined) payload.comprobante_path = input.comprobante_path
    // Quién lo pagó (script 077). Solo se envía si es un socio, o al editar
    // (para poder volverlo a EasyCount); así un gasto de EasyCount se sigue
    // pudiendo crear aunque el 077 no esté aplicado.
    if (input.socio_id != null || (input.id && input.socio_id !== undefined)) payload.socio_id = input.socio_id ?? null
    if (input.id) {
      const { error } = await admin.from("gestion_gastos").update(payload).eq("id", input.id)
      if (error) throw error
      return input.id
    }
    const { data, error } = await admin.from("gestion_gastos").insert(payload).select("id").single()
    if (error) throw error
    return num((data as Fila).id)
  })
}

export async function deleteGastoGestion(id: number): Promise<Resultado<true>> {
  return con(async ({ admin }) => {
    const { data: g } = await admin.from("gestion_gastos").select("comprobante_path").eq("id", id).maybeSingle()
    const { error } = await admin.from("gestion_gastos").delete().eq("id", id)
    if (error) throw error
    const path = txt((g as Fila | null)?.comprobante_path)
    if (path) await admin.storage.from("documentos").remove([path])
    return true as const
  })
}

/** Sube el comprobante al bucket privado `documentos` (carpeta gestion/gastos). */
export async function subirComprobanteGestion(archivo: File): Promise<Resultado<string>> {
  return con(async ({ admin }) => {
    const limpio = archivo.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80)
    const path = `gestion/gastos/${Date.now()}-${limpio}`
    const { error } = await admin.storage.from("documentos").upload(path, archivo, { contentType: archivo.type || undefined, upsert: false })
    if (error) throw error
    return path
  })
}

/** URL firmada (1 h) para ver un comprobante. */
export async function urlComprobanteGestion(path: string): Promise<Resultado<string>> {
  return con(async ({ admin }) => {
    const { data, error } = await admin.storage.from("documentos").createSignedUrl(path, 3600)
    if (error) throw error
    return data.signedUrl
  })
}

// ==================== CAMPAÑAS ====================

export async function getCampanasGestion(): Promise<Resultado<GCampana[]>> {
  return con(async ({ admin }) => {
    const { data, error } = await admin.from("gestion_campanas").select("*").order("fecha_inicio", { ascending: false, nullsFirst: false }).order("id", { ascending: false })
    if (error) throw error
    return ((data || []) as Fila[]).map((c) => ({
      id: num(c.id), nombre: String(c.nombre), plataforma: String(c.plataforma || "otros"), fecha_inicio: txt(c.fecha_inicio), fecha_fin: txt(c.fecha_fin),
      monto_invertido: num(c.monto_invertido), prospectos_generados: num(c.prospectos_generados), reuniones_generadas: num(c.reuniones_generadas), clientes_obtenidos: num(c.clientes_obtenidos),
    }))
  })
}

export interface CampanaInput { id?: number; nombre: string; plataforma: string; fecha_inicio?: string | null; fecha_fin?: string | null; monto_invertido: number; prospectos_generados: number; reuniones_generadas: number; clientes_obtenidos: number }

export async function saveCampanaGestion(input: CampanaInput): Promise<Resultado<number>> {
  return con(async ({ admin }) => {
    const payload = { nombre: input.nombre.trim(), plataforma: input.plataforma || "otros", fecha_inicio: txt(input.fecha_inicio), fecha_fin: txt(input.fecha_fin), monto_invertido: num(input.monto_invertido), prospectos_generados: num(input.prospectos_generados), reuniones_generadas: num(input.reuniones_generadas), clientes_obtenidos: num(input.clientes_obtenidos), updated_at: new Date().toISOString() }
    if (input.id) {
      const { error } = await admin.from("gestion_campanas").update(payload).eq("id", input.id)
      if (error) throw error
      return input.id
    }
    const { data, error } = await admin.from("gestion_campanas").insert(payload).select("id").single()
    if (error) throw error
    return num((data as Fila).id)
  })
}

export async function deleteCampanaGestion(id: number): Promise<Resultado<true>> {
  return con(async ({ admin }) => {
    const { error } = await admin.from("gestion_campanas").delete().eq("id", id)
    if (error) throw error
    return true as const
  })
}

// ==================== SOCIOS Y LIQUIDACIONES (script 077) ====================

async function leerSocios(admin: SupabaseClient): Promise<GSocio[]> {
  const { data, error } = await admin.from("gestion_socios").select("*").order("porcentaje", { ascending: false }).order("nombre")
  if (error) throw error
  return ((data || []) as Fila[]).map((r) => ({ id: num(r.id), nombre: String(r.nombre), porcentaje: num(r.porcentaje), correo: txt(r.correo), notas: txt(r.notas), activo: r.activo !== false }))
}

async function leerLiquidaciones(admin: SupabaseClient): Promise<GLiquidacion[]> {
  const rows = await todas((a, b) => admin.from("gestion_liquidaciones").select("*").order("fecha", { ascending: false }).order("id", { ascending: false }).range(a, b))
  return rows.map((r) => ({ id: num(r.id), socio_id: num(r.socio_id), fecha: String(r.fecha), monto: num(r.monto), periodo: txt(r.periodo), cuenta_id: r.cuenta_id == null ? null : num(r.cuenta_id), notas: txt(r.notas), usuario: txt(r.usuario), created_at: String(r.created_at) }))
}

/** Socios y liquidaciones; `pendiente` = el script 077 no está aplicado (no rompe el portal). */
export async function getSociosGestion(): Promise<Resultado<{ socios: GSocio[]; liquidaciones: GLiquidacion[]; pendiente: string | null }>> {
  return con(async ({ admin }) => {
    try {
      const [socios, liquidaciones] = await Promise.all([leerSocios(admin), leerLiquidaciones(admin)])
      return { socios, liquidaciones, pendiente: null }
    } catch (e) {
      if (mensajeError(e) === GESTION_FEATURE_PENDING) return { socios: [], liquidaciones: [], pendiente: SOCIOS_FEATURE_PENDING }
      throw e
    }
  })
}

export interface SocioInput { id?: number; nombre: string; porcentaje: number; correo?: string | null; notas?: string | null; activo?: boolean }

/** Crea/edita un socio. La suma de % de los socios activos no puede pasar de 100. */
export async function saveSocioGestion(input: SocioInput): Promise<Resultado<number>> {
  return con(async ({ admin }) => {
    const pct = Math.round((Number(input.porcentaje) || 0) * 100) / 100
    if (pct < 0 || pct > 100) throw new Error("El porcentaje debe estar entre 0 y 100.")
    const activo = input.activo ?? true
    const otros = (await leerSocios(admin)).filter((s) => s.activo && s.id !== input.id).reduce((a, s) => a + s.porcentaje, 0)
    if (activo && otros + pct > 100.0001) {
      throw new Error(`Los socios activos sumarían ${Math.round((otros + pct) * 100) / 100}%: no puede pasar de 100%. Disponible: ${Math.round((100 - otros) * 100) / 100}%.`)
    }
    const payload = { nombre: input.nombre.trim(), porcentaje: pct, correo: txt(input.correo), notas: txt(input.notas), activo, updated_at: new Date().toISOString() }
    if (!payload.nombre) throw new Error("El nombre es obligatorio.")
    if (input.id) {
      const { error } = await admin.from("gestion_socios").update(payload).eq("id", input.id)
      if (error) throw error
      return input.id
    }
    const { data, error } = await admin.from("gestion_socios").insert(payload).select("id").single()
    if (error) throw error
    return num((data as Fila).id)
  })
}

/** Solo se elimina un socio sin gastos ni liquidaciones; si tiene historia, se desactiva. */
export async function deleteSocioGestion(id: number): Promise<Resultado<true>> {
  return con(async ({ admin }) => {
    const [{ count: g }, { count: l }] = await Promise.all([
      admin.from("gestion_gastos").select("id", { count: "exact", head: true }).eq("socio_id", id),
      admin.from("gestion_liquidaciones").select("id", { count: "exact", head: true }).eq("socio_id", id),
    ])
    if ((g || 0) + (l || 0) > 0) throw new Error("Este socio tiene gastos o liquidaciones registrados: desactívalo en lugar de eliminarlo.")
    const { error } = await admin.from("gestion_socios").delete().eq("id", id)
    if (error) throw error
    return true as const
  })
}

export interface LiquidacionInput { socio_id: number; fecha: string; monto: number; periodo?: string | null; cuenta_id?: number | null; notas?: string | null }

/** Registra un pago hecho a un socio (a cuenta de lo que se le debe). */
export async function registrarLiquidacionGestion(input: LiquidacionInput): Promise<Resultado<number>> {
  return con(async ({ admin, usuario }) => {
    if (!(input.monto > 0)) throw new Error("El monto debe ser mayor que cero.")
    const { data, error } = await admin.from("gestion_liquidaciones").insert({
      socio_id: input.socio_id, fecha: input.fecha, monto: input.monto, periodo: txt(input.periodo), cuenta_id: input.cuenta_id ?? null, notas: txt(input.notas), usuario,
    }).select("id").single()
    if (error) throw error
    return num((data as Fila).id)
  })
}

export async function deleteLiquidacionGestion(id: number): Promise<Resultado<true>> {
  return con(async ({ admin }) => {
    const { error } = await admin.from("gestion_liquidaciones").delete().eq("id", id)
    if (error) throw error
    return true as const
  })
}

// ==================== NOTIFICACIONES Y SINCRONIZACIÓN ====================

export async function getNotificacionesGestion(): Promise<Resultado<GNotificacion[]>> {
  return con(async ({ admin }) => {
    const { data, error } = await admin.from("gestion_notificaciones").select("*").order("leida").order("fecha", { ascending: false }).order("id", { ascending: false }).limit(60)
    if (error) throw error
    return ((data || []) as Fila[]).map((n) => ({ id: num(n.id), clave: String(n.clave), tipo: String(n.tipo), empresa_id: n.empresa_id == null ? null : num(n.empresa_id), mensaje: String(n.mensaje), fecha: String(n.fecha), leida: n.leida === true }))
  })
}

export async function marcarNotificacionesLeidasGestion(): Promise<Resultado<true>> {
  return con(async ({ admin }) => {
    const { error } = await admin.from("gestion_notificaciones").update({ leida: true }).eq("leida", false)
    if (error) throw error
    return true as const
  })
}

/**
 * Se ejecuta al cargar el portal (no hay cron): (1) aplica la regla 3 —
 * activo ↔ pago_pendiente según el cobro— y (2) genera las notificaciones del
 * día (idempotentes por `clave`). Silencioso si falla (p. ej. script pendiente).
 */
export async function sincronizarGestion(): Promise<void> {
  const c = await ctx()
  if ("error" in c) return
  const { admin } = c
  const hoy = getHondurasTodayISODate()
  try {
    const empresas = await leerEmpresas(admin, hoy)
    const notis: Fila[] = []
    for (const e of empresas) {
      const nuevo = estadoEmpresaPorCobro(e.estado, e.estado_cobro)
      if (nuevo !== e.estado) {
        await admin.from("gestion_empresas").update({ estado: nuevo, etapa_pipeline: etapaDesdeEstado(nuevo), updated_at: new Date().toISOString() }).eq("id", e.id)
        await bitacora(admin, e.id, "estado", `Estado: ${ETIQUETA_ESTADO[e.estado]} → ${ETIQUETA_ESTADO[nuevo]} (automático)`, "sistema")
      }
      if ((e.estado === "activo" || e.estado === "pago_pendiente") && e.fecha_proximo_pago) {
        const d = diasEntre(hoy, e.fecha_proximo_pago)
        if (d === 1) notis.push({ clave: `pago_manana:${e.id}:${hoy}`, tipo: "pago", empresa_id: e.id, mensaje: `${e.nombre} debe pagar mañana.`, fecha: hoy })
        if (d === 0) notis.push({ clave: `pago_hoy:${e.id}:${hoy}`, tipo: "pago", empresa_id: e.id, mensaje: `${e.nombre} debe pagar hoy.`, fecha: hoy })
        if (d < 0) notis.push({ clave: `pago_atrasado:${e.id}:${hoy}`, tipo: "atrasado", empresa_id: e.id, mensaje: `${e.nombre} tiene un pago atrasado (${-d} día${d === -1 ? "" : "s"}).`, fecha: hoy })
      }
      if (e.estado === "prueba" && e.fin_prueba) {
        const d = diasEntre(hoy, e.fin_prueba)
        if (d >= 0 && d <= 3) notis.push({ clave: `prueba:${e.id}:${hoy}`, tipo: "prueba", empresa_id: e.id, mensaje: d === 0 ? `La prueba de ${e.nombre} termina hoy.` : `La prueba de ${e.nombre} termina en ${d} día${d === 1 ? "" : "s"}.`, fecha: hoy })
        if (d === 0) await bitacora(admin, e.id, "fin_prueba", "Prueba finalizada", "sistema")
      }
    }
    const manana = sumarDias(hoy, 1)
    const { data: reu } = await admin.from("gestion_reuniones").select("id, empresa_id, hora").eq("fecha", manana).is("resultado", null)
    const nombres = new Map(empresas.map((e) => [e.id, e.nombre]))
    for (const r of (reu || []) as Fila[]) {
      const hora = r.hora ? String(r.hora).slice(0, 5) : "—"
      notis.push({ clave: `reunion:${r.id}:${hoy}`, tipo: "reunion", empresa_id: num(r.empresa_id), mensaje: `Tienes una reunión mañana a las ${hora} con ${nombres.get(num(r.empresa_id)) || "un prospecto"}.`, fecha: hoy })
    }
    if (notis.length > 0) await admin.from("gestion_notificaciones").upsert(notis, { onConflict: "clave", ignoreDuplicates: true })
  } catch (e) {
    console.warn("[gestion] sincronizar:", mensajeError(e))
  }
}

/** Todo lo que necesitan las pantallas agregadas (Inicio, Finanzas, Reportes…) en una sola lectura. */
export async function getDatosGestion(): Promise<Resultado<{ empresas: GEmpresa[]; pagos: GPago[]; gastos: GGasto[]; reuniones: GReunion[]; campanas: GCampana[]; cuentas: GCuenta[]; config: GConfig; notificaciones: GNotificacion[]; socios: GSocio[]; liquidaciones: GLiquidacion[]; sociosPendiente: string | null; hoy: string }>> {
  return con(async ({ admin, hoy }) => {
    const [empresas, pagos, gastos, reuniones, campanas, cuentas, config, notis, soc] = await Promise.all([
      leerEmpresas(admin, hoy), getPagosGestion(), getGastosGestion(), getReunionesGestion(), getCampanasGestion(), getCuentasGestion(), getConfigGestion(), getNotificacionesGestion(), getSociosGestion(),
    ])
    for (const r of [pagos, gastos, reuniones, campanas, cuentas, config, notis, soc]) if (r.error) throw new Error(r.error)
    return {
      empresas, pagos: pagos.data!, gastos: gastos.data!, reuniones: reuniones.data!, campanas: campanas.data!, cuentas: cuentas.data!, config: config.data!, notificaciones: notis.data!,
      socios: soc.data!.socios, liquidaciones: soc.data!.liquidaciones, sociosPendiente: soc.data!.pendiente, hoy,
    }
  })
}
