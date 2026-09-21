"use client"

import * as React from "react"
import { Boxes, Plus, Pencil, Loader2, Search, Download, Upload, FileSpreadsheet } from "lucide-react"
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
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils/format"
import {
  getMateriales, createMaterial, updateMaterial, importarMateriales,
  type Material, type FilaMaterialImport,
} from "@/lib/services/produccion-materiales"
import {
  descargarPlantillaMateriales, parsearArchivoMateriales,
} from "@/lib/services/importar-materiales"
import {
  getAlmacenes, getLocalizaciones, type Almacen, type Localizacion,
} from "@/lib/services/catalogos"

const UNIDADES_SUGERIDAS = ["unidad", "kg", "g", "L", "ml", "m", "cm", "caja", "rollo", "par", "docena"]

export default function MaterialesPage() {
  const { toast } = useToast()
  const [materiales, setMateriales] = React.useState<Material[]>([])
  const [loading, setLoading] = React.useState(true)
  const [busqueda, setBusqueda] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editando, setEditando] = React.useState<Material | null>(null)
  const [saving, setSaving] = React.useState(false)

  const [form, setForm] = React.useState({
    nombre: "", codigo: "", unidad_medida: "unidad",
    stock_inicial: "", costo_inicial: "", almacen_id: "", localizacion_id: "",
    // Costo promedio: solo editable al EDITAR (ajuste manual con rastro en kardex).
    costo_promedio: "",
  })

  // Almacenes/localizaciones para la carga inicial y la importación.
  const [almacenes, setAlmacenes] = React.useState<Almacen[]>([])
  const [locsForm, setLocsForm] = React.useState<Localizacion[]>([])

  // Importar Excel
  const [importOpen, setImportOpen] = React.useState(false)
  const [impAlmacen, setImpAlmacen] = React.useState("")
  const [impLoc, setImpLoc] = React.useState("")
  const [locsImp, setLocsImp] = React.useState<Localizacion[]>([])
  const [impFilas, setImpFilas] = React.useState<FilaMaterialImport[]>([])
  const [impNombreArchivo, setImpNombreArchivo] = React.useState("")
  const [importando, setImportando] = React.useState(false)
  const fileRef = React.useRef<HTMLInputElement>(null)

  const cargar = React.useCallback(async () => {
    setLoading(true)
    const [m, a] = await Promise.all([getMateriales(), getAlmacenes()])
    setMateriales(m.data)
    setAlmacenes(a.data)
    setLoading(false)
  }, [])

  React.useEffect(() => { cargar() }, [cargar])

  // Localizaciones dependientes del almacén elegido (form de crear).
  React.useEffect(() => {
    if (form.almacen_id) getLocalizaciones(Number(form.almacen_id)).then((r) => setLocsForm(r.data))
    else setLocsForm([])
  }, [form.almacen_id])

  // Localizaciones dependientes del almacén elegido (importación).
  React.useEffect(() => {
    if (impAlmacen) getLocalizaciones(Number(impAlmacen)).then((r) => { setLocsImp(r.data); setImpLoc("") })
    else setLocsImp([])
  }, [impAlmacen])

  const filtrados = React.useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return materiales
    return materiales.filter(
      (m) => m.nombre.toLowerCase().includes(q) || (m.codigo || "").toLowerCase().includes(q),
    )
  }, [materiales, busqueda])

  function abrirNuevo() {
    setEditando(null)
    setForm({ nombre: "", codigo: "", unidad_medida: "unidad", stock_inicial: "", costo_inicial: "", almacen_id: "", localizacion_id: "", costo_promedio: "" })
    setDialogOpen(true)
  }

  function abrirEditar(m: Material) {
    setEditando(m)
    setForm({ nombre: m.nombre, codigo: m.codigo || "", unidad_medida: m.unidad_medida, stock_inicial: "", costo_inicial: "", almacen_id: "", localizacion_id: "", costo_promedio: String(m.costo_promedio ?? 0) })
    setDialogOpen(true)
  }

  async function guardar() {
    if (!form.nombre.trim()) {
      toast({ title: "Falta el nombre", variant: "destructive" })
      return
    }
    if (!form.unidad_medida.trim()) {
      toast({ title: "Falta la unidad de medida", variant: "destructive" })
      return
    }
    const stockInicial = Number(form.stock_inicial) || 0
    // Solo al CREAR: si hay carga inicial, exige almacén y localización.
    if (!editando && stockInicial > 0 && (!form.almacen_id || !form.localizacion_id)) {
      toast({ title: "Falta ubicación", description: "Para la carga inicial elige almacén y localización.", variant: "destructive" })
      return
    }
    setSaving(true)
    const res = editando?.id
      ? await updateMaterial(editando.id, {
          nombre: form.nombre,
          codigo: form.codigo,
          unidad_medida: form.unidad_medida,
          // Costo promedio editado (ajuste manual con rastro en el kardex).
          costo_promedio: form.costo_promedio.trim() === "" ? undefined : Number(form.costo_promedio),
        })
      : await createMaterial({
          nombre: form.nombre,
          codigo: form.codigo,
          unidad_medida: form.unidad_medida,
          stock_inicial: stockInicial,
          costo_inicial: Number(form.costo_inicial) || 0,
          almacen_id: form.almacen_id ? Number(form.almacen_id) : null,
          localizacion_id: form.localizacion_id ? Number(form.localizacion_id) : null,
        })
    setSaving(false)
    if (res.error) {
      // Al crear puede venir con data (creado) + aviso de carga inicial.
      const creadoConAviso = !editando && "data" in res && res.data
      toast({ title: creadoConAviso ? "Material creado con aviso" : "Error", description: res.error, variant: creadoConAviso ? "default" : "destructive" })
      if (!creadoConAviso) return
    } else {
      toast({ title: editando ? "Material actualizado" : "Material creado" })
    }
    setDialogOpen(false)
    cargar()
  }

  async function onArchivoSeleccionado(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImpNombreArchivo(file.name)
    try {
      const filas = await parsearArchivoMateriales(file)
      setImpFilas(filas)
      if (filas.length === 0) {
        toast({ title: "Archivo vacío", description: "No se encontraron materiales en el Excel.", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error al leer el archivo", description: "Verifica que sea un .xlsx válido.", variant: "destructive" })
      setImpFilas([])
    }
  }

  function abrirImport() {
    setImpAlmacen(""); setImpLoc(""); setImpFilas([]); setImpNombreArchivo("")
    if (fileRef.current) fileRef.current.value = ""
    setImportOpen(true)
  }

  const impConStock = React.useMemo(() => impFilas.filter((f) => f.stock_inicial > 0).length, [impFilas])

  async function ejecutarImport() {
    if (impFilas.length === 0) {
      toast({ title: "Nada que importar", description: "Sube un archivo con materiales.", variant: "destructive" })
      return
    }
    if (impConStock > 0 && (!impAlmacen || !impLoc)) {
      toast({ title: "Falta ubicación", description: "Hay materiales con stock inicial: elige almacén y localización.", variant: "destructive" })
      return
    }
    setImportando(true)
    const res = await importarMateriales(impFilas, {
      almacen_id: Number(impAlmacen) || 0,
      localizacion_id: Number(impLoc) || 0,
    })
    setImportando(false)
    toast({
      title: "Importación terminada",
      description: `${res.creados} creado(s)${res.errores ? `, ${res.errores} con error` : ""}.`,
      variant: res.errores ? "destructive" : "default",
    })
    setImportOpen(false)
    cargar()
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <Boxes className="h-6 w-6 text-stone-600" /> Materiales
          </h1>
          <p className="text-sm text-muted-foreground">Materia prima para fabricación, con su unidad, costo y stock.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={() => descargarPlantillaMateriales()} size="sm" variant="outline" className="w-full sm:w-auto gap-1">
            <Download className="h-4 w-4" /> Plantilla
          </Button>
          <Button onClick={abrirImport} size="sm" variant="outline" className="w-full sm:w-auto gap-1">
            <Upload className="h-4 w-4" /> Importar Excel
          </Button>
          <Button onClick={abrirNuevo} size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-1" /> Nuevo material
          </Button>
        </div>
      </div>

      <Card className="rounded-xl border-stone-200">
        <CardHeader className="p-4 md:p-6 pb-3">
          <CardTitle className="text-base md:text-lg">Catálogo de materiales</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {filtrados.length} de {materiales.length} material(es). El stock y el costo se actualizan con las compras de material.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input className="pl-9" placeholder="Buscar por nombre o código…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          {loading ? (
            <div className="flex justify-center py-10"><Spinner className="h-6 w-6" /></div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-10 text-stone-500 text-sm">
              <Boxes className="h-10 w-10 mx-auto mb-2 opacity-40" />
              {materiales.length === 0 ? "Aún no hay materiales. Crea el primero." : "Sin resultados."}
            </div>
          ) : (
            <div className="rounded-lg border border-stone-200 overflow-x-auto">
              <Table containerClassName="max-h-[60vh] overflow-y-auto">
                <TableHeader sticky>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead className="text-right">Costo prom.</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrados.map((m) => (
                    <TableRow key={m.id} className={m.activo === false ? "opacity-60" : undefined}>
                      <TableCell className="font-medium">
                        {m.nombre}
                        {m.activo === false && <Badge variant="outline" className="ml-2 text-[10px]">Inactivo</Badge>}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-stone-500">{m.codigo || "-"}</TableCell>
                      <TableCell className="text-sm">{m.unidad_medida}</TableCell>
                      <TableCell className="text-right text-stone-600">{formatCurrency(m.costo_promedio || 0)}</TableCell>
                      <TableCell className="text-right font-medium">{m.stock_total || 0}</TableCell>
                      <TableCell className="text-right text-emerald-700 font-medium">
                        {formatCurrency((m.stock_total || 0) * (m.costo_promedio || 0))}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => abrirEditar(m)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo crear/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar material" : "Nuevo material"}</DialogTitle>
            <DialogDescription>
              {editando
                ? "El stock se maneja con las compras/cargas; aquí editas nombre, código, unidad y el costo promedio (ajuste manual)."
                : "Define el material y, si quieres, su carga inicial de stock y costo."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="mat-nombre">Nombre <span className="text-destructive">*</span></Label>
              <Input id="mat-nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Tela algodón, Hilo negro" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="mat-codigo">Código <span className="text-stone-400 text-xs font-normal">(opcional)</span></Label>
                <Input id="mat-codigo" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="MAT-001" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mat-unidad">Unidad <span className="text-destructive">*</span></Label>
                <Input id="mat-unidad" list="unidades-sugeridas" value={form.unidad_medida} onChange={(e) => setForm({ ...form, unidad_medida: e.target.value })} placeholder="kg, m, unidad" />
                <datalist id="unidades-sugeridas">
                  {UNIDADES_SUGERIDAS.map((u) => <option key={u} value={u} />)}
                </datalist>
              </div>
            </div>

            {/* Costo promedio: editable SOLO al editar (ajuste manual). */}
            {editando && (
              <div className="grid gap-2">
                <Label htmlFor="mat-costo">Costo promedio</Label>
                <Input
                  id="mat-costo"
                  type="number"
                  min="0"
                  step="0.0001"
                  value={form.costo_promedio}
                  onChange={(e) => setForm({ ...form, costo_promedio: e.target.value })}
                  placeholder="0.00"
                />
                <p className="text-[11px] text-muted-foreground">
                  Ajuste manual del costo. Se registra un movimiento «Ajuste de Costo» en el kardex (no mueve stock).
                </p>
              </div>
            )}

            {/* Carga inicial: SOLO al crear (editar no toca stock). */}
            {!editando && (
              <div className="rounded-lg border border-stone-200 bg-stone-50/60 p-3 space-y-3">
                <p className="text-xs font-medium text-stone-600">Carga inicial <span className="font-normal text-stone-400">(opcional)</span></p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Stock inicial</Label>
                    <Input type="number" min="0" step="0.0001" value={form.stock_inicial} onChange={(e) => setForm({ ...form, stock_inicial: e.target.value })} placeholder="0" className="h-9" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Costo promedio</Label>
                    <Input type="number" min="0" step="0.0001" value={form.costo_inicial} onChange={(e) => setForm({ ...form, costo_inicial: e.target.value })} placeholder="0.00" className="h-9" />
                  </div>
                </div>
                {Number(form.stock_inicial) > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Almacén <span className="text-destructive">*</span></Label>
                      <Select value={form.almacen_id} onValueChange={(v) => setForm({ ...form, almacen_id: v, localizacion_id: "" })}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          {almacenes.map((a) => (<SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Localización <span className="text-destructive">*</span></Label>
                      <Select value={form.localizacion_id} onValueChange={(v) => setForm({ ...form, localizacion_id: v })} disabled={!form.almacen_id}>
                        <SelectTrigger className="h-9"><SelectValue placeholder={form.almacen_id ? "Seleccionar" : "Elige almacén"} /></SelectTrigger>
                        <SelectContent>
                          {locsForm.map((l) => (<SelectItem key={l.id} value={String(l.id)}>{l.nombre}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-stone-500">Si dejas el stock en 0, el material se crea sin existencias (las cargas después con una compra).</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={guardar} disabled={saving || !form.nombre.trim()}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Importar desde Excel */}
      <Dialog open={importOpen} onOpenChange={(o) => { if (!o && !importando) setImportOpen(false) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Importar materiales desde Excel</DialogTitle>
            <DialogDescription>
              Descarga la plantilla, llénala y súbela. Columnas: Nombre, Código, Unidad, Stock Inicial, Costo Promedio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={() => descargarPlantillaMateriales()}>
                <Download className="h-4 w-4" /> Descargar plantilla
              </Button>
            </div>

            <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={onArchivoSeleccionado} className="hidden" />
            <Button variant="outline" className="w-full gap-2 justify-start" onClick={() => fileRef.current?.click()}>
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              {impNombreArchivo || "Seleccionar archivo .xlsx…"}
            </Button>

            {impFilas.length > 0 && (
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm space-y-1">
                <p><b>{impFilas.length}</b> material(es) en el archivo.</p>
                {impConStock > 0 && <p className="text-stone-600">{impConStock} con stock inicial (necesitan almacén y localización).</p>}
              </div>
            )}

            {/* Ubicación para la carga inicial (solo si hay stock). */}
            {impConStock > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs">Almacén <span className="text-destructive">*</span></Label>
                  <Select value={impAlmacen} onValueChange={setImpAlmacen}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {almacenes.map((a) => (<SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Localización <span className="text-destructive">*</span></Label>
                  <Select value={impLoc} onValueChange={setImpLoc} disabled={!impAlmacen}>
                    <SelectTrigger className="h-9"><SelectValue placeholder={impAlmacen ? "Seleccionar" : "Elige almacén"} /></SelectTrigger>
                    <SelectContent>
                      {locsImp.map((l) => (<SelectItem key={l.id} value={String(l.id)}>{l.nombre}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <p className="text-[11px] text-stone-500">Los materiales con Stock Inicial en 0 se crean solo en el catálogo (sin existencias).</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)} disabled={importando}>Cancelar</Button>
            <Button onClick={ejecutarImport} disabled={importando || impFilas.length === 0}>
              {importando && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Importar {impFilas.length > 0 ? `(${impFilas.length})` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
