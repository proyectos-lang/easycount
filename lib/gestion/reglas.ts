/**
 * Reglas de negocio del portal de gestión interna (/gestion): PURAS, sin BD.
 * Las aplican los servicios server-side (lib/services/gestion.ts) y las
 * pantallas; se prueban en tests/gestion-reglas.test.ts.
 *
 * Todas las fechas son strings ISO 'YYYY-MM-DD' y la aritmética se hace en
 * UTC para que no dependa de la zona del navegador/servidor.
 */

// ==================== CATÁLOGOS ====================

export type Ciclo = "mensual" | "anual"
export type EstadoEmpresa = "prospecto" | "reunion_pendiente" | "reunion_realizada" | "prueba" | "activo" | "pago_pendiente" | "cancelado"
export type EtapaPipeline = "nuevo" | "reunion_pendiente" | "reunion_realizada" | "prueba" | "cliente" | "no_interesado"
export type EstadoCobro = "pagado" | "proximo" | "pendiente" | "atrasado"
export type MetodoPago = "transferencia" | "efectivo" | "tarjeta" | "otro"
export type TipoReunion = "presencial" | "videollamada" | "llamada"
export type EstadoReunion = "confirmada" | "pendiente" | "reprogramada"
export type ResultadoReunion = "interesado" | "quiere_prueba" | "debe_consultarlo" | "no_interesado" | "seguimiento" | "cliente_confirmado"
export type MotivoPerdida = "precio" | "no_lo_necesita" | "usa_otro_sistema" | "sin_presupuesto" | "no_respondio" | "funcionalidad_faltante" | "decision_socios" | "otro"
export type RolGestion = "administrador" | "ventas" | "contabilidad"

export const ESTADOS_EMPRESA: EstadoEmpresa[] = ["prospecto", "reunion_pendiente", "reunion_realizada", "prueba", "activo", "pago_pendiente", "cancelado"]
export const ETAPAS_PIPELINE: EtapaPipeline[] = ["nuevo", "reunion_pendiente", "reunion_realizada", "prueba", "cliente", "no_interesado"]
export const RESULTADOS_REUNION: ResultadoReunion[] = ["interesado", "quiere_prueba", "debe_consultarlo", "seguimiento", "cliente_confirmado", "no_interesado"]
export const MOTIVOS_PERDIDA: MotivoPerdida[] = ["precio", "no_lo_necesita", "usa_otro_sistema", "sin_presupuesto", "no_respondio", "funcionalidad_faltante", "decision_socios", "otro"]
export const METODOS_PAGO: MetodoPago[] = ["transferencia", "efectivo", "tarjeta", "otro"]
export const TIPOS_REUNION: TipoReunion[] = ["presencial", "videollamada", "llamada"]
export const CATEGORIAS_GASTO = ["publicidad", "meta_ads", "google_ads", "diseno", "desarrollo", "hosting", "software", "dominio", "comisiones", "transporte", "otros"] as const
export const PLATAFORMAS_CAMPANA = ["instagram", "facebook", "meta_ads", "google", "tiktok", "otros"] as const

export const ETIQUETA_ESTADO: Record<EstadoEmpresa, string> = {
  prospecto: "Prospecto", reunion_pendiente: "Reunión pendiente", reunion_realizada: "Reunión realizada",
  prueba: "En prueba", activo: "Activo", pago_pendiente: "Pago pendiente", cancelado: "Cancelado",
}
export const ETIQUETA_ETAPA: Record<EtapaPipeline, string> = {
  nuevo: "Nuevo", reunion_pendiente: "Reunión pendiente", reunion_realizada: "Reunión realizada",
  prueba: "En prueba", cliente: "Cliente", no_interesado: "No interesado",
}
export const ETIQUETA_COBRO: Record<EstadoCobro, string> = { pagado: "Pagado", proximo: "Próximo", pendiente: "Pendiente", atrasado: "Atrasado" }
export const ETIQUETA_RESULTADO: Record<ResultadoReunion, string> = {
  interesado: "Interesado", quiere_prueba: "Quiere prueba", debe_consultarlo: "Debe consultarlo",
  no_interesado: "No interesado", seguimiento: "Seguimiento", cliente_confirmado: "Cliente confirmado",
}
export const ETIQUETA_MOTIVO: Record<MotivoPerdida, string> = {
  precio: "Precio", no_lo_necesita: "No lo necesita", usa_otro_sistema: "Usa otro sistema", sin_presupuesto: "Sin presupuesto",
  no_respondio: "No respondió", funcionalidad_faltante: "Funcionalidad faltante", decision_socios: "Decisión de socios", otro: "Otro",
}
export const ETIQUETA_METODO: Record<MetodoPago, string> = { transferencia: "Transferencia", efectivo: "Efectivo", tarjeta: "Tarjeta", otro: "Otro" }
export const ETIQUETA_TIPO_REUNION: Record<TipoReunion, string> = { presencial: "Presencial", videollamada: "Videollamada", llamada: "Llamada" }
export const ETIQUETA_ESTADO_REUNION: Record<EstadoReunion, string> = { confirmada: "Confirmada", pendiente: "Pendiente", reprogramada: "Reprogramada" }
export const ETIQUETA_CATEGORIA: Record<string, string> = {
  publicidad: "Publicidad", meta_ads: "Meta Ads", google_ads: "Google Ads", diseno: "Diseño", desarrollo: "Desarrollo", hosting: "Hosting",
  software: "Software", dominio: "Dominio", comisiones: "Comisiones", transporte: "Transporte", otros: "Otros",
}
export const ETIQUETA_PLATAFORMA: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", meta_ads: "Meta Ads", google: "Google", tiktok: "TikTok", otros: "Otros" }

/** Categorías de gasto que cuentan como publicidad en KPIs. */
export const CATEGORIAS_PUBLICIDAD = new Set(["publicidad", "meta_ads", "google_ads"])

/** Etapas del pipeline que son "en venta" (cuentan en el contador del menú). */
export const ETAPAS_EN_VENTA: EtapaPipeline[] = ["nuevo", "reunion_pendiente", "reunion_realizada", "prueba"]

export const DIAS_PRUEBA_DEFAULT = 10

// ==================== FECHAS (UTC, 'YYYY-MM-DD') ====================

function partes(iso: string): [number, number, number] {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number)
  return [y, m, d]
}
function iso(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

/** Último día (28–31) del mes `m` (1–12) del año `y`. */
export function ultimoDiaMes(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

export function sumarDias(fecha: string, dias: number): string {
  const [y, m, d] = partes(fecha)
  const t = new Date(Date.UTC(y, m - 1, d + dias))
  return iso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate())
}

/**
 * Suma `meses` conservando el día cuando existe; si el mes destino es más
 * corto (31 → 30, 29 feb → 28), usa su último día.
 */
export function sumarMeses(fecha: string, meses: number, diaPreferido?: number): string {
  const [y, m, d] = partes(fecha)
  const total = y * 12 + (m - 1) + meses
  const ny = Math.floor(total / 12), nm = (total % 12) + 1
  const dia = Math.min(diaPreferido ?? d, ultimoDiaMes(ny, nm))
  return iso(ny, nm, dia)
}

/** Días de `a` a `b` (positivo si b es después). */
export function diasEntre(a: string, b: string): number {
  const [ay, am, ad] = partes(a), [by, bm, bd] = partes(b)
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000)
}

export function mismoMes(a: string, b: string): boolean {
  return a.slice(0, 7) === b.slice(0, 7)
}

/** 'YYYY-MM' del mes anterior/siguiente. */
export function mesRelativo(anio: number, mes: number, delta: number): { anio: number; mes: number } {
  const total = anio * 12 + (mes - 1) + delta
  return { anio: Math.floor(total / 12), mes: (total % 12) + 1 }
}

// ==================== PRUEBA GRATIS ====================

/** Regla 1: fin de prueba = instalación + N días (N configurable, default 10). */
export function finPrueba(fechaInstalacion: string, diasPrueba = DIAS_PRUEBA_DEFAULT): string {
  return sumarDias(fechaInstalacion, diasPrueba)
}

// ==================== PRÓXIMO PAGO ====================

/** Regla 2 (mensual): mismo día de cobro del mes siguiente; si no existe (31), último día. */
export function proximoPagoMensual(fechaPago: string, diaCobro: number): string {
  const dia = Math.min(31, Math.max(1, Math.round(diaCobro) || 1))
  return sumarMeses(fechaPago, 1, dia)
}

/** Regla 2 (anual): misma fecha + 12 meses. */
export function proximoPagoAnual(fechaPago: string): string {
  return sumarMeses(fechaPago, 12)
}

export function proximoPago(fechaPago: string, ciclo: Ciclo, diaCobro: number | null | undefined): string {
  return ciclo === "anual" ? proximoPagoAnual(fechaPago) : proximoPagoMensual(fechaPago, diaCobro ?? Number(fechaPago.slice(8, 10)))
}

/**
 * Desde qué fecha cuenta el período que salda un pago. Si el cliente ya tiene
 * un cobro programado (es cliente vigente), el pago salda ESE cobro —aunque se
 * pague tarde o adelantado— y el próximo pago corre un período desde ahí. Si
 * no tiene cobro programado (primer pago, prueba, prospecto), cuenta desde la
 * fecha del pago. Ej.: cobro del 05/08 pagado el 01/09 → cubre 05/08–04/09 y
 * el próximo es el 05/09 (no el 05/10).
 */
export function basePeriodoPago(fechaPago: string, fechaProximoPago: string | null | undefined, estado: EstadoEmpresa | string): string {
  return (estado === "activo" || estado === "pago_pendiente") && fechaProximoPago ? fechaProximoPago : fechaPago
}

/** Período que cubre un pago: desde su base (ver basePeriodoPago) hasta el día anterior al próximo. */
export function periodoCubierto(fechaPago: string, ciclo: Ciclo, diaCobro: number | null | undefined): { desde: string; hasta: string } {
  return { desde: fechaPago, hasta: sumarDias(proximoPago(fechaPago, ciclo, diaCobro), -1) }
}

/**
 * Primer vencimiento de un cliente que se activa SIN pago previo: mensual →
 * el día de cobro de este mes si aún no pasó, si no el del mes siguiente;
 * anual → instalación (o hoy) + 12 meses.
 */
export function primerProximoPago(hoy: string, ciclo: Ciclo, diaCobro: number | null | undefined, fechaInstalacion?: string | null): string {
  if (ciclo === "anual") return proximoPagoAnual(fechaInstalacion || hoy)
  const [y, m, d] = partes(hoy)
  const dia = Math.min(31, Math.max(1, diaCobro ?? d))
  const esteMes = iso(y, m, Math.min(dia, ultimoDiaMes(y, m)))
  return esteMes >= hoy ? esteMes : sumarMeses(hoy, 1, dia)
}

// ==================== ESTADO DEL COBRO (derivado) ====================

/**
 * Regla 3. `cubiertoHasta` = último día cubierto por algún pago (o null).
 *   atrasado : la fecha de pago ya pasó y no hay pago.
 *   pendiente: vence HOY, o vence en el mes en curso y no se ha pagado.
 *   proximo  : vence en 1–7 días.
 *   pagado   : hay un pago que cubre el período actual (o el vencimiento está
 *              fuera del mes en curso).
 */
export function estadoCobro(args: { fechaProximoPago: string | null | undefined; hoy: string; cubiertoHasta?: string | null }): EstadoCobro {
  const { fechaProximoPago, hoy, cubiertoHasta } = args
  if (!fechaProximoPago) return "pendiente"
  const dias = diasEntre(hoy, fechaProximoPago)
  if (dias < 0) return "atrasado"
  if (dias === 0) return "pendiente"
  if (dias <= 7) return "proximo"
  const cubierto = !!cubiertoHasta && cubiertoHasta >= hoy
  if (mismoMes(fechaProximoPago, hoy) && !cubierto) return "pendiente"
  return "pagado"
}

/**
 * Regla 3 (segunda parte): al quedar atrasado, la empresa pasa a
 * `pago_pendiente`; al estar al día vuelve a `activo`. Solo aplica a clientes
 * (activo / pago_pendiente); los demás estados no cambian.
 */
export function estadoEmpresaPorCobro(estado: EstadoEmpresa, cobro: EstadoCobro): EstadoEmpresa {
  if (estado === "activo" && cobro === "atrasado") return "pago_pendiente"
  if (estado === "pago_pendiente" && cobro !== "atrasado") return "activo"
  return estado
}

/** ¿La empresa es cliente vigente (paga)? */
export function esClienteVigente(estado: EstadoEmpresa): boolean {
  return estado === "activo" || estado === "pago_pendiente"
}

// ==================== PIPELINE ↔ ESTADO ====================

export function estadoDesdeEtapa(etapa: EtapaPipeline, estadoActual?: EstadoEmpresa): EstadoEmpresa {
  switch (etapa) {
    case "nuevo": return "prospecto"
    case "reunion_pendiente": return "reunion_pendiente"
    case "reunion_realizada": return "reunion_realizada"
    case "prueba": return "prueba"
    case "cliente": return estadoActual === "pago_pendiente" ? "pago_pendiente" : "activo"
    case "no_interesado": return "cancelado"
  }
}

export function etapaDesdeEstado(estado: EstadoEmpresa): EtapaPipeline {
  switch (estado) {
    case "prospecto": return "nuevo"
    case "reunion_pendiente": return "reunion_pendiente"
    case "reunion_realizada": return "reunion_realizada"
    case "prueba": return "prueba"
    case "activo":
    case "pago_pendiente": return "cliente"
    case "cancelado": return "no_interesado"
  }
}

/** Etapa a la que pasa un prospecto según el resultado de una reunión. */
export function etapaPorResultado(resultado: ResultadoReunion): EtapaPipeline {
  switch (resultado) {
    case "quiere_prueba": return "prueba"
    case "cliente_confirmado": return "cliente"
    case "no_interesado": return "no_interesado"
    default: return "reunion_realizada"
  }
}

// ==================== FINANZAS ====================

/** Regla 4: MRR = cuotas mensuales de clientes vigentes + cuotas anuales ÷ 12. */
export function mrr(empresas: { estado: EstadoEmpresa; cuota: number; ciclo_cobro: Ciclo }[]): number {
  const total = empresas
    .filter((e) => esClienteVigente(e.estado))
    .reduce((s, e) => s + (e.ciclo_cobro === "anual" ? (Number(e.cuota) || 0) / 12 : Number(e.cuota) || 0), 0)
  return Math.round(total * 100) / 100
}

/** Regla 5: utilidad = ingresos − gastos; margen = utilidad ÷ ingresos (null si no hay ingresos). */
export function utilidad(ingresos: number, gastos: number): { utilidad: number; margen: number | null } {
  const u = Math.round((ingresos - gastos) * 100) / 100
  return { utilidad: u, margen: ingresos > 0 ? Math.round((u / ingresos) * 10000) / 10000 : null }
}

/** Regla 6: costo por prospecto/cliente = invertido ÷ cantidad; null ("—") si la cantidad es 0. */
export function costoPor(invertido: number, cantidad: number): number | null {
  return cantidad > 0 ? Math.round((invertido / cantidad) * 100) / 100 : null
}
