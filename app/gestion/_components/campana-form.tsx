"use client"

import * as React from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ETIQUETA_PLATAFORMA, PLATAFORMAS_CAMPANA } from "@/lib/gestion/reglas"
import { eliminarCampana, guardarCampana } from "@/app/gestion/actions"
import type { GCampana } from "@/lib/services/gestion"

export function CampanaForm({ campana, trigger }: { campana?: GCampana | null; trigger?: React.ReactNode }) {
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [guardando, setGuardando] = React.useState(false)
  const [plataforma, setPlataforma] = React.useState(campana?.plataforma ?? "meta_ads")

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const v = (k: string) => String(fd.get(k) || "")
    if (!v("nombre").trim()) return toast({ title: "El nombre es obligatorio", variant: "destructive" })
    setGuardando(true)
    const res = await guardarCampana({
      id: campana?.id, nombre: v("nombre"), plataforma, fecha_inicio: v("fecha_inicio") || null, fecha_fin: v("fecha_fin") || null,
      monto_invertido: Number(v("monto_invertido")) || 0, prospectos_generados: Number(v("prospectos_generados")) || 0, reuniones_generadas: Number(v("reuniones_generadas")) || 0, clientes_obtenidos: Number(v("clientes_obtenidos")) || 0,
    })
    setGuardando(false)
    if (res.error) return toast({ title: "No se pudo guardar", description: res.error, variant: "destructive" })
    toast({ title: campana ? "Campaña actualizada" : "Campaña creada" })
    setOpen(false)
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger ?? <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Nueva campaña</Button>}</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{campana ? "Editar campaña" : "Nueva campaña"}</DialogTitle><DialogDescription>Inversión y resultados de cada campaña de publicidad.</DialogDescription></DialogHeader>
          <form onSubmit={enviar} className="grid gap-3">
            <div className="grid gap-1.5"><Label>Nombre</Label><Input name="nombre" defaultValue={campana?.nombre ?? ""} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Plataforma</Label>
                <Select value={plataforma} onValueChange={setPlataforma}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PLATAFORMAS_CAMPANA.map((p) => <SelectItem key={p} value={p}>{ETIQUETA_PLATAFORMA[p]}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="grid gap-1.5"><Label>Monto invertido</Label><Input name="monto_invertido" type="number" min="0" step="0.01" defaultValue={campana?.monto_invertido ?? ""} /></div>
              <div className="grid gap-1.5"><Label>Inicio</Label><Input name="fecha_inicio" type="date" defaultValue={campana?.fecha_inicio ?? ""} /></div>
              <div className="grid gap-1.5"><Label>Fin</Label><Input name="fecha_fin" type="date" defaultValue={campana?.fecha_fin ?? ""} /></div>
              <div className="grid gap-1.5"><Label>Prospectos generados</Label><Input name="prospectos_generados" type="number" min="0" defaultValue={campana?.prospectos_generados ?? 0} /></div>
              <div className="grid gap-1.5"><Label>Reuniones generadas</Label><Input name="reuniones_generadas" type="number" min="0" defaultValue={campana?.reuniones_generadas ?? 0} /></div>
              <div className="grid gap-1.5"><Label>Clientes obtenidos</Label><Input name="clientes_obtenidos" type="number" min="0" defaultValue={campana?.clientes_obtenidos ?? 0} /></div>
            </div>
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

export function EliminarCampana({ id }: { id: number }) {
  const { toast } = useToast()
  async function borrar() {
    if (!confirm("¿Eliminar esta campaña?")) return
    const res = await eliminarCampana(id)
    if (res.error) toast({ title: "No se pudo eliminar", description: res.error, variant: "destructive" })
  }
  return <Button size="icon" variant="ghost" className="h-7 w-7 text-stone-400 hover:text-red-600" onClick={borrar} aria-label="Eliminar campaña"><Trash2 className="h-3.5 w-3.5" /></Button>
}
