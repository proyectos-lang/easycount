"use client"

import * as React from "react"
import { Download, X, Share, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Aviso de "instalar app" (PWA). Dos presentaciones:
 *   - variant="banner": barra flotante inferior, descartable (dentro del sistema).
 *   - variant="inline":  tarjeta para incrustar (pantalla de login).
 *
 * Comportamiento por dispositivo:
 *   - Android / escritorio (Chrome/Edge): captura `beforeinstallprompt` y ofrece
 *     un boton "Instalar" que dispara el prompt nativo.
 *   - iPhone / iPad (Safari): iOS NO expone prompt; se muestran instrucciones
 *     paso a paso (Compartir -> Añadir a pantalla de inicio).
 * Si la app ya esta instalada (display-mode: standalone) no se muestra nada.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const DISMISS_KEY = "easycount_install_dismissed_at"
const DISMISS_DIAS = 14 // el banner descartado no reaparece por 2 semanas

function estaInstalada(): boolean {
  if (typeof window === "undefined") return false
  // standalone (Android/desktop) o navigator.standalone (iOS Safari).
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function esIOS(): boolean {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent || ""
  const iOSClasico = /iPad|iPhone|iPod/.test(ua)
  // iPadOS 13+ se reporta como Mac con pantalla tactil.
  const iPadOS = /Macintosh/.test(ua) && (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints! > 1
  return iOSClasico || iPadOS
}

export function InstalarApp({ variant = "banner" }: { variant?: "banner" | "inline" }) {
  const [montado, setMontado] = React.useState(false)
  const [deferred, setDeferred] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [instalada, setInstalada] = React.useState(false)
  const [ios, setIos] = React.useState(false)
  const [cerradoBanner, setCerradoBanner] = React.useState(false)
  const [verInstruccionesIOS, setVerInstruccionesIOS] = React.useState(false)

  React.useEffect(() => {
    setMontado(true)
    setInstalada(estaInstalada())
    setIos(esIOS())

    // Banner: respeta el "no volver a mostrar" por unos dias.
    if (variant === "banner") {
      try {
        const ts = Number(localStorage.getItem(DISMISS_KEY) || 0)
        if (ts && Date.now() - ts < DISMISS_DIAS * 24 * 60 * 60 * 1000) setCerradoBanner(true)
      } catch { /* localStorage bloqueado: se muestra igual */ }
    }

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", onPrompt)
    const onInstalled = () => setInstalada(true)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [variant])

  async function instalar() {
    if (!deferred) return
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    setDeferred(null)
    if (outcome === "accepted") setInstalada(true)
  }

  function cerrar() {
    setCerradoBanner(true)
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch { /* ignore */ }
  }

  // No renderizar en SSR, ni si ya esta instalada.
  if (!montado || instalada) return null

  // ¿Hay algo que ofrecer? Android/desktop: solo si tenemos el prompt. iOS:
  // siempre ofrecemos las instrucciones (todos instalan por el menu Compartir).
  const puedePrompt = deferred != null
  if (!puedePrompt && !ios) return null

  // ---- INLINE (login) ----
  if (variant === "inline") {
    return (
      <div className="rounded-xl border border-stone-300 bg-white/70 p-3 text-left">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <Download className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-stone-800">Instala EasyCount en tu dispositivo</p>
            {puedePrompt ? (
              <>
                <p className="text-xs text-stone-500">Ábrelo como una app, sin buscarlo en el navegador.</p>
                <Button size="sm" className="mt-2 gap-1" onClick={instalar}>
                  <Download className="h-4 w-4" /> Instalar app
                </Button>
              </>
            ) : (
              <InstruccionesIOS abierto />
            )}
          </div>
        </div>
      </div>
    )
  }

  // ---- BANNER (dentro del sistema) ----
  if (cerradoBanner) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-xl rounded-xl border border-stone-300 bg-white shadow-lg">
        <div className="flex items-start gap-3 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <Download className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-stone-800">Instala EasyCount</p>
            {puedePrompt ? (
              <p className="text-xs text-stone-500">Tenlo como app en tu pantalla de inicio, sin abrir el navegador.</p>
            ) : verInstruccionesIOS ? (
              <InstruccionesIOS abierto />
            ) : (
              <p className="text-xs text-stone-500">Añádelo a tu pantalla de inicio para abrirlo como una app.</p>
            )}
            <div className="mt-2 flex gap-2">
              {puedePrompt ? (
                <Button size="sm" className="gap-1" onClick={instalar}>
                  <Download className="h-4 w-4" /> Instalar
                </Button>
              ) : !verInstruccionesIOS ? (
                <Button size="sm" className="gap-1" onClick={() => setVerInstruccionesIOS(true)}>
                  Ver cómo
                </Button>
              ) : null}
              <Button size="sm" variant="ghost" onClick={cerrar}>Ahora no</Button>
            </div>
          </div>
          <button onClick={cerrar} aria-label="Cerrar" className="shrink-0 text-stone-400 hover:text-stone-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

/** Instrucciones para instalar en iPhone/iPad (Safari no ofrece prompt). */
function InstruccionesIOS({ abierto }: { abierto?: boolean }) {
  if (!abierto) return null
  return (
    <div className="mt-2 space-y-1.5 rounded-lg bg-stone-50 border border-stone-200 p-2.5">
      <p className="text-xs font-medium text-stone-700">Para instalar en tu iPhone/iPad:</p>
      <ol className="space-y-1 text-xs text-stone-600">
        <li className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-stone-200 text-[10px] font-semibold">1</span>
          Toca el botón <Share className="inline h-3.5 w-3.5 text-sky-600" /> <b>Compartir</b> en la barra de Safari.
        </li>
        <li className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-stone-200 text-[10px] font-semibold">2</span>
          Elige <Plus className="inline h-3.5 w-3.5" /> <b>Añadir a pantalla de inicio</b>.
        </li>
        <li className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-stone-200 text-[10px] font-semibold">3</span>
          Confirma con <b>Añadir</b>. Listo, ya tienes EasyCount como app.
        </li>
      </ol>
    </div>
  )
}
