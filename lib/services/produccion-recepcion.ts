import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { getTenantStamp, isValidStamp, SESION_INVALIDA_ERROR } from "@/lib/services/tenant-stamp"
import { getHondurasNowISO } from "@/lib/utils/honduras-time"
import { aplicarEntradaCompra } from "@/lib/services/stock"

// ==================== PRODUCCIÓN · RECEPCIÓN DE PRODUCTO TERMINADO ==========
//
// Confirma una corrida EJECUTADA y recibe el producto terminado al inventario:
// entran las unidades BUENAS con el costo real de la corrida (promedio ponderado
// como una compra). Escribe 'Entrada Produccion' en transacciones_inventario y
// llama aplicarEntradaCompra. Guarda anti doble-recepción. Degrada si el script
// 051 no se aplicó.

export interface CorridaPendiente {
  corrida_id: number
  orden_id: number
  producto_id: number
  producto_nombre: string
  unidades_buenas: number
  costo_unitario_real: number
  created_at: string
}

export const RECEPCION_FEATURE_PENDING =
  "Función de recepción pendiente: aplica scripts/051-produccion-recepcion.sql en Supabase."

function isMissingTable(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false
  const msg = (err.message || "").toLowerCase()
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    /relation .*(produccion_corridas|produccion_recepciones).* does not exist/.test(msg) ||
    msg.includes("could not find the table")
  )
}

/** Resuelve nombres por id desde una tabla (sin embed: no hay FK declarada). */
async function nombresPorId(
  supabase: NonNullable<ReturnType<typeof createClient>>,
  tabla: string,
  ids: number[],
): Promise<Map<number, string>> {
  const out = new Map<number, string>()
  const unicos = Array.from(new Set(ids.filter((v) => v != null)))
  if (unicos.length === 0) return out
  const { data } = await supabase.from(tabla).select("id, nombre").in("id", unicos)
  for (const r of data || []) out.set(Number(r.id), String(r.nombre || ""))
  return out
}

/** Corridas ejecutadas listas para recibir (estado 'Ejecutada', con buenas>0). */
export async function getCorridasPendientesRecepcion(): Promise<{ data: CorridaPendiente[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }
  const supabase = createClient()
  if (!supabase) return { data: [], error: "Cliente no disponible" }

  // Sin embed `productos (nombre)`: no hay FK declarada y PostgREST falla la
  // consulta entera (PGRST200) -> la lista salia vacia. Se resuelve aparte.
  const { data, error } = await supabase
    .from("produccion_corridas")
    .select("id, orden_id, producto_id, unidades_buenas, costo_unitario_real, created_at")
    .eq("estado", "Ejecutada")
    .gt("unidades_buenas", 0)
    .order("created_at", { ascending: false })
  if (error) {
    if (isMissingTable(error)) return { data: [], error: null }
    return { data: [], error: error.message }
  }
  const filas = data || []
  const nombreProd = await nombresPorId(supabase, "productos", filas.map((c) => Number(c.producto_id)))
  const rows = filas.map((c: Record<string, unknown>) => ({
    corrida_id: Number(c.id),
    orden_id: Number(c.orden_id),
    producto_id: Number(c.producto_id),
    producto_nombre: nombreProd.get(Number(c.producto_id)) ?? "",
    unidades_buenas: Number(c.unidades_buenas || 0),
    costo_unitario_real: Number(c.costo_unitario_real || 0),
    created_at: String(c.created_at || ""),
  }))
  return { data: rows, error: null }
}

/** Una recepción del historial (producto terminado que entró al inventario). */
export interface RecepcionHistorial {
  id: number
  corrida_id: number
  producto_id: number
  producto_nombre: string
  almacen_nombre: string
  localizacion_nombre: string
  cantidad: number
  costo_unitario_real: number
  valor_total: number
  usuario: string | null
  fecha: string
}

/**
 * Historial de recepciones (produccion_recepciones), más reciente arriba.
 * Opcionalmente filtra por rango de fechas (por created_at). Resuelve nombres de
 * producto/almacén/localización con queries aparte (sin embed).
 */
export async function getHistorialRecepciones(opts?: {
  desde?: string
  hasta?: string
  limit?: number
}): Promise<{ data: RecepcionHistorial[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }
  const supabase = createClient()
  if (!supabase) return { data: [], error: "Cliente no disponible" }

  let q = supabase
    .from("produccion_recepciones")
    .select("id, corrida_id, producto_id, almacen_id, localizacion_id, cantidad, costo_unitario_real, usuario, created_at")
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 500)
  if (opts?.desde) q = q.gte("created_at", `${opts.desde}T00:00:00.000Z`)
  if (opts?.hasta) q = q.lte("created_at", `${opts.hasta}T23:59:59.999Z`)

  const { data, error } = await q
  if (error) {
    if (isMissingTable(error)) return { data: [], error: null }
    return { data: [], error: error.message }
  }
  const filas = data || []

  const [nombreProd, nombreAlm, nombreLoc] = await Promise.all([
    nombresPorId(supabase, "productos", filas.map((r) => Number(r.producto_id))),
    nombresPorId(supabase, "almacenes", filas.map((r) => Number(r.almacen_id))),
    nombresPorId(supabase, "localizaciones", filas.map((r) => Number(r.localizacion_id))),
  ])

  const rows: RecepcionHistorial[] = filas.map((r: Record<string, unknown>) => {
    const cantidad = Number(r.cantidad || 0)
    const costo = Number(r.costo_unitario_real || 0)
    return {
      id: Number(r.id),
      corrida_id: Number(r.corrida_id),
      producto_id: Number(r.producto_id),
      producto_nombre: nombreProd.get(Number(r.producto_id)) ?? `Producto #${r.producto_id}`,
      almacen_nombre: nombreAlm.get(Number(r.almacen_id)) ?? "",
      localizacion_nombre: nombreLoc.get(Number(r.localizacion_id)) ?? "",
      cantidad,
      costo_unitario_real: costo,
      valor_total: +(cantidad * costo).toFixed(2),
      usuario: (r.usuario as string) ?? null,
      fecha: String(r.created_at || ""),
    }
  })
  return { data: rows, error: null }
}

/**
 * Recibe una corrida ejecutada al inventario de producto terminado:
 *   - inserta 'Entrada Produccion' en transacciones_inventario;
 *   - suma stock + costo del producto (aplicarEntradaCompra, ponderado);
 *   - registra la recepción y marca la corrida 'Recibida'.
 * Guarda anti doble-recepción (solo si la corrida está 'Ejecutada').
 */
export async function recibirCorrida(
  corridaId: number,
  almacenId: number,
  localizacionId: number,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { success: false, error: "Cliente no disponible" }
  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { success: false, error: SESION_INVALIDA_ERROR }

  const { data: corr, error: cErr } = await supabase
    .from("produccion_corridas")
    .select("id, orden_id, producto_id, unidades_buenas, costo_unitario_real, estado")
    .eq("id", corridaId)
    .single()
  if (cErr) return { success: false, error: isMissingTable(cErr) ? RECEPCION_FEATURE_PENDING : cErr.message }
  if (corr.estado === "Recibida") return { success: false, error: "Esta corrida ya fue recibida." }
  if (corr.estado !== "Ejecutada") return { success: false, error: "La corrida debe estar ejecutada para recibirla." }

  const cantidad = Number(corr.unidades_buenas || 0)
  const costo = Number(corr.costo_unitario_real || 0)
  if (cantidad <= 0) return { success: false, error: "La corrida no tiene unidades buenas para recibir." }

  // 1) Movimiento de inventario del producto terminado.
  const { data: tx, error: txErr } = await supabase
    .from("transacciones_inventario")
    .insert({
      producto_id: corr.producto_id,
      almacen_id: almacenId,
      localizacion_id: localizacionId,
      tipo_movimiento: "Entrada Produccion",
      cantidad,
      costo_o_precio_unitario: costo,
      referencia_id: corridaId,
      fecha: getHondurasNowISO(),
      ...stamp,
    })
    .select("id")
    .single()
  if (txErr) return { success: false, error: txErr.message }

  // 2) Stock + costo del producto (promedio ponderado).
  const ent = await aplicarEntradaCompra(supabase, corr.producto_id, cantidad, costo)
  if (ent.error) return { success: false, error: ent.error }

  // 3) Registrar la recepción.
  const { error: recErr } = await supabase.from("produccion_recepciones").insert({
    corrida_id: corridaId,
    producto_id: corr.producto_id,
    almacen_id: almacenId,
    localizacion_id: localizacionId,
    cantidad,
    costo_unitario_real: costo,
    transaccion_id: tx?.id ?? null,
    // created_at HN-as-UTC para que el historial y el filtro por fecha usen el
    // dia operativo de Honduras (consistente con transacciones_inventario).
    created_at: getHondurasNowISO(),
    ...stamp,
  })
  if (recErr && !isMissingTable(recErr)) return { success: false, error: recErr.message }

  // 4) Corrida -> Recibida. Cierra la orden si ya no quedan corridas ejecutadas.
  await supabase.from("produccion_corridas").update({ estado: "Recibida", updated_at: new Date().toISOString() }).eq("id", corridaId)

  return { success: true, error: null }
}
