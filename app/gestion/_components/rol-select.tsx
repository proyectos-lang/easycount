"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cambiarRolAdmin } from "@/app/gestion/actions"
import type { RolGestion } from "@/lib/gestion/reglas"

const ROLES: RolGestion[] = ["administrador", "ventas", "contabilidad"]
const ETIQUETA: Record<RolGestion, string> = { administrador: "Administrador", ventas: "Ventas", contabilidad: "Contabilidad" }

export function RolSelect({ userId, rol, deshabilitado }: { userId: string; rol: RolGestion; deshabilitado?: boolean }) {
  const { toast } = useToast()
  const [valor, setValor] = React.useState<RolGestion>(rol)
  async function cambiar(v: string) {
    const previo = valor
    setValor(v as RolGestion)
    const res = await cambiarRolAdmin(userId, v as RolGestion)
    if (res.error) { setValor(previo); toast({ title: "No se pudo cambiar el rol", description: res.error, variant: "destructive" }) }
    else toast({ title: "Rol actualizado" })
  }
  return (
    <Select value={valor} onValueChange={cambiar} disabled={deshabilitado}>
      <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
      <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{ETIQUETA[r]}</SelectItem>)}</SelectContent>
    </Select>
  )
}
