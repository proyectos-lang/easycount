"use client"

import { useEffect, useState } from "react"
import { Plus, Loader2, Trash2, Layers3 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { Producto } from "@/lib/services/catalogos"
import { convertirAsociadoATallado } from "@/lib/services/grupos-tallas"

/** Tallas frecuentes para el selector rápido. */
const TALLAS_PRESET = ["S", "M", "L", "XL", "6", "8", "10", "12", "14", "16"] as const

export interface AgregarTallasDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Producto YA asociado a la línea que se convertirá en tallado. */
  producto: Producto | null
  /** Cantidad actual de la línea (se usa como cantidad inicial del original). */
  cantidadActual?: number
  /**
   * Tallas detectadas por la IA (opcional): precargan las filas para agilizar.
   * La primera se usa como talla del producto asociado.
   */
  defaultTallas?: { talla: string; cantidad: number }[]
  /**
   * Se llama al terminar: devuelve un producto por talla con su cantidad
   * (incluye al producto original ya convertido). El llamador reemplaza la
   * línea por una por talla.
   */
  onDone: (items: { producto: Producto; cantidad: number }[]) => void
}

/**
 * Convierte un producto YA ASOCIADO en una recepción en un producto TALLADO:
 * le asigna una talla, permite capturar tallas adicionales con sus cantidades
 * (se crean como productos hermanos), y agrupa a todos. No genera stock aquí:
 * las cantidades entran al procesar la recepción, una línea por talla.
 */
export function AgregarTallasDialog({
  open,
  onOpenChange,
  producto,
  cantidadActual = 0,
  defaultTallas,
  onDone,
}: AgregarTallasDialogProps) {
  const { toast } = useToast()

  // Talla + cantidad del PRODUCTO ORIGINAL (ya existente).
  const [tallaOriginal, setTallaOriginal] = useState("")
  const [cantidadOriginal, setCantidadOriginal] = useState("")
  // Tallas ADICIONALES (se crean como hermanas).
  const [nuevas, setNuevas] = useState<{ talla: string; cantidad: string }[]>([])
  const [saving, setSaving] = useState(false)

  // Al abrir, sembramos el formulario desde las tallas detectadas (si hay).
  useEffect(() => {
    if (!open) return
    const pre = (defaultTallas || []).map((t) => ({
      talla: t.talla || "",
      cantidad: String(t.cantidad || ""),
    }))
    if (pre.length >= 1) {
      // La primera talla detectada la toma el producto original.
      setTallaOriginal(pre[0].talla)
      setCantidadOriginal(pre[0].cantidad || String(cantidadActual || ""))
      setNuevas(pre.length > 1 ? pre.slice(1) : [{ talla: "", cantidad: "" }])
    } else {
      setTallaOriginal("")
      setCantidadOriginal(String(cantidadActual || ""))
      setNuevas([{ talla: "", cantidad: "" }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function agregarFila() { setNuevas((p) => [...p, { talla: "", cantidad: "" }]) }
  function quitarFila(idx: number) { setNuevas((p) => p.filter((_, i) => i !== idx)) }
  function setFila(idx: number, campo: "talla" | "cantidad", valor: string) {
    setNuevas((p) => p.map((l, i) => (i === idx ? { ...l, [campo]: valor } : l)))
  }

  async function handleSave() {
    if (!producto?.id) {
      toast({ title: "Error", description: "No hay un producto asociado válido.", variant: "destructive" })
      return
    }
    setSaving(true)
    const { items, error } = await convertirAsociadoATallado({
      original: producto,
      tallaOriginal,
      cantidadOriginal: Number(cantidadOriginal) || 0,
      tallasNuevas: nuevas.map((n) => ({ talla: n.talla, cantidad: Number(n.cantidad) || 0 })),
    })
    setSaving(false)
    if (items.length === 0) {
      toast({ title: "No se agregaron tallas", description: error || "Revisa las tallas ingresadas.", variant: "destructive" })
      return
    }
    toast({
      title: `${items.length} tallas listas`,
      description: error
        ? `Con avisos: ${error}`
        : `${producto.nombre} quedó como producto tallado; entra por talla al procesar.`,
      variant: error ? "destructive" : undefined,
    })
    onDone(items)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers3 className="h-5 w-5 text-amber-700" /> Agregar tallas
          </DialogTitle>
          <DialogDescription>
            {producto?.nombre
              ? `"${producto.nombre}" pasará a ser un producto tallado. Indica su talla y agrega las demás con sus cantidades para este ingreso.`
              : "Convierte el producto asociado en tallado."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <datalist id="agregar-tallas-preset">
            {TALLAS_PRESET.map((t) => <option key={t} value={t} />)}
          </datalist>

          {/* Producto original: su talla + cantidad */}
          <div className="rounded-lg border border-amber-300 bg-amber-50/60 p-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">
              Producto asociado
            </p>
            <div className="flex items-end gap-2">
              <div className="grid gap-1 flex-1 min-w-0">
                <Label className="text-[11px] text-stone-500">Talla</Label>
                <Input
                  list="agregar-tallas-preset"
                  value={tallaOriginal}
                  onChange={(e) => setTallaOriginal(e.target.value)}
                  placeholder="Ej: S, M, 40"
                  className="h-9 border-stone-200 bg-white"
                />
              </div>
              <div className="grid gap-1 w-24 shrink-0">
                <Label className="text-[11px] text-stone-500">Cantidad</Label>
                <Input
                  type="number" min="0" step="1"
                  value={cantidadOriginal}
                  onChange={(e) => setCantidadOriginal(e.target.value)}
                  placeholder="0"
                  className="h-9 border-stone-200 bg-white"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Conserva su stock e historial; solo se le asigna esta talla.
            </p>
          </div>

          {/* Tallas adicionales (nuevas hermanas) */}
          <div className="rounded-lg border border-stone-200 p-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-600">
              Tallas adicionales
            </p>
            {nuevas.map((l, idx) => (
              <div key={idx} className="flex items-end gap-2">
                <div className="grid gap-1 flex-1 min-w-0">
                  {idx === 0 && <Label className="text-[11px] text-stone-500">Talla</Label>}
                  <Input
                    list="agregar-tallas-preset"
                    value={l.talla}
                    onChange={(e) => setFila(idx, "talla", e.target.value)}
                    placeholder="Ej: L, XL, 42"
                    className="h-9 border-stone-200 bg-white"
                  />
                </div>
                <div className="grid gap-1 w-24 shrink-0">
                  {idx === 0 && <Label className="text-[11px] text-stone-500">Cantidad</Label>}
                  <Input
                    type="number" min="0" step="1"
                    value={l.cantidad}
                    onChange={(e) => setFila(idx, "cantidad", e.target.value)}
                    placeholder="0"
                    className="h-9 border-stone-200 bg-white"
                  />
                </div>
                <Button
                  type="button" variant="ghost" size="icon"
                  className="h-9 w-8 shrink-0 text-stone-500 hover:text-destructive disabled:opacity-30"
                  disabled={nuevas.length <= 1}
                  onClick={() => quitarFila(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={agregarFila}>
              <Plus className="h-4 w-4" /> Agregar talla
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !producto?.id}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Convertir en tallado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
