import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Indicador compacto y estilizado para los contenedores de resumen (dashboards
 * y valoración). Muestra una etiqueta pequeña + un valor, con subtítulo y estado
 * de carga opcionales. Sin padding propio: el contenedor decide el layout
 * (grid con o sin divisores).
 */
export function Indicador({
  label,
  value,
  sub,
  valueClass,
  loading,
}: {
  label: string
  value: string
  sub?: string
  valueClass?: string
  loading?: boolean
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-stone-500">{label}</p>
      {loading ? (
        <Skeleton className="mt-1 h-6 w-24" />
      ) : (
        <p className={`mt-0.5 text-lg md:text-xl font-semibold text-stone-800 tabular-nums ${valueClass || ""}`}>{value}</p>
      )}
      {sub && !loading && <p className="mt-0.5 text-[11px] text-stone-400">{sub}</p>}
    </div>
  )
}
