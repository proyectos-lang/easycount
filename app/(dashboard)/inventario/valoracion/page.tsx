"use client"

import * as React from "react"
import { 
  DollarSign, 
  Package, 
  FileSpreadsheet, 
  TrendingUp, 
  Boxes,
  Warehouse,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  PieChart,
  Clock,
  TrendingDown,
  CalendarClock,
  Download,
  MapPin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { getValoracionInventarioExtendida, getValoracionPorAlmacen, type ProductoValoracionExtendida } from "@/lib/services/inventario"
import { getAlmacenes, type Almacen } from "@/lib/services/catalogos"
import * as XLSX from "xlsx"
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts"

const CHART_COLORS = ['#abcde0', '#8fbdd4', '#73adc8', '#579dbc', '#3b8db0', '#1f7da4', '#039798']

type EstadoInventario = "todos" | "con_stock" | "sin_stock" | "stock_bajo"
type RotacionFiltro = "todos" | "sin_ventas" | "mas_30_dias" | "mas_60_dias" | "mas_90_dias"

export default function ValoracionPage() {
  const { toast } = useToast()
  const [productos, setProductos] = React.useState<ProductoValoracionExtendida[]>([])
  const [almacenes, setAlmacenes] = React.useState<Almacen[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadingTable, setLoadingTable] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [almacenFiltro, setAlmacenFiltro] = React.useState<string>("todos")
  const [estadoFiltro, setEstadoFiltro] = React.useState<EstadoInventario>("todos")
  const [rotacionFiltro, setRotacionFiltro] = React.useState<RotacionFiltro>("todos")
  const [expandedRows, setExpandedRows] = React.useState<Set<number>>(new Set())

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

  function formatCurrency(value: number): string {
    return `L ${value.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  function exportToExcel() {
    if (productosFiltrados.length === 0) {
      toast({ title: "Sin datos", description: "No hay productos para exportar", variant: "destructive" })
      return
    }

    const data = productosFiltrados.map(p => ({
      'Codigo': p.codigo_barras || '',
      'Producto': p.nombre,
      'Stock Total': p.stock_total,
      'Costo Promedio': p.costo_promedio,
      'Precio Venta': p.precio_venta,
      'Valor Costo': p.valor_costo,
      'Valor Comercial': p.valor_comercial,
      'Margen Potencial': p.margen_potencial,
      'Dias Sin Venta': p.dias_sin_venta ?? 'Sin ventas',
      'Ultima Venta': p.ultima_venta ? new Date(p.ultima_venta).toLocaleDateString('es-HN') : 'Nunca'
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

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Valoracion")
    
    const filename = `Valoracion_Inventario_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, filename)
    
    toast({ title: "Exportado", description: "El archivo Excel se descargo correctamente" })
  }

  function exportToCSV() {
    if (productosFiltrados.length === 0) {
      toast({ title: "Sin datos", description: "No hay productos para exportar", variant: "destructive" })
      return
    }

    const headers = ['Codigo,Producto,Stock Total,Costo Promedio,Precio Venta,Valor Costo,Valor Comercial,Margen Potencial,Dias Sin Venta,Ultima Venta']
    const rows = productosFiltrados.map(p => 
      `"${p.codigo_barras || ''}","${p.nombre}",${p.stock_total},${p.costo_promedio},${p.precio_venta},${p.valor_costo},${p.valor_comercial},${p.margen_potencial},${p.dias_sin_venta ?? 'Sin ventas'},"${p.ultima_venta ? new Date(p.ultima_venta).toLocaleDateString('es-HN') : 'Nunca'}"`
    )
    
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `Valoracion_Inventario_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    toast({ title: "Exportado", description: "El archivo CSV se descargo correctamente" })
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
    <div className="space-y-6 bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-stone-50/40 -m-4 md:-m-6 p-4 md:p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-stone-800">Valoracion de Inventario</h1>
          <p className="text-stone-600 mt-1">Analisis financiero del patrimonio empresarial</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Warehouse Filter - Prominent Style */}
          <Select value={almacenFiltro} onValueChange={setAlmacenFiltro}>
            <SelectTrigger className="w-56 bg-white/50 backdrop-blur-sm rounded-full border-stone-200 shadow-sm">
              <Warehouse className="h-4 w-4 mr-2 text-amber-700" />
              <SelectValue placeholder="Ver Almacen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los Almacenes</SelectItem>
              {almacenes.map(a => (
                <SelectItem key={a.id} value={a.id!.toString()}>{a.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={exportToCSV} variant="outline" className="gap-2 bg-white/50 backdrop-blur-sm rounded-full border-stone-200 shadow-sm">
            <Download className="h-4 w-4" />
            Descargar Reporte
          </Button>
        </div>
      </div>

      {/* Main KPI Cards - Beige/Pastel Theme */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Units Card */}
        <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border-[#abcde0] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#0D1821] flex items-center gap-2">
              <Boxes className="h-4 w-4" style={{ color: "#344966" }} />
              Total Unidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold text-[#0D1821]">
              {totales.totalUnidades.toLocaleString()}
            </div>
            <p className="text-sm text-[#344966]/60 mt-1">
              En {totales.productosTotal} productos
            </p>
          </CardContent>
        </Card>

        {/* Cost Valuation Card */}
        <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border-[#abcde0] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#0D1821] flex items-center gap-2">
              <DollarSign className="h-4 w-4" style={{ color: "#344966" }} />
              Costo Total (Valoracion)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold text-[#0D1821]">
              {formatCurrency(totales.valorCosto)}
            </div>
            <p className="text-sm text-[#344966]/60 mt-1">
              Capital invertido
            </p>
          </CardContent>
        </Card>

        {/* Margin Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#BFCC94]/20 to-[#abcde0]/10 backdrop-blur-sm border-[#abcde0] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#0D1821] flex items-center gap-2">
              <TrendingUp className="h-4 w-4" style={{ color: "#344966" }} />
              Margen Potencial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold text-[#0D1821]">
              {formatCurrency(totales.margenPotencial)}
            </div>
            <p className="text-sm text-[#344966]/60 mt-1">
              Diferencia precio venta - costo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards Row */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card 
          className={`cursor-pointer transition-all bg-white/70 backdrop-blur-sm border-[#344966] shadow-sm ${estadoFiltro === "todos" ? "ring-2 ring-[#344966]" : "hover:bg-[#abcde0]/10"}`}
          onClick={() => setEstadoFiltro("todos")}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: "#abcde0" }}>
              <Boxes className="h-5 w-5" style={{ color: "#344966" }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0D1821]">{totales.productosTotal}</p>
              <p className="text-xs text-[#344966]">Total Productos</p>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all bg-white/70 backdrop-blur-sm border-[#344966] shadow-sm ${estadoFiltro === "con_stock" ? "ring-2 ring-green-500" : "hover:bg-green-50/30"}`}
          onClick={() => setEstadoFiltro("con_stock")}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{totales.productosConStock}</p>
              <p className="text-xs text-[#344966]">Con Stock</p>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all bg-white/70 backdrop-blur-sm border-[#344966] shadow-sm ${estadoFiltro === "stock_bajo" ? "ring-2 ring-[#BFCC94]" : "hover:bg-[#BFCC94]/10"}`}
          onClick={() => setEstadoFiltro("stock_bajo")}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: "#BFCC94" }}>
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{totales.productosStockBajo}</p>
              <p className="text-xs text-[#344966]">Stock Bajo</p>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all bg-white/70 backdrop-blur-sm border-[#344966] shadow-sm ${estadoFiltro === "sin_stock" ? "ring-2 ring-red-500" : "hover:bg-red-50/30"}`}
          onClick={() => setEstadoFiltro("sin_stock")}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{totales.productosSinStock}</p>
              <p className="text-xs text-[#344966]">Sin Stock</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rotation Analysis */}
      <Card className="border-[#344966] bg-gradient-to-br from-[#abcde0]/10 to-[#BFCC94]/10 backdrop-blur-sm shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2" style={{ color: "#344966" }}>
              <CalendarClock className="h-4 w-4" style={{ color: "#344966" }} />
              Analisis de Rotacion
            </CardTitle>
            <Badge variant="outline" style={{ borderColor: "#344966", color: "#344966" }}>
              {formatCurrency(totales.valorSinRotacion)} en inventario lento
            </Badge>
          </div>
          <CardDescription style={{ color: "#344966" }}>Identifica productos sin movimiento de venta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <div 
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                rotacionFiltro === "sin_ventas" 
                  ? "bg-red-100 border-red-300 ring-2 ring-red-200" 
                  : "bg-white hover:bg-red-50 border-red-200"
              }`}
              onClick={() => setRotacionFiltro(rotacionFiltro === "sin_ventas" ? "todos" : "sin_ventas")}
            >
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-2xl font-bold text-red-600">{totales.productosSinVentas}</span>
              </div>
              <p className="text-xs text-red-700">Sin ventas registradas</p>
            </div>
            
            <div 
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                rotacionFiltro === "mas_30_dias" 
                  ? "bg-orange-100 border-orange-300 ring-2 ring-orange-200" 
                  : "bg-white hover:bg-orange-50 border-orange-200"
              }`}
              onClick={() => setRotacionFiltro(rotacionFiltro === "mas_30_dias" ? "todos" : "mas_30_dias")}
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-2xl font-bold text-orange-600">{totales.productosMas30Dias}</span>
              </div>
              <p className="text-xs text-orange-700">Mas de 30 dias</p>
            </div>
            
            <div 
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                rotacionFiltro === "mas_60_dias" 
                  ? "bg-amber-100 border-amber-300 ring-2 ring-amber-200" 
                  : "bg-white hover:bg-amber-50 border-amber-200"
              }`}
              onClick={() => setRotacionFiltro(rotacionFiltro === "mas_60_dias" ? "todos" : "mas_60_dias")}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-amber-600" />
                <span className="text-2xl font-bold text-amber-600">{totales.productosMas60Dias}</span>
              </div>
              <p className="text-xs text-amber-700">Mas de 60 dias</p>
            </div>
            
            <div 
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                rotacionFiltro === "mas_90_dias" 
                  ? "bg-stone-200 border-stone-400 ring-2 ring-stone-300" 
                  : "bg-white hover:bg-stone-100 border-stone-300"
              }`}
              onClick={() => setRotacionFiltro(rotacionFiltro === "mas_90_dias" ? "todos" : "mas_90_dias")}
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-stone-600" />
                <span className="text-2xl font-bold text-stone-600">{totales.productosMas90Dias}</span>
              </div>
              <p className="text-xs text-stone-700">Mas de 90 dias</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warehouse Breakdown with PieChart */}
      {totales.valorPorAlmacen.length > 0 && almacenFiltro === "todos" && (
        <Card className="bg-white/70 backdrop-blur-sm border-[#abcde0] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2" style={{ color: "#344966" }}>
              <Warehouse className="h-4 w-4" style={{ color: "#344966" }} />
              Distribucion del Valor por Almacen
            </CardTitle>
            <CardDescription style={{ color: "#344966" }}>Click en un almacen para filtrar los productos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Pie Chart */}
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={totales.valorPorAlmacen.map(a => ({ name: a.nombre, value: a.valorCosto }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                      fill="#0D1821"
                    >
                      {totales.valorPorAlmacen.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#fef7ed', borderColor: '#d6c4ab', borderRadius: '8px' }}
                    />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              
              {/* Warehouse Cards */}
              <div className="grid gap-3 content-start">
                {totales.valorPorAlmacen.map((almacen, idx) => {
                  const porcentajeCosto = totales.valorCosto > 0 ? (almacen.valorCosto / totales.valorCosto) * 100 : 0
                  return (
                    <div 
                      key={idx} 
                      className="p-4 rounded-xl border bg-white/80 hover:bg-[#abcde0]/10 transition-colors cursor-pointer"
                      style={{ borderLeftColor: CHART_COLORS[idx % CHART_COLORS.length], borderLeftWidth: '4px' }}
                      onClick={() => setAlmacenFiltro(almacenes.find(a => a.nombre === almacen.nombre)?.id?.toString() || "todos")}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium" style={{ color: "#0D1821" }}>{almacen.nombre}</span>
                        <Badge style={{ backgroundColor: "#abcde0", color: "#0D1821" }}>{almacen.unidades} uds</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span style={{ color: "#344966" }}>Costo: </span>
                          <span className="font-semibold" style={{ color: "#0D1821" }}>{formatCurrency(almacen.valorCosto)}</span>
                        </div>
                        <span style={{ color: "#0D1821" }}>{porcentajeCosto.toFixed(1)}%</span>
                      </div>
                      <Progress value={porcentajeCosto} className="h-1.5 mt-2" />
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Table */}
      <Card className="bg-white/70 backdrop-blur-sm border-stone-200 shadow-sm">
        <CardHeader className="border-b border-stone-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Detalle de Productos</CardTitle>
              <CardDescription>Valoracion individual con desglose por almacen</CardDescription>
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
              <div className="inline-flex items-center justify-center p-4 rounded-full bg-amber-100/50 mb-4">
                <Package className="h-10 w-10 text-amber-600/70" />
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
                {productosFiltrados.map((p) => (
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
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-amber-50/50">
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
                            <div className="p-4 rounded-full bg-amber-100/50 mb-4">
                              <Package className="h-8 w-8 text-amber-600/70" />
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
                    {!loadingTable && productosFiltrados.map((p) => (
                      <React.Fragment key={p.id}>
                        <TableRow 
                          className={`cursor-pointer hover:bg-orange-50/30 transition-colors ${expandedRows.has(p.id) ? 'bg-amber-50/40' : ''}`}
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
                    ))}
                    
                  </TableBody>
                </Table>
              </div>
              
              {/* Totals Footer */}
              <div className="p-4 md:p-6 border-t bg-muted/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Totales ({productosFiltrados.length} productos)</p>
                      <p className="font-medium">{totales.totalUnidades.toLocaleString()} unidades en inventario</p>
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
