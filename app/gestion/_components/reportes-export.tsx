"use client"

import * as React from "react"
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { exportToXlsx } from "@/lib/utils/export"

export type FilaReporte = Record<string, string | number | null>

/** Botones Excel / PDF de una tarjeta de Reportes (solo .xlsx y PDF). */
export function ExportarReporte({ titulo, archivo, filas }: { titulo: string; archivo: string; filas: FilaReporte[] }) {
  const { toast } = useToast()
  const [ocupado, setOcupado] = React.useState<"xlsx" | "pdf" | null>(null)
  const vacio = filas.length === 0

  async function excel() {
    setOcupado("xlsx")
    try {
      await exportToXlsx(filas, { sheetName: titulo.slice(0, 30), filename: archivo })
    } catch (e) {
      toast({ title: "No se pudo exportar", description: String((e as Error).message || e), variant: "destructive" })
    } finally { setOcupado(null) }
  }

  async function pdf() {
    setOcupado("pdf")
    try {
      const { jsPDF } = await import("jspdf")
      const autoTable = (await import("jspdf-autotable")).default
      const doc = new jsPDF({ orientation: Object.keys(filas[0] || {}).length > 6 ? "landscape" : "portrait", unit: "mm", format: "a4" })
      doc.setFontSize(14); doc.text(`EasyCount · ${titulo}`, 14, 14)
      doc.setFontSize(9); doc.setTextColor(120); doc.text(`Generado ${new Date().toLocaleString("es-HN")}`, 14, 20)
      const cols = Object.keys(filas[0] || {})
      autoTable(doc, {
        startY: 25, head: [cols], body: filas.map((f) => cols.map((c) => (f[c] == null ? "" : typeof f[c] === "number" ? Number(f[c]).toLocaleString("es-HN", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : String(f[c])))),
        styles: { fontSize: 8, cellPadding: 2 }, headStyles: { fillColor: [41, 37, 36] }, alternateRowStyles: { fillColor: [250, 250, 249] },
      })
      doc.save(`${archivo}-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (e) {
      toast({ title: "No se pudo generar el PDF", description: String((e as Error).message || e), variant: "destructive" })
    } finally { setOcupado(null) }
  }

  return (
    <div className="flex gap-1.5">
      <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs" onClick={excel} disabled={vacio || ocupado !== null}>{ocupado === "xlsx" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />} Excel</Button>
      <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs" onClick={pdf} disabled={vacio || ocupado !== null}>{ocupado === "pdf" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />} PDF</Button>
    </div>
  )
}
