"use client"

import * as React from "react"
import {
  Calculator, Search, Info, Loader2, ArrowRight, TrendingUp, TrendingDown, PackageCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils/format"
import { getCompras, type CompraEncabezado } from "@/lib/services/compras"
import { DesgloseProrrateo } from "@/components/recepcion/desglose-prorrateo"
import {
  previewRecalculoRecepcion, procesarRecalculoRecepcion, type PreviewRecalculoRecepcion,
} from "@/lib/services/recalculo-recepcion"

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function RecalcularRecepcionPage() {
  const { toast } = useToast()
  const [compras, setCompras] = React.useState<CompraEncabezado[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [confirmando, setConfirmando] = React.useState(false)

  const [compraId, setCompraId] = React.useState("")
  const [busqueda, setBusqueda] = React.useState("")
  const [impStr, setImpStr] = React.useState("")
  const [impuestosStr, setImpuestosStr] = React.useState("")
  const [otrosStr, setOtrosStr] = React.useState("")
  const [tasaStr, setTasaStr] = React.useState("")
  const [recalcular, setRecalcular] = React.useState(false)
  const [desde, setDesde] = React.useState("")
  const [hasta, setHasta] = React.useState("")
  const [motivo, setMotivo] = React.useState("")

  const [preview, setPreview] = React.useState<PreviewRecalculoRecepcion | null>(null)
  const [previewLoading, setPreviewLoading] = React.useState(false)

  React.useEffect(() => {
    getCompras("Recibida").then((res) => {
      setCompras(res.data || [])
      setLoading(false)
    })
  }, [])

  const selectedCompra = compras.find((c) => String(c.id) === compraId)

  // Al elegir una compra, precargar sus costos fijos y el rango por defecto.
  React.useEffect(() => {
    if (!selectedCompra) return
    setImpStr(String(selectedCompra.costos_importacion ?? 0))
    setImpuestosStr(String(selectedCompra.impuestos_compra ?? 0))
    setOtrosStr(String(selectedCompra.otros_costos ?? 0))
    setTasaStr(String(selectedCompra.tasa_cambio ?? 1))
    setDesde((selectedCompra.fecha_orden || "").slice(0, 10))
    setHasta(hoyISO())
    setRecalcular(false)
    setMotivo("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compraId])

  const imp = Number(impStr)
  const impuestos = Number(impuestosStr)
  const otros = Number(otrosStr)
  const tasa = Number(tasaStr)
  const costosValidos =
    [impStr, impuestosStr, otrosStr].every((s) => s !== "" && !Number.isNaN(Number(s)) && Number(s) >= 0) &&
    tasaStr !== "" && !Number.isNaN(tasa) && tasa > 0
  const rangoValido = !recalcular || (!!desde && !!hasta && desde <= hasta)

  const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100
  const costosDistintos =
    !!selectedCompra &&
    (round2(imp) !== round2(Number(selectedCompra.costos_importacion || 0)) ||
      round2(impuestos) !== round2(Number(selectedCompra.impuestos_compra || 0)) ||
      round2(otros) !== round2(Number(selectedCompra.otros_costos || 0)) ||
      Number(tasa) !== Number(selectedCompra.tasa_cambio || 1))

  const hayImpactoProductos = !!preview && preview.productos.some((p) => Math.abs(p.deltaValorLote) > 0)
  const hayCambio = !!selectedCompra && costosValidos && (costosDistintos || hayImpactoProductos)

  // Preview reactivo (debounce).
  React.useEffect(() => {
    let cancelado = false
    const valido = !!compraId && costosValidos
    const t = setTimeout(async () => {
      if (!valido) {
        if (!cancelado) setPreview(null)
        return
      }
      setPreviewLoading(true)
      const usarRango = recalcular && !!desde && !!hasta && desde <= hasta
      const res = await previewRecalculoRecepcion({
        compraId: Number(compraId),
        costos_importacion: imp,
        impuestos_compra: impuestos,
        otros_costos: otros,
        tasa_cambio: tasa,
        recalcular: usarRango,
        desde: usarRango ? desde : undefined,
        hasta: usarRango ? hasta : undefined,
      })
      if (cancelado) return
      setPreview(res.data)
      setPreviewLoading(false)
    }, 400)
    return () => { cancelado = true; clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compraId, impStr, impuestosStr, otrosStr, tasaStr, costosValidos, recalcular, desde, hasta])

  async function ejecutar() {
    if (!selectedCompra) return
    setSaving(true)
    const usarRango = recalcular && !!desde && !!hasta && desde <= hasta
    const res = await procesarRecalculoRecepcion({
      compraId: selectedCompra.id!,
      costos_importacion: imp,
      impuestos_compra: impuestos,
      otros_costos: otros,
      tasa_cambio: tasa,
      recalcular: usarRango,
      desde: usarRango ? desde : undefined,
      hasta: usarRango ? hasta : undefined,
      motivo: motivo || undefined,
    })
    setSaving(false)
    setConfirmando(false)
    if (!res.success) {
      toast({ title: "Error", description: res.error || "No se pudo recalcular la recepcion", variant: "destructive" })
      return
    }
    if (res.error) {
      toast({ title: "Recalculado con advertencia", description: res.error, variant: "destructive" })
    } else {
      toast({
        title: "Recepcion recalculada",
        description: usarRango
          ? `${res.productosAfectados} producto(s) ajustados y ${res.ventasAfectadas} venta(s) recalculadas.`
          : `${res.productosAfectados} producto(s) ajustados con el nuevo costo del lote.`,
      })
    }
    // Refrescar los costos guardados de la compra en memoria.
    setCompras((prev) =>
      prev.map((c) =>
        c.id === selectedCompra.id
          ? { ...c, costos_importacion: imp, impuestos_compra: impuestos, otros_costos: otros, tasa_cambio: tasa }
          : c
      )
    )
    setPreview(null)
    setCompraId("")
  }

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner className="h-8 w-8" /></div>
  }

  const comprasFiltradas = compras
    .filter((c) => {
      const q = busqueda.trim().toLowerCase()
      if (!q) return true
      return (
        String(c.id).includes(q) ||
        (c.proveedor_nombre || "").toLowerCase().includes(q)
      )
    })
    .slice(0, 100)

  const etiquetaCompra = (c: CompraEncabezado) =>
    `#${c.id} · ${c.proveedor_nombre || "Proveedor"} · ${(c.fecha_orden || "").slice(0, 10)} · ${c.moneda}`

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
          <Calculator className="h-7 w-7 text-stone-600" /> Recalcular Recepcion
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Toma una compra ya recibida y recalcula el costo del lote con costos fijos corregidos
          (importacion, impuestos, otros, tasa de cambio).
        </p>
      </div>

      <Card className="bg-amber-50/50 border-amber-200/60">
        <CardContent className="py-3 flex items-start gap-2 text-sm text-amber-800">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            El nuevo costo se aplica al <strong>costo promedio</strong> por la diferencia del lote
            proporcional al stock actual. Si activas «Recalcular ventas», se{" "}
            <strong>reescribe el CMV/margen historico</strong> del rango. Solo aplica a recepciones por
            Orden de Compra (las de Recepcion por Factura no aparecen aqui).
          </span>
        </CardContent>
      </Card>

      {/* Seleccion del lote */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Compra recibida (lote)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input className="pl-9" placeholder="Buscar por # o proveedor…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          {compras.length === 0 ? (
            <p className="text-sm text-stone-500">No hay compras recibidas para recalcular.</p>
          ) : (
            <Select value={compraId} onValueChange={setCompraId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar compra recibida" /></SelectTrigger>
              <SelectContent>
                {comprasFiltradas.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{etiquetaCompra(c)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Costos fijos */}
      {selectedCompra && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Costos fijos del lote</CardTitle>
            <CardDescription>
              Moneda {selectedCompra.moneda}. Total actual del lote:{" "}
              <strong>{formatCurrency(Number(selectedCompra.total_compra_local || 0))}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-4">
            <div className="grid gap-2">
              <Label htmlFor="imp">Costos importacion (L)</Label>
              <Input id="imp" type="number" step="0.01" min="0" value={impStr} onChange={(e) => setImpStr(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="impuestos">Impuestos compra (L)</Label>
              <Input id="impuestos" type="number" step="0.01" min="0" value={impuestosStr} onChange={(e) => setImpuestosStr(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="otros">Otros costos (L)</Label>
              <Input id="otros" type="number" step="0.01" min="0" value={otrosStr} onChange={(e) => setOtrosStr(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tasa">Tasa de cambio</Label>
              <Input id="tasa" type="number" step="0.0001" min="0" value={tasaStr} onChange={(e) => setTasaStr(e.target.value)} disabled={selectedCompra.moneda !== "USD"} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview del prorrateo + impacto */}
      {selectedCompra && costosValidos && preview && (
        <>
          <DesgloseProrrateo resultado={preview.prorrateo} />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-stone-600" /> Impacto por producto
                {previewLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-stone-400" />}
              </CardTitle>
              <CardDescription>
                Total del lote: {formatCurrency(preview.totalAnterior)}{" "}
                <ArrowRight className="inline h-3 w-3" /> <strong>{formatCurrency(preview.totalNuevo)}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-center">Cant.</TableHead>
                      <TableHead className="text-right">Costo final (L)</TableHead>
                      <TableHead className="text-right">Δ lote (L)</TableHead>
                      <TableHead className="text-right">Costo promedio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.productos.map((p) => {
                      const color = p.deltaValorLote >= 0 ? "text-emerald-700" : "text-red-600"
                      return (
                        <TableRow key={p.producto_id}>
                          <TableCell className="max-w-[200px] truncate text-sm">{p.producto_nombre}</TableCell>
                          <TableCell className="text-center">{p.cantidad}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(p.costoFinalViejo)}
                            <ArrowRight className="inline h-3 w-3 mx-1 text-stone-400" />
                            <span className="font-semibold">{formatCurrency(p.costoFinalNuevo)}</span>
                          </TableCell>
                          <TableCell className={`text-right font-mono ${color}`}>
                            {p.deltaValorLote >= 0 ? "+" : ""}{formatCurrency(p.deltaValorLote)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {p.stock <= 0 ? (
                              <span className="text-xs text-amber-600">sin stock</span>
                            ) : (
                              <>
                                {formatCurrency(p.costoPromActual)}
                                <ArrowRight className="inline h-3 w-3 mx-1 text-stone-400" />
                                <span className="font-semibold">{formatCurrency(p.costoPromNuevo)}</span>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Recalculo de ventas */}
      {selectedCompra && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recalculo de ventas historicas</CardTitle>
            <CardDescription>
              Opcional. Aplica el nuevo costo al costo congelado de las ventas de estos productos en el rango
              (afecta el CMV y el margen historico).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox id="recalc" checked={recalcular} onCheckedChange={(v) => setRecalcular(v === true)} />
              <Label htmlFor="recalc" className="cursor-pointer">Recalcular ventas en un intervalo</Label>
            </div>
            {recalcular && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="desde">Desde</Label>
                  <Input id="desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hasta">Hasta</Label>
                  <Input id="hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
                </div>
              </div>
            )}
            {recalcular && !rangoValido && (
              <p className="text-sm text-red-600">Elige un rango de fechas valido (desde ≤ hasta).</p>
            )}
            {recalcular && rangoValido && preview && (
              <div className="rounded-lg border bg-stone-50 p-4 grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-xs text-stone-500">Cambio total en utilidad (rango)</p>
                  {(() => {
                    const delta = preview.productos.reduce((acc, p) => acc + (p.impacto?.deltaUtilidad || 0), 0)
                    return (
                      <p className={`text-lg font-bold flex items-center gap-1 ${delta >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                        {delta >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {delta >= 0 ? "+" : ""}{formatCurrency(delta)}
                      </p>
                    )
                  })()}
                </div>
                <div>
                  <p className="text-xs text-stone-500">Ventas afectadas</p>
                  <p className="text-xl font-bold text-stone-800">
                    {previewLoading ? "…" : preview.productos.reduce((acc, p) => acc + (p.impacto?.ventasAfectadas || 0), 0)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Motivo + accion */}
      {selectedCompra && (
        <Card>
          <CardContent className="py-4 space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="motivo">Motivo (opcional)</Label>
              <Textarea id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Llego la factura de flete/aduana con un monto distinto…" rows={2} />
            </div>
            <div className="flex justify-end">
              <Button disabled={!hayCambio || !rangoValido || previewLoading} onClick={() => setConfirmando(true)} className="gap-2">
                <Calculator className="h-4 w-4" /> Aplicar recalculo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmacion */}
      <AlertDialog open={confirmando} onOpenChange={(o) => { if (!saving) setConfirmando(o) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar recalculo del lote</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>
                  Compra <strong>#{selectedCompra?.id}</strong>: el total del lote pasa de{" "}
                  <strong>{formatCurrency(preview?.totalAnterior ?? 0)}</strong> a{" "}
                  <strong>{formatCurrency(preview?.totalNuevo ?? 0)}</strong>.
                </p>
                <p>
                  Se actualiza el costo final de cada linea, el kardex de la entrada y el costo promedio de
                  los productos con stock (por delta).
                </p>
                {recalcular && rangoValido ? (
                  <p className="text-amber-700">
                    Ademas se <strong>reescribe el CMV historico</strong> del {desde} al {hasta}. Las ventas del
                    rango quedan con el nuevo costo; si hubo compras a distinto costo, esa variacion se pierde.
                  </p>
                ) : (
                  <p>El historial de ventas <strong>no se modifica</strong> (solo el costo actual y los registros del lote).</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); ejecutar() }} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Aplicando…</> : "Confirmar recalculo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
