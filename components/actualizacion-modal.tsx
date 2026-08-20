"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useActualizaciones } from "@/lib/hooks/use-actualizaciones"
import { ACTUALIZACIONES } from "@/lib/constants/actualizaciones"

/**
 * Aviso al entrar/refrescar: si hay una actualización que el usuario no ha
 * visto, muestra un modal que lo invita a la sección de Actualizaciones.
 * Se monta una sola vez en el layout del dashboard.
 */
export function ActualizacionModal() {
  const router = useRouter()
  const { hayNueva, marcarVista } = useActualizaciones()
  const [open, setOpen] = React.useState(false)
  const ultima = ACTUALIZACIONES[0]

  React.useEffect(() => {
    if (hayNueva) setOpen(true)
  }, [hayNueva])

  if (!ultima) return null

  function cerrar() {
    marcarVista()
    setOpen(false)
  }
  function verActualizaciones() {
    marcarVista()
    setOpen(false)
    router.push("/actualizaciones")
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) cerrar() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-white border border-stone-200 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/easycount-logo.jpeg" alt="EasyCount" className="h-14 w-14 object-contain" />
          </div>
          <DialogTitle className="text-center">¡Hemos implementado una actualización!</DialogTitle>
          <DialogDescription className="text-center">
            Ve a la sección de Actualizaciones para saber de qué se trata.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-stone-50 p-3 text-center">
          <p className="text-sm font-medium text-stone-800">{ultima.titulo}</p>
          <p className="text-xs text-stone-500 mt-0.5">{ultima.resumen}</p>
        </div>

        <DialogFooter className="sm:justify-center gap-2">
          <Button variant="outline" onClick={cerrar}>Ahora no</Button>
          <Button onClick={verActualizaciones}>Ver actualizaciones</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
