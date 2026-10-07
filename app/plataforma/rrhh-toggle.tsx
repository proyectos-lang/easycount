"use client"

import * as React from "react"
import { toggleEmpresaRrhh } from "./actions"

/**
 * Switch que enciende/apaga de un clic los 5 módulos de RRHH de una empresa
 * (portal de super-admin, junto a los feature flags). Optimista: pinta el nuevo
 * estado al instante y revierte si el server action falla.
 */
export function RrhhToggle({
  razonSocialId,
  initial,
  compacto = false,
}: {
  razonSocialId: number
  initial: boolean
  /** Switch chico sin texto (tabla compacta de /plataforma). */
  compacto?: boolean
}) {
  const [on, setOn] = React.useState(initial)
  const [saving, setSaving] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)

  async function handle(next: boolean) {
    const prev = on
    setSaving(true)
    setErr(null)
    setOn(next) // optimista
    const res = await toggleEmpresaRrhh(razonSocialId, next)
    setSaving(false)
    if (res.error) {
      setOn(prev) // revertir
      setErr(res.error)
    }
  }

  return (
    <div className={`flex items-center ${compacto ? "justify-center" : "gap-2"}`}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        disabled={saving}
        onClick={() => handle(!on)}
        title={err ?? (on ? "RRHH activo" : "RRHH apagado")}
        className={`relative inline-flex shrink-0 items-center rounded-full transition-colors ${compacto ? "h-4 w-7" : "h-5 w-9"} ${err ? "ring-2 ring-red-400" : ""} ${
          on ? "bg-emerald-500" : "bg-stone-300"
        } ${saving ? "opacity-50" : ""}`}
      >
        <span
          className={`inline-block transform rounded-full bg-white shadow transition-transform ${compacto ? "h-3 w-3" : "h-4 w-4"} ${
            on ? (compacto ? "translate-x-3.5" : "translate-x-4") : "translate-x-0.5"
          }`}
        />
      </button>
      {!compacto && <span className={`text-[11px] ${on ? "text-emerald-700" : "text-stone-400"}`}>
        {on ? "Activo" : "Apagado"}
      </span>}
    </div>
  )
}
