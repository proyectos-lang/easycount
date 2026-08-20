"use client"

import * as React from "react"
import { Sparkles, Wrench, Bug, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ACTUALIZACIONES, type TipoActualizacion } from "@/lib/constants/actualizaciones"
import { useActualizaciones } from "@/lib/hooks/use-actualizaciones"

const TIPO_META: Record<TipoActualizacion, { icon: React.ComponentType<{ className?: string }>; clase: string }> = {
  "Nuevo módulo": { icon: Sparkles, clase: "border-emerald-300 text-emerald-700 bg-emerald-50" },
  "Mejora": { icon: Wrench, clase: "border-sky-300 text-sky-700 bg-sky-50" },
  "Corrección": { icon: Bug, clase: "border-amber-300 text-amber-700 bg-amber-50" },
}

function formatFecha(iso: string): string {
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString("es-HN", { day: "numeric", month: "long", year: "numeric" })
  } catch {
    return iso
  }
}

export default function ActualizacionesPage() {
  const { marcarVista } = useActualizaciones()

  // Visitar la página marca las actualizaciones como vistas (quita la novedad).
  React.useEffect(() => {
    marcarVista()
  }, [marcarVista])

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-800 flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-emerald-600" /> Actualizaciones
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Novedades y mejoras del sistema, de la más reciente a la más antigua.
        </p>
      </div>

      {ACTUALIZACIONES.length === 0 ? (
        <p className="text-sm text-stone-500">Aún no hay actualizaciones publicadas.</p>
      ) : (
        <div className="space-y-4">
          {ACTUALIZACIONES.map((a) => {
            const meta = TIPO_META[a.tipo]
            const Icon = meta.icon
            return (
              <Card key={a.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <CardTitle className="text-base md:text-lg">{a.titulo}</CardTitle>
                      <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {formatFecha(a.fecha)}
                      </p>
                    </div>
                    <Badge variant="outline" className={`gap-1 ${meta.clase}`}>
                      <Icon className="h-3.5 w-3.5" /> {a.tipo}
                    </Badge>
                  </div>
                  <p className="text-sm text-stone-600 mt-2">{a.resumen}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {a.cambios.map((c, i) => (
                      <li key={i} className="text-sm text-stone-700 flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
