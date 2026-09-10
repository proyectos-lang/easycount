"use client"

import * as React from "react"
import { ClipboardList, Plus, Trash2, Loader2, Search, Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/format"
import { getProductos, type Producto } from "@/lib/services/catalogos"
import { getMateriales, type Material } from "@/lib/services/produccion-materiales"
import {
  getReceta, upsertReceta, calcularCostoEstimado, listarProductosFabricados,
  type ProductoFabricadoRef,
} from "@/lib/services/produccion-recetas"

interface LineaForm { _id: string; material_id: string; consumo: string }
let seq = 0
const nid = () => `r-${++seq}`

export default function RecetasPage() {
  const { toast } = useToast()
  const [productos, setProductos] = React.useState<Producto[]>([])
  const [materiales, setMateriales] = React.useState<Material[]>([])
  const [fabricados, setFabricados] = React.useState<ProductoFabricadoRef[]>([])
  const [loading, setLoading] = React.useState(true)

  const [comboOpen, setComboOpen] = React.useState(false)
  const [productoId, setProductoId] = React.useState<number | null>(null)
  const [cargandoReceta, setCargandoReceta] = React.useState(false)

  const [estandar, setEstandar] = React.useState("")
  const [energia, setEnergia] = React.useState("")
  const [manoObra, setManoObra] = React.useState("")
  const [overhead, setOverhead] = React.useState("")
  const [lineas, setLineas] = React.useState<LineaForm[]>([])
  const [saving, setSaving] = React.useState(false)

  const cargar = React.useCallback(async () => {
    setLoading(true)
    const [p, m, f] = await Promise.all([getProductos(), getMateriales({ soloActivos: true }), listarProductosFabricados()])
    setProductos(p.data || [])
    setMateriales(m.data)
    setFabricados(f.data)
    setLoading(false)
  }, [])
  React.useEffect(() => { cargar() }, [cargar])

  const materialById = React.useMemo(() => new Map(materiales.map((m) => [m.id!, m])), [materiales])
  const productoSel = productos.find((p) => p.id === productoId)
  const fabricadosSet = React.useMemo(() => new Set(fabricados.map((f) => f.producto_id)), [fabricados])

  async function elegirProducto(id: number) {
    setProductoId(id)
    setComboOpen(false)
    setCargandoReceta(true)
    // Limpia el form y carga la receta si ya existe.
    setEstandar(""); setEnergia(""); setManoObra(""); setOverhead(""); setLineas([])
    const { data } = await getReceta(id)
    if (data) {
      setEstandar(String(data.estandar_unidades_por_minuto || ""))
      setEnergia(String(data.costo_energia || ""))
      setManoObra(String(data.costo_mano_obra || ""))
      setOverhead(String(data.costo_overhead || ""))
      setLineas(data.lineas.map((l) => ({ _id: nid(), material_id: String(l.material_id), consumo: String(l.consumo_por_unidad) })))
    }
    setCargandoReceta(false)
  }

  function setLinea(id: string, campo: keyof LineaForm, valor: string) {
    setLineas((prev) => prev.map((l) => (l._id === id ? { ...l, [campo]: valor } : l)))
  }

  // Costo estimado en vivo.
  const lineasCalc = lineas
    .map((l) => ({ consumo_por_unidad: Number(l.consumo) || 0, costo_promedio: materialById.get(Number(l.material_id))?.costo_promedio || 0 }))
    .filter((l) => l.consumo_por_unidad > 0)
  const costoEstimado = calcularCostoEstimado(lineasCalc, {
    costo_energia: Number(energia) || 0,
    costo_mano_obra: Number(manoObra) || 0,
    costo_overhead: Number(overhead) || 0,
  })
  const costoMateriales = lineasCalc.reduce((a, l) => a + l.consumo_por_unidad * l.costo_promedio, 0)

  async function guardar() {
    if (productoId == null) {
      toast({ title: "Elige un producto", variant: "destructive" })
      return
    }
    const lineasValidas = lineas
      .map((l) => ({ material_id: Number(l.material_id), consumo_por_unidad: Number(l.consumo) || 0 }))
      .filter((l) => l.material_id > 0 && l.consumo_por_unidad > 0)
    if (lineasValidas.length === 0) {
      toast({ title: "Faltan materiales", description: "Agrega al menos un material con su consumo por unidad.", variant: "destructive" })
      return
    }
    setSaving(true)
    const res = await upsertReceta({
      producto_id: productoId,
      estandar_unidades_por_minuto: Number(estandar) || 0,
      costo_energia: Number(energia) || 0,
      costo_mano_obra: Number(manoObra) || 0,
      costo_overhead: Number(overhead) || 0,
      lineas: lineasValidas.map((l) => ({ ...l, costo_promedio: materialById.get(l.material_id)?.costo_promedio || 0 })),
    })
    setSaving(false)
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" })
      return
    }
    toast({ title: "Receta guardada", description: `Costo estimado: ${formatCurrency(costoEstimado)}/unidad` })
    cargar()
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-stone-600" /> Recetas (MRP)
        </h1>
        <p className="text-sm text-muted-foreground">
          Define la receta de un producto fabricado: materiales por unidad + factores de costo. Calcula su costo estimado.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : (
        <Card className="rounded-xl border-stone-200">
          <CardHeader className="p-4 md:p-6 pb-3">
            <CardTitle className="text-base md:text-lg">Producto a fabricar</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Elige un producto del catálogo; tener receta lo marca como fabricado.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 space-y-4">
            {/* Selector de producto (combobox) */}
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
                    <CommandEmpty>Sin resultados.</CommandEmpty>
                    <CommandGroup>
                      {productos.map((p) => (
                        <CommandItem
                          key={p.id}
                          value={`${p.nombre} ${p.codigo_barras || ""}`}
                          onSelect={() => elegirProducto(p.id!)}
                        >
                          <Check className={cn("mr-2 h-4 w-4", productoId === p.id ? "opacity-100" : "opacity-0")} />
                          <span className="flex-1 truncate">{p.nombre}</span>
                          {fabricadosSet.has(p.id!) && (
                            <Badge variant="outline" className="ml-2 text-[10px] border-amber-200 bg-amber-50 text-amber-800">Con receta</Badge>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {cargandoReceta ? (
              <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>
            ) : productoId != null ? (
              <>
                {/* Estándar de producción */}
                <div className="grid gap-1.5 max-w-xs">
                  <Label className="text-xs">Estándar de producción (unidades por minuto)</Label>
                  <Input type="number" min="0" step="0.01" value={estandar} onChange={(e) => setEstandar(e.target.value)} placeholder="Ej: 5" className="h-9" />
                </div>

                {/* Materiales de la receta */}
                <div className="space-y-2">
                  <Label className="text-xs">Materiales (consumo por unidad producida)</Label>
                  {lineas.length === 0 && <p className="text-xs text-stone-400">Aún no hay materiales en la receta.</p>}
                  {lineas.map((l) => {
                    const mat = materialById.get(Number(l.material_id))
                    const subtotal = (Number(l.consumo) || 0) * (mat?.costo_promedio || 0)
                    return (
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
                        <Input type="number" min="0" step="0.000001" placeholder="Consumo/u" value={l.consumo} onChange={(e) => setLinea(l._id, "consumo", e.target.value)} className="h-9 w-28" />
                        <div className="w-24 text-right text-xs text-stone-500 pb-2">{formatCurrency(subtotal)}</div>
                        <Button type="button" variant="ghost" size="icon" className="h-9 w-8 text-stone-500 hover:text-destructive" onClick={() => setLineas((prev) => prev.filter((x) => x._id !== l._id))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                  <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setLineas((prev) => [...prev, { _id: nid(), material_id: "", consumo: "" }])}>
                    <Plus className="h-4 w-4" /> Agregar material
                  </Button>
                </div>

                {/* Factores de costo por unidad */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="grid gap-1"><Label className="text-[11px] text-stone-500">Energía / unidad</Label><Input type="number" min="0" step="0.01" value={energia} onChange={(e) => setEnergia(e.target.value)} className="h-9" placeholder="0.00" /></div>
                  <div className="grid gap-1"><Label className="text-[11px] text-stone-500">Mano de obra / unidad</Label><Input type="number" min="0" step="0.01" value={manoObra} onChange={(e) => setManoObra(e.target.value)} className="h-9" placeholder="0.00" /></div>
                  <div className="grid gap-1"><Label className="text-[11px] text-stone-500">Overhead / unidad</Label><Input type="number" min="0" step="0.01" value={overhead} onChange={(e) => setOverhead(e.target.value)} className="h-9" placeholder="0.00" /></div>
                </div>

                {/* Resumen del costo estimado */}
                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 space-y-1 text-sm">
                  <div className="flex justify-between text-stone-600"><span>Materiales por unidad</span><span>{formatCurrency(costoMateriales)}</span></div>
                  <div className="flex justify-between text-stone-600"><span>Factores (energía + mano obra + overhead)</span><span>{formatCurrency((Number(energia) || 0) + (Number(manoObra) || 0) + (Number(overhead) || 0))}</span></div>
                  <div className="flex justify-between font-bold text-amber-900 pt-1 border-t border-amber-200"><span>Costo estimado por unidad</span><span>{formatCurrency(costoEstimado)}</span></div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={guardar} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                    Guardar receta
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-stone-400 py-6 text-center flex items-center justify-center gap-2">
                <Search className="h-4 w-4" /> Selecciona un producto para armar o ver su receta.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
