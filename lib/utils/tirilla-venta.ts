/**
 * Construye el HTML de una tirilla termica (80 mm) para una venta.
 *
 * Devuelve un documento HTML COMPLETO listo para `printTirilla` (incluye el
 * `<style id="page-style">` con el @page que el helper sobrescribe con el alto
 * exacto medido). No imprime ni toca el DOM: solo arma el string, asi es
 * facil de testear y reutilizar (Nueva Venta, Historial, reimpresion, etc.).
 */
import { formatCurrency, formatNumber } from "@/lib/utils/format"

export interface TirillaEmpresa {
  nombre: string
  rtn?: string | null
  direccion?: string | null
  telefono?: string | null
}

export interface TirillaLinea {
  nombre: string
  cantidad: number
  precioUnitario: number
}

export interface TirillaPago {
  metodo: string
  monto: number
}

export interface TirillaVenta {
  empresa: TirillaEmpresa
  numeroFactura: string
  /** ISO string; se formatea a fecha+hora local es-HN. */
  fechaISO: string
  cliente: string
  lineas: TirillaLinea[]
  subtotal: number
  descuentoPct: number
  descuentoMonto: number
  /** Si es false, no se imprime la fila de ISV (empresa sin ISV). */
  mostrarIsv: boolean
  isv: number
  total: number
  pagos: TirillaPago[]
  valorPagado: number
  saldo: number
}

/** Escapa `< > &` para no romper el HTML con nombres/direcciones del usuario. */
const esc = (s: string | null | undefined): string =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

/** Etiqueta legible del metodo de pago (con la cuenta si aplica). */
export function metodoPagoLabel(metodo: string, cuentaNombre?: string | null): string {
  const base =
    metodo === "Efectivo"
      ? "Efectivo"
      : metodo === "Banco"
        ? "Banco"
        : metodo === "Link_Pago"
          ? "Link de Pago"
          : metodo === "Credito"
            ? "Credito"
            : "Otro"
  return cuentaNombre ? `${base} - ${cuentaNombre}` : base
}

function fmtFechaHora(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-HN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export function buildTirillaVentaHtml(v: TirillaVenta): string {
  const e = v.empresa

  const subLines: string[] = []
  if (e.rtn) subLines.push(`RTN: ${esc(e.rtn)}`)
  if (e.direccion) subLines.push(esc(e.direccion))
  if (e.telefono) subLines.push(`Tel: ${esc(e.telefono)}`)
  const subHtml = subLines.map((l) => `<div class="sub">${l}</div>`).join("")

  const itemsHtml = v.lineas
    .map((l) => {
      const lineaTotal = l.cantidad * l.precioUnitario
      return `<div class="item">
  <div class="item-name">${esc(l.nombre)}</div>
  <div class="row">
    <span>${formatNumber(l.cantidad)} x ${formatCurrency(l.precioUnitario)}</span>
    <span>${formatCurrency(lineaTotal)}</span>
  </div>
</div>`
    })
    .join("")

  const descuentoHtml =
    v.descuentoMonto > 0
      ? `<div class="row"><span>Descuento (${formatNumber(v.descuentoPct)}%)</span><span>- ${formatCurrency(v.descuentoMonto)}</span></div>`
      : ""

  const isvHtml = v.mostrarIsv
    ? `<div class="row"><span>ISV (15%)</span><span>${formatCurrency(v.isv)}</span></div>`
    : ""

  const pagosHtml = v.pagos
    .map(
      (p) =>
        `<div class="row"><span>${esc(p.metodo)}</span><span>${formatCurrency(p.monto)}</span></div>`
    )
    .join("")

  const saldoHtml =
    v.saldo > 0
      ? `<div class="row bold"><span>SALDO PENDIENTE</span><span>${formatCurrency(v.saldo)}</span></div>`
      : ""

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<style id="page-style">
  /* Se sobrescribe dinamicamente con el alto exacto medido. */
  @page { size: 80mm 500mm; margin: 0 !important; }
</style>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { margin: 0; padding: 0; }
  body {
    width: 80mm;
    margin: 0;
    padding: 1mm 3mm 2mm 3mm;
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    line-height: 1.5;
    color: #000;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .center { text-align: center; }
  .emp    { font-size: 16px; font-weight: 900; text-align: center; word-wrap: break-word; }
  .sub    { font-size: 10px; text-align: center; line-height: 1.4; word-wrap: break-word; }
  .meta   { font-size: 11px; margin: 1px 0; }
  .line   { border-top: 1px dashed #000; margin: 4px 0; }
  .item       { margin: 3px 0; }
  .item-name  { font-size: 11px; font-weight: 700; word-wrap: break-word; }
  .row    { display: flex; justify-content: space-between; font-size: 11px; margin: 1px 0; gap: 6px; }
  .row span:last-child { white-space: nowrap; text-align: right; }
  .row.bold   { font-weight: 700; }
  .row.total  { font-size: 15px; font-weight: 900; margin: 3px 0; }
  .foot   { text-align: center; font-size: 11px; margin-top: 6px; }
</style></head>
<body>
  <div class="emp">${esc(e.nombre)}</div>
  ${subHtml}
  <div class="line"></div>
  <div class="meta"><b>Factura:</b> ${esc(v.numeroFactura)}</div>
  <div class="meta"><b>Fecha:</b> ${esc(fmtFechaHora(v.fechaISO))}</div>
  <div class="meta"><b>Cliente:</b> ${esc(v.cliente)}</div>
  <div class="line"></div>
  ${itemsHtml}
  <div class="line"></div>
  <div class="row"><span>Subtotal</span><span>${formatCurrency(v.subtotal)}</span></div>
  ${descuentoHtml}
  ${isvHtml}
  <div class="row total"><span>TOTAL</span><span>${formatCurrency(v.total)}</span></div>
  <div class="line"></div>
  <div class="meta"><b>Forma de pago</b></div>
  ${pagosHtml}
  <div class="row"><span>Pagado</span><span>${formatCurrency(v.valorPagado)}</span></div>
  ${saldoHtml}
  <div class="line"></div>
  <div class="foot">Gracias por su compra</div>
</body></html>`
}
