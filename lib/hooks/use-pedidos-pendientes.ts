"use client"

import { useEffect, useState } from "react"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { useAuth } from "@/lib/contexts/auth-context"

/**
 * Conteo de pedidos por catalogo en estado Pendiente (para el badge del
 * sidebar). Se refresca cada 60s y al volver el foco a la pestana.
 * Si la tabla no existe (script 021 sin aplicar) devuelve 0 en silencio.
 */
export function usePedidosPendientes(): number {
  const { user } = useAuth()
  const [pendientes, setPendientes] = useState(0)

  useEffect(() => {
    if (!user || !isSupabaseConfigured()) return
    const supabase = createClient()
    if (!supabase) return

    let activo = true

    async function contar() {
      const { count, error } = await supabase!
        .from("pedidos_encabezado")
        .select("*", { count: "exact", head: true })
        .eq("estado", "Pendiente")
      if (activo && !error) setPendientes(count || 0)
    }

    contar()
    const intervalo = setInterval(contar, 60_000)
    const onFocus = () => contar()
    window.addEventListener("focus", onFocus)

    return () => {
      activo = false
      clearInterval(intervalo)
      window.removeEventListener("focus", onFocus)
    }
  }, [user])

  return pendientes
}
