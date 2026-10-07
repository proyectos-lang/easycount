import { describe, it, expect } from "vitest"
import { aplicarCambioLinea, totalDeLinea } from "@/lib/utils/recepcion-linea"

describe("línea de recepción: cantidad, costo unitario y total", () => {
  it("escribir el total calcula el costo unitario", () => {
    const l = aplicarCambioLinea({ cantidad: 12, costoOriginal: 0 }, "totalLinea", 1500)
    expect(l).toEqual({ cantidad: 12, costoOriginal: 125, totalLinea: 1500 })
    expect(totalDeLinea(l)).toBe(1500)
  })
  it("con total fijado, cambiar la cantidad recalcula el costo y respeta el total", () => {
    const l = aplicarCambioLinea({ cantidad: 12, costoOriginal: 125, totalLinea: 1500 }, "cantidad", 10)
    expect([l.cantidad, l.costoOriginal, totalDeLinea(l)]).toEqual([10, 150, 1500])
  })
  it("total que no divide exacto: costo con 4 decimales", () => {
    const l = aplicarCambioLinea({ cantidad: 3, costoOriginal: 0 }, "totalLinea", 100)
    expect(l.costoOriginal).toBe(33.3333)
    expect(totalDeLinea(l)).toBe(100)
  })
  it("escribir el costo unitario suelta el total fijado (total = cantidad × costo)", () => {
    const l = aplicarCambioLinea({ cantidad: 10, costoOriginal: 150, totalLinea: 1500 }, "costoOriginal", 120)
    expect([l.costoOriginal, l.totalLinea, totalDeLinea(l)]).toEqual([120, null, 1200])
  })
  it("sin total fijado, cambiar la cantidad deja el costo unitario igual", () => {
    const l = aplicarCambioLinea({ cantidad: 2, costoOriginal: 50 }, "cantidad", 5)
    expect([l.costoOriginal, totalDeLinea(l)]).toEqual([50, 250])
  })
  it("cantidad 0 no divide; valores negativos o vacíos cuentan como 0", () => {
    expect(aplicarCambioLinea({ cantidad: 0, costoOriginal: 7 }, "totalLinea", 100).costoOriginal).toBe(7)
    expect(aplicarCambioLinea({ cantidad: 4, costoOriginal: 7 }, "totalLinea", -5).costoOriginal).toBe(0)
  })
})
