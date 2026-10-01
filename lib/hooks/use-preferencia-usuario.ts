"use client"

import * as React from "react"
import { useAuth } from "@/lib/contexts/auth-context"

/**
 * Guarda una PREFERENCIA DE UI simple (un valor string) por navegador y por
 * usuario, para que persista entre sesiones. Pensado para toggles de vista
 * (p.ej. catálogo en lista vs cuadrícula) que deben recordarse para ese usuario.
 *
 * Misma convención que [[use-actualizaciones]]: clave `easycount:pref:<scope>:<email>`.
 * SSR-safe y con try/catch (no rompe en modo privado o sin storage).
 *
 * Uso:
 *   const [vista, setVista] = usePreferenciaUsuario("pos.catalogo.view", "grid")
 *   // `vista` arranca en el default y, tras hidratar, toma el valor guardado.
 */
const PREFIX = "easycount:pref:"

export function usePreferenciaUsuario<T extends string>(
  scope: string,
  defaultValue: T,
): [T, (next: T) => void] {
  const { user } = useAuth()
  const key = user?.email ? `${PREFIX}${scope}:${user.email}` : null

  const [value, setValue] = React.useState<T>(defaultValue)

  // Hidratación: lee el valor guardado una vez por clave.
  React.useEffect(() => {
    if (!key) return
    try {
      const saved = localStorage.getItem(key)
      if (saved != null) setValue(saved as T)
    } catch {
      // Ignorar (SSR / modo privado / storage no disponible).
    }
  }, [key])

  const update = React.useCallback(
    (next: T) => {
      setValue(next)
      if (!key) return
      try {
        localStorage.setItem(key, next)
      } catch {
        // Ignorar.
      }
    },
    [key],
  )

  return [value, update]
}
