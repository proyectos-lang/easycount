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
  /** URL absoluta de un logo a imprimir arriba de la tirilla (opcional). */
  logoUrl?: string | null
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
  /** Efectivo con el que pagó el cliente (para mostrar el vuelto). Opcional. */
  efectivoRecibido?: number | null
  /** Vuelto/cambio a devolver (efectivoRecibido − efectivo aplicado). Opcional. */
  vuelto?: number | null
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
      // fecha_venta se guarda HN-as-UTC: leer en UTC para no restar 6h
      // (una venta de las 19:00 se imprimia 13:00 sin esto).
      timeZone: "UTC",
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

  const vueltoHtml =
    v.vuelto != null && v.vuelto > 0
      ? `<div class="row"><span>Efectivo recibido</span><span>${formatCurrency(v.efectivoRecibido ?? 0)}</span></div>` +
        `<div class="row bold"><span>Vuelto</span><span>${formatCurrency(v.vuelto)}</span></div>`
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
    padding: 1mm 3mm 3mm 3mm;
    /* Sans-serif y peso alto: en impresoras termicas el texto delgado sale
       tenue; con bold se lee nitido sin verse deforme. */
    font-family: Arial, Helvetica, 'Segoe UI', sans-serif;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.45;
    color: #000;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .center { text-align: center; }
  .logo   { display: block; margin: 0 auto 4px; max-width: 55mm; max-height: 30mm; width: auto; height: auto; }
  .emp    { font-size: 17px; font-weight: 800; text-align: center; word-wrap: break-word; }
  .sub    { font-size: 11px; font-weight: 700; text-align: center; line-height: 1.35; word-wrap: break-word; }
  .meta   { font-size: 12px; margin: 1px 0; }
  .line   { border-top: 1px solid #000; margin: 5px 0; }
  .item       { margin: 4px 0; }
  .item-name  { font-size: 12px; font-weight: 800; word-wrap: break-word; }
  .row    { display: flex; justify-content: space-between; font-size: 12px; margin: 2px 0; gap: 8px; }
  .row span:last-child { white-space: nowrap; text-align: right; }
  .row.bold   { font-weight: 800; }
  .row.total  { font-size: 16px; font-weight: 800; margin: 4px 0; }
  .foot   { text-align: center; font-size: 12px; margin-top: 8px; }
</style></head>
<body>
  ${e.logoUrl ? `<img class="logo" src="${esc(e.logoUrl)}" alt="">` : ""}
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
  ${vueltoHtml}
  <div class="line"></div>
  <div class="foot">Gracias por su compra</div>
</body></html>`
}
