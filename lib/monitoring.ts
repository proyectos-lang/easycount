"use client"

/**
 * Monitoreo de errores del lado del cliente.
 *
 * `reportarError` envia el error a /api/log-error (tabla errores_log,
 * script 022). `instalarCapturaGlobal` engancha window.onerror y
 * unhandledrejection una sola vez. Todo es best-effort y con un limite de
 * reportes por sesion para no inundar el log ante errores en bucle.
 */

let instalado = false
let reportesEnviados = 0
const MAX_REPORTES_POR_SESION = 20

export function reportarError(
  error: unknown,
  origen: string,
  extra?: { usuario?: string; razon_social_id?: number | null }
): void {
  if (typeof window === "undefined") return
  if (reportesEnviados >= MAX_REPORTES_POR_SESION) return
  reportesEnviados++

  const err = error instanceof Error ? error : new Error(String(error))
  try {
    void fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mensaje: err.message,
        stack: err.stack,
        url: window.location.href,
        origen,
        usuario: extra?.usuario,
        razon_social_id: extra?.razon_social_id ?? null,
      }),
      // keepalive permite que el reporte salga aunque la pagina se cierre.
      keepalive: true,
    })
  } catch {
    // Nunca dejar que el monitoreo genere errores propios.
  }
}

export function instalarCapturaGlobal(): void {
  if (typeof window === "undefined" || instalado) return
  instalado = true

  window.addEventListener("error", (event) => {
    reportarError(event.error ?? event.message, "window.onerror")
  })

  window.addEventListener("unhandledrejection", (event) => {
    reportarError(event.reason, "unhandledrejection")
  })
}
