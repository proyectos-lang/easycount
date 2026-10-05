"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Loader2, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useGestionUI } from "@/app/gestion/shell"
import { agregarNota, eliminarEmpresa, eliminarPago } from "@/app/gestion/actions"
import { EmpresaForm } from "./empresa-form"
import type { GEmpresa, GConfig } from "@/lib/services/gestion"

export function BotonRegistrarPago({ empresaId, size = "sm" }: { empresaId: number; size?: "sm" | "default" }) {
  const { abrirRegistrarPago } = useGestionUI()
  return (
    <Button size={size} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => abrirRegistrarPago(empresaId)}>
      <CreditCard className="h-4 w-4" /> Registrar pago
    </Button>
  )
}

export function BotonEditarEmpresa({ empresa, config, hoy }: { empresa: GEmpresa; config: Pick<GConfig, "dias_prueba" | "moneda" | "planes">; hoy: string }) {
  return <EmpresaForm empresa={empresa} config={config} hoy={hoy} trigger={<Button size="sm" variant="outline" className="gap-1.5"><Pencil className="h-4 w-4" /> Editar</Button>} />
}

export function NotaForm({ empresaId }: { empresaId: number }) {
  const { toast } = useToast()
  const [texto, setTexto] = React.useState("")
  const [guardando, setGuardando] = React.useState(false)
  async function guardar() {
    if (!texto.trim()) return
    setGuardando(true)
    const res = await agregarNota(empresaId, texto)
    setGuardando(false)
    if (res.error) return toast({ title: "No se pudo guardar la nota", description: res.error, variant: "destructive" })
    setTexto("")
    toast({ title: "Nota agregada" })
  }
  return (
    <div className="space-y-2">
      <Textarea rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe una nota sobre esta empresa…" />
      <div className="flex justify-end"><Button size="sm" onClick={guardar} disabled={guardando || !texto.trim()}>{guardando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar nota</Button></div>
    </div>
  )
}

export function EliminarEmpresa({ empresaId, nombre }: { empresaId: number; nombre: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [borrando, setBorrando] = React.useState(false)
  async function borrar() {
    setBorrando(true)
    const res = await eliminarEmpresa(empresaId)
    setBorrando(false)
    if (res.error) return toast({ title: "No se pudo eliminar", description: res.error, variant: "destructive" })
    toast({ title: "Empresa eliminada" })
    router.replace("/gestion/empresas")
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button size="sm" variant="ghost" className="gap-1.5 text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /> Eliminar</Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar «{nombre}»?</AlertDialogTitle>
          <AlertDialogDescription>Se borran también sus pagos, reuniones y bitácora. Esta acción no se puede deshacer.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={borrando}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => { e.preventDefault(); borrar() }} disabled={borrando} className="bg-red-600 hover:bg-red-700">{borrando ? "Eliminando…" : "Eliminar"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function EliminarPago({ pagoId }: { pagoId: number }) {
  const { toast } = useToast()
  const [borrando, setBorrando] = React.useState(false)
  async function borrar() {
    setBorrando(true)
    const res = await eliminarPago(pagoId)
    setBorrando(false)
    if (res.error) return toast({ title: "No se pudo eliminar el pago", description: res.error, variant: "destructive" })
    toast({ title: "Pago eliminado" })
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button size="icon" variant="ghost" className="h-7 w-7 text-stone-400 hover:text-red-600" aria-label="Eliminar pago"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este pago?</AlertDialogTitle>
          <AlertDialogDescription>El próximo pago de la empresa NO se recalcula automáticamente: ajústalo editando la empresa si hace falta.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={borrando}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => { e.preventDefault(); borrar() }} disabled={borrando} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
