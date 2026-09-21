import { describe, it, expect } from "vitest"
import { normalizarMetodo } from "@/lib/services/importar-ventas"

describe("normalizarMetodo (método de pago por fila del Excel)", () => {
  it("detecta crédito y sinónimos", () => {
    expect(normalizarMetodo("Credito")).toBe("Credito")
    expect(normalizarMetodo("Crédito")).toBe("Credito")
    expect(normalizarMetodo("CREDITO")).toBe("Credito")
    expect(normalizarMetodo("Por cobrar")).toBe("Credito")
    expect(normalizarMetodo("fiado")).toBe("Credito")
  })
  it("detecta banco/tarjeta y sinónimos", () => {
    expect(normalizarMetodo("Banco")).toBe("Banco")
    expect(normalizarMetodo("Tarjeta")).toBe("Banco")
    expect(normalizarMetodo("Transferencia")).toBe("Banco")
    expect(normalizarMetodo("Depósito")).toBe("Banco")
    expect(normalizarMetodo("POS")).toBe("Banco")
  })
  it("detecta efectivo/contado", () => {
    expect(normalizarMetodo("Efectivo")).toBe("Efectivo")
    expect(normalizarMetodo("Contado")).toBe("Efectivo")
    expect(normalizarMetodo("cash")).toBe("Efectivo")
  })
  it("vacío o desconocido -> '' (usa el default global)", () => {
    expect(normalizarMetodo("")).toBe("")
    expect(normalizarMetodo(null)).toBe("")
    expect(normalizarMetodo(undefined)).toBe("")
    expect(normalizarMetodo("xyz")).toBe("")
  })
})
