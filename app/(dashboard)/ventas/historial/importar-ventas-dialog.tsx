"use client"

import * as React from "react"
import {
  Upload, FileDown, FileSpreadsheet, Loader2, CheckCircle2, AlertTriangle, X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils/format"
import { useCajaSesion } from "@/lib/hooks/use-caja-sesion"
import {
  getClientes, getAlmacenes, getLocalizaciones, saveCliente,
  type Cliente, type Almacen, type Localizacion,
} from "@/lib/services/catalogos"
import { getCuentas, type CuentaConfig } from "@/lib/services/cuentas"
import {
  parsearArchivoVentas, previsualizarImport, importarVentas, descargarPlantillaVentas,
  type FilaImport, type PreviewImport, type ResultadoImport,
} from "@/lib/services/importar-ventas"

const CLIENTE_GENERICO = "Consumidor Final"

export function ImportarVentasDialog({ onImported }: { onImported: () => void }) {
  const { toast } = useToast()
  const { sesion: cajaSesion } = useCajaSesion()

  const [open, setOpen] = React.useState(false)
  const [clientes, setClientes] = React.useState<Cliente[]>([])
  const [almacenes, setAlmacenes] = React.useState<Almacen[]>([])
  const [localizaciones, setLocalizaciones] = React.useState<Localizacion[]>([])
  const [cuentas, setCuentas] = React.useState<CuentaConfig[]>([])

  // Opciones elegidas por el usuario
  const [clienteId, setClienteId] = React.useState("")
  const [almacenId, setAlmacenId] = React.useState("")
  const [localizacionId, setLocalizacionId] = React.useState("")
  const [metodo, setMetodo] = React.useState<"Efectivo" | "Banco">("Banco")
  const [cuentaId, setCuentaId] = React.useState("")
  const [aplicaIsv, setAplicaIsv] = React.useState(false)

  // Archivo + preview + resultado
  const [filas, setFilas] = React.useState<FilaImport[]>([])
  const [nombreArchivo, setNombreArchivo] = React.useState("")
  const [preview, setPreview] = React.useState<PreviewImport | null>(null)
  const [parsing, setParsing] = React.useState(false)
  const [importando, setImportando] = React.useState(false)
  const [resultado, setResultado] = React.useState<ResultadoImport | null>(null)

  React.useEffect(() => {
    if (!open) return
    Promise.all([getClientes(), getAlmacenes(), getCuentas()]).then(([c, a, cu]) => {
      setClientes(c.data || [])
      setAlmacenes(a.data || [])
      const activas = (cu.data || []).filter((x) => x.activo !== false)
      setCuentas(activas)
      // Default: cliente generico (si existe), primera cuenta activa.
      const generico = (c.data || []).find((x) => x.nombre.trim().toLowerCase() === CLIENTE_GENERICO.toLowerCase())
      if (generico?.id) setClienteId(String(generico.id))
      if (activas[0]?.id) setCuentaId(String(activas[0].id))
    })
  }, [open])

  React.useEffect(() => {
    if (!almacenId) { setLocalizaciones([]); setLocalizacionId(""); return }
    getLocalizaciones(Number(almacenId)).then((r) => {
      setLocalizaciones(r.data || [])
      setLocalizacionId((r.data || []).length === 1 ? String(r.data[0].id) : "")
    })
  }, [almacenId])

  function resetArchivo() {
    setFilas([]); setNombreArchivo(""); setPreview(null); setResultado(null)
  }

  function resetTodo() {
    resetArchivo()
    setClienteId(""); setAlmacenId(""); setLocalizacionId(""); setMetodo("Banco"); setCuentaId(""); setAplicaIsv(false)
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setParsing(true)
    setResultado(null)
    try {
      const parsed = await parsearArchivoVentas(file)
      if (parsed.length === 0) {
        toast({ title: "Archivo vacío", description: "No se encontraron filas de ventas válidas.", variant: "destructive" })
        resetArchivo()
        return
      }
      setFilas(parsed)
      setNombreArchivo(file.name)
      const prev = await previsualizarImport(parsed)
      setPreview(prev)
    } catch {
      toast({ title: "Error", description: "No se pudo leer el archivo. Verifica que sea un Excel válido.", variant: "destructive" })
      resetArchivo()
    } finally {
      setParsing(false)
      e.target.value = "" // permite volver a elegir el mismo archivo
    }
  }

  async function crearClienteGenerico() {
    const res = await saveCliente({ nombre: CLIENTE_GENERICO } as Cliente, true)
    if (res.error || !res.data?.id) {
      toast({ title: "Error", description: res.error || "No se pudo crear el cliente", variant: "destructive" })
      return
    }
    setClientes((prev) => [...prev, res.data!])
    setClienteId(String(res.data.id))
    toast({ title: "Cliente creado", description: CLIENTE_GENERICO })
  }

  const nuevas = preview ? preview.facturas - preview.duplicadas.length : 0
  const listoParaImportar =
    !!clienteId && !!almacenId && !!localizacionId &&
    (metodo === "Efectivo" ? !!cajaSesion : !!cuentaId) &&
    filas.length > 0 && !!preview && preview.productosNoEncontrados.length === 0

  async function ejecutar() {
    if (!listoParaImportar) return
    setImportando(true)
    try {
      const res = await importarVentas(filas, {
        cliente_id: Number(clienteId),
        almacen_id: Number(almacenId),
        localizacion_id: Number(localizacionId),
        metodo,
        cuenta_id: metodo === "Banco" ? Number(cuentaId) : null,
        aplica_isv: aplicaIsv,
      })
      if (res.error || !res.data) {
        toast({ title: "No se pudo importar", description: res.error || "Error desconocido", variant: "destructive" })
        return
      }
      setResultado(res.data)
      if (res.data.creadas > 0) {
        toast({ title: "Importación completada", description: `${res.data.creadas} factura(s) creada(s).` })
        onImported()
      }
    } finally {
      setImportando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!importando) { setOpen(o); if (!o) resetTodo() } }}>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" /> Importar ventas
      </Button>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar ventas desde Excel</DialogTitle>
          <DialogDescription>
            Sube una plantilla con una línea por producto. El sistema agrupa por factura, crea cada
            venta y genera las mismas transacciones que una venta normal (inventario, caja y bancos).
          </DialogDescription>
        </DialogHeader>

        {resultado ? (
          // ---------- RESULTADO ----------
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border p-3 bg-emerald-50/60">
                <p className="text-2xl font-bold text-emerald-700">{resultado.creadas}</p>
                <p className="text-xs text-stone-500">Creadas</p>
              </div>
              <div className="rounded-lg border p-3 bg-amber-50/60">
                <p className="text-2xl font-bold text-amber-700">{resultado.omitidas}</p>
                <p className="text-xs text-stone-500">Omitidas</p>
              </div>
              <div className="rounded-lg border p-3 bg-red-50/60">
                <p className="text-2xl font-bold text-red-700">{resultado.errores}</p>
                <p className="text-xs text-stone-500">Con error</p>
              </div>
            </div>
            <p className="text-sm text-center text-stone-600">
              Total importado: <strong>{formatCurrency(resultado.totalImportado)}</strong>
            </p>
            {(resultado.omitidas > 0 || resultado.errores > 0) && (
              <ScrollArea className="h-40 rounded-md border">
                <div className="p-2 space-y-1">
                  {resultado.facturas.filter((f) => f.estado !== "creada").map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <Badge variant="secondary" className={f.estado === "omitida" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}>
                        {f.numero}
                      </Badge>
                      <span className="text-stone-600">{f.detalle}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={resetArchivo}>Importar otro archivo</Button>
              <Button onClick={() => { setOpen(false); resetTodo() }}>Cerrar</Button>
            </DialogFooter>
          </div>
        ) : (
          // ---------- CONFIGURACION ----------
          <div className="space-y-4">
            {/* Paso 1: opciones */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Cliente</Label>
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
                {!clientes.some((c) => c.nombre.trim().toLowerCase() === CLIENTE_GENERICO.toLowerCase()) && (
                  <Button variant="link" size="sm" className="h-auto p-0 justify-start text-xs" onClick={crearClienteGenerico}>
                    + Crear cliente &quot;{CLIENTE_GENERICO}&quot;
                  </Button>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label>Almacén</Label>
                <Select value={almacenId} onValueChange={setAlmacenId}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {almacenes.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Localización</Label>
                <Select value={localizacionId} onValueChange={setLocalizacionId} disabled={!almacenId}>
                  <SelectTrigger><SelectValue placeholder={almacenId ? "Seleccionar" : "Elige almacén"} /></SelectTrigger>
                  <SelectContent>
                    {localizaciones.map((l) => <SelectItem key={l.id} value={String(l.id)}>{l.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Método de pago</Label>
                <Select value={metodo} onValueChange={(v) => setMetodo(v as "Efectivo" | "Banco")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Banco">Banco / Tarjeta</SelectItem>
                    <SelectItem value="Efectivo" disabled={!cajaSesion}>
                      Efectivo{!cajaSesion ? " (caja cerrada)" : ""}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {metodo === "Banco" && (
                <div className="grid gap-1.5">
                  <Label>Cuenta de destino</Label>
                  <Select value={cuentaId} onValueChange={setCuentaId}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar cuenta" /></SelectTrigger>
                    <SelectContent>
                      {cuentas.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nombre} ({Number(c.porcentaje_comision || 0)}% comisión)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg border px-3 py-2 self-end">
                <div>
                  <Label className="text-sm">Aplicar ISV (15%)</Label>
                  <p className="text-xs text-muted-foreground">Si los subtotales del archivo no lo incluyen.</p>
                </div>
                <Switch checked={aplicaIsv} onCheckedChange={setAplicaIsv} />
              </div>
            </div>

            {/* Paso 2: archivo */}
            <div className="rounded-lg border border-dashed p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={descargarPlantillaVentas}>
                  <FileDown className="h-4 w-4" /> Descargar plantilla
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
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded bg-stone-50 p-2"><p className="font-bold">{preview.facturas}</p><p className="text-xs text-stone-500">Facturas</p></div>
                    <div className="rounded bg-stone-50 p-2"><p className="font-bold">{preview.lineas}</p><p className="text-xs text-stone-500">Líneas</p></div>
                    <div className="rounded bg-stone-50 p-2"><p className="font-bold">{formatCurrency(preview.total)}</p><p className="text-xs text-stone-500">Total</p></div>
                  </div>

                  {preview.duplicadas.length > 0 && (
                    <p className="flex items-start gap-1.5 text-xs text-amber-700">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      {preview.duplicadas.length} factura(s) ya existen y se omitirán: {preview.duplicadas.slice(0, 8).join(", ")}{preview.duplicadas.length > 8 ? "…" : ""}
                    </p>
                  )}
                  {preview.productosNoEncontrados.length > 0 && (
                    <p className="flex items-start gap-1.5 text-xs text-red-700">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      Productos no encontrados (corrige el archivo o el catálogo antes de importar): {preview.productosNoEncontrados.slice(0, 8).join(", ")}{preview.productosNoEncontrados.length > 8 ? "…" : ""}
                    </p>
                  )}
                  {preview.productosNoEncontrados.length === 0 && (
                    <p className="flex items-center gap-1.5 text-xs text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Se crearán {nuevas} factura(s) nueva(s).
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setOpen(false); resetTodo() }} disabled={importando}>Cancelar</Button>
              <Button onClick={ejecutar} disabled={!listoParaImportar || importando} className="gap-2">
                {importando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {importando ? "Importando…" : `Importar ${nuevas > 0 ? `${nuevas} factura(s)` : ""}`}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
