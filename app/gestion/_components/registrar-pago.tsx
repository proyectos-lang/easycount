"use client"

import * as React from "react"
import { Loader2, Landmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ETIQUETA_METODO, METODOS_PAGO, proximoPago, periodoCubierto, type Ciclo, type MetodoPago } from "@/lib/gestion/reglas"
import { registrarPago } from "@/app/gestion/actions"
import { fmtFecha, fmtMoneda } from "./ui"

export interface EmpresaLite { id: number; nombre: string; cuota: number; ciclo_cobro: Ciclo; dia_cobro: number | null; fecha_proximo_pago: string | null; estado: string }
export interface CuentaLite { id: number; nombre: string; banco: string | null; moneda: string; activo: boolean }

/** Panel lateral "Registrar pago" (global: se abre desde cualquier pantalla). */
export function RegistrarPagoSheet({ abierto, onOpenChange, empresas, cuentas, moneda, hoy, empresaInicial }: {
  abierto: boolean
  onOpenChange: (o: boolean) => void
  empresas: EmpresaLite[]
  cuentas: CuentaLite[]
  moneda: string
  hoy: string
  empresaInicial?: number | null
}) {
  const { toast } = useToast()
  const inicial = empresas.find((e) => e.id === empresaInicial) ?? null
  const [empresaId, setEmpresaId] = React.useState<string>(inicial ? String(inicial.id) : "")
  const [fecha, setFecha] = React.useState(hoy)
  const [monto, setMonto] = React.useState<string>(inicial ? String(inicial.cuota || "") : "")
  const [metodo, setMetodo] = React.useState<MetodoPago>("transferencia")
  const [referencia, setReferencia] = React.useState("")
  const [cuentaId, setCuentaId] = React.useState<number | null>(cuentas.find((c) => c.activo)?.id ?? null)
  const [ciclo, setCiclo] = React.useState<Ciclo>(inicial?.ciclo_cobro ?? "mensual")
  const [observaciones, setObservaciones] = React.useState("")
  const [guardando, setGuardando] = React.useState(false)

  const empresa = empresas.find((e) => String(e.id) === empresaId) ?? null
  // Al elegir la empresa se precargan cuota, ciclo y se muestra su próxima fecha.
  function elegirEmpresa(v: string) {
    setEmpresaId(v)
    const e = empresas.find((x) => String(x.id) === v)
    if (e) { setMonto(String(e.cuota || "")); setCiclo(e.ciclo_cobro) }
  }
  const proximo = fecha ? proximoPago(fecha, ciclo, empresa?.dia_cobro ?? null) : null
  const periodo = fecha ? periodoCubierto(fecha, ciclo, empresa?.dia_cobro ?? null) : null

  async function guardar() {
    if (!empresa) return toast({ title: "Elige la empresa", variant: "destructive" })
    const m = Number(monto)
    if (!(m > 0)) return toast({ title: "El monto debe ser mayor que cero", variant: "destructive" })
    if (!fecha) return toast({ title: "Indica la fecha del pago", variant: "destructive" })
    setGuardando(true)
    const res = await registrarPago({ empresa_id: empresa.id, fecha, monto: m, metodo, cuenta_id: cuentaId, referencia: referencia || null, observaciones: observaciones || null, ciclo_aplicado: ciclo })
    setGuardando(false)
    if (!res.data) return toast({ title: "No se pudo registrar el pago", description: res.error ?? "Error desconocido", variant: "destructive" })
    toast({ title: "Pago registrado", description: `${empresa.nombre} · próximo pago ${fmtFecha(res.data.proximo_pago)}` })
    onOpenChange(false)
  }

  return (
    <Sheet open={abierto} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Registrar pago</SheetTitle>
          <SheetDescription>Registra la mensualidad o anualidad recibida. El próximo pago se calcula solo.</SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4 px-4 pb-6">
          <div className="grid gap-1.5">
            <Label>Empresa</Label>
            <Select value={empresaId} onValueChange={elegirEmpresa}>
              <SelectTrigger><SelectValue placeholder="Seleccionar empresa…" /></SelectTrigger>
              <SelectContent>
                {empresas.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
            {empresa && (
              <p className="text-[11px] text-stone-500">
                Cuota {fmtMoneda(empresa.cuota, moneda)} · {empresa.ciclo_cobro === "anual" ? "anual" : `mensual, día ${empresa.dia_cobro ?? "—"}`} · próximo pago actual {fmtFecha(empresa.fecha_proximo_pago)}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Fecha del pago</Label><Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Monto ({moneda})</Label><Input type="number" min="0" step="0.01" inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Método</Label>
              <Select value={metodo} onValueChange={(v) => setMetodo(v as MetodoPago)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{METODOS_PAGO.map((m) => <SelectItem key={m} value={m}>{ETIQUETA_METODO[m]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Referencia</Label><Input value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="N.º de transferencia" /></div>
          </div>
          <div className="grid gap-1.5">
            <Label>Cuenta que recibió el pago</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {cuentas.filter((c) => c.activo).map((c) => (
                <button
                  key={c.id} type="button" onClick={() => setCuentaId(c.id)}
                  className={cn("rounded-lg border p-2.5 text-left transition-colors", cuentaId === c.id ? "border-stone-800 bg-stone-800 text-white" : "border-stone-200 bg-white hover:bg-stone-50")}
                >
                  <Landmark className="h-4 w-4 mb-1 opacity-70" />
                  <p className="text-xs font-semibold leading-tight">{c.nombre}</p>
                  <p className={cn("text-[10px]", cuentaId === c.id ? "text-stone-300" : "text-stone-400")}>{c.moneda}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Tipo de cobro</Label>
            <div className="inline-flex rounded-lg border bg-stone-50 p-1 text-sm">
              {(["mensual", "anual"] as Ciclo[]).map((c) => (
                <button key={c} type="button" onClick={() => setCiclo(c)} className={cn("rounded-md px-4 py-1.5 font-medium transition-colors", ciclo === c ? "bg-white shadow-sm text-stone-800" : "text-stone-500 hover:text-stone-700")}>
                  {c === "mensual" ? "Mensual" : "Anual"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-1.5"><Label>Observaciones</Label><Textarea rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} /></div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Cálculo automático</p>
            <div className="mt-1.5 grid grid-cols-2 gap-2 text-stone-700">
              <div><p className="text-[11px] text-stone-500">Fecha del pago</p><p className="font-medium">{fmtFecha(fecha)}</p></div>
              <div><p className="text-[11px] text-stone-500">Próximo pago</p><p className="font-medium text-emerald-800">{fmtFecha(proximo)}</p></div>
              <div className="col-span-2"><p className="text-[11px] text-stone-500">Período cubierto</p><p className="font-medium">{periodo ? `${fmtFecha(periodo.desde)} – ${fmtFecha(periodo.hasta)}` : "—"}</p></div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={guardando}>Cancelar</Button>
            <Button onClick={guardar} disabled={guardando || !empresa} className="bg-emerald-600 hover:bg-emerald-700">
              {guardando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Registrar pago
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
