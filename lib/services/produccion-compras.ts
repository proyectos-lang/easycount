import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { getTenantStamp, isValidStamp, SESION_INVALIDA_ERROR } from "@/lib/services/tenant-stamp"
import { getHondurasNowISO } from "@/lib/utils/honduras-time"
import { matAplicarEntrada, MATERIALES_FEATURE_PENDING } from "@/lib/services/produccion-materiales"

// ==================== PRODUCCIÓN · COMPRA DE MATERIALES ====================
//
// Compra de materia prima a proveedor + su recepción al inventario de material.
// Reutiliza el patrón de compras (prorrateo de costos de importación por valor),
// pero contra las tablas propias de material (script 046). La recepción escribe
// en `materiales_movimientos` ('Entrada Compra Material') y suma stock/costo del
// material vía `matAplicarEntrada`.

export interface CompraMaterialLineaInput {
  material_id: number
  cantidad: number
  costo_unitario_moneda_origen: number
}

export type FormaPagoMaterial = "Contado" | "Credito"

export interface CompraMaterialInput {
  proveedor_id: number | null
  moneda: "LPS" | "USD"
  tasa_cambio: number
  costos_importacion: number
  impuestos_compra: number
  otros_costos: number
  fecha_tentativa?: string | null
  /** 'Contado' liquida la compra al crearla; 'Credito' deja saldo por pagar. */
  forma_pago?: FormaPagoMaterial
  /** Solo para credito: fecha de vencimiento (YYYY-MM-DD). */
  fecha_vencimiento?: string | null
  lineas: CompraMaterialLineaInput[]
}

export interface CompraMaterial {
  id: number
  proveedor_id: number | null
  proveedor_nombre?: string | null
  moneda: string
  tasa_cambio: number
  total_local: number
  estado: string
  fecha_orden: string | null
  created_at: string
  /** 'Contado' | 'Credito'. Si la BD no tiene la columna (script 053), 'Contado'. */
  forma_pago: FormaPagoMaterial
  fecha_vencimiento: string | null
  /** Abonado hasta ahora (gestion de saldo, script 053). */
  monto_pagado: number
  /** 'Pendiente' | 'Parcial' | 'Pagado'. */
  estado_pago: string
  /** total_local - monto_pagado (>= 0). */
  saldo: number
}

/** Un abono/pago registrado contra una compra de material (script 053). */
export interface PagoCompraMaterial {
  id: number
  compra_id: number
  monto: number
  metodo: string | null
  nota: string | null
  fecha_pago: string
}

function isMissingTable(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false
  const msg = (err.message || "").toLowerCase()
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    /relation .*materiales.* does not exist/.test(msg) ||
    msg.includes("could not find the table")
  )
}

/**
 * Reparte los costos adicionales entre las líneas EN PROPORCIÓN a su valor
 * local (misma fórmula que compras.calcularProrrateoDetallado). Devuelve el
 * costo final unitario en Lempiras de cada línea.
 */
export function costearLineasMaterial(
  lineas: CompraMaterialLineaInput[],
  costosAdicionales: number,
  moneda: "LPS" | "USD",
  tasaCambio: number,
): { material_id: number; cantidad: number; costo_final_local: number; valor_local: number }[] {
  const factor = moneda === "USD" ? tasaCambio : 1
  const conValor = lineas.map((l) => ({
    ...l,
    valor_local: l.cantidad * l.costo_unitario_moneda_origen * factor,
  }))
  const subtotalLocal = conValor.reduce((a, l) => a + l.valor_local, 0)
  return conValor.map((l) => {
    const proporcion = subtotalLocal > 0 ? l.valor_local / subtotalLocal : 0
    const asignados = costosAdicionales * proporcion
    const costoTotal = l.valor_local + asignados
    return {
      material_id: l.material_id,
      cantidad: l.cantidad,
      valor_local: +l.valor_local.toFixed(4),
      costo_final_local: l.cantidad > 0 ? +(costoTotal / l.cantidad).toFixed(4) : 0,
    }
  })
}

/** true si el error de PostgREST es por columna inexistente (script 053 no aplicado). */
function isMissingColumn(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false
  const msg = (err.message || "").toLowerCase()
  return (
    err.code === "42703" ||
    /column .* does not exist/.test(msg) ||
    (msg.includes("could not find") && msg.includes("column"))
  )
}

function mapCompra(c: Record<string, unknown>): CompraMaterial {
  const total = Number(c.total_local || 0)
  const pagado = Number(c.monto_pagado || 0)
  return {
    id: Number(c.id),
    proveedor_id: c.proveedor_id != null ? Number(c.proveedor_id) : null,
    // El nombre del proveedor lo rellena getComprasMaterial con una query aparte
    // (no hay FK para embed). Aqui queda null por defecto.
    proveedor_nombre: null,
    moneda: String(c.moneda || "LPS"),
    tasa_cambio: Number(c.tasa_cambio || 1),
    total_local: total,
    estado: String(c.estado || "Pendiente"),
    fecha_orden: (c.fecha_orden as string) || null,
    created_at: String(c.created_at || ""),
    forma_pago: (c.forma_pago as FormaPagoMaterial) || "Contado",
    fecha_vencimiento: (c.fecha_vencimiento as string) || null,
    monto_pagado: pagado,
    estado_pago: String(c.estado_pago || "Pendiente"),
    saldo: +Math.max(0, total - pagado).toFixed(2),
  }
}

export async function getComprasMaterial(): Promise<{ data: CompraMaterial[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }
  const supabase = createClient()
  if (!supabase) return { data: [], error: "Cliente no disponible" }

  // NOTA: NO se usa el embed `proveedores (nombre)` porque `proveedor_id` no
  // tiene una FK declarada hacia `proveedores` en la BD, y PostgREST falla la
  // consulta ENTERA (PGRST200) al no poder resolver la relacion — eso dejaba el
  // listado vacio aunque las compras existieran. El nombre del proveedor se
  // resuelve con una query aparte por los proveedor_id (patron de cierre-diario).
  const COLS_FULL =
    "id, proveedor_id, moneda, tasa_cambio, total_local, estado, fecha_orden, created_at, forma_pago, fecha_vencimiento, monto_pagado, estado_pago"
  const COLS_BASE =
    "id, proveedor_id, moneda, tasa_cambio, total_local, estado, fecha_orden, created_at"

  type QueryRes = { data: Record<string, unknown>[] | null; error: { message?: string; code?: string } | null }

  let res: QueryRes = await supabase
    .from("materiales_compras_encabezado")
    .select(COLS_FULL)
    .order("created_at", { ascending: false })

  // Fallback: si el script 053 aun no se aplico, reintentamos sin las columnas
  // de pago (la UI mostrara 'Contado' por defecto).
  if (res.error && isMissingColumn(res.error)) {
    res = await supabase
      .from("materiales_compras_encabezado")
      .select(COLS_BASE)
      .order("created_at", { ascending: false })
  }
  if (res.error) {
    if (isMissingTable(res.error)) return { data: [], error: null }
    return { data: [], error: res.error.message ?? "Error" }
  }

  const filas = res.data || []

  // Resolver nombres de proveedor en UNA query por los ids referenciados.
  const provIds = Array.from(
    new Set(filas.map((c) => c.proveedor_id).filter((v): v is number => v != null).map((v) => Number(v))),
  )
  const nombrePorProv = new Map<number, string>()
  if (provIds.length > 0) {
    const { data: provs } = await supabase.from("proveedores").select("id, nombre").in("id", provIds)
    for (const p of provs || []) nombrePorProv.set(Number(p.id), String(p.nombre || ""))
  }

  return {
    data: filas.map((c) => {
      const base = mapCompra(c)
      const pid = c.proveedor_id != null ? Number(c.proveedor_id) : null
      return { ...base, proveedor_nombre: pid != null ? nombrePorProv.get(pid) ?? null : null }
    }),
    error: null,
  }
}

/**
 * Crea la compra (encabezado + detalle) en estado Pendiente. Costea las líneas
 * con el prorrateo y guarda el costo_final_local. NO mueve inventario todavía
 * (eso lo hace `recibirCompraMaterial`).
 */
export async function createCompraMaterial(
  input: CompraMaterialInput,
): Promise<{ data: { id: number } | null; error: string | null }> {
  if (input.lineas.length === 0) return { data: null, error: "Agrega al menos un material" }
  const supabase = createClient()
  if (!supabase) return { data: null, error: "Cliente no disponible" }
  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { data: null, error: SESION_INVALIDA_ERROR }

  const costosAdicionales =
    (Number(input.costos_importacion) || 0) + (Number(input.impuestos_compra) || 0) + (Number(input.otros_costos) || 0)
  const costeadas = costearLineasMaterial(input.lineas, costosAdicionales, input.moneda, input.tasa_cambio)
  const totalLocal = +costeadas.reduce((a, l) => a + l.costo_final_local * l.cantidad, 0).toFixed(2)

  // Pago: 'Contado' liquida la compra al crearla (monto_pagado = total, Pagado);
  // 'Credito' deja el saldo pendiente por pagar.
  const formaPago: FormaPagoMaterial = input.forma_pago === "Credito" ? "Credito" : "Contado"
  const camposPago =
    formaPago === "Contado"
      ? { forma_pago: "Contado", monto_pagado: totalLocal, estado_pago: "Pagado", fecha_vencimiento: null }
      : {
          forma_pago: "Credito",
          monto_pagado: 0,
          estado_pago: "Pendiente",
          fecha_vencimiento: input.fecha_vencimiento || null,
        }

  const baseInsert = {
    proveedor_id: input.proveedor_id,
    fecha_orden: getHondurasNowISO(),
    fecha_tentativa: input.fecha_tentativa || null,
    moneda: input.moneda,
    tasa_cambio: Number(input.tasa_cambio) || 1,
    costos_importacion: Number(input.costos_importacion) || 0,
    impuestos_compra: Number(input.impuestos_compra) || 0,
    otros_costos: Number(input.otros_costos) || 0,
    total_local: totalLocal,
    estado: "Pendiente",
    ...stamp,
  }

  let { data: enc, error: encErr } = await supabase
    .from("materiales_compras_encabezado")
    .insert({ ...baseInsert, ...camposPago })
    .select("id")
    .single()

  // Fallback: si el script 053 (columnas de pago) no se aplico, insertamos sin
  // esos campos para no bloquear la creacion de la compra.
  if (encErr && isMissingColumn(encErr)) {
    ;({ data: enc, error: encErr } = await supabase
      .from("materiales_compras_encabezado")
      .insert(baseInsert)
      .select("id")
      .single())
  }
  if (encErr || !enc?.id) {
    if (isMissingTable(encErr)) return { data: null, error: MATERIALES_FEATURE_PENDING }
    return { data: null, error: encErr?.message || "No se pudo crear la compra" }
  }

  const detalles = input.lineas.map((l, i) => ({
    compra_id: enc.id,
    material_id: l.material_id,
    cantidad: l.cantidad,
    costo_unitario_moneda_origen: l.costo_unitario_moneda_origen,
    costo_final_local: costeadas[i].costo_final_local,
    ...stamp,
  }))
  const { error: detErr } = await supabase.from("materiales_compras_detalle").insert(detalles)
  if (detErr) {
    // Rollback manual del encabezado (patrón de createCompra).
    await supabase.from("materiales_compras_encabezado").delete().eq("id", enc.id)
    return { data: null, error: detErr.message }
  }
  return { data: { id: enc.id as number }, error: null }
}

/**
 * Recibe una compra de material: por cada línea, escribe el movimiento
 * 'Entrada Compra Material' en el almacén/localización elegidos y suma
 * stock/costo del material con `matAplicarEntrada`. Marca la compra Recibida.
 */
export async function recibirCompraMaterial(
  compraId: number,
  almacenId: number,
  localizacionId: number,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { success: false, error: "Cliente no disponible" }
  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { success: false, error: SESION_INVALIDA_ERROR }

  // Guarda anti doble-recepción.
  const { data: enc, error: encErr } = await supabase
    .from("materiales_compras_encabezado")
    .select("id, estado")
    .eq("id", compraId)
    .single()
  if (encErr) return { success: false, error: isMissingTable(encErr) ? MATERIALES_FEATURE_PENDING : encErr.message }
  if (enc?.estado === "Recibida") return { success: false, error: "Esta compra ya fue recibida." }

  const { data: dets, error: detErr } = await supabase
    .from("materiales_compras_detalle")
    .select("id, material_id, cantidad, costo_final_local")
    .eq("compra_id", compraId)
  if (detErr) return { success: false, error: detErr.message }
  if (!dets || dets.length === 0) return { success: false, error: "La compra no tiene líneas." }

  const fecha = getHondurasNowISO()
  for (const d of dets) {
    const cantidad = Number(d.cantidad || 0)
    const costo = Number(d.costo_final_local || 0)
    if (cantidad <= 0) continue
    // Kardex de material.
    const { error: movErr } = await supabase.from("materiales_movimientos").insert({
      material_id: d.material_id,
      almacen_id: almacenId,
      localizacion_id: localizacionId,
      tipo_movimiento: "Entrada Compra Material",
      cantidad,
      costo_unitario: costo,
      referencia_id: compraId,
      fecha,
      ...stamp,
    })
    if (movErr) return { success: false, error: movErr.message }
    // Stock + costo promedio del material.
    const ent = await matAplicarEntrada(supabase, d.material_id, cantidad, costo)
    if (ent.error) return { success: false, error: ent.error }
    // Marca la línea como recibida.
    await supabase.from("materiales_compras_detalle").update({ cantidad_recibida: cantidad }).eq("id", d.id)
  }

  await supabase.from("materiales_compras_encabezado").update({ estado: "Recibida" }).eq("id", compraId)
  return { success: true, error: null }
}

// ==================== PAGOS / SALDO (script 053) ====================

/** Lista los abonos registrados de una compra de material (mas reciente arriba). */
export async function getPagosCompraMaterial(
  compraId: number,
): Promise<{ data: PagoCompraMaterial[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }
  const supabase = createClient()
  if (!supabase) return { data: [], error: "Cliente no disponible" }

  const { data, error } = await supabase
    .from("materiales_compras_pagos")
    .select("id, compra_id, monto, metodo, nota, fecha_pago")
    .eq("compra_id", compraId)
    .order("id", { ascending: false })
  if (error) {
    // Tabla no creada aun (script 053): degradamos a lista vacia.
    if (isMissingTable(error)) return { data: [], error: null }
    return { data: [], error: error.message }
  }
  const rows = (data || []).map((p: Record<string, unknown>) => ({
    id: Number(p.id),
    compra_id: Number(p.compra_id),
    monto: Number(p.monto || 0),
    metodo: (p.metodo as string) ?? null,
    nota: (p.nota as string) ?? null,
    fecha_pago: String(p.fecha_pago || ""),
  }))
  return { data: rows, error: null }
}

/**
 * Registra un abono (parcial o total) contra una compra de material y recalcula
 * `monto_pagado` + `estado_pago` del encabezado. NO mueve caja/banco (es un
 * registro de saldo; decision de negocio). Valida que el abono no exceda el
 * saldo pendiente.
 */
export async function registrarPagoMaterial(input: {
  compra_id: number
  monto: number
  metodo?: string | null
  nota?: string | null
}): Promise<{ success: boolean; error: string | null }> {
  if (!(input.monto > 0)) return { success: false, error: "El monto debe ser mayor a 0" }
  const supabase = createClient()
  if (!supabase) return { success: false, error: "Cliente no disponible" }
  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { success: false, error: SESION_INVALIDA_ERROR }

  // Saldo actual de la compra.
  const { data: enc, error: encErr } = await supabase
    .from("materiales_compras_encabezado")
    .select("id, total_local, monto_pagado")
    .eq("id", input.compra_id)
    .maybeSingle()
  if (encErr) {
    if (isMissingTable(encErr)) return { success: false, error: MATERIALES_FEATURE_PENDING }
    if (isMissingColumn(encErr)) {
      return { success: false, error: "Falta aplicar el script 053 (gestion de pago de materiales)." }
    }
    return { success: false, error: encErr.message }
  }
  if (!enc) return { success: false, error: "Compra no encontrada" }

  const total = Number(enc.total_local || 0)
  const pagado = Number(enc.monto_pagado || 0)
  const saldo = +(total - pagado).toFixed(2)
  if (input.monto > saldo + 0.005) {
    return { success: false, error: `El monto excede el saldo pendiente (L ${saldo.toFixed(2)})` }
  }

  // Registrar el abono.
  const { error: pagoErr } = await supabase.from("materiales_compras_pagos").insert({
    compra_id: input.compra_id,
    monto: +input.monto.toFixed(2),
    metodo: input.metodo || null,
    nota: input.nota || null,
    fecha_pago: getHondurasNowISO(),
    ...stamp,
  })
  if (pagoErr) {
    if (isMissingTable(pagoErr)) return { success: false, error: "Falta aplicar el script 053 (gestion de pago de materiales)." }
    return { success: false, error: pagoErr.message }
  }

  // Recalcular monto_pagado + estado_pago del encabezado.
  const nuevoPagado = +(pagado + input.monto).toFixed(2)
  const nuevoEstado = nuevoPagado >= total - 0.005 ? "Pagado" : nuevoPagado > 0 ? "Parcial" : "Pendiente"
  const { error: updErr } = await supabase
    .from("materiales_compras_encabezado")
    .update({ monto_pagado: nuevoPagado, estado_pago: nuevoEstado })
    .eq("id", input.compra_id)
  if (updErr) return { success: false, error: updErr.message }

  return { success: true, error: null }
}
