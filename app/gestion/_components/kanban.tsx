"use client"

import * as React from "react"
import Link from "next/link"
import { Phone, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ETAPAS_PIPELINE, ETIQUETA_ETAPA, ETIQUETA_MOTIVO, MOTIVOS_PERDIDA, type EtapaPipeline, type MotivoPerdida } from "@/lib/gestion/reglas"
import { moverEtapa } from "@/app/gestion/actions"
import type { GEmpresa, GConfig } from "@/lib/services/gestion"
import { EmpresaForm } from "./empresa-form"
import { fmtFechaHora } from "./ui"

const COLOR_COL: Record<EtapaPipeline, string> = {
  nuevo: "border-t-stone-400", reunion_pendiente: "border-t-sky-400", reunion_realizada: "border-t-sky-600", prueba: "border-t-amber-400", cliente: "border-t-emerald-500", no_interesado: "border-t-red-400",
}

/** Kanban de prospectos: arrastrar y soltar persiste la etapa (optimista). */
export function Kanban({ empresas, config, hoy }: { empresas: GEmpresa[]; config: Pick<GConfig, "dias_prueba" | "moneda" | "planes">; hoy: string }) {
  const { toast } = useToast()
  const [tarjetas, setTarjetas] = React.useState(empresas)
  const [arrastrando, setArrastrando] = React.useState<number | null>(null)
  const [sobre, setSobre] = React.useState<EtapaPipeline | null>(null)
  const [motivoDe, setMotivoDe] = React.useState<GEmpresa | null>(null)
  const [motivo, setMotivo] = React.useState<MotivoPerdida>("precio")
  const [convertir, setConvertir] = React.useState<GEmpresa | null>(null)

  async function mover(e: GEmpresa, etapa: EtapaPipeline, motivoPerdida?: MotivoPerdida) {
    const previo = tarjetas
    setTarjetas((t) => t.map((x) => (x.id === e.id ? { ...x, etapa_pipeline: etapa, ultima_interaccion: new Date().toISOString() } : x)))
    const res = await moverEtapa(e.id, etapa, motivoPerdida ?? null)
    if (res.error) {
      setTarjetas(previo)
      toast({ title: "No se pudo mover", description: res.error, variant: "destructive" })
      return
    }
    toast({ title: `${e.nombre} → ${ETIQUETA_ETAPA[etapa]}` })
    // Al pasar a Cliente, ofrecer completar la ficha (plan, cuota, día de cobro) como cliente activo.
    if (etapa === "cliente") setConvertir({ ...e, estado: "activo", etapa_pipeline: "cliente" })
  }

  function soltar(etapa: EtapaPipeline) {
    setSobre(null)
    const e = tarjetas.find((x) => x.id === arrastrando)
    setArrastrando(null)
    if (!e || e.etapa_pipeline === etapa) return
    if (etapa === "no_interesado") { setMotivoDe(e); return }
    mover(e, etapa)
  }

  return (
    <>
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[1080px] grid-cols-6 gap-3">
          {ETAPAS_PIPELINE.map((etapa) => {
            const col = tarjetas.filter((t) => t.etapa_pipeline === etapa)
            return (
              <div
                key={etapa}
                onDragOver={(ev) => { ev.preventDefault(); if (sobre !== etapa) setSobre(etapa) }}
                onDragLeave={() => setSobre((s) => (s === etapa ? null : s))}
                onDrop={() => soltar(etapa)}
                className={cn("flex min-h-[420px] flex-col rounded-xl border border-t-4 bg-stone-50/70 p-2 transition-colors", COLOR_COL[etapa], sobre === etapa && "bg-amber-50 ring-2 ring-amber-300")}
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-600">{ETIQUETA_ETAPA[etapa]}</p>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold tabular-nums text-stone-600 border">{col.length}</span>
                </div>
                <div className="flex-1 space-y-2">
                  {col.map((t) => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={() => setArrastrando(t.id)}
                      onDragEnd={() => { setArrastrando(null); setSobre(null) }}
                      className={cn("cursor-grab rounded-lg border bg-white p-2.5 shadow-sm active:cursor-grabbing", arrastrando === t.id && "opacity-50")}
                    >
                      <Link href={`/gestion/empresas/${t.id}`} className="block truncate text-sm font-semibold text-stone-800 hover:underline">{t.nombre}</Link>
                      <p className="truncate text-xs text-stone-600">{t.contacto_principal || t.dueno || "—"}</p>
                      {(t.telefono || t.whatsapp) && <p className="mt-0.5 flex items-center gap-1 text-[11px] text-stone-500"><Phone className="h-3 w-3" /> {t.telefono || t.whatsapp}</p>}
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-stone-400"><Clock className="h-3 w-3" /> {t.ultima_interaccion ? fmtFechaHora(t.ultima_interaccion) : "sin interacción"}</p>
                      {t.proxima_accion && <p className="mt-1 flex items-start gap-1 rounded bg-amber-50 px-1.5 py-1 text-[11px] text-amber-800"><ArrowRight className="mt-0.5 h-3 w-3 shrink-0" /> {t.proxima_accion}</p>}
                    </div>
                  ))}
                  {col.length === 0 && <p className="px-1 py-6 text-center text-[11px] text-stone-400">Arrastra aquí</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Motivo de pérdida al mover a "No interesado" */}
      <Dialog open={!!motivoDe} onOpenChange={(o) => { if (!o) setMotivoDe(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Por qué no está interesado?</DialogTitle>
            <DialogDescription>{motivoDe?.nombre}: el motivo alimenta la tarjeta de motivos de pérdida.</DialogDescription>
          </DialogHeader>
          <Select value={motivo} onValueChange={(v) => setMotivo(v as MotivoPerdida)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{MOTIVOS_PERDIDA.map((x) => <SelectItem key={x} value={x}>{ETIQUETA_MOTIVO[x]}</SelectItem>)}</SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMotivoDe(null)}>Cancelar</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => { const e = motivoDe!; setMotivoDe(null); mover(e, "no_interesado", motivo) }}>Marcar no interesado</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convertir en cliente activo (formulario precargado) */}
      {convertir && (
        <EmpresaForm key={convertir.id} empresa={convertir} config={config} hoy={hoy} abierto onOpenChange={(o) => { if (!o) setConvertir(null) }} titulo="Convertir en cliente activo" />
      )}
    </>
  )
}
