"use client"

import * as React from "react"
import { Users, Plus, Loader2, ChevronDown, ChevronRight, KeyRound, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  listarUsuariosEmpresa, listarPermisosUsuario, crearUsuarioEmpresaAction,
  setPermisoUsuarioAction, setRolUsuarioAction, setActivoUsuarioAction, resetPasswordUsuarioAction,
} from "./usuarios-actions"

interface Usuario { id: string; nombre: string; rol: string | null; activo: boolean }
interface Modulo { id: number; nombre: string }

const esAdmin = (rol: string | null) => (rol || "").trim().toLowerCase() === "admin"

export function GestionUsuariosDialog({
  razonSocialId,
  empresaNombre,
}: {
  razonSocialId: number
  empresaNombre: string
}) {
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [usuarios, setUsuarios] = React.useState<Usuario[]>([])
  const [modulos, setModulos] = React.useState<Modulo[]>([])

  const [nuevo, setNuevo] = React.useState<{ nombre: string; email: string; password: string; rol: "admin" | "usuario" }>({
    nombre: "", email: "", password: "", rol: "usuario",
  })
  const [creando, setCreando] = React.useState(false)
  const [verPass, setVerPass] = React.useState(false)

  const [expandido, setExpandido] = React.useState<string | null>(null)
  const [permisos, setPermisos] = React.useState<Record<number, boolean>>({})
  const [loadingPermisos, setLoadingPermisos] = React.useState(false)
  const [savingId, setSavingId] = React.useState<string | null>(null)

  const cargar = React.useCallback(async () => {
    setLoading(true)
    const r = await listarUsuariosEmpresa(razonSocialId)
    if (r.error) toast({ title: "Error", description: r.error, variant: "destructive" })
    setUsuarios(r.usuarios)
    setModulos(r.modulos)
    setLoading(false)
  }, [razonSocialId, toast])

  React.useEffect(() => {
    if (open) cargar()
  }, [open, cargar])

  async function crear() {
    if (!nuevo.nombre.trim() || !nuevo.email.trim().includes("@") || nuevo.password.length < 6) {
      toast({ title: "Datos incompletos", description: "Nombre, correo válido y contraseña de mínimo 6.", variant: "destructive" })
      return
    }
    setCreando(true)
    const res = await crearUsuarioEmpresaAction({ razonSocialId, ...nuevo })
    setCreando(false)
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" })
      return
    }
    toast({ title: "Usuario creado", description: nuevo.email.trim().toLowerCase() })
    setNuevo({ nombre: "", email: "", password: "", rol: "usuario" })
    cargar()
  }

  async function toggleExpand(u: Usuario) {
    if (expandido === u.id) { setExpandido(null); return }
    setExpandido(u.id)
    if (esAdmin(u.rol)) return
    setLoadingPermisos(true)
    const r = await listarPermisosUsuario(u.id)
    setPermisos(r.permisos || {})
    setLoadingPermisos(false)
  }

  async function togglePermiso(moduloId: number, next: boolean) {
    if (!expandido) return
    setPermisos((p) => ({ ...p, [moduloId]: next }))
    const res = await setPermisoUsuarioAction({ usuarioId: expandido, moduloId, puedeVer: next })
    if (res.error) {
      setPermisos((p) => ({ ...p, [moduloId]: !next }))
      toast({ title: "Error", description: res.error, variant: "destructive" })
    }
  }

  async function cambiarRol(u: Usuario, rol: "admin" | "usuario") {
    setSavingId(u.id)
    const res = await setRolUsuarioAction({ usuarioId: u.id, rol })
    setSavingId(null)
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" })
      return
    }
    setUsuarios((list) => list.map((x) => (x.id === u.id ? { ...x, rol: rol === "admin" ? "Admin" : "Usuario" } : x)))
  }

  async function toggleActivo(u: Usuario, activo: boolean) {
    setUsuarios((list) => list.map((x) => (x.id === u.id ? { ...x, activo } : x)))
    const res = await setActivoUsuarioAction({ usuarioId: u.id, activo })
    if (res.error) {
      setUsuarios((list) => list.map((x) => (x.id === u.id ? { ...x, activo: !activo } : x)))
      toast({ title: "Error", description: res.error, variant: "destructive" })
    }
  }

  async function resetPass(u: Usuario) {
    const pass = window.prompt(`Nueva contraseña para ${u.nombre} (mínimo 6):`)
    if (pass == null) return
    if (pass.length < 6) {
      toast({ title: "Muy corta", description: "La contraseña debe tener al menos 6 caracteres.", variant: "destructive" })
      return
    }
    const res = await resetPasswordUsuarioAction({ usuarioId: u.id, newPassword: pass })
    if (res.error) toast({ title: "Error", description: res.error, variant: "destructive" })
    else toast({ title: "Contraseña actualizada", description: u.nombre })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!creando) { setOpen(o); if (!o) setExpandido(null) } }}>
      <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => setOpen(true)}>
        <Users className="h-3.5 w-3.5" /> Usuarios
      </Button>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Usuarios · {empresaNombre}
          </DialogTitle>
          <DialogDescription>
            Crea usuarios y ajusta sus permisos por módulo. Un usuario con rol Admin ve todos los módulos.
          </DialogDescription>
        </DialogHeader>

        {/* Crear usuario */}
        <div className="rounded-lg border p-3 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Nuevo usuario</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input placeholder="Nombre" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
            <Input type="email" placeholder="Correo" value={nuevo.email} onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })} />
            <div className="relative">
              <Input
                type={verPass ? "text" : "password"}
                placeholder="Contraseña (mín. 6)"
                value={nuevo.password}
                onChange={(e) => setNuevo({ ...nuevo, password: e.target.value })}
                className="pr-10"
              />
              <button type="button" onClick={() => setVerPass((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                {verPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Select value={nuevo.rol} onValueChange={(v) => setNuevo({ ...nuevo, rol: v as "admin" | "usuario" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="usuario">Usuario (permisos por módulo)</SelectItem>
                <SelectItem value="admin">Admin (ve todo)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={crear} disabled={creando} className="gap-1.5">
              {creando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Crear
            </Button>
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Usuarios ({usuarios.length})</p>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-stone-400" /></div>
          ) : usuarios.length === 0 ? (
            <p className="py-4 text-center text-sm text-stone-400">Esta empresa aún no tiene usuarios.</p>
          ) : (
            <div className="divide-y rounded-lg border">
              {usuarios.map((u) => (
                <div key={u.id} className="p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <button className="text-stone-400 hover:text-stone-600" onClick={() => toggleExpand(u)} title="Permisos">
                      {expandido === u.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-stone-800">{u.nombre}</p>
                    <Select
                      value={esAdmin(u.rol) ? "admin" : "usuario"}
                      onValueChange={(v) => cambiarRol(u, v as "admin" | "usuario")}
                      disabled={savingId === u.id}
                    >
                      <SelectTrigger className="h-8 w-[120px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usuario">Usuario</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1.5">
                      <Switch checked={u.activo} onCheckedChange={(v) => toggleActivo(u, v)} />
                      <span className="text-xs text-stone-500">{u.activo ? "Activo" : "Inactivo"}</span>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 gap-1" onClick={() => resetPass(u)} title="Restablecer contraseña">
                      <KeyRound className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {expandido === u.id && (
                    <div className="mt-3 border-t pt-3">
                      {esAdmin(u.rol) ? (
                        <p className="text-xs text-emerald-700">Este usuario es Admin: ve todos los módulos.</p>
                      ) : loadingPermisos ? (
                        <div className="flex justify-center py-3"><Loader2 className="h-4 w-4 animate-spin text-stone-400" /></div>
                      ) : (
                        <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
                          {modulos.map((m) => (
                            <label key={m.id} className="flex items-center justify-between gap-2 text-sm">
                              <span className="truncate text-stone-700">{m.nombre}</span>
                              <Switch checked={!!permisos[m.id]} onCheckedChange={(v) => togglePermiso(m.id, v)} />
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
