import { describe, it, expect } from "vitest"
import { derivarEstadoPago, type PagoVentaDetalleInput } from "@/lib/services/ventas"

function pago(metodo: PagoVentaDetalleInput["metodo_pago"], bruto: number, comision = 0): PagoVentaDetalleInput {
  return { metodo_pago: metodo, monto_bruto: bruto, porcentaje_comision: comision }
}

describe("derivarEstadoPago", () => {
  it("sin pagos = crédito (Pendiente, valorpago 0)", () => {
    expect(derivarEstadoPago([], 500)).toEqual({ valorpago: 0, estado_pago: "Pendiente" })
  })

  it("pago total en efectivo = Pagado", () => {
    const r = derivarEstadoPago([pago("Efectivo", 500)], 500)
    expect(r).toEqual({ valorpago: 500, estado_pago: "Pagado" })
  })

  it("pago parcial = Parcial", () => {
    const r = derivarEstadoPago([pago("Efectivo", 200)], 500)
    expect(r).toEqual({ valorpago: 200, estado_pago: "Parcial" })
  })

  it("banco con comisión descuenta el neto del valorpago", () => {
    // 500 bruto con 4% => neto 480; total neto 480 => Pagado.
    const r = derivarEstadoPago([pago("Banco", 500, 4)], 480)
    expect(r.valorpago).toBe(480)
    expect(r.estado_pago).toBe("Pagado")
  })

  it("usa monto_neto explícito si viene", () => {
    const r = derivarEstadoPago([{ metodo_pago: "Banco", monto_bruto: 500, porcentaje_comision: 4, monto_neto: 490 }], 490)
    expect(r.valorpago).toBe(490)
    expect(r.estado_pago).toBe("Pagado")
  })

  it("pago mixto suma netos", () => {
    const r = derivarEstadoPago([pago("Efectivo", 300), pago("Banco", 200, 0)], 500)
    expect(r.valorpago).toBe(500)
    expect(r.estado_pago).toBe("Pagado")
  })
})
