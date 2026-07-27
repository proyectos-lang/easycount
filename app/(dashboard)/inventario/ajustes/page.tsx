"use client"

import * as React from "react"
import {
  Scale, Warehouse, MapPin, Package, Search, ArrowUpCircle, ArrowDownCircle,
  Info, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils/format"
import {
  getProductos, getAlmacenes, getLocalizaciones,
  type Producto, type Almacen, type Localizacion,
} from "@/lib/services/catalogos"
import {
  getStockMultipleProducts, procesarAjusteInventario, calcularLineasAjuste,
  type AjusteLineaInput,
} from "@/lib/services/inventario"

export default function AjustesInventarioPage() {
  const { toast } = useToast()
  const [productos, setProductos] = React.useState<Producto[]>([])
  const [almacenes, setAlmacenes] = React.useState<Almacen[]>([])
  const [localizaciones, setLocalizaciones] = React.useState<Localizacion[]>([])
  const [loading, setLoading] = React.useState(true)
  const [motivo, setMotivo] = React.useState("")
  const [confirmando, setConfirmando] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  // Selección común de almacén/localización
  const [almacenId, setAlmacenId] = React.useState("")
  const [localizacionId, setLocalizacionId] = React.useState("")

  // Modo POR PRODUCTO
  const [productoId, setProductoId] = React.useState("")
  const [busquedaProd, setBusquedaProd] = React.useState("")
  const [stockActualProd, setStockActualProd] = React.useState<number | null>(null)
  const [realProd, setRealProd] = React.useState("")

  // Modo POR LOCALIZACIÓN
  const [conteo, setConteo] = React.useState<Record<number, string>>({}) // producto_id -> real
  const [stockLoc, setStockLoc] = React.useState<Record<number, number>>({})
  const [busquedaLoc, setBusquedaLoc] = React.useState("")
  const [cargandoStock, setCargandoStock] = React.useState(false)

  React.useEffect(() => {
    Promise.all([getProductos(), getAlmacenes(), getLocalizaciones()]).then(([p, a, l]) => {
      setProductos(p.data || [])
      setAlmacenes(a.data || [])
      setLocalizaciones(l.data || [])
      setLoading(false)
    })
  }, [])

  const localizacionesFiltradas = React.useMemo(
    () => localizaciones.filter((l) => l.almacen_id === Number(almacenId)),
    [localizaciones, almacenId]
  )

  const selectedProducto = productos.find((p) => String(p.id) === productoId)

  // ---- Modo producto: cargar stock actual al elegir producto+localización ----
  React.useEffect(() => {
    if (productoId && localizacionId) {
      getStockMultipleProducts([Number(productoId)], Number(localizacionId)).then((r) => {
        const actual = r.data[Number(productoId)] ?? 0
        setStockActualProd(actual)
        setRealProd(String(actual))
      })
    } else {
      setStockActualProd(null)
      setRealProd("")
    }
  }, [productoId, localizacionId])

  // ---- Modo localización: cargar stock de todo el catálogo en la loc ----
  const cargarConteoLocalizacion = React.useCallback(async () => {
    if (!localizacionId || productos.length === 0) return
    setCargandoStock(true)
    const ids = productos.map((p) => p.id!).filter(Boolean)
    const res = await getStockMultipleProducts(ids, Number(localizacionId))
    setStockLoc(res.data)
    // Pre-llena el conteo con el stock actual (para que el usuario solo cambie lo que difiere).
    const inicial: Record<number, string> = {}
    for (const id of ids) inicial[id] = String(res.data[id] ?? 0)
    setConteo(inicial)
    setCargandoStock(false)
  }, [localizacionId, productos])

  function resetSeleccion() {
    setProductoId(""); setRealProd(""); setStockActualProd(null)
    setConteo({}); setStockLoc({}); setBusquedaLoc(""); setBusquedaProd("")
  }

  // ---- Construcción de líneas a ajustar según el modo ----
  function construirLineas(modo: "producto" | "localizacion"): AjusteLineaInput[] {
    if (!almacenId || !localizacionId) return []
    if (modo === "producto") {
      if (!selectedProducto || stockActualProd == null || realProd === "") return []
      return [{
        producto_id: selectedProducto.id!,
        almacen_id: Number(almacenId),
        localizacion_id: Number(localizacionId),
        stock_actual: stockActualProd,
        stock_real: Number(realProd),
        costo_unitario: Number(selectedProducto.costo_promedio || 0),
        producto_nombre: selectedProducto.nombre,
      }]
    }
    return productos
      .map((p) => {
        const actual = stockLoc[p.id!] ?? 0
        const realStr = conteo[p.id!]
        const real = realStr === undefined || realStr === "" ? actual : Number(realStr)
        return {
          producto_id: p.id!,
          almacen_id: Number(almacenId),
          localizacion_id: Number(localizacionId),
          stock_actual: actual,
          stock_real: real,
          costo_unitario: Number(p.costo_promedio || 0),
          producto_nombre: p.nombre,
        }
      })
  }

  const [modoActual, setModoActual] = React.useState<"producto" | "localizacion">("producto")
  const lineasCambio = React.useMemo(
    () => calcularLineasAjuste(construirLineas(modoActual)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modoActual, productoId, realProd, stockActualProd, conteo, stockLoc, almacenId, localizacionId]
  )
  const entradas = lineasCambio.filter((l) => l.delta > 0)
  const salidas = lineasCambio.filter((l) => l.delta < 0)

  async function ejecutar() {
    setSaving(true)
    const res = await procesarAjusteInventario(construirLineas(modoActual), motivo || undefined)
    setSaving(false)
    setConfirmando(false)
    if (!res.success) {
      toast({ title: "Error", description: res.error || "No se pudo ajustar", variant: "destructive" })
      return
    }
    toast({ title: "Inventario ajustado", description: `${res.procesados} producto(s) cuadrados.` })
    setMotivo("")
    resetSeleccion()
    if (modoActual === "localizacion") cargarConteoLocalizacion()
  }

  const productosBusquedaLoc = React.useMemo(() => {
    const q = busquedaLoc.trim().toLowerCase()
    const base = q
      ? productos.filter((p) => p.nombre.toLowerCase().includes(q) || p.codigo_barras?.toLowerCase().includes(q))
      : productos
    return base.slice(0, 300)
  }, [productos, busquedaLoc])

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner className="h-8 w-8" /></div>
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
          <Scale className="h-7 w-7 text-stone-600" /> Ajustes de Inventario
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Cuadra el inventario contra un conteo físico. Genera los movimientos de entrada/salida automáticamente.
        </p>
      </div>

      <Card className="bg-amber-50/50 border-amber-200/60">
        <CardContent className="py-3 flex items-start gap-2 text-sm text-amber-800">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          El ajuste <strong>no cambia el costo promedio</strong> del producto: el movimiento usa el costo actual.
          Solo se corrige la cantidad.
        </CardContent>
      </Card>

      {/* Almacén + localización (común a ambos modos) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ubicación a ajustar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label className="flex items-center gap-1"><Warehouse className="h-3.5 w-3.5" /> Almacén</Label>
              <Select value={almacenId} onValueChange={(v) => { setAlmacenId(v); setLocalizacionId(""); resetSeleccion() }}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {almacenes.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Localización</Label>
              <Select
                value={localizacionId}
                onValueChange={(v) => { setLocalizacionId(v); resetSeleccion() }}
                disabled={!almacenId}
              >
                <SelectTrigger><SelectValue placeholder={almacenId ? "Seleccionar" : "Elige almacén primero"} /></SelectTrigger>
                <SelectContent>
                  {localizacionesFiltradas.map((l) => <SelectItem key={l.id} value={String(l.id)}>{l.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {localizacionId && (
        <Tabs value={modoActual} onValueChange={(v) => { setModoActual(v as "producto" | "localizacion"); resetSeleccion() }}>
          <TabsList>
            <TabsTrigger value="producto">Un producto</TabsTrigger>
            <TabsTrigger value="localizacion" onClick={() => { if (Object.keys(stockLoc).length === 0) cargarConteoLocalizacion() }}>
              Localización completa
            </TabsTrigger>
          </TabsList>

          {/* ---------- MODO PRODUCTO ---------- */}
          <TabsContent value="producto" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Producto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input className="pl-9" placeholder="Buscar producto…" value={busquedaProd} onChange={(e) => setBusquedaProd(e.target.value)} />
                </div>
                <Select value={productoId} onValueChange={setProductoId}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
                  <SelectContent>
                    {productos
                      .filter((p) => {
                        const q = busquedaProd.trim().toLowerCase()
                        return !q || p.nombre.toLowerCase().includes(q) || p.codigo_barras?.toLowerCase().includes(q)
                      })
                      .slice(0, 100)
                      .map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>

                {selectedProducto && stockActualProd != null && (
                  <div className="grid gap-4 sm:grid-cols-3 items-end">
                    <div className="rounded-lg border bg-stone-50 p-3">
                      <p className="text-xs text-stone-500">Cantidad actual (sistema)</p>
                      <p className="text-2xl font-bold text-stone-800">{stockActualProd}</p>
                      <p className="text-xs text-stone-400">Costo prom.: {formatCurrency(Number(selectedProducto.costo_promedio || 0))}</p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="real">Cantidad real contada</Label>
                      <Input id="real" type="number" step="0.01" value={realProd} onChange={(e) => setRealProd(e.target.value)} />
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-stone-500">Diferencia</p>
                      {lineasCambio.length > 0 ? (
                        <p className={`text-xl font-bold ${lineasCambio[0].delta > 0 ? "text-emerald-700" : "text-red-700"}`}>
                          {lineasCambio[0].delta > 0 ? "+" : ""}{lineasCambio[0].delta} {lineasCambio[0].delta > 0 ? "(entrada)" : "(salida)"}
                        </p>
                      ) : (
                        <p className="text-xl font-bold text-stone-400">0 (cuadrado)</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------- MODO LOCALIZACIÓN ---------- */}
          <TabsContent value="localizacion" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Conteo de la localización</CardTitle>
                <CardDescription>Escribe la cantidad real de cada producto. Solo se ajustan los que difieren.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input className="pl-9" placeholder="Buscar producto…" value={busquedaLoc} onChange={(e) => setBusquedaLoc(e.target.value)} />
                </div>
                {cargandoStock ? (
                  <div className="flex justify-center py-10"><Spinner className="h-6 w-6" /></div>
                ) : (
                  <div className="overflow-x-auto max-h-[55vh] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead className="text-center">Actual</TableHead>
                          <TableHead className="text-center w-32">Real</TableHead>
                          <TableHead className="text-center">Dif.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productosBusquedaLoc.map((p) => {
                          const actual = stockLoc[p.id!] ?? 0
                          const realStr = conteo[p.id!] ?? String(actual)
                          const dif = +(Number(realStr || 0) - actual).toFixed(2)
                          return (
                            <TableRow key={p.id}>
                              <TableCell className="text-sm max-w-[240px] truncate">{p.nombre}</TableCell>
                              <TableCell className="text-center text-stone-600">{actual}</TableCell>
                              <TableCell>
                                <Input
                                  type="number" step="0.01" className="h-8 text-center"
                                  value={realStr}
                                  onChange={(e) => setConteo((prev) => ({ ...prev, [p.id!]: e.target.value }))}
                                />
                              </TableCell>
                              <TableCell className={`text-center font-medium ${dif > 0 ? "text-emerald-700" : dif < 0 ? "text-red-700" : "text-stone-300"}`}>
                                {dif > 0 ? "+" : ""}{dif !== 0 ? dif : "—"}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Motivo + resumen + acción (compartido) */}
          <Card>
            <CardContent className="py-4 space-y-3">
              <div className="grid gap-2">
                <Label htmlFor="motivo">Motivo (opcional)</Label>
                <Textarea id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Conteo físico, merma, robo, corrección…" rows={2} />
              </div>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 gap-1">
                    <ArrowUpCircle className="h-3.5 w-3.5" /> {entradas.length} entradas
                  </Badge>
                  <Badge variant="secondary" className="bg-red-100 text-red-700 gap-1">
                    <ArrowDownCircle className="h-3.5 w-3.5" /> {salidas.length} salidas
                  </Badge>
                </div>
                <Button disabled={lineasCambio.length === 0} onClick={() => setConfirmando(true)} className="gap-2">
                  <Scale className="h-4 w-4" /> Aplicar ajuste ({lineasCambio.length})
                </Button>
              </div>
            </CardContent>
          </Card>
        </Tabs>
      )}

      {/* Confirmación */}
      <AlertDialog open={confirmando} onOpenChange={(o) => { if (!saving) setConfirmando(o) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar ajuste de inventario</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>Se generarán <strong>{lineasCambio.length}</strong> movimiento(s) de ajuste ({entradas.length} entradas, {salidas.length} salidas).</p>
                <p>El costo promedio de los productos <strong>no se altera</strong>.</p>
                {lineasCambio.length <= 12 && (
                  <ul className="list-disc pl-5 max-h-40 overflow-y-auto">
                    {lineasCambio.map((l) => (
                      <li key={l.producto_id}>
                        {l.producto_nombre}: {l.stock_actual} → {l.stock_real}{" "}
                        <span className={l.delta > 0 ? "text-emerald-700" : "text-red-700"}>({l.delta > 0 ? "+" : ""}{l.delta})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); ejecutar() }} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Aplicando…</> : "Confirmar ajuste"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
