"use client"

import * as React from "react"
import { Boxes, Plus, Pencil, Loader2, Search } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils/format"
import {
  getMateriales, createMaterial, updateMaterial, type Material,
} from "@/lib/services/produccion-materiales"

const UNIDADES_SUGERIDAS = ["unidad", "kg", "g", "L", "ml", "m", "cm", "caja", "rollo", "par", "docena"]

export default function MaterialesPage() {
  const { toast } = useToast()
  const [materiales, setMateriales] = React.useState<Material[]>([])
  const [loading, setLoading] = React.useState(true)
  const [busqueda, setBusqueda] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editando, setEditando] = React.useState<Material | null>(null)
  const [saving, setSaving] = React.useState(false)

  const [form, setForm] = React.useState({ nombre: "", codigo: "", unidad_medida: "unidad" })

  const cargar = React.useCallback(async () => {
    setLoading(true)
    const { data } = await getMateriales()
    setMateriales(data)
    setLoading(false)
  }, [])

  React.useEffect(() => { cargar() }, [cargar])

  const filtrados = React.useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return materiales
    return materiales.filter(
      (m) => m.nombre.toLowerCase().includes(q) || (m.codigo || "").toLowerCase().includes(q),
    )
  }, [materiales, busqueda])

  function abrirNuevo() {
    setEditando(null)
    setForm({ nombre: "", codigo: "", unidad_medida: "unidad" })
    setDialogOpen(true)
  }

  function abrirEditar(m: Material) {
    setEditando(m)
    setForm({ nombre: m.nombre, codigo: m.codigo || "", unidad_medida: m.unidad_medida })
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
    setSaving(true)
    const res = editando?.id
      ? await updateMaterial(editando.id, form)
      : await createMaterial(form)
    setSaving(false)
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" })
      return
    }
    toast({ title: editando ? "Material actualizado" : "Material creado" })
    setDialogOpen(false)
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
        <Button onClick={abrirNuevo} size="sm" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-1" /> Nuevo material
        </Button>
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
              El costo y el stock se manejan con las compras de material; aquí defines nombre, código y unidad.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="mat-nombre">Nombre <span className="text-destructive">*</span></Label>
              <Input id="mat-nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Tela algodón, Hilo negro" autoFocus />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mat-codigo">Código <span className="text-stone-400 text-xs font-normal">(opcional)</span></Label>
              <Input id="mat-codigo" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="Ej: MAT-001" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mat-unidad">Unidad de medida <span className="text-destructive">*</span></Label>
              <Input id="mat-unidad" list="unidades-sugeridas" value={form.unidad_medida} onChange={(e) => setForm({ ...form, unidad_medida: e.target.value })} placeholder="Ej: kg, m, unidad" />
              <datalist id="unidades-sugeridas">
                {UNIDADES_SUGERIDAS.map((u) => <option key={u} value={u} />)}
              </datalist>
            </div>
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
    </div>
  )
}
