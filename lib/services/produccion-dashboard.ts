import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"

// ==================== PRODUCCIÓN · DASHBOARD / OEE ====================
//
// 100% lectura. Deriva KPIs y OEE de `produccion_corridas` (ejecutadas) +
// `produccion_recetas` (estándar u/min). Degrada si el script no se aplicó.
//
// OEE = Disponibilidad × Rendimiento × Calidad:
//   Disponibilidad = tiempo_operativo / tiempo_planificado
//     tiempo_operativo = (hora_fin − hora_inicio en min) − paros
//   Rendimiento = procesadas / (estándar_u/min × tiempo_operativo)  (cap ≤ 1)
//   Calidad = buenas / procesadas
// Las corridas sin el dato requerido se excluyen del componente que no se puede
// calcular (y se cuentan como "incompletas"); Calidad siempre se puede.

export interface OEEResultado {
  disponibilidad: number | null
  rendimiento: number | null
  calidad: number | null
  oee: number | null
  corridasSinTiempo: number   // sin tiempo planificado ni horas → sin Disponibilidad
  corridasSinEstandar: number // sin estándar u/min → sin Rendimiento
}

export interface UnidadDia {
  fecha: string          // YYYY-MM-DD
  buenas: number
  defectuosas: number
}

export interface ProduccionDashboard {
  totalBuenas: number
  totalDefectuosas: number
  totalProcesadas: number
  corridas: number
  costoUnitarioPromedio: number  // ponderado por unidades buenas
  oee: OEEResultado
  porDia: UnidadDia[]
  featurePending: boolean
}

interface CorridaCalc {
  fecha: string
  producto_id: number
  buenas: number
  defectuosas: number
  procesadas: number
  paros_minutos: number
  tiempo_planificado_minutos: number | null
  minutos_reales: number | null   // hora_fin − hora_inicio
  costo_unitario_real: number
  estandar_u_min: number           // de la receta del producto (0 si no hay)
}

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
 * OEE a partir de las corridas del período (función PURA). Cada corrida aporta a
 * los componentes que puede calcular; el promedio se pondera por unidades
 * procesadas. Devuelve null en un componente si ninguna corrida lo pudo aportar.
 */
export function calcularOEE(corridas: CorridaCalc[]): OEEResultado {
  let dispNum = 0, dispDen = 0
  let rendNum = 0, rendDen = 0
  let calNum = 0, calDen = 0
  let sinTiempo = 0, sinEstandar = 0

  for (const c of corridas) {
    // Calidad (siempre que haya procesadas).
    if (c.procesadas > 0) {
      calNum += c.buenas
      calDen += c.procesadas
    }

    // Tiempo operativo = minutos reales (o planificado) − paros.
    const base = c.minutos_reales ?? c.tiempo_planificado_minutos ?? null
    const tiempoOperativo = base != null ? Math.max(0, base - (c.paros_minutos || 0)) : null
    const planificado = c.tiempo_planificado_minutos ?? c.minutos_reales ?? null

    // Disponibilidad = operativo / planificado.
    if (tiempoOperativo != null && planificado != null && planificado > 0) {
      dispNum += tiempoOperativo * c.procesadas
      dispDen += planificado * c.procesadas
    } else {
      sinTiempo++
    }

    // Rendimiento = procesadas / (estándar × operativo).
    if (c.estandar_u_min > 0 && tiempoOperativo != null && tiempoOperativo > 0) {
      const teorico = c.estandar_u_min * tiempoOperativo
      const rend = teorico > 0 ? Math.min(1, c.procesadas / teorico) : 0
      rendNum += rend * c.procesadas
      rendDen += c.procesadas
    } else {
      sinEstandar++
    }
  }

  const disponibilidad = dispDen > 0 ? +(dispNum / dispDen).toFixed(4) : null
  const rendimiento = rendDen > 0 ? +(rendNum / rendDen).toFixed(4) : null
  const calidad = calDen > 0 ? +(calNum / calDen).toFixed(4) : null
  const oee =
    disponibilidad != null && rendimiento != null && calidad != null
      ? +(disponibilidad * rendimiento * calidad).toFixed(4)
      : null

  return { disponibilidad, rendimiento, calidad, oee, corridasSinTiempo: sinTiempo, corridasSinEstandar: sinEstandar }
}

/** Dashboard de producción del rango [desde, hasta] (fechas YYYY-MM-DD). */
export async function getProduccionDashboard(
  desde: string,
  hasta: string,
): Promise<{ data: ProduccionDashboard; error: string | null }> {
  const empty: ProduccionDashboard = {
    totalBuenas: 0, totalDefectuosas: 0, totalProcesadas: 0, corridas: 0,
    costoUnitarioPromedio: 0,
    oee: { disponibilidad: null, rendimiento: null, calidad: null, oee: null, corridasSinTiempo: 0, corridasSinEstandar: 0 },
    porDia: [], featurePending: false,
  }
  if (!isSupabaseConfigured()) return { data: empty, error: null }
  const supabase = createClient()
  if (!supabase) return { data: empty, error: "Cliente no disponible" }

  // Corridas ejecutadas/recibidas en el rango (por created_at, día de negocio).
  const { data: corr, error } = await supabase
    .from("produccion_corridas")
    .select("producto_id, unidades_buenas, unidades_defectuosas, unidades_procesadas, paros_minutos, tiempo_planificado_minutos, hora_inicio, hora_fin, costo_unitario_real, estado, created_at")
    .in("estado", ["Ejecutada", "Recibida"])
    .gte("created_at", `${desde}T00:00:00`)
    .lte("created_at", `${hasta}T23:59:59.999`)
    .order("created_at", { ascending: true })
  if (error) {
    if (isMissingTable(error)) return { data: { ...empty, featurePending: true }, error: null }
    return { data: empty, error: error.message }
  }
  const filas = corr || []
  if (filas.length === 0) return { data: empty, error: null }

  // Estándar u/min por producto (recetas).
  const estandarPorProducto = new Map<number, number>()
  const { data: recs } = await supabase.from("produccion_recetas").select("producto_id, estandar_unidades_por_minuto")
  for (const r of (recs || []) as { producto_id: number; estandar_unidades_por_minuto: number }[]) {
    estandarPorProducto.set(r.producto_id, Number(r.estandar_unidades_por_minuto || 0))
  }

  const corridasCalc: CorridaCalc[] = filas.map((c: Record<string, unknown>) => {
    const ini = c.hora_inicio ? new Date(c.hora_inicio as string).getTime() : null
    const fin = c.hora_fin ? new Date(c.hora_fin as string).getTime() : null
    const minutosReales = ini != null && fin != null && fin > ini ? (fin - ini) / 60000 : null
    return {
      fecha: String(c.created_at || "").split("T")[0],
      producto_id: Number(c.producto_id),
      buenas: Number(c.unidades_buenas || 0),
      defectuosas: Number(c.unidades_defectuosas || 0),
      procesadas: Number(c.unidades_procesadas || 0),
      paros_minutos: Number(c.paros_minutos || 0),
      tiempo_planificado_minutos: c.tiempo_planificado_minutos != null ? Number(c.tiempo_planificado_minutos) : null,
      minutos_reales: minutosReales,
      costo_unitario_real: Number(c.costo_unitario_real || 0),
      estandar_u_min: estandarPorProducto.get(Number(c.producto_id)) || 0,
    }
  })

  const totalBuenas = corridasCalc.reduce((a, c) => a + c.buenas, 0)
  const totalDefectuosas = corridasCalc.reduce((a, c) => a + c.defectuosas, 0)
  const totalProcesadas = corridasCalc.reduce((a, c) => a + c.procesadas, 0)
  const costoPonderadoNum = corridasCalc.reduce((a, c) => a + c.costo_unitario_real * c.buenas, 0)
  const costoUnitarioPromedio = totalBuenas > 0 ? +(costoPonderadoNum / totalBuenas).toFixed(4) : 0

  // Unidades por día.
  const diaMap = new Map<string, UnidadDia>()
  for (const c of corridasCalc) {
    const d = diaMap.get(c.fecha) ?? { fecha: c.fecha, buenas: 0, defectuosas: 0 }
    d.buenas += c.buenas
    d.defectuosas += c.defectuosas
    diaMap.set(c.fecha, d)
  }
  const porDia = Array.from(diaMap.values()).sort((a, b) => a.fecha.localeCompare(b.fecha))

  return {
    data: {
      totalBuenas,
      totalDefectuosas,
      totalProcesadas,
      corridas: corridasCalc.length,
      costoUnitarioPromedio,
      oee: calcularOEE(corridasCalc),
      porDia,
      featurePending: false,
    },
    error: null,
  }
}
