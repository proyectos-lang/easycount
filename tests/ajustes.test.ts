import { describe, it, expect } from "vitest"
import { calcularLineasAjuste, type AjusteLineaInput } from "@/lib/services/inventario"

function linea(id: number, actual: number, real: number): AjusteLineaInput {
  return {
    producto_id: id,
    almacen_id: 1,
    localizacion_id: 1,
    stock_actual: actual,
    stock_real: real,
    costo_unitario: 25,
  }
}

describe("calcularLineasAjuste", () => {
  it("no genera línea si la cantidad real coincide con la actual", () => {
    expect(calcularLineasAjuste([linea(1, 10, 10)])).toEqual([])
  })

  it("faltante genera salida (delta negativo)", () => {
    const r = calcularLineasAjuste([linea(1, 10, 7)])
    expect(r).toHaveLength(1)
    expect(r[0].delta).toBe(-3)
  })

  it("sobrante genera entrada (delta positivo)", () => {
    const r = calcularLineasAjuste([linea(1, 10, 12)])
    expect(r).toHaveLength(1)
    expect(r[0].delta).toBe(2)
  })

  it("de varias líneas, solo devuelve las que cambian", () => {
    const r = calcularLineasAjuste([linea(1, 10, 10), linea(2, 5, 8), linea(3, 3, 3), linea(4, 9, 0)])
    expect(r.map((l) => l.producto_id)).toEqual([2, 4])
    expect(r.map((l) => l.delta)).toEqual([3, -9])
  })

  it("conserva el costo unitario para congelarlo en el movimiento", () => {
    const r = calcularLineasAjuste([linea(1, 0, 4)])
    expect(r[0].costo_unitario).toBe(25)
  })
})
