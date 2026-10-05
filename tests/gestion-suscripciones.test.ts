import { describe, it, expect } from "vitest"
import { cobrosDelMes, curvaCrecimiento, resumenSuscripciones, valorMensual, vencimientoEnMes, type SuscripcionCalc } from "@/lib/gestion/suscripciones"

const base = { created_at: "2026-01-01T00:00:00Z" }
const coral: SuscripcionCalc = { id: 1, nombre: "Coral", estado: "pago_pendiente", cuota: 800, ciclo_cobro: "mensual", dia_cobro: 5, fecha_instalacion: "2026-05-05", ...base }
const marena: SuscripcionCalc = { id: 2, nombre: "Marena", estado: "activo", cuota: 900, ciclo_cobro: "mensual", dia_cobro: 31, fecha_instalacion: "2026-09-01", ...base }
const food: SuscripcionCalc = { id: 3, nombre: "Food Market", estado: "activo", cuota: 9180, ciclo_cobro: "anual", dia_cobro: null, fecha_instalacion: "2026-08-20", ...base }
const prueba: SuscripcionCalc = { id: 4, nombre: "Dayarok", estado: "prueba", cuota: 900, ciclo_cobro: "mensual", dia_cobro: 18, fecha_instalacion: "2026-09-18", ...base }
const empresas = [coral, marena, food, prueba]
const pagos = [
  { empresa_id: 1, fecha: "2026-09-01", monto: 800, periodo_cubierto_desde: "2026-08-05", periodo_cubierto_hasta: "2026-09-04" },
  { empresa_id: 2, fecha: "2026-09-01", monto: 900, periodo_cubierto_desde: "2026-09-01", periodo_cubierto_hasta: "2026-09-30" },
  { empresa_id: 3, fecha: "2026-08-20", monto: 9180, periodo_cubierto_desde: "2026-08-20", periodo_cubierto_hasta: "2027-08-19" },
]

describe("vencimientos", () => {
  it("mensual: el día de cobro de cada mes desde que inició (31 → último día)", () => {
    expect(vencimientoEnMes(coral, 2026, 4)).toBeNull()
    expect(vencimientoEnMes(coral, 2026, 10)).toBe("2026-10-05")
    expect(vencimientoEnMes(marena, 2026, 9)).toBe("2026-09-30")
    expect(vencimientoEnMes(marena, 2027, 2)).toBe("2027-02-28")
  })
  it("anual: solo en el mes aniversario", () => {
    expect(vencimientoEnMes(food, 2026, 8)).toBe("2026-08-20")
    expect(vencimientoEnMes(food, 2026, 9)).toBeNull()
    expect(vencimientoEnMes(food, 2027, 8)).toBe("2027-08-20")
  })
  it("valor mensual equivalente", () => {
    expect(valorMensual(food)).toBe(765)
    expect(valorMensual(coral)).toBe(800)
  })
})

describe("cobros del mes", () => {
  it("solo suscripciones vigentes; pagado si un pago cubre el vencimiento", () => {
    const c = cobrosDelMes({ empresas, pagos, anio: 2026, mes: 9, hoy: "2026-10-05" })
    expect(c.map((x) => [x.nombre, x.vence, x.estado])).toEqual([["Coral", "2026-09-05", "vencido"], ["Marena", "2026-09-30", "pagado"]])
  })
  it("mes en curso: pendiente si aún no vence", () => {
    const c = cobrosDelMes({ empresas, pagos, anio: 2026, mes: 10, hoy: "2026-10-03" })
    expect(c.map((x) => [x.nombre, x.estado])).toEqual([["Coral", "pendiente"], ["Marena", "pendiente"]])
  })
})

describe("resumen", () => {
  it("activas, MRR/ARR, por cobrar vs cobrado del mes", () => {
    const r = resumenSuscripciones({ empresas, pagos, anio: 2026, mes: 9, hoy: "2026-10-05" })
    expect([r.activas, r.mensuales, r.anuales]).toEqual([3, 2, 1])
    expect([r.mrr, r.arr]).toEqual([2465, 29580])
    expect([r.porCobrar, r.cobradoMes, r.cobrosCubiertos, r.pendiente, r.vencido]).toEqual([1700, 1700, 900, 800, 800])
  })
})

describe("curva de crecimiento", () => {
  it("desde la primera suscripción, acumulando las que van iniciando, con proyección", () => {
    const c = curvaCrecimiento({ empresas, pagos, hasta: { anio: 2026, mes: 10 }, hoy: "2026-10-05", proyeccionMeses: 1 })
    expect(c.map((p) => p.mes)).toEqual(["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"])
    const ago = c.find((p) => p.mes === "2026-08")!
    expect([ago.esperado, ago.mrr, ago.suscripciones, ago.nuevas, ago.cobrado]).toEqual([9980, 1565, 2, 1, 9180])
    const sep = c.find((p) => p.mes === "2026-09")!
    expect([sep.esperado, sep.mrr, sep.suscripciones]).toEqual([1700, 2465, 3])
    expect(c.at(-1)!.proyeccion).toBe(true)
    expect(c.find((p) => p.mes === "2026-10")!.proyeccion).toBe(false)
  })
})
