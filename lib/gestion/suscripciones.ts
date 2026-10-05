/**
 * Suscripciones del portal /gestion (pantalla Dinero → Suscripciones). PURO,
 * con tests en tests/gestion-suscripciones.test.ts.
 *
 * Una suscripción = empresa cliente vigente (activo / pago pendiente) con su
 * cuota y ciclo. Arranca en su fecha de instalación (o de creación).
 *   · Mensual: genera su cuota TODOS los meses desde que inició, con
 *     vencimiento el día de cobro (29–31 → último día del mes).
 *   · Anual: genera su cuota completa en el mes aniversario de su inicio
 *     (para la curva de valor recurrente cuenta como cuota ÷ 12 al mes).
 */
import { ultimoDiaMes, mesRelativo, type Ciclo, type EstadoEmpresa } from "./reglas"

export interface SuscripcionCalc {
  id: number
  nombre: string
  estado: EstadoEmpresa
  cuota: number
  ciclo_cobro: Ciclo
  dia_cobro: number | null
  fecha_instalacion: string | null
  created_at: string
}
export interface PagoSuscripcionCalc { empresa_id: number; fecha: string; monto: number; periodo_cubierto_desde: string | null; periodo_cubierto_hasta: string | null }

const r2 = (n: number) => Math.round(n * 100) / 100
const clave = (anio: number, mes: number) => `${anio}-${String(mes).padStart(2, "0")}`
const vigente = (e: SuscripcionCalc) => e.estado === "activo" || e.estado === "pago_pendiente"
export const inicioSuscripcion = (e: SuscripcionCalc) => (e.fecha_instalacion || e.created_at).slice(0, 10)
/** Equivalente mensual de la cuota (anual ÷ 12). */
export const valorMensual = (e: Pick<SuscripcionCalc, "cuota" | "ciclo_cobro">) => r2(e.ciclo_cobro === "anual" ? (Number(e.cuota) || 0) / 12 : Number(e.cuota) || 0)

/** Fecha en que vence el cobro de la suscripción en (anio, mes), o null si ese mes no le toca cobrar. */
export function vencimientoEnMes(e: SuscripcionCalc, anio: number, mes: number): string | null {
  const ini = inicioSuscripcion(e)
  const k = clave(anio, mes)
  if (k < ini.slice(0, 7)) return null
  if (e.ciclo_cobro === "anual") {
    if (Number(ini.slice(5, 7)) !== mes) return null
    return `${k}-${String(Math.min(Number(ini.slice(8, 10)), ultimoDiaMes(anio, mes))).padStart(2, "0")}`
  }
  const dia = Math.min(e.dia_cobro ?? Number(ini.slice(8, 10)), ultimoDiaMes(anio, mes))
  return `${k}-${String(dia).padStart(2, "0")}`
}

export interface CobroMes {
  empresa_id: number
  nombre: string
  ciclo: Ciclo
  vence: string
  monto: number
  /** pagado: un pago cubre ese vencimiento; vencido: pasó la fecha sin pago; pendiente: aún no vence. */
  estado: "pagado" | "pendiente" | "vencido"
  pagado: number
}

/** Cobros que vencen en el mes (de suscripciones vigentes) y si ya están cubiertos por un pago. */
export function cobrosDelMes(args: { empresas: SuscripcionCalc[]; pagos: PagoSuscripcionCalc[]; anio: number; mes: number; hoy: string }): CobroMes[] {
  const { anio, mes, hoy } = args
  return args.empresas
    .filter(vigente)
    .map((e): CobroMes | null => {
      const vence = vencimientoEnMes(e, anio, mes)
      if (!vence) return null
      const cubre = args.pagos.filter((p) => p.empresa_id === e.id && p.periodo_cubierto_desde && p.periodo_cubierto_hasta && p.periodo_cubierto_desde <= vence && vence <= p.periodo_cubierto_hasta)
      const pagado = r2(cubre.reduce((a, p) => a + Number(p.monto || 0), 0))
      return { empresa_id: e.id, nombre: e.nombre, ciclo: e.ciclo_cobro, vence, monto: r2(Number(e.cuota) || 0), estado: cubre.length > 0 ? "pagado" : vence < hoy ? "vencido" : "pendiente", pagado }
    })
    .filter((c): c is CobroMes => c !== null)
    .sort((a, b) => a.vence.localeCompare(b.vence))
}

/** Indicadores de la pantalla para el mes elegido. */
export function resumenSuscripciones(args: { empresas: SuscripcionCalc[]; pagos: PagoSuscripcionCalc[]; anio: number; mes: number; hoy: string }) {
  const vig = args.empresas.filter(vigente)
  const cobros = cobrosDelMes(args)
  const k = clave(args.anio, args.mes)
  const porCobrar = r2(cobros.reduce((a, c) => a + c.monto, 0))
  const cobrosCubiertos = r2(cobros.filter((c) => c.estado === "pagado").reduce((a, c) => a + c.monto, 0))
  const mrr = r2(vig.reduce((a, e) => a + valorMensual(e), 0))
  return {
    activas: vig.length,
    mensuales: vig.filter((e) => e.ciclo_cobro === "mensual").length,
    anuales: vig.filter((e) => e.ciclo_cobro === "anual").length,
    mrr, arr: r2(mrr * 12),
    porCobrar,
    /** Todo lo que entró en el mes (incluye pagos atrasados de meses anteriores y adelantos). */
    cobradoMes: r2(args.pagos.filter((p) => p.fecha.slice(0, 7) === k).reduce((a, p) => a + Number(p.monto || 0), 0)),
    cobrosCubiertos,
    pendiente: r2(cobros.filter((c) => c.estado !== "pagado").reduce((a, c) => a + c.monto, 0)),
    vencido: r2(cobros.filter((c) => c.estado === "vencido").reduce((a, c) => a + c.monto, 0)),
    cobros,
  }
}

export interface PuntoCrecimiento {
  mes: string
  /** Lo que las suscripciones iniciadas (y hoy vigentes) facturan en el mes: mensuales + anuales en su aniversario. */
  esperado: number
  /** Valor recurrente mensual de las suscripciones iniciadas a ese mes (anual ÷ 12). */
  mrr: number
  /** Pagos realmente recibidos en el mes. */
  cobrado: number
  suscripciones: number
  nuevas: number
  /** true = mes futuro (proyección con las suscripciones actuales). */
  proyeccion: boolean
}

/**
 * Curva de crecimiento: desde el mes en que inició la primera suscripción
 * vigente hasta `hasta` + `proyeccionMeses`. Solo considera suscripciones
 * hoy vigentes (es la curva de lo ya concretado).
 */
export function curvaCrecimiento(args: { empresas: SuscripcionCalc[]; pagos: PagoSuscripcionCalc[]; hasta: { anio: number; mes: number }; hoy: string; proyeccionMeses?: number }): PuntoCrecimiento[] {
  const vig = args.empresas.filter(vigente)
  if (vig.length === 0) return []
  const primero = vig.map(inicioSuscripcion).sort()[0]
  const ini = { anio: Number(primero.slice(0, 4)), mes: Number(primero.slice(5, 7)) }
  const fin = mesRelativo(args.hasta.anio, args.hasta.mes, args.proyeccionMeses ?? 0)
  const n = (fin.anio - ini.anio) * 12 + (fin.mes - ini.mes) + 1
  const mesHoy = args.hoy.slice(0, 7)
  const out: PuntoCrecimiento[] = []
  for (let i = 0; i < Math.max(0, n); i++) {
    const m = mesRelativo(ini.anio, ini.mes, i)
    const k = clave(m.anio, m.mes)
    const iniciadas = vig.filter((e) => inicioSuscripcion(e).slice(0, 7) <= k)
    out.push({
      mes: k,
      esperado: r2(iniciadas.reduce((a, e) => a + (vencimientoEnMes(e, m.anio, m.mes) ? Number(e.cuota) || 0 : 0), 0)),
      mrr: r2(iniciadas.reduce((a, e) => a + valorMensual(e), 0)),
      cobrado: r2(args.pagos.filter((p) => p.fecha.slice(0, 7) === k).reduce((a, p) => a + Number(p.monto || 0), 0)),
      suscripciones: iniciadas.length,
      nuevas: vig.filter((e) => inicioSuscripcion(e).slice(0, 7) === k).length,
      proyeccion: k > mesHoy,
    })
  }
  return out
}
