import { describe, it, expect } from "vitest"
import { formatCurrency, formatNumber } from "@/lib/utils/format"

describe("formatCurrency", () => {
  it("formatea Lempiras con dos decimales", () => {
    expect(formatCurrency(1234.5)).toBe("L 1,234.50")
  })
  it("maneja cero y valores nulos", () => {
    expect(formatCurrency(0)).toBe("L 0.00")
    expect(formatCurrency(NaN)).toBe("L 0.00")
  })
  it("maneja negativos (reembolsos, faltantes)", () => {
    expect(formatCurrency(-250)).toBe("L -250.00")
  })
})

describe("formatNumber", () => {
  it("separa miles sin simbolo de moneda", () => {
    expect(formatNumber(10000)).toBe("10,000")
  })
  it("conserva hasta dos decimales", () => {
    expect(formatNumber(12.345)).toBe("12.35")
  })
})
