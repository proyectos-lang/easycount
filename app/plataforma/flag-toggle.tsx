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
}: {
  razonSocialId: number
  flag: keyof FeatureFlags
  initial: boolean
  onLabel?: string
  offLabel?: string
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
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        disabled={saving}
        onClick={() => handle(!on)}
        title={err ?? (on ? onLabel : offLabel) ?? undefined}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          on ? "bg-emerald-500" : "bg-stone-300"
        } ${saving ? "opacity-50" : ""}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
      <span className={`text-[11px] ${on ? "text-emerald-700" : "text-stone-400"}`}>
        {on ? onLabel ?? "Sí" : offLabel ?? "No"}
      </span>
    </div>
  )
}
