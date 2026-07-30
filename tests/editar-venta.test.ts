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

  it("banco con comisión: valorpago es el BRUTO (la comisión no reduce la venta)", () => {
    // 500 bruto con 4% de comisión. total_venta es BRUTO = 500 => Pagado.
    // La comisión bancaria es un costo del comercio, no baja la deuda.
    const r = derivarEstadoPago([pago("Banco", 500, 4)], 500)
    expect(r.valorpago).toBe(500)
    expect(r.estado_pago).toBe("Pagado")
  })

  it("ignora monto_neto: el valorpago siempre es el bruto", () => {
    const r = derivarEstadoPago([{ metodo_pago: "Banco", monto_bruto: 500, porcentaje_comision: 4, monto_neto: 480 }], 500)
    expect(r.valorpago).toBe(500)
    expect(r.estado_pago).toBe("Pagado")
  })

  it("pago mixto suma brutos", () => {
    const r = derivarEstadoPago([pago("Efectivo", 300), pago("Banco", 200, 5)], 500)
    expect(r.valorpago).toBe(500) // 300 + 200 bruto; la comisión del banco no baja el valorpago
    expect(r.estado_pago).toBe("Pagado")
  })
})
