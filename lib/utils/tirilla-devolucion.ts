/**
 * Construye el HTML de una tirilla termica (80 mm) para una DEVOLUCION.
 * Mismo estilo que la tirilla de venta (comparte lib/utils/tirilla-styles.ts).
 * Devuelve el documento completo listo para `printTirilla`.
 */
import { formatCurrency, formatNumber } from "@/lib/utils/format"
import { escTirilla as esc, wrapTirillaHtml } from "@/lib/utils/tirilla-styles"

export interface TirillaDevolucionLinea {
  nombre: string
  cantidad: number
  precioUnitario: number
  codigo?: string | null
}

export interface TirillaDevolucion {
  empresa: {
    nombre: string
    rtn?: string | null
    direccion?: string | null
    telefono?: string | null
    logoUrl?: string | null
  }
  numeroDevolucion: string
  numeroFactura: string
  /** ISO string (HN-as-UTC); se formatea a fecha+hora local es-HN. */
  fechaISO: string
  cliente: string
  lineas: TirillaDevolucionLinea[]
  total: number
  /** Metodo de reembolso, ej. "Efectivo (caja chica)". */
  reembolso: string
  motivo?: string | null
  /** Imprime el codigo de cada producto bajo su nombre. */
  mostrarCodigoProducto?: boolean
}

function fmtFechaHora(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-HN", {
      // fecha se guarda HN-as-UTC: leer en UTC para no restar 6h.
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

export function buildTirillaDevolucionHtml(d: TirillaDevolucion): string {
  const e = d.empresa

  const subLines: string[] = []
  if (e.rtn) subLines.push(`RTN: ${esc(e.rtn)}`)
  if (e.direccion) subLines.push(esc(e.direccion))
  if (e.telefono) subLines.push(`Tel: ${esc(e.telefono)}`)
  const subHtml = subLines.map((l) => `<div class="sub">${l}</div>`).join("")

  const itemsHtml = d.lineas
    .map((l) => {
      const lineaTotal = l.cantidad * l.precioUnitario
      const codigoHtml =
        d.mostrarCodigoProducto && l.codigo
          ? `<div class="item-code">Cod: ${esc(l.codigo)}</div>`
          : ""
      return `<div class="item">
  <div class="item-name">${esc(l.nombre)}</div>
  ${codigoHtml}
  <div class="row">
    <span>${formatNumber(l.cantidad)} x ${formatCurrency(l.precioUnitario)}</span>
    <span>${formatCurrency(lineaTotal)}</span>
  </div>
</div>`
    })
    .join("")

  const motivoHtml = d.motivo ? `<div class="meta"><b>Motivo:</b> ${esc(d.motivo)}</div>` : ""

  const body = `
  ${e.logoUrl ? `<img class="logo" src="${esc(e.logoUrl)}" alt="">` : ""}
  <div class="emp">${esc(e.nombre)}</div>
  ${subHtml}
  <div class="line"></div>
  <div class="title">DEVOLUCION</div>
  <div class="meta"><b>Devolucion:</b> ${esc(d.numeroDevolucion)}</div>
  <div class="meta"><b>Factura orig.:</b> ${esc(d.numeroFactura)}</div>
  <div class="meta"><b>Fecha:</b> ${esc(fmtFechaHora(d.fechaISO))}</div>
  <div class="meta"><b>Cliente:</b> ${esc(d.cliente)}</div>
  <div class="line"></div>
  ${itemsHtml}
  <div class="line"></div>
  <div class="row total"><span>TOTAL DEVUELTO</span><span>${formatCurrency(d.total)}</span></div>
  <div class="line"></div>
  <div class="meta"><b>Reembolso:</b> ${esc(d.reembolso)}</div>
  ${motivoHtml}
  <div class="line"></div>
  <div class="foot">Comprobante de devolucion</div>`

  return wrapTirillaHtml(body)
}
