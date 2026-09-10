import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { getTenantStamp, isValidStamp, SESION_INVALIDA_ERROR } from "@/lib/services/tenant-stamp"

// ==================== PRODUCTOS FABRICADOS (marca) ====================
//
// Marca qué productos de `productos` se FABRICAN (tabla mapa del script 048,
// no toca `productos`). Recetas y Órdenes de Producción usan esta marca.
// Degrada si el script 048 no se aplicó.

export const FABRICADOS_FEATURE_PENDING =
  "Función pendiente: aplica scripts/048-produccion-ordenes.sql en Supabase."

function isMissingTable(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false
  const msg = (err.message || "").toLowerCase()
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    /relation .*productos_fabricados.* does not exist/.test(msg) ||
    msg.includes("could not find the table")
  )
}

/** Set de producto_id marcados como fabricados. Vacío si la tabla no existe. */
export async function getProductosFabricados(): Promise<{ data: Set<number>; error: string | null }> {
  const vacio = new Set<number>()
  if (!isSupabaseConfigured()) return { data: vacio, error: null }
  const supabase = createClient()
  if (!supabase) return { data: vacio, error: "Cliente no disponible" }

  const { data, error } = await supabase.from("productos_fabricados").select("producto_id")
  if (error) {
    if (isMissingTable(error)) return { data: vacio, error: null }
    return { data: vacio, error: error.message }
  }
  return { data: new Set((data || []).map((r: { producto_id: number }) => r.producto_id)), error: null }
}

/** Marca o desmarca un producto como fabricado. */
export async function setProductoFabricado(
  productoId: number,
  fabricado: boolean,
): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }

  if (!fabricado) {
    const { error } = await supabase.from("productos_fabricados").delete().eq("producto_id", productoId)
    if (error) {
      if (isMissingTable(error)) return { error: null }
      return { error: error.message }
    }
    return { error: null }
  }

  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { error: SESION_INVALIDA_ERROR }
  const { error } = await supabase
    .from("productos_fabricados")
    .upsert({ producto_id: productoId, ...stamp }, { onConflict: "producto_id" })
  if (error) {
    if (isMissingTable(error)) return { error: FABRICADOS_FEATURE_PENDING }
    return { error: error.message }
  }
  return { error: null }
}
