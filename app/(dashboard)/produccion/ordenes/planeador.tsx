"use client"

import * as React from "react"
import { CalendarClock, Loader2, Plus, X, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { getHondurasTodayISODate } from "@/lib/utils/honduras-time"
import {
  getPlaneadorDia, setJornada, programarOrden, moverOrdenInicio, desprogramarOrden,
  type JornadaDia, type OrdenPlaneada,
} from "@/lib/services/produccion-ordenes"

// ── Helpers de tiempo (minutos desde medianoche <-> HH:MM) ──
function minToHHMM(min: number): string {
  const m = Math.max(0, Math.min(1439, Math.round(min)))
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
}
function hhmmToMin(v: string): number {
  const [h, m] = (v || "0:0").split(":").map((n) => parseInt(n, 10) || 0)
  return Math.max(0, Math.min(1439, h * 60 + m))
}

// Un color estable por producto (para distinguir barras del mismo articulo).
const COLORS = [
  "bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-violet-500",
  "bg-rose-500", "bg-teal-500", "bg-indigo-500", "bg-orange-500",
]
function colorDe(productoId: number): string {
  return COLORS[productoId % COLORS.length]
}

export function PlaneadorProduccion() {
  const { toast } = useToast()
  const [fecha, setFecha] = React.useState<string>(() => getHondurasTodayISODate())
  const [jornada, setJornadaState] = React.useState<JornadaDia>({ fecha: "", hora_inicio_min: 480, hora_fin_min: 1020 })
  const [programadas, setProgramadas] = React.useState<OrdenPlaneada[]>([])
  const [sinProgramar, setSinProgramar] = React.useState<OrdenPlaneada[]>([])
  const [loading, setLoading] = React.useState(true)
  const [savingJornada, setSavingJornada] = React.useState(false)

  const trackRef = React.useRef<HTMLDivElement>(null)

  const cargar = React.useCallback(async () => {
    setLoading(true)
    const { data, error } = await getPlaneadorDia(fecha)
    if (error) toast({ title: "Error", description: error, variant: "destructive" })
    setJornadaState(data.jornada)
    setProgramadas(data.programadas)
    setSinProgramar(data.sinProgramar)
    setLoading(false)
  }, [fecha, toast])
  React.useEffect(() => { cargar() }, [cargar])

  const rangoMin = Math.max(60, jornada.hora_fin_min - jornada.hora_inicio_min)
  // Ticks de hora completa dentro de la jornada.
  const horasTicks = React.useMemo(() => {
    const ticks: number[] = []
    const primera = Math.ceil(jornada.hora_inicio_min / 60) * 60
    for (let m = primera; m <= jornada.hora_fin_min; m += 60) ticks.push(m)
    return ticks
  }, [jornada.hora_inicio_min, jornada.hora_fin_min])

  // px por minuto segun el ancho del track (se mide en el drag).
  function pxPorMinuto(): number {
    const w = trackRef.current?.clientWidth || 1
    return w / rangoMin
  }

  async function guardarJornada(iniMin: number, finMin: number) {
    setJornadaState((j) => ({ ...j, hora_inicio_min: iniMin, hora_fin_min: finMin }))
    setSavingJornada(true)
    const { error } = await setJornada(fecha, iniMin, finMin)
    setSavingJornada(false)
    if (error) toast({ title: "No se guardó la jornada", description: error, variant: "destructive" })
  }

  // ── Drag de una barra para mover su hora de inicio ──
  const dragRef = React.useRef<{ id: number; startX: number; startMin: number; dur: number } | null>(null)
  const [dragId, setDragId] = React.useState<number | null>(null)
  const [dragMin, setDragMin] = React.useState<number | null>(null)

  function onPointerDown(e: React.PointerEvent, o: OrdenPlaneada) {
    if (o.inicio_min_dia == null) return
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    dragRef.current = { id: o.id, startX: e.clientX, startMin: o.inicio_min_dia, dur: o.duracion_efectiva_horas }
    setDragId(o.id)
    setDragMin(o.inicio_min_dia)
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current
    if (!d) return
    const deltaMin = (e.clientX - d.startX) / pxPorMinuto()
    const durMin = d.dur * 60
    // Limita el inicio para que la barra no se salga de la jornada.
    let nuevo = Math.round((d.startMin + deltaMin) / 5) * 5 // snap a 5 min
    nuevo = Math.max(jornada.hora_inicio_min, Math.min(jornada.hora_fin_min - durMin, nuevo))
    setDragMin(nuevo)
  }
  async function onPointerUp() {
    const d = dragRef.current
    dragRef.current = null
    const nuevo = dragMin
    setDragId(null); setDragMin(null)
    if (!d || nuevo == null || nuevo === d.startMin) return
    // Optimista: actualiza local y persiste.
    setProgramadas((prev) => prev.map((o) => (o.id === d.id ? { ...o, inicio_min_dia: nuevo } : o)).sort((a, b) => a.inicio_min_dia! - b.inicio_min_dia!))
    const { error } = await moverOrdenInicio(d.id, nuevo)
    if (error) { toast({ title: "No se movió", description: error, variant: "destructive" }); cargar() }
  }

  // Agrega una orden sin programar al final de la jornada del dia.
  async function agregarAlDia(o: OrdenPlaneada) {
    const durMin = o.duracion_efectiva_horas * 60
    // La coloca despues de la ultima barra, o al inicio de la jornada.
    const ultimoFin = programadas.reduce((max, p) => Math.max(max, (p.inicio_min_dia ?? 0) + p.duracion_efectiva_horas * 60), jornada.hora_inicio_min)
    const inicio = Math.min(jornada.hora_fin_min - durMin, Math.max(jornada.hora_inicio_min, ultimoFin))
    const { error } = await programarOrden(o.id, {
      fecha_programada: fecha,
      inicio_min_dia: Math.round(inicio),
      duracion_horas: o.duracion_horas ?? o.duracion_efectiva_horas,
    })
    if (error) { toast({ title: "Error", description: error, variant: "destructive" }); return }
    cargar()
  }

  async function quitarDelDia(o: OrdenPlaneada) {
    const { error } = await desprogramarOrden(o.id)
    if (error) { toast({ title: "Error", description: error, variant: "destructive" }); return }
    cargar()
  }

  return (
    <div className="space-y-4">
      {/* Controles: fecha + jornada laboral */}
      <Card className="rounded-xl border-stone-200">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base flex items-center gap-2"><CalendarClock className="h-4 w-4 text-stone-600" /> Programación del día</CardTitle>
          <CardDescription className="text-xs">Elige el día y su horario de trabajo; arrastra las órdenes para fijar su hora de inicio.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1"><Label className="text-xs">Día</Label><Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value || getHondurasTodayISODate())} className="h-9 w-44" /></div>
            <div className="grid gap-1"><Label className="text-xs">Entrada</Label><Input type="time" value={minToHHMM(jornada.hora_inicio_min)} onChange={(e) => guardarJornada(hhmmToMin(e.target.value), jornada.hora_fin_min)} className="h-9 w-28" /></div>
            <div className="grid gap-1"><Label className="text-xs">Salida</Label><Input type="time" value={minToHHMM(jornada.hora_fin_min)} onChange={(e) => guardarJornada(jornada.hora_inicio_min, hhmmToMin(e.target.value))} className="h-9 w-28" /></div>
            {savingJornada && <span className="text-xs text-stone-400 pb-2 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> guardando…</span>}
          </div>
        </CardContent>
      </Card>

      {/* Timeline (Gantt de un día, una sola línea) */}
      <Card className="rounded-xl border-stone-200">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">Línea de tiempo — {fecha}</CardTitle>
          <CardDescription className="text-xs">Cada barra es una orden. Arrástrala para mover su hora de inicio (se guarda al soltar). La barra clara muestra el % fabricado.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner className="h-6 w-6" /></div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                {/* Regla de horas */}
                <div ref={trackRef} className="relative h-6 border-b border-stone-200">
                  {horasTicks.map((m) => {
                    const left = ((m - jornada.hora_inicio_min) / rangoMin) * 100
                    return (
                      <div key={m} className="absolute top-0 bottom-0" style={{ left: `${left}%` }}>
                        <div className="h-full w-px bg-stone-200" />
                        <span className="absolute -left-4 top-0 text-[10px] text-stone-400 tabular-nums">{minToHHMM(m)}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Área de barras */}
                <div className="relative mt-1" style={{ minHeight: 8 + programadas.length * 44 }}
                  onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
                  {/* Líneas verticales de fondo */}
                  {horasTicks.map((m) => {
                    const left = ((m - jornada.hora_inicio_min) / rangoMin) * 100
                    return <div key={m} className="absolute top-0 bottom-0 w-px bg-stone-100" style={{ left: `${left}%` }} />
                  })}

                  {programadas.length === 0 && (
                    <p className="text-sm text-stone-400 py-8 text-center">No hay órdenes programadas este día. Agrégalas desde &quot;Sin programar&quot; abajo.</p>
                  )}

                  {programadas.map((o, i) => {
                    const ini = dragId === o.id && dragMin != null ? dragMin : (o.inicio_min_dia ?? jornada.hora_inicio_min)
                    const durMin = o.duracion_efectiva_horas * 60
                    const left = ((ini - jornada.hora_inicio_min) / rangoMin) * 100
                    const width = (durMin / rangoMin) * 100
                    const fin = ini + durMin
                    return (
                      <div
                        key={o.id}
                        className={`absolute rounded-md text-white shadow-sm cursor-grab active:cursor-grabbing select-none ${colorDe(o.producto_id)} ${dragId === o.id ? "ring-2 ring-offset-1 ring-stone-400 z-10" : ""}`}
                        style={{ left: `${left}%`, width: `calc(${width}% - 2px)`, top: i * 44, height: 40 }}
                        onPointerDown={(e) => onPointerDown(e, o)}
                        title={`${o.producto_nombre} · ${minToHHMM(ini)}–${minToHHMM(fin)} · ${o.duracion_efectiva_horas}h`}
                      >
                        {/* Relleno de % completado */}
                        <div className="absolute inset-y-0 left-0 bg-white/25 rounded-l-md pointer-events-none" style={{ width: `${o.completado_pct}%` }} />
                        <div className="relative px-2 py-1 h-full flex flex-col justify-center overflow-hidden">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-medium truncate">{o.producto_nombre || `#${o.producto_id}`}</span>
                            <button onPointerDown={(e) => e.stopPropagation()} onClick={() => quitarDelDia(o)} className="shrink-0 opacity-70 hover:opacity-100" title="Quitar del día">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-[10px] opacity-90 tabular-nums truncate">
                            {minToHHMM(ini)}–{minToHHMM(fin)} · {o.fabricado}/{o.cantidad_objetivo} ({o.completado_pct}%)
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Órdenes sin programar (agregar al día) */}
      <Card className="rounded-xl border-stone-200">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-stone-600" /> Sin programar</CardTitle>
          <CardDescription className="text-xs">Órdenes abiertas sin colocar en este día. &quot;Agregar&quot; las pone al final de la jornada; luego arrástralas.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {loading ? (
            <div className="flex justify-center py-6"><Spinner className="h-5 w-5" /></div>
          ) : sinProgramar.length === 0 ? (
            <p className="text-sm text-stone-400 py-2">No hay órdenes pendientes de programar.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sinProgramar.map((o) => (
                <div key={o.id} className="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 pl-3 pr-1.5 py-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${colorDe(o.producto_id)}`} />
                  <div className="text-sm">
                    <span className="font-medium">{o.producto_nombre || `#${o.producto_id}`}</span>
                    <span className="text-stone-400 text-xs"> · {o.cantidad_objetivo}u · ~{o.duracion_efectiva_horas}h</span>
                    {o.completado_pct > 0 && <span className="text-emerald-600 text-xs"> · {o.completado_pct}%</span>}
                  </div>
                  {o.fecha_programada && o.fecha_programada !== fecha && (
                    <Badge variant="outline" className="text-[10px] border-stone-200 text-stone-500">otro día</Badge>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50" onClick={() => agregarAlDia(o)}>
                    <Plus className="h-3.5 w-3.5" /> Agregar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
