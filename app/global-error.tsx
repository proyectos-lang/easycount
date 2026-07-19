"use client"

import { useEffect } from "react"
import { reportarError } from "@/lib/monitoring"

/**
 * Error boundary de ULTIMO recurso (falla el layout raiz). Debe renderizar
 * su propio <html>/<body>. Sin dependencias de UI para minimizar riesgo.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    reportarError(error, "react-global-boundary")
  }, [error])

  return (
    <html lang="es">
      <body style={{ fontFamily: "system-ui", background: "#fafaf9", color: "#44403c" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ textAlign: "center", maxWidth: 420 }}>
            <h1 style={{ margin: "0 0 8px" }}>Algo salió mal</h1>
            <p style={{ margin: "0 0 16px", fontSize: 14 }}>
              Ocurrió un error inesperado. El detalle quedó registrado.
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #d6d3d1", background: "#fff", cursor: "pointer" }}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
