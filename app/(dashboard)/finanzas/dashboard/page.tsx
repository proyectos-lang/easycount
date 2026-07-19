"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Landmark, Wallet, TrendingUp, TrendingDown, DollarSign, Scale,
  ArrowRightLeft, Plus, Minus,
} from "lucide-react"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils/format"
import {
  getFinanzasResumen, getFlujoCajaMensual,
  type FinanzasResumen, type FlujoMes,
} from "@/lib/services/finanzas-dashboard"
import { getCuentas, registrarMovimientoCuenta, transferirEntreCuentas, type CuentaConfig } from "@/lib/services/cuentas"
import { registrarMovimientoCaja } from "@/lib/services/caja-chica"

export default function DashboardFinanzasPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [resumen, setResumen] = useState<FinanzasResumen | null>(null)
  const [flujo, setFlujo] = useState<FlujoMes[]>([])
  const [cuentas, setCuentas] = useState<CuentaConfig[]>([])
  const anio = new Date().getFullYear()

  const cargar = useCallback(async () => {
    setLoading(true)
    const [res, fl, cs] = await Promise.all([
      getFinanzasResumen(),
      getFlujoCajaMensual(anio),
      getCuentas(),
    ])
    setResumen(res.data)
    setFlujo(fl.data)
    setCuentas((cs.data || []).filter((c) => c.activo !== false))
    setLoading(false)
  }, [anio])

  useEffect(() => {
    cargar()
  }, [cargar])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Dashboard de Finanzas</h1>
          <p className="text-stone-500 text-sm mt-1">Saldos, cartera y flujo de caja del negocio.</p>
        </div>
        <div className="flex gap-2">
          <MovimientoDialog cuentas={cuentas} onDone={cargar} />
          <TransferenciaDialog cuentas={cuentas} onDone={cargar} />
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Ventas del Mes" value={resumen?.ventasDelMes} loading={loading} color="#5D7B6F" icon={<DollarSign className="h-4 w-4" />} />
        <KpiCard title="Por Cobrar (CxC)" value={resumen?.cxcPendiente} loading={loading} color="#7C9A92" icon={<TrendingUp className="h-4 w-4" />} />
        <KpiCard title="Por Pagar (CxP)" value={resumen?.cxpPendiente} loading={loading} color="#C07A5C" icon={<TrendingDown className="h-4 w-4" />} />
        <KpiCard title="Balance de Bancos" value={resumen?.balanceBancos} loading={loading} color="#D4A574" icon={<Scale className="h-4 w-4" />} hint="Bancos + Caja + CxC − CxP" />
      </div>

      {/* Saldos por cuenta + caja */}
      <div>
        <h2 className="text-lg font-semibold text-stone-700 mb-3">Saldos por cuenta</h2>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {loading ? (
            [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
          ) : (
            <>
              {(resumen?.cuentas || []).map((c) => (
                <Card key={c.cuenta_id} className="border-l-4 border-l-sky-500">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm text-stone-500 truncate">{c.nombre}</CardTitle>
                    <Landmark className="h-4 w-4 text-sky-600 shrink-0" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold text-stone-800">{formatCurrency(c.saldo)}</p>
                  </CardContent>
                </Card>
              ))}
              <Card className="border-l-4 border-l-amber-500">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm text-stone-500">Caja Chica</CardTitle>
                  <Wallet className="h-4 w-4 text-amber-600 shrink-0" />
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-stone-800">{formatCurrency(resumen?.saldoCaja || 0)}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Flujo de caja mensual */}
      <Card>
        <CardHeader>
          <CardTitle>Flujo de caja {anio}</CardTitle>
          <CardDescription>Dinero real entrado vs. salido por mes (excluye transferencias internas).</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={flujo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="mes_nombre" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `L${v}`} tick={{ fontSize: 12 }} width={70} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="entradas" name="Entradas" fill="#5D7B6F" radius={[6, 6, 0, 0]} />
                <Bar dataKey="salidas" name="Salidas" fill="#C07A5C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function KpiCard({ title, value, loading, color, icon, hint }: {
  title: string; value?: number; loading: boolean; color: string; icon: React.ReactNode; hint?: string
}) {
  return (
    <Card className="border-l-4" style={{ borderLeftColor: color }}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-stone-500">{title}</CardTitle>
        <span className="rounded-lg p-1.5" style={{ backgroundColor: `${color}22`, color }}>{icon}</span>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-7 w-24" /> : (
          <p className="text-2xl font-bold text-stone-800">{formatCurrency(value || 0)}</p>
        )}
        {hint && <p className="text-xs text-stone-400 mt-1">{hint}</p>}
      </CardContent>
    </Card>
  )
}

// ============ Diálogo: entrada/salida a cuenta o caja ============
function MovimientoDialog({ cuentas, onDone }: { cuentas: CuentaConfig[]; onDone: () => void }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [destino, setDestino] = useState("caja") // "caja" | id de cuenta
  const [tipo, setTipo] = useState<"entrada" | "salida">("entrada")
  const [monto, setMonto] = useState("")
  const [concepto, setConcepto] = useState("")

  function reset() {
    setDestino("caja"); setTipo("entrada"); setMonto(""); setConcepto("")
  }

  async function guardar() {
    const m = Number(monto)
    if (!m || m <= 0) {
      toast({ title: "Error", description: "Ingrese un monto válido", variant: "destructive" })
      return
    }
    setSaving(true)
    let error: string | null = null
    if (destino === "caja") {
      const res = await registrarMovimientoCaja({
        tipo: tipo === "entrada" ? "Ingreso_Manual" : "Salida",
        monto: m,
        concepto: concepto || (tipo === "entrada" ? "Ingreso manual" : "Salida manual"),
      })
      error = res.error
    } else {
      const res = await registrarMovimientoCuenta({
        cuenta_id: Number(destino),
        tipo: tipo === "entrada" ? "Ingreso" : "Egreso",
        monto: m,
        concepto: concepto || (tipo === "entrada" ? "Ingreso manual" : "Salida manual"),
      })
      error = res.error
    }
    setSaving(false)
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" })
      return
    }
    toast({ title: "Movimiento registrado", description: formatCurrency(m) })
    setOpen(false); reset(); onDone()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Movimiento
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar movimiento</DialogTitle>
          <DialogDescription>Entrada o salida de dinero de una cuenta o de la caja chica.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Destino</Label>
            <Select value={destino} onValueChange={setDestino}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="caja">Caja Chica (efectivo)</SelectItem>
                {cuentas.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as "entrada" | "salida")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada (Ingreso)</SelectItem>
                <SelectItem value="salida">Salida (Egreso)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mov-monto">Monto (L)</Label>
            <Input id="mov-monto" type="number" min={0} step={0.01} value={monto} onChange={(e) => setMonto(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mov-concepto">Concepto</Label>
            <Input id="mov-concepto" value={concepto} onChange={(e) => setConcepto(e.target.value)} placeholder="Opcional" />
          </div>
          {destino === "caja" && (
            <p className="text-xs text-amber-600">Requiere una sesión de caja chica abierta.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={guardar} disabled={saving}>
            {tipo === "entrada" ? <Plus className="h-4 w-4 mr-1" /> : <Minus className="h-4 w-4 mr-1" />}
            {saving ? "Guardando…" : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============ Diálogo: transferencia entre cuentas ============
function TransferenciaDialog({ cuentas, onDone }: { cuentas: CuentaConfig[]; onDone: () => void }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [origen, setOrigen] = useState("")
  const [destino, setDestino] = useState("")
  const [monto, setMonto] = useState("")

  function reset() { setOrigen(""); setDestino(""); setMonto("") }

  async function guardar() {
    const m = Number(monto)
    if (!origen || !destino) {
      toast({ title: "Error", description: "Seleccione cuenta origen y destino", variant: "destructive" }); return
    }
    if (origen === destino) {
      toast({ title: "Error", description: "Origen y destino deben ser distintos", variant: "destructive" }); return
    }
    if (!m || m <= 0) {
      toast({ title: "Error", description: "Ingrese un monto válido", variant: "destructive" }); return
    }
    setSaving(true)
    const res = await transferirEntreCuentas({ origen_id: Number(origen), destino_id: Number(destino), monto: m })
    setSaving(false)
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" }); return
    }
    toast({ title: "Transferencia registrada", description: formatCurrency(m) })
    setOpen(false); reset(); onDone()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <ArrowRightLeft className="h-4 w-4" /> Transferencia
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transferencia entre cuentas</DialogTitle>
          <DialogDescription>Mueve dinero de una cuenta bancaria a otra.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Cuenta origen</Label>
            <Select value={origen} onValueChange={setOrigen}>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                {cuentas.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Cuenta destino</Label>
            <Select value={destino} onValueChange={setDestino}>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                {cuentas.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tr-monto">Monto (L)</Label>
            <Input id="tr-monto" type="number" min={0} step={0.01} value={monto} onChange={(e) => setMonto(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={guardar} disabled={saving}>{saving ? "Transfiriendo…" : "Transferir"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
