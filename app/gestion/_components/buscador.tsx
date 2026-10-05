"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ETIQUETA_ESTADO, type EstadoEmpresa } from "@/lib/gestion/reglas"

export interface EmpresaBusqueda { id: number; nombre: string; dueno: string | null; telefono: string | null; estado: EstadoEmpresa }

/** Buscador global: empresas por nombre, dueño o teléfono → perfil. */
export function Buscador({ empresas }: { empresas: EmpresaBusqueda[] }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 w-9 justify-center px-0 text-stone-500 sm:w-56 sm:justify-start sm:px-3">
          <Search className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline text-xs font-normal">Buscar empresa…</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(360px,calc(100vw-2rem))] p-0" align="end">
        <Command>
          <CommandInput placeholder="Nombre, dueño o teléfono…" />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {empresas.map((e) => (
                <CommandItem key={e.id} value={`${e.nombre} ${e.dueno || ""} ${e.telefono || ""}`} onSelect={() => { setOpen(false); router.push(`/gestion/empresas/${e.id}`) }}>
                  <div className="min-w-0">
                    <p className="truncate text-sm">{e.nombre}</p>
                    <p className="truncate text-[11px] text-stone-500">{[e.dueno, e.telefono, ETIQUETA_ESTADO[e.estado]].filter(Boolean).join(" · ")}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
