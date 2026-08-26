// SERVER-ONLY. Usa el service role (createAdminClient) y cookies de sesion
// (createServerClient). NUNCA importar desde un Client Component.
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient as createServerClient } from "@/lib/supabase/server"

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
