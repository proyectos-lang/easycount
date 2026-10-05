"use client"

import * as React from "react"
import { Loader2, Paperclip, Plus, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ETIQUETA_CATEGORIA } from "@/lib/gestion/reglas"
import { eliminarGasto, guardarGasto, urlComprobante } from "@/app/gestion/actions"
import type { GGasto, GSocio } from "@/lib/services/gestion"

export function GastoForm({ gasto, categorias, hoy, trigger, socios = [] }: { gasto?: GGasto | null; categorias: string[]; hoy: string; trigger?: React.ReactNode; socios?: GSocio[] }) {
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [guardando, setGuardando] = React.useState(false)
  const [categoria, setCategoria] = React.useState(gasto?.categoria ?? categorias[0] ?? "otros")
  // "" = lo pagó EasyCount; un id = lo asumió ese socio (se le reembolsa en su liquidación).
  const [pagadoPor, setPagadoPor] = React.useState(gasto?.socio_id ? String(gasto.socio_id) : "")
  const sociosOpciones = socios.filter((s) => s.activo || s.id === gasto?.socio_id)
  const formRef = React.useRef<HTMLFormElement>(null)

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set("categoria", categoria)
    fd.set("socio_id", pagadoPor)
    if (gasto?.id) fd.set("id", String(gasto.id))
    if (!(Number(fd.get("monto")) > 0)) return toast({ title: "El monto debe ser mayor que cero", variant: "destructive" })
    setGuardando(true)
    const res = await guardarGasto(fd)
    setGuardando(false)
    if (res.error) return toast({ title: "No se pudo guardar el gasto", description: res.error, variant: "destructive" })
    toast({ title: gasto ? "Gasto actualizado" : "Gasto registrado" })
    setOpen(false)
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger ?? <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Nuevo gasto</Button>}</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{gasto ? "Editar gasto" : "Nuevo gasto"}</DialogTitle><DialogDescription>Gastos del negocio EasyCount (publicidad, hosting, software…). Puedes adjuntar el comprobante.</DialogDescription></DialogHeader>
          <form ref={formRef} onSubmit={enviar} className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Fecha</Label><Input name="fecha" type="date" defaultValue={gasto?.fecha ?? hoy} required /></div>
              <div className="grid gap-1.5"><Label>Monto</Label><Input name="monto" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={gasto?.monto ?? ""} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Categoría</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categorias.map((c) => <SelectItem key={c} value={c}>{ETIQUETA_CATEGORIA[c] ?? c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Método</Label><Input name="metodo" defaultValue={gasto?.metodo ?? ""} placeholder="Tarjeta, transferencia…" /></div>
            </div>
            {sociosOpciones.length > 0 && (
              <div className="grid gap-1.5">
                <Label>¿Quién lo pagó?</Label>
                <Select value={pagadoPor || "easycount"} onValueChange={(v) => setPagadoPor(v === "easycount" ? "" : v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easycount">EasyCount</SelectItem>
                    {sociosOpciones.map((s) => <SelectItem key={s.id} value={String(s.id)}>Socio: {s.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
                {pagadoPor && <p className="text-[11px] text-amber-700">Lo asumió el socio: sale del pool global y se le suma completo en su liquidación del mes.</p>}
              </div>
            )}
            <div className="grid gap-1.5"><Label>Descripción</Label><Input name="descripcion" defaultValue={gasto?.descripcion ?? ""} placeholder="Meta Ads octubre, dominio…" /></div>
            <div className="grid gap-1.5"><Label className="flex items-center gap-1"><Paperclip className="h-3.5 w-3.5" /> Comprobante (imagen o PDF, máx. 10 MB)</Label><Input name="archivo" type="file" accept="image/*,application/pdf" />{gasto?.comprobante_path && <p className="text-[11px] text-stone-500">Ya tiene comprobante; si subes otro, lo reemplaza.</p>}</div>
            <div className="grid gap-1.5"><Label>Observaciones</Label><Textarea name="observaciones" rows={2} defaultValue={gasto?.observaciones ?? ""} /></div>
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

export function VerComprobante({ path }: { path: string }) {
  const { toast } = useToast()
  const [cargando, setCargando] = React.useState(false)
  async function abrir() {
    setCargando(true)
    const res = await urlComprobante(path)
    setCargando(false)
    if (!res.data) return toast({ title: "No se pudo abrir el comprobante", description: res.error ?? "", variant: "destructive" })
    window.open(res.data, "_blank", "noopener")
  }
  return <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" onClick={abrir} disabled={cargando}><ExternalLink className="h-3.5 w-3.5" /> Ver</Button>
}

export function EliminarGasto({ id }: { id: number }) {
  const { toast } = useToast()
  async function borrar() {
    if (!confirm("¿Eliminar este gasto?")) return
    const res = await eliminarGasto(id)
    if (res.error) toast({ title: "No se pudo eliminar", description: res.error, variant: "destructive" })
  }
  return <Button size="icon" variant="ghost" className="h-7 w-7 text-stone-400 hover:text-red-600" onClick={borrar} aria-label="Eliminar gasto"><Trash2 className="h-3.5 w-3.5" /></Button>
}
