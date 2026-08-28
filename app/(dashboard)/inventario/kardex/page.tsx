"use client"

import * as React from "react"
import { Package, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getProductos, getAlmacenes, getLocalizaciones, type Producto, type Almacen, type Localizacion } from "@/lib/services/catalogos"
import { getAllTransacciones, type TransaccionInventario } from "@/lib/services/inventario"
import { exportToXlsx } from "@/lib/utils/export"

export default function KardexPage() {
  const { toast } = useToast()
  
  // Catalogos
  const [productos, setProductos] = React.useState<Producto[]>([])
  const [almacenes, setAlmacenes] = React.useState<Almacen[]>([])
  const [localizaciones, setLocalizaciones] = React.useState<Localizacion[]>([])
  
  // Data
  const [transacciones, setTransacciones] = React.useState<TransaccionInventario[]>([])
  const [loading, setLoading] = React.useState(true)

  // Filters
  const [filtroFechaInicio, setFiltroFechaInicio] = React.useState("")
  const [filtroFechaFin, setFiltroFechaFin] = React.useState("")
  const [filtroProductoId, setFiltroProductoId] = React.useState("")
  const [filtroAlmacenId, setFiltroAlmacenId] = React.useState("")
  const [filtroLocalizacionId, setFiltroLocalizacionId] = React.useState("")
  const [filtroTipoMovimiento, setFiltroTipoMovimiento] = React.useState("")
  // Busqueda para el selector de producto (para no scrollear cientos).
  const [busquedaProducto, setBusquedaProducto] = React.useState("")

  React.useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [prodRes, almRes, locRes, transRes] = await Promise.all([
      getProductos(),
      getAlmacenes(),
      getLocalizaciones(),
      getAllTransacciones()
    ])
    
    if (prodRes.error) toast({ title: "Error", description: prodRes.error, variant: "destructive" })
    else setProductos(prodRes.data)
    
    if (!almRes.error) setAlmacenes(almRes.data)
    if (!locRes.error) setLocalizaciones(locRes.data)
    
    if (transRes.error) toast({ title: "Error", description: transRes.error, variant: "destructive" })
    else setTransacciones(transRes.data)
    
    setLoading(false)
  }

  // Filter localizaciones by selected almacen
  const localizacionesFiltradas = React.useMemo(() => {
    if (!filtroAlmacenId) return localizaciones
    return localizaciones.filter(l => l.almacen_id === parseInt(filtroAlmacenId))
  }, [localizaciones, filtroAlmacenId])

  // Apply filters to transactions
  const transaccionesFiltradas = React.useMemo(() => {
    return transacciones.filter(t => {
      const fecha = t.fecha?.split('T')[0] || ""
      const matchFechaInicio = !filtroFechaInicio || fecha >= filtroFechaInicio
      const matchFechaFin = !filtroFechaFin || fecha <= filtroFechaFin
      const matchProducto = !filtroProductoId || t.producto_id === parseInt(filtroProductoId)
      const matchAlmacen = !filtroAlmacenId || t.almacen_id === parseInt(filtroAlmacenId)
      const matchLocalizacion = !filtroLocalizacionId || t.localizacion_id === parseInt(filtroLocalizacionId)
      const matchTipo = !filtroTipoMovimiento || t.tipo_movimiento === filtroTipoMovimiento
      
      return matchFechaInicio && matchFechaFin && matchProducto && matchAlmacen && matchLocalizacion && matchTipo
    })
  }, [transacciones, filtroFechaInicio, filtroFechaFin, filtroProductoId, filtroAlmacenId, filtroLocalizacionId, filtroTipoMovimiento])

  // ¿Estamos en modo "Kardex por producto"? (hay un producto seleccionado)
  const esKardex = !!filtroProductoId

  // Productos para el selector, filtrados por la busqueda de texto.
  const productosParaSelect = React.useMemo(() => {
    const q = busquedaProducto.trim().toLowerCase()
    if (!q) return productos
    return productos.filter(
      (p) =>
        (p.nombre || "").toLowerCase().includes(q) ||
        (p.codigo_barras || "").toLowerCase().includes(q)
    )
  }, [productos, busquedaProducto])

  const productoSel = React.useMemo(
    () => productos.find((p) => String(p.id) === filtroProductoId) || null,
    [productos, filtroProductoId]
  )

  // Kardex del producto seleccionado: TODOS sus movimientos (respetando
  // almacen/localizacion/tipo si se filtro) ordenados cronologicamente, con el
  // SALDO acumulado despues de cada movimiento. El saldo considera SIEMPRE toda
  // la historia previa, asi que al filtrar por fechas se calcula un "saldo
  // inicial" (lo acumulado antes del rango) y las filas del rango arrancan de
  // ahi. Sin filtro de fecha, arranca en 0 (desde el primer ingreso).
  const kardex = React.useMemo(() => {
    if (!filtroProductoId) return null
    const pid = parseInt(filtroProductoId)
    const alm = filtroAlmacenId ? parseInt(filtroAlmacenId) : null
    const loc = filtroLocalizacionId ? parseInt(filtroLocalizacionId) : null

    const delProducto = transacciones
      .filter(
        (t) =>
          t.producto_id === pid &&
          (alm == null || t.almacen_id === alm) &&
          (loc == null || t.localizacion_id === loc) &&
          (!filtroTipoMovimiento || t.tipo_movimiento === filtroTipoMovimiento)
      )
      .sort((a, b) => {
        const fa = a.fecha || "", fb = b.fecha || ""
        if (fa !== fb) return fa < fb ? -1 : 1
        return (a.id ?? 0) - (b.id ?? 0)
      })

    let saldo = 0
    let saldoInicial = 0
    const filas: (TransaccionInventario & { saldo: number })[] = []
    for (const t of delProducto) {
      saldo = +(saldo + Number(t.cantidad || 0)).toFixed(4)
      const fecha = t.fecha?.split("T")[0] || ""
      const antesDelRango = !!filtroFechaInicio && fecha < filtroFechaInicio
      const despuesDelRango = !!filtroFechaFin && fecha > filtroFechaFin
      if (antesDelRango) {
        saldoInicial = saldo // lo acumulado antes del rango
        continue
      }
      if (despuesDelRango) continue
      filas.push({ ...t, saldo })
    }
    const saldoFinal = filas.length > 0 ? filas[filas.length - 1].saldo : saldoInicial
    return { filas, saldoInicial, saldoFinal }
  }, [transacciones, filtroProductoId, filtroAlmacenId, filtroLocalizacionId, filtroTipoMovimiento, filtroFechaInicio, filtroFechaFin])

  function getTipoMovimientoBadge(tipo: string) {
    switch (tipo) {
      case 'Entrada Compra':
        return <Badge className="bg-green-500 hover:bg-green-600"><ArrowDownCircle className="h-3 w-3 mr-1" />Entrada Compra</Badge>
      case 'Salida Venta':
        return <Badge className="bg-red-500 hover:bg-red-600"><ArrowUpCircle className="h-3 w-3 mr-1" />Salida Venta</Badge>
      case 'Traslado Entrada':
        return <Badge className="bg-blue-500 hover:bg-blue-600"><ArrowLeftRight className="h-3 w-3 mr-1" />Traslado Entrada</Badge>
      case 'Traslado Salida':
        return <Badge className="bg-orange-500 hover:bg-orange-600"><ArrowLeftRight className="h-3 w-3 mr-1" />Traslado Salida</Badge>
      case 'Ajuste':
        return <Badge variant="outline"><Package className="h-3 w-3 mr-1" />Ajuste</Badge>
      default:
        return <Badge variant="secondary">{tipo}</Badge>
    }
  }

  function exportToExcel() {
    // Modo Kardex: exporta el kardex del producto con Entrada/Salida/Saldo.
    if (esKardex) {
      if (!kardex || kardex.filas.length === 0) {
        toast({ title: "Sin datos", description: "No hay movimientos para exportar", variant: "destructive" })
        return
      }
      const rows: Record<string, unknown>[] = []
      if (filtroFechaInicio || filtroFechaFin) {
        rows.push({
          Fecha: "", Hora: "", 'Tipo Movimiento': "Saldo inicial (antes del rango)",
          Almacen: "", Localizacion: "", Entrada: "", Salida: "", Saldo: kardex.saldoInicial,
          'Costo/Precio': "",
        })
      }
      for (const t of kardex.filas) {
        rows.push({
          Fecha: t.fecha?.split('T')[0] || '',
          Hora: t.fecha?.split('T')[1]?.substring(0, 8) || '',
          'Tipo Movimiento': t.tipo_movimiento,
          Almacen: t.almacen_nombre || '',
          Localizacion: t.localizacion_nombre || '',
          Entrada: t.cantidad > 0 ? t.cantidad : '',
          Salida: t.cantidad < 0 ? Math.abs(t.cantidad) : '',
          Saldo: t.saldo,
          'Costo/Precio': t.costo_o_precio_unitario,
        })
      }
      const nombre = productoSel ? productoSel.nombre.replace(/[^\w]+/g, "_").slice(0, 40) : "producto"
      exportToXlsx(rows, {
        sheetName: "Kardex",
        filename: `Kardex_${nombre}`,
        colWidths: [12, 10, 18, 16, 16, 10, 10, 12, 12],
      })
      toast({ title: "Exportado", description: "El kardex se descargo correctamente" })
      return
    }

    // Modo historial general.
    if (transaccionesFiltradas.length === 0) {
      toast({ title: "Sin datos", description: "No hay transacciones para exportar", variant: "destructive" })
      return
    }

    const data: Record<string, unknown>[] = transaccionesFiltradas.map(t => ({
      Fecha: t.fecha?.split('T')[0] || '',
      Hora: t.fecha?.split('T')[1]?.substring(0, 8) || '',
      Producto: t.producto_nombre || '',
      Codigo: t.producto_codigo || '',
      'Tipo Movimiento': t.tipo_movimiento,
      Almacen: t.almacen_nombre || '',
      Localizacion: t.localizacion_nombre || '',
      Cantidad: t.cantidad,
      'Costo/Precio': t.costo_o_precio_unitario
    }))

    exportToXlsx(data, {
      sheetName: "Transacciones",
      filename: "Historial_Transacciones",
      colWidths: [12, 10, 30, 14, 18, 16, 16, 10, 12],
    })
    toast({ title: "Exportado", description: "El archivo Excel se descargo correctamente" })
  }

  function clearFilters() {
    setFiltroFechaInicio("")
    setFiltroFechaFin("")
    setFiltroProductoId("")
    setFiltroAlmacenId("")
    setFiltroLocalizacionId("")
    setFiltroTipoMovimiento("")
    setBusquedaProducto("")
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Kardex de Inventario</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Elige un producto para ver su kardex con saldo acumulado, o revisa el historial de todos los movimientos.
          </p>
        </div>
        <Button
          onClick={exportToExcel}
          className="gap-2 w-full sm:w-auto"
          disabled={esKardex ? !kardex || kardex.filas.length === 0 : transaccionesFiltradas.length === 0}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Exportar Excel</span>
        </Button>
      </div>

      {/* Filters and Table */}
      <Card className="rounded-2xl shadow-sm border border-stone-200">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg">
            {esKardex && productoSel
              ? `Kardex: ${productoSel.codigo_barras ? `[${productoSel.codigo_barras}] ` : ""}${productoSel.nombre}`
              : "Movimientos"}
          </CardTitle>
          <CardDescription>
            {esKardex && kardex
              ? `${kardex.filas.length} movimiento(s) · Saldo actual: ${kardex.saldoFinal}`
              : `${transaccionesFiltradas.length} movimiento(s) ${transaccionesFiltradas.length !== transacciones.length ? `de ${transacciones.length} total` : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 space-y-4">
          {/* Filters */}
          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              {/* Fecha Inicio */}
              <div>
                <Label className="text-xs text-stone-600 mb-1.5 block">Fecha Inicio</Label>
                <Input
                  type="date"
                  value={filtroFechaInicio}
                  onChange={e => setFiltroFechaInicio(e.target.value)}
                  className="bg-white border-stone-200"
                />
              </div>

              {/* Fecha Fin */}
              <div>
                <Label className="text-xs text-stone-600 mb-1.5 block">Fecha Fin</Label>
                <Input
                  type="date"
                  value={filtroFechaFin}
                  onChange={e => setFiltroFechaFin(e.target.value)}
                  className="bg-white border-stone-200"
                />
              </div>

              {/* Producto (con busqueda) */}
              <div>
                <Label className="text-xs text-stone-600 mb-1.5 block">Producto (kardex)</Label>
                <Select
                  value={filtroProductoId || "all"}
                  onValueChange={(v) => setFiltroProductoId(v === "all" ? "" : v)}
                >
                  <SelectTrigger className="bg-white border-stone-200">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <Input
                        autoFocus
                        placeholder="Buscar por nombre o codigo..."
                        value={busquedaProducto}
                        onChange={(e) => setBusquedaProducto(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="h-8"
                      />
                    </div>
                    <SelectItem value="all">Todos los productos</SelectItem>
                    {productosParaSelect.slice(0, 100).map(p => (
                      <SelectItem key={p.id} value={p.id!.toString()}>
                        {p.codigo_barras ? `[${p.codigo_barras}] ` : ''}{p.nombre}
                      </SelectItem>
                    ))}
                    {productosParaSelect.length === 0 && (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">Sin resultados</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo Movimiento */}
              <div>
                <Label className="text-xs text-stone-600 mb-1.5 block">Tipo Movimiento</Label>
                <Select 
                  value={filtroTipoMovimiento || "all"} 
                  onValueChange={(v) => setFiltroTipoMovimiento(v === "all" ? "" : v)}
                >
                  <SelectTrigger className="bg-white border-stone-200">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Entrada Compra">Entrada Compra</SelectItem>
                    <SelectItem value="Salida Venta">Salida Venta</SelectItem>
                    <SelectItem value="Traslado Entrada">Traslado Entrada</SelectItem>
                    <SelectItem value="Traslado Salida">Traslado Salida</SelectItem>
                    <SelectItem value="Ajuste">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              {/* Almacen */}
              <div>
                <Label className="text-xs text-stone-600 mb-1.5 block">Almacen</Label>
                <Select 
                  value={filtroAlmacenId || "all"} 
                  onValueChange={(v) => {
                    setFiltroAlmacenId(v === "all" ? "" : v)
                    setFiltroLocalizacionId("")
                  }}
                >
                  <SelectTrigger className="bg-white border-stone-200">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los almacenes</SelectItem>
                    {almacenes.map(a => (
                      <SelectItem key={a.id} value={a.id!.toString()}>
                        {a.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Localizacion */}
              <div>
                <Label className="text-xs text-stone-600 mb-1.5 block">Localizacion</Label>
                <Select 
                  value={filtroLocalizacionId || "all"} 
                  onValueChange={(v) => setFiltroLocalizacionId(v === "all" ? "" : v)}
                  disabled={!filtroAlmacenId}
                >
                  <SelectTrigger className="bg-white border-stone-200">
                    <SelectValue placeholder={filtroAlmacenId ? "Todas" : "Seleccione almacen"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las localizaciones</SelectItem>
                    {localizacionesFiltradas.map(l => (
                      <SelectItem key={l.id} value={l.id!.toString()}>
                        {l.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Spacer */}
              <div className="hidden lg:block" />

              {/* Limpiar */}
              <Button
                variant="outline"
                className="border-stone-200 bg-white hover:bg-stone-100"
                onClick={clearFilters}
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (esKardex ? !kardex || kardex.filas.length === 0 : transaccionesFiltradas.length === 0) ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay movimientos {transacciones.length > 0 ? "con los filtros seleccionados" : "registrados"}</p>
            </div>
          ) : esKardex && kardex ? (
            /* ===== Kardex por producto: cronologico + saldo acumulado ===== */
            <div className="overflow-x-auto border rounded-lg">
              <Table containerClassName="max-h-[60vh] overflow-y-auto">
                <TableHeader sticky>
                  <TableRow className="bg-stone-50">
                    <TableHead className="font-semibold">Fecha</TableHead>
                    <TableHead className="font-semibold">Tipo Movimiento</TableHead>
                    <TableHead className="font-semibold">Almacen</TableHead>
                    <TableHead className="font-semibold">Localizacion</TableHead>
                    <TableHead className="font-semibold text-right">Entrada</TableHead>
                    <TableHead className="font-semibold text-right">Salida</TableHead>
                    <TableHead className="font-semibold text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(filtroFechaInicio || filtroFechaFin) && (
                    <TableRow className="bg-stone-100/60">
                      <TableCell colSpan={6} className="text-sm font-medium text-muted-foreground">
                        Saldo inicial (antes del rango)
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">{kardex.saldoInicial}</TableCell>
                    </TableRow>
                  )}
                  {kardex.filas.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap">
                        <div>
                          <p className="font-medium">{t.fecha?.split('T')[0]}</p>
                          <p className="text-xs text-muted-foreground">{t.fecha?.split('T')[1]?.substring(0, 8)}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getTipoMovimientoBadge(t.tipo_movimiento)}</TableCell>
                      <TableCell>{t.almacen_nombre || '-'}</TableCell>
                      <TableCell>{t.localizacion_nombre || '-'}</TableCell>
                      <TableCell className="text-right font-mono text-green-600">
                        {t.cantidad > 0 ? t.cantidad : ''}
                      </TableCell>
                      <TableCell className="text-right font-mono text-red-600">
                        {t.cantidad < 0 ? Math.abs(t.cantidad) : ''}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">{t.saldo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* ===== Historial general (todos los productos) ===== */
            <div className="overflow-x-auto border rounded-lg">
              <Table containerClassName="max-h-[60vh] overflow-y-auto">
                <TableHeader sticky>
                  <TableRow className="bg-stone-50">
                    <TableHead className="font-semibold">Fecha</TableHead>
                    <TableHead className="font-semibold">Producto</TableHead>
                    <TableHead className="font-semibold">Tipo Movimiento</TableHead>
                    <TableHead className="font-semibold">Almacen</TableHead>
                    <TableHead className="font-semibold">Localizacion</TableHead>
                    <TableHead className="font-semibold text-right">Cantidad</TableHead>
                    <TableHead className="font-semibold text-right">Costo/Precio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaccionesFiltradas.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap">
                        <div>
                          <p className="font-medium">{t.fecha?.split('T')[0]}</p>
                          <p className="text-xs text-muted-foreground">{t.fecha?.split('T')[1]?.substring(0, 8)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{t.producto_nombre || '-'}</p>
                          <p className="text-xs text-muted-foreground font-mono">{t.producto_codigo || ''}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getTipoMovimientoBadge(t.tipo_movimiento)}</TableCell>
                      <TableCell>{t.almacen_nombre || '-'}</TableCell>
                      <TableCell>{t.localizacion_nombre || '-'}</TableCell>
                      <TableCell className={`text-right font-mono ${t.cantidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {t.cantidad >= 0 ? '+' : ''}{t.cantidad}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        L {(t.costo_o_precio_unitario || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
