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

export interface CompraMaterialInput {
  proveedor_id: number | null
  moneda: "LPS" | "USD"
  tasa_cambio: number
  costos_importacion: number
  impuestos_compra: number
  otros_costos: number
  fecha_tentativa?: string | null
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

export async function getComprasMaterial(): Promise<{ data: CompraMaterial[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }
  const supabase = createClient()
  if (!supabase) return { data: [], error: "Cliente no disponible" }

  const { data, error } = await supabase
    .from("materiales_compras_encabezado")
    .select("id, proveedor_id, moneda, tasa_cambio, total_local, estado, fecha_orden, created_at, proveedores (nombre)")
    .order("created_at", { ascending: false })
  if (error) {
    if (isMissingTable(error)) return { data: [], error: null }
    return { data: [], error: error.message }
  }
  const rows = (data || []).map((c: Record<string, unknown>) => ({
    id: Number(c.id),
    proveedor_id: c.proveedor_id != null ? Number(c.proveedor_id) : null,
    proveedor_nombre: (c.proveedores as { nombre?: string } | null)?.nombre ?? null,
    moneda: String(c.moneda || "LPS"),
    tasa_cambio: Number(c.tasa_cambio || 1),
    total_local: Number(c.total_local || 0),
    estado: String(c.estado || "Pendiente"),
    fecha_orden: (c.fecha_orden as string) || null,
    created_at: String(c.created_at || ""),
  }))
  return { data: rows, error: null }
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

  const { data: enc, error: encErr } = await supabase
    .from("materiales_compras_encabezado")
    .insert({
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
    })
    .select("id")
    .single()
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
