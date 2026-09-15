import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { getTenantStamp, isValidStamp, SESION_INVALIDA_ERROR, type TenantStamp } from "@/lib/services/tenant-stamp"
import { getHondurasNowISO } from "@/lib/utils/honduras-time"
import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js"

// ==================== PRODUCCIÓN · MATERIALES ====================
//
// Sistema PROPIO de materia prima (tablas del script 046), separado de
// `productos`. El stock global y el costo promedio del material se mueven SOLO
// por las RPCs `mat_ajustar_stock` / `mat_aplicar_entrada` (con fallback
// lee-modifica-escribe, patrón de lib/services/stock.ts). El stock por
// almacén/localización se deriva sumando `materiales_movimientos.cantidad`.
//
// Todo degrada con gracia si el script 046 no se aplicó (isMissingTable).

export interface Material {
  id?: number
  nombre: string
  codigo?: string | null
  unidad_medida: string
  costo_promedio: number
  stock_total: number
  activo?: boolean
}

export interface MovimientoMaterial {
  id: number
  material_id: number
  almacen_id: number | null
  localizacion_id: number | null
  tipo_movimiento: string
  cantidad: number
  costo_unitario: number
  referencia_id: number | null
  fecha: string | null
  material_nombre?: string
  almacen_nombre?: string
  localizacion_nombre?: string
}

export interface ValoracionMaterial {
  id: number
  nombre: string
  codigo: string | null
  unidad_medida: string
  stock_total: number
  costo_promedio: number
  valor_total: number
}

/** Marca la ausencia de las tablas (script 046 sin aplicar). */
export const MATERIALES_FEATURE_PENDING =
  "Función de materiales pendiente: aplica scripts/046-produccion-materiales.sql en Supabase."

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

function esFuncionInexistente(error: PostgrestError | null): boolean {
  if (!error) return false
  return (
    error.code === "PGRST202" ||
    /could not find the function|function .* does not exist/i.test(error.message || "")
  )
}

// ==================== RPCs de stock de material (con fallback) ====================

/** Suma `delta` (±) al stock del material. Devuelve el nuevo stock o null. */
export async function matAjustarStock(
  supabase: SupabaseClient,
  materialId: number,
  delta: number,
): Promise<{ error: string | null }> {
  const rpc = await supabase.rpc("mat_ajustar_stock", { p_material_id: materialId, p_delta: delta })
  if (!rpc.error) return { error: null }
  if (!esFuncionInexistente(rpc.error)) return { error: rpc.error.message }

  // Fallback lee-modifica-escribe (RLS aísla por tenant).
  const { data, error: readErr } = await supabase.from("materiales").select("stock_total").eq("id", materialId).single()
  if (readErr) return { error: readErr.message }
  const nuevo = Number(data?.stock_total || 0) + delta
  const { error: updErr } = await supabase
    .from("materiales")
    .update({ stock_total: nuevo, updated_at: new Date().toISOString() })
    .eq("id", materialId)
  return { error: updErr ? updErr.message : null }
}

/** Entrada de material: suma stock y recalcula costo promedio ponderado. */
export async function matAplicarEntrada(
  supabase: SupabaseClient,
  materialId: number,
  cantidad: number,
  costoUnitario: number,
): Promise<{ error: string | null }> {
  const rpc = await supabase.rpc("mat_aplicar_entrada", {
    p_material_id: materialId,
    p_cantidad: cantidad,
    p_costo_unitario: costoUnitario,
  })
  if (!rpc.error) return { error: null }
  if (!esFuncionInexistente(rpc.error)) return { error: rpc.error.message }

  // Fallback lee-modifica-escribe.
  const { data, error: readErr } = await supabase
    .from("materiales")
    .select("stock_total, costo_promedio")
    .eq("id", materialId)
    .single()
  if (readErr) return { error: readErr.message }
  const stockActual = Number(data?.stock_total || 0)
  const costoActual = Number(data?.costo_promedio || 0)
  const nuevoStock = stockActual + cantidad
  const nuevoCosto = nuevoStock > 0 ? (stockActual * costoActual + cantidad * costoUnitario) / nuevoStock : costoUnitario
  const { error: updErr } = await supabase
    .from("materiales")
    .update({ stock_total: nuevoStock, costo_promedio: nuevoCosto, updated_at: new Date().toISOString() })
    .eq("id", materialId)
  return { error: updErr ? updErr.message : null }
}

// ==================== CATÁLOGO ====================

export async function getMateriales(
  opts?: { soloActivos?: boolean },
): Promise<{ data: Material[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }
  const supabase = createClient()
  if (!supabase) return { data: [], error: "Cliente no disponible" }

  let q = supabase
    .from("materiales")
    .select("id, nombre, codigo, unidad_medida, costo_promedio, stock_total, activo")
    .order("nombre", { ascending: true })
  if (opts?.soloActivos) q = q.eq("activo", true)

  const { data, error } = await q
  if (error) {
    if (isMissingTable(error)) return { data: [], error: null }
    return { data: [], error: error.message }
  }
  return { data: (data || []) as Material[], error: null }
}

export async function createMaterial(
  input: {
    nombre: string
    codigo?: string | null
    unidad_medida: string
    /**
     * Carga inicial OPCIONAL. Si `stock_inicial > 0`, se registra un movimiento
     * 'Carga Inicial' en el kardex (requiere `almacen_id` + `localizacion_id`)
     * y se suma stock + costo promedio con `matAplicarEntrada`, para que el
     * stock por localizacion, el kardex y la valoracion queden consistentes.
     */
    stock_inicial?: number
    costo_inicial?: number
    almacen_id?: number | null
    localizacion_id?: number | null
  },
): Promise<{ data: { id: number } | null; error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { data: null, error: "Cliente no disponible" }
  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { data: null, error: SESION_INVALIDA_ERROR }

  const stockInicial = Number(input.stock_inicial || 0)
  const costoInicial = Number(input.costo_inicial || 0)
  // Si hay carga inicial, exigimos ubicacion para que el kardex sea consistente.
  if (stockInicial > 0 && (!input.almacen_id || !input.localizacion_id)) {
    return { data: null, error: "Para la carga inicial elige almacén y localización." }
  }

  const { data, error } = await supabase
    .from("materiales")
    .insert({
      nombre: input.nombre.trim(),
      codigo: (input.codigo || "").trim() || null,
      unidad_medida: (input.unidad_medida || "unidad").trim(),
      ...stamp,
    })
    .select("id")
    .single()
  if (error) {
    if (isMissingTable(error)) return { data: null, error: MATERIALES_FEATURE_PENDING }
    return { data: null, error: error.message }
  }
  const nuevoId = (data as { id: number }).id

  // Carga inicial: movimiento de kardex + entrada de stock/costo.
  if (stockInicial > 0) {
    const carga = await cargarStockInicialMaterial(supabase, {
      material_id: nuevoId,
      almacen_id: input.almacen_id!,
      localizacion_id: input.localizacion_id!,
      cantidad: stockInicial,
      costo_unitario: costoInicial,
      stamp,
    })
    if (carga.error) {
      // El material quedo creado; devolvemos el id pero avisamos del fallo de carga.
      return { data: { id: nuevoId }, error: `Material creado, pero la carga inicial fallo: ${carga.error}` }
    }
  }

  return { data: { id: nuevoId }, error: null }
}

/**
 * Registra la carga inicial de stock de un material: escribe el movimiento
 * 'Carga Inicial' en `materiales_movimientos` y suma stock + costo promedio
 * ponderado con `matAplicarEntrada`. Mismo patron que `recibirCompraMaterial`.
 */
async function cargarStockInicialMaterial(
  supabase: SupabaseClient,
  args: {
    material_id: number
    almacen_id: number
    localizacion_id: number
    cantidad: number
    costo_unitario: number
    stamp: TenantStamp
  },
): Promise<{ error: string | null }> {
  const { error: movErr } = await supabase.from("materiales_movimientos").insert({
    material_id: args.material_id,
    almacen_id: args.almacen_id,
    localizacion_id: args.localizacion_id,
    tipo_movimiento: "Carga Inicial",
    cantidad: args.cantidad,
    costo_unitario: args.costo_unitario,
    referencia_id: null,
    fecha: getHondurasNowISO(),
    ...args.stamp,
  })
  if (movErr) return { error: movErr.message }
  const ent = await matAplicarEntrada(supabase, args.material_id, args.cantidad, args.costo_unitario)
  return { error: ent.error }
}

export async function updateMaterial(
  id: number,
  input: { nombre: string; codigo?: string | null; unidad_medida: string; activo?: boolean },
): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }
  const { error } = await supabase
    .from("materiales")
    .update({
      nombre: input.nombre.trim(),
      codigo: (input.codigo || "").trim() || null,
      unidad_medida: (input.unidad_medida || "unidad").trim(),
      ...(input.activo !== undefined ? { activo: input.activo } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
  if (error) return { error: error.message }
  return { error: null }
}

// ==================== KARDEX / STOCK / VALORACIÓN ====================

export async function getKardexMaterial(
  materialId: number,
): Promise<{ data: MovimientoMaterial[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }
  const supabase = createClient()
  if (!supabase) return { data: [], error: "Cliente no disponible" }

  // Sin embeds: `materiales_movimientos` no tiene FKs declaradas hacia
  // `almacenes`/`localizaciones`/`materiales`, y PostgREST falla la consulta
  // entera (PGRST200) si se piden como embed -> el kardex salia vacio. Traemos
  // las columnas planas y resolvemos los nombres con queries aparte por id.
  const { data, error } = await supabase
    .from("materiales_movimientos")
    .select("id, material_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_unitario, referencia_id, fecha")
    .eq("material_id", materialId)
    .order("fecha", { ascending: false })
  if (error) {
    if (isMissingTable(error)) return { data: [], error: null }
    return { data: [], error: error.message }
  }
  const filas = data || []

  // Resolver nombres (material, almacenes, localizaciones) en queries por id.
  const almIds = Array.from(new Set(filas.map((m) => m.almacen_id).filter((v): v is number => v != null)))
  const locIds = Array.from(new Set(filas.map((m) => m.localizacion_id).filter((v): v is number => v != null)))
  const nombreMat = new Map<number, string>()
  const nombreAlm = new Map<number, string>()
  const nombreLoc = new Map<number, string>()
  {
    const mat = await supabase.from("materiales").select("nombre").eq("id", materialId).maybeSingle()
    if (mat.data?.nombre) nombreMat.set(materialId, String(mat.data.nombre))
  }
  if (almIds.length > 0) {
    const { data: alm } = await supabase.from("almacenes").select("id, nombre").in("id", almIds)
    for (const a of alm || []) nombreAlm.set(Number(a.id), String(a.nombre || ""))
  }
  if (locIds.length > 0) {
    const { data: loc } = await supabase.from("localizaciones").select("id, nombre").in("id", locIds)
    for (const l of loc || []) nombreLoc.set(Number(l.id), String(l.nombre || ""))
  }

  const rows = filas.map((m: Record<string, unknown>) => {
    const almId = m.almacen_id != null ? Number(m.almacen_id) : null
    const locId = m.localizacion_id != null ? Number(m.localizacion_id) : null
    return {
      id: Number(m.id),
      material_id: Number(m.material_id),
      almacen_id: almId,
      localizacion_id: locId,
      tipo_movimiento: String(m.tipo_movimiento || ""),
      cantidad: Number(m.cantidad || 0),
      costo_unitario: Number(m.costo_unitario || 0),
      referencia_id: m.referencia_id != null ? Number(m.referencia_id) : null,
      fecha: (m.fecha as string) || null,
      material_nombre: nombreMat.get(Number(m.material_id)) || "",
      almacen_nombre: almId != null ? nombreAlm.get(almId) || "" : "",
      localizacion_nombre: locId != null ? nombreLoc.get(locId) || "" : "",
    }
  })
  return { data: rows, error: null }
}

/** Stock del material por localización (derivado del ledger). */
export async function getStockMaterialPorLocalizacion(
  materialId: number,
): Promise<{ data: { almacen_id: number | null; localizacion_id: number | null; stock: number }[]; error: string | null }> {
  const { data: kardex, error } = await getKardexMaterial(materialId)
  if (error) return { data: [], error }
  const map = new Map<number | null, { almacen_id: number | null; localizacion_id: number | null; stock: number }>()
  for (const m of kardex) {
    const key = m.localizacion_id ?? null
    const cur = map.get(key) ?? { almacen_id: m.almacen_id, localizacion_id: key, stock: 0 }
    cur.stock += m.cantidad
    map.set(key, cur)
  }
  return { data: Array.from(map.values()).filter((l) => Math.abs(l.stock) > 0.0001), error: null }
}

export async function getValoracionMateriales(): Promise<{ data: ValoracionMaterial[]; error: string | null }> {
  const { data, error } = await getMateriales()
  if (error) return { data: [], error }
  const val = data.map((m) => ({
    id: m.id!,
    nombre: m.nombre,
    codigo: m.codigo ?? null,
    unidad_medida: m.unidad_medida,
    stock_total: m.stock_total || 0,
    costo_promedio: m.costo_promedio || 0,
    valor_total: +((m.stock_total || 0) * (m.costo_promedio || 0)).toFixed(2),
  }))
  return { data: val, error: null }
}

/** Fecha HN-as-UTC para las transacciones (día de negocio de Honduras). */
export function nowHn(): string {
  return getHondurasNowISO()
}

// ==================== IMPORTAR MATERIALES (Excel) ====================

/** Una fila del Excel de carga masiva de materiales. */
export interface FilaMaterialImport {
  fila: number // fila en el Excel (para reportar errores)
  nombre: string
  codigo: string
  unidad_medida: string
  stock_inicial: number
  costo_promedio: number
}

export interface ResultadoImportMateriales {
  creados: number
  errores: number
  detalle: { nombre: string; estado: "creado" | "error"; motivo?: string }[]
}

/**
 * Crea en lote los materiales de `filas`. Si una fila trae `stock_inicial > 0`,
 * la carga inicial va al `almacen_id`/`localizacion_id` elegidos (aplican a todo
 * el archivo). Continua ante errores por fila y devuelve el detalle.
 */
export async function importarMateriales(
  filas: FilaMaterialImport[],
  ubicacion: { almacen_id: number; localizacion_id: number },
): Promise<ResultadoImportMateriales> {
  const resultado: ResultadoImportMateriales = { creados: 0, errores: 0, detalle: [] }
  for (const f of filas) {
    if (!f.nombre.trim()) {
      resultado.errores++
      resultado.detalle.push({ nombre: `(fila ${f.fila})`, estado: "error", motivo: "Sin nombre" })
      continue
    }
    const res = await createMaterial({
      nombre: f.nombre,
      codigo: f.codigo || null,
      unidad_medida: f.unidad_medida || "unidad",
      stock_inicial: f.stock_inicial,
      costo_inicial: f.costo_promedio,
      almacen_id: f.stock_inicial > 0 ? ubicacion.almacen_id : null,
      localizacion_id: f.stock_inicial > 0 ? ubicacion.localizacion_id : null,
    })
    if (res.error && !res.data) {
      resultado.errores++
      resultado.detalle.push({ nombre: f.nombre, estado: "error", motivo: res.error })
    } else {
      resultado.creados++
      // res.error con data presente = material creado pero carga inicial fallo (aviso).
      resultado.detalle.push({ nombre: f.nombre, estado: "creado", motivo: res.error || undefined })
    }
  }
  return resultado
}
