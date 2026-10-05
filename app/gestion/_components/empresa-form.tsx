"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ESTADOS_EMPRESA, ETIQUETA_ESTADO, finPrueba, type Ciclo, type EstadoEmpresa } from "@/lib/gestion/reglas"
import { guardarEmpresa } from "@/app/gestion/actions"
import type { GEmpresa, GConfig } from "@/lib/services/gestion"
import { fmtFecha } from "./ui"

type Datos = {
  nombre: string; nombre_comercial: string; dueno: string; contacto_principal: string; telefono: string; whatsapp: string; correo: string; ciudad: string; pais: string; redes: string; sucursales: string
  plan: string; cuota: string; moneda: string; ciclo_cobro: Ciclo; dia_cobro: string; fecha_proximo_pago: string; fecha_instalacion: string; fecha_inicio_prueba: string; observaciones: string
  estado: EstadoEmpresa
}

function desde(e: Partial<GEmpresa> | null | undefined, moneda: string, hoy: string): Datos {
  return {
    nombre: e?.nombre ?? "", nombre_comercial: e?.nombre_comercial ?? "", dueno: e?.dueno ?? "", contacto_principal: e?.contacto_principal ?? "", telefono: e?.telefono ?? "",
    whatsapp: e?.whatsapp ?? "", correo: e?.correo ?? "", ciudad: e?.ciudad ?? "", pais: e?.pais ?? "Honduras", redes: e?.redes ?? "", sucursales: String(e?.sucursales ?? 1),
    plan: e?.plan ?? "", cuota: e?.cuota ? String(e.cuota) : "", moneda: e?.moneda ?? moneda, ciclo_cobro: e?.ciclo_cobro ?? "mensual",
    dia_cobro: e?.dia_cobro ? String(e.dia_cobro) : "", fecha_proximo_pago: e?.fecha_proximo_pago ?? "", fecha_instalacion: e?.fecha_instalacion ?? (e?.estado === "prueba" ? hoy : ""),
    fecha_inicio_prueba: e?.fecha_inicio_prueba ?? "", observaciones: e?.observaciones ?? "", estado: e?.estado ?? "prospecto",
  }
}

/**
 * Modal "Nueva empresa / Editar empresa" en 3 secciones. Puede ser controlado
 * (abierto/onOpenChange: p. ej. convertir un prospecto en cliente con datos
 * precargados) o traer su propio botón.
 */
export function EmpresaForm({ empresa, config, hoy, abierto, onOpenChange, trigger, titulo }: {
  empresa?: Partial<GEmpresa> | null
  config: Pick<GConfig, "dias_prueba" | "moneda" | "planes">
  hoy: string
  abierto?: boolean
  onOpenChange?: (o: boolean) => void
  trigger?: React.ReactNode
  titulo?: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [abiertoLocal, setAbiertoLocal] = React.useState(false)
  const open = abierto ?? abiertoLocal
  const setOpen = onOpenChange ?? setAbiertoLocal
  const [f, setF] = React.useState<Datos>(() => desde(empresa, config.moneda, hoy))
  const [guardando, setGuardando] = React.useState(false)
  const esEdicion = !!empresa?.id
  const up = (k: keyof Datos, v: string) => setF((p) => ({ ...p, [k]: v }))

  function elegirPlan(nombre: string) {
    const p = config.planes.find((x) => x.nombre === nombre)
    setF((prev) => ({ ...prev, plan: nombre === "__otro" ? "" : nombre, ...(p ? { cuota: String(p.cuota), ciclo_cobro: p.ciclo } : {}) }))
  }

  async function guardar() {
    if (!f.nombre.trim()) return toast({ title: "El nombre es obligatorio", variant: "destructive" })
    setGuardando(true)
    const res = await guardarEmpresa({
      id: empresa?.id, nombre: f.nombre, nombre_comercial: f.nombre_comercial, dueno: f.dueno, contacto_principal: f.contacto_principal, telefono: f.telefono, whatsapp: f.whatsapp,
      correo: f.correo, ciudad: f.ciudad, pais: f.pais, redes: f.redes, sucursales: Number(f.sucursales) || 1, plan: f.plan, cuota: Number(f.cuota) || 0, moneda: f.moneda,
      ciclo_cobro: f.ciclo_cobro, dia_cobro: f.ciclo_cobro === "mensual" && f.dia_cobro ? Number(f.dia_cobro) : null,
      fecha_proximo_pago: f.ciclo_cobro === "anual" && f.fecha_proximo_pago ? f.fecha_proximo_pago : (esEdicion ? undefined : null),
      fecha_instalacion: f.fecha_instalacion || null, fecha_inicio_prueba: f.fecha_inicio_prueba || null, observaciones: f.observaciones, estado: f.estado,
    })
    setGuardando(false)
    if (!res.data) return toast({ title: "No se pudo guardar", description: res.error ?? "Error desconocido", variant: "destructive" })
    toast({ title: esEdicion ? "Empresa actualizada" : "Empresa creada" })
    setOpen(false)
    if (!esEdicion) router.push(`/gestion/empresas/${res.data}`)
  }

  const fin = f.fecha_instalacion ? finPrueba(f.fecha_instalacion, config.dias_prueba) : null

  return (
    <>
      {trigger !== undefined ? <span onClick={() => setOpen(true)}>{trigger}</span> : abierto === undefined ? (
        <Button onClick={() => setOpen(true)} size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Nueva empresa</Button>
      ) : null}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90dvh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-3 border-b">
            <DialogTitle>{titulo ?? (esEdicion ? "Editar empresa" : "Nueva empresa")}</DialogTitle>
            <DialogDescription>Información de la empresa, su plan en EasyCount y el estado del cliente.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-6">
            <Seccion n={1} titulo="Información de la empresa">
              <div className="grid gap-3 sm:grid-cols-2">
                <Campo label="Nombre *"><Input value={f.nombre} onChange={(e) => up("nombre", e.target.value)} /></Campo>
                <Campo label="Nombre comercial"><Input value={f.nombre_comercial} onChange={(e) => up("nombre_comercial", e.target.value)} /></Campo>
                <Campo label="Dueño"><Input value={f.dueno} onChange={(e) => up("dueno", e.target.value)} /></Campo>
                <Campo label="Contacto principal"><Input value={f.contacto_principal} onChange={(e) => up("contacto_principal", e.target.value)} /></Campo>
                <Campo label="Teléfono"><Input value={f.telefono} onChange={(e) => up("telefono", e.target.value)} /></Campo>
                <Campo label="WhatsApp"><Input value={f.whatsapp} onChange={(e) => up("whatsapp", e.target.value)} /></Campo>
                <Campo label="Correo"><Input type="email" value={f.correo} onChange={(e) => up("correo", e.target.value)} /></Campo>
                <Campo label="Redes"><Input value={f.redes} onChange={(e) => up("redes", e.target.value)} placeholder="@instagram, facebook…" /></Campo>
                <Campo label="Ciudad"><Input value={f.ciudad} onChange={(e) => up("ciudad", e.target.value)} /></Campo>
                <Campo label="País"><Input value={f.pais} onChange={(e) => up("pais", e.target.value)} /></Campo>
                <Campo label="Sucursales"><Input type="number" min="1" value={f.sucursales} onChange={(e) => up("sucursales", e.target.value)} /></Campo>
              </div>
            </Seccion>

            <Seccion n={2} titulo="Información EasyCount">
              <div className="grid gap-3 sm:grid-cols-2">
                <Campo label="Plan">
                  {config.planes.length > 0 ? (
                    <Select value={config.planes.some((p) => p.nombre === f.plan) ? f.plan : "__otro"} onValueChange={elegirPlan}>
                      <SelectTrigger><SelectValue placeholder="Plan" /></SelectTrigger>
                      <SelectContent>
                        {config.planes.map((p) => <SelectItem key={p.nombre} value={p.nombre}>{p.nombre} · {p.cuota} {p.ciclo}</SelectItem>)}
                        <SelectItem value="__otro">Otro / personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : <Input value={f.plan} onChange={(e) => up("plan", e.target.value)} placeholder="Básico, Pro…" />}
                </Campo>
                <Campo label={`Cuota (${f.moneda})`}><Input type="number" min="0" step="0.01" inputMode="decimal" value={f.cuota} onChange={(e) => up("cuota", e.target.value)} /></Campo>
                <Campo label="Ciclo de cobro">
                  <div className="inline-flex rounded-lg border bg-stone-50 p-1 text-sm">
                    {(["mensual", "anual"] as Ciclo[]).map((c) => (
                      <button key={c} type="button" onClick={() => up("ciclo_cobro", c)} className={cn("rounded-md px-4 py-1.5 font-medium transition-colors", f.ciclo_cobro === c ? "bg-white shadow-sm text-stone-800" : "text-stone-500")}>
                        {c === "mensual" ? "Mensual" : "Anual"}
                      </button>
                    ))}
                  </div>
                </Campo>
                {f.ciclo_cobro === "mensual" ? (
                  <Campo label="Día de cobro (1–31)"><Input type="number" min="1" max="31" value={f.dia_cobro} onChange={(e) => up("dia_cobro", e.target.value)} /></Campo>
                ) : (
                  <Campo label="Fecha de cobro anual"><Input type="date" value={f.fecha_proximo_pago} onChange={(e) => up("fecha_proximo_pago", e.target.value)} /></Campo>
                )}
                <Campo label="Fecha de instalación"><Input type="date" value={f.fecha_instalacion} onChange={(e) => up("fecha_instalacion", e.target.value)} /></Campo>
                <Campo label="Inicio de prueba"><Input type="date" value={f.fecha_inicio_prueba} onChange={(e) => up("fecha_inicio_prueba", e.target.value)} placeholder="= instalación" /></Campo>
                <Campo label="Moneda"><Input value={f.moneda} onChange={(e) => up("moneda", e.target.value)} className="w-24" /></Campo>
              </div>
              {fin && (
                <p className="mt-2 rounded-md bg-sky-50 px-3 py-2 text-xs text-sky-800">
                  Su prueba termina el <strong>{fmtFecha(fin)}</strong> ({config.dias_prueba} días desde la instalación).
                </p>
              )}
              <div className="mt-3"><Campo label="Observaciones"><Textarea rows={2} value={f.observaciones} onChange={(e) => up("observaciones", e.target.value)} /></Campo></div>
            </Seccion>

            <Seccion n={3} titulo="Estado del cliente">
              <div className="flex flex-wrap gap-1.5">
                {ESTADOS_EMPRESA.map((s) => (
                  <button key={s} type="button" onClick={() => up("estado", s)} className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors", f.estado === s ? "border-stone-800 bg-stone-800 text-white" : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50")}>
                    {ETIQUETA_ESTADO[s]}
                  </button>
                ))}
              </div>
              {(f.estado === "activo" || f.estado === "pago_pendiente") && f.ciclo_cobro === "mensual" && !f.dia_cobro && (
                <p className="mt-2 text-xs text-amber-700">Indica el día de cobro para calcular el próximo pago.</p>
              )}
            </Seccion>
          </div>
          <div className="flex justify-end gap-2 border-t px-6 py-3">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={guardando}>Cancelar</Button>
            <Button onClick={guardar} disabled={guardando}>{guardando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {esEdicion ? "Guardar cambios" : "Crear empresa"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Seccion({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-800">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-800 text-[11px] text-white">{n}</span> {titulo}
      </h3>
      {children}
    </section>
  )
}
function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-1.5"><Label className="text-xs text-stone-600">{label}</Label>{children}</div>
}
