/**
 * Liquidación de socios del portal /gestion. PURO (sin BD), con tests en
 * tests/gestion-socios.test.ts.
 *
 * Por mes:
 *   utilidad      = ingresos − TODOS los gastos (los de EasyCount y los que
 *                   asumieron socios)
 *   participación = % del socio × utilidad   (negativa si hubo pérdida)
 *   reembolso     = gastos que pagó ese socio de su bolsa
 *   a liquidar    = participación + reembolso
 *   EasyCount     = (100 − Σ%) × utilidad  — lo que no reparte entre socios
 *
 * Un gasto asumido por un socio sale del pool global (baja la utilidad, y con
 * ella lo de EasyCount y lo de los otros socios) y se le suma completo a él.
 */
import { mesRelativo } from "./reglas"

export interface SocioCalc { id: number; nombre: string; porcentaje: number; activo: boolean }
export interface GastoSocioCalc { fecha: string; monto: number; socio_id: number | null }
export interface IngresoCalc { fecha: string; monto: number }
export interface LiquidacionPagoCalc { socio_id: number; fecha: string; monto: number }

const r2 = (n: number) => Math.round(n * 100) / 100
const clave = (anio: number, mes: number) => `${anio}-${String(mes).padStart(2, "0")}`

/** Suma de % de los socios activos y lo que queda para EasyCount. */
export function repartoPorcentajes(socios: SocioCalc[]): { totalSocios: number; easycount: number; valido: boolean } {
  const total = r2(socios.filter((s) => s.activo).reduce((a, s) => a + (Number(s.porcentaje) || 0), 0))
  return { totalSocios: total, easycount: r2(100 - total), valido: total <= 100 }
}

export interface LiquidacionSocioMes {
  socio_id: number
  nombre: string
  porcentaje: number
  participacion: number
  reembolso: number
  total: number
}

export interface LiquidacionMes {
  mes: string
  ingresos: number
  gastosEasycount: number
  gastosSocios: number
  utilidad: number
  socios: LiquidacionSocioMes[]
  easycountPorcentaje: number
  easycountParticipacion: number
}

/** Liquidación de un mes. Solo socios activos reciben participación; un socio inactivo igual recupera lo que pagó. */
export function liquidacionMes(args: { anio: number; mes: number; ingresos: IngresoCalc[]; gastos: GastoSocioCalc[]; socios: SocioCalc[] }): LiquidacionMes {
  const { anio, mes, socios } = args
  const k = clave(anio, mes)
  const ingresos = r2(args.ingresos.filter((p) => p.fecha.startsWith(k)).reduce((a, p) => a + Number(p.monto || 0), 0))
  const gastosMes = args.gastos.filter((g) => g.fecha.startsWith(k))
  const idsSocios = new Set(socios.map((s) => s.id))
  const deSocio = (g: GastoSocioCalc) => g.socio_id != null && idsSocios.has(g.socio_id)
  const gastosSocios = r2(gastosMes.filter(deSocio).reduce((a, g) => a + Number(g.monto || 0), 0))
  const gastosEasycount = r2(gastosMes.filter((g) => !deSocio(g)).reduce((a, g) => a + Number(g.monto || 0), 0))
  const utilidad = r2(ingresos - gastosEasycount - gastosSocios)
  const filas = socios
    .map((s) => {
      const pct = s.activo ? Number(s.porcentaje) || 0 : 0
      const participacion = r2((utilidad * pct) / 100)
      const reembolso = r2(gastosMes.filter((g) => g.socio_id === s.id).reduce((a, g) => a + Number(g.monto || 0), 0))
      return { socio_id: s.id, nombre: s.nombre, porcentaje: pct, participacion, reembolso, total: r2(participacion + reembolso) }
    })
    .filter((f) => f.porcentaje > 0 || f.reembolso !== 0)
  const pctEc = repartoPorcentajes(socios).easycount
  return { mes: k, ingresos, gastosEasycount, gastosSocios, utilidad, socios: filas, easycountPorcentaje: pctEc, easycountParticipacion: r2((utilidad * pctEc) / 100) }
}

export interface EstadoResultadosMes {
  ingresos: number
  gastos: number
  utilidadBruta: number
  participacionSocios: number
  utilidadNeta: number
  margenBruto: number | null
  margenNeto: number | null
}

/**
 * Estado de resultados de EasyCount (la participación va DESPUÉS de gastos):
 *   Ingresos − Gastos (todos, también los que asumió un socio) = Utilidad bruta
 *   − Participación socios (Σ % × utilidad bruta)              = Utilidad neta
 * El reembolso a un socio NO es otra resta: es devolverle un gasto que ya está
 * dentro de "Gastos".
 */
export function estadoResultados(l: LiquidacionMes): EstadoResultadosMes {
  const gastos = r2(l.gastosEasycount + l.gastosSocios)
  const participacionSocios = r2(l.socios.reduce((a, s) => a + s.participacion, 0))
  const utilidadNeta = r2(l.utilidad - participacionSocios)
  return {
    ingresos: l.ingresos, gastos, utilidadBruta: l.utilidad, participacionSocios, utilidadNeta,
    margenBruto: l.ingresos > 0 ? Math.round((l.utilidad / l.ingresos) * 10000) / 10000 : null,
    margenNeto: l.ingresos > 0 ? Math.round((utilidadNeta / l.ingresos) * 10000) / 10000 : null,
  }
}

export interface FilaEstadoSocio { socio_id: number; nombre: string; porcentaje: number; participacion: number; reembolso: number; liquidacion: number }
export interface ColumnaEstado extends EstadoResultadosMes { mes: string; socios: FilaEstadoSocio[] }

/**
 * Estado de resultados MES A MES (columnas) para la tabla de Finanzas: por
 * mes, ingresos, gastos, utilidad bruta, participación de cada socio,
 * utilidad neta y la liquidación de cada socio (participación + reembolso).
 * Arranca en el primer mes con movimientos dentro de la ventana; la última
 * columna `total` suma todos los meses mostrados.
 */
export function estadoResultadosMensual(args: { anio: number; mes: number; meses: number; ingresos: IngresoCalc[]; gastos: GastoSocioCalc[]; socios: SocioCalc[] }): { columnas: ColumnaEstado[]; total: ColumnaEstado; socios: SocioCalc[] } {
  const serie = serieLiquidaciones(args)
  const primero = serie.findIndex((l) => l.ingresos !== 0 || l.gastosEasycount !== 0 || l.gastosSocios !== 0)
  const visibles = primero < 0 ? serie.slice(-1) : serie.slice(primero)
  // Socios que aparecen: los que tienen % o algún movimiento en la ventana.
  const socios = args.socios.filter((s) => (s.activo && s.porcentaje > 0) || visibles.some((l) => l.socios.some((f) => f.socio_id === s.id)))
  const columnas: ColumnaEstado[] = visibles.map((l) => ({
    mes: l.mes,
    ...estadoResultados(l),
    socios: socios.map((s) => {
      const f = l.socios.find((x) => x.socio_id === s.id)
      return { socio_id: s.id, nombre: s.nombre, porcentaje: f?.porcentaje ?? (s.activo ? s.porcentaje : 0), participacion: f?.participacion ?? 0, reembolso: f?.reembolso ?? 0, liquidacion: f?.total ?? 0 }
    }),
  }))
  const suma = (fn: (c: ColumnaEstado) => number) => r2(columnas.reduce((a, c) => a + fn(c), 0))
  const ingresos = suma((c) => c.ingresos), utilidadBruta = suma((c) => c.utilidadBruta), utilidadNeta = suma((c) => c.utilidadNeta)
  const total: ColumnaEstado = {
    mes: "total", ingresos, gastos: suma((c) => c.gastos), utilidadBruta, participacionSocios: suma((c) => c.participacionSocios), utilidadNeta,
    margenBruto: ingresos > 0 ? Math.round((utilidadBruta / ingresos) * 10000) / 10000 : null,
    margenNeto: ingresos > 0 ? Math.round((utilidadNeta / ingresos) * 10000) / 10000 : null,
    socios: socios.map((s, i) => ({
      socio_id: s.id, nombre: s.nombre, porcentaje: s.activo ? s.porcentaje : 0,
      participacion: suma((c) => c.socios[i].participacion), reembolso: suma((c) => c.socios[i].reembolso), liquidacion: suma((c) => c.socios[i].liquidacion),
    })),
  }
  return { columnas, total, socios }
}

/** Serie de N meses hasta (anio, mes), del más antiguo al más reciente. */
export function serieLiquidaciones(args: { anio: number; mes: number; meses: number; ingresos: IngresoCalc[]; gastos: GastoSocioCalc[]; socios: SocioCalc[] }): LiquidacionMes[] {
  const out: LiquidacionMes[] = []
  for (let i = args.meses - 1; i >= 0; i--) {
    const m = mesRelativo(args.anio, args.mes, -i)
    out.push(liquidacionMes({ ...args, anio: m.anio, mes: m.mes }))
  }
  return out
}

/**
 * Saldo por socio hasta el fin de (anio, mes): devengado acumulado desde el
 * primer mes con movimientos − liquidaciones pagadas hasta esa fecha.
 */
export function saldoSocios(args: { anio: number; mes: number; ingresos: IngresoCalc[]; gastos: GastoSocioCalc[]; socios: SocioCalc[]; pagos: LiquidacionPagoCalc[] }) {
  const { anio, mes, socios } = args
  const hasta = clave(anio, mes)
  const fechas = [...args.ingresos.map((p) => p.fecha), ...args.gastos.map((g) => g.fecha)].filter((f) => f.slice(0, 7) <= hasta).sort()
  const devengado = new Map<number, number>()
  if (fechas.length > 0) {
    const ini = { anio: Number(fechas[0].slice(0, 4)), mes: Number(fechas[0].slice(5, 7)) }
    const n = (anio - ini.anio) * 12 + (mes - ini.mes) + 1
    for (const l of serieLiquidaciones({ ...args, meses: Math.max(1, n) })) {
      for (const f of l.socios) devengado.set(f.socio_id, r2((devengado.get(f.socio_id) || 0) + f.total))
    }
  }
  const finMes = `${hasta}-31`
  return socios.map((s) => {
    const d = devengado.get(s.id) || 0
    const pagado = r2(args.pagos.filter((p) => p.socio_id === s.id && p.fecha <= finMes).reduce((a, p) => a + Number(p.monto || 0), 0))
    return { socio_id: s.id, nombre: s.nombre, devengado: d, pagado, saldo: r2(d - pagado) }
  })
}
