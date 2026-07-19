"use client"

import { useMemo, useState } from "react"
import {
  GraduationCap, CheckCircle2, XCircle, BookOpen, ListChecks,
  HelpCircle, AlertTriangle, Compass,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/contexts/auth-context"
import { MODULOS, CATEGORIAS_ORDEN, type Categoria } from "@/lib/constants/modulos"
import {
  TUTORIALES, TUTORIAL_GENERAL, getTutorial, modulosSinTutorial, buscarTemas,
  type TutorialModulo,
} from "@/lib/aprendizaje"

export default function AprendizajePage() {
  const { user, hasModulo } = useAuth()
  const [seleccionado, setSeleccionado] = useState<string>("general")
  const [busqueda, setBusqueda] = useState("")
  const [buscadorAbierto, setBuscadorAbierto] = useState(false)

  const esAdmin = (user?.rol || "").trim().toLowerCase() === "admin"

  // Indice contextual: solo los modulos que el usuario puede usar
  // (mismo criterio que el sidebar). "Primeros pasos" siempre visible.
  const indice = useMemo(() => {
    const grupos: { categoria: Categoria; tutoriales: TutorialModulo[] }[] = []
    for (const categoria of CATEGORIAS_ORDEN) {
      const tutoriales = MODULOS
        .filter((m) => m.categoria === categoria && hasModulo(m.nombre))
        .map((m) => getTutorial(m.nombre))
        .filter((t): t is TutorialModulo => t !== null)
      if (tutoriales.length > 0) grupos.push({ categoria, tutoriales })
    }
    return grupos
  }, [hasModulo])

  const tutorialesVisibles = useMemo(
    () => [TUTORIAL_GENERAL, ...indice.flatMap((g) => g.tutoriales)],
    [indice]
  )

  const resultados = useMemo(
    () => buscarTemas(busqueda, tutorialesVisibles),
    [busqueda, tutorialesVisibles]
  )

  const tutorial = getTutorial(seleccionado) ?? TUTORIAL_GENERAL
  const sinDocumentar = useMemo(() => modulosSinTutorial(), [])

  function elegir(modulo: string) {
    setSeleccionado(modulo)
    setBusqueda("")
    setBuscadorAbierto(false)
    // Lleva el contenido al inicio en movil.
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-orange-50/30 to-amber-50/20 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-800 flex items-center gap-3">
              <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-amber-800" />
              </span>
              Centro de Aprendizaje
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              Cómo funciona cada módulo de EasyCount: qué hace, qué no hace y cómo se usa, paso a paso.
            </p>
          </div>
        </div>

        {/* Aviso de cobertura (solo admins) */}
        {esAdmin && sinDocumentar.length > 0 && (
          <Card className="bg-amber-50/60 border-amber-300/60">
            <CardContent className="py-3 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Módulos sin tutorial:</strong> {sinDocumentar.join(", ")}. Al agregar un
                módulo nuevo, documenta su tutorial en <code>lib/aprendizaje/</code> (ver CLAUDE.md).
              </p>
            </CardContent>
          </Card>
        )}

        {/* Buscador de temas */}
        <Card className="overflow-visible">
          <CardContent className="py-3">
            <Command shouldFilter={false} className="rounded-lg border">
              <CommandInput
                placeholder="Buscar un tema… (ej. devolución, comisión, cerrar caja, excel)"
                value={busqueda}
                onValueChange={(v) => {
                  setBusqueda(v)
                  setBuscadorAbierto(v.trim().length >= 2)
                }}
              />
              {buscadorAbierto && (
                <CommandList className="max-h-64">
                  <CommandEmpty>Sin resultados para “{busqueda}”.</CommandEmpty>
                  {resultados.length > 0 && (
                    <CommandGroup heading={`${resultados.length} tema(s) encontrados`}>
                      {resultados.map((r) => (
                        <CommandItem
                          key={r.tutorial.modulo}
                          value={r.tutorial.modulo}
                          onSelect={() => elegir(r.tutorial.modulo)}
                          className="flex flex-col items-start gap-0.5"
                        >
                          <span className="font-medium">{r.tutorial.titulo}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {r.coincidencia}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              )}
            </Command>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr] items-start">
          {/* Índice por categoría */}
          <Card className="lg:sticky lg:top-20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-stone-500 flex items-center gap-2">
                <Compass className="h-4 w-4" /> Temas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="lg:h-[60vh]">
                <div className="space-y-3 pr-2">
                  <button
                    onClick={() => elegir("general")}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                      seleccionado === "general"
                        ? "bg-amber-100 text-amber-900 font-medium"
                        : "hover:bg-stone-100 text-stone-700"
                    }`}
                  >
                    Primeros pasos
                  </button>
                  {indice.map((g) => (
                    <div key={g.categoria}>
                      <p className="px-3 py-1 text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                        {g.categoria}
                      </p>
                      {g.tutoriales.map((t) => (
                        <button
                          key={t.modulo}
                          onClick={() => elegir(t.modulo)}
                          className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                            seleccionado === t.modulo
                              ? "bg-amber-100 text-amber-900 font-medium"
                              : "hover:bg-stone-100 text-stone-700"
                          }`}
                        >
                          {t.titulo}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Tutorial seleccionado */}
          <div className="space-y-4 min-w-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-stone-800">{tutorial.titulo}</CardTitle>
                <CardDescription className="text-base">{tutorial.descripcion}</CardDescription>
              </CardHeader>
            </Card>

            {/* Qué hace / qué no hace */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-emerald-200/70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> ¿Qué hace?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tutorial.queHace.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-stone-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-red-200/70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                    <XCircle className="h-4 w-4" /> ¿Qué NO hace?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tutorial.queNoHace.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-stone-700">
                        <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Paso a paso */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-stone-700">
                  <ListChecks className="h-4 w-4" /> Cómo se hace (paso a paso)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {tutorial.operaciones.map((op, i) => (
                    <AccordionItem key={i} value={`op-${i}`}>
                      <AccordionTrigger className="text-left text-sm font-medium">
                        {op.titulo}
                      </AccordionTrigger>
                      <AccordionContent>
                        <ol className="space-y-2 pl-1">
                          {op.pasos.map((paso, j) => (
                            <li key={j} className="flex gap-3 text-sm text-stone-700">
                              <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center shrink-0 font-medium">
                                {j + 1}
                              </span>
                              <span>{paso}</span>
                            </li>
                          ))}
                        </ol>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* FAQs */}
            {tutorial.faqs.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-stone-700">
                    <HelpCircle className="h-4 w-4" /> Dudas frecuentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {tutorial.faqs.map((faq, i) => (
                      <AccordionItem key={i} value={`faq-${i}`}>
                        <AccordionTrigger className="text-left text-sm font-medium">
                          {faq.pregunta}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-stone-600">{faq.respuesta}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {/* Ir al módulo */}
            {tutorial.modulo !== "general" && (
              <Card className="bg-amber-50/50 border-amber-200/60">
                <CardContent className="py-3 flex items-center justify-between flex-wrap gap-3">
                  <p className="text-sm text-amber-800 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> ¿Listo para practicar?
                  </p>
                  {(() => {
                    const mod = MODULOS.find((m) => m.nombre === tutorial.modulo)
                    return mod ? (
                      <Button asChild size="sm" variant="outline" className="border-amber-300">
                        <a href={mod.href}>
                          Abrir {tutorial.titulo} <Badge variant="secondary" className="ml-2">{mod.categoria}</Badge>
                        </a>
                      </Button>
                    ) : null
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
