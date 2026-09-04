"use server"

import { revalidatePath } from "next/cache"
import {
  getUsuariosEmpresa,
  getPermisosUsuario,
  crearUsuarioEmpresa,
  setPermisoUsuario,
  setRolUsuario,
  setActivoUsuario,
  resetPasswordUsuario,
  getModulosEmpresaConfig,
  setModuloEmpresa,
} from "@/lib/services/plataforma"

// Todas delegan en el servicio, que valida super-admin server-side.

export async function listarUsuariosEmpresa(razonSocialId: number) {
  return getUsuariosEmpresa(razonSocialId)
}

export async function listarPermisosUsuario(usuarioId: string) {
  return getPermisosUsuario(usuarioId)
}

export async function crearUsuarioEmpresaAction(input: {
  razonSocialId: number
  email: string
  password: string
  nombre: string
  rol: "admin" | "usuario"
}) {
  const res = await crearUsuarioEmpresa(input)
  if (!res.error) revalidatePath("/plataforma")
  return res
}

export async function setPermisoUsuarioAction(input: {
  usuarioId: string
  moduloId: number
  puedeVer: boolean
}) {
  return setPermisoUsuario(input)
}

export async function setRolUsuarioAction(input: {
  usuarioId: string
  rol: "admin" | "usuario"
}) {
  return setRolUsuario(input)
}

export async function setActivoUsuarioAction(input: {
  usuarioId: string
  activo: boolean
}) {
  const res = await setActivoUsuario(input)
  if (!res.error) revalidatePath("/plataforma")
  return res
}

export async function resetPasswordUsuarioAction(input: {
  usuarioId: string
  newPassword: string
}) {
  return resetPasswordUsuario(input)
}

// ----- Modulos habilitados por empresa -----

export async function listarConfigModulosEmpresa(razonSocialId: number) {
  return getModulosEmpresaConfig(razonSocialId)
}

export async function setModuloEmpresaAction(input: {
  razonSocialId: number
  moduloNombre: string
  habilitado: boolean
}) {
  return setModuloEmpresa(input)
}
