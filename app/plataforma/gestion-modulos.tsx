"use client"

import * as React from "react"
import { Boxes, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { MODULOS, CATEGORIAS_ORDEN } from "@/lib/constants/modulos"
import { listarModulosDeshabilitados, setModuloEmpresaAction } from "./usuarios-actions"

/**
 * Diálogo de super-admin: activa/desactiva módulos para TODA una empresa.
 * Un módulo desactivado no lo ve nadie de esa empresa (ni el admin) y no
 * aparece en la sección de permisos de Configuración → Usuarios.
 */
export function GestionModulosDialog({
  razonSocialId,
  empresaNombre,
}: {
  razonSocialId: number
  empresaNombre: string
}) {
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [deshabilitados, setDeshabilitados] = React.useState<Set<string>>(new Set())

  const cargar = React.useCallback(async () => {
    setLoading(true)
    const r = await listarModulosDeshabilitados(razonSocialId)
    if (r.error) toast({ title: "Error", description: r.error, variant: "destructive" })
    setDeshabilitados(new Set(r.nombres))
    setLoading(false)
  }, [razonSocialId, toast])

  React.useEffect(() => {
    if (open) cargar()
  }, [open, cargar])

  async function toggle(nombre: string, habilitado: boolean) {
    setDeshabilitados((prev) => {
      const n = new Set(prev)
      if (habilitado) n.delete(nombre)
      else n.add(nombre)
      return n
    })
    const res = await setModuloEmpresaAction({ razonSocialId, moduloNombre: nombre, habilitado })
    if (res.error) {
      setDeshabilitados((prev) => {
        const n = new Set(prev)
        if (habilitado) n.add(nombre)
        else n.delete(nombre)
        return n
      })
      toast({ title: "Error", description: res.error, variant: "destructive" })
    }
  }

  const grupos = CATEGORIAS_ORDEN.map((cat) => ({
    cat,
    mods: MODULOS.filter((m) => m.categoria === cat),
  })).filter((g) => g.mods.length > 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => setOpen(true)}>
        <Boxes className="h-3.5 w-3.5" /> Módulos
      </Button>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Boxes className="h-5 w-5" /> Módulos · {empresaNombre}
          </DialogTitle>
          <DialogDescription>
            Activa o desactiva módulos para toda la empresa. Un módulo desactivado no lo ve nadie (ni el
            admin) y no aparece en sus permisos.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-stone-400" /></div>
        ) : (
          <div className="space-y-4">
            {grupos.map(({ cat, mods }) => (
              <div key={cat}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">{cat}</p>
                <div className="divide-y rounded-lg border">
                  {mods.map((m) => {
                    const habilitado = !deshabilitados.has(m.nombre)
                    return (
                      <label key={m.nombre} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                        <span className={habilitado ? "text-stone-700" : "text-stone-400 line-through"}>{m.nombre}</span>
                        <Switch checked={habilitado} onCheckedChange={(v) => toggle(m.nombre, v)} />
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
