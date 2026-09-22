"use client"

import * as React from "react"
import { useAuth } from "@/lib/contexts/auth-context"

/**
 * Guarda un BORRADOR (estado en curso) en localStorage, por navegador y por
 * usuario, para que sobreviva a cerrar/refrescar el sistema. Pensado para
 * pantallas largas (p.ej. una recepción de compra) donde perder lo capturado
 * duele. SSR-safe y con try/catch (no rompe en modo privado o sin storage).
 *
 * Uso:
 *   const draft = usePersistentDraft<MiEstado>("recepcion-ia")
 *   // al montar, si draft.ready && draft.value != null -> restaurar
 *   // en cada cambio relevante -> draft.save(estadoActual)
 *   // al confirmar/descartar -> draft.clear()
 *
 * El valor DEBE ser serializable a JSON (nada de File, funciones, etc.).
 * Guarda con un pequeño debounce para no escribir en cada tecla.
 */
const PREFIX = "easycount:borrador:"

export function usePersistentDraft<T>(scope: string) {
  const { user } = useAuth()
  // Clave por usuario para que dos cuentas en el mismo navegador no se pisen.
  const key = user?.email ? `${PREFIX}${scope}:${user.email}` : null

  const [value, setValue] = React.useState<T | null>(null)
  const [ready, setReady] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Hidratación inicial: lee el borrador guardado (una sola vez por clave).
  React.useEffect(() => {
    if (!key) return
    let restored: T | null = null
    try {
      const raw = localStorage.getItem(key)
      if (raw) restored = JSON.parse(raw) as T
    } catch {
      restored = null
    }
    setValue(restored)
    setReady(true)
  }, [key])

  // Guarda (con debounce) el estado actual como borrador.
  const save = React.useCallback(
    (next: T) => {
      if (!key) return
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        try {
          localStorage.setItem(key, JSON.stringify(next))
        } catch {
          // Cuota llena / storage no disponible: se ignora (no rompe la UI).
        }
      }, 400)
    },
    [key]
  )

  // Borra el borrador (al confirmar la recepción o al descartar).
  const clear = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    setValue(null)
    if (!key) return
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignorar.
    }
  }, [key])

  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  return { ready, value, save, clear }
}
