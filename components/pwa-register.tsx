"use client"

import { useEffect } from "react"

/**
 * Registra el service worker (PWA instalable) y gestiona la
 * auto-actualizacion: revisa si hay una version nueva al cargar, al volver
 * el foco y cada 30 minutos; cuando el SW nuevo toma control
 * (controllerchange), recarga la pagina para servir el deploy nuevo.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
    // Evita registrar el SW en desarrollo (interfiere con HMR).
    if (process.env.NODE_ENV !== "production") return

    let recargando = false

    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((registro) => {
        // Busca versiones nuevas periodicamente y al volver a la pestana.
        const revisar = () => registro.update().catch(() => {})
        const intervalo = setInterval(revisar, 30 * 60 * 1000)
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") revisar()
        })
        window.addEventListener("beforeunload", () => clearInterval(intervalo))
      })
      .catch(() => {})

    // Cuando el SW nuevo toma control (deploy nuevo), recarga una sola vez.
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (recargando) return
      recargando = true
      window.location.reload()
    })
  }, [])

  return null
}
