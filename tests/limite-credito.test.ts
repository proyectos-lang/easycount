import { describe, it, expect } from "vitest"
import { excedeLimiteCredito } from "@/lib/services/ventas"

describe("excedeLimiteCredito", () => {
  it("límite 0/null/undefined = sin límite (nunca bloquea)", () => {
    expect(excedeLimiteCredito(999999, 999999, 0)).toBe(false)
    expect(excedeLimiteCredito(999999, 999999, null)).toBe(false)
    expect(excedeLimiteCredito(999999, 999999, undefined)).toBe(false)
  })
  it("bloquea cuando saldoActual + nuevo supera el límite", () => {
    // Debe 40k, esta venta deja 15k -> 55k > 50k -> bloquea.
    expect(excedeLimiteCredito(40000, 15000, 50000)).toBe(true)
  })
  it("NO bloquea si queda dentro del límite", () => {
    // Debe 30k, esta venta deja 15k -> 45k <= 50k -> ok.
    expect(excedeLimiteCredito(30000, 15000, 50000)).toBe(false)
  })
  it("justo en el límite NO bloquea (tolerancia de centavo)", () => {
    expect(excedeLimiteCredito(30000, 20000, 50000)).toBe(false)
    expect(excedeLimiteCredito(30000, 20000.01, 50000)).toBe(true)
  })
})
