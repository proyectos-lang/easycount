"use client"

import * as React from "react"
import { ClipboardList, Plus, Trash2, Loader2, Search, Check, ChevronsUpDown, Pencil, FileText, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/format"
import { getProductos, type Producto } from "@/lib/services/catalogos"
import { getMateriales, type Material } from "@/lib/services/produccion-materiales"
import { getProductosFabricados } from "@/lib/services/productos-fabricados"
import {
  getReceta, upsertReceta, calcularCostoEstimado, listarProductosFabricados,
  type ProductoFabricadoRef, type Receta,
} from "@/lib/services/produccion-recetas"

interface LineaForm { _id: string; material_id: string; consumo: string }
let seq = 0
const nid = () => `r-${++seq}`

export default function RecetasPage() {
  const { toast } = useToast()
  const [productos, setProductos] = React.useState<Producto[]>([])
  const [materiales, setMateriales] = React.useState<Material[]>([])
  const [fabricados, setFabricados] = React.useState<ProductoFabricadoRef[]>([])
  // Productos MARCADOS como "Es producto fabricado" (Configuración → Productos).
  const [esFabricadoSet, setEsFabricadoSet] = React.useState<Set<number>>(new Set())
  const [loading, setLoading] = React.useState(true)

  // Pestaña activa: 'tabla' (productos fabricados) o 'editor' (crear/editar receta).
  const [tab, setTab] = React.useState<"tabla" | "editor">("tabla")

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
    const [p, m, f, ef] = await Promise.all([
      getProductos(),
      getMateriales({ soloActivos: true }),
      listarProductosFabricados(),
      getProductosFabricados(),
    ])
    setProductos(p.data || [])
    setMateriales(m.data)
    setFabricados(f.data)
    setEsFabricadoSet(ef.data)
    setLoading(false)
  }, [])
  React.useEffect(() => { cargar() }, [cargar])

  const materialById = React.useMemo(() => new Map(materiales.map((m) => [m.id!, m])), [materiales])
  const productoSel = productos.find((p) => p.id === productoId)
  // Map producto_id -> ref de su receta (para saber si tiene receta y su costo).
  const recetaPorProducto = React.useMemo(
    () => new Map(fabricados.map((f) => [f.producto_id, f])),
    [fabricados],
  )
  // Solo los productos marcados como fabricados. Respaldo: los que ya tengan
  // receta (por si se creó antes de existir la marca), para no ocultarlas.
  const productosFabricados = React.useMemo(
    () => productos
      .filter((p) => p.id != null && (esFabricadoSet.has(p.id) || recetaPorProducto.has(p.id)))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
    [productos, esFabricadoSet, recetaPorProducto],
  )

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

  /** Desde la tabla: abre el editor con el producto ya seleccionado. */
  async function editarDesdeTabla(id: number) {
    setTab("editor")
    await elegirProducto(id)
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
          Consulta qué productos fabricados tienen receta y su costo, o crea/edita la receta de un producto.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : (
        <Tabs value={tab} onValueChange={(v) => setTab(v as "tabla" | "editor")} className="space-y-4">
          <TabsList>
            <TabsTrigger value="tabla" className="gap-1.5"><Package className="h-4 w-4" /> Productos fabricados</TabsTrigger>
            <TabsTrigger value="editor" className="gap-1.5"><FileText className="h-4 w-4" /> Crear / Editar receta</TabsTrigger>
          </TabsList>

          {/* ── Tab 1: tabla de productos fabricados ── */}
          <TabsContent value="tabla">
            <TablaFabricados
              productos={productosFabricados}
              recetaPorProducto={recetaPorProducto}
              onEditar={editarDesdeTabla}
            />
          </TabsContent>

          {/* ── Tab 2: editor de receta ── */}
          <TabsContent value="editor">
            <Card className="rounded-xl border-stone-200">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-base md:text-lg">Producto a fabricar</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Solo aparecen los productos marcados como <b>fabricados</b> (Configuración → Productos, casilla &quot;Es producto fabricado&quot;).
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
                      <CommandInput placeholder="Buscar producto fabricado…" />
                      <CommandList>
                        <CommandEmpty>
                          {productosFabricados.length === 0
                            ? "No hay productos marcados como fabricados. Marca 'Es producto fabricado' en Configuración → Productos."
                            : "Sin resultados."}
                        </CommandEmpty>
                        <CommandGroup>
                          {productosFabricados.map((p) => (
                            <CommandItem
                              key={p.id}
                              value={`${p.nombre} ${p.codigo_barras || ""}`}
                              onSelect={() => elegirProducto(p.id!)}
                            >
                              <Check className={cn("mr-2 h-4 w-4", productoId === p.id ? "opacity-100" : "opacity-0")} />
                              <span className="flex-1 truncate">{p.nombre}</span>
                              {recetaPorProducto.has(p.id!) && (
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
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

// ==================== TABLA DE PRODUCTOS FABRICADOS ====================

/**
 * Tabla de productos marcados como fabricados: muestra si cada uno tiene receta
 * y su costo estimado. Al expandir una fila con receta, carga el detalle
 * (materiales + factores) con `getReceta` y muestra el desglose de costos.
 */
function TablaFabricados({
  productos,
  recetaPorProducto,
  onEditar,
}: {
  productos: Producto[]
  recetaPorProducto: Map<number, ProductoFabricadoRef>
  onEditar: (id: number) => void
}) {
  return (
    <Card className="rounded-xl border-stone-200">
      <CardHeader className="p-4 md:p-6 pb-3">
        <CardTitle className="text-base md:text-lg">Productos fabricados</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {productos.length} producto(s) marcados como fabricados. Despliega uno con receta para ver sus costos.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        {productos.length === 0 ? (
          <div className="text-center py-10 text-stone-500 text-sm">
            <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
            No hay productos marcados como fabricados.
            <div className="text-xs mt-1">Márcalos con &quot;Es producto fabricado&quot; en Configuración → Productos.</div>
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {productos.map((p) => {
              const ref = recetaPorProducto.get(p.id!)
              const tieneReceta = ref != null
              return (
                <AccordionItem key={p.id} value={String(p.id)} className="border rounded-lg px-3 data-[state=open]:bg-stone-50/40">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex flex-1 items-center justify-between gap-3 pr-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium truncate">{p.nombre}</span>
                        {tieneReceta ? (
                          <Badge variant="outline" className="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700 shrink-0">Con receta</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] border-stone-200 bg-stone-50 text-stone-500 shrink-0">Sin receta</Badge>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        {tieneReceta ? (
                          <>
                            <p className="text-[10px] uppercase text-stone-400">Costo estimado/u</p>
                            <p className="text-sm font-semibold tabular-nums text-amber-800">{formatCurrency(ref!.costo_unitario_estimado)}</p>
                          </>
                        ) : (
                          <span className="text-xs text-stone-400">—</span>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <FilaRecetaDetalle
                      productoId={p.id!}
                      tieneReceta={tieneReceta}
                      onEditar={() => onEditar(p.id!)}
                    />
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}

/** Detalle de la receta de un producto (lazy: se carga al expandir). */
function FilaRecetaDetalle({
  productoId,
  tieneReceta,
  onEditar,
}: {
  productoId: number
  tieneReceta: boolean
  onEditar: () => void
}) {
  const [receta, setReceta] = React.useState<Receta | null>(null)
  const [cargando, setCargando] = React.useState(true)

  React.useEffect(() => {
    let cancel = false
    if (!tieneReceta) { setCargando(false); return }
    setCargando(true)
    getReceta(productoId).then(({ data }) => {
      if (!cancel) { setReceta(data); setCargando(false) }
    })
    return () => { cancel = true }
  }, [productoId, tieneReceta])

  if (!tieneReceta) {
    return (
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-stone-500">Este producto todavía no tiene receta.</span>
        <Button size="sm" className="gap-1" onClick={onEditar}><Plus className="h-3.5 w-3.5" /> Crear receta</Button>
      </div>
    )
  }
  if (cargando) return <div className="flex justify-center py-4"><Spinner className="h-5 w-5" /></div>
  if (!receta) return <p className="text-sm text-stone-500">No se pudo cargar la receta.</p>

  const costoMateriales = receta.lineas.reduce((a, l) => a + (l.consumo_por_unidad || 0) * (l.costo_promedio || 0), 0)
  const factores = (receta.costo_energia || 0) + (receta.costo_mano_obra || 0) + (receta.costo_overhead || 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-stone-500">
          Estándar: {receta.estandar_unidades_por_minuto || 0} u/min
        </p>
        <Button size="sm" variant="outline" className="h-8 gap-1" onClick={onEditar}><Pencil className="h-3.5 w-3.5" /> Editar receta</Button>
      </div>

      {/* Materiales */}
      <div className="rounded-lg border border-stone-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50">
              <TableHead>Material</TableHead>
              <TableHead className="text-right">Consumo/u</TableHead>
              <TableHead className="text-right">Costo unit.</TableHead>
              <TableHead className="text-right">Subtotal/u</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receta.lineas.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-stone-400 text-sm py-4">Sin materiales.</TableCell></TableRow>
            ) : receta.lineas.map((l) => (
              <TableRow key={l.material_id}>
                <TableCell className="text-sm">{l.material_nombre || `#${l.material_id}`}{l.unidad_medida ? <span className="text-stone-400 text-xs"> ({l.unidad_medida})</span> : null}</TableCell>
                <TableCell className="text-right tabular-nums text-sm">{l.consumo_por_unidad}</TableCell>
                <TableCell className="text-right tabular-nums text-sm text-stone-500">{formatCurrency(l.costo_promedio || 0)}</TableCell>
                <TableCell className="text-right tabular-nums text-sm font-medium">{formatCurrency((l.consumo_por_unidad || 0) * (l.costo_promedio || 0))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Desglose de costos */}
      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 space-y-1 text-sm max-w-md ml-auto">
        <div className="flex justify-between text-stone-600"><span>Materiales por unidad</span><span className="tabular-nums">{formatCurrency(costoMateriales)}</span></div>
        <div className="flex justify-between text-stone-600"><span>Energía</span><span className="tabular-nums">{formatCurrency(receta.costo_energia || 0)}</span></div>
        <div className="flex justify-between text-stone-600"><span>Mano de obra</span><span className="tabular-nums">{formatCurrency(receta.costo_mano_obra || 0)}</span></div>
        <div className="flex justify-between text-stone-600"><span>Overhead</span><span className="tabular-nums">{formatCurrency(receta.costo_overhead || 0)}</span></div>
        <div className="flex justify-between text-[11px] text-stone-400"><span>Factores (subtotal)</span><span className="tabular-nums">{formatCurrency(factores)}</span></div>
        <div className="flex justify-between font-bold text-amber-900 pt-1 border-t border-amber-200"><span>Costo estimado / unidad</span><span className="tabular-nums">{formatCurrency(receta.costo_unitario_estimado || (costoMateriales + factores))}</span></div>
      </div>
    </div>
  )
}
