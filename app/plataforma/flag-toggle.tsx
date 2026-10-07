"use client"

import * as React from "react"
import { toggleEmpresaFlag } from "./actions"
import type { FeatureFlags } from "@/lib/constants/feature-flags"

/**
 * Switch de un feature flag por empresa (portal de super-admin). Optimista:
 * pinta el nuevo estado al instante y revierte si el server action falla.
 */
export function FlagToggle({
  razonSocialId,
  flag,
  initial,
  onLabel,
  offLabel,
  compacto = false,
}: {
  razonSocialId: number
  flag: keyof FeatureFlags
  initial: boolean
  onLabel?: string
  offLabel?: string
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
    const res = await toggleEmpresaFlag(razonSocialId, flag, next)
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
        title={err ?? (on ? onLabel : offLabel) ?? undefined}
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
        {on ? onLabel ?? "Sí" : offLabel ?? "No"}
      </span>}
    </div>
  )
}
