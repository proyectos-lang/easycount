"use client"

import * as React from "react"
import { Gauge, Plus, Trash2, Loader2, PlayCircle, CheckCircle2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils/format"
import { getOrdenes, type OrdenProduccion } from "@/lib/services/produccion-ordenes"
import {
  getCorridas, createCorrida, ejecutarCorrida, type Corrida,
} from "@/lib/services/produccion-corridas"

interface DefectoForm { _id: string; motivo: string; cantidad: string }
let seq = 0
const nid = () => `d-${++seq}`

function estadoCorridaBadge(e: string) {
  const map: Record<string, string> = {
    Registrada: "border-sky-200 bg-sky-50 text-sky-700",
    Ejecutada: "border-amber-200 bg-amber-50 text-amber-800",
    Recibida: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Cancelada: "border-stone-300 bg-stone-100 text-stone-500",
  }
  return <Badge variant="outline" className={map[e] || ""}>{e}</Badge>
}

export default function ControlPisoPage() {
  const { toast } = useToast()
  const [ordenes, setOrdenes] = React.useState<OrdenProduccion[]>([])
  const [loading, setLoading] = React.useState(true)
  const [ordenId, setOrdenId] = React.useState<string>("")
  const [corridas, setCorridas] = React.useState<Corrida[]>([])
  const [cargandoCorridas, setCargandoCorridas] = React.useState(false)

  // Nueva corrida
  const [nuevoOpen, setNuevoOpen] = React.useState(false)
  const [horaInicio, setHoraInicio] = React.useState("")
  const [horaFin, setHoraFin] = React.useState("")
  const [buenas, setBuenas] = React.useState("")
  const [defectuosas, setDefectuosas] = React.useState("")
  const [paros, setParos] = React.useState("")
  const [planificado, setPlanificado] = React.useState("")
  const [novedades, setNovedades] = React.useState("")
  const [defectos, setDefectos] = React.useState<DefectoForm[]>([])
  const [saving, setSaving] = React.useState(false)
  const [ejecutandoId, setEjecutandoId] = React.useState<number | null>(null)

  React.useEffect(() => {
    getOrdenes().then(({ data }) => {
      // Solo órdenes producibles (no cerradas/canceladas).
      setOrdenes(data.filter((o) => o.estado === "Abierta" || o.estado === "En Proceso"))
      setLoading(false)
    })
  }, [])

  const ordenSel = ordenes.find((o) => String(o.id) === ordenId)

  const cargarCorridas = React.useCallback(async (id: number) => {
    setCargandoCorridas(true)
    const { data } = await getCorridas(id)
    setCorridas(data)
    setCargandoCorridas(false)
  }, [])

  React.useEffect(() => {
    if (ordenId) cargarCorridas(Number(ordenId))
    else setCorridas([])
  }, [ordenId, cargarCorridas])

  function abrirNueva() {
    setHoraInicio(""); setHoraFin(""); setBuenas(""); setDefectuosas(""); setParos(""); setPlanificado(""); setNovedades("")
    setDefectos([])
    setNuevoOpen(true)
  }

  async function guardarCorrida() {
    if (!ordenSel) return
    if (!(Number(buenas) > 0 || Number(defectuosas) > 0)) {
      toast({ title: "Faltan unidades", description: "Indica las unidades buenas y/o defectuosas.", variant: "destructive" })
      return
    }
    setSaving(true)
    const res = await createCorrida({
      orden_id: ordenSel.id,
      producto_id: ordenSel.producto_id,
      hora_inicio: horaInicio ? new Date(horaInicio).toISOString() : null,
      hora_fin: horaFin ? new Date(horaFin).toISOString() : null,
      unidades_buenas: Number(buenas) || 0,
      unidades_defectuosas: Number(defectuosas) || 0,
      paros_minutos: Number(paros) || 0,
      tiempo_planificado_minutos: planificado ? Number(planificado) : null,
      novedades: novedades || null,
      defectos: defectos.map((d) => ({ motivo: d.motivo, cantidad: Number(d.cantidad) || 0 })),
    })
    setSaving(false)
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" })
      return
    }
    toast({ title: "Corrida registrada", description: "Ejecútala para descontar los materiales de la receta." })
    setNuevoOpen(false)
    cargarCorridas(ordenSel.id)
  }

  async function ejecutar(c: Corrida) {
    setEjecutandoId(c.id)
    const res = await ejecutarCorrida(c.id)
    setEjecutandoId(null)
    if (!res.success) {
      toast({ title: "No se pudo ejecutar", description: res.error || "Error", variant: "destructive" })
      return
    }
    toast({ title: "Corrida ejecutada", description: "Materiales descontados; costo real calculado (ver la fila)." })
    cargarCorridas(c.orden_id)
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
          <Gauge className="h-6 w-6 text-stone-600" /> Control de Piso
        </h1>
        <p className="text-sm text-muted-foreground">
          Registra las corridas de cada orden (unidades, horas, paros, defectos). Al ejecutar, se descuentan los materiales.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : (
        <Card className="rounded-xl border-stone-200">
          <CardHeader className="p-4 md:p-6 pb-3">
            <CardTitle className="text-base md:text-lg">Orden de producción</CardTitle>
            <CardDescription className="text-xs md:text-sm">Elige una orden abierta o en proceso para ver y registrar sus corridas.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="grid gap-1.5 flex-1">
                <Label className="text-xs">Orden</Label>
                <Select value={ordenId} onValueChange={setOrdenId}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar orden…" /></SelectTrigger>
                  <SelectContent>
                    {ordenes.length === 0 && <div className="px-2 py-3 text-sm text-stone-500 text-center">No hay órdenes abiertas.</div>}
                    {ordenes.map((o) => (
                      <SelectItem key={o.id} value={String(o.id)}>
                        {o.producto_nombre} · {o.cantidad_objetivo} und · {o.estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {ordenSel && (
                <Button onClick={abrirNueva} disabled={!ordenSel.receta_id}>
                  <Plus className="h-4 w-4 mr-1" /> Registrar corrida
                </Button>
              )}
            </div>

            {ordenSel && !ordenSel.receta_id && (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-2 text-xs text-amber-800 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Esta orden no tiene receta; define la receta del producto para poder registrar corridas con consumo de material.
              </div>
            )}

            {ordenId && (
              cargandoCorridas ? (
                <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>
              ) : corridas.length === 0 ? (
                <p className="text-center py-8 text-sm text-stone-400">Sin corridas para esta orden.</p>
              ) : (
                <div className="rounded-lg border border-stone-200 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">Buenas</TableHead>
                        <TableHead className="text-right">Defect.</TableHead>
                        <TableHead className="text-right">Paros (min)</TableHead>
                        <TableHead className="text-right">Costo unit. real</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="w-28"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {corridas.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="text-right font-medium">{c.unidades_buenas}</TableCell>
                          <TableCell className="text-right text-red-600">{c.unidades_defectuosas || 0}</TableCell>
                          <TableCell className="text-right text-stone-600">{c.paros_minutos || 0}</TableCell>
                          <TableCell className="text-right">{c.estado === "Registrada" ? "-" : formatCurrency(c.costo_unitario_real)}</TableCell>
                          <TableCell>{estadoCorridaBadge(c.estado)}</TableCell>
                          <TableCell>
                            {c.estado === "Registrada" ? (
                              <Button size="sm" variant="outline" className="h-8 gap-1" disabled={ejecutandoId === c.id} onClick={() => ejecutar(c)}>
                                {ejecutandoId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
                                Ejecutar
                              </Button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Ejecutada</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}

      {/* Nueva corrida */}
      <Dialog open={nuevoOpen} onOpenChange={setNuevoOpen}>
        <DialogContent className="max-w-lg max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar corrida</DialogTitle>
            <DialogDescription>{ordenSel?.producto_nombre}. El consumo se calcula sobre las unidades procesadas (buenas + defectuosas).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label className="text-xs">Hora inicio</Label><Input type="datetime-local" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="h-9" /></div>
              <div className="grid gap-1.5"><Label className="text-xs">Hora fin</Label><Input type="datetime-local" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="h-9" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label className="text-xs">Unidades buenas</Label><Input type="number" min="0" value={buenas} onChange={(e) => setBuenas(e.target.value)} className="h-10 text-base" placeholder="0" /></div>
              <div className="grid gap-1.5"><Label className="text-xs">Unidades defectuosas</Label><Input type="number" min="0" value={defectuosas} onChange={(e) => setDefectuosas(e.target.value)} className="h-10 text-base" placeholder="0" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label className="text-xs">Paros (minutos)</Label><Input type="number" min="0" value={paros} onChange={(e) => setParos(e.target.value)} className="h-9" placeholder="0" /></div>
              <div className="grid gap-1.5"><Label className="text-xs">Tiempo planificado (min)</Label><Input type="number" min="0" value={planificado} onChange={(e) => setPlanificado(e.target.value)} className="h-9" placeholder="turno" /></div>
            </div>

            {/* Motivos de defecto */}
            {Number(defectuosas) > 0 && (
              <div className="space-y-2">
                <Label className="text-xs">Motivos de defecto (opcional)</Label>
                {defectos.map((d) => (
                  <div key={d._id} className="flex items-center gap-2">
                    <Input value={d.motivo} onChange={(e) => setDefectos((p) => p.map((x) => x._id === d._id ? { ...x, motivo: e.target.value } : x))} placeholder="Motivo" className="h-9 flex-1" />
                    <Input type="number" min="0" value={d.cantidad} onChange={(e) => setDefectos((p) => p.map((x) => x._id === d._id ? { ...x, cantidad: e.target.value } : x))} placeholder="Cant." className="h-9 w-20" />
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-8 text-stone-500 hover:text-destructive" onClick={() => setDefectos((p) => p.filter((x) => x._id !== d._id))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setDefectos((p) => [...p, { _id: nid(), motivo: "", cantidad: "" }])}>
                  <Plus className="h-4 w-4" /> Agregar motivo
                </Button>
              </div>
            )}

            <div className="grid gap-1.5"><Label className="text-xs">Novedades</Label><Textarea value={novedades} onChange={(e) => setNovedades(e.target.value)} rows={2} placeholder="Opcional" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNuevoOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={guardarCorrida} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
