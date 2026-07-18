"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Warehouse,
  CreditCard,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  Truck,
  Users,
  ArrowRight,
  Package,
  RefreshCw
} from "lucide-react"
import {
  getDashboardMetrics,
  getVentasVsCobros,
  getTopProductos,
  getProductosStockBajo,
  getComprasPendientes,
  getTopClientesDeudores,
  type DashboardMetrics,
  type VentasVsCobros,
  type TopProducto,
  type ProductoStockBajo,
  type CompraPendiente,
  type ClienteDeudor
} from "@/lib/services/dashboard"
import { useTenant } from "@/lib/hooks/use-tenant"
import { useToast } from "@/hooks/use-toast"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

// Warm pastel colors matching the new theme
const COLORS = ['#5D7B6F', '#7C9A92', '#C07A5C', '#D4A574', '#A1887F']

function formatCurrency(value: number): string {
  return `L ${value.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('es-HN', { weekday: 'short', day: 'numeric' })
}

export default function DashboardPage() {
  const { razonSocialId, ready } = useTenant()
  const { toast } = useToast()
  const [metrics, setMetrics] = React.useState<DashboardMetrics | null>(null)
  const [ventasVsCobros, setVentasVsCobros] = React.useState<VentasVsCobros[]>([])
  const [topProductos, setTopProductos] = React.useState<TopProducto[]>([])
  const [stockBajo, setStockBajo] = React.useState<ProductoStockBajo[]>([])
  const [comprasPendientes, setComprasPendientes] = React.useState<CompraPendiente[]>([])
  const [clientesDeudores, setClientesDeudores] = React.useState<ClienteDeudor[]>([])
  const [loading, setLoading] = React.useState(true)

  const loadData = React.useCallback(async () => {
    // Gate: no lanzar consultas hasta que haya sesion y razon_social_id
    if (!ready) {
      console.log('[v0][Dashboard] esperando sesion...')
      return
    }
    if (razonSocialId == null) {
      console.log('[v0][Dashboard] usuario sin razon_social_id; mostrando ceros')
      setMetrics({
        valorInventario: 0,
        cuentasPorCobrar: 0,
        utilidadBruta: 0,
        ventasMes: 0,
        ventasMesCount: 0,
      })
      setVentasVsCobros([])
      setTopProductos([])
      setStockBajo([])
      setComprasPendientes([])
      setClientesDeudores([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const [metricsRes, ventasRes, topRes, stockRes, comprasRes, deudoresRes] = await Promise.all([
        getDashboardMetrics(razonSocialId),
        getVentasVsCobros(razonSocialId, 7),
        getTopProductos(razonSocialId, 5),
        getProductosStockBajo(razonSocialId, 5),
        getComprasPendientes(razonSocialId),
        getTopClientesDeudores(razonSocialId, 5),
      ])

      setMetrics(metricsRes.data)
      setVentasVsCobros(ventasRes.data)
      setTopProductos(topRes.data)
      setStockBajo(stockRes.data)
      setComprasPendientes(comprasRes.data)
      setClientesDeudores(deudoresRes.data)

      // Si algun servicio devolvio error, avisa al usuario pero no rompe el UI
      const firstError =
        metricsRes.error || ventasRes.error || topRes.error ||
        stockRes.error || comprasRes.error || deudoresRes.error
      if (firstError) {
        console.log('[v0][Dashboard] advertencia de carga parcial:', firstError)
        toast({
          title: "Dashboard con datos parciales",
          description: "No se pudieron cargar todos los datos. Revisa la consola.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.log('[v0][Dashboard] excepcion inesperada:', error)
      toast({
        title: "No se pudieron cargar los datos",
        description: error?.message || "Error de conexion",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [ready, razonSocialId, toast])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const chartData = ventasVsCobros.map(item => ({
    name: formatShortDate(item.fecha),
    Ventas: Math.round(item.ventas * 100) / 100,
    Cobros: Math.round(item.cobros * 100) / 100
  }))

  const pieData = topProductos.map((p, index) => ({
    name: p.producto_nombre.length > 15 ? p.producto_nombre.substring(0, 15) + '...' : p.producto_nombre,
    value: p.cantidad_vendida,
    fill: COLORS[index % COLORS.length]
  }))

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-stone-800">Dashboard Ejecutivo</h1>
          <p className="text-xs md:text-sm text-stone-500 leading-relaxed">
            Vista general de la salud financiera y operativa del negocio
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadData} 
          disabled={loading}
          className="rounded-xl border-stone-200 hover:bg-stone-100 hover:border-stone-300 transition-all duration-300 w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 md:gap-5 grid-cols-2 lg:grid-cols-4">
        {/* Valor Inventario */}
        <Card className="card-elevated rounded-xl md:rounded-2xl border-stone-200/60 border-l-4 border-l-[#5D7B6F] bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-6 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-stone-600">
              Valor Inventario
            </CardTitle>
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-[#5D7B6F]/10 flex items-center justify-center">
              <Warehouse className="h-4 w-4 md:h-5 md:w-5 text-[#5D7B6F]" />
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            {loading ? (
              <Skeleton className="h-6 md:h-8 w-24 md:w-32" />
            ) : (
              <div className="text-lg md:text-2xl font-bold text-stone-800">
                {formatCurrency(metrics?.valorInventario || 0)}
              </div>
            )}
            <p className="text-[10px] md:text-xs text-stone-500 mt-1 hidden sm:block">
              Patrimonio en productos
            </p>
          </CardContent>
        </Card>

        {/* Cuentas por Cobrar */}
        <Card className="card-elevated rounded-xl md:rounded-2xl border-stone-200/60 border-l-4 border-l-[#C07A5C] bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-6 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-stone-600">
              Por Cobrar
            </CardTitle>
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-[#C07A5C]/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-[#C07A5C]" />
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            {loading ? (
              <Skeleton className="h-6 md:h-8 w-24 md:w-32" />
            ) : (
              <div className="text-lg md:text-2xl font-bold text-stone-800">
                {formatCurrency(metrics?.cuentasPorCobrar || 0)}
              </div>
            )}
            <p className="text-[10px] md:text-xs text-stone-500 mt-1 hidden sm:block">
              Cartera pendiente
            </p>
          </CardContent>
        </Card>

        {/* Utilidad Bruta */}
        <Card className="card-elevated rounded-xl md:rounded-2xl border-stone-200/60 border-l-4 border-l-[#7C9A92] bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-6 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-stone-600">
              Utilidad Bruta
            </CardTitle>
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-[#7C9A92]/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-[#7C9A92]" />
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            {loading ? (
              <Skeleton className="h-6 md:h-8 w-24 md:w-32" />
            ) : (
              <div className="text-lg md:text-2xl font-bold text-stone-800">
                {formatCurrency(metrics?.utilidadBruta || 0)}
              </div>
            )}
            <p className="text-[10px] md:text-xs text-stone-500 mt-1 hidden sm:block">
              Ganancia acumulada
            </p>
          </CardContent>
        </Card>

        {/* Ventas del Mes */}
        <Card className="card-elevated rounded-xl md:rounded-2xl border-stone-200/60 border-l-4 border-l-[#D4A574] bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-6 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-stone-600">
              Ventas Mes
            </CardTitle>
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-[#D4A574]/10 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-[#D4A574]" />
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            {loading ? (
              <Skeleton className="h-6 md:h-8 w-24 md:w-32" />
            ) : (
              <div className="text-lg md:text-2xl font-bold text-stone-800">
                {formatCurrency(metrics?.ventasMes || 0)}
              </div>
            )}
            <p className="text-[10px] md:text-xs text-stone-500 mt-1 hidden sm:block">
              {metrics?.ventasMesCount || 0} facturas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        {/* Ventas vs Cobros Chart */}
        <Card className="card-elevated rounded-xl md:rounded-2xl border-stone-200/60 bg-white">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg font-semibold text-stone-800">Ventas vs Cobros</CardTitle>
            <CardDescription className="text-xs md:text-sm text-stone-500">Ultimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {loading ? (
              <div className="h-[200px] md:h-[300px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `L${v}`} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Ventas" fill="#5D7B6F" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Cobros" fill="#7C9A92" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Productos Chart */}
        <Card className="card-elevated rounded-xl md:rounded-2xl border-stone-200/60 bg-white">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg font-semibold text-stone-800">Top 5 Productos</CardTitle>
            <CardDescription className="text-xs md:text-sm text-stone-500">Por cantidad vendida</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {loading ? (
              <div className="h-[200px] md:h-[300px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : pieData.length > 0 ? (
              <div className="flex flex-col md:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={180} className="md:!w-[60%] md:!h-[250px]">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} unidades`, '']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full md:flex-1 space-y-1.5 md:space-y-2">
                  {topProductos.map((p, index) => (
                    <div key={p.producto_id} className="flex items-center gap-2 text-xs md:text-sm">
                      <div 
                        className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="truncate flex-1">{p.producto_nombre}</span>
                      <span className="font-medium">{p.cantidad_vendida}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] md:h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                No hay datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Lists Row */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Stock Bajo Alert */}
        <Card className="card-elevated rounded-xl md:rounded-2xl border-stone-200/60 bg-white">
          <CardHeader className="p-4 md:p-6 pb-2 md:pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-700" />
                </div>
                <CardTitle className="text-base md:text-lg font-semibold text-stone-800">Stock Bajo</CardTitle>
              </div>
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 text-xs">{stockBajo.length}</Badge>
            </div>
            <CardDescription className="text-xs md:text-sm text-stone-500">Menos de 5 unidades</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : stockBajo.length > 0 ? (
              <div className="space-y-2">
                {stockBajo.slice(0, 5).map(p => (
                  <Link 
                    key={p.id} 
                    href="/catalogos/productos"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-100/60 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-stone-400" />
                      <div>
                        <p className="text-sm font-medium text-stone-700 truncate max-w-[150px]">{p.nombre}</p>
                        <p className="text-xs text-stone-400">{p.codigo_barras}</p>
                      </div>
                    </div>
                    <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">{p.stock_total} uds</Badge>
                  </Link>
                ))}
                {stockBajo.length > 5 && (
                  <Link href="/catalogos/productos" className="block">
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                Sin alertas de stock
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compras Pendientes */}
        <Card className="card-elevated rounded-2xl border-stone-200/60 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-sky-100 flex items-center justify-center">
                  <Truck className="h-4 w-4 text-sky-700" />
                </div>
                <CardTitle className="text-lg font-semibold text-stone-800">Compras Pendientes</CardTitle>
              </div>
              <Badge className="bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-100">{comprasPendientes.length}</Badge>
            </div>
            <CardDescription className="text-stone-500">Ordenes por recibir</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : comprasPendientes.length > 0 ? (
              <div className="space-y-2">
                {comprasPendientes.slice(0, 5).map(c => (
                  <Link 
                    key={c.id} 
                    href="/compras/recepciones"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-100/60 transition-all duration-300"
                  >
                    <div>
                      <p className="text-sm font-medium text-stone-700">{c.proveedor_nombre}</p>
                      <p className="text-xs text-stone-400">
                        Llegada: {c.fecha_tentativa}
                      </p>
                    </div>
                    <Badge className="bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-100">
                      {formatCurrency(c.total_compra_local)}
                    </Badge>
                  </Link>
                ))}
                {comprasPendientes.length > 5 && (
                  <Link href="/compras/recepciones" className="block">
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      Ver todas <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                Sin ordenes pendientes
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Deudores */}
        <Card className="card-elevated rounded-2xl border-stone-200/60 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-rose-700" />
                </div>
                <CardTitle className="text-lg font-semibold text-stone-800">Cartera Critica</CardTitle>
              </div>
              <Badge className="bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100">{clientesDeudores.length}</Badge>
            </div>
            <CardDescription className="text-stone-500">Clientes con mayor deuda</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : clientesDeudores.length > 0 ? (
              <div className="space-y-2">
                {clientesDeudores.map(c => (
                  <Link 
                    key={c.cliente_id} 
                    href="/ventas/cuentas-por-cobrar"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-100/60 transition-all duration-300"
                  >
                    <div>
                      <p className="text-sm font-medium text-stone-700 truncate max-w-[120px]">{c.cliente_nombre}</p>
                      <p className="text-xs text-stone-400">
                        {c.facturas_pendientes} factura{c.facturas_pendientes !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge className="bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100">
                      {formatCurrency(c.total_deuda)}
                    </Badge>
                  </Link>
                ))}
                <Link href="/ventas/cuentas-por-cobrar" className="block">
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    Ver cartera completa <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                Sin deudas pendientes
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
