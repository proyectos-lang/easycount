"use client"

import * as React from "react"
import { Loader2, Pencil, Plus, Trash2, HandCoins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { eliminarLiquidacion, eliminarSocio, guardarSocio, registrarLiquidacion } from "@/app/gestion/actions"
import type { GCuenta, GSocio } from "@/lib/services/gestion"
import { fmtMoneda } from "./ui"

/** Crear / editar socio (nombre, % de participación, correo, notas, activo). */
export function SocioForm({ socio, disponible, trigger }: { socio?: GSocio | null; disponible: number; trigger?: React.ReactNode }) {
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [guardando, setGuardando] = React.useState(false)
  const [activo, setActivo] = React.useState(socio?.activo ?? true)
  const max = Math.round((disponible + (socio?.activo ? socio.porcentaje : 0)) * 100) / 100

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setGuardando(true)
    const res = await guardarSocio({ id: socio?.id, nombre: String(fd.get("nombre") || ""), porcentaje: Number(fd.get("porcentaje") || 0), correo: String(fd.get("correo") || "") || null, notas: String(fd.get("notas") || "") || null, activo })
    setGuardando(false)
    if (res.error) return toast({ title: "No se pudo guardar el socio", description: res.error, variant: "destructive" })
    toast({ title: socio ? "Socio actualizado" : "Socio creado" })
    setOpen(false)
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger ?? <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Nuevo socio</Button>}</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{socio ? "Editar socio" : "Nuevo socio"}</DialogTitle><DialogDescription>Su % de participación se aplica cada mes sobre la utilidad de EasyCount.</DialogDescription></DialogHeader>
          <form onSubmit={enviar} className="grid gap-3">
            <div className="grid gap-1.5"><Label>Nombre</Label><Input name="nombre" defaultValue={socio?.nombre ?? ""} required /></div>
            <div className="grid gap-1.5">
              <Label>% de participación</Label>
              <Input name="porcentaje" type="number" min="0" max="100" step="0.01" defaultValue={socio?.porcentaje ?? ""} required />
              <p className="text-[11px] text-stone-500">Disponible para este socio: hasta {max}% (los socios activos no pueden sumar más de 100%).</p>
            </div>
            <div className="grid gap-1.5"><Label>Correo</Label><Input name="correo" type="email" defaultValue={socio?.correo ?? ""} /></div>
            <div className="grid gap-1.5"><Label>Notas</Label><Textarea name="notas" rows={2} defaultValue={socio?.notas ?? ""} /></div>
            <label className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
              <span>Activo <span className="block text-[11px] text-stone-500">Inactivo: deja de recibir participación, pero conserva su historial y saldo.</span></span>
              <Switch checked={activo} onCheckedChange={setActivo} />
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={guardando}>Cancelar</Button>
              <Button type="submit" disabled={guardando}>{guardando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function BotonEditarSocio({ socio, disponible }: { socio: GSocio; disponible: number }) {
  return <SocioForm socio={socio} disponible={disponible} trigger={<Button size="icon" variant="ghost" className="h-7 w-7 text-stone-400 hover:text-stone-700" aria-label="Editar socio"><Pencil className="h-3.5 w-3.5" /></Button>} />
}

export function EliminarSocio({ id }: { id: number }) {
  const { toast } = useToast()
  async function borrar() {
    if (!confirm("¿Eliminar este socio? Solo es posible si no tiene gastos ni liquidaciones.")) return
    const res = await eliminarSocio(id)
    if (res.error) toast({ title: "No se pudo eliminar", description: res.error, variant: "destructive" })
  }
  return <Button size="icon" variant="ghost" className="h-7 w-7 text-stone-400 hover:text-red-600" onClick={borrar} aria-label="Eliminar socio"><Trash2 className="h-3.5 w-3.5" /></Button>
}

/** Registrar un pago a un socio (a cuenta de su saldo). Precarga el saldo pendiente. */
export function LiquidarSocio({ socio, saldo, periodo, hoy, cuentas, moneda }: { socio: GSocio; saldo: number; periodo: string; hoy: string; cuentas: GCuenta[]; moneda: string }) {
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [guardando, setGuardando] = React.useState(false)
  const [cuentaId, setCuentaId] = React.useState<string>("ninguna")

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const monto = Number(fd.get("monto") || 0)
    if (!(monto > 0)) return toast({ title: "El monto debe ser mayor que cero", variant: "destructive" })
    setGuardando(true)
    const res = await registrarLiquidacion({ socio_id: socio.id, fecha: String(fd.get("fecha") || hoy), monto, periodo: String(fd.get("periodo") || "") || null, cuenta_id: cuentaId === "ninguna" ? null : Number(cuentaId), notas: String(fd.get("notas") || "") || null })
    setGuardando(false)
    if (res.error) return toast({ title: "No se pudo registrar", description: res.error, variant: "destructive" })
    toast({ title: "Liquidación registrada", description: `${socio.nombre}: ${fmtMoneda(monto, moneda)}` })
    setOpen(false)
  }

  return (
    <>
      <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs" onClick={() => setOpen(true)}><HandCoins className="h-3.5 w-3.5" /> Liquidar</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Liquidar a {socio.nombre}</DialogTitle><DialogDescription>Registra lo que se le pagó. Saldo pendiente: {fmtMoneda(saldo, moneda)}.</DialogDescription></DialogHeader>
          <form onSubmit={enviar} className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Fecha</Label><Input name="fecha" type="date" defaultValue={hoy} required /></div>
              <div className="grid gap-1.5"><Label>Monto</Label><Input name="monto" type="number" min="0" step="0.01" defaultValue={saldo > 0 ? saldo : ""} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Período</Label><Input name="periodo" type="month" defaultValue={periodo} /></div>
              <div className="grid gap-1.5"><Label>Cuenta de salida</Label>
                <Select value={cuentaId} onValueChange={setCuentaId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="ninguna">—</SelectItem>{cuentas.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5"><Label>Notas</Label><Textarea name="notas" rows={2} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={guardando}>Cancelar</Button>
              <Button type="submit" disabled={guardando}>{guardando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Registrar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function EliminarLiquidacion({ id }: { id: number }) {
  const { toast } = useToast()
  async function borrar() {
    if (!confirm("¿Eliminar esta liquidación?")) return
    const res = await eliminarLiquidacion(id)
    if (res.error) toast({ title: "No se pudo eliminar", description: res.error, variant: "destructive" })
  }
  return <Button size="icon" variant="ghost" className="h-7 w-7 text-stone-400 hover:text-red-600" onClick={borrar} aria-label="Eliminar liquidación"><Trash2 className="h-3.5 w-3.5" /></Button>
}
