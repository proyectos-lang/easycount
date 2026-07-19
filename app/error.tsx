"use client"

import { useEffect } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { reportarError } from "@/lib/monitoring"

/**
 * Error boundary de la app: pantalla amigable + reporte automatico al log
 * de errores. `reset` reintenta el render del segmento que fallo.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    reportarError(error, "react-boundary")
  }, [error])

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
        <h1 className="text-xl font-bold text-stone-800">Algo salió mal</h1>
        <p className="text-stone-500 text-sm">
          Ocurrió un error inesperado. El detalle quedó registrado para
          revisarlo. Puedes reintentar o volver al inicio.
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>Ir al inicio</Button>
          <Button onClick={reset} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reintentar
          </Button>
        </div>
      </div>
    </div>
  )
}
