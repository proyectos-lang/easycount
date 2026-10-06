/**
 * Agregaciones PURAS para las pantallas del portal /gestion (Inicio, Pagos,
 * Finanzas, Publicidad, Reuniones, contadores del menú). Reciben arreglos ya
 * leídos y `hoy`; no tocan la BD. Testeables.
 */
import {
  CATEGORIAS_PUBLICIDAD, ETAPAS_EN_VENTA, cobrosAdeudados, diasEntre, esClienteVigente, finPrueba, mesRelativo, mrr, sumarDias, utilidad,
  type Ciclo, type EstadoCobro, type EstadoEmpresa, type EtapaPipeline, type MotivoPerdida,
} from "./reglas"

export interface EmpresaCalc {
  id: number
  nombre: string
  estado: EstadoEmpresa
  etapa_pipeline: EtapaPipeline
  cuota: number
  moneda: string
  ciclo_cobro: Ciclo
  dia_cobro: number | null
  fecha_instalacion: string | null
  fecha_proximo_pago: string | null
  estado_cobro: EstadoCobro
  ultimo_pago: string | null
  created_at: string
}
export interface PagoCalc { empresa_id: number; fecha: string; monto: number; cuenta_id: number | null }
export interface GastoCalc { fecha: string; monto: number; categoria: string }
export interface ReunionCalc { id: number; empresa_id: number; fecha: string; hora: string | null; resultado: string | null; motivo_perdida: string | null; contacto: string | null; tipo: string }
export interface CampanaCalc { monto_invertido: number; prospectos_generados: number; reuniones_generadas: number; clientes_obtenidos: number }

const r2 = (n: number) => Math.round(n * 100) / 100
export const mesISO = (anio: number, mes: number) => `${anio}-${String(mes).padStart(2, "0")}`
const enMes = (fecha: string | null | undefined, anio: number, mes: number) => !!fecha && fecha.slice(0, 7) === mesISO(anio, mes)

export const NOMBRES_MES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
export const etiquetaMes = (anio: number, mes: number) => `${NOMBRES_MES[mes - 1]} ${anio}`

/** Ingresos cobrados y gastos de un mes. */
export function totalesMes(pagos: PagoCalc[], gastos: GastoCalc[], anio: number, mes: number) {
  const ingresos = r2(pagos.filter((p) => enMes(p.fecha, anio, mes)).reduce((s, p) => s + Number(p.monto || 0), 0))
  const gastosMes = gastos.filter((g) => enMes(g.fecha, anio, mes))
  const total = r2(gastosMes.reduce((s, g) => s + Number(g.monto || 0), 0))
  const publicidad = r2(gastosMes.filter((g) => CATEGORIAS_PUBLICIDAD.has(g.categoria)).reduce((s, g) => s + Number(g.monto || 0), 0))
  return { ingresos, gastos: total, publicidad, otros: r2(total - publicidad), ...utilidad(ingresos, total) }
}

/** Serie de N meses (hasta el mes dado) con ingresos y gastos, para la gráfica. */
export function serieIngresosGastos(pagos: PagoCalc[], gastos: GastoCalc[], anio: number, mes: number, meses = 6) {
  const out: { clave: string; etiqueta: string; ingresos: number; gastos: number; seleccionado: boolean }[] = []
  for (let i = meses - 1; i >= 0; i--) {
    const m = mesRelativo(anio, mes, -i)
    const t = totalesMes(pagos, gastos, m.anio, m.mes)
    out.push({ clave: mesISO(m.anio, m.mes), etiqueta: `${NOMBRES_MES[m.mes - 1].slice(0, 3)} ${String(m.anio).slice(2)}`, ingresos: t.ingresos, gastos: t.gastos, seleccionado: i === 0 })
  }
  return out
}

/** Chips de estado y KPIs del Inicio para el mes seleccionado. */
export function resumenInicio(args: { empresas: EmpresaCalc[]; pagos: PagoCalc[]; gastos: GastoCalc[]; reuniones: ReunionCalc[]; hoy: string; anio: number; mes: number; diasPrueba: number }) {
  const { empresas, pagos, gastos, reuniones, hoy, anio, mes, diasPrueba } = args
  const clientes = empresas.filter((e) => esClienteVigente(e.estado))
  const atrasados = clientes.filter((e) => e.estado_cobro === "atrasado")
  const estaSemana = clientes.filter((e) => e.estado_cobro === "proximo" || (e.estado_cobro === "pendiente" && e.fecha_proximo_pago === hoy))
  const enPrueba = empresas.filter((e) => e.estado === "prueba")
  const pruebas = enPrueba
    .map((e) => {
      const inst = e.fecha_instalacion || e.created_at.slice(0, 10)
      const fin = finPrueba(inst, diasPrueba)
      const restantes = diasEntre(hoy, fin)
      const total = Math.max(1, diasEntre(inst, fin))
      return { id: e.id, nombre: e.nombre, instalacion: inst, fin, restantes, progreso: Math.min(100, Math.max(0, Math.round(((total - Math.max(0, restantes)) / total) * 100))) }
    })
    .sort((a, b) => a.restantes - b.restantes)
  const pruebasPronto = pruebas.filter((p) => p.restantes >= 0 && p.restantes <= 3)
  const alDia = clientes.filter((e) => e.estado_cobro === "pagado")
  const t = totalesMes(pagos, gastos, anio, mes)
  const reunionesProximas = reuniones
    .filter((r) => !r.resultado && r.fecha >= hoy)
    .sort((a, b) => `${a.fecha} ${a.hora || ""}`.localeCompare(`${b.fecha} ${b.hora || ""}`))
  const nuevosProspectos = empresas.filter((e) => ETAPAS_EN_VENTA.includes(e.etapa_pipeline) && enMes(e.created_at.slice(0, 10), anio, mes)).length
  const limite = sumarDias(hoy, 30)
  const pagosProximos = clientes
    .filter((e) => e.fecha_proximo_pago && e.fecha_proximo_pago <= limite)
    .sort((a, b) => String(a.fecha_proximo_pago).localeCompare(String(b.fecha_proximo_pago)))
  return {
    chips: { atrasados: atrasados.length, estaSemana: estaSemana.length, pruebasPronto: pruebasPronto.length, alDia: alDia.length },
    kpis: {
      activos: clientes.length, enPrueba: enPrueba.length, pagosPendientes: clientes.filter((e) => e.estado_cobro === "pendiente" || e.estado_cobro === "atrasado").length,
      ingresos: t.ingresos, gastos: t.gastos, utilidad: t.utilidad, reunionesProximas: reunionesProximas.length, nuevosProspectos,
    },
    pagosProximos, pruebas, reunionesProximas: reunionesProximas.slice(0, 6),
    serie: serieIngresosGastos(pagos, gastos, anio, mes),
  }
}

/** Último día ('YYYY-MM-DD') del mes. */
const finDeMes = (anio: number, mes: number) => `${mesISO(anio, mes)}-${String(new Date(Date.UTC(anio, mes, 0)).getUTCDate()).padStart(2, "0")}`

/**
 * Lo que un cliente adeuda hasta fin del mes elegido: cobros ya vencidos
 * (antes de hoy) y cobros por vencer dentro del mes. Un cliente que arrastra
 * meses sin pagar debe VARIAS cuotas.
 */
export function adeudoCliente(e: EmpresaCalc, hoy: string, anio: number, mes: number) {
  const hasta = finDeMes(anio, mes)
  const fechas = esClienteVigente(e.estado) ? cobrosAdeudados(e.fecha_proximo_pago, e.ciclo_cobro, e.dia_cobro, hasta) : []
  const vencidos = fechas.filter((f) => f < hoy)
  const porVencer = fechas.filter((f) => f >= hoy)
  const cuota = Number(e.cuota || 0)
  return { fechas, vencidos, porVencer, montoVencido: r2(vencidos.length * cuota), montoPorVencer: r2(porVencer.length * cuota), total: r2(fechas.length * cuota) }
}

/** KPIs de la pantalla Pagos para el mes seleccionado (las cuotas adeudadas se suman todas). */
export function resumenPagos(empresas: EmpresaCalc[], pagos: PagoCalc[], anio: number, mes: number, hoy: string) {
  const clientes = empresas.filter((e) => esClienteVigente(e.estado))
  const pagosMes = pagos.filter((p) => enMes(p.fecha, anio, mes))
  const cobrado = r2(pagosMes.reduce((s, p) => s + Number(p.monto || 0), 0))
  const adeudos = clientes.map((e) => adeudoCliente(e, hoy, anio, mes))
  const porCobrar = r2(adeudos.reduce((s, a) => s + a.montoPorVencer, 0))
  const atrasado = r2(adeudos.reduce((s, a) => s + a.montoVencido, 0))
  return { cobrado, porCobrar, atrasado, cantidad: pagosMes.length, clientesAtrasados: adeudos.filter((a) => a.vencidos.length > 0).length }
}

/** Finanzas del mes: totales, MRR, ingresos por cuenta y top de clientes. */
export function resumenFinanzas(args: { empresas: EmpresaCalc[]; pagos: PagoCalc[]; gastos: GastoCalc[]; cuentas: { id: number; nombre: string }[]; anio: number; mes: number }) {
  const { empresas, pagos, gastos, cuentas, anio, mes } = args
  const t = totalesMes(pagos, gastos, anio, mes)
  const pagosMes = pagos.filter((p) => enMes(p.fecha, anio, mes))
  const porCuenta = cuentas
    .map((c) => ({ id: c.id, nombre: c.nombre, total: r2(pagosMes.filter((p) => p.cuenta_id === c.id).reduce((s, p) => s + Number(p.monto || 0), 0)) }))
  const sinCuenta = r2(pagosMes.filter((p) => p.cuenta_id == null || !cuentas.some((c) => c.id === p.cuenta_id)).reduce((s, p) => s + Number(p.monto || 0), 0))
  if (sinCuenta > 0) porCuenta.push({ id: 0, nombre: "Sin cuenta", total: sinCuenta })
  const porEmpresa = new Map<number, number>()
  for (const p of pagosMes) porEmpresa.set(p.empresa_id, (porEmpresa.get(p.empresa_id) || 0) + Number(p.monto || 0))
  const nombres = new Map(empresas.map((e) => [e.id, e.nombre]))
  const topClientes = [...porEmpresa.entries()].map(([id, total]) => ({ id, nombre: nombres.get(id) || `Empresa #${id}`, total: r2(total) })).sort((a, b) => b.total - a.total).slice(0, 8)
  const porCategoria = Object.entries(
    gastos.filter((g) => enMes(g.fecha, anio, mes)).reduce<Record<string, number>>((acc, g) => { acc[g.categoria] = (acc[g.categoria] || 0) + Number(g.monto || 0); return acc }, {}),
  ).map(([categoria, total]) => ({ categoria, total: r2(total) })).sort((a, b) => b.total - a.total)
  return { ...t, mrr: mrr(empresas), porCuenta: porCuenta.sort((a, b) => b.total - a.total), topClientes, porCategoria, serie: serieIngresosGastos(pagos, gastos, anio, mes) }
}

/** Publicidad: totales y costos por prospecto/cliente. */
export function resumenPublicidad(campanas: CampanaCalc[]) {
  const invertido = r2(campanas.reduce((s, c) => s + Number(c.monto_invertido || 0), 0))
  const prospectos = campanas.reduce((s, c) => s + Number(c.prospectos_generados || 0), 0)
  const reuniones = campanas.reduce((s, c) => s + Number(c.reuniones_generadas || 0), 0)
  const clientes = campanas.reduce((s, c) => s + Number(c.clientes_obtenidos || 0), 0)
  return { invertido, prospectos, reuniones, clientes, costoProspecto: prospectos > 0 ? r2(invertido / prospectos) : null, costoCliente: clientes > 0 ? r2(invertido / clientes) : null }
}

/** Motivos de pérdida de los últimos `dias` días (para la tarjeta de barras). */
export function motivosPerdida(reuniones: ReunionCalc[], hoy: string, dias = 90): { motivo: MotivoPerdida; total: number }[] {
  const desde = sumarDias(hoy, -dias)
  const conteo = new Map<MotivoPerdida, number>()
  for (const r of reuniones) {
    if (r.resultado === "no_interesado" && r.motivo_perdida && r.fecha >= desde) {
      const m = r.motivo_perdida as MotivoPerdida
      conteo.set(m, (conteo.get(m) || 0) + 1)
    }
  }
  return [...conteo.entries()].map(([motivo, total]) => ({ motivo, total })).sort((a, b) => b.total - a.total)
}

/** Contadores del menú lateral (misma fuente que el dashboard). */
export function contadoresMenu(empresas: EmpresaCalc[], reuniones: ReunionCalc[], noLeidas: number, hoy: string) {
  const limite = sumarDias(hoy, 7)
  return {
    atrasados: empresas.filter((e) => esClienteVigente(e.estado) && e.estado_cobro === "atrasado").length,
    prospectos: empresas.filter((e) => ETAPAS_EN_VENTA.includes(e.etapa_pipeline) && e.estado !== "activo" && e.estado !== "pago_pendiente").length,
    reuniones: reuniones.filter((r) => !r.resultado && r.fecha >= hoy && r.fecha <= limite).length,
    noLeidas,
  }
}

/** Reportes: resumen por mes de los últimos `meses` meses (clientes nuevos, cancelados, ingresos, gastos…). */
export function serieReportes(args: { empresas: EmpresaCalc[]; pagos: PagoCalc[]; gastos: GastoCalc[]; anio: number; mes: number; meses?: number }) {
  const { empresas, pagos, gastos, anio, mes, meses = 12 } = args
  const out: { mes: string; nuevos: number; cancelados: number; ingresos: number; gastos: number; utilidad: number }[] = []
  for (let i = meses - 1; i >= 0; i--) {
    const m = mesRelativo(anio, mes, -i)
    const clave = mesISO(m.anio, m.mes)
    const t = totalesMes(pagos, gastos, m.anio, m.mes)
    out.push({
      mes: clave,
      nuevos: empresas.filter((e) => esClienteVigente(e.estado) && (e.fecha_instalacion || e.created_at.slice(0, 10)).slice(0, 7) === clave).length,
      cancelados: empresas.filter((e) => e.estado === "cancelado" && e.etapa_pipeline !== "no_interesado" && (e.fecha_proximo_pago || e.created_at.slice(0, 10)).slice(0, 7) === clave).length,
      ingresos: t.ingresos, gastos: t.gastos, utilidad: t.utilidad,
    })
  }
  return out
}
