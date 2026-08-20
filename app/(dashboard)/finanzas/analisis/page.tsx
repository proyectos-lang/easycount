"use client"

import * as React from "react"
import {
  LineChart as LineChartIcon, TrendingDown, AlertTriangle, Search,
  Info, Download, PackageSearch,
} from "lucide-react"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  ScatterChart, Scatter, ZAxis, ReferenceLine, ComposedChart, Line, LineChart, Legend,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { formatCurrency, formatNumber } from "@/lib/utils/format"
import { exportToXlsx } from "@/lib/utils/export"
import { getProductos, type Producto } from "@/lib/services/catalogos"
import {
  getResumenRentabilidad, getRentabilidadProductos, getAnalisisGastos, getAuditoriaCosteo,
  getHistorialCosteoProducto, ANOMALIA_PCT,
  type ResumenRentabilidad, type RentabilidadProductos, type ProductoRentabilidad,
  type AnalisisGastos, type ProductoAuditoria, type HistorialCosteo, type Cuadrante,
} from "@/lib/services/analisis-financiero"

// ==================== Utilidades de fecha ====================
function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
function inicioMes(d = new Date()): string { return iso(new Date(d.getFullYear(), d.getMonth(), 1)) }
function hoyISO(): string { return iso(new Date()) }

const CUADRANTE_COLOR: Record<Cuadrante, string> = {
  "Estrella": "#059669",
  "Vaca lechera": "#0284c7",
  "Nicho": "#d97706",
  "Bajo desempeño": "#dc2626",
}
const PIE_COLORS = ["#5D7B6F", "#C07A5C", "#D4A574", "#7C9A92", "#8fa9c7", "#b08968", "#a3a380", "#c98986"]

function pctColor(v: number): string { return v >= 0 ? "text-emerald-700" : "text-red-600" }

export default function AnalisisFinancieroPage() {
  const [desde, setDesde] = React.useState(inicioMes())
  const [hasta, setHasta] = React.useState(hoyISO())
  const [tab, setTab] = React.useState("resumen")

  const [resumen, setResumen] = React.useState<ResumenRentabilidad | null>(null)
  const [rentab, setRentab] = React.useState<RentabilidadProductos | null>(null)
  const [gastos, setGastos] = React.useState<AnalisisGastos | null>(null)
  const [auditoria, setAuditoria] = React.useState<ProductoAuditoria[] | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Carga perezosa por pestaña (y al cambiar el período).
  React.useEffect(() => {
    let cancelado = false
    async function load() {
      setLoading(true); setError(null)
      if (tab === "resumen") {
        const r = await getResumenRentabilidad(desde, hasta)
        if (!cancelado) { setResumen(r.data); if (r.error) setError(r.error) }
      } else if (tab === "productos") {
        const r = await getRentabilidadProductos(desde, hasta)
        if (!cancelado) { setRentab(r.data); if (r.error) setError(r.error) }
      } else if (tab === "gastos") {
        const r = await getAnalisisGastos(desde, hasta)
        if (!cancelado) { setGastos(r.data); if (r.error) setError(r.error) }
      } else if (tab === "costeo") {
        const r = await getAuditoriaCosteo(desde, hasta)
        if (!cancelado) { setAuditoria(r.data); if (r.error) setError(r.error) }
      }
      if (!cancelado) setLoading(false)
    }
    load()
    return () => { cancelado = true }
  }, [tab, desde, hasta])

  function preset(tipo: "mes" | "mesPasado" | "anio") {
    const now = new Date()
    if (tipo === "mes") { setDesde(inicioMes(now)); setHasta(hoyISO()) }
    else if (tipo === "mesPasado") {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const last = new Date(now.getFullYear(), now.getMonth(), 0)
      setDesde(iso(first)); setHasta(iso(last))
    } else { setDesde(iso(new Date(now.getFullYear(), 0, 1))); setHasta(hoyISO()) }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-800 flex items-center gap-3">
          <LineChartIcon className="h-7 w-7 text-stone-600" /> Análisis Financiero
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Rentabilidad, gastos y costeo del negocio en un período. Identifica cómo se genera el valor y dónde hay fugas.
        </p>
      </div>

      {/* Selector de período */}
      <Card>
        <CardContent className="py-4 flex flex-wrap items-end gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="desde" className="text-xs">Desde</Label>
            <Input id="desde" type="date" value={desde} max={hasta} onChange={(e) => setDesde(e.target.value)} className="w-40" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="hasta" className="text-xs">Hasta</Label>
            <Input id="hasta" type="date" value={hasta} min={desde} max={hoyISO()} onChange={(e) => setHasta(e.target.value)} className="w-40" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => preset("mes")}>Este mes</Button>
            <Button variant="outline" size="sm" onClick={() => preset("mesPasado")}>Mes pasado</Button>
            <Button variant="outline" size="sm" onClick={() => preset("anio")}>Este año</Button>
          </div>
          {loading && <Spinner className="h-5 w-5 ml-auto" />}
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="py-3 flex items-center gap-2 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4" /> {error}
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="resumen">Resumen / P&L</TabsTrigger>
          <TabsTrigger value="productos">Rentabilidad por producto</TabsTrigger>
          <TabsTrigger value="gastos">Análisis de gastos</TabsTrigger>
          <TabsTrigger value="costeo">Auditoría de costeo</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-4 mt-4">
          <ResumenTab resumen={resumen} loading={loading} />
        </TabsContent>
        <TabsContent value="productos" className="space-y-4 mt-4">
          <ProductosTab rentab={rentab} loading={loading} desde={desde} hasta={hasta} />
        </TabsContent>
        <TabsContent value="gastos" className="space-y-4 mt-4">
          <GastosTab gastos={gastos} loading={loading} desde={desde} hasta={hasta} />
        </TabsContent>
        <TabsContent value="costeo" className="space-y-4 mt-4">
          <CosteoTab auditoria={auditoria} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== Tab 1: Resumen / P&L ====================
function Kpi({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <p className="text-xs text-stone-500">{label}</p>
      <p className={`text-xl font-bold ${color || "text-stone-800"}`}>{value}</p>
      {sub && <p className="text-xs text-stone-400">{sub}</p>}
    </div>
  )
}

function ResumenTab({ resumen, loading }: { resumen: ResumenRentabilidad | null; loading: boolean }) {
  if (loading && !resumen) return <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
  if (!resumen) return <p className="text-sm text-stone-500 py-8 text-center">Sin datos para el período.</p>

  const r = resumen
  const waterfall = [
    { name: "Ingresos", base: 0, val: r.ingresos, kind: "total" as const },
    { name: "CMV", base: Math.max(0, r.ingresos - r.cmv), val: r.cmv, kind: "neg" as const },
    { name: "Utilidad bruta", base: 0, val: r.utilidadBruta, kind: "sub" as const },
    { name: "Gastos oper.", base: Math.max(0, r.utilidadBruta - r.gastosOperativos), val: r.gastosOperativos, kind: "neg" as const },
    { name: "Comisiones", base: Math.max(0, r.utilidadBruta - r.gastosOperativos - r.comisiones), val: r.comisiones, kind: "neg" as const },
    { name: "Utilidad neta", base: 0, val: r.utilidadNeta, kind: "total" as const },
  ]
  const colorKind = (k: string) => (k === "neg" ? "#dc2626" : k === "sub" ? "#0284c7" : "#059669")
  const mayorGasto = [...r.gastosPorCategoria].sort((a, b) => b.monto - a.monto)[0]

  return (
    <>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Kpi label="Ingresos netos" value={formatCurrency(r.ingresos)} sub={`${r.cantidadFacturas} facturas`} color="text-emerald-700" />
        <Kpi label="Utilidad bruta" value={formatCurrency(r.utilidadBruta)} sub={`Margen ${r.margenBruto.toFixed(1)}%`} />
        <Kpi label="Gastos + comisiones" value={formatCurrency(r.gastosOperativos + r.comisiones)} sub={mayorGasto ? `Mayor: ${mayorGasto.categoria}` : undefined} color="text-red-600" />
        <Kpi label="Utilidad neta" value={formatCurrency(r.utilidadNeta)} sub={`Margen ${r.margenNeto.toFixed(1)}%`} color={pctColor(r.utilidadNeta)} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cascada: de ingresos a utilidad neta</CardTitle>
          <CardDescription className="text-xs">Cómo se transforma cada Lempira vendido después de costo, gastos y comisiones.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={waterfall} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => formatNumber(Number(v))} tick={{ fontSize: 11 }} width={70} />
              <Tooltip
                formatter={(v: number, _n, p: { payload?: { kind?: string } }) => [formatCurrency(Number(v)), p?.payload?.kind === "neg" ? "(−)" : ""]}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="base" stackId="a" fill="transparent" />
              <Bar dataKey="val" stackId="a" radius={[4, 4, 0, 0]}>
                {waterfall.map((w, i) => <Cell key={i} fill={colorKind(w.kind)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Detalle del P&L</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableBody>
                <PLRow label="Ingresos netos (ventas − devoluciones)" value={r.ingresos} bold />
                <PLRow label="(−) Costo de mercancía vendida (CMV)" value={-r.cmv} />
                <PLRow label="= Utilidad bruta" value={r.utilidadBruta} bold sub={`Margen bruto ${r.margenBruto.toFixed(1)}%`} />
                {r.gastosPorCategoria.filter((c) => c.monto > 0).map((c) => (
                  <PLRow key={c.categoria} label={`(−) ${c.categoria}`} value={-c.monto} indent />
                ))}
                <PLRow label="(−) Total gastos operativos" value={-r.gastosOperativos} />
                <PLRow label="(−) Comisiones bancarias" value={-r.comisiones} />
                <PLRow label="= Utilidad neta" value={r.utilidadNeta} bold sub={`Margen neto ${r.margenNeto.toFixed(1)}%`} />
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function PLRow({ label, value, bold, indent, sub }: { label: string; value: number; bold?: boolean; indent?: boolean; sub?: string }) {
  return (
    <TableRow>
      <TableCell className={`${bold ? "font-semibold" : ""} ${indent ? "pl-8 text-stone-500 text-sm" : ""}`}>
        {label}{sub && <span className="ml-2 text-xs text-stone-400">· {sub}</span>}
      </TableCell>
      <TableCell className={`text-right font-mono ${bold ? "font-semibold" : ""} ${value < 0 ? "text-red-600" : "text-stone-800"}`}>
        {formatCurrency(value)}
      </TableCell>
    </TableRow>
  )
}

// ==================== Tab 2: Rentabilidad por producto ====================
type SortKeyProd = "utilidad" | "margenPct" | "unidades" | "ingreso"

function ProductosTab({ rentab, loading, desde, hasta }: { rentab: RentabilidadProductos | null; loading: boolean; desde: string; hasta: string }) {
  const [sortKey, setSortKey] = React.useState<SortKeyProd>("utilidad")

  if (loading && !rentab) return <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
  if (!rentab || rentab.productos.length === 0) return <p className="text-sm text-stone-500 py-8 text-center">Sin ventas en el período.</p>

  const productos = [...rentab.productos].sort((a, b) => b[sortKey] - a[sortKey])

  // Resumen por cuadrante.
  const cuadrantes: Cuadrante[] = ["Estrella", "Vaca lechera", "Nicho", "Bajo desempeño"]
  const resumenCuad = cuadrantes.map((c) => {
    const items = rentab.productos.filter((p) => p.cuadrante === c)
    return { cuadrante: c, count: items.length, utilidad: items.reduce((a, p) => a + p.utilidad, 0) }
  })

  // Pareto: acumulado de utilidad (solo positivos).
  const pos = [...rentab.productos].filter((p) => p.utilidad > 0).sort((a, b) => b.utilidad - a.utilidad)
  const totalPos = pos.reduce((a, p) => a + p.utilidad, 0)
  const top20 = pos.slice(0, 20)
  const pareto = top20.map((p, i) => {
    const acumulado = top20.slice(0, i + 1).reduce((a, x) => a + x.utilidad, 0)
    return { nombre: p.nombre.slice(0, 14), utilidad: p.utilidad, acumPct: totalPos > 0 ? +((acumulado / totalPos) * 100).toFixed(1) : 0 }
  })

  function exportar() {
    exportToXlsx(
      productos.map((p) => ({
        Producto: p.nombre, SKU: p.sku, Unidades: p.unidades, Ingreso: +p.ingreso.toFixed(2),
        COGS: +p.cogs.toFixed(2), Utilidad: +p.utilidad.toFixed(2), "Margen %": +p.margenPct.toFixed(1),
        "% util. total": +p.pctUtilidadTotal.toFixed(1), Cuadrante: p.cuadrante,
      })),
      { sheetName: "Rentabilidad", filename: `Rentabilidad_${desde}_a_${hasta}`, colWidths: [36, 16, 10, 14, 14, 14, 10, 12, 16] }
    )
  }

  return (
    <>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {resumenCuad.map((c) => (
          <div key={c.cuadrante} className="rounded-lg border bg-white p-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CUADRANTE_COLOR[c.cuadrante] }} />
              <p className="text-xs font-medium text-stone-700">{c.cuadrante}</p>
            </div>
            <p className="text-lg font-bold text-stone-800">{formatCurrency(c.utilidad)}</p>
            <p className="text-xs text-stone-400">{c.count} producto(s)</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Margen × volumen</CardTitle>
          <CardDescription className="text-xs">
            Eje X = unidades vendidas, eje Y = % de margen, tamaño = utilidad. Las líneas marcan la mediana:
            arriba-derecha (Estrella) es lo ideal; abajo-derecha (Vaca) vende mucho con poco margen; arriba-izquierda
            (Nicho) vende poco con mucho margen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={340}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="unidades" name="Unidades" tick={{ fontSize: 11 }} label={{ value: "Unidades", position: "insideBottom", offset: -8, fontSize: 11 }} />
              <YAxis type="number" dataKey="margenPct" name="Margen %" unit="%" tick={{ fontSize: 11 }} width={50} />
              <ZAxis type="number" dataKey="utilidad" range={[40, 500]} name="Utilidad" />
              <ReferenceLine x={rentab.medianaUnidades} stroke="#94a3b8" strokeDasharray="4 4" />
              <ReferenceLine y={rentab.medianaMargen} stroke="#94a3b8" strokeDasharray="4 4" />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null
                  const p = payload[0].payload as ProductoRentabilidad
                  return (
                    <div className="rounded border bg-white p-2 text-xs shadow">
                      <p className="font-semibold">{p.nombre}</p>
                      <p>{formatNumber(p.unidades)} uds · margen {p.margenPct.toFixed(1)}%</p>
                      <p>Utilidad {formatCurrency(p.utilidad)}</p>
                      <p className="text-stone-500">{p.cuadrante}</p>
                    </div>
                  )
                }}
              />
              {cuadrantes.map((c) => (
                <Scatter key={c} name={c} data={rentab.productos.filter((p) => p.cuadrante === c)} fill={CUADRANTE_COLOR[c]} fillOpacity={0.7} />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Concentración de utilidad (Pareto)</CardTitle>
          <CardDescription className="text-xs">Cuántos productos concentran la mayor parte de la utilidad (línea = % acumulado).</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={pareto} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="nombre" angle={-35} textAnchor="end" interval={0} height={60} tick={{ fontSize: 10 }} />
              <YAxis yAxisId="l" tickFormatter={(v) => formatNumber(Number(v))} tick={{ fontSize: 11 }} width={64} />
              <YAxis yAxisId="r" orientation="right" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} width={40} />
              <Tooltip formatter={(v: number, n) => (n === "acumPct" ? [`${v}%`, "Acumulado"] : [formatCurrency(Number(v)), "Utilidad"])} contentStyle={{ fontSize: 12 }} />
              <Bar yAxisId="l" dataKey="utilidad" fill="#5D7B6F" radius={[3, 3, 0, 0]} />
              <Line yAxisId="r" dataKey="acumPct" stroke="#C07A5C" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-base">Detalle por producto</CardTitle>
          <Button variant="outline" size="sm" onClick={exportar} className="gap-1"><Download className="h-4 w-4" /> Exportar</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <SortTH label="Unidades" k="unidades" sortKey={sortKey} onSort={setSortKey} />
                  <SortTH label="Ingreso" k="ingreso" sortKey={sortKey} onSort={setSortKey} />
                  <SortTH label="Utilidad" k="utilidad" sortKey={sortKey} onSort={setSortKey} />
                  <SortTH label="Margen" k="margenPct" sortKey={sortKey} onSort={setSortKey} />
                  <TableHead className="text-right">% util.</TableHead>
                  <TableHead>Cuadrante</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.map((p) => (
                  <TableRow key={p.producto_id}>
                    <TableCell className="max-w-[220px] truncate text-sm">{p.nombre}</TableCell>
                    <TableCell className="text-right">{formatNumber(p.unidades)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(p.ingreso)}</TableCell>
                    <TableCell className={`text-right font-mono font-medium ${pctColor(p.utilidad)}`}>{formatCurrency(p.utilidad)}</TableCell>
                    <TableCell className={`text-right ${pctColor(p.margenPct)}`}>{p.margenPct.toFixed(1)}%</TableCell>
                    <TableCell className="text-right text-stone-500">{p.pctUtilidadTotal.toFixed(1)}%</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CUADRANTE_COLOR[p.cuadrante] }} />
                        {p.cuadrante}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell />
                  <TableCell className="text-right font-mono font-semibold">{formatCurrency(rentab.totalIngreso)}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{formatCurrency(rentab.totalUtilidad)}</TableCell>
                  <TableCell className="text-right">{rentab.totalIngreso > 0 ? ((rentab.totalUtilidad / rentab.totalIngreso) * 100).toFixed(1) : "0.0"}%</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function SortTH({ label, k, sortKey, onSort }: { label: string; k: SortKeyProd; sortKey: SortKeyProd; onSort: (k: SortKeyProd) => void }) {
  const active = sortKey === k
  return (
    <TableHead className="text-right">
      <button type="button" onClick={() => onSort(k)} className={`inline-flex items-center gap-1 hover:text-stone-900 ${active ? "text-stone-900 font-semibold" : "text-stone-600"}`}>
        {label}<TrendingDown className={`h-3 w-3 ${active ? "opacity-90" : "opacity-30"}`} />
      </button>
    </TableHead>
  )
}

// ==================== Tab 3: Análisis de gastos ====================
function GastosTab({ gastos, loading, desde, hasta }: { gastos: AnalisisGastos | null; loading: boolean; desde: string; hasta: string }) {
  if (loading && !gastos) return <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
  if (!gastos) return <p className="text-sm text-stone-500 py-8 text-center">Sin gastos en el período.</p>

  const g = gastos
  const mayor = g.porCategoria[0]
  const serie = g.serieMensual.map((s) => ({ mes: s.mes.slice(2), total: s.total }))
  const hayAnomalia = g.anomalias.some((a) => a.anomaloPromedio || a.anomaloAnterior)

  function exportar() {
    exportToXlsx(
      g.porConcepto.map((c) => ({ Concepto: c.clave, Monto: +c.monto.toFixed(2), "% del total": +c.pct.toFixed(1) })),
      { sheetName: "Gastos", filename: `Gastos_${desde}_a_${hasta}`, colWidths: [36, 16, 12] }
    )
  }

  return (
    <>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Kpi label="Gasto total" value={formatCurrency(g.gastoTotal)} color="text-red-600" />
        <Kpi label="Gasto / ventas" value={`${g.gastosComoPctVentas.toFixed(1)}%`} sub="del ingreso del período" />
        <Kpi label="Mayor categoría" value={mayor ? mayor.clave : "—"} sub={mayor ? formatCurrency(mayor.monto) : undefined} />
        <Kpi label="Anomalías" value={g.anomalias.filter((a) => a.anomaloPromedio || a.anomaloAnterior).length.toString()} sub={`≥ +${ANOMALIA_PCT}%`} color={hayAnomalia ? "text-amber-600" : undefined} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Gasto por categoría</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={g.porCategoria} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => formatNumber(Number(v))} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="clave" width={90} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatCurrency(Number(v))} contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="monto" radius={[0, 4, 4, 0]}>
                  {g.porCategoria.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Top proveedores</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-[260px] overflow-y-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Proveedor</TableHead><TableHead className="text-right">Monto</TableHead><TableHead className="text-right">%</TableHead></TableRow></TableHeader>
                <TableBody>
                  {g.porProveedor.slice(0, 12).map((p) => (
                    <TableRow key={p.clave}>
                      <TableCell className="max-w-[180px] truncate text-sm">{p.clave}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(p.monto)}</TableCell>
                      <TableCell className="text-right text-stone-500">{p.pct.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Tendencia (últimos 6 meses)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={serie} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => formatNumber(Number(v))} tick={{ fontSize: 11 }} width={64} />
              <Tooltip formatter={(v: number) => formatCurrency(Number(v))} contentStyle={{ fontSize: 12 }} />
              <Line dataKey="total" stroke="#C07A5C" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Incrementos anómalos por categoría</CardTitle>
            <CardDescription className="text-xs">Mes {g.mesActual} comparado con el promedio de meses previos y con el mes anterior. Se marca ≥ +{ANOMALIA_PCT}%.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportar} className="gap-1"><Download className="h-4 w-4" /> Exportar</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Mes actual</TableHead>
                  <TableHead className="text-right">Prom. previos</TableHead>
                  <TableHead className="text-right">vs promedio</TableHead>
                  <TableHead className="text-right">Mes anterior</TableHead>
                  <TableHead className="text-right">vs anterior</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {g.anomalias.map((a) => (
                  <TableRow key={a.categoria} className={a.anomaloPromedio || a.anomaloAnterior ? "bg-amber-50/60" : undefined}>
                    <TableCell className="text-sm font-medium">
                      {(a.anomaloPromedio || a.anomaloAnterior) && <AlertTriangle className="inline h-3.5 w-3.5 text-amber-600 mr-1" />}
                      {a.categoria}
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(a.actual)}</TableCell>
                    <TableCell className="text-right font-mono text-stone-500">{formatCurrency(a.promedioPrevios)}</TableCell>
                    <TableCell className={`text-right ${a.anomaloPromedio ? "text-amber-700 font-semibold" : pctColor(-a.deltaVsPromedioPct)}`}>{a.deltaVsPromedioPct >= 0 ? "+" : ""}{a.deltaVsPromedioPct.toFixed(0)}%</TableCell>
                    <TableCell className="text-right font-mono text-stone-500">{formatCurrency(a.periodoAnterior)}</TableCell>
                    <TableCell className={`text-right ${a.anomaloAnterior ? "text-amber-700 font-semibold" : pctColor(-a.deltaVsAnteriorPct)}`}>{a.deltaVsAnteriorPct >= 0 ? "+" : ""}{a.deltaVsAnteriorPct.toFixed(0)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

// ==================== Tab 4: Auditoría de costeo ====================
function CosteoTab({ auditoria, loading }: { auditoria: ProductoAuditoria[] | null; loading: boolean }) {
  const [productos, setProductos] = React.useState<Producto[]>([])
  const [busqueda, setBusqueda] = React.useState("")
  const [productoId, setProductoId] = React.useState("")
  const [historial, setHistorial] = React.useState<HistorialCosteo | null>(null)
  const [histLoading, setHistLoading] = React.useState(false)

  React.useEffect(() => { getProductos().then((r) => setProductos(r.data || [])) }, [])

  React.useEffect(() => {
    if (!productoId) { setHistorial(null); return }
    let cancelado = false
    setHistLoading(true)
    getHistorialCosteoProducto(Number(productoId)).then((r) => {
      if (cancelado) return
      setHistorial(r.data); setHistLoading(false)
    })
    return () => { cancelado = true }
  }, [productoId])

  const productosFiltrados = productos.filter((p) => {
    const q = busqueda.trim().toLowerCase()
    return !q || p.nombre.toLowerCase().includes(q) || (p.codigo_barras || "").toLowerCase().includes(q)
  }).slice(0, 100)

  const serieCosto = (historial?.eventos || []).map((e) => ({ fecha: (e.fecha || "").slice(0, 10), costo: e.costoUnitario }))

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" /> Productos mal costeados</CardTitle>
          <CardDescription className="text-xs">
            Costo en 0 con stock/ventas, costo ≥ precio (venta a pérdida) o utilidad negativa en el período. Corrige en
            «Ajuste de Costo» o «Recalcular Recepción».
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !auditoria ? (
            <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>
          ) : !auditoria || auditoria.length === 0 ? (
            <p className="text-sm text-emerald-700 py-4">✓ No se detectaron productos mal costeados en el período.</p>
          ) : (
            <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Uds. período</TableHead>
                    <TableHead className="text-right">Utilidad período</TableHead>
                    <TableHead>Alertas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditoria.map((p) => (
                    <TableRow key={p.producto_id}>
                      <TableCell className="max-w-[200px] truncate text-sm">{p.nombre}</TableCell>
                      <TableCell className="text-right">{formatNumber(p.stock)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(p.costo)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(p.precio)}</TableCell>
                      <TableCell className="text-right">{formatNumber(p.unidadesPeriodo)}</TableCell>
                      <TableCell className={`text-right font-mono ${pctColor(p.utilidadPeriodo)}`}>{formatCurrency(p.utilidadPeriodo)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {p.costoCero && <Badge variant="outline" className="text-[10px] border-red-300 text-red-700">Costo 0</Badge>}
                          {p.costoMayorPrecio && <Badge variant="outline" className="text-[10px] border-red-300 text-red-700">Costo ≥ precio</Badge>}
                          {p.margenNegativo && <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">Margen −</Badge>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><PackageSearch className="h-4 w-4 text-stone-600" /> Historial de costo por producto</CardTitle>
          <CardDescription className="text-xs">Reconstruido de compras/importaciones (kardex) y de la bitácora de ajustes de costo. No hay serie de costo persistida; esto es una reconstrucción.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input className="pl-9" placeholder="Buscar producto…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
            <Select value={productoId} onValueChange={setProductoId}>
              <SelectTrigger className="w-full sm:w-80"><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
              <SelectContent>
                {productosFiltrados.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
            {historial && <span className="text-sm text-stone-600">Costo actual: <strong>{formatCurrency(historial.costoActual)}</strong></span>}
          </div>

          {histLoading ? (
            <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>
          ) : historial && productoId ? (
            historial.eventos.length === 0 ? (
              <p className="text-sm text-stone-500 py-4">Sin movimientos de costo registrados para este producto.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={serieCosto} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={(v) => formatNumber(Number(v))} tick={{ fontSize: 11 }} width={64} />
                    <Tooltip formatter={(v: number) => formatCurrency(Number(v))} contentStyle={{ fontSize: 12 }} />
                    <Line dataKey="costo" stroke="#5D7B6F" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Evento</TableHead>
                        <TableHead className="text-right">Costo unit.</TableHead>
                        <TableHead className="text-right">Cant.</TableHead>
                        <TableHead>Detalle</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historial.eventos.map((e, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-sm whitespace-nowrap">{(e.fecha || "").slice(0, 10)}</TableCell>
                          <TableCell className="text-sm">{e.tipo}</TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            {formatCurrency(e.costoUnitario)}
                            {e.costoAnterior != null && <span className="text-xs text-stone-400 ml-1">(antes {formatCurrency(e.costoAnterior)})</span>}
                          </TableCell>
                          <TableCell className="text-right">{e.cantidad != null ? formatNumber(e.cantidad) : "—"}</TableCell>
                          <TableCell className="text-xs text-stone-500">
                            {e.compra ? `Compra #${e.referencia_id} · ${e.compra.moneda}${e.compra.tasa_cambio !== 1 ? ` @${e.compra.tasa_cambio}` : ""}${(e.compra.costos_importacion + e.compra.impuestos_compra + e.compra.otros_costos) > 0 ? ` · costos fijos ${formatCurrency(e.compra.costos_importacion + e.compra.impuestos_compra + e.compra.otros_costos)}` : ""}` : e.motivo || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )
          ) : (
            <p className="text-sm text-stone-400 py-4 flex items-center gap-2"><Info className="h-4 w-4" /> Elige un producto para ver su historial de costeo.</p>
          )}
        </CardContent>
      </Card>
    </>
  )
}
