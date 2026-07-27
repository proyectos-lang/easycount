"use client"

import * as React from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Trash2, Plus, Minus, Wallet, Landmark, Loader2, AlertTriangle, Save,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { ProductCatalog } from "../../nueva/product-catalog"
import {
  getClientes, getProductos, getMarcas, getCategorias,
  type Cliente, type Producto, type Marca, type Categoria,
} from "@/lib/services/catalogos"
import { getCuentas, type CuentaConfig } from "@/lib/services/cuentas"
import { getStockMultipleProducts } from "@/lib/services/inventario"
import {
  getVentaById, getDetallesVenta, getPagosDetalleVenta, getPagosVenta,
  getLocalizacionVenta, editarVenta,
  type PagoVentaDetalleInput,
} from "@/lib/services/ventas"

interface LineaEdit {
  producto_id: number
  producto_nombre: string
  producto_codigo: string
  cantidad: number
  precio_unitario: number
  costo_promedio: number
  stock_disponible: number // efectivo: stock actual en loc + lo que esta venta ya tenia
}

type PagoLinea = PagoVentaDetalleInput & { _id: string }

function nuevoId() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

export default function EditarVentaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const ventaId = Number(id)
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = React.useState(true)
  const [errorCarga, setErrorCarga] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [confirm, setConfirm] = React.useState(false)

  const [numeroFactura, setNumeroFactura] = React.useState("")
  const [totalAnterior, setTotalAnterior] = React.useState(0)
  const [clientes, setClientes] = React.useState<Cliente[]>([])
  const [productos, setProductos] = React.useState<Producto[]>([])
  const [marcas, setMarcas] = React.useState<Marca[]>([])
  const [categorias, setCategorias] = React.useState<Categoria[]>([])
  const [cuentas, setCuentas] = React.useState<CuentaConfig[]>([])
  const [ubicacion, setUbicacion] = React.useState<{ almacen_id: number | null; localizacion_id: number | null }>({ almacen_id: null, localizacion_id: null })
  const [stockLoc, setStockLoc] = React.useState<Record<number, number>>({})
  const [abonosCount, setAbonosCount] = React.useState(0)

  const [clienteId, setClienteId] = React.useState("")
  const [lineas, setLineas] = React.useState<LineaEdit[]>([])
  const [descuentoPct, setDescuentoPct] = React.useState(0)
  const [aplicaIsv, setAplicaIsv] = React.useState(false)
  const [pagos, setPagos] = React.useState<PagoLinea[]>([])
  const [motivo, setMotivo] = React.useState("")

  React.useEffect(() => {
    async function cargar() {
      setLoading(true)
      const [ventaRes, detRes, pagosDetRes, abonosRes, loc, cli, prod, mar, cat, cue] = await Promise.all([
        getVentaById(ventaId),
        getDetallesVenta(ventaId),
        getPagosDetalleVenta(ventaId),
        getPagosVenta(ventaId),
        getLocalizacionVenta(ventaId),
        getClientes(),
        getProductos(),
        getMarcas(),
        getCategorias(),
        getCuentas(),
      ])
      if (ventaRes.error || !ventaRes.data) {
        setErrorCarga(ventaRes.error || "No se encontró la venta")
        setLoading(false)
        return
      }
      const venta = ventaRes.data
      setNumeroFactura(venta.numero_factura)
      setTotalAnterior(Number(venta.total_venta || 0))
      setClienteId(String(venta.cliente_id))
      setDescuentoPct(Number(venta.descuento || 0))
      setAplicaIsv(!!venta.aplica_impuesto)
      setClientes(cli.data || [])
      setProductos(prod.data || [])
      setMarcas(mar.data || [])
      setCategorias(cat.data || [])
      setCuentas((cue.data || []).filter((c) => c.activo ?? true))
      setUbicacion(loc)
      setAbonosCount((abonosRes.data || []).length)

      const detalles = detRes.data || []
      // Stock efectivo en la localizacion = stock actual + lo que esta venta
      // ya tenia (porque al editar se reversa primero).
      let stockMap: Record<number, number> = {}
      if (loc.localizacion_id) {
        const ids = (prod.data || []).map((p) => p.id!).filter(Boolean)
        const res = await getStockMultipleProducts(ids, loc.localizacion_id)
        stockMap = { ...res.data }
        for (const d of detalles) {
          stockMap[d.producto_id] = (stockMap[d.producto_id] ?? 0) + Number(d.cantidad || 0)
        }
      }
      setStockLoc(stockMap)

      setLineas(
        detalles.map((d) => ({
          producto_id: d.producto_id,
          producto_nombre: d.producto_nombre || "",
          producto_codigo: d.producto_codigo || "",
          cantidad: Number(d.cantidad || 0),
          precio_unitario: Number(d.precio_unitario || 0),
          costo_promedio: Number(d.costo_promedio_momento || 0),
          stock_disponible: stockMap[d.producto_id] ?? Number(d.cantidad || 0),
        }))
      )

      // Siembra el desglose de pago desde ventas_pagos_detalle.
      const pagosSeed = (pagosDetRes.data || []).map((p) => ({
        _id: nuevoId(),
        metodo_pago: p.metodo_pago,
        cuenta_id: p.cuenta_id ?? null,
        monto_bruto: Number(p.monto_bruto || 0),
        porcentaje_comision: Number(p.porcentaje_comision || 0),
        monto_neto: p.monto_neto != null ? Number(p.monto_neto) : undefined,
      }))
      setPagos(pagosSeed)
      setLoading(false)
    }
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ventaId])

  // ---- Totales (misma matematica que Nueva Venta) ----
  const subtotal = lineas.reduce((a, l) => a + l.cantidad * l.precio_unitario, 0)
  const descPct = Math.min(100, Math.max(0, descuentoPct || 0))
  const subtotalNeto = subtotal - subtotal * (descPct / 100)
  const isv = aplicaIsv ? subtotalNeto * 0.15 : 0
  const total = +(subtotalNeto + isv).toFixed(2)
  const totalComisiones = +pagos.reduce((a, p) => {
    const m = Number(p.monto_bruto || 0), c = Number(p.porcentaje_comision || 0)
    return m > 0 && c > 0 ? a + m * (c / 100) : a
  }, 0).toFixed(2)
  const totalNeto = +(total - totalComisiones).toFixed(2)
  const sumaPagosBruto = +pagos.reduce((a, p) => a + Number(p.monto_bruto || 0), 0).toFixed(2)

  function setCantidad(pid: number, cant: number) {
    setLineas((prev) => prev.map((l) => l.producto_id === pid ? { ...l, cantidad: Math.max(0.01, Math.min(cant, l.stock_disponible || cant)) } : l))
  }
  function setPrecio(pid: number, precio: number) {
    setLineas((prev) => prev.map((l) => l.producto_id === pid ? { ...l, precio_unitario: Math.max(0, precio) } : l))
  }
  function quitarLinea(pid: number) {
    setLineas((prev) => prev.filter((l) => l.producto_id !== pid))
  }
  function agregarProducto(p: Producto) {
    setLineas((prev) => {
      if (prev.some((l) => l.producto_id === p.id)) return prev
      return [...prev, {
        producto_id: p.id!,
        producto_nombre: p.nombre,
        producto_codigo: p.codigo_barras || "",
        cantidad: 1,
        precio_unitario: Number(p.precio_venta_sugerido || 0),
        costo_promedio: Number(p.costo_promedio || 0),
        stock_disponible: stockLoc[p.id!] ?? 0,
      }]
    })
  }

  function agregarPago() {
    const restante = Math.max(0, total - sumaPagosBruto)
    const primeraCuenta = cuentas[0]
    setPagos((prev) => [...prev, {
      _id: nuevoId(),
      metodo_pago: primeraCuenta ? "Banco" : "Efectivo",
      cuenta_id: primeraCuenta?.id ?? null,
      porcentaje_comision: Number(primeraCuenta?.porcentaje_comision || 0),
      monto_bruto: +restante.toFixed(2),
      monto_neto: undefined,
    }])
  }
  function actualizarPago(pid: string, patch: Partial<PagoLinea>) {
    setPagos((prev) => prev.map((p) => p._id === pid ? { ...p, ...patch } : p))
  }
  function quitarPago(pid: string) {
    setPagos((prev) => prev.filter((p) => p._id !== pid))
  }

  function validar(): string | null {
    if (!clienteId) return "Selecciona el cliente"
    if (lineas.length === 0) return "La venta debe tener al menos un producto"
    for (const l of lineas) {
      if (l.cantidad <= 0) return `Cantidad inválida en ${l.producto_nombre}`
      if (l.cantidad > l.stock_disponible + 1e-6) return `Stock insuficiente de ${l.producto_nombre} (disp. ${l.stock_disponible})`
    }
    for (const p of pagos) {
      if ((p.metodo_pago === "Banco" || p.metodo_pago === "Link_Pago") && !p.cuenta_id) return "Selecciona la cuenta de un pago por banco"
    }
    if (sumaPagosBruto > total + 0.01) return "El total pagado no puede superar el total de la venta"
    return null
  }

  async function guardar() {
    setSaving(true)
    const res = await editarVenta(ventaId, {
      encabezado: {
        cliente_id: Number(clienteId),
        aplica_impuesto: aplicaIsv,
        porcentaje_impuesto: 15,
        descuento: descPct,
        subtotal: +subtotal.toFixed(2),
        impuesto_total: +isv.toFixed(2),
        total_venta: totalNeto,
      },
      detalles: lineas.map((l) => ({
        producto_id: l.producto_id,
        cantidad: l.cantidad,
        precio_unitario: l.precio_unitario,
        costo_promedio_momento: l.costo_promedio,
        utilidad_linea: +((l.precio_unitario - l.costo_promedio) * l.cantidad).toFixed(2),
      })),
      pagos_detalle: pagos.map(({ _id, ...rest }) => rest),
      motivo: motivo || undefined,
    })
    setSaving(false)
    setConfirm(false)
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" })
      return
    }
    toast({ title: "Venta actualizada", description: `Factura ${numeroFactura} · nuevo total ${formatCurrency(totalNeto)}` })
    router.push("/ventas/historial")
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner className="h-8 w-8" /></div>
  if (errorCarga) {
    return (
      <div className="p-6">
        <Card><CardContent className="py-10 text-center space-y-3">
          <p className="text-stone-600">{errorCarga}</p>
          <Button variant="outline" onClick={() => router.push("/ventas/historial")}>Volver al historial</Button>
        </CardContent></Card>
      </div>
    )
  }

  const errValidacion = validar()

  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/ventas/historial")}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Editar venta {numeroFactura}</h1>
          <p className="text-stone-500 text-sm">El cambio se propaga a inventario, caja, bancos y cuentas por cobrar. La factura conserva su número.</p>
        </div>
      </div>

      {abonosCount > 0 && (
        <Card className="bg-amber-50/60 border-amber-300/60">
          <CardContent className="py-3 flex items-start gap-2 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            Esta factura tiene {abonosCount} abono(s) posterior(es). Al guardar se revertirán (su dinero sale) y deberás registrarlos de nuevo si aplica.
          </CardContent>
        </Card>
      )}

      {/* Cliente + ubicación */}
      <Card>
        <CardContent className="py-4 grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label>Cliente</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                {clientes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label className="text-stone-400">Ubicación (no editable)</Label>
            <p className="text-sm text-stone-600 pt-2">
              La venta mantiene su almacén y localización originales. Para cambiarlos, elimina y crea la venta.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Productos */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Productos</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <ProductCatalog
            productos={productos}
            marcas={marcas}
            categorias={categorias}
            idsEnVenta={lineas.map((l) => l.producto_id)}
            onAdd={agregarProducto}
            localizacionSeleccionada={ubicacion.localizacion_id != null}
            stockPorLocalizacion={stockLoc}
          />
          {lineas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sin productos.</p>
          ) : (
            <div className="space-y-2">
              {lineas.map((l) => (
                <div key={l.producto_id} className="flex items-center gap-2 border rounded-lg p-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{l.producto_nombre}</p>
                    <p className="text-xs text-muted-foreground">Disp. {l.stock_disponible}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setCantidad(l.producto_id, l.cantidad - 1)}><Minus className="h-3 w-3" /></Button>
                    <Input type="number" className="h-7 w-16 text-center" value={l.cantidad} onChange={(e) => setCantidad(l.producto_id, Number(e.target.value) || 0)} />
                    <Button size="icon" variant="outline" className="h-7 w-7" disabled={l.cantidad >= l.stock_disponible} onClick={() => setCantidad(l.producto_id, l.cantidad + 1)}><Plus className="h-3 w-3" /></Button>
                  </div>
                  <div className="w-28">
                    <Input type="number" step="0.01" className="h-7 text-right" value={l.precio_unitario} onChange={(e) => setPrecio(l.producto_id, Number(e.target.value) || 0)} />
                  </div>
                  <div className="w-24 text-right text-sm font-medium">{formatCurrency(l.cantidad * l.precio_unitario)}</div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600" onClick={() => quitarLinea(l.producto_id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Descuento / ISV / Pagos */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Totales y pago</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Descuento (%)</Label>
              <Input type="number" min={0} max={100} value={descuentoPct} onChange={(e) => setDescuentoPct(Number(e.target.value) || 0)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3">
              <Label>Aplicar ISV (15%)</Label>
              <Switch checked={aplicaIsv} onCheckedChange={setAplicaIsv} />
            </div>
          </div>

          {/* Desglose de pago */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Métodos de pago</Label>
              <Button size="sm" variant="outline" onClick={agregarPago} className="gap-1"><Plus className="h-3.5 w-3.5" /> Agregar</Button>
            </div>
            {pagos.length === 0 && <p className="text-xs text-muted-foreground">Sin pagos = venta al crédito (queda por cobrar).</p>}
            {pagos.map((p) => {
              const neto = Number(p.monto_bruto || 0) * (1 - Number(p.porcentaje_comision || 0) / 100)
              return (
                <div key={p._id} className="grid gap-2 sm:grid-cols-[1fr_1fr_120px_auto] items-end border rounded-lg p-2">
                  <div className="grid gap-1">
                    <Label className="text-xs">Método</Label>
                    <Select
                      value={p.metodo_pago}
                      onValueChange={(v) => actualizarPago(p._id, { metodo_pago: v as PagoVentaDetalleInput["metodo_pago"], cuenta_id: null, porcentaje_comision: 0 })}
                    >
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                        <SelectItem value="Banco">Banco / Tarjeta</SelectItem>
                        <SelectItem value="Link_Pago">Link de pago</SelectItem>
                        <SelectItem value="Credito">Crédito</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Cuenta</Label>
                    {(p.metodo_pago === "Banco" || p.metodo_pago === "Link_Pago") ? (
                      <Select
                        value={p.cuenta_id ? String(p.cuenta_id) : ""}
                        onValueChange={(v) => {
                          const c = cuentas.find((x) => String(x.id) === v)
                          actualizarPago(p._id, { cuenta_id: Number(v), porcentaje_comision: Number(c?.porcentaje_comision || 0) })
                        }}
                      >
                        <SelectTrigger className="h-8"><SelectValue placeholder="Cuenta" /></SelectTrigger>
                        <SelectContent>
                          {cuentas.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-8 flex items-center text-xs text-muted-foreground gap-1">
                        {p.metodo_pago === "Efectivo" ? <><Wallet className="h-3.5 w-3.5" /> Caja chica</> : <><Landmark className="h-3.5 w-3.5" /> —</>}
                      </div>
                    )}
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Monto</Label>
                    <Input type="number" step="0.01" className="h-8" value={p.monto_bruto} onChange={(e) => actualizarPago(p._id, { monto_bruto: Math.max(0, Number(e.target.value) || 0), monto_neto: undefined })} />
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => quitarPago(p._id)}><Trash2 className="h-4 w-4" /></Button>
                  {Number(p.porcentaje_comision || 0) > 0 && (
                    <p className="text-[11px] text-muted-foreground sm:col-span-4">Comisión {p.porcentaje_comision}% → neto {formatCurrency(neto)}</p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Resumen */}
          <div className="rounded-lg border p-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            {descPct > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Descuento {descPct}%</span><span>− {formatCurrency(subtotal * descPct / 100)}</span></div>}
            {aplicaIsv && <div className="flex justify-between"><span className="text-muted-foreground">ISV 15%</span><span>{formatCurrency(isv)}</span></div>}
            {totalComisiones > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Comisiones</span><span>− {formatCurrency(totalComisiones)}</span></div>}
            <div className="flex justify-between font-bold text-base border-t pt-1">
              <span>Total {totalComisiones > 0 ? "neto" : ""}</span><span>{formatCurrency(totalNeto)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total anterior: {formatCurrency(totalAnterior)}</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="motivo">Motivo de la edición (opcional)</Label>
            <Textarea id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Corrección de cantidad, cambio de método de pago…" rows={2} />
          </div>

          {errValidacion && <p className="text-sm text-destructive">{errValidacion}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.push("/ventas/historial")}>Cancelar</Button>
            <Button disabled={!!errValidacion} onClick={() => setConfirm(true)} className="gap-2"><Save className="h-4 w-4" /> Guardar cambios</Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirm} onOpenChange={(o) => { if (!saving) setConfirm(o) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar edición</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>Se revertirán los efectos de la venta original y se re-aplicarán con los datos nuevos (inventario, caja, bancos, cuentas por cobrar).</p>
                <p>Total: <strong>{formatCurrency(totalAnterior)}</strong> → <strong>{formatCurrency(totalNeto)}</strong>. La factura conserva el número {numeroFactura}.</p>
                {abonosCount > 0 && <p className="text-amber-700">Se revertirán {abonosCount} abono(s); regístralos de nuevo si aplica.</p>}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); guardar() }} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Guardando…</> : "Confirmar cambios"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
