"use client"

import * as React from "react"
import { Truck, Plus, Trash2, Loader2, PackageCheck, CheckCircle2 } from "lucide-react"
// (Trash2 usado en las líneas de material)
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils/format"
import { getMateriales, type Material } from "@/lib/services/produccion-materiales"
import {
  getComprasMaterial, createCompraMaterial, recibirCompraMaterial,
  costearLineasMaterial, type CompraMaterial,
} from "@/lib/services/produccion-compras"
import {
  getProveedores, getAlmacenes, getLocalizaciones,
  type Proveedor, type Almacen, type Localizacion,
} from "@/lib/services/catalogos"

interface LineaForm { _id: string; material_id: string; cantidad: string; costo: string }
let seq = 0
const nid = () => `l-${++seq}`

export default function ComprasMaterialesPage() {
  const { toast } = useToast()
  const [compras, setCompras] = React.useState<CompraMaterial[]>([])
  const [materiales, setMateriales] = React.useState<Material[]>([])
  const [proveedores, setProveedores] = React.useState<Proveedor[]>([])
  const [almacenes, setAlmacenes] = React.useState<Almacen[]>([])
  const [loading, setLoading] = React.useState(true)

  // Nueva compra
  const [nuevoOpen, setNuevoOpen] = React.useState(false)
  const [proveedorId, setProveedorId] = React.useState("")
  const [moneda, setMoneda] = React.useState<"LPS" | "USD">("LPS")
  const [tasa, setTasa] = React.useState("1")
  const [costosImp, setCostosImp] = React.useState("")
  const [impuestos, setImpuestos] = React.useState("")
  const [otros, setOtros] = React.useState("")
  const [lineas, setLineas] = React.useState<LineaForm[]>([{ _id: nid(), material_id: "", cantidad: "", costo: "" }])
  const [saving, setSaving] = React.useState(false)

  // Recepción
  const [recibirCompra, setRecibirCompra] = React.useState<CompraMaterial | null>(null)
  const [recAlmacen, setRecAlmacen] = React.useState("")
  const [recLoc, setRecLoc] = React.useState("")
  const [locsRec, setLocsRec] = React.useState<Localizacion[]>([])
  const [recibiendo, setRecibiendo] = React.useState(false)

  const cargar = React.useCallback(async () => {
    setLoading(true)
    const [c, m, p, a] = await Promise.all([getComprasMaterial(), getMateriales({ soloActivos: true }), getProveedores(), getAlmacenes()])
    setCompras(c.data); setMateriales(m.data); setProveedores(p.data); setAlmacenes(a.data)
    setLoading(false)
  }, [])
  React.useEffect(() => { cargar() }, [cargar])

  React.useEffect(() => {
    if (recAlmacen) getLocalizaciones(Number(recAlmacen)).then((r) => { setLocsRec(r.data); setRecLoc("") })
    else setLocsRec([])
  }, [recAlmacen])

  function abrirNuevo() {
    setProveedorId(""); setMoneda("LPS"); setTasa("1"); setCostosImp(""); setImpuestos(""); setOtros("")
    setLineas([{ _id: nid(), material_id: "", cantidad: "", costo: "" }])
    setNuevoOpen(true)
  }

  function setLinea(id: string, campo: keyof LineaForm, valor: string) {
    setLineas((prev) => prev.map((l) => (l._id === id ? { ...l, [campo]: valor } : l)))
  }

  // Vista previa del costo final por línea (prorrateo).
  const lineasValidas = lineas
    .map((l) => ({ material_id: Number(l.material_id), cantidad: Number(l.cantidad) || 0, costo_unitario_moneda_origen: Number(l.costo) || 0 }))
    .filter((l) => l.material_id > 0 && l.cantidad > 0)
  const costosAdic = (Number(costosImp) || 0) + (Number(impuestos) || 0) + (Number(otros) || 0)
  const costeadas = costearLineasMaterial(lineasValidas, costosAdic, moneda, Number(tasa) || 1)
  const totalCompra = costeadas.reduce((a, l) => a + l.costo_final_local * l.cantidad, 0)

  async function guardarCompra() {
    if (lineasValidas.length === 0) {
      toast({ title: "Faltan materiales", description: "Agrega al menos una línea con material y cantidad.", variant: "destructive" })
      return
    }
    setSaving(true)
    const res = await createCompraMaterial({
      proveedor_id: proveedorId ? Number(proveedorId) : null,
      moneda,
      tasa_cambio: Number(tasa) || 1,
      costos_importacion: Number(costosImp) || 0,
      impuestos_compra: Number(impuestos) || 0,
      otros_costos: Number(otros) || 0,
      lineas: lineasValidas,
    })
    setSaving(false)
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" })
      return
    }
    toast({ title: "Compra creada", description: "Ahora recíbela para que entre al inventario de materiales." })
    setNuevoOpen(false)
    cargar()
  }

  async function ejecutarRecepcion() {
    if (!recibirCompra) return
    if (!recAlmacen || !recLoc) {
      toast({ title: "Faltan datos", description: "Elige almacén y localización.", variant: "destructive" })
      return
    }
    setRecibiendo(true)
    const res = await recibirCompraMaterial(recibirCompra.id, Number(recAlmacen), Number(recLoc))
    setRecibiendo(false)
    if (!res.success) {
      toast({ title: "Error", description: res.error || "No se pudo recibir", variant: "destructive" })
      return
    }
    toast({ title: "Compra recibida", description: "El stock y el costo de los materiales se actualizaron." })
    setRecibirCompra(null); setRecAlmacen(""); setRecLoc("")
    cargar()
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <Truck className="h-6 w-6 text-stone-600" /> Compra de Materiales
          </h1>
          <p className="text-sm text-muted-foreground">Compra materia prima y recíbela para cargar su inventario y costo.</p>
        </div>
        <Button onClick={abrirNuevo} size="sm" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-1" /> Nueva compra
        </Button>
      </div>

      <Card className="rounded-xl border-stone-200">
        <CardHeader className="p-4 md:p-6 pb-3">
          <CardTitle className="text-base md:text-lg">Compras de material</CardTitle>
          <CardDescription className="text-xs md:text-sm">Pendientes se pueden recibir; recibidas ya cargaron el inventario.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner className="h-6 w-6" /></div>
          ) : compras.length === 0 ? (
            <div className="text-center py-10 text-stone-500 text-sm">
              <Truck className="h-10 w-10 mx-auto mb-2 opacity-40" /> Sin compras de material todavía.
            </div>
          ) : (
            <div className="rounded-lg border border-stone-200 overflow-x-auto">
              <Table containerClassName="max-h-[60vh] overflow-y-auto">
                <TableHeader sticky>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Moneda</TableHead>
                    <TableHead className="text-right">Total (L)</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-28"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compras.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-xs">{c.created_at ? c.created_at.split("T")[0] : "-"}</TableCell>
                      <TableCell className="text-sm">{c.proveedor_nombre || "Sin proveedor"}</TableCell>
                      <TableCell className="text-xs">{c.moneda}{c.moneda === "USD" ? ` @${c.tasa_cambio}` : ""}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(c.total_local)}</TableCell>
                      <TableCell>
                        {c.estado === "Recibida" ? (
                          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 gap-1"><CheckCircle2 className="h-3 w-3" /> Recibida</Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Pendiente</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {c.estado !== "Recibida" && (
                          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => { setRecibirCompra(c); setRecAlmacen(""); setRecLoc("") }}>
                            <PackageCheck className="h-3.5 w-3.5" /> Recibir
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nueva compra */}
      <Dialog open={nuevoOpen} onOpenChange={setNuevoOpen}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva compra de material</DialogTitle>
            <DialogDescription>Los costos extra se prorratean entre las líneas según su valor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Proveedor</Label>
                <Select value={proveedorId || "none"} onValueChange={(v) => setProveedorId(v === "none" ? "" : v)}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Sin proveedor" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin proveedor</SelectItem>
                    {proveedores.map((p) => (<SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1.5">
                  <Label className="text-xs">Moneda</Label>
                  <Select value={moneda} onValueChange={(v) => setMoneda(v as "LPS" | "USD")}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LPS">LPS</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Tasa</Label>
                  <Input type="number" step="0.0001" min="0" value={tasa} onChange={(e) => setTasa(e.target.value)} className="h-9" disabled={moneda === "LPS"} />
                </div>
              </div>
            </div>

            {/* Líneas de material */}
            <div className="space-y-2">
              <Label className="text-xs">Materiales</Label>
              {lineas.map((l) => (
                <div key={l._id} className="flex items-end gap-2">
                  <div className="grid gap-1 flex-1 min-w-0">
                    <Select value={l.material_id || "none"} onValueChange={(v) => setLinea(l._id, "material_id", v === "none" ? "" : v)}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Material" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Seleccionar…</SelectItem>
                        {materiales.map((m) => (<SelectItem key={m.id} value={String(m.id)}>{m.nombre} ({m.unidad_medida})</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input type="number" min="0" step="0.0001" placeholder="Cant." value={l.cantidad} onChange={(e) => setLinea(l._id, "cantidad", e.target.value)} className="h-9 w-24" />
                  <Input type="number" min="0" step="0.0001" placeholder={`Costo ${moneda}`} value={l.costo} onChange={(e) => setLinea(l._id, "costo", e.target.value)} className="h-9 w-28" />
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-8 text-stone-500 hover:text-destructive disabled:opacity-30" disabled={lineas.length <= 1} onClick={() => setLineas((prev) => prev.filter((x) => x._id !== l._id))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setLineas((prev) => [...prev, { _id: nid(), material_id: "", cantidad: "", costo: "" }])}>
                <Plus className="h-4 w-4" /> Agregar material
              </Button>
            </div>

            {/* Costos extra */}
            <div className="grid grid-cols-3 gap-2">
              <div className="grid gap-1"><Label className="text-[11px] text-stone-500">Importación</Label><Input type="number" min="0" step="0.01" value={costosImp} onChange={(e) => setCostosImp(e.target.value)} className="h-9" placeholder="0.00" /></div>
              <div className="grid gap-1"><Label className="text-[11px] text-stone-500">Impuestos</Label><Input type="number" min="0" step="0.01" value={impuestos} onChange={(e) => setImpuestos(e.target.value)} className="h-9" placeholder="0.00" /></div>
              <div className="grid gap-1"><Label className="text-[11px] text-stone-500">Otros</Label><Input type="number" min="0" step="0.01" value={otros} onChange={(e) => setOtros(e.target.value)} className="h-9" placeholder="0.00" /></div>
            </div>

            <div className="rounded-lg bg-stone-50 border border-stone-200 p-3 text-sm flex items-center justify-between">
              <span className="text-stone-500">Total de la compra (L)</span>
              <span className="font-bold text-stone-800">{formatCurrency(totalCompra)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNuevoOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={guardarCompra} disabled={saving || lineasValidas.length === 0}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Crear compra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recepción */}
      <AlertDialog open={recibirCompra != null} onOpenChange={(o) => { if (!o && !recibiendo) setRecibirCompra(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Recibir compra de material</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>Elige dónde entra el material. Se sumará al stock y se recalculará su costo promedio.</p>
                <div className="grid gap-2">
                  <Label className="text-xs">Almacén</Label>
                  <Select value={recAlmacen} onValueChange={setRecAlmacen}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {almacenes.map((a) => (<SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">Localización</Label>
                  <Select value={recLoc} onValueChange={setRecLoc} disabled={!recAlmacen}>
                    <SelectTrigger className="h-9"><SelectValue placeholder={recAlmacen ? "Seleccionar" : "Elige almacén"} /></SelectTrigger>
                    <SelectContent>
                      {locsRec.map((l) => (<SelectItem key={l.id} value={String(l.id)}>{l.nombre}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={recibiendo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); ejecutarRecepcion() }} disabled={recibiendo || !recAlmacen || !recLoc}>
              {recibiendo ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Recibiendo…</> : "Confirmar recepción"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
