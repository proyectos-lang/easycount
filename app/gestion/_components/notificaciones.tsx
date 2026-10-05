"use client"

import * as React from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { marcarNotificacionesLeidas } from "@/app/gestion/actions"
import type { GNotificacion } from "@/lib/services/gestion"
import { cn } from "@/lib/utils"
import { fmtFecha } from "./ui"

const TONO: Record<string, string> = { pago: "bg-amber-400", atrasado: "bg-red-500", prueba: "bg-sky-500", reunion: "bg-stone-700" }

/** Campana con punto rojo si hay no leídas; se marcan leídas al abrir. */
export function Notificaciones({ items }: { items: GNotificacion[] }) {
  const [leidasLocal, setLeidasLocal] = React.useState(false)
  const noLeidas = leidasLocal ? 0 : items.filter((n) => !n.leida).length

  function onOpen(open: boolean) {
    if (open && noLeidas > 0) {
      setLeidasLocal(true)
      marcarNotificacionesLeidas()
    }
  }

  return (
    <DropdownMenu onOpenChange={onOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg" aria-label="Notificaciones">
          <Bell className="h-4 w-4" />
          {noLeidas > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="px-3 py-2">Notificaciones</DropdownMenuLabel>
        <DropdownMenuSeparator className="my-0" />
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-stone-400">Sin notificaciones.</p>
          ) : (
            items.map((n) => {
              const contenido = (
                <div className={cn("flex gap-2 px-3 py-2 text-xs hover:bg-stone-50", !n.leida && !leidasLocal && "bg-amber-50/40")}>
                  <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", TONO[n.tipo] || "bg-stone-400")} />
                  <div className="min-w-0">
                    <p className="text-stone-800">{n.mensaje}</p>
                    <p className="text-[10px] text-stone-400">{fmtFecha(n.fecha)}</p>
                  </div>
                </div>
              )
              return n.empresa_id ? <Link key={n.id} href={`/gestion/empresas/${n.empresa_id}`}>{contenido}</Link> : <div key={n.id}>{contenido}</div>
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
