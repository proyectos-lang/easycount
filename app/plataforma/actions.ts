"use server"

import { getSuperadmin } from "@/lib/services/plataforma"

/**
 * Server action: ¿el usuario logueado es super-admin de plataforma?
 * La usa la pantalla de login para enrutar las cuentas "solo-plataforma"
 * (sin perfil de empresa) directo a /plataforma en vez de rebotar a /login.
 */
export async function esPlataformaAdmin(): Promise<boolean> {
  return (await getSuperadmin()) !== null
}
