"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Indicador } from "@/components/ui/indicador"
import { useToast } from "@/hooks/use-toast"
import {
  TrendingUp,
  Warehouse,
  BarChart3,
  Crown,
  ShoppingCart,
  Calendar,
  RefreshCw,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { getVentasDashboard, getVentasDiariasMesActual, type VentasDashboardData, type VentaDiaria } from "@/lib/services/ventas"
import { getPagosResumen, type PagosResumen } from "@/lib/services/ventas-analytics"


function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-HN').format(value)
}

// Alias: formatCompact ya no abrevia; siempre muestra el numero completo.
// Se mantiene el nombre para no tener que reemplazar cada llamada.
function formatCompact(value: number): string {
  return formatCurrency(value)
}

const CHART_COLORS = ['#78716c', '#a8a29e', '#d6d3d1', '#e7e5e4', '#fafaf9']
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export default function VentasDashboardPage() {
  const { toast } = useToast()
  const [data, setData] = React.useState<VentasDashboardData | null>(null)
  // `pagos` alimenta dos KPIs ("Ventas Netas" descontando comisiones y
  // "Comisiones Pagadas"). La tarjeta grande de Ingresos por Metodo de
  // Pago se elimino, pero estas metricas se mantienen.
  const [pagos, setPagos] = React.useState<PagosResumen | null>(null)
  // Serie de ventas diarias del mes actual (independiente del filtro Año/Mes).
  const [ventasDiarias, setVentasDiarias] = React.useState<VentaDiaria[]>([])
  const [loading, setLoading] = React.useState(true)
  const [anioFiltro, setAnioFiltro] = React.useState<string>("todos")
  const [mesFiltro, setMesFiltro] = React.useState<string>("todos")
  const [refreshing, setRefreshing] = React.useState(false)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  async function loadData() {
    setLoading(true)
    try {
      const anio = anioFiltro !== "todos" ? parseInt(anioFiltro) : undefined
      const mes = mesFiltro !== "todos" ? parseInt(mesFiltro) : undefined

      // Ambos servicios consultan la misma ventana temporal y razon_social.
      // La serie diaria es siempre del mes actual (no depende del filtro).
      const [dashRes, pagosRes, diariasRes] = await Promise.all([
        getVentasDashboard(anio, mes),
        getPagosResumen(anio, mes),
        getVentasDiariasMesActual(),
      ])

      if (dashRes.error) throw new Error(dashRes.error)
      setData(dashRes.data)
      setPagos(pagosRes.data)
      setVentasDiarias(diariasRes.data)
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  React.useEffect(() => {
    loadData()
  }, [anioFiltro, mesFiltro])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  const crecimientoPositivo = (data?.crecimientoMensual || 0) >= 0
  const ventasNetas = pagos && pagos.totalBruto > 0
    ? (data?.ventasTotales || 0) - pagos.totalComisiones
    : (data?.ventasTotales || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-800">Dashboard de Ventas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analisis comercial y metricas de rendimiento
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={anioFiltro} onValueChange={(v) => { setAnioFiltro(v); if (v === "todos") setMesFiltro("todos") }}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Anio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={mesFiltro}
            onValueChange={setMesFiltro}
            disabled={anioFiltro === "todos"}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todo el anio</SelectItem>
              {MESES.map((m, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Indicadores (contenedor único) */}
      <Card className="border-stone-200 shadow-sm">
        <CardContent className="p-4 md:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-5">
            <Indicador
              label="Ventas brutas"
              value={formatCompact(data?.ventasTotales || 0)}
              sub={`${crecimientoPositivo ? "▲" : "▼"} ${Math.abs(data?.crecimientoMensual || 0).toFixed(1)}% vs mes anterior`}
            />
            <Indicador label="Ventas netas" value={formatCompact(ventasNetas)} valueClass="text-emerald-700" sub="Bruta − comisiones" />
            <Indicador label="Ganancia bruta" value={formatCompact(data?.gananciaBruta || 0)} valueClass="text-emerald-700" sub={`${(data?.margenPromedio || 0).toFixed(1)}% margen`} />
            <Indicador label="Facturas" value={formatNumber(data?.cantidadFacturas || 0)} sub={`Ticket ${formatCurrency(data?.ticketPromedio || 0)}`} />
            <Indicador label="Unidades" value={formatNumber(data?.unidadesVendidas || 0)} sub={`${data?.productosVendidos || 0} productos`} />
            <Indicador label="Clientes activos" value={formatNumber(data?.clientesActivos || 0)} />
            <Indicador
              label="Comisiones"
              value={formatCompact(pagos?.totalComisiones || 0)}
              valueClass="text-rose-700"
              sub={pagos && pagos.totalBruto > 0 ? `${((pagos.totalComisiones / pagos.totalBruto) * 100).toFixed(2)}% sobre bruto` : undefined}
            />
            <Indicador label="Ventas este mes" value={formatCompact(data?.ventasMesActual || 0)} />
            <Indicador
              label="Facturas / cliente"
              value={data?.cantidadFacturas && data?.clientesActivos ? (data.cantidadFacturas / data.clientesActivos).toFixed(1) : "0"}
              sub="Frecuencia de compra"
            />
            <Indicador
              label="Uds / factura"
              value={data?.unidadesVendidas && data?.cantidadFacturas ? (data.unidadesVendidas / data.cantidadFacturas).toFixed(1) : "0"}
              sub="Ítems promedio"
            />
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ventas por Mes - Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendencia de Ventas
            </CardTitle>
            <CardDescription>Ventas y ganancia mensual</CardDescription>
          </CardHeader>
          <CardContent>
            {(data?.ventasPorMes || []).length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data?.ventasPorMes}>
                  <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#78716c" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#78716c" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGanancia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="mes" tick={{ fill: '#78716c', fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(v) => `${(v/1000).toFixed(0)}K`}
                    tick={{ fill: '#78716c', fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#fafaf9', borderColor: '#e7e5e4' }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="ventas"
                    name="Ventas"
                    stroke="#78716c"
                    fillOpacity={1}
                    fill="url(#colorVentas)"
                  />
                  <Area
                    type="monotone"
                    dataKey="ganancia"
                    name="Ganancia"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorGanancia)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                No hay datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ventas por Anio - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Comparativa Anual
            </CardTitle>
            <CardDescription>Ventas totales por anio</CardDescription>
          </CardHeader>
          <CardContent>
            {(data?.ventasPorAnio || []).length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data?.ventasPorAnio}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="anio" tick={{ fill: '#78716c', fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(v) => `${(v/1000).toFixed(0)}K`}
                    tick={{ fill: '#78716c', fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#fafaf9', borderColor: '#e7e5e4' }}
                  />
                  <Legend />
                  <Bar dataKey="ventas" name="Ventas" fill="#78716c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ganancia" name="Ganancia" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                No hay datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ventas diarias del mes actual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Ventas diarias — {MESES[new Date().getMonth()]} {new Date().getFullYear()}
          </CardTitle>
          <CardDescription>Total vendido por día en el mes actual</CardDescription>
        </CardHeader>
        <CardContent>
          {ventasDiarias.some((d) => d.ventas > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ventasDiarias}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="dia" tick={{ fill: '#78716c', fontSize: 12 }} />
                <YAxis
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  tick={{ fill: '#78716c', fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Día ${label}`}
                  contentStyle={{ backgroundColor: '#fafaf9', borderColor: '#e7e5e4' }}
                />
                <Bar dataKey="ventas" name="Ventas" fill="#78716c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              No hay ventas registradas este mes
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rankings Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Clientes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              Top 10 Clientes
            </CardTitle>
            <CardDescription>Clientes con mayores ventas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.topClientes || []).length > 0 ? (
              data?.topClientes.slice(0, 5).map((cliente, index) => {
                const maxVentas = data.topClientes[0].ventas
                const percentage = (cliente.ventas / maxVentas) * 100

                return (
                  <div key={cliente.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-amber-100 text-amber-700' :
                          index === 1 ? 'bg-stone-200 text-stone-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-stone-100 text-stone-600'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="font-medium text-sm truncate max-w-[120px]">{cliente.nombre}</span>
                      </div>
                      <span className="text-sm font-semibold">{formatCompact(cliente.ventas)}</span>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{cliente.facturas} facturas</span>
                      <span className="text-emerald-600">+{formatCompact(cliente.ganancia)}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Sin datos</p>
            )}
          </CardContent>
        </Card>

        {/* Top Productos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-500" />
              Top 10 Productos
            </CardTitle>
            <CardDescription>Productos mas vendidos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.topProductos || []).length > 0 ? (
              data?.topProductos.slice(0, 5).map((producto, index) => {
                const maxVentas = data.topProductos[0].ventas
                const percentage = (producto.ventas / maxVentas) * 100

                return (
                  <div key={producto.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-blue-100 text-blue-700' :
                          index === 1 ? 'bg-stone-200 text-stone-700' :
                          index === 2 ? 'bg-sky-100 text-sky-700' :
                          'bg-stone-100 text-stone-600'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="font-medium text-sm truncate max-w-[120px]">{producto.nombre}</span>
                      </div>
                      <span className="text-sm font-semibold">{formatCompact(producto.ventas)}</span>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatNumber(producto.cantidad)} uds</span>
                      <span className="text-emerald-600">+{formatCompact(producto.ganancia)}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Sin datos</p>
            )}
          </CardContent>
        </Card>

        {/* Top Almacenes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-purple-500" />
              Ventas por Almacen
            </CardTitle>
            <CardDescription>Distribucion de ventas</CardDescription>
          </CardHeader>
          <CardContent>
            {(data?.topAlmacenes || []).length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={data?.topAlmacenes}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="ventas"
                      nameKey="nombre"
                    >
                      {data?.topAlmacenes.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-2">
                  {data?.topAlmacenes.map((almacen, index) => (
                    <div key={almacen.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span className="text-sm">{almacen.nombre}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCompact(almacen.ventas)}</p>
                        <p className="text-xs text-muted-foreground">{almacen.facturas} facturas</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Sin datos</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
