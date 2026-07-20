import { describe, it, expect } from "vitest"
import { calcularProrrateoDetallado, type CompraDetalle } from "@/lib/services/compras"

function detalle(id: number, cantidad: number, costo: number): CompraDetalle {
  return { id, compra_id: 1, producto_id: id, cantidad, costo_unitario_moneda_origen: costo }
}

describe("calcularProrrateoDetallado", () => {
  it("reparte costos adicionales en proporción al valor (LPS)", () => {
    // A = 100 (100×1), B = 300 (100×3). Total 400. Costos 40.
    const r = calcularProrrateoDetallado([detalle(1, 100, 1), detalle(2, 100, 3)], 40, "LPS", 1)
    expect(r.subtotalLocal).toBe(400)
    // A recibe 25% de 40 = 10; B recibe 75% = 30.
    expect(r.lineas[0].costos_asignados).toBe(10)
    expect(r.lineas[1].costos_asignados).toBe(30)
    // Costo final unitario: A (100+10)/100 = 1.10; B (300+30)/100 = 3.30.
    expect(r.lineas[0].costo_final_unitario).toBe(1.1)
    expect(r.lineas[1].costo_final_unitario).toBe(3.3)
    // Control: costos asignados cuadran y el total es valor + costos.
    expect(r.totalCostosAsignados).toBe(40)
    expect(r.totalFinal).toBe(440)
  })

  it("convierte a Lempiras cuando la moneda es USD", () => {
    const r = calcularProrrateoDetallado([detalle(1, 10, 2)], 0, "USD", 25)
    // 10 × 2 USD × 25 = 500 L; sin costos, costo final = 50/unidad.
    expect(r.subtotalLocal).toBe(500)
    expect(r.lineas[0].valor_local).toBe(500)
    expect(r.lineas[0].costo_final_unitario).toBe(50)
  })

  it("sin costos adicionales, el costo final es el costo de compra", () => {
    const r = calcularProrrateoDetallado([detalle(1, 5, 8)], 0, "LPS", 1)
    expect(r.lineas[0].costo_final_unitario).toBe(8)
    expect(r.totalFinal).toBe(40)
  })

  it("no divide por cero si el subtotal es 0", () => {
    const r = calcularProrrateoDetallado([detalle(1, 0, 0)], 100, "LPS", 1)
    expect(r.lineas[0].proporcion).toBe(0)
    expect(r.lineas[0].costo_final_unitario).toBe(0)
  })
})
