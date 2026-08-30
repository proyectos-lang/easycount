/**
 * Generador de factura A4 en PDF (jsPDF). Hoy lo usa el modulo de Devoluciones
 * para la "factura de devolucion", que reutiliza el MISMO layout que la factura
 * normal de Nueva Venta (cambia el titulo, la referencia a la factura original y
 * el pie con reembolso/motivo). Si se cambia el diseno de la factura de Nueva
 * Venta (app/(dashboard)/ventas/nueva/page.tsx -> generatePdfFromData), conviene
 * reflejarlo aqui para que ambas se vean igual.
 *
 * Solo cliente (usa `new Image()` y descarga por blob). No hace toasts: el
 * llamador decide el mensaje segun `{ ok, error }`.
 */
import { jsPDF } from "jspdf"

export interface FacturaPdfEmpresa {
  nombre_empresa?: string | null
  nombre_comercial?: string | null
  documento?: string | null // RTN de la empresa
  direccion?: string | null
  telefono?: string | null
  correo?: string | null
  logo_url?: string | null
}

export interface FacturaPdfLinea {
  nombre: string
  cantidad: number
  precioUnitario: number
}

export interface FacturaPdfParams {
  /** "venta" (default) o "devolucion". */
  tipo?: "venta" | "devolucion"
  empresa: FacturaPdfEmpresa | null
  /** Numero de factura o de devolucion. */
  numeroDocumento: string
  /** Solo devolucion: numero de la factura original. */
  facturaReferencia?: string | null
  clienteNombre: string
  clienteRtn?: string | null
  /** ISO o YYYY-MM-DD (se hace split por 'T'). */
  fecha: string
  lineas: FacturaPdfLinea[]
  subtotal: number
  descuentoPct?: number
  /** Si no se pasa, se calcula desde subtotal * pct. */
  descuentoMonto?: number
  /** Imprime la fila de ISV (por defecto true; en devolucion se envia false). */
  mostrarIsv?: boolean
  isvPct?: number
  isv?: number
  total: number
  /** Solo devolucion: metodo de reembolso (ej. "Efectivo (caja chica)"). */
  reembolsoMetodo?: string | null
  /** Solo devolucion: motivo. */
  motivo?: string | null
  /** Nombre del archivo (sin extension se le agrega .pdf si falta). */
  filename?: string
}

export async function generarFacturaPdf(
  params: FacturaPdfParams
): Promise<{ ok: boolean; error?: string }> {
  const {
    tipo = "venta",
    empresa,
    numeroDocumento,
    facturaReferencia,
    clienteNombre,
    clienteRtn,
    fecha,
    lineas,
    subtotal,
    descuentoPct = 0,
    mostrarIsv = true,
    isvPct = 15,
    isv = 0,
    total,
    reembolsoMetodo,
    motivo,
  } = params
  const esDevolucion = tipo === "devolucion"

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Fondo gris claro
  doc.setFillColor(245, 245, 245)
  doc.rect(0, 0, pageWidth, pageHeight, "F")

  // === LOGO (arriba izquierda) ===
  try {
    const logoUrl = empresa?.logo_url || ""
    if (!logoUrl) throw new Error("no-logo")
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = logoUrl
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      setTimeout(resolve, 1000)
    })
    if (img.complete && img.naturalWidth > 0) {
      doc.addImage(img, "PNG", 20, 12, 50, 12)
    }
  } catch {
    doc.setTextColor(30, 30, 30)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(empresa?.nombre_empresa || "Mi Empresa", 20, 20)
  }

  // Contacto - columna izquierda
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  const contactY = 32
  doc.setFont("helvetica", "normal")
  doc.text("Correo", 20, contactY)
  doc.text("Telefono", 20, contactY + 8)
  doc.text("Direccion", 20, contactY + 16)
  doc.setTextColor(30, 30, 30)
  doc.text(empresa?.correo || "", 20, contactY + 4)
  doc.text(empresa?.telefono || "", 20, contactY + 12)
  doc.text((empresa?.direccion || "").substring(0, 35), 20, contactY + 20)

  // Contacto - columna derecha (RTN empresa)
  doc.setTextColor(100, 100, 100)
  doc.text("RTN", 80, contactY)
  doc.setTextColor(30, 30, 30)
  doc.text(empresa?.documento || "N/A", 80, contactY + 4)

  // === Titulo (derecha) ===
  doc.setTextColor(30, 30, 30)
  doc.setFont("helvetica", "bold")
  if (esDevolucion) {
    doc.setFontSize(22)
    doc.text("DEVOLUCION", pageWidth - 20, 26, { align: "right" })
  } else {
    doc.setFontSize(28)
    doc.text("FACTURA", pageWidth - 20, 28, { align: "right" })
  }

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(`#${numeroDocumento}`, pageWidth - 20, 38, { align: "right" })
  if (esDevolucion && facturaReferencia) {
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`Factura original: ${facturaReferencia}`, pageWidth - 20, 45, { align: "right" })
    doc.setTextColor(30, 30, 30)
  }

  // === Cliente ===
  const clienteY = 85
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.line(20, clienteY - 5, pageWidth - 20, clienteY - 5)

  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text("Cliente", 20, clienteY)
  doc.text("RTN Cliente", 80, clienteY)
  doc.text("Fecha", pageWidth - 60, clienteY)

  doc.setTextColor(30, 30, 30)
  doc.setFont("helvetica", "normal")
  doc.text(clienteNombre || "N/A", 20, clienteY + 6)
  doc.text(clienteRtn || "N/A", 80, clienteY + 6)
  doc.text((fecha || "").split("T")[0], pageWidth - 60, clienteY + 6)

  // === Encabezado de items ===
  const descY = 110
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 30, 30)
  doc.text(esDevolucion ? "Productos devueltos" : "Descripcion", 20, descY)

  doc.setDrawColor(30, 30, 30)
  doc.setLineWidth(0.8)
  doc.line(20, descY + 3, pageWidth - 20, descY + 3)

  // === Items ===
  let itemY = descY + 18
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  lineas.forEach((d) => {
    const sub = (d.cantidad ?? 0) * (d.precioUnitario ?? 0)
    doc.setTextColor(30, 30, 30)
    doc.text(`${d.nombre || ""} (x${d.cantidad})`, 20, itemY)
    doc.text(`L ${sub.toFixed(2)}`, pageWidth - 20, itemY, { align: "right" })
    doc.setDrawColor(180, 180, 180)
    doc.setLineDashPattern([1, 1], 0)
    doc.line(20, itemY + 4, pageWidth - 20, itemY + 4)
    doc.setLineDashPattern([], 0)
    itemY += 12
  })

  // === Totales ===
  const totalsY = Math.max(itemY + 15, 180)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 100, 100)

  doc.text("Subtotal", pageWidth - 80, totalsY)
  doc.setTextColor(30, 30, 30)
  doc.text(`L ${subtotal.toFixed(2)}`, pageWidth - 20, totalsY, { align: "right" })
  doc.setDrawColor(180, 180, 180)
  doc.setLineDashPattern([1, 1], 0)
  doc.line(pageWidth - 80, totalsY + 3, pageWidth - 20, totalsY + 3)
  doc.setLineDashPattern([], 0)

  let rowOffset = 12
  if (descuentoPct > 0) {
    const descuentoMonto = params.descuentoMonto ?? subtotal * (descuentoPct / 100)
    doc.setTextColor(100, 100, 100)
    const pctLabel =
      descuentoPct % 1 === 0 ? `${descuentoPct.toFixed(0)}%` : `${descuentoPct.toFixed(2)}%`
    doc.text(`Descuento (${pctLabel})`, pageWidth - 80, totalsY + rowOffset)
    doc.setTextColor(30, 30, 30)
    doc.text(`- L ${descuentoMonto.toFixed(2)}`, pageWidth - 20, totalsY + rowOffset, { align: "right" })
    doc.setDrawColor(180, 180, 180)
    doc.setLineDashPattern([1, 1], 0)
    doc.line(pageWidth - 80, totalsY + rowOffset + 3, pageWidth - 20, totalsY + rowOffset + 3)
    doc.setLineDashPattern([], 0)
    rowOffset += 12
  }

  if (mostrarIsv) {
    doc.setTextColor(100, 100, 100)
    doc.text(`ISV (${isvPct}%)`, pageWidth - 80, totalsY + rowOffset)
    doc.setTextColor(30, 30, 30)
    doc.text(`L ${isv.toFixed(2)}`, pageWidth - 20, totalsY + rowOffset, { align: "right" })
    doc.setDrawColor(180, 180, 180)
    doc.setLineDashPattern([1, 1], 0)
    doc.line(pageWidth - 80, totalsY + rowOffset + 3, pageWidth - 20, totalsY + rowOffset + 3)
    doc.setLineDashPattern([], 0)
  }

  // Total (14 mm bajo el ISV cuando se muestra; si no, justo bajo el subtotal/descuento)
  const totalY = totalsY + rowOffset + (mostrarIsv ? 14 : 0)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 30, 30)
  doc.text(esDevolucion ? "Total devuelto" : "Total", pageWidth - 80, totalY)
  doc.setFontSize(12)
  doc.text(`L ${total.toFixed(2)}`, pageWidth - 20, totalY, { align: "right" })

  // === Pie ===
  const footerY = pageHeight - 40
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.setLineDashPattern([], 0)
  doc.line(20, footerY - 10, pageWidth - 20, footerY - 10)

  // Izquierda: datos de la empresa
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 30, 30)
  doc.text(esDevolucion ? "Datos de la empresa" : "Detalles de Pago", 20, footerY)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(8)
  doc.text(`RTN: ${empresa?.documento || "N/A"}`, 20, footerY + 8)
  doc.text(`Tel: ${empresa?.telefono || "N/A"}`, 20, footerY + 14)

  // Derecha: condiciones (venta) o reembolso/motivo (devolucion)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 30, 30)
  doc.text(esDevolucion ? "Devolucion" : "Condiciones", 110, footerY)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(8)
  if (esDevolucion) {
    doc.text(`Reembolso: ${reembolsoMetodo || "N/A"}`, 110, footerY + 8)
    const motivoLinea = motivo ? `Motivo: ${motivo}` : "Nota de credito por devolucion."
    doc.text(motivoLinea.substring(0, 46), 110, footerY + 14)
  } else {
    doc.text("Gracias por su compra. Este documento", 110, footerY + 8)
    doc.text("es valido como comprobante fiscal.", 110, footerY + 14)
  }

  // Marca de agua
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(168, 162, 158)
  doc.text("Generado por EasyCount", pageWidth / 2, pageHeight - 8, { align: "center" })

  // Guardar + descarga automatica
  const base = params.filename || `${esDevolucion ? "Devolucion" : "Factura"}_${numeroDocumento}`
  const filename = base.toLowerCase().endsWith(".pdf") ? base : `${base}.pdf`
  try {
    const pdfBlob = doc.output("blob")
    const blobUrl = URL.createObjectURL(pdfBlob)
    const link = document.createElement("a")
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
    return { ok: true }
  } catch {
    return { ok: false, error: "No se pudo generar el PDF" }
  }
}
