import { describe, it, expect } from "vitest"
import { liquidacionMes, repartoPorcentajes, saldoSocios, serieLiquidaciones } from "@/lib/gestion/socios"

const socios = [
  { id: 1, nombre: "Sebas", porcentaje: 40, activo: true },
  { id: 2, nombre: "Kristel", porcentaje: 30, activo: true },
]

describe("reparto de porcentajes", () => {
  it("lo que falta para 100 se queda en EasyCount", () => {
    expect(repartoPorcentajes(socios)).toEqual({ totalSocios: 70, easycount: 30, valido: true })
  })
  it("marca inválido si los socios activos suman más de 100", () => {
    expect(repartoPorcentajes([...socios, { id: 3, nombre: "X", porcentaje: 40, activo: true }]).valido).toBe(false)
    expect(repartoPorcentajes([...socios, { id: 3, nombre: "X", porcentaje: 40, activo: false }]).valido).toBe(true)
  })
})

describe("liquidación del mes", () => {
  const ingresos = [{ fecha: "2026-10-03", monto: 10000 }, { fecha: "2026-09-30", monto: 999 }]
  it("sin gastos de socio: % sobre la utilidad (ingresos − gastos de EasyCount)", () => {
    const l = liquidacionMes({ anio: 2026, mes: 10, ingresos, gastos: [{ fecha: "2026-10-05", monto: 2000, socio_id: null }], socios })
    expect(l.utilidad).toBe(8000)
    expect(l.socios.map((s) => [s.nombre, s.participacion, s.reembolso, s.total])).toEqual([["Sebas", 3200, 0, 3200], ["Kristel", 2400, 0, 2400]])
    expect(l.easycountParticipacion).toBe(2400)
  })
  it("un gasto asumido por un socio sale del pool y se le suma completo a él", () => {
    const l = liquidacionMes({ anio: 2026, mes: 10, ingresos, gastos: [{ fecha: "2026-10-05", monto: 2000, socio_id: null }, { fecha: "2026-10-08", monto: 1000, socio_id: 2 }], socios })
    expect(l.gastosSocios).toBe(1000)
    expect(l.utilidad).toBe(7000)
    const k = l.socios.find((s) => s.socio_id === 2)!
    expect([k.participacion, k.reembolso, k.total]).toEqual([2100, 1000, 3100])
    expect(l.socios.find((s) => s.socio_id === 1)!.total).toBe(2800) // baja frente a 3200
    expect(l.easycountParticipacion).toBe(2100) // baja frente a 2400
    // Todo cuadra: lo que se reparte + lo de EasyCount = ingresos − gastos de EasyCount.
    expect(l.socios.reduce((a, s) => a + s.total, 0) + l.easycountParticipacion).toBe(10000 - 2000)
  })
  it("pérdida: la participación es negativa, el reembolso se mantiene", () => {
    const l = liquidacionMes({ anio: 2026, mes: 10, ingresos: [{ fecha: "2026-10-01", monto: 500 }], gastos: [{ fecha: "2026-10-02", monto: 1500, socio_id: 1 }], socios })
    const s = l.socios.find((x) => x.socio_id === 1)!
    expect(l.utilidad).toBe(-1000)
    expect([s.participacion, s.reembolso, s.total]).toEqual([-400, 1500, 1100])
  })
  it("un socio inactivo no participa pero recupera lo que pagó", () => {
    const l = liquidacionMes({ anio: 2026, mes: 10, ingresos, gastos: [{ fecha: "2026-10-02", monto: 300, socio_id: 3 }], socios: [...socios, { id: 3, nombre: "Ex", porcentaje: 10, activo: false }] })
    const ex = l.socios.find((x) => x.socio_id === 3)!
    expect([ex.porcentaje, ex.participacion, ex.reembolso]).toEqual([0, 0, 300])
  })
})

describe("acumulado y saldo por socio", () => {
  const ingresos = [{ fecha: "2026-09-10", monto: 5000 }, { fecha: "2026-10-10", monto: 5000 }]
  const gastos = [{ fecha: "2026-10-12", monto: 1000, socio_id: 1 }]
  it("serie de meses del más antiguo al más reciente", () => {
    expect(serieLiquidaciones({ anio: 2026, mes: 10, meses: 2, ingresos, gastos, socios }).map((l) => l.mes)).toEqual(["2026-09", "2026-10"])
  })
  it("devengado acumulado − liquidaciones pagadas", () => {
    const s = saldoSocios({ anio: 2026, mes: 10, ingresos, gastos, socios, pagos: [{ socio_id: 1, fecha: "2026-10-01", monto: 2000 }] })
    // Sebas: sep 40%×5000=2000; oct 40%×4000=1600 + 1000 reembolso → 4600 devengado, 2000 pagado.
    expect(s.find((x) => x.socio_id === 1)).toEqual({ socio_id: 1, nombre: "Sebas", devengado: 4600, pagado: 2000, saldo: 2600 })
    expect(s.find((x) => x.socio_id === 2)!.saldo).toBe(2700)
  })
  it("no cuenta liquidaciones posteriores al mes consultado", () => {
    const s = saldoSocios({ anio: 2026, mes: 9, ingresos, gastos, socios, pagos: [{ socio_id: 1, fecha: "2026-10-01", monto: 2000 }] })
    expect(s.find((x) => x.socio_id === 1)).toEqual({ socio_id: 1, nombre: "Sebas", devengado: 2000, pagado: 0, saldo: 2000 })
  })
})
