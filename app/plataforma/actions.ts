"use server"

import { revalidatePath } from "next/cache"
import { getSuperadmin, setEmpresaFlag, crearEmpresaConAdmin, type CrearEmpresaInput } from "@/lib/services/plataforma"
import type { FeatureFlags } from "@/lib/constants/feature-flags"

/**
 * Server action: ¿el usuario logueado es super-admin de plataforma?
 * La usa la pantalla de login para enrutar las cuentas "solo-plataforma"
 * (sin perfil de empresa) directo a /plataforma en vez de rebotar a /login.
 */
export async function esPlataformaAdmin(): Promise<boolean> {
  return (await getSuperadmin()) !== null
}

/**
 * Server action: cambia un feature flag de una empresa desde el portal.
 * La autorizacion (super-admin) la valida `setEmpresaFlag` server-side.
 */
export async function toggleEmpresaFlag(
  razonSocialId: number,
  flag: keyof FeatureFlags,
  value: boolean
): Promise<{ error: string | null }> {
  const res = await setEmpresaFlag(razonSocialId, flag, value)
  if (!res.error) revalidatePath("/plataforma")
  return res
}

/**
 * Server action: crea una nueva empresa + su usuario admin (ya validado).
 * La autorizacion (super-admin) la valida `crearEmpresaConAdmin` server-side.
 */
export async function crearEmpresaAction(
  input: CrearEmpresaInput
): Promise<{ error: string | null }> {
  const res = await crearEmpresaConAdmin(input)
  if (!res.error) revalidatePath("/plataforma")
  return { error: res.error }
}
