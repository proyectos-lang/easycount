"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, GraduationCap } from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { useAuth } from "@/lib/contexts/auth-context"
import { MODULOS, CATEGORIAS_ORDEN } from "@/lib/constants/modulos"
import { TUTORIALES, TUTORIAL_GENERAL, buscarTemas } from "@/lib/aprendizaje"

/**
 * Busqueda global (Ctrl+K / Cmd+K): salta a cualquier modulo permitido y
 * busca temas del Centro de Aprendizaje. Se monta una vez en el layout del
 * dashboard.
 */
export function BusquedaGlobal() {
  const router = useRouter()
  const { hasModulo } = useAuth()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  // Atajo de teclado global.
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const modulosVisibles = React.useMemo(
    () =>
      CATEGORIAS_ORDEN.flatMap((cat) =>
        MODULOS.filter((m) => m.categoria === cat && hasModulo(m.nombre))
      ),
    [hasModulo]
  )

  // Temas de aprendizaje que matchean la busqueda (solo modulos visibles).
  const temas = React.useMemo(() => {
    if (query.trim().length < 2) return []
    const visibles = [
      TUTORIAL_GENERAL,
      ...TUTORIALES.filter((t) => hasModulo(t.modulo)),
    ]
    return buscarTemas(query, visibles).slice(0, 6)
  }, [query, hasModulo])

  function irA(href: string) {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-stone-500 font-normal hidden sm:flex"
        onClick={() => setOpen(true)}
      >
        <Search className="h-3.5 w-3.5" />
        Buscar…
        <Kbd className="ml-2">Ctrl K</Kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        onClick={() => setOpen(true)}
        aria-label="Buscar"
      >
        <Search className="h-4 w-4" />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) setQuery("") }}
        title="Búsqueda global"
        description="Salta a un módulo o busca un tema de ayuda"
      >
        <CommandInput
          placeholder="Módulo o tema… (ej. devoluciones, cerrar caja)"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>Sin resultados.</CommandEmpty>

          <CommandGroup heading="Módulos">
            {modulosVisibles.map((m) => (
              <CommandItem
                key={m.nombre}
                value={`${m.nombre} ${m.categoria}`}
                onSelect={() => irA(m.href)}
              >
                <m.icon className="h-4 w-4 mr-2 text-stone-500" />
                <span>{m.nombre}</span>
                <span className="ml-auto text-xs text-muted-foreground">{m.categoria}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          {temas.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Aprendizaje">
                {temas.map((r) => (
                  <CommandItem
                    key={`tema-${r.tutorial.modulo}`}
                    value={`aprendizaje ${r.tutorial.titulo} ${query}`}
                    onSelect={() => irA("/aprendizaje")}
                  >
                    <GraduationCap className="h-4 w-4 mr-2 text-amber-600" />
                    <div className="flex flex-col min-w-0">
                      <span>{r.tutorial.titulo}</span>
                      <span className="text-xs text-muted-foreground truncate">{r.coincidencia}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
