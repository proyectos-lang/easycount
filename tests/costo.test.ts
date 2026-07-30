import { describe, it, expect } from "vitest"
import { calcularImpactoCosto } from "@/lib/services/costo"

describe("calcularImpactoCosto", () => {
  it("valor de inventario = stock * (nuevo - anterior)", () => {
    const r = calcularImpactoCosto({
      stock: 10, costoAnterior: 5, costoNuevo: 8, cantidadVendida: 0, cantidadDevuelta: 0,
    })
    expect(r.valorInvAnterior).toBe(50)
    expect(r.valorInvNuevo).toBe(80)
    expect(r.deltaValorInventario).toBe(30)
  })

  it("subir costo => CMV sube y utilidad baja (signos)", () => {
    const r = calcularImpactoCosto({
      stock: 0, costoAnterior: 5, costoNuevo: 8, cantidadVendida: 4, cantidadDevuelta: 0,
    })
    expect(r.cmvAnterior).toBe(20) // 4 * 5
    expect(r.cmvNuevo).toBe(32)    // 4 * 8
    expect(r.deltaUtilidad).toBe(-12) // la utilidad baja 12
  })

  it("bajar costo => CMV baja y utilidad sube", () => {
    const r = calcularImpactoCosto({
      stock: 0, costoAnterior: 10, costoNuevo: 6, cantidadVendida: 3, cantidadDevuelta: 0,
    })
    expect(r.cmvAnterior).toBe(30)
    expect(r.cmvNuevo).toBe(18)
    expect(r.deltaUtilidad).toBe(12) // utilidad sube 12
  })

  it("netea las devoluciones del rango en el CMV", () => {
    // 10 vendidas - 2 devueltas = 8 netas
    const r = calcularImpactoCosto({
      stock: 0, costoAnterior: 5, costoNuevo: 7, cantidadVendida: 10, cantidadDevuelta: 2,
    })
    expect(r.cmvAnterior).toBe(40) // 8 * 5
    expect(r.cmvNuevo).toBe(56)    // 8 * 7
    expect(r.deltaUtilidad).toBe(-16)
  })

  it("rango sin ventas => impacto de CMV en 0 (solo cambia el inventario)", () => {
    const r = calcularImpactoCosto({
      stock: 12, costoAnterior: 4, costoNuevo: 9, cantidadVendida: 0, cantidadDevuelta: 0,
    })
    expect(r.cmvAnterior).toBe(0)
    expect(r.cmvNuevo).toBe(0)
    expect(r.deltaUtilidad).toBe(0)
    expect(r.deltaValorInventario).toBe(60) // 12 * (9 - 4)
  })

  it("costo igual => todos los deltas en 0", () => {
    const r = calcularImpactoCosto({
      stock: 5, costoAnterior: 7, costoNuevo: 7, cantidadVendida: 3, cantidadDevuelta: 1,
    })
    expect(r.deltaValorInventario).toBe(0)
    expect(r.deltaUtilidad).toBe(0)
    expect(r.cmvAnterior).toBe(r.cmvNuevo)
  })

  it("redondea a 2 decimales", () => {
    const r = calcularImpactoCosto({
      stock: 3, costoAnterior: 1.111, costoNuevo: 2.226, cantidadVendida: 3, cantidadDevuelta: 0,
    })
    expect(r.valorInvAnterior).toBe(3.33)
    expect(r.valorInvNuevo).toBe(6.68)
    expect(r.cmvNuevo).toBe(6.68)
  })
})
