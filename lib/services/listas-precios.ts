import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { getTenantStamp, isValidStamp, SESION_INVALIDA_ERROR } from "@/lib/services/tenant-stamp"

// ==================== TIPOS ====================

export type TipoLista = "porcentaje" | "individual"

export interface ListaPrecio {
  id: number
  nombre: string
  tipo: TipoLista
  /** Ajuste % sobre el precio base (solo tipo 'porcentaje'). Negativo = descuento. */
  porcentaje: number
  activo: boolean
  /** Lista GENERAL por fecha (script 071): aplica a todos sin cliente, por vigencia. */
  es_general?: boolean | null
  vigente_desde?: string | null
  vigente_hasta?: string | null
}

/** Columnas de la lista general por fecha (script 071). */
const COLS_GENERAL = "id, nombre, tipo, porcentaje, activo, es_general, vigente_desde, vigente_hasta"
const COLS_BASE = "id, nombre, tipo, porcentaje, activo"

/** True si el error es por columna faltante (script 071 pendiente). */
function faltaColumnaGeneral(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false
  return /es_general|vigente_desde|vigente_hasta/i.test(err.message || "")
}

/** Marca la ausencia de las tablas (script 042 sin aplicar). */
export const LISTAS_FEATURE_PENDING =
  "Funcion de listas de precios pendiente: aplica scripts/042-listas-precios.sql en Supabase."

function isMissingTable(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false
  const msg = (err.message || "").toLowerCase()
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    /relation .*(listas_precios|cliente_lista_precio).* does not exist/.test(msg) ||
    msg.includes("could not find the table")
  )
}

// ==================== LISTAS ====================

export async function getListasPrecios(): Promise<{ data: ListaPrecio[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }
  const supabase = createClient()
  if (!supabase) return { data: [], error: "Cliente no disponible" }

  let res: { data: unknown[] | null; error: { message?: string; code?: string } | null } = await supabase
    .from("listas_precios")
    .select(COLS_GENERAL)
    .order("nombre", { ascending: true })
  // Fallback: script 071 pendiente (sin columnas de vigencia) → selecciona base.
  if (res.error && faltaColumnaGeneral(res.error)) {
    res = await supabase.from("listas_precios").select(COLS_BASE).order("nombre", { ascending: true })
  }
  if (res.error) {
    if (isMissingTable(res.error)) return { data: [], error: LISTAS_FEATURE_PENDING }
    return { data: [], error: res.error.message || "Error" }
  }
  return { data: (res.data || []) as ListaPrecio[], error: null }
}

/**
 * Valida que una lista GENERAL por fecha no se solape con otra general vigente.
 * Rangos abiertos (null) = sin cota. Devuelve un mensaje si hay solape, o null.
 * `excluirId` evita compararse consigo misma al editar.
 */
async function validarSolapeGeneral(
  supabase: NonNullable<ReturnType<typeof createClient>>,
  desde: string | null,
  hasta: string | null,
  excluirId?: number,
): Promise<string | null> {
  let q = supabase
    .from("listas_precios")
    .select("id, nombre, vigente_desde, vigente_hasta")
    .eq("es_general", true)
    .eq("activo", true)
  if (excluirId) q = q.neq("id", excluirId)
  const { data, error } = await q
  if (error) {
    // Si faltan las columnas (script 071 pendiente) no se puede validar: no bloquea.
    if (faltaColumnaGeneral(error) || isMissingTable(error)) return null
    return error.message
  }
  // Dos rangos [a1,b1] y [a2,b2] se solapan si a1 <= b2 && a2 <= b1 (con null = ±∞).
  const a1 = desde ?? "0000-01-01"
  const b1 = hasta ?? "9999-12-31"
  for (const l of (data || []) as { nombre: string; vigente_desde: string | null; vigente_hasta: string | null }[]) {
    const a2 = l.vigente_desde ?? "0000-01-01"
    const b2 = l.vigente_hasta ?? "9999-12-31"
    if (a1 <= b2 && a2 <= b1) {
      return `El rango de fechas se solapa con la lista general "${l.nombre}". Ajusta las fechas o desactívala.`
    }
  }
  return null
}

export async function crearListaPrecio(input: {
  nombre: string
  tipo: TipoLista
  porcentaje: number
  es_general?: boolean
  vigente_desde?: string | null
  vigente_hasta?: string | null
}): Promise<{ data: { id: number } | null; error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { data: null, error: "Cliente no disponible" }
  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { data: null, error: SESION_INVALIDA_ERROR }

  const esGeneral = !!input.es_general
  if (esGeneral) {
    const solape = await validarSolapeGeneral(supabase, input.vigente_desde ?? null, input.vigente_hasta ?? null)
    if (solape) return { data: null, error: solape }
  }

  const fila: Record<string, unknown> = {
    nombre: input.nombre.trim(),
    tipo: input.tipo,
    porcentaje: input.tipo === "porcentaje" ? Number(input.porcentaje) || 0 : 0,
    activo: true,
    es_general: esGeneral,
    vigente_desde: esGeneral ? (input.vigente_desde || null) : null,
    vigente_hasta: esGeneral ? (input.vigente_hasta || null) : null,
    ...stamp,
  }
  let res = await supabase.from("listas_precios").insert(fila).select("id").single()
  // Fallback: script 071 pendiente → inserta sin columnas de vigencia.
  if (res.error && faltaColumnaGeneral(res.error)) {
    const { es_general: _g, vigente_desde: _d, vigente_hasta: _h, ...filaBase } = fila
    res = await supabase.from("listas_precios").insert(filaBase).select("id").single()
  }
  if (res.error) {
    if (isMissingTable(res.error)) return { data: null, error: LISTAS_FEATURE_PENDING }
    return { data: null, error: res.error.message }
  }
  return { data: { id: res.data.id as number }, error: null }
}

export async function actualizarListaPrecio(
  id: number,
  input: {
    nombre?: string
    porcentaje?: number
    activo?: boolean
    es_general?: boolean
    vigente_desde?: string | null
    vigente_hasta?: string | null
  }
): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }

  // Si queda como general (y activa), valida el solape con otras generales.
  const tocaVigencia = input.es_general !== undefined || input.vigente_desde !== undefined || input.vigente_hasta !== undefined
  if (tocaVigencia && input.es_general && input.activo !== false) {
    const solape = await validarSolapeGeneral(supabase, input.vigente_desde ?? null, input.vigente_hasta ?? null, id)
    if (solape) return { error: solape }
  }

  const patch: Record<string, unknown> = {}
  if (input.nombre !== undefined) patch.nombre = input.nombre.trim()
  if (input.porcentaje !== undefined) patch.porcentaje = Number(input.porcentaje) || 0
  if (input.activo !== undefined) patch.activo = input.activo
  if (input.es_general !== undefined) patch.es_general = input.es_general
  if (input.vigente_desde !== undefined) patch.vigente_desde = input.vigente_desde || null
  if (input.vigente_hasta !== undefined) patch.vigente_hasta = input.vigente_hasta || null

  let { error } = await supabase.from("listas_precios").update(patch).eq("id", id)
  // Fallback: script 071 pendiente → reintenta sin columnas de vigencia.
  if (error && faltaColumnaGeneral(error)) {
    const { es_general: _g, vigente_desde: _d, vigente_hasta: _h, ...patchBase } = patch
    const retry = await supabase.from("listas_precios").update(patchBase).eq("id", id)
    error = retry.error
  }
  return { error: error ? error.message : null }
}

export async function eliminarListaPrecio(id: number): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }
  const { error } = await supabase.from("listas_precios").delete().eq("id", id)
  return { error: error ? error.message : null }
}

// ==================== DETALLE (precios por producto) ====================

/** Mapa producto_id -> precio de la lista (solo tipo 'individual'). */
export async function getDetalleLista(
  listaId: number
): Promise<{ data: Record<number, number>; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: {}, error: null }
  const supabase = createClient()
  if (!supabase) return { data: {}, error: "Cliente no disponible" }
  const { data, error } = await supabase
    .from("listas_precios_detalle")
    .select("producto_id, precio")
    .eq("lista_id", listaId)
  if (error) {
    if (isMissingTable(error)) return { data: {}, error: LISTAS_FEATURE_PENDING }
    return { data: {}, error: error.message }
  }
  const map: Record<number, number> = {}
  for (const r of data || []) map[r.producto_id as number] = Number(r.precio)
  return { data: map, error: null }
}

/** Fija (o borra si precio null) el precio de un producto en una lista individual. */
export async function setPrecioProducto(
  listaId: number,
  productoId: number,
  precio: number | null
): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }
  if (precio == null || Number.isNaN(precio)) {
    const { error } = await supabase
      .from("listas_precios_detalle")
      .delete()
      .eq("lista_id", listaId)
      .eq("producto_id", productoId)
    return { error: error ? error.message : null }
  }
  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { error: SESION_INVALIDA_ERROR }
  const { error } = await supabase
    .from("listas_precios_detalle")
    .upsert(
      { lista_id: listaId, producto_id: productoId, precio, ...stamp },
      { onConflict: "lista_id,producto_id" }
    )
  return { error: error ? error.message : null }
}

// ==================== ASIGNACION A CLIENTE ====================

/** lista_id asignada a un cliente, o null si usa el precio normal del maestro. */
export async function getListaDeCliente(
  clienteId: number
): Promise<{ data: number | null; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: null, error: null }
  const supabase = createClient()
  if (!supabase) return { data: null, error: "Cliente no disponible" }
  const { data, error } = await supabase
    .from("cliente_lista_precio")
    .select("lista_id")
    .eq("cliente_id", clienteId)
    .maybeSingle()
  if (error) {
    if (isMissingTable(error)) return { data: null, error: null }
    return { data: null, error: error.message }
  }
  return { data: (data?.lista_id as number | undefined) ?? null, error: null }
}

/** Asigna (o quita, si listaId null) una lista a un cliente. */
export async function setListaDeCliente(
  clienteId: number,
  listaId: number | null
): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }
  if (listaId == null) {
    const { error } = await supabase.from("cliente_lista_precio").delete().eq("cliente_id", clienteId)
    return { error: error ? error.message : null }
  }
  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { error: SESION_INVALIDA_ERROR }
  const { error } = await supabase
    .from("cliente_lista_precio")
    .upsert(
      { cliente_id: clienteId, lista_id: listaId, razon_social_id: stamp.razon_social_id },
      { onConflict: "cliente_id" }
    )
  return { error: error ? error.message : null }
}

// ==================== APLICACION EN EL POS ====================

export interface ListaAplicada {
  lista: ListaPrecio
  detalle: Record<number, number>
}

/** Carga la lista de un cliente (con su detalle si es individual), o null. */
export async function getListaAplicadaCliente(
  clienteId: number
): Promise<{ data: ListaAplicada | null; error: string | null }> {
  const { data: listaId } = await getListaDeCliente(clienteId)
  if (listaId == null) return { data: null, error: null }

  const supabase = createClient()
  if (!supabase) return { data: null, error: "Cliente no disponible" }
  const { data: lista, error } = await supabase
    .from("listas_precios")
    .select("id, nombre, tipo, porcentaje, activo")
    .eq("id", listaId)
    .maybeSingle()
  if (error || !lista || lista.activo === false) return { data: null, error: null }

  let detalle: Record<number, number> = {}
  if (lista.tipo === "individual") {
    const d = await getDetalleLista(listaId)
    detalle = d.data
  }
  return { data: { lista: lista as ListaPrecio, detalle }, error: null }
}

/**
 * Lista GENERAL por fecha vigente en `fechaISO` (YYYY-MM-DD), o null. Si hay
 * varias (no debería, por la validación de solape), toma la más reciente.
 * Tiene PRIORIDAD sobre la lista del cliente en el POS.
 */
export async function getListaGeneralVigente(
  fechaISO: string
): Promise<{ data: ListaAplicada | null; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: null, error: null }
  const supabase = createClient()
  if (!supabase) return { data: null, error: "Cliente no disponible" }

  const { data, error } = await supabase
    .from("listas_precios")
    .select(COLS_GENERAL)
    .eq("es_general", true)
    .eq("activo", true)
    .order("id", { ascending: false })
  if (error) {
    // Script 071 pendiente o tabla ausente: simplemente no hay lista general.
    if (faltaColumnaGeneral(error) || isMissingTable(error)) return { data: null, error: null }
    return { data: null, error: error.message }
  }

  const vigente = (data || []).find((l) => {
    const desde = (l as ListaPrecio).vigente_desde
    const hasta = (l as ListaPrecio).vigente_hasta
    return (!desde || fechaISO >= desde) && (!hasta || fechaISO <= hasta)
  }) as ListaPrecio | undefined
  if (!vigente) return { data: null, error: null }

  let detalle: Record<number, number> = {}
  if (vigente.tipo === "individual") {
    const d = await getDetalleLista(vigente.id)
    detalle = d.data
  }
  return { data: { lista: vigente, detalle }, error: null }
}

/** Precio final de un producto segun la lista (base si no aplica). */
export function calcularPrecioLista(
  base: number,
  aplicada: ListaAplicada | null,
  productoId: number
): number {
  if (!aplicada) return base
  const { lista, detalle } = aplicada
  if (lista.tipo === "individual") {
    const p = detalle[productoId]
    return p != null ? p : base // sin precio especifico -> precio del maestro
  }
  // El porcentaje es un DESCUENTO: siempre baja el precio (ej. 5 = 5% menos).
  const desc = Math.abs(Number(lista.porcentaje) || 0)
  return +(base * (1 - desc / 100)).toFixed(2)
}
