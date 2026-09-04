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

  const { data, error } = await supabase
    .from("listas_precios")
    .select("id, nombre, tipo, porcentaje, activo")
    .order("nombre", { ascending: true })
  if (error) {
    if (isMissingTable(error)) return { data: [], error: LISTAS_FEATURE_PENDING }
    return { data: [], error: error.message }
  }
  return { data: (data || []) as ListaPrecio[], error: null }
}

export async function crearListaPrecio(input: {
  nombre: string
  tipo: TipoLista
  porcentaje: number
}): Promise<{ data: { id: number } | null; error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { data: null, error: "Cliente no disponible" }
  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { data: null, error: SESION_INVALIDA_ERROR }

  const { data, error } = await supabase
    .from("listas_precios")
    .insert({
      nombre: input.nombre.trim(),
      tipo: input.tipo,
      porcentaje: input.tipo === "porcentaje" ? Number(input.porcentaje) || 0 : 0,
      activo: true,
      ...stamp,
    })
    .select("id")
    .single()
  if (error) {
    if (isMissingTable(error)) return { data: null, error: LISTAS_FEATURE_PENDING }
    return { data: null, error: error.message }
  }
  return { data: { id: data.id as number }, error: null }
}

export async function actualizarListaPrecio(
  id: number,
  input: { nombre?: string; porcentaje?: number; activo?: boolean }
): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }
  const patch: Record<string, unknown> = {}
  if (input.nombre !== undefined) patch.nombre = input.nombre.trim()
  if (input.porcentaje !== undefined) patch.porcentaje = Number(input.porcentaje) || 0
  if (input.activo !== undefined) patch.activo = input.activo
  const { error } = await supabase.from("listas_precios").update(patch).eq("id", id)
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
