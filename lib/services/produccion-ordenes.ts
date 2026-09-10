import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { getTenantStamp, isValidStamp, SESION_INVALIDA_ERROR } from "@/lib/services/tenant-stamp"

// ==================== PRODUCCIÓN · ÓRDENES ====================
//
// Orden de producción: qué producto fabricar, cuánto, para cuándo. Congela
// `receta_id` al crear (si el producto tiene receta) para el consumo/costeo del
// control de piso. Estados: Abierta | En Proceso | Cerrada | Cancelada.
// Degrada si el script 048 no se aplicó.

export type EstadoOrden = "Abierta" | "En Proceso" | "Cerrada" | "Cancelada"

export interface OrdenProduccion {
  id: number
  producto_id: number
  producto_nombre?: string
  receta_id: number | null
  cantidad_objetivo: number
  fecha_objetivo: string | null
  notas: string | null
  estado: EstadoOrden
  created_at: string
}

export const ORDENES_FEATURE_PENDING =
  "Función de órdenes pendiente: aplica scripts/048-produccion-ordenes.sql en Supabase."

function isMissingTable(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false
  const msg = (err.message || "").toLowerCase()
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    /relation .*produccion_ordenes.* does not exist/.test(msg) ||
    msg.includes("could not find the table")
  )
}

export async function getOrdenes(): Promise<{ data: OrdenProduccion[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }
  const supabase = createClient()
  if (!supabase) return { data: [], error: "Cliente no disponible" }

  const { data, error } = await supabase
    .from("produccion_ordenes")
    .select("id, producto_id, receta_id, cantidad_objetivo, fecha_objetivo, notas, estado, created_at, productos (nombre)")
    .order("created_at", { ascending: false })
  if (error) {
    if (isMissingTable(error)) return { data: [], error: null }
    return { data: [], error: error.message }
  }
  const rows = (data || []).map((o: Record<string, unknown>) => ({
    id: Number(o.id),
    producto_id: Number(o.producto_id),
    producto_nombre: (o.productos as { nombre?: string } | null)?.nombre ?? "",
    receta_id: o.receta_id != null ? Number(o.receta_id) : null,
    cantidad_objetivo: Number(o.cantidad_objetivo || 0),
    fecha_objetivo: (o.fecha_objetivo as string) || null,
    notas: (o.notas as string) ?? null,
    estado: String(o.estado || "Abierta") as EstadoOrden,
    created_at: String(o.created_at || ""),
  }))
  return { data: rows, error: null }
}

/**
 * Crea una orden. Congela `receta_id` si el producto tiene receta (busca la
 * receta del producto en produccion_recetas). Devuelve `sinReceta` para que la
 * UI avise (se permite crear igual).
 */
export async function createOrden(input: {
  producto_id: number
  cantidad_objetivo: number
  fecha_objetivo?: string | null
  notas?: string | null
}): Promise<{ data: { id: number } | null; sinReceta: boolean; error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { data: null, sinReceta: false, error: "Cliente no disponible" }
  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { data: null, sinReceta: false, error: SESION_INVALIDA_ERROR }

  // Congela la receta vigente del producto (si existe).
  let recetaId: number | null = null
  const { data: rec } = await supabase
    .from("produccion_recetas")
    .select("id")
    .eq("producto_id", input.producto_id)
    .maybeSingle()
  if (rec?.id) recetaId = rec.id

  const { data, error } = await supabase
    .from("produccion_ordenes")
    .insert({
      producto_id: input.producto_id,
      receta_id: recetaId,
      cantidad_objetivo: Number(input.cantidad_objetivo) || 0,
      fecha_objetivo: input.fecha_objetivo || null,
      notas: (input.notas || "").trim() || null,
      estado: "Abierta",
      ...stamp,
    })
    .select("id")
    .single()
  if (error || !data?.id) {
    if (isMissingTable(error)) return { data: null, sinReceta: false, error: ORDENES_FEATURE_PENDING }
    return { data: null, sinReceta: false, error: error?.message || "No se pudo crear la orden" }
  }
  return { data: { id: data.id as number }, sinReceta: recetaId == null, error: null }
}

export async function updateOrden(
  id: number,
  input: { cantidad_objetivo: number; fecha_objetivo?: string | null; notas?: string | null },
): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }
  const { error } = await supabase
    .from("produccion_ordenes")
    .update({
      cantidad_objetivo: Number(input.cantidad_objetivo) || 0,
      fecha_objetivo: input.fecha_objetivo || null,
      notas: (input.notas || "").trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
  return { error: error ? error.message : null }
}

export async function setEstadoOrden(id: number, estado: EstadoOrden): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }
  const { error } = await supabase
    .from("produccion_ordenes")
    .update({ estado, updated_at: new Date().toISOString() })
    .eq("id", id)
  return { error: error ? error.message : null }
}
