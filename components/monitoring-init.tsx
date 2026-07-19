"use client"

import { useEffect } from "react"
import { instalarCapturaGlobal } from "@/lib/monitoring"

/** Instala la captura global de errores una vez, al montar la app. */
export function MonitoringInit() {
  useEffect(() => {
    instalarCapturaGlobal()
  }, [])
  return null
}
