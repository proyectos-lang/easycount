import { describe, it, expect } from "vitest"
import { enteroALetras, montoEnLetrasLempiras } from "@/lib/utils/numero-a-letras"

describe("enteroALetras", () => {
  it("números básicos", () => {
    expect(enteroALetras(0)).toBe("CERO")
    expect(enteroALetras(1)).toBe("UNO")
    expect(enteroALetras(15)).toBe("QUINCE")
    expect(enteroALetras(21)).toBe("VEINTIUNO")
    expect(enteroALetras(30)).toBe("TREINTA")
    expect(enteroALetras(45)).toBe("CUARENTA Y CINCO")
    expect(enteroALetras(100)).toBe("CIEN")
    expect(enteroALetras(101)).toBe("CIENTO UNO")
    expect(enteroALetras(150)).toBe("CIENTO CINCUENTA")
    expect(enteroALetras(999)).toBe("NOVECIENTOS NOVENTA Y NUEVE")
  })
  it("miles con apócope", () => {
    expect(enteroALetras(1000)).toBe("MIL")
    expect(enteroALetras(1150)).toBe("MIL CIENTO CINCUENTA")
    expect(enteroALetras(2000)).toBe("DOS MIL")
    expect(enteroALetras(21000)).toBe("VEINTIUN MIL")
    expect(enteroALetras(100000)).toBe("CIEN MIL")
  })
  it("millones", () => {
    expect(enteroALetras(1000000)).toBe("UN MILLON")
    expect(enteroALetras(2000000)).toBe("DOS MILLONES")
    expect(enteroALetras(1500000)).toBe("UN MILLON QUINIENTOS MIL")
  })
})

describe("montoEnLetrasLempiras", () => {
  it("coincide con el formato de la factura demo del SAR", () => {
    expect(montoEnLetrasLempiras(1150)).toBe(
      "MIL CIENTO CINCUENTA LEMPIRAS Y CERO CENTAVOS EXACTOS"
    )
  })
  it("cero", () => {
    expect(montoEnLetrasLempiras(0)).toBe("CERO LEMPIRAS Y CERO CENTAVOS EXACTOS")
  })
  it("singular y centavos", () => {
    expect(montoEnLetrasLempiras(1)).toBe("UN LEMPIRA Y CERO CENTAVOS EXACTOS")
    expect(montoEnLetrasLempiras(1.5)).toBe("UN LEMPIRA Y CINCUENTA CENTAVOS")
    expect(montoEnLetrasLempiras(1.01)).toBe("UN LEMPIRA Y UN CENTAVO")
  })
  it("redondeo de centavos que sube el entero", () => {
    expect(montoEnLetrasLempiras(0.999)).toBe("UN LEMPIRA Y CERO CENTAVOS EXACTOS")
  })
  it("montos grandes", () => {
    expect(montoEnLetrasLempiras(1234.56)).toBe(
      "MIL DOSCIENTOS TREINTA Y CUATRO LEMPIRAS Y CINCUENTA Y SEIS CENTAVOS"
    )
  })
})
