"use client"

import * as React from "react"
import { ArrowLeftRight, Loader2, PlayCircle, PackageCheck, CheckCircle2, Inbox, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { getOrdenes, codigoOrden, type OrdenProduccion } from "@/lib/services/produccion-ordenes"
import {
  getFlujoOrdenes, generarEtapasOrden, recibirEtapa, entregarEtapa,
  type OrdenFlujo, type EtapaOrden, type EstadoEtapa,
} from "@/lib/services/produccion-flujo"

function etapaBadge(e: EstadoEtapa) {
  const map: Record<EstadoEtapa, string> = {
    "Pendiente": "border-stone-200 bg-stone-50 text-stone-500",
    "Recibida": "border-sky-200 bg-sky-50 text-sky-700",
    "En Proceso": "border-amber-200 bg-amber-50 text-amber-800",
    "Entregada": "border-emerald-200 bg-emerald-50 text-emerald-700",
  }
  return <Badge variant="outline" className={`text-[10px] ${map[e]}`}>{e}</Badge>
}

function fmtFechaHora(iso: string | null): string {
  if (!iso) return "—"
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`
}

export default function FlujoProduccionPage() {
  const { toast } = useToast()
  const [flujos, setFlujos] = React.useState<OrdenFlujo[]>([])
  const [sinFlujo, setSinFlujo] = React.useState<OrdenProduccion[]>([])
  const [loading, setLoading] = React.useState(true)
  const [accionId, setAccionId] = React.useState<number | null>(null)

  // Diálogo de entrega de etapa.
  const [entregar, setEntregar] = React.useState<EtapaOrden | null>(null)
  const [entResponsable, setEntResponsable] = React.useState("")
  const [entCantidad, setEntCantidad] = React.useState("")
  const [entNotas, setEntNotas] = React.useState("")
  const [entregando, setEntregando] = React.useState(false)

  const cargar = React.useCallback(async () => {
    setLoading(true)
    const [f, o] = await Promise.all([getFlujoOrdenes(), getOrdenes()])
    if (f.error) toast({ title: "Error", description: f.error, variant: "destructive" })
    setFlujos(f.data)
    // Órdenes producibles que aún NO tienen flujo iniciado.
    const conFlujo = new Set(f.data.map((x) => x.orden_id))
    setSinFlujo(o.data.filter((x) => (x.estado === "Abierta" || x.estado === "En Proceso") && !conFlujo.has(x.id)))
    setLoading(false)
  }, [toast])
  React.useEffect(() => { cargar() }, [cargar])

  async function iniciarFlujo(o: OrdenProduccion) {
    setAccionId(o.id)
    const res = await generarEtapasOrden(o.id)
    setAccionId(null)
    if (res.error) { toast({ title: "No se pudo iniciar el flujo", description: res.error, variant: "destructive" }); return }
    toast({ title: "Flujo iniciado", description: `${res.data?.creadas ?? 0} etapa(s) generadas para ${codigoOrden(o.id)}.` })
    cargar()
  }

  async function accionRecibir(e: EtapaOrden) {
    setAccionId(e.id)
    const { error } = await recibirEtapa(e.id)
    setAccionId(null)
    if (error) { toast({ title: "Error", description: error, variant: "destructive" }); return }
    cargar()
  }

  function abrirEntregar(e: EtapaOrden) {
    setEntregar(e)
    setEntResponsable(e.responsable || "")
    setEntCantidad("")
    setEntNotas("")
  }

  async function confirmarEntregar() {
    if (!entregar) return
    setEntregando(true)
    const { error } = await entregarEtapa(entregar.id, {
      responsable: entResponsable || null,
      cantidad_procesada: entCantidad ? Number(entCantidad) : null,
      notas: entNotas || null,
    })
    setEntregando(false)
    if (error) { toast({ title: "Error", description: error, variant: "destructive" }); return }
    toast({ title: "Etapa entregada", description: "La siguiente etapa quedó lista para recibir." })
    setEntregar(null)
    cargar()
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
          <ArrowLeftRight className="h-6 w-6 text-stone-600" /> Flujo de Producción
        </h1>
        <p className="text-sm text-muted-foreground">
          Cada orden recorre tus operaciones etapa por etapa: recibir → trabajar → entregar a la siguiente.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : (
        <>
          {/* Órdenes sin flujo iniciado */}
          {sinFlujo.length > 0 && (
            <Card className="rounded-xl border-stone-200">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Inbox className="h-4 w-4 text-stone-600" /> Iniciar flujo</CardTitle>
                <CardDescription className="text-xs">Órdenes sin etapas todavía. Al iniciar, se generan sus etapas con tu secuencia de operaciones (se congela al iniciar).</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="flex flex-wrap gap-2">
                  {sinFlujo.map((o) => (
                    <div key={o.id} className="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 pl-3 pr-1.5 py-1.5">
                      <span className="font-mono text-[11px] text-stone-500">{codigoOrden(o.id)}</span>
                      <span className="text-sm font-medium">{o.producto_nombre || `Producto #${o.producto_id}`}</span>
                      <span className="text-xs text-stone-400">· {o.cantidad_objetivo}u</span>
                      <Button size="sm" variant="ghost" className="h-7 gap-1 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50" disabled={accionId === o.id} onClick={() => iniciarFlujo(o)}>
                        {accionId === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />} Iniciar flujo
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Órdenes en flujo */}
          <Card className="rounded-xl border-stone-200">
            <CardHeader className="p-4 md:p-6 pb-3">
              <CardTitle className="text-base md:text-lg">Órdenes en flujo</CardTitle>
              <CardDescription className="text-xs md:text-sm">En qué etapa va cada orden. Despliega para recibir/entregar cada etapa.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {flujos.length === 0 ? (
                <div className="text-center py-10 text-stone-500 text-sm">
                  <ArrowLeftRight className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  Ninguna orden tiene flujo iniciado todavía.
                  {sinFlujo.length === 0 && <div className="text-xs mt-1">Crea órdenes e inicia su flujo (necesitas tener operaciones definidas).</div>}
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-2">
                  {flujos.map((f) => {
                    const total = f.etapas.length
                    const entregadas = f.etapas.filter((e) => e.estado === "Entregada").length
                    return (
                      <AccordionItem key={f.orden_id} value={String(f.orden_id)} className="border rounded-lg px-3 data-[state=open]:bg-stone-50/40">
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex flex-1 items-center justify-between gap-3 pr-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono text-xs text-stone-500 shrink-0">{codigoOrden(f.orden_id)}</span>
                              <span className="font-medium truncate">{f.producto_nombre}</span>
                              {f.completado ? (
                                <Badge variant="outline" className="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700 gap-1 shrink-0"><CheckCircle2 className="h-3 w-3" /> Completado</Badge>
                              ) : f.etapaActual ? (
                                <span className="text-xs text-stone-500 shrink-0 flex items-center gap-1"><ChevronRight className="h-3 w-3" /> {f.etapaActual.nombre}</span>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {f.fecha_objetivo && <span className="text-xs text-stone-500 tabular-nums hidden md:inline">Entrega: {f.fecha_objetivo}</span>}
                              <span className="text-xs tabular-nums text-stone-600">{entregadas}/{total}</span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3">
                          <div className="space-y-2">
                            {f.etapas.map((e) => {
                              const puedeRecibir = e.estado === "Pendiente"
                              const puedeEntregar = e.estado === "Recibida" || e.estado === "En Proceso"
                              return (
                                <div key={e.id} className={`flex items-center gap-3 rounded-lg border p-2.5 ${e.estado === "Entregada" ? "border-emerald-100 bg-emerald-50/40" : "border-stone-200"}`}>
                                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold text-stone-600">{e.orden_secuencia}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium truncate">{e.nombre}</span>
                                      {etapaBadge(e.estado)}
                                    </div>
                                    <p className="text-[11px] text-stone-500 truncate">
                                      {e.responsable ? `${e.responsable} · ` : ""}
                                      {e.fecha_recepcion ? `recibida ${fmtFechaHora(e.fecha_recepcion)}` : "sin recibir"}
                                      {e.fecha_entrega ? ` · entregada ${fmtFechaHora(e.fecha_entrega)}` : ""}
                                      {e.cantidad_procesada != null ? ` · ${e.cantidad_procesada} u` : ""}
                                      {e.notas ? ` · ${e.notas}` : ""}
                                    </p>
                                  </div>
                                  <div className="shrink-0">
                                    {puedeRecibir ? (
                                      <Button size="sm" variant="outline" className="h-8 gap-1" disabled={accionId === e.id} onClick={() => accionRecibir(e)}>
                                        {accionId === e.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Inbox className="h-3.5 w-3.5" />} Recibir
                                      </Button>
                                    ) : puedeEntregar ? (
                                      <Button size="sm" className="h-8 gap-1" onClick={() => abrirEntregar(e)}>
                                        <PackageCheck className="h-3.5 w-3.5" /> Entregar
                                      </Button>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 pr-1"><CheckCircle2 className="h-3.5 w-3.5" /></span>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Entregar etapa */}
      <Dialog open={entregar != null} onOpenChange={(o) => { if (!o && !entregando) setEntregar(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Entregar etapa · {entregar?.nombre}</DialogTitle>
            <DialogDescription>Al entregar, esta etapa se cierra y la siguiente queda lista para recibir.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label className="text-xs">Responsable</Label>
              <Input value={entResponsable} onChange={(e) => setEntResponsable(e.target.value)} placeholder="Nombre" className="h-9" />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Cantidad procesada <span className="text-stone-400 font-normal">(opcional)</span></Label>
              <Input type="number" min="0" value={entCantidad} onChange={(e) => setEntCantidad(e.target.value)} placeholder="0" className="h-9 max-w-[160px]" />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Notas <span className="text-stone-400 font-normal">(opcional)</span></Label>
              <Textarea value={entNotas} onChange={(e) => setEntNotas(e.target.value)} rows={2} placeholder="Observaciones de la etapa" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEntregar(null)} disabled={entregando}>Cancelar</Button>
            <Button onClick={confirmarEntregar} disabled={entregando}>
              {entregando && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Entregar etapa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
