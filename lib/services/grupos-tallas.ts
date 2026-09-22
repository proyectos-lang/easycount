import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { getTenantStamp, isValidStamp, SESION_INVALIDA_ERROR } from "@/lib/services/tenant-stamp"
import { saveProducto, type Producto } from "@/lib/services/catalogos"

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

/**
 * Convierte un producto YA EXISTENTE (recién asociado en una recepción) en un
 * producto TALLADO: le asigna una talla, crea las tallas hermanas que falten
 * como productos nuevos (mismo costo/precio), y agrupa a todos. Devuelve la
 * lista {producto, cantidad} lista para que la recepción arme una línea por
 * talla. NO toca stock (el ingreso entra al procesar la recepción).
 *
 * El producto original conserva su historial/stock: solo gana una talla y entra
 * al grupo. Idempotente por producto (upsert por PK en la tabla de grupos).
 */
export async function convertirAsociadoATallado(params: {
  /** Producto ya existente que se marcará como tallado (su talla se asigna). */
  original: Producto
  /** Talla que se asigna al producto original en este ingreso. */
  tallaOriginal: string
  /** Cantidad del producto original para este ingreso. */
  cantidadOriginal: number
  /** Tallas ADICIONALES a crear como hermanas (talla + cantidad). */
  tallasNuevas: { talla: string; cantidad: number }[]
}): Promise<{ items: { producto: Producto; cantidad: number }[]; error: string | null }> {
  const { original, tallaOriginal, cantidadOriginal, tallasNuevas } = params
  const tallaOrig = (tallaOriginal || "").trim()
  if (!original.id) return { items: [], error: "El producto original no es válido." }
  if (!tallaOrig) return { items: [], error: "Asigna una talla al producto asociado." }

  const nuevas = tallasNuevas
    .map((t) => ({ talla: (t.talla || "").trim(), cantidad: Math.max(0, Number(t.cantidad) || 0) }))
    .filter((t) => t.talla !== "")
  if (nuevas.length === 0) return { items: [], error: "Agrega al menos una talla adicional." }

  // Ninguna talla puede repetirse (ni contra la original).
  const todas = [tallaOrig, ...nuevas.map((t) => t.talla)]
  if (new Set(todas.map((t) => t.toLowerCase())).size !== todas.length) {
    return { items: [], error: "Cada talla debe ser única (incluida la del producto asociado)." }
  }

  const items: { producto: Producto; cantidad: number }[] = []
  const errores: string[] = []
  const ids: number[] = []

  // 1) El producto original conserva su registro; solo le asignamos la talla.
  const { data: origActualizado, error: errOrig } = await saveProducto(
    { ...original, talla: tallaOrig },
    false,
  )
  if (errOrig || !origActualizado) {
    return { items: [], error: errOrig || "No se pudo marcar el producto como tallado." }
  }
  items.push({ producto: { ...origActualizado, id: original.id, talla: tallaOrig }, cantidad: Math.max(0, Number(cantidadOriginal) || 0) })
  ids.push(original.id)

  // 2) Cada talla adicional es un producto nuevo hermano (mismo costo/precio).
  const baseCodigo = original.codigo_barras || `AUTO-${Date.now().toString(36).toUpperCase()}`
  for (const n of nuevas) {
    const payload: Producto = {
      nombre: original.nombre,
      codigo_barras: `${baseCodigo}-${n.talla}`,
      precio_venta_sugerido: Number(original.precio_venta_sugerido) || 0,
      costo_promedio: Number(original.costo_promedio) || 0,
      stock_total: 0,
      foto_url: original.foto_url || "",
      marca_id: original.marca_id ?? null,
      categoria_id: original.categoria_id ?? null,
      subcategoria_id: original.subcategoria_id ?? null,
      talla: n.talla,
    }
    const { data, error } = await saveProducto(payload, true)
    if (error || !data?.id) { errores.push(`${n.talla}: ${error || "no se pudo crear"}`); continue }
    const enriched: Producto = {
      ...data,
      marca_nombre: original.marca_nombre ?? data.marca_nombre,
      categoria_nombre: original.categoria_nombre ?? data.categoria_nombre,
    }
    items.push({ producto: enriched, cantidad: n.cantidad })
    ids.push(data.id)
  }

  // 3) Agrupamos original + hermanas (si hay al menos dos productos válidos).
  if (ids.length > 1) {
    const g = await crearGrupoConProductos(original.nombre, ids)
    if (g.error && g.error !== GRUPOS_TALLAS_FEATURE_PENDING) errores.push(`Agrupado: ${g.error}`)
  }

  if (items.length < 2) {
    return { items: [], error: errores.join(" · ") || "No se pudieron crear las tallas." }
  }
  // Errores parciales: se devuelven las tallas que sí entraron + un aviso.
  return { items, error: errores.length > 0 ? errores.join(" · ") : null }
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
