import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { getTenantStamp, isValidStamp, SESION_INVALIDA_ERROR } from "@/lib/services/tenant-stamp"
import { getHondurasNowISO } from "@/lib/utils/honduras-time"
import { getOperaciones } from "@/lib/services/produccion-operaciones"

// ==================== PRODUCCIÓN · FLUJO POR ETAPAS (fase 2) =================
//
// Cada orden recorre las operaciones de la empresa (script 056) etapa por etapa.
// Las etapas de una orden se GENERAN congelando la secuencia vigente y luego
// avanzan: Pendiente → Recibida/En Proceso → Entregada. Degrada si el script
// 057 no se aplicó.

export type EstadoEtapa = "Pendiente" | "Recibida" | "En Proceso" | "Entregada"

export interface EtapaOrden {
  id: number
  orden_id: number
  operacion_id: number | null
  nombre: string
  orden_secuencia: number
  estado: EstadoEtapa
  responsable: string | null
  fecha_recepcion: string | null
  fecha_entrega: string | null
  cantidad_procesada: number | null
  notas: string | null
}

/** Una orden con su recorrido de etapas (para el tablero de flujo). */
export interface OrdenFlujo {
  orden_id: number
  producto_nombre: string
  cantidad_objetivo: number
  fecha_objetivo: string | null
  estado_orden: string
  etapas: EtapaOrden[]
  /** Etapa "actual": la primera no entregada (o null si todo entregado). */
  etapaActual: EtapaOrden | null
  /** True si todas las etapas están entregadas. */
  completado: boolean
}

export const FLUJO_FEATURE_PENDING =
  "Función de flujo por etapas pendiente: aplica scripts/057-produccion-orden-etapas.sql en Supabase."

function isMissingTable(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false
  const msg = (err.message || "").toLowerCase()
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    /relation .*produccion_orden_etapas.* does not exist/.test(msg) ||
    msg.includes("could not find the table")
  )
}

function mapEtapa(e: Record<string, unknown>): EtapaOrden {
  return {
    id: Number(e.id),
    orden_id: Number(e.orden_id),
    operacion_id: e.operacion_id != null ? Number(e.operacion_id) : null,
    nombre: String(e.nombre || ""),
    orden_secuencia: Number(e.orden_secuencia || 0),
    estado: String(e.estado || "Pendiente") as EstadoEtapa,
    responsable: (e.responsable as string) ?? null,
    fecha_recepcion: (e.fecha_recepcion as string) ?? null,
    fecha_entrega: (e.fecha_entrega as string) ?? null,
    cantidad_procesada: e.cantidad_procesada != null ? Number(e.cantidad_procesada) : null,
    notas: (e.notas as string) ?? null,
  }
}

/** Etapas de una orden, en secuencia. */
export async function getEtapasOrden(ordenId: number): Promise<{ data: EtapaOrden[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }
  const supabase = createClient()
  if (!supabase) return { data: [], error: "Cliente no disponible" }
  const { data, error } = await supabase
    .from("produccion_orden_etapas")
    .select("id, orden_id, operacion_id, nombre, orden_secuencia, estado, responsable, fecha_recepcion, fecha_entrega, cantidad_procesada, notas")
    .eq("orden_id", ordenId)
    .order("orden_secuencia", { ascending: true })
  if (error) {
    if (isMissingTable(error)) return { data: [], error: null }
    return { data: [], error: error.message }
  }
  return { data: (data || []).map((e) => mapEtapa(e as Record<string, unknown>)), error: null }
}

/**
 * Genera las etapas de una orden congelando la secuencia de operaciones ACTIVAS
 * de la empresa. Idempotente: si la orden ya tiene etapas, no hace nada. La
 * primera etapa queda 'Recibida' (lista para trabajar); el resto 'Pendiente'.
 */
export async function generarEtapasOrden(
  ordenId: number,
): Promise<{ data: { creadas: number } | null; error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { data: null, error: "Cliente no disponible" }
  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { data: null, error: SESION_INVALIDA_ERROR }

  // ¿Ya tiene etapas?
  const { data: existentes, error: exErr } = await getEtapasOrden(ordenId)
  if (exErr) return { data: null, error: exErr }
  if (existentes.length > 0) return { data: { creadas: 0 }, error: null }

  // Secuencia vigente (operaciones activas).
  const { data: ops, error: opErr } = await getOperaciones({ soloActivas: true })
  if (opErr) return { data: null, error: opErr }
  if (ops.length === 0) return { data: null, error: "No hay operaciones definidas. Crea la secuencia en Operaciones de Producción." }

  const nowHN = getHondurasNowISO()
  const filas = ops.map((op, i) => ({
    orden_id: ordenId,
    operacion_id: op.id,
    nombre: op.nombre,
    orden_secuencia: i + 1,
    // La primera etapa arranca Recibida (lista para trabajar); el resto Pendiente.
    estado: i === 0 ? "Recibida" : "Pendiente",
    fecha_recepcion: i === 0 ? nowHN : null,
    ...stamp,
  }))
  const { error } = await supabase.from("produccion_orden_etapas").insert(filas)
  if (error) {
    if (isMissingTable(error)) return { data: null, error: FLUJO_FEATURE_PENDING }
    return { data: null, error: error.message }
  }
  return { data: { creadas: filas.length }, error: null }
}

/**
 * Tablero de flujo: órdenes que ya tienen etapas generadas, con su recorrido y
 * su etapa actual. Resuelve el nombre del producto sin embed (no hay FK).
 */
export async function getFlujoOrdenes(): Promise<{ data: OrdenFlujo[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }
  const supabase = createClient()
  if (!supabase) return { data: [], error: "Cliente no disponible" }

  const { data: etapasRaw, error } = await supabase
    .from("produccion_orden_etapas")
    .select("id, orden_id, operacion_id, nombre, orden_secuencia, estado, responsable, fecha_recepcion, fecha_entrega, cantidad_procesada, notas")
    .order("orden_id", { ascending: false })
    .order("orden_secuencia", { ascending: true })
  if (error) {
    if (isMissingTable(error)) return { data: [], error: null }
    return { data: [], error: error.message }
  }
  const etapas = (etapasRaw || []).map((e) => mapEtapa(e as Record<string, unknown>))
  if (etapas.length === 0) return { data: [], error: null }

  // Agrupa por orden.
  const porOrden = new Map<number, EtapaOrden[]>()
  for (const e of etapas) {
    const arr = porOrden.get(e.orden_id) || []
    arr.push(e)
    porOrden.set(e.orden_id, arr)
  }
  const ordenIds = Array.from(porOrden.keys())

  // Datos de las órdenes (producto, cantidad, estado) sin embed.
  const { data: ordenesRaw } = await supabase
    .from("produccion_ordenes")
    .select("id, producto_id, cantidad_objetivo, fecha_objetivo, estado")
    .in("id", ordenIds)
  const ordenById = new Map<number, Record<string, unknown>>()
  for (const o of ordenesRaw || []) ordenById.set(Number(o.id), o)

  const productoIds = Array.from(new Set((ordenesRaw || []).map((o) => Number(o.producto_id))))
  const nombreProd = new Map<number, string>()
  if (productoIds.length > 0) {
    const { data: prods } = await supabase.from("productos").select("id, nombre").in("id", productoIds)
    for (const p of prods || []) nombreProd.set(Number(p.id), String(p.nombre || ""))
  }

  const filas: OrdenFlujo[] = ordenIds.map((oid) => {
    const ets = (porOrden.get(oid) || []).sort((a, b) => a.orden_secuencia - b.orden_secuencia)
    const o = ordenById.get(oid)
    const etapaActual = ets.find((e) => e.estado !== "Entregada") ?? null
    return {
      orden_id: oid,
      producto_nombre: o ? (nombreProd.get(Number(o.producto_id)) || `Producto #${o.producto_id}`) : `Orden #${oid}`,
      cantidad_objetivo: o ? Number(o.cantidad_objetivo || 0) : 0,
      fecha_objetivo: o ? ((o.fecha_objetivo as string) || null) : null,
      estado_orden: o ? String(o.estado || "") : "",
      etapas: ets,
      etapaActual,
      completado: etapaActual == null,
    }
  })
  // Órdenes con trabajo pendiente primero, luego completadas.
  filas.sort((a, b) => Number(a.completado) - Number(b.completado) || b.orden_id - a.orden_id)
  return { data: filas, error: null }
}

// ==================== TRANSICIONES DE ETAPA ====================

async function actualizarEtapa(id: number, patch: Record<string, unknown>): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }
  const { error } = await supabase
    .from("produccion_orden_etapas")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) {
    if (isMissingTable(error)) return { error: FLUJO_FEATURE_PENDING }
    return { error: error.message }
  }
  return { error: null }
}

/** Marca una etapa como Recibida (llegó el trabajo a esta operación). */
export async function recibirEtapa(id: number, responsable?: string | null): Promise<{ error: string | null }> {
  return actualizarEtapa(id, {
    estado: "Recibida",
    responsable: (responsable || "").trim() || null,
    fecha_recepcion: getHondurasNowISO(),
  })
}

/** Marca una etapa En Proceso (se está trabajando). */
export async function iniciarEtapa(id: number, responsable?: string | null): Promise<{ error: string | null }> {
  const patch: Record<string, unknown> = { estado: "En Proceso" }
  const resp = (responsable || "").trim()
  if (resp) patch.responsable = resp
  return actualizarEtapa(id, patch)
}

/**
 * Entrega una etapa (queda 'Entregada') y RECIBE automáticamente la siguiente
 * etapa Pendiente de la misma orden. Registra cantidad procesada y notas.
 */
export async function entregarEtapa(
  id: number,
  input: { cantidad_procesada?: number | null; notas?: string | null; responsable?: string | null },
): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }

  // Datos de la etapa (para saber a qué orden pertenece y su posición).
  const { data: etapa, error: eErr } = await supabase
    .from("produccion_orden_etapas")
    .select("id, orden_id, orden_secuencia")
    .eq("id", id)
    .maybeSingle()
  if (eErr) return { error: isMissingTable(eErr) ? FLUJO_FEATURE_PENDING : eErr.message }
  if (!etapa) return { error: "Etapa no encontrada" }

  const nowHN = getHondurasNowISO()
  const patch: Record<string, unknown> = { estado: "Entregada", fecha_entrega: nowHN }
  if (input.cantidad_procesada != null) patch.cantidad_procesada = Number(input.cantidad_procesada)
  if (input.notas !== undefined) patch.notas = (input.notas || "").trim() || null
  const resp = (input.responsable || "").trim()
  if (resp) patch.responsable = resp
  const up = await actualizarEtapa(id, patch)
  if (up.error) return up

  // Recibe la siguiente etapa (la de menor secuencia > esta que siga Pendiente).
  const { data: siguientes } = await supabase
    .from("produccion_orden_etapas")
    .select("id, orden_secuencia, estado")
    .eq("orden_id", etapa.orden_id)
    .gt("orden_secuencia", etapa.orden_secuencia)
    .order("orden_secuencia", { ascending: true })
    .limit(1)
  const sig = (siguientes || [])[0]
  if (sig && sig.estado === "Pendiente") {
    await supabase
      .from("produccion_orden_etapas")
      .update({ estado: "Recibida", fecha_recepcion: nowHN, updated_at: new Date().toISOString() })
      .eq("id", sig.id)
  }
  return { error: null }
}
