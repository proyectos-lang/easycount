"use client"

import * as React from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { ULTIMA_ACTUALIZACION_ID } from "@/lib/constants/actualizaciones"

const PREFIX = "easycount:actualizacion-vista:"

/**
 * Controla la "novedad" del changelog por navegador y por usuario: guarda en
 * localStorage el id de la última actualización que el usuario ya vio. Si el id
 * más reciente difiere del guardado, `hayNueva` es true (se muestra el modal y
 * un punto en el sidebar). `marcarVista()` la marca como vista.
 */
export function useActualizaciones() {
  const { user } = useAuth()
  const key = user?.email ? PREFIX + user.email : null

  const [vistaId, setVistaId] = React.useState<string | null>(null)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    if (!key) return
    let guardado: string | null = null
    try {
      guardado = localStorage.getItem(key)
    } catch {
      guardado = null
    }
    setVistaId(guardado)
    setReady(true)
  }, [key])

  const hayNueva = ready && !!ULTIMA_ACTUALIZACION_ID && vistaId !== ULTIMA_ACTUALIZACION_ID

  const marcarVista = React.useCallback(() => {
    if (!key) return
    try {
      localStorage.setItem(key, ULTIMA_ACTUALIZACION_ID)
    } catch {
      // Ignorar (modo privado / storage no disponible).
    }
    setVistaId(ULTIMA_ACTUALIZACION_ID)
  }, [key])

  return { hayNueva, marcarVista, ultimaId: ULTIMA_ACTUALIZACION_ID }
}
