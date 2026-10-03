import { describe, it, expect } from "vitest"
import { buildTirillaRetiroHtml } from "@/lib/utils/tirilla-retiro"
import { buildTirillaVentaHtml, type TirillaVenta } from "@/lib/utils/tirilla-venta"
import { combinarTirillas } from "@/lib/print-tirilla"

const venta: TirillaVenta = {
  empresa: { nombre: "Ferretería <Uno>" },
  numeroFactura: "FC-0123",
  fechaISO: "2026-10-02T15:30:00.000Z",
  cliente: "Juan Pérez",
  lineas: [
    { nombre: "Martillo", cantidad: 2, precioUnitario: 150, codigo: "MRT-01" },
    { nombre: "Flete", cantidad: 1, precioUnitario: 300, codigo: "" },
  ],
  subtotal: 600, descuentoPct: 0, descuentoMonto: 0, mostrarIsv: false, isv: 0, total: 600,
  pagos: [{ metodo: "Efectivo", monto: 600 }], valorPagado: 600, saldo: 0,
  mostrarCodigoProducto: false,
}

describe("buildTirillaRetiroHtml", () => {
  const html = buildTirillaRetiroHtml(venta)

  it("lleva el título y el mismo número de factura", () => {
    expect(html).toContain("ORDEN DE RETIRO EN BODEGA")
    expect(html).toContain("Factura FC-0123")
  })

  it("imprime el código aunque el flag de código en tirilla esté apagado", () => {
    expect(html).toContain("MRT-01")
    expect(html).toContain("Martillo")
    expect(html).toContain("—") // línea sin código
  })

  it("no muestra precios ni pagos", () => {
    expect(html).not.toContain("150")
    expect(html).not.toContain("Efectivo")
    expect(html).not.toContain("TOTAL<")
  })

  it("totaliza referencias y unidades, escapa HTML y deja el page-style para printTirilla", () => {
    expect(html).toMatch(/Referencias<\/span><span>2</)
    expect(html).toMatch(/Total unidades<\/span><span>3</)
    expect(html).toContain("Ferretería &lt;Uno&gt;")
    expect(html).toContain('id="page-style"')
  })

  it("muestra el número fiscal si la venta es CAI", () => {
    const h = buildTirillaRetiroHtml({ ...venta, fiscal: { cai: "X", numeroFiscal: "000-001-01-00000009", importeExento: 0, importeExonerado: 0, importeGravado15: 0, importeGravado18: 0, isv15: 0, isv18: 0, totalEnLetras: "" } })
    expect(h).toContain("000-001-01-00000009")
  })
})

describe("combinarTirillas", () => {
  const html = combinarTirillas([buildTirillaVentaHtml(venta), buildTirillaRetiroHtml(venta)])

  it("pone cada tirilla en su propia página con nombre", () => {
    expect(html).toContain('class="tirilla-sec tirilla-s0" style="page: t0"')
    expect(html).toContain('class="tirilla-sec tirilla-s1" style="page: t1"')
    expect(html).toContain('id="page-style"')
    expect(html.match(/<body/g)).toHaveLength(1)
  })

  it("aísla el CSS de cada tirilla para que no se pisen", () => {
    expect(html).toContain(".tirilla-s0 .row")
    expect(html).toContain(".tirilla-s1 .row")
    expect(html).toMatch(/\.tirilla-s0 \{[^}]*width: 80mm/)
    expect(html).not.toMatch(/(^|\n)\s*\.row\s*\{/)
  })

  it("conserva el contenido de ambas", () => {
    expect(html).toContain("Gracias por su compra")
    expect(html).toContain("ORDEN DE RETIRO EN BODEGA")
  })
})
