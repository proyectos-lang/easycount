"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Search, RotateCcw, Plus, Minus, Download, Undo2, Loader2, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils/format"
import { exportToXlsx } from "@/lib/utils/export"
import { getVentas, getDetallesVenta, getRazonSocialForPdf, type VentaEncabezado, type VentaDetalle } from "@/lib/services/ventas"
import { getCuentas, type CuentaConfig } from "@/lib/services/cuentas"
import { getClientes } from "@/lib/services/catalogos"
import {
  crearDevolucion, getDevoluciones, getCantidadesDevueltasPorVenta, getDetallesDevolucion,
  type DevolucionEncabezado,
} from "@/lib/services/devoluciones"
import { generarFacturaPdf, type FacturaPdfLinea } from "@/lib/utils/factura-pdf"
import { hoyISO } from "@/lib/utils/fecha"

interface LineaDev extends VentaDetalle {
  ya_devuelto: number
  a_devolver: number
}

export default function DevolucionesPage() {
  const { toast } = useToast()
  const [ventas, setVentas] = useState<VentaEncabezado[]>([])
  const [cuentas, setCuentas] = useState<CuentaConfig[]>([])
  const [busqueda, setBusqueda] = useState("")

  const [ventaSel, setVentaSel] = useState<VentaEncabezado | null>(null)
  const [lineas, setLineas] = useState<LineaDev[]>([])
  const [loadingLineas, setLoadingLineas] = useState(false)

  const [destinoTipo, setDestinoTipo] = useState<"caja" | "cuenta">("caja")
  const [cuentaId, setCuentaId] = useState<string>("")
  const [motivo, setMotivo] = useState("")

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [devoluciones, setDevoluciones] = useState<DevolucionEncabezado[]>([])
  const [loadingHist, setLoadingHist] = useState(true)

  // RTN de clientes por id (para la factura de devolucion) e id en generacion.
  const [clientesRtn, setClientesRtn] = useState<Record<number, string>>({})
  const [generandoFactura, setGenerandoFactura] = useState<number | null>(null)

  const cargarHistorial = useCallback(async () => {
    setLoadingHist(true)
    const r = await getDevoluciones()
    if (r.error) toast({ title: "Aviso", description: r.error, variant: "destructive" })
    setDevoluciones(r.data)
    setLoadingHist(false)
  }, [toast])

  useEffect(() => {
    getVentas().then((r) => setVentas(r.data || []))
    getCuentas().then((r) => setCuentas((r.data || []).filter((c) => c.activo !== false)))
    getClientes().then((r) => {
      const mapa: Record<number, string> = {}
      for (const c of r.data || []) if (c.id != null) mapa[c.id] = c.rtn || ""
      setClientesRtn(mapa)
    })
    cargarHistorial()
  }, [cargarHistorial])

  const ventasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return ventas.slice(0, 30)
    return ventas
      .filter((v) =>
        (v.numero_factura || "").toLowerCase().includes(q) ||
        (v.cliente_nombre || "").toLowerCase().includes(q)
      )
      .slice(0, 30)
  }, [ventas, busqueda])

  async function seleccionarVenta(v: VentaEncabezado) {
    setVentaSel(v)
    setLineas([])
    setLoadingLineas(true)
    const [detRes, devRes] = await Promise.all([
      getDetallesVenta(v.id!),
      getCantidadesDevueltasPorVenta(v.id!),
    ])
    const yaDev = devRes.data
    setLineas(
      (detRes.data || []).map((d) => ({
        ...d,
        ya_devuelto: yaDev[d.id!] || 0,
        a_devolver: 0,
      }))
    )
    setLoadingLineas(false)
  }

  function setCantidad(detalleId: number, val: number) {
    setLineas((prev) =>
      prev.map((l) => {
        if (l.id !== detalleId) return l
        const max = Number(l.cantidad) - l.ya_devuelto
        const a = Math.max(0, Math.min(val, max))
        return { ...l, a_devolver: a }
      })
    )
  }

  const montoTotal = useMemo(
    () => +lineas.reduce((a, l) => a + l.a_devolver * Number(l.precio_unitario || 0), 0).toFixed(2),
    [lineas]
  )
  const hayLineas = lineas.some((l) => l.a_devolver > 0)

  function validarAntesDeConfirmar(): boolean {
    if (!ventaSel) return false
    if (!hayLineas) {
      toast({ title: "Sin productos", description: "Selecciona cantidades a devolver", variant: "destructive" })
      return false
    }
    if (destinoTipo === "cuenta" && !cuentaId) {
      toast({ title: "Falta cuenta", description: "Selecciona la cuenta del reembolso", variant: "destructive" })
      return false
    }
    return true
  }

  async function ejecutarDevolucion() {
    if (!ventaSel) return
    setSaving(true)
    const res = await crearDevolucion({
      venta_id: ventaSel.id!,
      lineas: lineas
        .filter((l) => l.a_devolver > 0)
        .map((l) => ({
          venta_detalle_id: l.id!,
          producto_id: l.producto_id,
          cantidad_devuelta: l.a_devolver,
          precio_unitario: Number(l.precio_unitario || 0),
          costo_promedio_momento: Number(l.costo_promedio_momento || 0),
        })),
      destino: { tipo: destinoTipo, cuenta_id: destinoTipo === "cuenta" ? Number(cuentaId) : null },
      motivo: motivo || undefined,
    })
    setSaving(false)
    setConfirmOpen(false)

    if (res.error && !res.data) {
      toast({ title: "Error", description: res.error, variant: "destructive" })
      return
    }
    if (res.error && res.data) {
      // Devolución hecha pero el reembolso falló.
      toast({ title: "Devolución parcial", description: res.error, variant: "destructive" })
    } else {
      toast({ title: "Devolución registrada", description: `${res.data?.numero_devolucion} · ${formatCurrency(montoTotal)}` })
    }

    // Factura de devolución (mismo formato que la factura normal), con los
    // productos específicos devueltos. Se arma con los datos aún en pantalla.
    if (res.data) {
      const cuentaNombre = destinoTipo === "cuenta" ? cuentas.find((c) => c.id === Number(cuentaId))?.nombre : null
      await generarFacturaDevolucion({
        numeroDevolucion: res.data.numero_devolucion,
        numeroFactura: ventaSel.numero_factura || "",
        clienteNombre: ventaSel.cliente_nombre || "N/A",
        clienteRtn: clientesRtn[ventaSel.cliente_id] || null,
        lineas: lineas
          .filter((l) => l.a_devolver > 0)
          .map((l) => ({ nombre: l.producto_nombre || "", cantidad: l.a_devolver, precioUnitario: Number(l.precio_unitario || 0) })),
        monto: montoTotal,
        reembolsoMetodo: destinoTipo === "caja" ? "Efectivo (caja chica)" : `Cuenta bancaria${cuentaNombre ? " - " + cuentaNombre : ""}`,
        motivo: motivo || null,
      })
    }

    // Reset
    setVentaSel(null); setLineas([]); setMotivo(""); setCuentaId(""); setDestinoTipo("caja")
    cargarHistorial()
  }

  function exportarHistorial() {
    if (devoluciones.length === 0) {
      toast({ title: "Sin datos", description: "No hay devoluciones para exportar", variant: "destructive" })
      return
    }
    const rows: Record<string, unknown>[] = devoluciones.map((d) => ({
      Devolucion: d.numero_devolucion || "",
      Fecha: d.fecha?.split("T")[0] || "",
      Factura: d.numero_factura || "",
      Cliente: d.cliente_nombre || "",
      Monto: Number(d.monto_total || 0),
      Reembolso: d.destino_reembolso,
      Motivo: d.motivo || "",
    }))
    exportToXlsx(rows, { sheetName: "Devoluciones", filename: "Devoluciones", colWidths: [12, 12, 14, 22, 14, 12, 30] })
    toast({ title: "Exportado", description: "El archivo Excel se descargo correctamente" })
  }

  // Genera y descarga la factura de devolucion (mismo layout que la factura normal).
  async function generarFacturaDevolucion(opts: {
    numeroDevolucion: string
    numeroFactura: string
    clienteNombre: string
    clienteRtn: string | null
    lineas: FacturaPdfLinea[]
    monto: number
    reembolsoMetodo: string
    motivo: string | null
    fecha?: string
  }) {
    const empresa = await getRazonSocialForPdf()
    const res = await generarFacturaPdf({
      tipo: "devolucion",
      empresa,
      numeroDocumento: opts.numeroDevolucion,
      facturaReferencia: opts.numeroFactura,
      clienteNombre: opts.clienteNombre,
      clienteRtn: opts.clienteRtn,
      fecha: opts.fecha || hoyISO(),
      lineas: opts.lineas,
      subtotal: opts.monto,
      mostrarIsv: false,
      total: opts.monto,
      reembolsoMetodo: opts.reembolsoMetodo,
      motivo: opts.motivo,
      filename: `Devolucion_${opts.numeroDevolucion}`,
    })
    if (!res.ok) {
      toast({ title: "Error", description: res.error || "No se pudo generar la factura de devolucion", variant: "destructive" })
    }
  }

  // Reimprime la factura de una devolucion del historial (trae sus lineas).
  async function reimprimirFactura(d: DevolucionEncabezado) {
    setGenerandoFactura(d.id)
    try {
      const det = await getDetallesDevolucion(d.id)
      if (det.error) {
        toast({ title: "Error", description: det.error, variant: "destructive" })
        return
      }
      await generarFacturaDevolucion({
        numeroDevolucion: d.numero_devolucion || "",
        numeroFactura: d.numero_factura || "",
        clienteNombre: d.cliente_nombre || "N/A",
        clienteRtn: d.cliente_rtn || null,
        lineas: det.data.map((l) => ({ nombre: l.producto_nombre, cantidad: l.cantidad_devuelta, precioUnitario: l.precio_unitario })),
        monto: Number(d.monto_total || 0),
        reembolsoMetodo: d.destino_reembolso === "caja" ? "Efectivo (caja chica)" : "Cuenta bancaria",
        motivo: d.motivo || null,
        fecha: d.fecha,
      })
    } finally {
      setGenerandoFactura(null)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800">Devoluciones</h1>
        <p className="text-stone-500 text-sm mt-1">
          Toma una factura, elige las cantidades a devolver y reembolsa el dinero.
        </p>
      </div>

      <Tabs defaultValue="nueva">
        <TabsList>
          <TabsTrigger value="nueva">Nueva devolución</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        {/* ---------- NUEVA DEVOLUCIÓN ---------- */}
        <TabsContent value="nueva" className="space-y-4">
          {!ventaSel ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Buscar factura</CardTitle>
                <CardDescription>Por número de factura o cliente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    className="pl-9"
                    placeholder="FC-0001 o nombre del cliente…"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
                <div className="overflow-x-auto">
                  <Table containerClassName="max-h-[60vh] overflow-y-auto">
                    <TableHeader sticky>
                      <TableRow>
                        <TableHead>Factura</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ventasFiltradas.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Sin resultados</TableCell></TableRow>
                      ) : ventasFiltradas.map((v) => (
                        <TableRow key={v.id} className="cursor-pointer hover:bg-muted/50" onClick={() => seleccionarVenta(v)}>
                          <TableCell className="font-mono">{v.numero_factura}</TableCell>
                          <TableCell>{v.cliente_nombre}</TableCell>
                          <TableCell className="text-sm">{v.fecha_venta?.split("T")[0]}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(v.total_venta || 0))}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost"><RotateCcw className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Factura {ventaSel.numero_factura}</CardTitle>
                    <CardDescription>{ventaSel.cliente_nombre} · {ventaSel.fecha_venta?.split("T")[0]}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setVentaSel(null); setLineas([]) }}>
                    Cambiar factura
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingLineas ? (
                    <div className="flex justify-center py-10"><Spinner className="h-6 w-6" /></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-center">Vendido</TableHead>
                            <TableHead className="text-center">Ya devuelto</TableHead>
                            <TableHead className="text-right">Precio</TableHead>
                            <TableHead className="text-center">A devolver</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lineas.map((l) => {
                            const max = Number(l.cantidad) - l.ya_devuelto
                            return (
                              <TableRow key={l.id}>
                                <TableCell>
                                  <p className="font-medium">{l.producto_nombre}</p>
                                  <p className="text-xs text-muted-foreground font-mono">{l.producto_codigo}</p>
                                </TableCell>
                                <TableCell className="text-center">{Number(l.cantidad)}</TableCell>
                                <TableCell className="text-center text-muted-foreground">{l.ya_devuelto}</TableCell>
                                <TableCell className="text-right">{formatCurrency(Number(l.precio_unitario || 0))}</TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center gap-1">
                                    <Button size="icon" variant="outline" className="h-7 w-7" disabled={l.a_devolver <= 0} onClick={() => setCantidad(l.id!, l.a_devolver - 1)}>
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <Input
                                      className="h-7 w-16 text-center"
                                      type="number"
                                      min={0}
                                      step="any"
                                      max={max}
                                      value={l.a_devolver}
                                      onChange={(e) => setCantidad(l.id!, Number(e.target.value))}
                                    />
                                    <Button size="icon" variant="outline" className="h-7 w-7" disabled={l.a_devolver >= max} onClick={() => setCantidad(l.id!, l.a_devolver + 1)}>
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  {max === 0 && <p className="text-[10px] text-center text-muted-foreground mt-1">Sin saldo</p>}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrency(l.a_devolver * Number(l.precio_unitario || 0))}
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

              <Card>
                <CardHeader><CardTitle className="text-base">Reembolso</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Devolver dinero a</Label>
                      <Select value={destinoTipo} onValueChange={(v) => setDestinoTipo(v as "caja" | "cuenta")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="caja">Caja Chica (efectivo)</SelectItem>
                          <SelectItem value="cuenta">Cuenta bancaria</SelectItem>
                        </SelectContent>
                      </Select>
                      {destinoTipo === "caja" && (
                        <p className="text-xs text-amber-600">Requiere una sesión de caja abierta.</p>
                      )}
                    </div>
                    {destinoTipo === "cuenta" && (
                      <div className="grid gap-2">
                        <Label>Cuenta</Label>
                        <Select value={cuentaId} onValueChange={setCuentaId}>
                          <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                          <SelectContent>
                            {cuentas.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="motivo">Motivo (opcional)</Label>
                    <Textarea id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Producto defectuoso, error de facturación…" />
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total a reembolsar</p>
                      <p className="text-2xl font-bold text-stone-800">{formatCurrency(montoTotal)}</p>
                    </div>
                    <Button
                      size="lg"
                      className="gap-2"
                      disabled={!hayLineas}
                      onClick={() => { if (validarAntesDeConfirmar()) setConfirmOpen(true) }}
                    >
                      <Undo2 className="h-4 w-4" /> Procesar devolución
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ---------- HISTORIAL ---------- */}
        <TabsContent value="historial" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" className="gap-2" onClick={exportarHistorial}>
              <Download className="h-4 w-4" /> Exportar a Excel
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {loadingHist ? (
                <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
              ) : devoluciones.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">Aún no hay devoluciones registradas.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table containerClassName="max-h-[60vh] overflow-y-auto">
                    <TableHeader sticky>
                      <TableRow>
                        <TableHead>Devolución</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Factura</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Reembolso</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="text-right">Factura</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {devoluciones.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-mono">{d.numero_devolucion}</TableCell>
                          <TableCell className="text-sm">{d.fecha?.split("T")[0]}</TableCell>
                          <TableCell className="font-mono">{d.numero_factura}</TableCell>
                          <TableCell>{d.cliente_nombre}</TableCell>
                          <TableCell><Badge variant="secondary">{d.destino_reembolso === "caja" ? "Efectivo" : "Banco"}</Badge></TableCell>
                          <TableCell className="text-right font-medium text-red-700">{formatCurrency(Number(d.monto_total || 0))}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1"
                              disabled={generandoFactura === d.id}
                              onClick={() => reimprimirFactura(d)}
                              title="Descargar factura de devolución"
                            >
                              {generandoFactura === d.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                              <span className="hidden sm:inline">Factura</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmación */}
      <AlertDialog open={confirmOpen} onOpenChange={(o) => { if (!saving) setConfirmOpen(o) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar devolución</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>Se devolverán al inventario:</p>
                <ul className="list-disc pl-5">
                  {lineas.filter((l) => l.a_devolver > 0).map((l) => (
                    <li key={l.id}>{l.a_devolver} × {l.producto_nombre}</li>
                  ))}
                </ul>
                <p className="pt-2">
                  Se reembolsarán <strong>{formatCurrency(montoTotal)}</strong> vía{" "}
                  <strong>{destinoTipo === "caja" ? "efectivo (caja chica)" : "cuenta bancaria"}</strong>.
                  La factura original no se modifica.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); ejecutarDevolucion() }}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Procesando…</> : "Confirmar devolución"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
