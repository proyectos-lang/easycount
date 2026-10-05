"use server"

import { revalidatePath } from "next/cache"
import {
  saveEmpresaGestion, deleteEmpresaGestion, setEtapaGestion, registrarPagoGestion, deletePagoGestion, saveReunionGestion, resultadoReunionGestion,
  deleteReunionGestion, saveGastoGestion, deleteGastoGestion, subirComprobanteGestion, urlComprobanteGestion, saveCampanaGestion, deleteCampanaGestion,
  agregarNotaGestion, marcarNotificacionesLeidasGestion, saveConfigGestion, saveCuentaGestion, setRolAdminGestion,
  type EmpresaInput, type PagoInput, type ReunionInput, type ResultadoReunionInput, type GastoInput, type CampanaInput, type GConfig, type Resultado,
} from "@/lib/services/gestion"
import type { EtapaPipeline, MotivoPerdida, RolGestion } from "@/lib/gestion/reglas"

// Toda mutación revalida el portal completo (menú con contadores incluido).
// La autorización (super-admin) la valida cada función del servicio.
function rev<T>(r: Resultado<T>): Resultado<T> {
  if (!r.error) revalidatePath("/gestion", "layout")
  return r
}

export async function guardarEmpresa(input: EmpresaInput) { return rev(await saveEmpresaGestion(input)) }
export async function eliminarEmpresa(id: number) { return rev(await deleteEmpresaGestion(id)) }
export async function moverEtapa(id: number, etapa: EtapaPipeline, motivo?: MotivoPerdida | null) { return rev(await setEtapaGestion(id, etapa, motivo)) }
export async function registrarPago(input: PagoInput) { return rev(await registrarPagoGestion(input)) }
export async function eliminarPago(id: number) { return rev(await deletePagoGestion(id)) }
export async function guardarReunion(input: ReunionInput) { return rev(await saveReunionGestion(input)) }
export async function registrarResultadoReunion(input: ResultadoReunionInput) { return rev(await resultadoReunionGestion(input)) }
export async function eliminarReunion(id: number) { return rev(await deleteReunionGestion(id)) }
export async function eliminarGasto(id: number) { return rev(await deleteGastoGestion(id)) }
export async function guardarCampana(input: CampanaInput) { return rev(await saveCampanaGestion(input)) }
export async function eliminarCampana(id: number) { return rev(await deleteCampanaGestion(id)) }
export async function agregarNota(empresaId: number, texto: string) { return rev(await agregarNotaGestion(empresaId, texto)) }
export async function marcarNotificacionesLeidas() { return rev(await marcarNotificacionesLeidasGestion()) }
export async function guardarConfig(parcial: Partial<GConfig>) { return rev(await saveConfigGestion(parcial)) }
export async function guardarCuenta(input: { id?: number; nombre: string; banco?: string | null; moneda?: string; activo?: boolean }) { return rev(await saveCuentaGestion(input)) }
export async function cambiarRolAdmin(userId: string, rol: RolGestion) { return rev(await setRolAdminGestion(userId, rol)) }
export async function urlComprobante(path: string) { return urlComprobanteGestion(path) }

/** Gasto con comprobante opcional: llega como FormData (campo `archivo`). */
export async function guardarGasto(fd: FormData): Promise<Resultado<number>> {
  const archivo = fd.get("archivo")
  let comprobante_path: string | null | undefined = undefined
  if (archivo instanceof File && archivo.size > 0) {
    if (archivo.size > 10 * 1024 * 1024) return { data: null, error: "El comprobante no puede superar 10 MB." }
    const up = await subirComprobanteGestion(archivo)
    if (up.error) return { data: null, error: up.error }
    comprobante_path = up.data
  }
  const idRaw = fd.get("id")
  const input: GastoInput = {
    id: idRaw ? Number(idRaw) : undefined,
    fecha: String(fd.get("fecha") || ""),
    categoria: String(fd.get("categoria") || "otros"),
    descripcion: String(fd.get("descripcion") || "") || null,
    monto: Number(fd.get("monto") || 0),
    metodo: String(fd.get("metodo") || "") || null,
    observaciones: String(fd.get("observaciones") || "") || null,
    comprobante_path,
  }
  if (!input.fecha) return { data: null, error: "La fecha es obligatoria." }
  return rev(await saveGastoGestion(input))
}
