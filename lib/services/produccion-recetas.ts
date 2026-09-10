import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { getTenantStamp, isValidStamp, SESION_INVALIDA_ERROR } from "@/lib/services/tenant-stamp"

// ==================== PRODUCCIÓN · RECETAS / MRP ====================
//
// Una receta por producto FABRICADO (su existencia marca que el producto se
// fabrica). Define: estándar de producción (u/min), factores de costo POR
// UNIDAD (energía, mano de obra, overhead) y las líneas de material con su
// consumo por unidad. El costo estimado se calcula con el costo promedio
// vigente de cada material. Degrada si el script 047 no se aplicó.

export interface RecetaMaterialLinea {
  material_id: number
  material_nombre?: string
  unidad_medida?: string
  costo_promedio?: number // costo vigente del material (para estimar)
  consumo_por_unidad: number
}

export interface Receta {
  id?: number
  producto_id: number
  estandar_unidades_por_minuto: number
  costo_energia: number
  costo_mano_obra: number
  costo_overhead: number
  costo_unitario_estimado: number
  activo?: boolean
  lineas: RecetaMaterialLinea[]
}

export interface ProductoFabricadoRef {
  producto_id: number
  receta_id: number
  estandar_unidades_por_minuto: number
  costo_unitario_estimado: number
}

export const RECETAS_FEATURE_PENDING =
  "Función de recetas pendiente: aplica scripts/047-produccion-recetas.sql en Supabase."

function isMissingTable(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false
  const msg = (err.message || "").toLowerCase()
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    /relation .*produccion_recetas.* does not exist/.test(msg) ||
    msg.includes("could not find the table")
  )
}

/**
 * Costo unitario estimado (función PURA):
 *   Σ(consumo_por_unidad × costo_promedio_material) + energía + mano_obra + overhead.
 * Los factores ya vienen por unidad.
 */
export function calcularCostoEstimado(
  lineas: { consumo_por_unidad: number; costo_promedio?: number }[],
  factores: { costo_energia: number; costo_mano_obra: number; costo_overhead: number },
): number {
  const materiales = lineas.reduce(
    (a, l) => a + (Number(l.consumo_por_unidad) || 0) * (Number(l.costo_promedio) || 0),
    0,
  )
  const fact =
    (Number(factores.costo_energia) || 0) +
    (Number(factores.costo_mano_obra) || 0) +
    (Number(factores.costo_overhead) || 0)
  return +(materiales + fact).toFixed(4)
}

/** Devuelve la receta de un producto (o null si no tiene). Enriquece las líneas
 *  con el nombre/unidad/costo vigente del material. */
export async function getReceta(
  productoId: number,
): Promise<{ data: Receta | null; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: null, error: null }
  const supabase = createClient()
  if (!supabase) return { data: null, error: "Cliente no disponible" }

  const { data: rec, error } = await supabase
    .from("produccion_recetas")
    .select("id, producto_id, estandar_unidades_por_minuto, costo_energia, costo_mano_obra, costo_overhead, costo_unitario_estimado, activo")
    .eq("producto_id", productoId)
    .maybeSingle()
  if (error) {
    if (isMissingTable(error)) return { data: null, error: null }
    return { data: null, error: error.message }
  }
  if (!rec) return { data: null, error: null }

  const { data: lins } = await supabase
    .from("produccion_receta_materiales")
    .select("material_id, consumo_por_unidad, materiales (nombre, unidad_medida, costo_promedio)")
    .eq("receta_id", rec.id)
  const lineas: RecetaMaterialLinea[] = (lins || []).map((l: Record<string, unknown>) => {
    const m = l.materiales as { nombre?: string; unidad_medida?: string; costo_promedio?: number } | null
    return {
      material_id: Number(l.material_id),
      material_nombre: m?.nombre,
      unidad_medida: m?.unidad_medida,
      costo_promedio: Number(m?.costo_promedio || 0),
      consumo_por_unidad: Number(l.consumo_por_unidad || 0),
    }
  })

  return {
    data: {
      id: rec.id,
      producto_id: rec.producto_id,
      estandar_unidades_por_minuto: Number(rec.estandar_unidades_por_minuto || 0),
      costo_energia: Number(rec.costo_energia || 0),
      costo_mano_obra: Number(rec.costo_mano_obra || 0),
      costo_overhead: Number(rec.costo_overhead || 0),
      costo_unitario_estimado: Number(rec.costo_unitario_estimado || 0),
      activo: rec.activo,
      lineas,
    },
    error: null,
  }
}

/**
 * Crea o actualiza la receta de un producto (cabecera + factores + líneas).
 * Recalcula y cachea el costo unitario estimado. Reemplaza las líneas.
 */
export async function upsertReceta(input: {
  producto_id: number
  estandar_unidades_por_minuto: number
  costo_energia: number
  costo_mano_obra: number
  costo_overhead: number
  lineas: { material_id: number; consumo_por_unidad: number; costo_promedio?: number }[]
}): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }
  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { error: SESION_INVALIDA_ERROR }

  const lineasValidas = input.lineas
    .map((l) => ({ material_id: Number(l.material_id), consumo_por_unidad: Number(l.consumo_por_unidad) || 0, costo_promedio: Number(l.costo_promedio) || 0 }))
    .filter((l) => l.material_id > 0 && l.consumo_por_unidad > 0)

  const costoEstimado = calcularCostoEstimado(lineasValidas, {
    costo_energia: input.costo_energia,
    costo_mano_obra: input.costo_mano_obra,
    costo_overhead: input.costo_overhead,
  })

  // Upsert de la cabecera por (razon_social_id, producto_id).
  const { data: rec, error: recErr } = await supabase
    .from("produccion_recetas")
    .upsert(
      {
        producto_id: input.producto_id,
        estandar_unidades_por_minuto: Number(input.estandar_unidades_por_minuto) || 0,
        costo_energia: Number(input.costo_energia) || 0,
        costo_mano_obra: Number(input.costo_mano_obra) || 0,
        costo_overhead: Number(input.costo_overhead) || 0,
        costo_unitario_estimado: costoEstimado,
        updated_at: new Date().toISOString(),
        ...stamp,
      },
      { onConflict: "razon_social_id,producto_id" },
    )
    .select("id")
    .single()
  if (recErr || !rec?.id) {
    if (isMissingTable(recErr)) return { error: RECETAS_FEATURE_PENDING }
    return { error: recErr?.message || "No se pudo guardar la receta" }
  }

  // Reemplaza las líneas: borra e inserta.
  const { error: delErr } = await supabase.from("produccion_receta_materiales").delete().eq("receta_id", rec.id)
  if (delErr) return { error: delErr.message }
  if (lineasValidas.length > 0) {
    const filas = lineasValidas.map((l) => ({
      receta_id: rec.id,
      material_id: l.material_id,
      consumo_por_unidad: l.consumo_por_unidad,
      ...stamp,
    }))
    const { error: insErr } = await supabase.from("produccion_receta_materiales").insert(filas)
    if (insErr) return { error: insErr.message }
  }
  return { error: null }
}

/** Lista los producto_id que YA tienen receta (para marcarlos como fabricados). */
export async function listarProductosFabricados(): Promise<{ data: ProductoFabricadoRef[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }
  const supabase = createClient()
  if (!supabase) return { data: [], error: "Cliente no disponible" }
  const { data, error } = await supabase
    .from("produccion_recetas")
    .select("id, producto_id, estandar_unidades_por_minuto, costo_unitario_estimado")
  if (error) {
    if (isMissingTable(error)) return { data: [], error: null }
    return { data: [], error: error.message }
  }
  const rows = (data || []).map((r: Record<string, unknown>) => ({
    producto_id: Number(r.producto_id),
    receta_id: Number(r.id),
    estandar_unidades_por_minuto: Number(r.estandar_unidades_por_minuto || 0),
    costo_unitario_estimado: Number(r.costo_unitario_estimado || 0),
  }))
  return { data: rows, error: null }
}
