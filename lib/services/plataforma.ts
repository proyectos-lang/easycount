// SERVER-ONLY. Usa el service role (createAdminClient) y cookies de sesion
// (createServerClient). NUNCA importar desde un Client Component.
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { mergeFlags, type FeatureFlags } from "@/lib/constants/feature-flags"

// ==================== TIPOS ====================

export interface Superadmin {
  id: string
  email: string | null
  nombre: string | null
}

export interface EmpresaResumen {
  id: number
  nombre: string
  comercial: string | null
  rtn: string | null
  usuarios: number
  usuarios_activos: number
  productos: number
  ventas: number
  ingreso_mes: number
  ingreso_total: number
  ultima_venta: string | null
  valor_inventario: number
  creada: string | null
  ultima_conexion: string | null
  /** Feature flags / mini-personalizaciones de la empresa (con defaults). */
  flags: FeatureFlags
}

export interface DbStats {
  db_bytes: number
  conexiones: number
  conexiones_max: number
  empresas: number
  usuarios: number
}

export interface ProjectStatus {
  /** false = faltan SUPABASE_ACCESS_TOKEN / SUPABASE_PROJECT_REF. */
  configured: boolean
  status?: string
  region?: string
  name?: string
  error?: string
}

// ==================== GUARD ====================

/**
 * Devuelve el super-admin de plataforma logueado, o null si el usuario actual
 * NO esta en `plataforma_admins`. La verificacion usa el service role (bypassa
 * el RLS que bloquea esa tabla para todos los demas).
 */
export async function getSuperadmin(): Promise<Superadmin | null> {
  const supabase = await createServerClient()
  if (!supabase) return null

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  if (!admin) return null

  const { data } = await admin
    .from("plataforma_admins")
    .select("user_id, email, nombre")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!data) return null
  return {
    id: user.id,
    email: (data.email as string | null) ?? user.email ?? null,
    nombre: (data.nombre as string | null) ?? null,
  }
}

// ==================== DATA (cross-tenant, service role) ====================

type RawEmpresa = Record<string, unknown>

export async function getResumenEmpresas(): Promise<{ data: EmpresaResumen[]; error: string | null }> {
  const admin = createAdminClient()
  if (!admin) return { data: [], error: "Service role no configurado (SUPABASE_SERVICE_ROLE_KEY)." }

  const { data, error } = await admin.rpc("plataforma_resumen_empresas")
  if (error) return { data: [], error: error.message }

  // Feature flags por empresa (cross-tenant, service role). Si la tabla aun no
  // existe (script 038 sin aplicar), se ignora el error y todas quedan con los
  // defaults.
  const cfgMap = new Map<number, Record<string, unknown>>()
  const { data: cfgRows } = await admin
    .from("razon_social_config")
    .select("razon_social_id, config")
  for (const c of (cfgRows as RawEmpresa[]) || []) {
    cfgMap.set(Number(c.razon_social_id), (c.config as Record<string, unknown>) ?? {})
  }

  const rows = ((data as RawEmpresa[]) || []).map((r) => ({
    id: Number(r.id),
    nombre: String(r.nombre ?? ""),
    comercial: (r.comercial as string | null) ?? null,
    rtn: (r.rtn as string | null) ?? null,
    usuarios: Number(r.usuarios ?? 0),
    usuarios_activos: Number(r.usuarios_activos ?? 0),
    productos: Number(r.productos ?? 0),
    ventas: Number(r.ventas ?? 0),
    ingreso_mes: Number(r.ingreso_mes ?? 0),
    ingreso_total: Number(r.ingreso_total ?? 0),
    ultima_venta: (r.ultima_venta as string | null) ?? null,
    valor_inventario: Number(r.valor_inventario ?? 0),
    creada: (r.creada as string | null) ?? null,
    ultima_conexion: (r.ultima_conexion as string | null) ?? null,
    flags: mergeFlags(cfgMap.get(Number(r.id)) ?? null),
  }))
  return { data: rows, error: null }
}

export async function getDbStats(): Promise<{ data: DbStats | null; error: string | null }> {
  const admin = createAdminClient()
  if (!admin) return { data: null, error: "Service role no configurado." }

  const { data, error } = await admin.rpc("plataforma_db_stats")
  if (error) return { data: null, error: error.message }

  const row = (data as RawEmpresa[] | null)?.[0]
  if (!row) return { data: null, error: null }
  return {
    data: {
      db_bytes: Number(row.db_bytes ?? 0),
      conexiones: Number(row.conexiones ?? 0),
      conexiones_max: Number(row.conexiones_max ?? 0),
      empresas: Number(row.empresas ?? 0),
      usuarios: Number(row.usuarios ?? 0),
    },
    error: null,
  }
}

/**
 * Estado del proyecto Supabase via Management API. Opcional: requiere
 * SUPABASE_ACCESS_TOKEN (Personal Access Token) y SUPABASE_PROJECT_REF. Si no
 * estan, devuelve { configured: false } y el portal muestra un aviso.
 */
export async function getSupabaseProjectStatus(): Promise<ProjectStatus> {
  const token = process.env.SUPABASE_ACCESS_TOKEN
  // El project ref se deriva del subdominio de NEXT_PUBLIC_SUPABASE_URL
  // (https://<ref>.supabase.co); SUPABASE_PROJECT_REF lo puede sobreescribir
  // (util si usas dominio propio). Asi basta con SUPABASE_ACCESS_TOKEN.
  let ref = process.env.SUPABASE_PROJECT_REF
  if (!ref && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0]
    } catch {
      /* URL invalida: ref queda undefined */
    }
  }
  if (!token || !ref) return { configured: false }

  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (!res.ok) return { configured: true, error: `HTTP ${res.status}` }
    const p = (await res.json()) as { status?: string; region?: string; name?: string }
    return { configured: true, status: p.status, region: p.region, name: p.name }
  } catch {
    return { configured: true, error: "No se pudo consultar la Management API." }
  }
}

// ==================== ESCRITURA DE FLAGS (solo super-admin) ====================

/**
 * Cambia un feature flag de una empresa. Merge parcial: preserva los demas
 * flags ya guardados. Requiere ser super-admin de plataforma (se verifica
 * server-side) y usa el service role para escribir (la RLS de
 * razon_social_config no da write a `authenticated`).
 */
export async function setEmpresaFlag(
  razonSocialId: number,
  flag: keyof FeatureFlags,
  value: boolean
): Promise<{ error: string | null }> {
  const su = await getSuperadmin()
  if (!su) return { error: "No autorizado." }

  const admin = createAdminClient()
  if (!admin) return { error: "Service role no configurado." }

  // Merge parcial con la config actual para no pisar otros flags.
  const { data: cur } = await admin
    .from("razon_social_config")
    .select("config")
    .eq("razon_social_id", razonSocialId)
    .maybeSingle()

  const config = { ...((cur?.config as Record<string, unknown>) ?? {}), [flag]: value }

  const { error } = await admin.from("razon_social_config").upsert(
    {
      razon_social_id: razonSocialId,
      config,
      usuario: su.email,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "razon_social_id" }
  )
  if (error) return { error: error.message }
  return { error: null }
}

// ==================== CREAR EMPRESA + ADMIN ====================

export interface CrearEmpresaInput {
  nombre_empresa: string
  documento: string // RTN
  nombre_comercial?: string
  correo?: string
  telefono?: string
  direccion?: string
  admin_nombre: string
  admin_email: string
  admin_password: string
}

/**
 * Crea una nueva empresa (razon_social) + su usuario ADMIN en una sola
 * operacion, desde el portal de super-admin. El auth user queda YA VALIDADO
 * (email_confirm) para poder iniciar sesion de inmediato, y con rol 'Admin'
 * (ve todos los modulos sin permisos explicitos). Requiere super-admin de
 * plataforma. Usa el service role. Rollback best-effort si algo falla.
 */
export async function crearEmpresaConAdmin(
  input: CrearEmpresaInput
): Promise<{ error: string | null; razonSocialId?: number; usuarioId?: string }> {
  const su = await getSuperadmin()
  if (!su) return { error: "No autorizado." }

  const admin = createAdminClient()
  if (!admin) return { error: "Service role no configurado (SUPABASE_SERVICE_ROLE_KEY)." }

  const nombre_empresa = (input.nombre_empresa || "").trim()
  const documento = (input.documento || "").trim()
  const admin_nombre = (input.admin_nombre || "").trim()
  const admin_email = (input.admin_email || "").trim().toLowerCase()
  const admin_password = input.admin_password || ""

  if (!nombre_empresa) return { error: "El nombre de la empresa es obligatorio." }
  if (!documento) return { error: "El RTN/documento de la empresa es obligatorio." }
  if (!admin_nombre) return { error: "El nombre del administrador es obligatorio." }
  if (!admin_email || !admin_email.includes("@")) return { error: "El correo del administrador no es valido." }
  if (admin_password.length < 6) return { error: "La contrasena debe tener al menos 6 caracteres." }

  // 1) Crear la razon social (empresa).
  const { data: rs, error: rsErr } = await admin
    .from("razon_social")
    .insert({
      nombre_empresa,
      documento,
      nombre_comercial: input.nombre_comercial?.trim() || null,
      correo: input.correo?.trim() || null,
      telefono: input.telefono?.trim() || null,
      direccion: input.direccion?.trim() || null,
    })
    .select("id")
    .single()
  if (rsErr || !rs) {
    return { error: rsErr?.message || "No se pudo crear la empresa." }
  }
  const razonSocialId = rs.id as number

  // 2) Crear el usuario admin en auth (ya validado / email_confirm).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: admin_email,
    password: admin_password,
    email_confirm: true,
    user_metadata: { nombre: admin_nombre },
  })
  if (createErr || !created?.user) {
    // Rollback: borra la empresa recien creada.
    await admin.from("razon_social").delete().eq("id", razonSocialId)
    const msg = (createErr?.message || "").toLowerCase()
    if (msg.includes("already") || msg.includes("exist") || msg.includes("registered") || msg.includes("duplicate")) {
      return { error: "Ya existe un usuario con ese correo." }
    }
    return { error: createErr?.message || "No se pudo crear el usuario administrador." }
  }
  const usuarioId = created.user.id

  // 3) Perfil de aplicacion (rol Admin -> acceso a todos los modulos).
  const { error: insErr } = await admin.from("usuarios").insert({
    id: usuarioId,
    nombre: admin_nombre,
    rol: "Admin",
    razon_social_id: razonSocialId,
    activo: true,
  })
  if (insErr) {
    // Rollback: borra el auth user y la empresa.
    await admin.auth.admin.deleteUser(usuarioId).catch(() => {})
    await admin.from("razon_social").delete().eq("id", razonSocialId)
    return { error: insErr.message || "No se pudo crear el perfil del administrador." }
  }

  return { error: null, razonSocialId, usuarioId }
}
