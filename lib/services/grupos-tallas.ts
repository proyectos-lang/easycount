import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { getTenantStamp, isValidStamp, SESION_INVALIDA_ERROR } from "@/lib/services/tenant-stamp"

// ==================== GRUPOS DE TALLAS ====================
//
// Un "grupo de tallas" vincula productos que son la misma prenda en distintas
// tallas (mismo nombre, cada uno con su propio stock/codigo/precio). El vinculo
// vive en la tabla mapa `producto_grupo_tallas` (script 043), NO en `productos`.
//
// Todo degrada con gracia si el script 043 no se aplico: las funciones de
// lectura devuelven vacio y las de escritura reportan la feature pendiente, asi
// que los productos se siguen viendo sueltos como antes.

export interface GrupoTallaRef {
  grupo_id: number
  nombre_grupo: string | null
}

/** Marca la ausencia de la tabla (script 043 sin aplicar). */
export const GRUPOS_TALLAS_FEATURE_PENDING =
  "Funcion de grupos de tallas pendiente: aplica scripts/043-producto-grupo-tallas.sql en Supabase."

function isMissingTable(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false
  const msg = (err.message || "").toLowerCase()
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    /relation .*producto_grupo_tallas.* does not exist/.test(msg) ||
    msg.includes("could not find the table")
  )
}

/**
 * Devuelve el mapa producto_id -> {grupo_id, nombre_grupo} para el tenant.
 * Vacio si la tabla no existe todavia. Con esto, cualquier lista de productos
 * puede saber cuales son hermanos de talla y agruparlos.
 */
export async function getGruposTallas(): Promise<{
  data: Map<number, GrupoTallaRef>
  error: string | null
}> {
  const vacio = new Map<number, GrupoTallaRef>()
  if (!isSupabaseConfigured()) return { data: vacio, error: null }
  const supabase = createClient()
  if (!supabase) return { data: vacio, error: "Cliente no disponible" }

  const { data, error } = await supabase
    .from("producto_grupo_tallas")
    .select("producto_id, grupo_id, nombre_grupo")
  if (error) {
    if (isMissingTable(error)) return { data: vacio, error: null }
    return { data: vacio, error: error.message }
  }
  const map = new Map<number, GrupoTallaRef>()
  for (const r of (data || []) as { producto_id: number; grupo_id: number; nombre_grupo: string | null }[]) {
    map.set(r.producto_id, { grupo_id: r.grupo_id, nombre_grupo: r.nombre_grupo })
  }
  return { data: map, error: null }
}

/**
 * Asigna un mismo grupo_id (nuevo) a los productos indicados. Usa el timestamp
 * en ms como grupo_id: es unico dentro del tenant para una tanda de creacion.
 * Idempotente por producto (upsert por PK producto_id).
 */
export async function crearGrupoConProductos(
  nombreGrupo: string,
  productoIds: number[],
): Promise<{ grupoId: number | null; error: string | null }> {
  if (productoIds.length === 0) return { grupoId: null, error: "Sin productos para agrupar" }
  const supabase = createClient()
  if (!supabase) return { grupoId: null, error: "Cliente no disponible" }
  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { grupoId: null, error: SESION_INVALIDA_ERROR }

  const grupoId = Date.now()
  const filas = productoIds.map((producto_id) => ({
    producto_id,
    grupo_id: grupoId,
    nombre_grupo: nombreGrupo || null,
    ...stamp,
  }))
  const { error } = await supabase
    .from("producto_grupo_tallas")
    .upsert(filas, { onConflict: "producto_id" })
  if (error) {
    if (isMissingTable(error)) return { grupoId: null, error: GRUPOS_TALLAS_FEATURE_PENDING }
    return { grupoId: null, error: error.message }
  }
  return { grupoId, error: null }
}

/**
 * Agrega un producto ya existente a un grupo (al "Agregar talla" desde el
 * editor de grupo). Conserva el nombre_grupo si se pasa.
 */
export async function agregarProductoAGrupo(
  grupoId: number,
  productoId: number,
  nombreGrupo?: string | null,
): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }
  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { error: SESION_INVALIDA_ERROR }

  const { error } = await supabase
    .from("producto_grupo_tallas")
    .upsert(
      { producto_id: productoId, grupo_id: grupoId, nombre_grupo: nombreGrupo ?? null, ...stamp },
      { onConflict: "producto_id" },
    )
  if (error) {
    if (isMissingTable(error)) return { error: GRUPOS_TALLAS_FEATURE_PENDING }
    return { error: error.message }
  }
  return { error: null }
}

/** Quita un producto de su grupo (sin borrar el producto). */
export async function quitarDeGrupo(productoId: number): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }
  const { error } = await supabase
    .from("producto_grupo_tallas")
    .delete()
    .eq("producto_id", productoId)
  if (error) {
    if (isMissingTable(error)) return { error: null }
    return { error: error.message }
  }
  return { error: null }
}
