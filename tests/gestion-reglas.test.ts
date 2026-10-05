import { describe, it, expect } from "vitest"
import {
  basePeriodoPago, finPrueba, proximoPagoMensual, proximoPagoAnual, proximoPago, periodoCubierto, primerProximoPago,
  estadoCobro, estadoEmpresaPorCobro, mrr, utilidad, costoPor, sumarMeses, ultimoDiaMes, diasEntre,
  estadoDesdeEtapa, etapaDesdeEstado, etapaPorResultado,
} from "@/lib/gestion/reglas"

describe("fin de prueba", () => {
  it("instalación + 10 días por defecto, cruzando mes y año", () => {
    expect(finPrueba("2026-09-25")).toBe("2026-10-05")
    expect(finPrueba("2026-12-28")).toBe("2027-01-07")
  })
  it("respeta N configurable", () => {
    expect(finPrueba("2026-10-01", 15)).toBe("2026-10-16")
  })
})

describe("próximo pago mensual", () => {
  it("mismo día de cobro del mes siguiente", () => {
    expect(proximoPagoMensual("2026-10-03", 5)).toBe("2026-11-05")
    expect(proximoPagoMensual("2026-10-20", 5)).toBe("2026-11-05") // pago tarde, sigue el día de cobro
  })
  it("día 29–31 cae al último día si el mes no lo tiene", () => {
    expect(proximoPagoMensual("2026-01-31", 31)).toBe("2026-02-28")
    expect(proximoPagoMensual("2028-01-30", 30)).toBe("2028-02-29") // bisiesto
    expect(proximoPagoMensual("2026-03-31", 31)).toBe("2026-04-30")
    expect(proximoPagoMensual("2026-04-30", 31)).toBe("2026-05-31") // vuelve al 31 cuando existe
  })
  it("cruza de diciembre a enero", () => {
    expect(proximoPagoMensual("2026-12-15", 15)).toBe("2027-01-15")
  })
})

describe("próximo pago anual", () => {
  it("misma fecha + 12 meses", () => {
    expect(proximoPagoAnual("2026-10-05")).toBe("2027-10-05")
  })
  it("29 de febrero → 28 de febrero del año siguiente", () => {
    expect(proximoPagoAnual("2028-02-29")).toBe("2029-02-28")
  })
  it("proximoPago despacha por ciclo y periodoCubierto termina el día anterior", () => {
    expect(proximoPago("2026-10-05", "anual", 5)).toBe("2027-10-05")
    expect(proximoPago("2026-10-05", "mensual", 5)).toBe("2026-11-05")
    expect(periodoCubierto("2026-10-05", "mensual", 5)).toEqual({ desde: "2026-10-05", hasta: "2026-11-04" })
  })
  it("primer vencimiento de un cliente nuevo", () => {
    expect(primerProximoPago("2026-10-03", "mensual", 5)).toBe("2026-10-05")
    expect(primerProximoPago("2026-10-06", "mensual", 5)).toBe("2026-11-05")
    expect(primerProximoPago("2026-10-06", "mensual", 31)).toBe("2026-10-31")
    expect(primerProximoPago("2026-10-06", "anual", null, "2026-09-20")).toBe("2027-09-20")
  })
})

describe("estado derivado del cobro", () => {
  const hoy = "2026-10-05"
  it("atrasado si la fecha ya pasó", () => {
    expect(estadoCobro({ fechaProximoPago: "2026-10-04", hoy })).toBe("atrasado")
  })
  it("pendiente si vence hoy", () => {
    expect(estadoCobro({ fechaProximoPago: "2026-10-05", hoy })).toBe("pendiente")
  })
  it("próximo si vence en 1–7 días", () => {
    expect(estadoCobro({ fechaProximoPago: "2026-10-06", hoy })).toBe("proximo")
    expect(estadoCobro({ fechaProximoPago: "2026-10-12", hoy })).toBe("proximo")
  })
  it("pendiente si vence este mes (a más de 7 días) y no está cubierto", () => {
    expect(estadoCobro({ fechaProximoPago: "2026-10-25", hoy })).toBe("pendiente")
  })
  it("pagado si un pago cubre el período actual, o si vence en otro mes", () => {
    expect(estadoCobro({ fechaProximoPago: "2026-10-25", hoy, cubiertoHasta: "2026-10-24" })).toBe("pagado")
    expect(estadoCobro({ fechaProximoPago: "2026-11-05", hoy })).toBe("pagado")
  })
  it("sin fecha de próximo pago → pendiente", () => {
    expect(estadoCobro({ fechaProximoPago: null, hoy })).toBe("pendiente")
  })
  it("activo ↔ pago_pendiente según el cobro; otros estados no cambian", () => {
    expect(estadoEmpresaPorCobro("activo", "atrasado")).toBe("pago_pendiente")
    expect(estadoEmpresaPorCobro("pago_pendiente", "pagado")).toBe("activo")
    expect(estadoEmpresaPorCobro("pago_pendiente", "atrasado")).toBe("pago_pendiente")
    expect(estadoEmpresaPorCobro("prueba", "atrasado")).toBe("prueba")
  })
})

describe("MRR y utilidad", () => {
  it("MRR = mensuales de clientes vigentes + anuales ÷ 12 (ignora prueba/cancelado)", () => {
    const e = [
      { estado: "activo" as const, cuota: 1000, ciclo_cobro: "mensual" as const },
      { estado: "pago_pendiente" as const, cuota: 500, ciclo_cobro: "mensual" as const },
      { estado: "activo" as const, cuota: 12000, ciclo_cobro: "anual" as const },
      { estado: "prueba" as const, cuota: 800, ciclo_cobro: "mensual" as const },
      { estado: "cancelado" as const, cuota: 800, ciclo_cobro: "mensual" as const },
    ]
    expect(mrr(e)).toBe(2500)
  })
  it("utilidad y margen; margen null sin ingresos", () => {
    expect(utilidad(10000, 2500)).toEqual({ utilidad: 7500, margen: 0.75 })
    expect(utilidad(0, 300)).toEqual({ utilidad: -300, margen: null })
  })
  it("costo por prospecto/cliente devuelve null si la cantidad es 0", () => {
    expect(costoPor(1500, 10)).toBe(150)
    expect(costoPor(1500, 0)).toBeNull()
  })
})

describe("ayudas de fecha y pipeline", () => {
  it("sumarMeses y ultimoDiaMes", () => {
    expect(ultimoDiaMes(2026, 2)).toBe(28)
    expect(sumarMeses("2026-01-31", 1)).toBe("2026-02-28")
    expect(diasEntre("2026-10-01", "2026-10-05")).toBe(4)
  })
  it("estado ↔ etapa son consistentes", () => {
    expect(estadoDesdeEtapa("cliente")).toBe("activo")
    expect(estadoDesdeEtapa("cliente", "pago_pendiente")).toBe("pago_pendiente")
    expect(estadoDesdeEtapa("no_interesado")).toBe("cancelado")
    expect(etapaDesdeEstado("pago_pendiente")).toBe("cliente")
    expect(etapaPorResultado("quiere_prueba")).toBe("prueba")
    expect(etapaPorResultado("interesado")).toBe("reunion_realizada")
  })
})

describe("pago atrasado o adelantado", () => {
  it("un cliente vigente salda su cobro programado, no desde la fecha del pago", () => {
    const base = basePeriodoPago("2026-09-01", "2026-08-05", "activo")
    expect(base).toBe("2026-08-05")
    expect(periodoCubierto(base, "mensual", 5)).toEqual({ desde: "2026-08-05", hasta: "2026-09-04" })
    expect(proximoPago(base, "mensual", 5)).toBe("2026-09-05")
  })
  it("también si está en pago pendiente; sin cobro programado cuenta desde el pago", () => {
    expect(basePeriodoPago("2026-10-10", "2026-09-15", "pago_pendiente")).toBe("2026-09-15")
    expect(basePeriodoPago("2026-10-10", null, "activo")).toBe("2026-10-10")
    expect(basePeriodoPago("2026-10-10", "2026-09-15", "prueba")).toBe("2026-10-10")
  })
})
