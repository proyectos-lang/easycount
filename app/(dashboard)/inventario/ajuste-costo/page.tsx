"use client"

import * as React from "react"
import {
  Coins, Search, Info, Loader2, TrendingUp, TrendingDown, ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils/format"
import { getProductos, type Producto } from "@/lib/services/catalogos"
import {
  previewAjusteCosto, procesarAjusteCosto, type PreviewAjusteCosto,
} from "@/lib/services/costo"

export default function AjusteCostoPage() {
  const { toast } = useToast()
  const [productos, setProductos] = React.useState<Producto[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [confirmando, setConfirmando] = React.useState(false)

  const [productoId, setProductoId] = React.useState("")
  const [busqueda, setBusqueda] = React.useState("")
  const [costoStr, setCostoStr] = React.useState("")
  const [recalcular, setRecalcular] = React.useState(false)
  const [desde, setDesde] = React.useState("")
  const [hasta, setHasta] = React.useState("")
  const [motivo, setMotivo] = React.useState("")

  const [preview, setPreview] = React.useState<PreviewAjusteCosto | null>(null)
  const [previewLoading, setPreviewLoading] = React.useState(false)

  React.useEffect(() => {
    getProductos().then((p) => {
      setProductos(p.data || [])
      setLoading(false)
    })
  }, [])

  const selectedProducto = productos.find((p) => String(p.id) === productoId)
  const costoNuevo = Number(costoStr)
  const costoValido = costoStr !== "" && !Number.isNaN(costoNuevo) && costoNuevo >= 0
  const rangoValido = !recalcular || (!!desde && !!hasta && desde <= hasta)
  const hayCambio =
    !!selectedProducto &&
    costoValido &&
    Number(selectedProducto.costo_promedio || 0) !== costoNuevo

  // Preview reactivo (con debounce) al cambiar producto/costo/rango.
  React.useEffect(() => {
    let cancelado = false
    const valido = !!productoId && costoValido
    const t = setTimeout(async () => {
      if (!valido) {
        if (!cancelado) setPreview(null)
        return
      }
      setPreviewLoading(true)
      const usarRango = recalcular && !!desde && !!hasta && desde <= hasta
      const res = await previewAjusteCosto(
        Number(productoId), costoNuevo, usarRango, desde || undefined, hasta || undefined
      )
      if (cancelado) return
      setPreview(res.data)
      setPreviewLoading(false)
    }, 350)
    return () => { cancelado = true; clearTimeout(t) }
  }, [productoId, costoStr, costoNuevo, costoValido, recalcular, desde, hasta])

  async function ejecutar() {
    if (!selectedProducto) return
    setSaving(true)
    const res = await procesarAjusteCosto({
      producto_id: selectedProducto.id!,
      costo_nuevo: costoNuevo,
      recalcular: recalcular && !!desde && !!hasta,
      desde: recalcular ? desde : undefined,
      hasta: recalcular ? hasta : undefined,
      motivo: motivo || undefined,
    })
    setSaving(false)
    setConfirmando(false)
    if (!res.success) {
      toast({ title: "Error", description: res.error || "No se pudo ajustar el costo", variant: "destructive" })
      return
    }
    if (res.error) {
      // Costo cambiado, pero el recalculo quedo parcial (fallback sin RPC).
      toast({ title: "Costo actualizado con advertencia", description: res.error, variant: "destructive" })
    } else {
      toast({
        title: "Costo actualizado",
        description: recalcular
          ? `Nuevo costo aplicado y ${res.ventasAfectadas} venta(s) recalculadas.`
          : "Nuevo costo aplicado a la valoración de inventario.",
      })
    }
    setProductoId(""); setCostoStr(""); setRecalcular(false); setDesde(""); setHasta(""); setMotivo("")
    setPreview(null)
  }

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner className="h-8 w-8" /></div>
  }

  const productosFiltrados = productos
    .filter((p) => {
      const q = busqueda.trim().toLowerCase()
      return !q || p.nombre.toLowerCase().includes(q) || p.codigo_barras?.toLowerCase().includes(q)
    })
    .slice(0, 100)

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
          <Coins className="h-7 w-7 text-stone-600" /> Ajuste de Costo
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Cambia manualmente el costo unitario de un producto y, si quieres, recalcula el costo de sus ventas pasadas.
        </p>
      </div>

      <Card className="bg-amber-50/50 border-amber-200/60">
        <CardContent className="py-3 flex items-start gap-2 text-sm text-amber-800">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Cambiar el costo <strong>revaloriza el inventario al instante</strong>. Si activas
            «Recalcular ventas históricas», se <strong>reescribe el CMV y el margen histórico</strong> del
            rango elegido (todas las ventas quedan con el nuevo costo). Úsalo con cuidado.
          </span>
        </CardContent>
      </Card>

      {/* Producto */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Producto</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input className="pl-9" placeholder="Buscar producto…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          <Select value={productoId} onValueChange={setProductoId}>
            <SelectTrigger><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
            <SelectContent>
              {productosFiltrados.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>)}
            </SelectContent>
          </Select>

          {selectedProducto && (
            <div className="grid gap-4 sm:grid-cols-3 items-end">
              <div className="rounded-lg border bg-stone-50 p-3">
                <p className="text-xs text-stone-500">Costo promedio actual</p>
                <p className="text-2xl font-bold text-stone-800">{formatCurrency(Number(selectedProducto.costo_promedio || 0))}</p>
                <p className="text-xs text-stone-400">Stock: {Number(selectedProducto.stock_total || 0)}</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="costo">Nuevo costo unitario</Label>
                <Input id="costo" type="number" step="0.0001" min="0" value={costoStr} onChange={(e) => setCostoStr(e.target.value)} placeholder="0.00" />
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-stone-500">Valor de inventario</p>
                {preview ? (
                  <p className="text-sm font-medium text-stone-700 flex items-center gap-1">
                    {formatCurrency(preview.valorInvAnterior)}
                    <ArrowRight className="h-3.5 w-3.5 text-stone-400" />
                    <span className="font-bold">{formatCurrency(preview.valorInvNuevo)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-stone-400">—</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recálculo de ventas */}
      {selectedProducto && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recálculo de ventas históricas</CardTitle>
            <CardDescription>
              Opcional. Aplica el nuevo costo al costo congelado de las ventas del producto en el rango
              (afecta el CMV del estado de resultados y el margen del dashboard).
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
              <p className="text-sm text-red-600">Elige un rango de fechas válido (desde ≤ hasta).</p>
            )}

            {/* Preview del impacto en ventas */}
            {recalcular && rangoValido && preview && (
              <div className="rounded-lg border bg-stone-50 p-4 grid gap-3 sm:grid-cols-3 text-sm">
                <div>
                  <p className="text-xs text-stone-500">Ventas afectadas</p>
                  <p className="text-xl font-bold text-stone-800">
                    {previewLoading ? "…" : preview.ventasAfectadas}
                  </p>
                  <p className="text-xs text-stone-400">
                    {preview.cantidadVendida} vendidas − {preview.cantidadDevuelta} devueltas
                  </p>
                </div>
                <div>
                  <p className="text-xs text-stone-500">CMV del rango</p>
                  <p className="text-sm font-medium text-stone-700 flex items-center gap-1">
                    {formatCurrency(preview.cmvAnterior)}
                    <ArrowRight className="h-3.5 w-3.5 text-stone-400" />
                    <span className="font-bold">{formatCurrency(preview.cmvNuevo)}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-stone-500">Cambio en utilidad</p>
                  <p className={`text-lg font-bold flex items-center gap-1 ${preview.deltaUtilidad >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {preview.deltaUtilidad >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {preview.deltaUtilidad >= 0 ? "+" : ""}{formatCurrency(preview.deltaUtilidad)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Motivo + acción */}
      {selectedProducto && (
        <Card>
          <CardContent className="py-4 space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="motivo">Motivo (opcional)</Label>
              <Textarea id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Corrección de costo mal capturado, cambio de proveedor…" rows={2} />
            </div>
            <div className="flex justify-end">
              <Button disabled={!hayCambio || !rangoValido} onClick={() => setConfirmando(true)} className="gap-2">
                <Coins className="h-4 w-4" /> Aplicar cambio de costo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmación */}
      <AlertDialog open={confirmando} onOpenChange={(o) => { if (!saving) setConfirmando(o) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cambio de costo</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>
                  {selectedProducto?.nombre}: costo{" "}
                  <strong>{formatCurrency(Number(selectedProducto?.costo_promedio || 0))}</strong>
                  {" → "}
                  <strong>{formatCurrency(costoNuevo)}</strong>.
                </p>
                {preview && (
                  <p>
                    Valor de inventario: {formatCurrency(preview.valorInvAnterior)} → {formatCurrency(preview.valorInvNuevo)}.
                  </p>
                )}
                {recalcular && rangoValido ? (
                  <>
                    <p>
                      <strong>{preview?.ventasAfectadas ?? 0}</strong> venta(s) del {desde} al {hasta} pasarán a
                      costo {formatCurrency(costoNuevo)}. Esto <strong>reescribe el CMV histórico</strong>
                      {" "}({formatCurrency(preview?.cmvAnterior ?? 0)} → {formatCurrency(preview?.cmvNuevo ?? 0)}).
                    </p>
                    <p className="text-amber-700">
                      Las ventas del rango quedan todas con el mismo costo; si hubo compras a distinto costo en el
                      período, esa variación se pierde.
                    </p>
                  </>
                ) : (
                  <p>El historial de ventas <strong>no se modifica</strong> (solo cambia la valoración de inventario).</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); ejecutar() }} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Aplicando…</> : "Confirmar cambio"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
