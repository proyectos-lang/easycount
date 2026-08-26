"use client"

/**
 * Cuadricula de conteo de efectivo por denominacion (Lempiras). El usuario
 * escribe cuantos billetes/monedas hay de cada denominacion y el total se
 * calcula solo. Es un input controlado: el estado (conteo) vive en el padre
 * para poder reiniciarlo y usar el total como saldo real de cierre.
 */
import * as React from "react"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils/format"

/** Denominaciones vigentes en Honduras, de mayor a menor (billetes y monedas). */
export const DENOMINACIONES_LPS = [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05]

/** Suma total del conteo (denominacion × cantidad). */
export function conteoTotal(conteo: Record<number, string>): number {
  return DENOMINACIONES_LPS.reduce(
    (acc, d) => acc + d * (parseInt(conteo[d] || "0", 10) || 0),
    0
  )
}

function etiquetaDenom(d: number): string {
  return d >= 1 ? `L ${d}` : `L ${d.toFixed(2)}`
}

export function ConteoEfectivo({
  conteo,
  onChange,
}: {
  conteo: Record<number, string>
  onChange: (denom: number, raw: string) => void
}) {
  const total = conteoTotal(conteo)

  return (
    <div className="rounded-lg border">
      <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 p-3 sm:grid-cols-2">
        {DENOMINACIONES_LPS.map((d) => {
          const cant = parseInt(conteo[d] || "0", 10) || 0
          const sub = d * cant
          return (
            <div key={d} className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-right font-mono text-sm font-medium">
                {etiquetaDenom(d)}
              </span>
              <span className="text-muted-foreground">×</span>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                className="h-8 w-16 text-right"
                value={conteo[d] ?? ""}
                onChange={(e) => onChange(d, e.target.value)}
                placeholder="0"
              />
              <span className="ml-auto w-24 text-right font-mono text-xs text-muted-foreground">
                {formatCurrency(sub)}
              </span>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between border-t px-3 py-2">
        <span className="text-sm font-medium">Total contado</span>
        <span className="font-mono text-base font-semibold">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
