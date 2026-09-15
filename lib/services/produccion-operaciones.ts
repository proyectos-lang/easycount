import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { getTenantStamp, isValidStamp, SESION_INVALIDA_ERROR } from "@/lib/services/tenant-stamp"

// ==================== PRODUCCIÓN · OPERACIONES (etapas configurables) =======
//
// Catálogo de operaciones/etapas de una empresa (script 056). La empresa define
// su propia SECUENCIA (Operación 1 → 2 → 3 …). Más adelante (fase 2) cada orden
// de producción recorrerá estas operaciones etapa por etapa. Degrada si el
// script 056 no se aplicó.

export interface OperacionProduccion {
  id: number
  nombre: string
  orden_secuencia: number
  descripcion: string | null
  activo: boolean
}

export const OPERACIONES_FEATURE_PENDING =
  "Función de operaciones pendiente: aplica scripts/056-produccion-operaciones.sql en Supabase."

function isMissingTable(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false
  const msg = (err.message || "").toLowerCase()
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    /relation .*produccion_operaciones.* does not exist/.test(msg) ||
    msg.includes("could not find the table")
  )
}

/** Lista las operaciones de la empresa, ordenadas por su secuencia. */
export async function getOperaciones(
  opts?: { soloActivas?: boolean },
): Promise<{ data: OperacionProduccion[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }
  const supabase = createClient()
  if (!supabase) return { data: [], error: "Cliente no disponible" }

  let q = supabase
    .from("produccion_operaciones")
    .select("id, nombre, orden_secuencia, descripcion, activo")
    .order("orden_secuencia", { ascending: true })
    .order("id", { ascending: true })
  if (opts?.soloActivas) q = q.eq("activo", true)

  const { data, error } = await q
  if (error) {
    if (isMissingTable(error)) return { data: [], error: null }
    return { data: [], error: error.message }
  }
  const rows = (data || []).map((o: Record<string, unknown>) => ({
    id: Number(o.id),
    nombre: String(o.nombre || ""),
    orden_secuencia: Number(o.orden_secuencia || 0),
    descripcion: (o.descripcion as string) ?? null,
    activo: o.activo !== false,
  }))
  return { data: rows, error: null }
}

/** Crea una operación al FINAL de la secuencia (última posición + 1). */
export async function crearOperacion(input: {
  nombre: string
  descripcion?: string | null
}): Promise<{ data: { id: number } | null; error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { data: null, error: "Cliente no disponible" }
  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { data: null, error: SESION_INVALIDA_ERROR }
  if (!input.nombre.trim()) return { data: null, error: "El nombre es obligatorio" }

  // Siguiente posición = (máxima secuencia actual) + 1.
  const { data: existentes, error: eErr } = await getOperaciones()
  if (eErr) return { data: null, error: eErr }
  const siguiente = existentes.reduce((max, o) => Math.max(max, o.orden_secuencia), 0) + 1

  const { data, error } = await supabase
    .from("produccion_operaciones")
    .insert({
      nombre: input.nombre.trim(),
      descripcion: (input.descripcion || "").trim() || null,
      orden_secuencia: siguiente,
      activo: true,
      ...stamp,
    })
    .select("id")
    .single()
  if (error) {
    if (isMissingTable(error)) return { data: null, error: OPERACIONES_FEATURE_PENDING }
    return { data: null, error: error.message }
  }
  return { data: { id: data.id as number }, error: null }
}

/** Actualiza nombre / descripción / activo de una operación. */
export async function actualizarOperacion(
  id: number,
  input: { nombre?: string; descripcion?: string | null; activo?: boolean },
): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.nombre !== undefined) {
    if (!input.nombre.trim()) return { error: "El nombre es obligatorio" }
    patch.nombre = input.nombre.trim()
  }
  if (input.descripcion !== undefined) patch.descripcion = (input.descripcion || "").trim() || null
  if (input.activo !== undefined) patch.activo = input.activo
  const { error } = await supabase.from("produccion_operaciones").update(patch).eq("id", id)
  if (error) {
    if (isMissingTable(error)) return { error: OPERACIONES_FEATURE_PENDING }
    return { error: error.message }
  }
  return { error: null }
}

/** Elimina una operación del catálogo. */
export async function eliminarOperacion(id: number): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }
  const { error } = await supabase.from("produccion_operaciones").delete().eq("id", id)
  if (error) {
    if (isMissingTable(error)) return { error: OPERACIONES_FEATURE_PENDING }
    return { error: error.message }
  }
  return { error: null }
}

/**
 * Reordena la secuencia según el arreglo de ids recibido (posición 1..N según
 * su índice). Persiste `orden_secuencia` = índice+1 para cada uno. Sirve para
 * mover arriba/abajo desde la UI (que envía la lista ya reordenada).
 */
export async function reordenarOperaciones(
  idsEnOrden: number[],
): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }
  // Se actualiza una por una (son pocas operaciones por empresa).
  for (let i = 0; i < idsEnOrden.length; i++) {
    const { error } = await supabase
      .from("produccion_operaciones")
      .update({ orden_secuencia: i + 1, updated_at: new Date().toISOString() })
      .eq("id", idsEnOrden[i])
    if (error) {
      if (isMissingTable(error)) return { error: OPERACIONES_FEATURE_PENDING }
      return { error: error.message }
    }
  }
  return { error: null }
}
