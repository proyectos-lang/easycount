/**
 * Construye el HTML de la tirilla termica (80 mm) "ORDEN DE RETIRO EN BODEGA"
 * de una venta: mismo numero de factura y mismo listado de productos (codigo,
 * nombre y cantidad), SIN precios ni pagos. La bodega la usa para despachar.
 *
 * Se imprime despues de la tirilla de la factura cuando la empresa tiene el
 * flag `ventas_orden_retiro_bodega`. Igual que `buildTirillaVentaHtml`, solo
 * arma el string (con `<style id="page-style">` para `printTirilla`).
 */
import { formatNumber } from "@/lib/utils/format"
import type { TirillaVenta } from "@/lib/utils/tirilla-venta"

/** Escapa `< > &` para no romper el HTML con nombres del usuario. */
const esc = (s: string | null | undefined): string =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

function fmtFechaHora(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-HN", {
      // fecha_venta se guarda HN-as-UTC: leer en UTC para no restar 6h.
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

/**
 * Reutiliza los datos de la tirilla de la venta (`TirillaVenta`) para que la
 * orden de retiro salga siempre con el mismo numero y las mismas lineas.
 * El codigo de cada producto se imprime SIEMPRE (no depende del flag
 * `tirilla_mostrar_codigo`): es lo que la bodega busca en el estante.
 */
export function buildTirillaRetiroHtml(v: TirillaVenta): string {
  const totalUnidades = v.lineas.reduce((s, l) => s + (Number(l.cantidad) || 0), 0)

  const itemsHtml = v.lineas
    .map(
      (l) => `<div class="item">
  <div class="row">
    <span class="code">${esc(l.codigo) || "—"}</span>
    <span class="qty">${formatNumber(l.cantidad)}</span>
  </div>
  <div class="item-name">${esc(l.nombre)}</div>
</div>`,
    )
    .join("")

  const numeroFiscalHtml = v.fiscal?.numeroFiscal
    ? `<div class="meta"><b>No. fiscal:</b> <span class="mono">${esc(v.fiscal.numeroFiscal)}</span></div>`
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
    font-family: Arial, Helvetica, 'Segoe UI', sans-serif;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.45;
    color: #000;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .emp    { font-size: 15px; font-weight: 800; text-align: center; word-wrap: break-word; }
  .titulo { font-size: 16px; font-weight: 800; text-align: center; margin: 4px 0; border: 2px solid #000; padding: 3px 0; }
  .num    { font-size: 18px; font-weight: 800; text-align: center; margin: 2px 0 4px; }
  .meta   { font-size: 12px; margin: 1px 0; word-wrap: break-word; }
  .mono   { font-family: 'Courier New', monospace; font-weight: 700; }
  .line   { border-top: 1px solid #000; margin: 5px 0; }
  .head   { display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; }
  .item      { margin: 5px 0; }
  .item-name { font-size: 12px; font-weight: 700; word-wrap: break-word; }
  .row    { display: flex; justify-content: space-between; gap: 8px; }
  .code   { font-family: 'Courier New', monospace; font-size: 13px; font-weight: 800; word-break: break-all; }
  .qty    { font-size: 15px; font-weight: 800; white-space: nowrap; }
  .tot    { display: flex; justify-content: space-between; font-size: 13px; font-weight: 800; margin: 2px 0; }
  .firma  { margin-top: 26px; border-top: 1px solid #000; text-align: center; font-size: 11px; padding-top: 2px; }
</style></head>
<body>
  <div class="emp">${esc(v.empresa.nombre)}</div>
  <div class="titulo">ORDEN DE RETIRO EN BODEGA</div>
  <div class="num">Factura ${esc(v.numeroFactura)}</div>
  ${numeroFiscalHtml}
  <div class="meta"><b>Fecha:</b> ${esc(fmtFechaHora(v.fechaISO))}</div>
  <div class="meta"><b>Cliente:</b> ${esc(v.cliente)}</div>
  <div class="line"></div>
  <div class="head"><span>CÓDIGO / PRODUCTO</span><span>CANT.</span></div>
  <div class="line"></div>
  ${itemsHtml}
  <div class="line"></div>
  <div class="tot"><span>Referencias</span><span>${formatNumber(v.lineas.length)}</span></div>
  <div class="tot"><span>Total unidades</span><span>${formatNumber(totalUnidades)}</span></div>
  <div class="firma">Entregado por (bodega)</div>
  <div class="firma">Recibido por (cliente)</div>
</body></html>`
}
