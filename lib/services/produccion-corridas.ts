import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { getTenantStamp, isValidStamp, SESION_INVALIDA_ERROR } from "@/lib/services/tenant-stamp"
import { getHondurasNowISO } from "@/lib/utils/honduras-time"
import { getHondurasDayRange } from "@/lib/utils/honduras-time"
import { matAjustarStock } from "@/lib/services/produccion-materiales"

// ==================== PRODUCCIÓN · CONTROL DE PISO (corridas) ====================
//
// Una corrida (turno/lote) por orden; varias por orden. Al EJECUTARLA se
// descuenta material según la receta × unidades PROCESADAS (buenas+defectuosas)
// y se snapshotea el costo real. El consumo baja el stock GLOBAL del material
// (movimiento 'Consumo Produccion' sin localización). Se BLOQUEA si falta stock
// de algún material. Idempotente: una corrida 'Ejecutada' no se re-ejecuta.
//
// Costo real: costo_materiales = Σ(consumo × costo_promedio material);
// costo_factores = (energia+mano_obra+overhead) × procesadas;
// costo_unitario_real = (materiales + factores) / unidades_buenas.

export type EstadoCorrida = "Registrada" | "Ejecutada" | "Recibida" | "Cancelada"

export interface DefectoInput { motivo: string; cantidad: number }

export interface Corrida {
  id: number
  orden_id: number
  producto_id: number
  hora_inicio: string | null
  hora_fin: string | null
  unidades_buenas: number
  unidades_defectuosas: number
  unidades_procesadas: number
  paros_minutos: number
  tiempo_planificado_minutos: number | null
  novedades: string | null
  costo_materiales_total: number
  costo_factores_total: number
  costo_unitario_real: number
  estado: EstadoCorrida
  created_at: string
}

export const CORRIDAS_FEATURE_PENDING =
  "Función de control de piso pendiente: aplica scripts/049-produccion-corridas.sql en Supabase."

function isMissingTable(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false
  const msg = (err.message || "").toLowerCase()
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    /relation .*produccion_corridas.* does not exist/.test(msg) ||
    msg.includes("could not find the table")
  )
}

/**
 * Consumo y costo de una corrida (función PURA).
 * @param lineas líneas de la receta: consumo por unidad + costo del material.
 * @param factores costos por unidad (energía/mano de obra/overhead).
 */
export function calcularConsumoYCosto(
  lineas: { material_id: number; consumo_por_unidad: number; costo_promedio: number }[],
  factores: { costo_energia: number; costo_mano_obra: number; costo_overhead: number },
  unidadesProcesadas: number,
  unidadesBuenas: number,
): {
  consumos: { material_id: number; cantidad_consumida: number; costo_unitario: number; costo_total: number }[]
  costoMateriales: number
  costoFactores: number
  costoUnitarioReal: number
} {
  const consumos = lineas.map((l) => {
    const cantidad = +(l.consumo_por_unidad * unidadesProcesadas).toFixed(6)
    const costoTotal = +(cantidad * l.costo_promedio).toFixed(4)
    return { material_id: l.material_id, cantidad_consumida: cantidad, costo_unitario: +l.costo_promedio.toFixed(4), costo_total: costoTotal }
  })
  const costoMateriales = +consumos.reduce((a, c) => a + c.costo_total, 0).toFixed(4)
  const factoresPorUnidad =
    (Number(factores.costo_energia) || 0) + (Number(factores.costo_mano_obra) || 0) + (Number(factores.costo_overhead) || 0)
  const costoFactores = +(factoresPorUnidad * unidadesProcesadas).toFixed(4)
  const costoUnitarioReal = unidadesBuenas > 0 ? +((costoMateriales + costoFactores) / unidadesBuenas).toFixed(4) : 0
  return { consumos, costoMateriales, costoFactores, costoUnitarioReal }
}

export async function getCorridas(ordenId: number): Promise<{ data: Corrida[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }
  const supabase = createClient()
  if (!supabase) return { data: [], error: "Cliente no disponible" }
  const { data, error } = await supabase
    .from("produccion_corridas")
    .select("*")
    .eq("orden_id", ordenId)
    .order("created_at", { ascending: false })
  if (error) {
    if (isMissingTable(error)) return { data: [], error: null }
    return { data: [], error: error.message }
  }
  return { data: (data || []) as Corrida[], error: null }
}

/** Crea una corrida en estado 'Registrada' (aún NO descuenta material). */
export async function createCorrida(input: {
  orden_id: number
  producto_id: number
  hora_inicio?: string | null
  hora_fin?: string | null
  unidades_buenas: number
  unidades_defectuosas: number
  paros_minutos: number
  tiempo_planificado_minutos?: number | null
  novedades?: string | null
  defectos?: DefectoInput[]
}): Promise<{ data: { id: number } | null; error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { data: null, error: "Cliente no disponible" }
  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { data: null, error: SESION_INVALIDA_ERROR }

  const buenas = Math.max(0, Number(input.unidades_buenas) || 0)
  const defect = Math.max(0, Number(input.unidades_defectuosas) || 0)
  const procesadas = +(buenas + defect).toFixed(4)

  const { data, error } = await supabase
    .from("produccion_corridas")
    .insert({
      orden_id: input.orden_id,
      producto_id: input.producto_id,
      hora_inicio: input.hora_inicio || null,
      hora_fin: input.hora_fin || null,
      unidades_buenas: buenas,
      unidades_defectuosas: defect,
      unidades_procesadas: procesadas,
      paros_minutos: Number(input.paros_minutos) || 0,
      tiempo_planificado_minutos: input.tiempo_planificado_minutos ?? null,
      novedades: (input.novedades || "").trim() || null,
      estado: "Registrada",
      // created_at en hora de Honduras (HN-as-UTC): asi las vistas por dia
      // (getActividadDia / getConsolidadoRango, que usan getHondurasDayRange)
      // agrupan la corrida en el dia operativo correcto, sin desfase de 6h.
      created_at: getHondurasNowISO(),
      ...stamp,
    })
    .select("id")
    .single()
  if (error || !data?.id) {
    if (isMissingTable(error)) return { data: null, error: CORRIDAS_FEATURE_PENDING }
    return { data: null, error: error?.message || "No se pudo registrar la corrida" }
  }

  // Motivos de defecto (best-effort).
  const defs = (input.defectos || []).filter((d) => d.motivo.trim() && Number(d.cantidad) > 0)
  if (defs.length > 0) {
    await supabase.from("produccion_corrida_defectos").insert(
      defs.map((d) => ({ corrida_id: data.id, motivo: d.motivo.trim(), cantidad: Number(d.cantidad), ...stamp })),
    )
  }
  return { data: { id: data.id as number }, error: null }
}

/**
 * Ejecuta la corrida: descuenta material según la receta congelada de la orden ×
 * unidades procesadas. VALIDA que TODOS los materiales alcancen (bloquea si no).
 * Escribe la bitácora de consumos, los movimientos de material y snapshotea el
 * costo. Idempotente: solo si la corrida está 'Registrada'.
 */
export async function ejecutarCorrida(corridaId: number): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { success: false, error: "Cliente no disponible" }
  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { success: false, error: SESION_INVALIDA_ERROR }

  // 1) Corrida + orden (para la receta congelada y las unidades).
  const { data: corr, error: cErr } = await supabase
    .from("produccion_corridas")
    .select("id, orden_id, estado, unidades_buenas, unidades_procesadas")
    .eq("id", corridaId)
    .single()
  if (cErr) return { success: false, error: isMissingTable(cErr) ? CORRIDAS_FEATURE_PENDING : cErr.message }
  if (corr.estado !== "Registrada") return { success: false, error: "La corrida ya fue ejecutada o no está en estado válido." }

  const { data: orden, error: oErr } = await supabase
    .from("produccion_ordenes")
    .select("id, receta_id")
    .eq("id", corr.orden_id)
    .single()
  if (oErr) return { success: false, error: oErr.message }
  if (!orden.receta_id) return { success: false, error: "La orden no tiene receta; define la receta del producto antes de ejecutar." }

  // 2) Receta: factores + líneas de material con su costo vigente.
  const { data: receta, error: rErr } = await supabase
    .from("produccion_recetas")
    .select("id, costo_energia, costo_mano_obra, costo_overhead")
    .eq("id", orden.receta_id)
    .single()
  if (rErr) return { success: false, error: rErr.message }

  const { data: lins, error: lErr } = await supabase
    .from("produccion_receta_materiales")
    .select("material_id, consumo_por_unidad, materiales (nombre, stock_total, costo_promedio)")
    .eq("receta_id", orden.receta_id)
  if (lErr) return { success: false, error: lErr.message }
  if (!lins || lins.length === 0) return { success: false, error: "La receta no tiene materiales." }

  const procesadas = Number(corr.unidades_procesadas) || 0
  const buenas = Number(corr.unidades_buenas) || 0

  const lineas = (lins as Record<string, unknown>[]).map((l) => {
    const m = l.materiales as { nombre?: string; stock_total?: number; costo_promedio?: number } | null
    return {
      material_id: Number(l.material_id),
      material_nombre: m?.nombre || "",
      consumo_por_unidad: Number(l.consumo_por_unidad || 0),
      stock_total: Number(m?.stock_total || 0),
      costo_promedio: Number(m?.costo_promedio || 0),
    }
  })

  // 3) VALIDAR stock de TODOS los materiales (bloquear si falta).
  const faltantes = lineas
    .map((l) => ({ ...l, requerido: +(l.consumo_por_unidad * procesadas).toFixed(6) }))
    .filter((l) => l.requerido > l.stock_total + 0.000001)
  if (faltantes.length > 0) {
    const detalle = faltantes.map((f) => `${f.material_nombre} (falta ${(f.requerido - f.stock_total).toFixed(2)})`).join(", ")
    return { success: false, error: `Stock de material insuficiente para: ${detalle}.` }
  }

  // 4) Calcular consumos y costos (función pura).
  const { consumos, costoMateriales, costoFactores, costoUnitarioReal } = calcularConsumoYCosto(
    lineas,
    { costo_energia: Number(receta.costo_energia || 0), costo_mano_obra: Number(receta.costo_mano_obra || 0), costo_overhead: Number(receta.costo_overhead || 0) },
    procesadas,
    buenas,
  )

  // 5) Descontar cada material (stock global) + movimiento + bitácora.
  //    Si algo falla a mitad, compensamos lo ya descontado.
  const fecha = getHondurasNowISO()
  const aplicados: { material_id: number; cantidad: number }[] = []
  for (const c of consumos) {
    if (c.cantidad_consumida <= 0) continue
    const aj = await matAjustarStock(supabase, c.material_id, -c.cantidad_consumida)
    if (aj.error) {
      // Compensa lo ya aplicado.
      for (const a of aplicados) await matAjustarStock(supabase, a.material_id, a.cantidad)
      return { success: false, error: `No se pudo descontar material: ${aj.error}` }
    }
    aplicados.push({ material_id: c.material_id, cantidad: c.cantidad_consumida })

    await supabase.from("materiales_movimientos").insert({
      material_id: c.material_id,
      almacen_id: null,
      localizacion_id: null,
      tipo_movimiento: "Consumo Produccion",
      cantidad: -c.cantidad_consumida,
      costo_unitario: c.costo_unitario,
      referencia_id: corridaId,
      fecha,
      ...stamp,
    })
    await supabase.from("produccion_corrida_consumos").insert({
      corrida_id: corridaId,
      material_id: c.material_id,
      cantidad_consumida: c.cantidad_consumida,
      costo_unitario: c.costo_unitario,
      costo_total: c.costo_total,
      ...stamp,
    })
  }

  // 6) Snapshot de costos + estado Ejecutada.
  await supabase
    .from("produccion_corridas")
    .update({
      costo_materiales_total: costoMateriales,
      costo_factores_total: costoFactores,
      costo_unitario_real: costoUnitarioReal,
      estado: "Ejecutada",
      updated_at: new Date().toISOString(),
    })
    .eq("id", corridaId)

  // La orden pasa a 'En Proceso' si estaba Abierta.
  await supabase.from("produccion_ordenes").update({ estado: "En Proceso", updated_at: new Date().toISOString() })
    .eq("id", corr.orden_id).eq("estado", "Abierta")

  return { success: true, error: null }
}

// ==================== VISTAS POR FECHA (en vivo / consolidado) ====================

/** Corrida enriquecida con el nombre del producto/orden (para las vistas por día). */
export interface CorridaConProducto extends Corrida {
  producto_nombre: string
}

/** Un paro registrado (motivo de defecto o novedad) para el detalle del día. */
export interface ParoDia {
  corrida_id: number
  producto_nombre: string
  motivo: string
  cantidad: number
}

/** Totales agregados de un día (o del rango, por fila). */
export interface IndicadoresProduccion {
  corridas: number
  ordenes: number
  buenas: number
  defectuosas: number
  procesadas: number
  paros_minutos: number
  tiempo_planificado_minutos: number
  /** Calidad = buenas / procesadas (0..100), null si no hubo procesadas. */
  calidad_pct: number | null
  /** Productos trabajados (nombres distintos). */
  productos: string[]
}

export interface ActividadDia {
  fecha: string
  corridas: CorridaConProducto[]
  paros: ParoDia[]
  indicadores: IndicadoresProduccion
}

export interface DiaConsolidado extends IndicadoresProduccion {
  fecha: string
}

/** Suma unas corridas en un objeto de indicadores. */
function agregarIndicadores(corridas: CorridaConProducto[]): IndicadoresProduccion {
  const productos = new Set<string>()
  const ordenes = new Set<number>()
  let buenas = 0, defectuosas = 0, procesadas = 0, paros = 0, planificado = 0
  for (const c of corridas) {
    buenas += Number(c.unidades_buenas) || 0
    defectuosas += Number(c.unidades_defectuosas) || 0
    procesadas += Number(c.unidades_procesadas) || 0
    paros += Number(c.paros_minutos) || 0
    planificado += Number(c.tiempo_planificado_minutos) || 0
    ordenes.add(c.orden_id)
    if (c.producto_nombre) productos.add(c.producto_nombre)
  }
  return {
    corridas: corridas.length,
    ordenes: ordenes.size,
    buenas: +buenas.toFixed(4),
    defectuosas: +defectuosas.toFixed(4),
    procesadas: +procesadas.toFixed(4),
    paros_minutos: +paros.toFixed(2),
    tiempo_planificado_minutos: +planificado.toFixed(2),
    calidad_pct: procesadas > 0 ? +((buenas / procesadas) * 100).toFixed(1) : null,
    productos: Array.from(productos).sort((a, b) => a.localeCompare(b, "es")),
  }
}

/** Trae corridas del tenant en un rango [start, end) por `created_at`, con el
 *  nombre de producto resuelto aparte (sin embed: no hay FK declarada). */
async function corridasEnRango(
  supabase: NonNullable<ReturnType<typeof createClient>>,
  start: string,
  end: string,
): Promise<{ data: CorridaConProducto[]; error: string | null }> {
  const { data, error } = await supabase
    .from("produccion_corridas")
    .select("*")
    .gte("created_at", start)
    .lt("created_at", end)
    .order("created_at", { ascending: false })
  if (error) {
    if (isMissingTable(error)) return { data: [], error: null }
    return { data: [], error: error.message }
  }
  const filas = (data || []) as Corrida[]
  // Nombres de producto por id.
  const ids = Array.from(new Set(filas.map((c) => c.producto_id).filter((v) => v != null)))
  const nombre = new Map<number, string>()
  if (ids.length > 0) {
    const { data: prods } = await supabase.from("productos").select("id, nombre").in("id", ids)
    for (const p of prods || []) nombre.set(Number(p.id), String(p.nombre || ""))
  }
  return { data: filas.map((c) => ({ ...c, producto_nombre: nombre.get(c.producto_id) || `Producto #${c.producto_id}` })), error: null }
}

/**
 * Actividad de un día: corridas registradas ese día (por `created_at`, HN-day),
 * sus paros (motivos de defecto de esas corridas) e indicadores agregados.
 */
export async function getActividadDia(fecha: string): Promise<{ data: ActividadDia; error: string | null }> {
  const vacio: ActividadDia = { fecha, corridas: [], paros: [], indicadores: agregarIndicadores([]) }
  if (!isSupabaseConfigured()) return { data: vacio, error: null }
  const supabase = createClient()
  if (!supabase) return { data: vacio, error: "Cliente no disponible" }

  const { start, end } = getHondurasDayRange(fecha)
  const { data: corridas, error } = await corridasEnRango(supabase, start, end)
  if (error) return { data: vacio, error }

  // Paros = motivos de defecto de esas corridas (por qué se registraron paros/defectos).
  const paros: ParoDia[] = []
  const corridaIds = corridas.map((c) => c.id)
  if (corridaIds.length > 0) {
    const { data: defs } = await supabase
      .from("produccion_corrida_defectos")
      .select("corrida_id, motivo, cantidad")
      .in("corrida_id", corridaIds)
    const nombrePorCorrida = new Map(corridas.map((c) => [c.id, c.producto_nombre]))
    for (const d of defs || []) {
      paros.push({
        corrida_id: Number(d.corrida_id),
        producto_nombre: nombrePorCorrida.get(Number(d.corrida_id)) || "",
        motivo: String(d.motivo || ""),
        cantidad: Number(d.cantidad) || 0,
      })
    }
  }

  return { data: { fecha, corridas, paros, indicadores: agregarIndicadores(corridas) }, error: null }
}

/**
 * Consolidado por rango: una fila por DÍA (con corridas) entre `desde` y `hasta`
 * inclusive, con sus indicadores. Días sin actividad no aparecen.
 */
export async function getConsolidadoRango(
  desde: string,
  hasta: string,
): Promise<{ data: DiaConsolidado[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }
  const supabase = createClient()
  if (!supabase) return { data: [], error: "Cliente no disponible" }

  const { start } = getHondurasDayRange(desde)
  const { end } = getHondurasDayRange(hasta) // end = inicio del día siguiente a `hasta`
  const { data: corridas, error } = await corridasEnRango(supabase, start, end)
  if (error) return { data: [], error }

  // Agrupa por día HN (primeros 10 chars de created_at, que ya viene HN-as-UTC).
  const porDia = new Map<string, CorridaConProducto[]>()
  for (const c of corridas) {
    const dia = String(c.created_at || "").slice(0, 10)
    if (!dia) continue
    const arr = porDia.get(dia) || []
    arr.push(c)
    porDia.set(dia, arr)
  }
  const filas: DiaConsolidado[] = Array.from(porDia.entries())
    .map(([fecha, cs]) => ({ fecha, ...agregarIndicadores(cs) }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha)) // más reciente arriba
  return { data: filas, error: null }
}
