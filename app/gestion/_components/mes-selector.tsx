"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { leerMes, claveMes, mesAnterior, mesSiguiente } from "@/lib/gestion/mes"
import { etiquetaMes } from "@/lib/gestion/calculos"
import { mesRelativo } from "@/lib/gestion/reglas"

/** ‹ Septiembre 2026 › + desplegable de 12 meses. Vive en la URL (?mes=YYYY-MM). */
export function MesSelector({ hoy }: { hoy: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const sel = leerMes(sp.get("mes") ?? undefined, hoy)

  function ir(s: { anio: number; mes: number }) {
    const params = new URLSearchParams(sp.toString())
    params.set("mes", claveMes(s))
    router.replace(`${pathname}?${params.toString()}`)
  }

  // Ventana: 9 meses atrás … 2 adelante (más el seleccionado si cae fuera).
  const actual = leerMes(undefined, hoy)
  const opciones = Array.from({ length: 12 }, (_, i) => mesRelativo(actual.anio, actual.mes, i - 9))
  if (!opciones.some((o) => claveMes(o) === claveMes(sel))) opciones.push(sel)
  opciones.sort((a, b) => claveMes(a).localeCompare(claveMes(b)))

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => ir(mesAnterior(sel))} aria-label="Mes anterior">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Select value={claveMes(sel)} onValueChange={(v) => ir({ anio: Number(v.slice(0, 4)), mes: Number(v.slice(5, 7)) })}>
        <SelectTrigger className="h-8 w-[170px] text-sm font-medium"><SelectValue /></SelectTrigger>
        <SelectContent>
          {opciones.map((o) => <SelectItem key={claveMes(o)} value={claveMes(o)}>{etiquetaMes(o.anio, o.mes)}</SelectItem>)}
        </SelectContent>
      </Select>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => ir(mesSiguiente(sel))} aria-label="Mes siguiente">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
