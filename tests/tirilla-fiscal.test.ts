import { describe, it, expect } from "vitest"
import { buildTirillaVentaHtml, type TirillaVenta } from "@/lib/utils/tirilla-venta"
import { calcularDesgloseFiscal } from "@/lib/services/facturacion-cai"

const base: TirillaVenta = {
  empresa: { nombre: "Camisetas Cacao", rtn: "0801-0000-000000" },
  numeroFactura: "FC-0123",
  fechaISO: "2026-09-20T15:00:00",
  cliente: "Consumidor Final",
  lineas: [{ nombre: "Producto Demo", cantidad: 1, precioUnitario: 1000 }],
  subtotal: 1000,
  descuentoPct: 0,
  descuentoMonto: 0,
  mostrarIsv: true,
  isv: 150,
  total: 1150,
  pagos: [{ metodo: "Efectivo", monto: 1150 }],
  valorPagado: 1150,
  saldo: 0,
}

describe("tirilla sin fiscal (retrocompatible)", () => {
  it("imprime el recibo interno de siempre", () => {
    const html = buildTirillaVentaHtml(base)
    expect(html).toContain("Factura:")
    expect(html).toContain("FC-0123")
    expect(html).not.toContain("CAI:")
    expect(html).not.toContain("Son:")
  })
})

describe("tirilla fiscal (CAI)", () => {
  it("imprime encabezado CAI, correlativo, desglose y total en letras", () => {
    const desglose = calcularDesgloseFiscal(1000, 150, true)
    const html = buildTirillaVentaHtml({
      ...base,
      fiscal: {
        cai: "ABC-123",
        numeroFiscal: "000-001-01-00000003",
        rangoDesde: "000-001-01-00000001",
        rangoHasta: "000-001-01-00000200",
        fechaLimite: "27/04/2026",
        clienteRtn: null,
        esConsumidorFinal: true,
        ...desglose,
        totalEnLetras: "MIL CIENTO CINCUENTA LEMPIRAS Y CERO CENTAVOS EXACTOS",
      },
    })
    expect(html).toContain("CAI:")
    expect(html).toContain("ABC-123")
    expect(html).toContain("000-001-01-00000003")
    expect(html).toContain("Rango:")
    expect(html).toContain("Fecha límite de emisión:")
    expect(html).toContain("CONSUMIDOR FINAL")
    expect(html).toContain("Importe gravado 15%")
    expect(html).toContain("ISV 15%")
    expect(html).toContain("MIL CIENTO CINCUENTA LEMPIRAS Y CERO CENTAVOS EXACTOS")
    expect(html).toContain("Original: Cliente")
  })
})

describe("calcularDesgloseFiscal", () => {
  it("con ISV: todo gravado 15%", () => {
    expect(calcularDesgloseFiscal(1000, 150, true)).toEqual({
      importeExento: 0, importeExonerado: 0, importeGravado15: 1000,
      importeGravado18: 0, isv15: 150, isv18: 0,
    })
  })
  it("sin ISV: todo exento", () => {
    expect(calcularDesgloseFiscal(1000, 0, false)).toEqual({
      importeExento: 1000, importeExonerado: 0, importeGravado15: 0,
      importeGravado18: 0, isv15: 0, isv18: 0,
    })
  })
})
