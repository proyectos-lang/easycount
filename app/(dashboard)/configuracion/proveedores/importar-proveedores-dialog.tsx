"use client"

import * as React from "react"
import {
  Upload, FileDown, FileSpreadsheet, Loader2, CheckCircle2, AlertTriangle, X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import {
  parsearArchivoProveedores, previsualizarImportProveedores, importarProveedores, descargarPlantillaProveedores,
  type FilaProveedorImport, type PreviewProveedores, type ResultadoImportProveedores,
} from "@/lib/services/importar-proveedores"

export function ImportarProveedoresDialog({ onImported }: { onImported: () => void }) {
  const { toast } = useToast()

  const [open, setOpen] = React.useState(false)
  const [filas, setFilas] = React.useState<FilaProveedorImport[]>([])
  const [nombreArchivo, setNombreArchivo] = React.useState("")
  const [preview, setPreview] = React.useState<PreviewProveedores | null>(null)
  const [parsing, setParsing] = React.useState(false)
  const [descargando, setDescargando] = React.useState(false)
  const [importando, setImportando] = React.useState(false)
  const [resultado, setResultado] = React.useState<ResultadoImportProveedores | null>(null)

  function resetArchivo() {
    setFilas([]); setNombreArchivo(""); setPreview(null); setResultado(null)
  }

  async function descargarPlantilla() {
    setDescargando(true)
    try {
      descargarPlantillaProveedores()
    } catch {
      toast({ title: "Error", description: "No se pudo generar la plantilla.", variant: "destructive" })
    } finally {
      setDescargando(false)
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setParsing(true)
    setResultado(null)
    try {
      const parsed = await parsearArchivoProveedores(file)
      if (parsed.length === 0) {
        toast({ title: "Archivo vacío", description: "No se encontraron proveedores válidos.", variant: "destructive" })
        resetArchivo()
        return
      }
      setFilas(parsed)
      setNombreArchivo(file.name)
      setPreview(await previsualizarImportProveedores(parsed))
    } catch {
      toast({ title: "Error", description: "No se pudo leer el archivo. Verifica que sea un Excel válido.", variant: "destructive" })
      resetArchivo()
    } finally {
      setParsing(false)
      e.target.value = ""
    }
  }

  const listoParaImportar = !!preview && preview.nuevos > 0

  async function ejecutar() {
    if (!listoParaImportar) return
    setImportando(true)
    try {
      const res = await importarProveedores(filas)
      if (res.error || !res.data) {
        toast({ title: "No se pudo cargar", description: res.error || "Error desconocido", variant: "destructive" })
        return
      }
      setResultado(res.data)
      if (res.data.creados > 0) {
        toast({ title: "Carga completada", description: `${res.data.creados} proveedor(es) creado(s).` })
        onImported()
      }
    } finally {
      setImportando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!importando) { setOpen(o); if (!o) resetArchivo() } }}>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" /> Carga masiva
      </Button>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Carga masiva de proveedores</DialogTitle>
          <DialogDescription>
            Descarga la plantilla, complétala con tus proveedores y súbela. Se omiten los que ya existen (por RTN o nombre).
          </DialogDescription>
        </DialogHeader>

        {resultado ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border p-3 bg-emerald-50/60">
                <p className="text-2xl font-bold text-emerald-700">{resultado.creados}</p>
                <p className="text-xs text-stone-500">Creados</p>
              </div>
              <div className="rounded-lg border p-3 bg-amber-50/60">
                <p className="text-2xl font-bold text-amber-700">{resultado.omitidos}</p>
                <p className="text-xs text-stone-500">Omitidos</p>
              </div>
              <div className="rounded-lg border p-3 bg-red-50/60">
                <p className="text-2xl font-bold text-red-700">{resultado.errores}</p>
                <p className="text-xs text-stone-500">Con error</p>
              </div>
            </div>
            {resultado.proveedores.some((p) => p.estado !== "creado") && (
              <ScrollArea className="h-40 rounded-md border">
                <div className="p-2 space-y-1">
                  {resultado.proveedores.filter((p) => p.estado !== "creado").map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <Badge
                        variant="secondary"
                        className={p.estado === "omitido" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}
                      >
                        {p.identificador}
                      </Badge>
                      <span className="text-stone-600">{p.detalle}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={resetArchivo}>Cargar otro archivo</Button>
              <Button onClick={() => { setOpen(false); resetArchivo() }}>Cerrar</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-dashed p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={descargarPlantilla} disabled={descargando}>
                  {descargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                  Descargar plantilla
                </Button>
                <label className="inline-flex">
                  <input type="file" accept=".xlsx,.xls" className="hidden" onChange={onFile} />
                  <span className="inline-flex items-center gap-2 text-sm font-medium border rounded-md px-3 py-1.5 cursor-pointer hover:bg-stone-50">
                    {parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
                    {parsing ? "Leyendo…" : "Elegir archivo"}
                  </span>
                </label>
              </div>

              {nombreArchivo && preview && (
                <div className="text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium">{nombreArchivo}</span>
                    <button className="ml-auto text-stone-400 hover:text-stone-600" onClick={resetArchivo}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="rounded bg-stone-50 p-2"><p className="font-bold">{preview.total}</p><p className="text-xs text-stone-500">Filas</p></div>
                    <div className="rounded bg-stone-50 p-2"><p className="font-bold">{preview.nuevos}</p><p className="text-xs text-stone-500">Nuevos</p></div>
                  </div>

                  {preview.duplicados.length > 0 && (
                    <p className="flex items-start gap-1.5 text-xs text-amber-700">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      {preview.duplicados.length} ya existen (se omiten): {preview.duplicados.slice(0, 8).join(", ")}{preview.duplicados.length > 8 ? "…" : ""}
                    </p>
                  )}
                  {preview.sinNombre > 0 && (
                    <p className="flex items-start gap-1.5 text-xs text-red-700">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      {preview.sinNombre} fila(s) sin nombre se ignorarán.
                    </p>
                  )}
                  {preview.nuevos > 0 && (
                    <p className="flex items-center gap-1.5 text-xs text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Se crearán {preview.nuevos} proveedor(es) nuevo(s).
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setOpen(false); resetArchivo() }} disabled={importando}>Cancelar</Button>
              <Button onClick={ejecutar} disabled={!listoParaImportar || importando} className="gap-2">
                {importando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {importando ? "Cargando…" : "Cargar"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
