"use client"

import * as React from "react"
import { Loader2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ETIQUETA_CATEGORIA, type Ciclo } from "@/lib/gestion/reglas"
import { guardarConfig, guardarCuenta } from "@/app/gestion/actions"
import type { GConfig, GCuenta } from "@/lib/services/gestion"
import { Panel } from "./ui"

export function ConfigForm({ config, cuentas }: { config: GConfig; cuentas: GCuenta[] }) {
  const { toast } = useToast()
  const [dias, setDias] = React.useState(String(config.dias_prueba))
  const [moneda, setMoneda] = React.useState(config.moneda)
  const [planes, setPlanes] = React.useState(config.planes)
  const [categorias, setCategorias] = React.useState(config.categorias_gasto)
  const [plantillas, setPlantillas] = React.useState(config.plantillas_recordatorio)
  const [nuevaCat, setNuevaCat] = React.useState("")
  const [guardando, setGuardando] = React.useState<string | null>(null)
  const [nuevaCuenta, setNuevaCuenta] = React.useState({ nombre: "", banco: "", moneda: "HNL" })

  async function guardar(clave: string, parcial: Partial<GConfig>) {
    setGuardando(clave)
    const res = await guardarConfig(parcial)
    setGuardando(null)
    if (res.error) return toast({ title: "No se pudo guardar", description: res.error, variant: "destructive" })
    toast({ title: "Configuración guardada" })
  }
  async function cuenta(input: { id?: number; nombre: string; banco?: string | null; moneda?: string; activo?: boolean }) {
    const res = await guardarCuenta(input)
    if (res.error) return toast({ title: "No se pudo guardar la cuenta", description: res.error, variant: "destructive" })
    toast({ title: "Cuenta guardada" })
    setNuevaCuenta({ nombre: "", banco: "", moneda: "HNL" })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel titulo="General" descripcion="Días de prueba gratis y moneda por defecto.">
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5"><Label>Días de prueba</Label><Input type="number" min="1" value={dias} onChange={(e) => setDias(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label>Moneda</Label><Input value={moneda} onChange={(e) => setMoneda(e.target.value)} placeholder="L" /></div>
        </div>
        <div className="mt-3 flex justify-end"><Button size="sm" onClick={() => guardar("general", { dias_prueba: Number(dias) || 10, moneda: moneda || "L" })} disabled={guardando === "general"}>{guardando === "general" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar</Button></div>
      </Panel>

      <Panel titulo="Cuentas bancarias" descripcion="Dónde se reciben los pagos (aparecen como tarjetas al registrar un pago).">
        <ul className="divide-y">
          {cuentas.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <div><p className="font-medium text-stone-800">{c.nombre}</p><p className="text-[11px] text-stone-500">{[c.banco, c.moneda].filter(Boolean).join(" · ")}</p></div>
              <label className="flex items-center gap-2 text-xs text-stone-500">{c.activo ? "Activa" : "Inactiva"}<Switch checked={c.activo} onCheckedChange={(v) => cuenta({ id: c.id, nombre: c.nombre, banco: c.banco, moneda: c.moneda, activo: v })} /></label>
            </li>
          ))}
        </ul>
        <div className="mt-3 grid grid-cols-[1fr_1fr_80px_auto] items-end gap-2">
          <div className="grid gap-1"><Label className="text-[11px]">Nombre</Label><Input className="h-8" value={nuevaCuenta.nombre} onChange={(e) => setNuevaCuenta({ ...nuevaCuenta, nombre: e.target.value })} /></div>
          <div className="grid gap-1"><Label className="text-[11px]">Banco</Label><Input className="h-8" value={nuevaCuenta.banco} onChange={(e) => setNuevaCuenta({ ...nuevaCuenta, banco: e.target.value })} /></div>
          <div className="grid gap-1"><Label className="text-[11px]">Moneda</Label><Input className="h-8" value={nuevaCuenta.moneda} onChange={(e) => setNuevaCuenta({ ...nuevaCuenta, moneda: e.target.value })} /></div>
          <Button size="sm" variant="outline" className="h-8" disabled={!nuevaCuenta.nombre.trim()} onClick={() => cuenta({ nombre: nuevaCuenta.nombre, banco: nuevaCuenta.banco || null, moneda: nuevaCuenta.moneda || "HNL" })}><Plus className="h-4 w-4" /></Button>
        </div>
      </Panel>

      <Panel titulo="Planes" descripcion="Se ofrecen al crear una empresa y precargan cuota y ciclo.">
        <div className="space-y-2">
          {planes.map((p, i) => (
            <div key={i} className="grid grid-cols-[1fr_110px_110px_auto] items-center gap-2">
              <Input className="h-8" value={p.nombre} onChange={(e) => setPlanes(planes.map((x, j) => (j === i ? { ...x, nombre: e.target.value } : x)))} placeholder="Nombre" />
              <Input className="h-8" type="number" min="0" step="0.01" value={p.cuota} onChange={(e) => setPlanes(planes.map((x, j) => (j === i ? { ...x, cuota: Number(e.target.value) || 0 } : x)))} />
              <select className="h-8 rounded-md border bg-white px-2 text-sm" value={p.ciclo} onChange={(e) => setPlanes(planes.map((x, j) => (j === i ? { ...x, ciclo: e.target.value as Ciclo } : x)))}><option value="mensual">Mensual</option><option value="anual">Anual</option></select>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-stone-400 hover:text-red-600" onClick={() => setPlanes(planes.filter((_, j) => j !== i))}><X className="h-4 w-4" /></Button>
            </div>
          ))}
          <div className="flex justify-between">
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setPlanes([...planes, { nombre: "", cuota: 0, ciclo: "mensual" }])}><Plus className="h-4 w-4" /> Plan</Button>
            <Button size="sm" onClick={() => guardar("planes", { planes: planes.filter((p) => p.nombre.trim()) })} disabled={guardando === "planes"}>{guardando === "planes" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar planes</Button>
          </div>
        </div>
      </Panel>

      <Panel titulo="Categorías de gasto">
        <div className="flex flex-wrap gap-1.5">
          {categorias.map((c) => (
            <span key={c} className="inline-flex items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-xs">{ETIQUETA_CATEGORIA[c] ?? c}<button type="button" onClick={() => setCategorias(categorias.filter((x) => x !== c))} className="text-stone-400 hover:text-red-600" aria-label="Quitar"><X className="h-3 w-3" /></button></span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input className="h-8" value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)} placeholder="nueva_categoria" onKeyDown={(e) => { if (e.key === "Enter" && nuevaCat.trim()) { setCategorias([...categorias, nuevaCat.trim().toLowerCase().replace(/\s+/g, "_")]); setNuevaCat("") } }} />
          <Button size="sm" variant="outline" className="h-8" disabled={!nuevaCat.trim()} onClick={() => { setCategorias([...categorias, nuevaCat.trim().toLowerCase().replace(/\s+/g, "_")]); setNuevaCat("") }}><Plus className="h-4 w-4" /></Button>
          <Button size="sm" className="h-8" onClick={() => guardar("categorias", { categorias_gasto: [...new Set(categorias)] })} disabled={guardando === "categorias"}>Guardar</Button>
        </div>
      </Panel>

      <Panel titulo="Plantillas de recordatorio" descripcion="Textos para recordar pagos por WhatsApp o correo. Usa {empresa}, {fecha} y {monto}." className="lg:col-span-2">
        <div className="space-y-3">
          {plantillas.map((p, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[220px_1fr_auto]">
              <Input className="h-8" value={p.nombre} onChange={(e) => setPlantillas(plantillas.map((x, j) => (j === i ? { ...x, nombre: e.target.value } : x)))} placeholder="Nombre" />
              <Textarea rows={2} value={p.texto} onChange={(e) => setPlantillas(plantillas.map((x, j) => (j === i ? { ...x, texto: e.target.value } : x)))} placeholder="Hola {empresa}, tu pago de {monto} vence el {fecha}…" />
              <Button size="icon" variant="ghost" className="h-8 w-8 text-stone-400 hover:text-red-600" onClick={() => setPlantillas(plantillas.filter((_, j) => j !== i))}><X className="h-4 w-4" /></Button>
            </div>
          ))}
          <div className="flex justify-between">
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setPlantillas([...plantillas, { nombre: "", texto: "" }])}><Plus className="h-4 w-4" /> Plantilla</Button>
            <Button size="sm" onClick={() => guardar("plantillas", { plantillas_recordatorio: plantillas.filter((p) => p.nombre.trim() || p.texto.trim()) })} disabled={guardando === "plantillas"}>{guardando === "plantillas" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar plantillas</Button>
          </div>
        </div>
      </Panel>
    </div>
  )
}
