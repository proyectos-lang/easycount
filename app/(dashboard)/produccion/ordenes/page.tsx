"use client"

import * as React from "react"
import { FileText, Plus, Loader2, Check, ChevronsUpDown, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { getProductos, type Producto } from "@/lib/services/catalogos"
import { getProductosFabricados } from "@/lib/services/productos-fabricados"
import {
  getOrdenes, createOrden, setEstadoOrden,
  type OrdenProduccion, type EstadoOrden,
} from "@/lib/services/produccion-ordenes"

const ESTADOS: EstadoOrden[] = ["Abierta", "En Proceso", "Cerrada", "Cancelada"]

function estadoBadge(e: EstadoOrden) {
  const map: Record<EstadoOrden, string> = {
    "Abierta": "border-sky-200 bg-sky-50 text-sky-700",
    "En Proceso": "border-amber-200 bg-amber-50 text-amber-800",
    "Cerrada": "border-emerald-200 bg-emerald-50 text-emerald-700",
    "Cancelada": "border-stone-300 bg-stone-100 text-stone-500",
  }
  return <Badge variant="outline" className={map[e]}>{e}</Badge>
}

export default function OrdenesProduccionPage() {
  const { toast } = useToast()
  const [ordenes, setOrdenes] = React.useState<OrdenProduccion[]>([])
  const [productos, setProductos] = React.useState<Producto[]>([])
  const [fabricados, setFabricados] = React.useState<Set<number>>(new Set())
  const [loading, setLoading] = React.useState(true)

  const [nuevoOpen, setNuevoOpen] = React.useState(false)
  const [comboOpen, setComboOpen] = React.useState(false)
  const [productoId, setProductoId] = React.useState<number | null>(null)
  const [cantidad, setCantidad] = React.useState("")
  const [fecha, setFecha] = React.useState("")
  const [notas, setNotas] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  const cargar = React.useCallback(async () => {
    setLoading(true)
    const [o, p, f] = await Promise.all([getOrdenes(), getProductos(), getProductosFabricados()])
    setOrdenes(o.data)
    setProductos(p.data || [])
    setFabricados(f.data)
    setLoading(false)
  }, [])
  React.useEffect(() => { cargar() }, [cargar])

  const productosFabricados = React.useMemo(
    () => productos.filter((p) => p.id != null && fabricados.has(p.id)),
    [productos, fabricados],
  )
  const productoSel = productos.find((p) => p.id === productoId)

  function abrirNuevo() {
    setProductoId(null); setCantidad(""); setFecha(""); setNotas("")
    setNuevoOpen(true)
  }

  async function guardar() {
    if (productoId == null) {
      toast({ title: "Elige un producto", variant: "destructive" })
      return
    }
    if (!(Number(cantidad) > 0)) {
      toast({ title: "Cantidad inválida", description: "Indica la cantidad a producir.", variant: "destructive" })
      return
    }
    setSaving(true)
    const res = await createOrden({
      producto_id: productoId,
      cantidad_objetivo: Number(cantidad),
      fecha_objetivo: fecha || null,
      notas: notas || null,
    })
    setSaving(false)
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" })
      return
    }
    toast({
      title: "Orden creada",
      description: res.sinReceta
        ? "Este producto aún no tiene receta; defínela en Recetas para poder producir y costear."
        : "Lista para el control de piso.",
      variant: res.sinReceta ? "destructive" : undefined,
    })
    setNuevoOpen(false)
    cargar()
  }

  async function cambiarEstado(o: OrdenProduccion, estado: EstadoOrden) {
    const { error } = await setEstadoOrden(o.id, estado)
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" })
      return
    }
    cargar()
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-stone-600" /> Órdenes de Producción
          </h1>
          <p className="text-sm text-muted-foreground">Qué producir, cuánto y para cuándo. El control de piso registra las corridas.</p>
        </div>
        <Button onClick={abrirNuevo} size="sm" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-1" /> Nueva orden
        </Button>
      </div>

      <Card className="rounded-xl border-stone-200">
        <CardHeader className="p-4 md:p-6 pb-3">
          <CardTitle className="text-base md:text-lg">Órdenes</CardTitle>
          <CardDescription className="text-xs md:text-sm">{ordenes.length} orden(es).</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner className="h-6 w-6" /></div>
          ) : ordenes.length === 0 ? (
            <div className="text-center py-10 text-stone-500 text-sm">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" /> Sin órdenes de producción todavía.
            </div>
          ) : (
            <div className="rounded-lg border border-stone-200 overflow-x-auto">
              <Table containerClassName="max-h-[60vh] overflow-y-auto">
                <TableHeader sticky>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead>Fecha objetivo</TableHead>
                    <TableHead>Receta</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-40">Cambiar estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordenes.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.producto_nombre || `Producto #${o.producto_id}`}</TableCell>
                      <TableCell className="text-right">{o.cantidad_objetivo}</TableCell>
                      <TableCell className="text-sm">{o.fecha_objetivo || "-"}</TableCell>
                      <TableCell>
                        {o.receta_id ? (
                          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px]">Sí</Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800 text-[10px] gap-1"><AlertTriangle className="h-3 w-3" /> Sin receta</Badge>
                        )}
                      </TableCell>
                      <TableCell>{estadoBadge(o.estado)}</TableCell>
                      <TableCell>
                        <Select value={o.estado} onValueChange={(v) => cambiarEstado(o, v as EstadoOrden)}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ESTADOS.map((e) => (<SelectItem key={e} value={e}>{e}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nueva orden */}
      <Dialog open={nuevoOpen} onOpenChange={setNuevoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva orden de producción</DialogTitle>
            <DialogDescription>Solo aparecen los productos marcados como fabricados.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="grid gap-1.5">
              <Label className="text-xs">Producto a fabricar</Label>
              <Popover open={comboOpen} onOpenChange={setComboOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                    {productoSel ? productoSel.nombre : "Seleccionar producto…"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar producto…" />
                    <CommandList>
                      <CommandEmpty>
                        {productosFabricados.length === 0
                          ? "No hay productos marcados como fabricados. Márcalos en Configuración → Productos."
                          : "Sin resultados."}
                      </CommandEmpty>
                      <CommandGroup>
                        {productosFabricados.map((p) => (
                          <CommandItem key={p.id} value={`${p.nombre} ${p.codigo_barras || ""}`} onSelect={() => { setProductoId(p.id!); setComboOpen(false) }}>
                            <Check className={cn("mr-2 h-4 w-4", productoId === p.id ? "opacity-100" : "opacity-0")} />
                            <span className="flex-1 truncate">{p.nombre}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Cantidad a producir</Label>
                <Input type="number" min="0" step="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="0" className="h-10 text-base" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Fecha objetivo</Label>
                <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="h-10" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Notas / observaciones</Label>
              <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} placeholder="Opcional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNuevoOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={guardar} disabled={saving || productoId == null}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Crear orden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
