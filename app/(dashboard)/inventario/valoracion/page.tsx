"use client"

import * as React from "react"
import {
  DollarSign,
  Package,
  Warehouse,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  CalendarClock,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { TablePaginator } from "@/components/ui/table-paginator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { getValoracionInventarioExtendida, getValoracionPorAlmacen, type ProductoValoracionExtendida } from "@/lib/services/inventario"
import { getGruposTallas, type GrupoTallaRef } from "@/lib/services/grupos-tallas"
import { useAuth } from "@/lib/contexts/auth-context"
import { getAlmacenes, type Almacen } from "@/lib/services/catalogos"
import { exportToXlsx } from "@/lib/utils/export"
import { Indicador } from "@/components/ui/indicador"

type EstadoInventario = "todos" | "con_stock" | "sin_stock" | "stock_bajo"
type RotacionFiltro = "todos" | "sin_ventas" | "mas_30_dias" | "mas_60_dias" | "mas_90_dias"

/** Fila renderizable de la tabla: producto suelto o grupo de tallas agregado. */
type FilaVal =
  | { tipo: "single"; p: ProductoValoracionExtendida }
  | {
      tipo: "grupo"
      grupoId: number
      nombre: string
      codigo_barras?: string
      stock: number
      valorCosto: number
      valorComercial: number
      margen: number
      tallas: ProductoValoracionExtendida[]
    }

/** Chip-filtro de estado (con stock / stock bajo / sin stock). */
function FiltroChip({ label, count, active, onClick, color = "neutral" }: {
  label: string; count: number; active: boolean; onClick: () => void; color?: "neutral" | "emerald" | "amber" | "red"
}) {
  const activeCls: Record<string, string> = {
    neutral: "bg-stone-800 text-white ring-stone-800",
    emerald: "bg-emerald-600 text-white ring-emerald-600",
    amber: "bg-amber-500 text-white ring-amber-500",
    red: "bg-red-600 text-white ring-red-600",
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${
        active ? activeCls[color] : "bg-white text-stone-600 ring-stone-200 hover:bg-stone-50"
      }`}
    >
      {label}
      <span className={`rounded-full px-1.5 text-[10px] leading-4 ${active ? "bg-white/25" : "bg-stone-100 text-stone-600"}`}>{count}</span>
    </button>
  )
}

/** Chip compacto para el análisis de rotación. */
function RotChip({ label, value, active, onClick, color }: {
  label: string; value: number; active: boolean; onClick: () => void; color: "red" | "orange" | "amber" | "stone"
}) {
  const ring: Record<string, string> = { red: "ring-red-300", orange: "ring-orange-300", amber: "ring-amber-300", stone: "ring-stone-400" }
  const dot: Record<string, string> = { red: "bg-red-500", orange: "bg-orange-500", amber: "bg-amber-500", stone: "bg-stone-500" }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
        active ? `bg-stone-50 ring-2 ${ring[color]} border-transparent` : "bg-white border-stone-200 hover:bg-stone-50"
      }`}
    >
      <span className="flex items-center gap-2 text-xs text-stone-600"><span className={`h-2 w-2 rounded-full ${dot[color]}`} />{label}</span>
      <span className="text-lg font-semibold text-stone-800 tabular-nums">{value}</span>
    </button>
  )
}

export default function ValoracionPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  // Agrupar tallas solo si la empresa tiene activo el sistema de productos por talla.
  const tallasActivo = user?.flags?.productos_por_talla ?? false
  const [productos, setProductos] = React.useState<ProductoValoracionExtendida[]>([])
  const [almacenes, setAlmacenes] = React.useState<Almacen[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadingTable, setLoadingTable] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [almacenFiltro, setAlmacenFiltro] = React.useState<string>("todos")
  const [estadoFiltro, setEstadoFiltro] = React.useState<EstadoInventario>("todos")
  const [rotacionFiltro, setRotacionFiltro] = React.useState<RotacionFiltro>("todos")
  const [expandedRows, setExpandedRows] = React.useState<Set<number>>(new Set())
  // Grupos de tallas: mapa producto_id -> ref de grupo, y set de grupos expandidos.
  const [gruposTallas, setGruposTallas] = React.useState<Map<number, GrupoTallaRef>>(new Map())
  const [gruposExpandidos, setGruposExpandidos] = React.useState<Set<number>>(new Set())
  // Paginacion client-side (50/100/1000).
  const [pageSize, setPageSize] = React.useState(100)
  const [pageIndex, setPageIndex] = React.useState(0)

  // Initial load - almacenes only
  React.useEffect(() => {
    loadAlmacenes()
  }, [])

  // Reactive effect - reload data when almacen changes
  React.useEffect(() => {
    loadProductos()
  }, [almacenFiltro])

  async function loadAlmacenes() {
    const almacenesRes = await getAlmacenes()
    setAlmacenes(almacenesRes.data)
  }

  async function loadProductos() {
    // Show table skeleton while loading
    if (!loading) setLoadingTable(true)

    let valoracionRes

    if (almacenFiltro === "todos") {
      // Get all products with consolidated stock
      valoracionRes = await getValoracionInventarioExtendida()
    } else {
      // Get products filtered by specific almacen
      valoracionRes = await getValoracionPorAlmacen(parseInt(almacenFiltro))
    }

    if (valoracionRes.error) {
      toast({ title: "Error", description: valoracionRes.error, variant: "destructive" })
    } else {
      setProductos(valoracionRes.data)
    }

    // Grupos de tallas (degrada a mapa vacio si la tabla no existe).
    const gruposRes = await getGruposTallas()
    setGruposTallas(gruposRes.data)

    setLoading(false)
    setLoadingTable(false)
  }

  const productosFiltrados = React.useMemo(() => {
    return productos.filter(p => {
      // Search filter
      const matchesSearch =
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo_barras?.toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      let matchesEstado = true
      if (estadoFiltro === "con_stock") matchesEstado = p.stock_total > 0
      if (estadoFiltro === "sin_stock") matchesEstado = p.stock_total === 0
      if (estadoFiltro === "stock_bajo") matchesEstado = p.stock_total > 0 && p.stock_total <= 10

      // Warehouse filter
      let matchesAlmacen = true
      if (almacenFiltro !== "todos") {
        matchesAlmacen = p.stock_por_almacen.some(s => s.almacen_id === parseInt(almacenFiltro))
      }

      // Rotation filter
      let matchesRotacion = true
      if (rotacionFiltro === "sin_ventas") matchesRotacion = p.dias_sin_venta === null && p.stock_total > 0
      if (rotacionFiltro === "mas_30_dias") matchesRotacion = p.dias_sin_venta !== null && p.dias_sin_venta >= 30
      if (rotacionFiltro === "mas_60_dias") matchesRotacion = p.dias_sin_venta !== null && p.dias_sin_venta >= 60
      if (rotacionFiltro === "mas_90_dias") matchesRotacion = p.dias_sin_venta !== null && p.dias_sin_venta >= 90

      return matchesSearch && matchesEstado && matchesAlmacen && matchesRotacion
    })
  }, [productos, searchTerm, estadoFiltro, almacenFiltro, rotacionFiltro])

  // Filas renderizables: agrupa las tallas hermanas en una sola fila "grupo".
  // Se recorre en orden; cada grupo toma la posicion de su primer miembro y
  // agrega stock/valores. Un producto sin entrada en el mapa es una fila suelta.
  const filasValoracion = React.useMemo<FilaVal[]>(() => {
    const filas: FilaVal[] = []
    const indicePorGrupo = new Map<number, number>() // grupo_id -> indice en `filas`
    for (const p of productosFiltrados) {
      // Si la empresa no tiene activo el sistema de tallas, no agrupamos.
      const ref = tallasActivo ? gruposTallas.get(p.id) : undefined
      if (!ref) {
        filas.push({ tipo: "single", p })
        continue
      }
      const existente = indicePorGrupo.get(ref.grupo_id)
      if (existente === undefined) {
        filas.push({
          tipo: "grupo",
          grupoId: ref.grupo_id,
          nombre: ref.nombre_grupo || p.nombre,
          codigo_barras: p.codigo_barras || undefined,
          stock: p.stock_total,
          valorCosto: p.valor_costo,
          valorComercial: p.valor_comercial,
          margen: p.margen_potencial,
          tallas: [p],
        })
        indicePorGrupo.set(ref.grupo_id, filas.length - 1)
      } else {
        const fila = filas[existente]
        if (fila.tipo === "grupo") {
          fila.stock += p.stock_total
          fila.valorCosto += p.valor_costo
          fila.valorComercial += p.valor_comercial
          fila.margen += p.margen_potencial
          fila.tallas.push(p)
        }
      }
    }
    return filas
  }, [productosFiltrados, gruposTallas, tallasActivo])

  // Slice paginado (los totales/footer siguen sobre productosFiltrados completo).
  const filasPaginadas = React.useMemo(
    () => filasValoracion.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize),
    [filasValoracion, pageIndex, pageSize]
  )
  // Reset de pagina al cambiar filtros o tamano.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => { setPageIndex(0); setExpandedRows(new Set()); setGruposExpandidos(new Set()) }, [
    searchTerm, estadoFiltro, almacenFiltro, rotacionFiltro, pageSize,
  ])

  const totales = React.useMemo(() => {
    const totalUnidades = productosFiltrados.reduce((acc, p) => acc + p.stock_total, 0)
    const valorCosto = productosFiltrados.reduce((acc, p) => acc + p.valor_costo, 0)
    const valorComercial = productosFiltrados.reduce((acc, p) => acc + p.valor_comercial, 0)
    const margenPotencial = valorComercial - valorCosto
    const productosConStock = productosFiltrados.filter(p => p.stock_total > 0).length
    const productosSinStock = productosFiltrados.filter(p => p.stock_total === 0).length
    const productosStockBajo = productosFiltrados.filter(p => p.stock_total > 0 && p.stock_total <= 10).length

    // Rotation stats
    const productosSinVentas = productosFiltrados.filter(p => p.dias_sin_venta === null && p.stock_total > 0).length
    const productosMas30Dias = productosFiltrados.filter(p => p.dias_sin_venta !== null && p.dias_sin_venta >= 30).length
    const productosMas60Dias = productosFiltrados.filter(p => p.dias_sin_venta !== null && p.dias_sin_venta >= 60).length
    const productosMas90Dias = productosFiltrados.filter(p => p.dias_sin_venta !== null && p.dias_sin_venta >= 90).length

    // Value of slow moving inventory
    const valorSinRotacion = productosFiltrados
      .filter(p => p.dias_sin_venta === null || p.dias_sin_venta >= 30)
      .reduce((acc, p) => acc + p.valor_costo, 0)

    // Valuation by warehouse
    const valorPorAlmacen: Record<number, { nombre: string; valorCosto: number; valorComercial: number; unidades: number }> = {}
    productosFiltrados.forEach(p => {
      p.stock_por_almacen.forEach(s => {
        if (!valorPorAlmacen[s.almacen_id]) {
          valorPorAlmacen[s.almacen_id] = { nombre: s.almacen_nombre, valorCosto: 0, valorComercial: 0, unidades: 0 }
        }
        valorPorAlmacen[s.almacen_id].valorCosto += s.valor_costo
        valorPorAlmacen[s.almacen_id].valorComercial += s.valor_comercial
        valorPorAlmacen[s.almacen_id].unidades += s.stock
      })
    })

    return {
      totalUnidades,
      valorCosto,
      valorComercial,
      margenPotencial,
      productosConStock,
      productosSinStock,
      productosStockBajo,
      productosTotal: productosFiltrados.length,
      valorPorAlmacen: Object.values(valorPorAlmacen),
      productosSinVentas,
      productosMas30Dias,
      productosMas60Dias,
      productosMas90Dias,
      valorSinRotacion
    }
  }, [productosFiltrados])

  function toggleRow(id: number) {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  function toggleGrupo(grupoId: number) {
    const nuevo = new Set(gruposExpandidos)
    if (nuevo.has(grupoId)) {
      nuevo.delete(grupoId)
    } else {
      nuevo.add(grupoId)
    }
    setGruposExpandidos(nuevo)
  }

  function formatCurrency(value: number): string {
    return `L ${value.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  function exportToExcel() {
    if (productosFiltrados.length === 0) {
      toast({ title: "Sin datos", description: "No hay productos para exportar", variant: "destructive" })
      return
    }

    const data: Record<string, unknown>[] = productosFiltrados.map(p => ({
      'Codigo': p.codigo_barras || '',
      'Producto': p.nombre,
      'Stock Total': p.stock_total,
      'Costo Promedio': p.costo_promedio,
      'Precio Venta': p.precio_venta,
      'Valor Costo': p.valor_costo,
      'Valor Comercial': p.valor_comercial,
      'Margen Potencial': p.margen_potencial,
      'Dias Sin Venta': p.dias_sin_venta ?? 'Sin ventas',
      'Ultima Venta': p.ultima_venta ? new Date(p.ultima_venta).toLocaleDateString('es-HN', { timeZone: 'UTC' }) : 'Nunca'
    }))

    data.push({
      'Codigo': '',
      'Producto': 'TOTAL',
      'Stock Total': totales.totalUnidades,
      'Costo Promedio': 0,
      'Precio Venta': 0,
      'Valor Costo': totales.valorCosto,
      'Valor Comercial': totales.valorComercial,
      'Margen Potencial': totales.margenPotencial,
      'Dias Sin Venta': '',
      'Ultima Venta': ''
    })

    exportToXlsx(data, {
      sheetName: "Valoracion",
      filename: "Valoracion_Inventario",
      colWidths: [14, 30, 12, 14, 12, 14, 16, 16, 14, 14],
    })
    toast({ title: "Exportado", description: "El archivo Excel se descargo correctamente" })
  }

  function getStockBadge(stock: number) {
    if (stock === 0) return <Badge variant="destructive" className="text-xs">Sin Stock</Badge>
    if (stock <= 10) return <Badge className="text-xs bg-amber-500 hover:bg-amber-600">Stock Bajo</Badge>
    return <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">En Stock</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-5 bg-stone-50/60 -m-4 md:-m-6 p-4 md:p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-stone-800">Valoración de Inventario</h1>
          <p className="text-stone-500 text-sm mt-1">Análisis financiero del patrimonio en inventario</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Warehouse Filter */}
          <Select value={almacenFiltro} onValueChange={setAlmacenFiltro}>
            <SelectTrigger className="w-56 bg-white rounded-full border-stone-200 shadow-sm">
              <Warehouse className="h-4 w-4 mr-2 text-stone-500" />
              <SelectValue placeholder="Ver Almacén" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los Almacenes</SelectItem>
              {almacenes.map(a => (
                <SelectItem key={a.id} value={a.id!.toString()}>{a.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={exportToExcel} variant="outline" className="gap-2 bg-white rounded-full border-stone-200 shadow-sm">
            <Download className="h-4 w-4" />
            Descargar Excel
          </Button>
        </div>
      </div>

      {/* Contenedor único de indicadores + filtros de estado */}
      <Card className="border-stone-200 shadow-sm">
        <CardContent className="p-4 md:p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-4 md:divide-x md:divide-stone-200 [&>*]:md:pl-4 [&>*:first-child]:md:pl-0">
            <Indicador label="Valoración (costo)" value={formatCurrency(totales.valorCosto)} />
            <Indicador label="Valor comercial" value={formatCurrency(totales.valorComercial)} valueClass="text-emerald-700" />
            <Indicador label="Margen potencial" value={formatCurrency(totales.margenPotencial)} valueClass={totales.margenPotencial >= 0 ? "text-emerald-700" : "text-red-600"} />
            <Indicador label="Unidades" value={totales.totalUnidades.toLocaleString("es-HN")} />
            <Indicador label="Productos" value={totales.productosTotal.toLocaleString("es-HN")} />
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-stone-200 pt-4">
            <span className="text-xs font-medium text-stone-500 mr-1">Estado:</span>
            <FiltroChip label="Todos" count={totales.productosTotal} active={estadoFiltro === "todos"} onClick={() => setEstadoFiltro("todos")} />
            <FiltroChip label="Con stock" count={totales.productosConStock} color="emerald" active={estadoFiltro === "con_stock"} onClick={() => setEstadoFiltro(estadoFiltro === "con_stock" ? "todos" : "con_stock")} />
            <FiltroChip label="Stock bajo" count={totales.productosStockBajo} color="amber" active={estadoFiltro === "stock_bajo"} onClick={() => setEstadoFiltro(estadoFiltro === "stock_bajo" ? "todos" : "stock_bajo")} />
            <FiltroChip label="Sin stock" count={totales.productosSinStock} color="red" active={estadoFiltro === "sin_stock"} onClick={() => setEstadoFiltro(estadoFiltro === "sin_stock" ? "todos" : "sin_stock")} />
          </div>
        </CardContent>
      </Card>

      {/* Rotación (compacto) */}
      <Card className="border-stone-200 shadow-sm">
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <CalendarClock className="h-4 w-4 text-stone-500" /> Rotación
              <span className="text-xs font-normal text-stone-400">· productos sin movimiento de venta</span>
            </div>
            <Badge variant="outline" className="text-stone-600 border-stone-300 font-normal">
              {formatCurrency(totales.valorSinRotacion)} en inventario lento
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <RotChip label="Sin ventas" value={totales.productosSinVentas} color="red" active={rotacionFiltro === "sin_ventas"} onClick={() => setRotacionFiltro(rotacionFiltro === "sin_ventas" ? "todos" : "sin_ventas")} />
            <RotChip label="+30 días" value={totales.productosMas30Dias} color="orange" active={rotacionFiltro === "mas_30_dias"} onClick={() => setRotacionFiltro(rotacionFiltro === "mas_30_dias" ? "todos" : "mas_30_dias")} />
            <RotChip label="+60 días" value={totales.productosMas60Dias} color="amber" active={rotacionFiltro === "mas_60_dias"} onClick={() => setRotacionFiltro(rotacionFiltro === "mas_60_dias" ? "todos" : "mas_60_dias")} />
            <RotChip label="+90 días" value={totales.productosMas90Dias} color="stone" active={rotacionFiltro === "mas_90_dias"} onClick={() => setRotacionFiltro(rotacionFiltro === "mas_90_dias" ? "todos" : "mas_90_dias")} />
          </div>
        </CardContent>
      </Card>

      {/* Distribución del valor por almacén (tabla) */}
      {totales.valorPorAlmacen.length > 0 && almacenFiltro === "todos" && (
        <Card className="border-stone-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-stone-800">
              <Warehouse className="h-4 w-4 text-stone-500" />
              Distribución del valor por almacén
            </CardTitle>
            <CardDescription>Valoración a costo de cada almacén y su participación. Haz click en una fila para filtrar los productos.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-stone-50">
                    <TableHead>Almacén</TableHead>
                    <TableHead className="text-right">Unidades</TableHead>
                    <TableHead className="text-right">Valor costo</TableHead>
                    <TableHead className="text-right">Valor comercial</TableHead>
                    <TableHead className="text-right w-[220px]">% del costo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...totales.valorPorAlmacen].sort((a, b) => b.valorCosto - a.valorCosto).map((a, idx) => {
                    const pct = totales.valorCosto > 0 ? (a.valorCosto / totales.valorCosto) * 100 : 0
                    const almId = almacenes.find(x => x.nombre === a.nombre)?.id
                    return (
                      <TableRow
                        key={idx}
                        className="cursor-pointer hover:bg-stone-50"
                        onClick={() => almId && setAlmacenFiltro(almId.toString())}
                      >
                        <TableCell className="font-medium text-stone-800">{a.nombre}</TableCell>
                        <TableCell className="text-right tabular-nums">{a.unidades.toLocaleString("es-HN")}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(a.valorCosto)}</TableCell>
                        <TableCell className="text-right font-mono text-emerald-700">{formatCurrency(a.valorComercial)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Progress value={pct} className="h-1.5 w-24" />
                            <span className="text-xs font-medium text-stone-600 w-12 text-right tabular-nums">{pct.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-semibold">Total</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{totales.totalUnidades.toLocaleString("es-HN")}</TableCell>
                    <TableCell className="text-right font-mono font-semibold">{formatCurrency(totales.valorCosto)}</TableCell>
                    <TableCell className="text-right font-mono font-semibold text-emerald-700">{formatCurrency(totales.valorComercial)}</TableCell>
                    <TableCell className="text-right font-semibold">100%</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Table */}
      <Card className="border-stone-200 shadow-sm">
        <CardHeader className="border-b border-stone-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Detalle de Productos</CardTitle>
              <CardDescription>Valoración individual con desglose por almacén</CardDescription>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              <Select value={estadoFiltro} onValueChange={(v) => setEstadoFiltro(v as EstadoInventario)}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="con_stock">Con Stock</SelectItem>
                  <SelectItem value="stock_bajo">Stock Bajo</SelectItem>
                  <SelectItem value="sin_stock">Sin Stock</SelectItem>
                </SelectContent>
              </Select>

              <Select value={rotacionFiltro} onValueChange={(v) => setRotacionFiltro(v as RotacionFiltro)}>
                <SelectTrigger className="w-full sm:w-44">
                  <CalendarClock className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Rotacion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Toda Rotacion</SelectItem>
                  <SelectItem value="sin_ventas">Sin Ventas</SelectItem>
                  <SelectItem value="mas_30_dias">+30 dias</SelectItem>
                  <SelectItem value="mas_60_dias">+60 dias</SelectItem>
                  <SelectItem value="mas_90_dias">+90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Loading State */}
          {loadingTable ? (
            <div className="p-4 md:p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <div className="grid grid-cols-4 gap-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center p-4 rounded-full bg-stone-100 mb-4">
                <Package className="h-10 w-10 text-stone-400" />
              </div>
              <p className="text-lg font-medium text-stone-600 mb-2">
                No se encontraron existencias
              </p>
              <p className="text-sm text-stone-500 max-w-md mx-auto">
                {almacenFiltro !== "todos"
                  ? "No hay productos con stock en este almacen. Prueba seleccionando otro almacen o viendo todos."
                  : "No hay productos que coincidan con los filtros seleccionados."}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden divide-y">
                {filasPaginadas.map((fila) => fila.tipo === "grupo" ? (
                  <div key={`g-${fila.grupoId}`}>
                    <button
                      type="button"
                      onClick={() => toggleGrupo(fila.grupoId)}
                      className="w-full text-left p-4"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {gruposExpandidos.has(fila.grupoId) ? (
                            <ChevronDown className="h-4 w-4 shrink-0 text-stone-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0 text-stone-500" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{fila.nombre}</p>
                            <p className="text-xs text-muted-foreground font-mono">{fila.codigo_barras || '-'}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-700 shrink-0">
                          {fila.tallas.length} tallas
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                        <div>
                          <p className="text-muted-foreground text-xs">Stock</p>
                          <p className="font-bold">{fila.stock}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Val. Costo</p>
                          <p className="font-medium">{formatCurrency(fila.valorCosto)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Val. Comercial</p>
                          <p className="font-medium text-emerald-600">{formatCurrency(fila.valorComercial)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Margen</p>
                          <p className={`font-medium ${fila.margen >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(fila.margen)}</p>
                        </div>
                      </div>
                    </button>
                    {gruposExpandidos.has(fila.grupoId) && (
                      <div className="px-4 pb-4 space-y-2">
                        {fila.tallas.map((t) => (
                          <div key={t.id} className="p-3 rounded-lg bg-muted/50 text-sm">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <Badge variant="outline" className="text-xs border-indigo-300 text-indigo-700 bg-indigo-50">
                                Talla {t.talla || '-'}
                              </Badge>
                              <span className="text-xs text-muted-foreground font-mono">{t.codigo_barras || '-'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <p className="text-muted-foreground">Stock</p>
                                <p className="font-medium">{t.stock_total}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Costo</p>
                                <p>{formatCurrency(t.costo_promedio)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Precio</p>
                                <p>{formatCurrency(t.precio_venta)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Val. Costo</p>
                                <p>{formatCurrency(t.valor_costo)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Val. Comercial</p>
                                <p className="text-emerald-600">{formatCurrency(t.valor_comercial)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (() => { const p = fila.p; return (
                  <Collapsible key={p.id}>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{p.nombre}</p>
                          <p className="text-xs text-muted-foreground font-mono">{p.codigo_barras || '-'}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStockBadge(p.stock_total)}
                          {p.dias_sin_venta === null ? (
                            p.stock_total > 0 && (
                              <Badge variant="outline" className="text-xs border-red-300 text-red-700 bg-red-50">
                                Sin ventas
                              </Badge>
                            )
                          ) : p.dias_sin_venta >= 30 && (
                            <Badge variant="outline" className={`text-xs ${
                              p.dias_sin_venta >= 90
                                ? "border-stone-400 text-stone-700 bg-stone-100"
                                : p.dias_sin_venta >= 60
                                  ? "border-amber-400 text-amber-700 bg-amber-50"
                                  : "border-orange-400 text-orange-700 bg-orange-50"
                            }`}>
                              {p.dias_sin_venta}d sin venta
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                        <div>
                          <p className="text-muted-foreground text-xs">Stock</p>
                          <p className="font-bold">{p.stock_total}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Costo Unit.</p>
                          <p className="font-medium">{formatCurrency(p.costo_promedio)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Val. Costo</p>
                          <p className="font-medium">{formatCurrency(p.valor_costo)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Val. Comercial</p>
                          <p className="font-medium text-emerald-600">{formatCurrency(p.valor_comercial)}</p>
                        </div>
                      </div>

                      {p.stock_por_almacen.length > 0 && (
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full mt-3 text-xs">
                            <Warehouse className="h-3 w-3 mr-1" />
                            Ver por almacen ({p.stock_por_almacen.length})
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </Button>
                        </CollapsibleTrigger>
                      )}
                    </div>

                    <CollapsibleContent>
                      <div className="px-4 pb-4 space-y-2">
                        {p.stock_por_almacen.map((s, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-muted/50 text-sm">
                            <p className="font-medium mb-1">{s.almacen_nombre}</p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <p className="text-muted-foreground">Stock</p>
                                <p className="font-medium">{s.stock}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Costo</p>
                                <p>{formatCurrency(s.valor_costo)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Comercial</p>
                                <p className="text-emerald-600">{formatCurrency(s.valor_comercial)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ) })())}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <Table containerClassName="max-h-[60vh] overflow-y-auto">
                  <TableHeader>
                    <TableRow className="bg-stone-50 [&>th]:sticky [&>th]:top-0 [&>th]:z-10 [&>th]:bg-stone-50">
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Codigo</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-center">Rotacion</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Costo Prom.</TableHead>
                      <TableHead className="text-right">Precio Venta</TableHead>
                      <TableHead className="text-right">Val. Costo</TableHead>
                      <TableHead className="text-right">Val. Comercial</TableHead>
                      <TableHead className="text-right">Margen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Loading Skeleton */}
                    {loadingTable && (
                      <>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}

                    {/* Empty State */}
                    {!loadingTable && productosFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={11} className="h-48 text-center">
                          <div className="flex flex-col items-center justify-center py-8">
                            <div className="p-4 rounded-full bg-stone-100 mb-4">
                              <Package className="h-8 w-8 text-stone-400" />
                            </div>
                            <p className="text-lg font-medium text-stone-600 mb-1">
                              No se encontraron existencias
                            </p>
                            <p className="text-sm text-stone-500">
                              {almacenFiltro !== "todos"
                                ? "No hay productos con stock en este almacen"
                                : "No hay productos que coincidan con los filtros"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Data Rows */}
                    {!loadingTable && filasPaginadas.map((fila) => {
                      if (fila.tipo === "grupo") {
                        const abierto = gruposExpandidos.has(fila.grupoId)
                        return (
                          <React.Fragment key={`g-${fila.grupoId}`}>
                            <TableRow
                              className={`cursor-pointer hover:bg-stone-50 transition-colors ${abierto ? 'bg-stone-50' : ''}`}
                              onClick={() => toggleGrupo(fila.grupoId)}
                            >
                              <TableCell className="w-8">
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  {abierto ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </Button>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{fila.codigo_barras || '-'}</TableCell>
                              <TableCell className="font-medium">
                                <span className="inline-flex items-center gap-2">
                                  <Package className="h-4 w-4 text-indigo-500" />
                                  {fila.nombre}
                                  <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-700">{fila.tallas.length} tallas</Badge>
                                </span>
                              </TableCell>
                              <TableCell className="text-center">{getStockBadge(fila.stock)}</TableCell>
                              <TableCell className="text-center"><span className="text-xs text-muted-foreground">-</span></TableCell>
                              <TableCell className="text-right font-mono">{fila.stock}</TableCell>
                              <TableCell className="text-right font-mono text-muted-foreground">-</TableCell>
                              <TableCell className="text-right font-mono text-muted-foreground">-</TableCell>
                              <TableCell className="text-right font-mono font-medium">{formatCurrency(fila.valorCosto)}</TableCell>
                              <TableCell className="text-right font-mono font-medium text-emerald-600">{formatCurrency(fila.valorComercial)}</TableCell>
                              <TableCell className="text-right">
                                <span className={`font-mono font-medium ${fila.margen >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {formatCurrency(fila.margen)}
                                </span>
                              </TableCell>
                            </TableRow>

                            {/* Sub-filas: una por talla */}
                            {abierto && fila.tallas.map((t) => (
                              <TableRow key={`t-${t.id}`} className="bg-muted/20">
                                <TableCell className="w-8"></TableCell>
                                <TableCell className="font-mono text-sm pl-8">{t.codigo_barras || '-'}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs border-indigo-300 text-indigo-700 bg-indigo-50">
                                    Talla {t.talla || '-'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">{getStockBadge(t.stock_total)}</TableCell>
                                <TableCell className="text-center"><span className="text-xs text-muted-foreground">-</span></TableCell>
                                <TableCell className="text-right font-mono">{t.stock_total}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(t.costo_promedio)}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(t.precio_venta)}</TableCell>
                                <TableCell className="text-right font-mono font-medium">{formatCurrency(t.valor_costo)}</TableCell>
                                <TableCell className="text-right font-mono font-medium text-emerald-600">{formatCurrency(t.valor_comercial)}</TableCell>
                                <TableCell className="text-right"><span className="text-xs text-muted-foreground">-</span></TableCell>
                              </TableRow>
                            ))}
                          </React.Fragment>
                        )
                      }
                      const p = fila.p
                      return (
                      <React.Fragment key={p.id}>
                        <TableRow
                          className={`cursor-pointer hover:bg-stone-50 transition-colors ${expandedRows.has(p.id) ? 'bg-stone-50' : ''}`}
                          onClick={() => p.stock_por_almacen.length > 0 && toggleRow(p.id)}
                        >
                          <TableCell className="w-8">
                            {p.stock_por_almacen.length > 0 && (
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                {expandedRows.has(p.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{p.codigo_barras || '-'}</TableCell>
                          <TableCell className="font-medium">{p.nombre}</TableCell>
                          <TableCell className="text-center">{getStockBadge(p.stock_total)}</TableCell>
                          <TableCell className="text-center">
                            {p.dias_sin_venta === null ? (
                              p.stock_total > 0 ? (
                                <Badge variant="outline" className="text-xs border-red-300 text-red-700 bg-red-50">
                                  Sin ventas
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )
                            ) : p.dias_sin_venta >= 90 ? (
                              <Badge variant="outline" className="text-xs border-stone-400 text-stone-700 bg-stone-100">
                                {p.dias_sin_venta}d
                              </Badge>
                            ) : p.dias_sin_venta >= 60 ? (
                              <Badge variant="outline" className="text-xs border-amber-400 text-amber-700 bg-amber-50">
                                {p.dias_sin_venta}d
                              </Badge>
                            ) : p.dias_sin_venta >= 30 ? (
                              <Badge variant="outline" className="text-xs border-orange-400 text-orange-700 bg-orange-50">
                                {p.dias_sin_venta}d
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs border-emerald-400 text-emerald-700 bg-emerald-50">
                                {p.dias_sin_venta}d
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono">{p.stock_total}</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(p.costo_promedio)}</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(p.precio_venta)}</TableCell>
                          <TableCell className="text-right font-mono font-medium">{formatCurrency(p.valor_costo)}</TableCell>
                          <TableCell className="text-right font-mono font-medium text-emerald-600">{formatCurrency(p.valor_comercial)}</TableCell>
                          <TableCell className="text-right">
                            <span className={`font-mono font-medium ${p.margen_potencial >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {formatCurrency(p.margen_potencial)}
                            </span>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Row - Warehouse Details */}
                        {expandedRows.has(p.id) && p.stock_por_almacen.length > 0 && (
                          <TableRow className="bg-muted/20">
                            <TableCell colSpan={11} className="py-3">
                              <div className="pl-10 pr-4">
                                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                  <Warehouse className="h-3 w-3" />
                                  Distribucion por Almacen
                                </p>
                                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                  {p.stock_por_almacen.map((s, idx) => (
                                    <div key={idx} className="p-3 rounded-lg bg-background border text-sm">
                                      <p className="font-medium mb-2">{s.almacen_nombre}</p>
                                      <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div>
                                          <p className="text-muted-foreground">Stock</p>
                                          <p className="font-medium">{s.stock}</p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground">Val. Costo</p>
                                          <p className="font-medium">{formatCurrency(s.valor_costo)}</p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground">Val. Comercial</p>
                                          <p className="font-medium text-emerald-600">{formatCurrency(s.valor_comercial)}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                      )
                    })}

                  </TableBody>
                </Table>
              </div>

              <TablePaginator
                pageIndex={pageIndex}
                pageSize={pageSize}
                totalItems={filasValoracion.length}
                onPageIndexChange={setPageIndex}
                onPageSizeChange={setPageSize}
                className="border-t"
              />

              {/* Totals Footer */}
              <div className="p-4 md:p-6 border-t bg-stone-50/60">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-stone-200/60">
                      <DollarSign className="h-5 w-5 text-stone-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Totales ({productosFiltrados.length} productos)</p>
                      <p className="font-medium">{totales.totalUnidades.toLocaleString("es-HN")} unidades en inventario</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Valoracion Costo</p>
                      <p className="text-xl font-bold">{formatCurrency(totales.valorCosto)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Valoracion Comercial</p>
                      <p className="text-xl font-bold text-emerald-600">{formatCurrency(totales.valorComercial)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Margen Potencial</p>
                      <p className="text-xl font-bold text-emerald-600">+{formatCurrency(totales.margenPotencial)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
