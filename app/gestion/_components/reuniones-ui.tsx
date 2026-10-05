"use client"

import * as React from "react"
import Link from "next/link"
import { CalendarPlus, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
  ETIQUETA_ESTADO_REUNION, ETIQUETA_MOTIVO, ETIQUETA_RESULTADO, ETIQUETA_TIPO_REUNION, MOTIVOS_PERDIDA, RESULTADOS_REUNION, TIPOS_REUNION,
  type EstadoReunion, type MotivoPerdida, type ResultadoReunion, type TipoReunion,
} from "@/lib/gestion/reglas"
import { eliminarReunion, guardarReunion, registrarResultadoReunion } from "@/app/gestion/actions"
import type { GReunion } from "@/lib/services/gestion"
import { Etiqueta, Panel, Vacio, fmtFecha, fmtHora } from "./ui"

export interface EmpresaOpcion { id: number; nombre: string; contacto: string | null }

const TONO_RES: Record<ResultadoReunion, "verde" | "rojo" | "azul" | "amarillo"> = { interesado: "azul", quiere_prueba: "azul", debe_consultarlo: "amarillo", seguimiento: "amarillo", cliente_confirmado: "verde", no_interesado: "rojo" }

export function ReunionesUI({ reuniones, empresas, hoy, empresaInicial, reunionInicial }: { reuniones: GReunion[]; empresas: EmpresaOpcion[]; hoy: string; empresaInicial?: number | null; reunionInicial?: number | null }) {
  const { toast } = useToast()
  const [selId, setSelId] = React.useState<number | null>(reunionInicial ?? reuniones.find((r) => !r.resultado && r.fecha >= hoy)?.id ?? reuniones[0]?.id ?? null)
  const sel = reuniones.find((r) => r.id === selId) ?? null
  const [agendar, setAgendar] = React.useState(!!empresaInicial)
  const [filtro, setFiltro] = React.useState<"proximas" | "todas" | "sin_resultado">("proximas")

  const lista = reuniones
    .filter((r) => (filtro === "proximas" ? r.fecha >= hoy : filtro === "sin_resultado" ? !r.resultado : true))
    .sort((a, b) => (filtro === "proximas" ? `${a.fecha} ${a.hora || ""}`.localeCompare(`${b.fecha} ${b.hora || ""}`) : `${b.fecha} ${b.hora || ""}`.localeCompare(`${a.fecha} ${a.hora || ""}`)))

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex rounded-lg border bg-white p-1 text-xs">
            {([["proximas", "Próximas"], ["sin_resultado", "Sin resultado"], ["todas", "Todas"]] as const).map(([k, l]) => (
              <button key={k} type="button" onClick={() => setFiltro(k)} className={cn("rounded-md px-3 py-1 font-medium", filtro === k ? "bg-stone-800 text-white" : "text-stone-600 hover:bg-stone-50")}>{l}</button>
            ))}
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setAgendar(true)}><CalendarPlus className="h-4 w-4" /> Agendar reunión</Button>
        </div>
        <Panel>
          {lista.length === 0 ? <Vacio titulo="Sin reuniones" texto="Agenda una con el botón de arriba." /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[11px] uppercase tracking-wide text-stone-500">
                  <tr><th className="py-1.5 pr-3 font-medium">Empresa</th><th className="py-1.5 pr-3 font-medium">Contacto</th><th className="py-1.5 pr-3 font-medium">Fecha</th><th className="py-1.5 pr-3 font-medium">Hora</th><th className="py-1.5 pr-3 font-medium">Tipo</th><th className="py-1.5 pr-3 font-medium">Resultado</th><th className="py-1.5 font-medium">Próximo paso</th></tr>
                </thead>
                <tbody>
                  {lista.map((r) => (
                    <tr key={r.id} onClick={() => setSelId(r.id)} className={cn("cursor-pointer border-t hover:bg-stone-50", selId === r.id && "bg-amber-50/60")}>
                      <td className="py-2 pr-3"><Link href={`/gestion/empresas/${r.empresa_id}`} className="font-medium text-stone-800 hover:underline">{r.empresa_nombre || "—"}</Link></td>
                      <td className="py-2 pr-3 text-stone-600">{r.contacto || "—"}</td>
                      <td className="py-2 pr-3 tabular-nums">{fmtFecha(r.fecha)}</td>
                      <td className="py-2 pr-3 tabular-nums">{fmtHora(r.hora)}</td>
                      <td className="py-2 pr-3">{ETIQUETA_TIPO_REUNION[r.tipo]}</td>
                      <td className="py-2 pr-3">{r.resultado ? <Etiqueta tono={TONO_RES[r.resultado]}>{ETIQUETA_RESULTADO[r.resultado]}</Etiqueta> : <Etiqueta tono="gris">{ETIQUETA_ESTADO_REUNION[r.estado]}</Etiqueta>}</td>
                      <td className="py-2 text-xs text-stone-600 max-w-[200px] truncate">{r.proximo_paso || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
      <div className="space-y-3">
        {sel ? <ResultadoPanel key={sel.id} reunion={sel} onBorrada={() => setSelId(null)} /> : <Panel titulo="Registrar resultado"><p className="text-xs text-stone-500">Elige una reunión de la lista.</p></Panel>}
      </div>
      <AgendarDialog abierto={agendar} onOpenChange={setAgendar} empresas={empresas} hoy={hoy} empresaInicial={empresaInicial ?? null} />
    </div>
  )
}

function ResultadoPanel({ reunion: r, onBorrada }: { reunion: GReunion; onBorrada: () => void }) {
  const { toast } = useToast()
  const [resultado, setResultado] = React.useState<ResultadoReunion | null>(r.resultado)
  const [motivo, setMotivo] = React.useState<MotivoPerdida | null>(r.motivo_perdida)
  const [notas, setNotas] = React.useState(r.notas ?? "")
  const [proximo, setProximo] = React.useState(r.proximo_paso ?? "")
  const [guardando, setGuardando] = React.useState(false)

  async function guardar() {
    if (!resultado) return toast({ title: "Elige un resultado", variant: "destructive" })
    if (resultado === "no_interesado" && !motivo) return toast({ title: "Indica el motivo de pérdida", variant: "destructive" })
    setGuardando(true)
    const res = await registrarResultadoReunion({ id: r.id, resultado, motivo_perdida: motivo, notas, proximo_paso: proximo })
    setGuardando(false)
    if (res.error) return toast({ title: "No se pudo guardar", description: res.error, variant: "destructive" })
    toast({ title: "Resultado registrado", description: `${r.empresa_nombre}: ${ETIQUETA_RESULTADO[resultado]}` })
  }
  async function borrar() {
    if (!confirm("¿Eliminar esta reunión?")) return
    const res = await eliminarReunion(r.id)
    if (res.error) return toast({ title: "No se pudo eliminar", description: res.error, variant: "destructive" })
    onBorrada()
  }

  return (
    <Panel titulo="Registrar resultado" descripcion={`${r.empresa_nombre || ""} · ${fmtFecha(r.fecha)} ${fmtHora(r.hora)}`} accion={<Button size="icon" variant="ghost" className="h-7 w-7 text-stone-400 hover:text-red-600" onClick={borrar} aria-label="Eliminar reunión"><Trash2 className="h-3.5 w-3.5" /></Button>}>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {RESULTADOS_REUNION.map((x) => (
            <button key={x} type="button" onClick={() => setResultado(x)} className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors", resultado === x ? "border-stone-800 bg-stone-800 text-white" : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50")}>
              {ETIQUETA_RESULTADO[x]}
            </button>
          ))}
        </div>
        {resultado === "no_interesado" && (
          <div className="rounded-lg border border-red-200 bg-red-50/60 p-2.5">
            <p className="mb-1.5 text-xs font-semibold text-red-800">Motivo de pérdida</p>
            <div className="flex flex-wrap gap-1.5">
              {MOTIVOS_PERDIDA.map((x) => (
                <button key={x} type="button" onClick={() => setMotivo(x)} className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-medium", motivo === x ? "border-red-700 bg-red-700 text-white" : "border-red-200 bg-white text-red-800 hover:bg-red-100")}>{ETIQUETA_MOTIVO[x]}</button>
              ))}
            </div>
          </div>
        )}
        <div className="grid gap-1.5"><Label className="text-xs">Próximo paso</Label><Input value={proximo} onChange={(e) => setProximo(e.target.value)} placeholder="Enviar propuesta, instalar prueba…" /></div>
        <div className="grid gap-1.5"><Label className="text-xs">Notas</Label><Textarea rows={3} value={notas} onChange={(e) => setNotas(e.target.value)} /></div>
        <Button className="w-full" onClick={guardar} disabled={guardando}>{guardando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar resultado</Button>
        <p className="text-[11px] text-stone-400">El resultado mueve el pipeline del prospecto (quiere prueba → En prueba, cliente confirmado → Cliente, no interesado → No interesado).</p>
      </div>
    </Panel>
  )
}

function AgendarDialog({ abierto, onOpenChange, empresas, hoy, empresaInicial }: { abierto: boolean; onOpenChange: (o: boolean) => void; empresas: EmpresaOpcion[]; hoy: string; empresaInicial: number | null }) {
  const { toast } = useToast()
  const [empresaId, setEmpresaId] = React.useState(empresaInicial ? String(empresaInicial) : "")
  const [contacto, setContacto] = React.useState(empresas.find((e) => e.id === empresaInicial)?.contacto ?? "")
  const [fecha, setFecha] = React.useState(hoy)
  const [hora, setHora] = React.useState("")
  const [tipo, setTipo] = React.useState<TipoReunion>("videollamada")
  const [estado, setEstado] = React.useState<EstadoReunion>("pendiente")
  const [notas, setNotas] = React.useState("")
  const [guardando, setGuardando] = React.useState(false)

  async function guardar() {
    if (!empresaId) return toast({ title: "Elige la empresa", variant: "destructive" })
    setGuardando(true)
    const res = await guardarReunion({ empresa_id: Number(empresaId), contacto, fecha, hora: hora || null, tipo, estado, notas })
    setGuardando(false)
    if (res.error) return toast({ title: "No se pudo agendar", description: res.error, variant: "destructive" })
    toast({ title: "Reunión agendada" })
    onOpenChange(false)
  }

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Agendar reunión</DialogTitle><DialogDescription>Un prospecto nuevo pasa a «Reunión pendiente» al agendar.</DialogDescription></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5"><Label>Empresa</Label>
            <Select value={empresaId} onValueChange={(v) => { setEmpresaId(v); const e = empresas.find((x) => String(x.id) === v); if (e?.contacto && !contacto) setContacto(e.contacto) }}>
              <SelectTrigger><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
              <SelectContent>{empresas.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5"><Label>Contacto</Label><Input value={contacto} onChange={(e) => setContacto(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Fecha</Label><Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Hora</Label><Input type="time" value={hora} onChange={(e) => setHora(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoReunion)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TIPOS_REUNION.map((t) => <SelectItem key={t} value={t}>{ETIQUETA_TIPO_REUNION[t]}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="grid gap-1.5"><Label>Estado</Label>
              <Select value={estado} onValueChange={(v) => setEstado(v as EstadoReunion)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(["pendiente", "confirmada", "reprogramada"] as EstadoReunion[]).map((s) => <SelectItem key={s} value={s}>{ETIQUETA_ESTADO_REUNION[s]}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
          <div className="grid gap-1.5"><Label>Notas</Label><Textarea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={guardando}>Cancelar</Button>
          <Button onClick={guardar} disabled={guardando}>{guardando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Agendar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
