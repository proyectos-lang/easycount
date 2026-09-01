"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Building2, Plus, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { crearEmpresaAction } from "./actions"

type Campos = {
  nombre_empresa: string
  nombre_comercial: string
  documento: string
  correo: string
  telefono: string
  direccion: string
  admin_nombre: string
  admin_email: string
  admin_password: string
}

const VACIO: Campos = {
  nombre_empresa: "", nombre_comercial: "", documento: "", correo: "", telefono: "", direccion: "",
  admin_nombre: "", admin_email: "", admin_password: "",
}

export function CrearEmpresaDialog() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [f, setF] = React.useState<Campos>(VACIO)
  const [guardando, setGuardando] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [verPass, setVerPass] = React.useState(false)
  const [creada, setCreada] = React.useState<{ empresa: string; email: string } | null>(null)

  function set<K extends keyof Campos>(k: K, v: string) {
    setF((prev) => ({ ...prev, [k]: v }))
  }

  function reset() {
    setF(VACIO); setError(null); setCreada(null); setVerPass(false)
  }

  async function guardar() {
    setError(null)
    setGuardando(true)
    try {
      const res = await crearEmpresaAction({
        nombre_empresa: f.nombre_empresa,
        documento: f.documento,
        nombre_comercial: f.nombre_comercial || undefined,
        correo: f.correo || undefined,
        telefono: f.telefono || undefined,
        direccion: f.direccion || undefined,
        admin_nombre: f.admin_nombre,
        admin_email: f.admin_email,
        admin_password: f.admin_password,
      })
      if (res.error) {
        setError(res.error)
        return
      }
      setCreada({ empresa: f.nombre_empresa.trim(), email: f.admin_email.trim().toLowerCase() })
      router.refresh() // recarga la lista de empresas del portal
    } finally {
      setGuardando(false)
    }
  }

  const listo =
    f.nombre_empresa.trim() && f.documento.trim() &&
    f.admin_nombre.trim() && f.admin_email.trim().includes("@") &&
    f.admin_password.length >= 6

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => { if (!guardando) { setOpen(o); if (!o) reset() } }}
    >
      <Button size="sm" className="gap-2 shrink-0" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Crear empresa
      </Button>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Nueva empresa
          </DialogTitle>
          <DialogDescription>
            Crea la razón social y su usuario administrador. El acceso queda validado y listo para iniciar sesión.
          </DialogDescription>
        </DialogHeader>

        {creada ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 text-sm">
              <p className="flex items-center gap-2 font-medium text-emerald-800">
                <CheckCircle2 className="h-5 w-5" /> Empresa creada
              </p>
              <div className="mt-2 space-y-1 text-stone-700">
                <p><span className="text-stone-500">Empresa:</span> <strong>{creada.empresa}</strong></p>
                <p><span className="text-stone-500">Usuario admin:</span> <strong>{creada.email}</strong></p>
                <p className="text-xs text-stone-500">Comparte estas credenciales con el cliente. Ya puede iniciar sesión.</p>
                <p className="text-xs text-stone-500">Se creó también un almacén «Principal» con bodega «General» (punto de venta) y el cliente «Consumidor Final».</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={reset}>Crear otra</Button>
              <Button onClick={() => { setOpen(false); reset() }}>Listo</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Empresa</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>Nombre / razón social *</Label>
                  <Input value={f.nombre_empresa} onChange={(e) => set("nombre_empresa", e.target.value)} placeholder="Inversiones XYZ" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Nombre comercial</Label>
                  <Input value={f.nombre_comercial} onChange={(e) => set("nombre_comercial", e.target.value)} placeholder="XYZ Store" />
                </div>
                <div className="grid gap-1.5">
                  <Label>RTN / documento *</Label>
                  <Input value={f.documento} onChange={(e) => set("documento", e.target.value)} placeholder="08011999123456" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Correo</Label>
                  <Input value={f.correo} onChange={(e) => set("correo", e.target.value)} placeholder="empresa@correo.com" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Teléfono</Label>
                  <Input value={f.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder="9999-9999" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Dirección</Label>
                  <Input value={f.direccion} onChange={(e) => set("direccion", e.target.value)} placeholder="Tegucigalpa" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Usuario administrador</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>Nombre del admin *</Label>
                  <Input value={f.admin_nombre} onChange={(e) => set("admin_nombre", e.target.value)} placeholder="Juan Pérez" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Correo (usuario) *</Label>
                  <Input type="email" value={f.admin_email} onChange={(e) => set("admin_email", e.target.value)} placeholder="admin@empresa.com" />
                </div>
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label>Contraseña *</Label>
                  <div className="relative">
                    <Input
                      type={verPass ? "text" : "password"}
                      value={f.admin_password}
                      onChange={(e) => set("admin_password", e.target.value)}
                      placeholder="mínimo 6 caracteres"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setVerPass((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      title={verPass ? "Ocultar" : "Mostrar"}
                    >
                      {verPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setOpen(false); reset() }} disabled={guardando}>Cancelar</Button>
              <Button onClick={guardar} disabled={!listo || guardando} className="gap-2">
                {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {guardando ? "Creando…" : "Crear empresa"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
