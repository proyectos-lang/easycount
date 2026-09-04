// SERVER-ONLY. Usa el service role (createAdminClient) y cookies de sesion
// (createServerClient). NUNCA importar desde un Client Component.
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { mergeFlags, type FeatureFlags } from "@/lib/constants/feature-flags"
import { findModuloByDBName, moduloEsBase, moduloHabilitadoParaEmpresa } from "@/lib/constants/modulos"

/** Nombre canonico (del constants) de un modulo guardado en la BD. */
function canonModulo(dbNombre: string): string {
  return findModuloByDBName(dbNombre)?.nombre ?? dbNombre
}

function leerLista(config: unknown, key: string): string[] {
  const c = (config as Record<string, unknown>) ?? {}
  const arr = c[key]
  return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : []
}
/** Modulos BASE explicitamente deshabilitados por el super-admin (opt-out). */
function leerDeshabilitados(config: unknown): string[] {
  return leerLista(config, "modulos_deshabilitados")
}
/** Modulos NUEVOS explicitamente habilitados por el super-admin (opt-in). */
function leerHabilitados(config: unknown): string[] {
  return leerLista(config, "modulos_habilitados")
}

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

  // 4) Sembrado por defecto (BEST-EFFORT): almacen + bodega (marcada como punto
  //    de venta) + cliente "Consumidor Final", para que la empresa quede lista
  //    para vender sin configurar nada. Si algo falla, no es critico: la empresa
  //    y el admin ya existen y el admin puede crear estos catalogos a mano.
  try {
    const { data: alm } = await admin
      .from("almacenes")
      .insert({ nombre: "Principal", ubicacion: "Principal", razon_social_id: razonSocialId, usuario: admin_nombre })
      .select("id")
      .single()

    if (alm?.id) {
      const { data: loc } = await admin
        .from("localizaciones")
        .insert({ nombre: "General", almacen_id: alm.id, razon_social_id: razonSocialId, usuario: admin_nombre })
        .select("id")
        .single()

      // Marca la bodega como punto de venta (se preselecciona en Nueva Venta).
      // Requiere el script 041; si la tabla no existe se ignora el error.
      if (loc?.id) {
        const { error: cfgErr } = await admin
          .from("localizaciones_config")
          .insert({ localizacion_id: loc.id, razon_social_id: razonSocialId, es_punto_venta: true, usuario: admin_nombre })
        if (cfgErr) console.log("[crearEmpresaConAdmin] localizaciones_config (opcional):", cfgErr.message)
      }
    }

    const { error: cliErr } = await admin
      .from("clientes")
      .insert({ nombre: "Consumidor Final", razon_social_id: razonSocialId })
    if (cliErr) console.log("[crearEmpresaConAdmin] cliente Consumidor Final (opcional):", cliErr.message)
  } catch (seedErr) {
    console.log("[crearEmpresaConAdmin] sembrado por defecto fallo (no critico):", seedErr)
  }

  return { error: null, razonSocialId, usuarioId }
}

// ==================== GESTION DE USUARIOS (cross-empresa) ====================
// Todas requieren super-admin de plataforma y usan el service role, por eso
// pueden administrar usuarios de CUALQUIER empresa (a diferencia de las de
// configuracion/usuarios, que estan acotadas al propio tenant del admin).

export interface UsuarioEmpresa {
  id: string
  nombre: string
  rol: string | null
  activo: boolean
}
export interface ModuloItem {
  id: number
  nombre: string
}

/** Devuelve el cliente service-role SOLO si el caller es super-admin; si no, null. */
async function getAdminIfSuper() {
  const su = await getSuperadmin()
  if (!su) return null
  return createAdminClient()
}

const NO_AUTORIZADO = "No autorizado o service role no configurado."

/** Usuarios de una empresa + catalogo de modulos (para editar permisos). */
export async function getUsuariosEmpresa(
  razonSocialId: number
): Promise<{ usuarios: UsuarioEmpresa[]; modulos: ModuloItem[]; error: string | null }> {
  const admin = await getAdminIfSuper()
  if (!admin) return { usuarios: [], modulos: [], error: NO_AUTORIZADO }
  const [uRes, mRes, cfgRes] = await Promise.all([
    admin.from("usuarios").select("id, nombre, rol, activo").eq("razon_social_id", razonSocialId).order("nombre", { ascending: true }),
    admin.from("modulos").select("id, nombre").order("nombre", { ascending: true }),
    admin.from("razon_social_config").select("config").eq("razon_social_id", razonSocialId).maybeSingle(),
  ])
  if (uRes.error) return { usuarios: [], modulos: [], error: uRes.error.message }
  // Solo se pueden asignar permisos de modulos HABILITADOS para la empresa
  // (base salvo deshabilitados; nuevos solo si el super-admin los habilito).
  const cfg = cfgRes.data?.config
  const des = leerDeshabilitados(cfg)
  const hab = leerHabilitados(cfg)
  const modulos = ((mRes.data || []) as ModuloItem[]).filter((m) =>
    moduloHabilitadoParaEmpresa(canonModulo(m.nombre), des, hab)
  )
  return {
    usuarios: (uRes.data || []) as UsuarioEmpresa[],
    modulos,
    error: null,
  }
}

/** Permisos (modulo_id -> puede_ver) de un usuario. */
export async function getPermisosUsuario(
  usuarioId: string
): Promise<{ permisos: Record<number, boolean>; error: string | null }> {
  const admin = await getAdminIfSuper()
  if (!admin) return { permisos: {}, error: NO_AUTORIZADO }
  const { data, error } = await admin.from("permisos_usuarios").select("modulo_id, puede_ver").eq("usuario_id", usuarioId)
  if (error) return { permisos: {}, error: error.message }
  const map: Record<number, boolean> = {}
  for (const r of data || []) map[r.modulo_id as number] = !!r.puede_ver
  return { permisos: map, error: null }
}

/** Crea un usuario (auth ya validado) para una empresa. */
export async function crearUsuarioEmpresa(input: {
  razonSocialId: number
  email: string
  password: string
  nombre: string
  rol: "admin" | "usuario"
}): Promise<{ error: string | null; usuarioId?: string }> {
  const admin = await getAdminIfSuper()
  if (!admin) return { error: NO_AUTORIZADO }

  const email = (input.email || "").trim().toLowerCase()
  const nombre = (input.nombre || "").trim()
  const rol = input.rol === "admin" ? "Admin" : "Usuario"
  if (!email || !email.includes("@")) return { error: "El correo no es valido." }
  if (!nombre) return { error: "El nombre es obligatorio." }
  if ((input.password || "").length < 6) return { error: "La contrasena debe tener al menos 6 caracteres." }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { nombre },
  })
  if (createErr || !created?.user) {
    const msg = (createErr?.message || "").toLowerCase()
    if (msg.includes("already") || msg.includes("exist") || msg.includes("registered") || msg.includes("duplicate")) {
      return { error: "Ya existe un usuario con ese correo." }
    }
    return { error: createErr?.message || "No se pudo crear el usuario en auth." }
  }
  const newId = created.user.id

  const { error: insErr } = await admin.from("usuarios").insert({
    id: newId,
    nombre,
    rol,
    razon_social_id: input.razonSocialId,
    activo: true,
  })
  if (insErr) {
    await admin.auth.admin.deleteUser(newId).catch(() => {})
    return { error: insErr.message || "No se pudo crear el perfil del usuario." }
  }
  return { error: null, usuarioId: newId }
}

/** Enciende/apaga el permiso de un modulo para un usuario. */
export async function setPermisoUsuario(input: {
  usuarioId: string
  moduloId: number
  puedeVer: boolean
}): Promise<{ error: string | null }> {
  const admin = await getAdminIfSuper()
  if (!admin) return { error: NO_AUTORIZADO }
  const { error } = await admin
    .from("permisos_usuarios")
    .upsert(
      { usuario_id: input.usuarioId, modulo_id: input.moduloId, puede_ver: input.puedeVer },
      { onConflict: "usuario_id,modulo_id" }
    )
  return { error: error ? error.message : null }
}

/** Cambia el rol (admin ve todos los modulos; usuario solo los permitidos). */
export async function setRolUsuario(input: {
  usuarioId: string
  rol: "admin" | "usuario"
}): Promise<{ error: string | null }> {
  const admin = await getAdminIfSuper()
  if (!admin) return { error: NO_AUTORIZADO }
  const { error } = await admin
    .from("usuarios")
    .update({ rol: input.rol === "admin" ? "Admin" : "Usuario" })
    .eq("id", input.usuarioId)
  return { error: error ? error.message : null }
}

/** Activa/desactiva un usuario. */
export async function setActivoUsuario(input: {
  usuarioId: string
  activo: boolean
}): Promise<{ error: string | null }> {
  const admin = await getAdminIfSuper()
  if (!admin) return { error: NO_AUTORIZADO }
  const { error } = await admin.from("usuarios").update({ activo: input.activo }).eq("id", input.usuarioId)
  return { error: error ? error.message : null }
}

/** Restablece la contrasena de un usuario. */
export async function resetPasswordUsuario(input: {
  usuarioId: string
  newPassword: string
}): Promise<{ error: string | null }> {
  const admin = await getAdminIfSuper()
  if (!admin) return { error: NO_AUTORIZADO }
  if ((input.newPassword || "").length < 6) return { error: "La contrasena debe tener al menos 6 caracteres." }
  const { error } = await admin.auth.admin.updateUserById(input.usuarioId, { password: input.newPassword })
  return { error: error ? error.message : null }
}

// ==================== MODULOS HABILITADOS POR EMPRESA ====================
// El super-admin decide que modulos ve cada empresa. Se guardan los DESHABILITADOS
// (nombres canonicos) en razon_social_config.config.modulos_deshabilitados.
// Ausente = ninguno deshabilitado = todos habilitados (retrocompatible).
// Un modulo deshabilitado NO lo ve nadie de esa empresa (ni el admin) y no
// aparece en la seccion de permisos de Configuracion -> Usuarios.

/**
 * Config de modulos de una empresa: listas de DESHABILITADOS (base apagados por
 * el super-admin) y HABILITADOS (nuevos encendidos por el super-admin).
 */
export async function getModulosEmpresaConfig(
  razonSocialId: number
): Promise<{ deshabilitados: string[]; habilitados: string[]; error: string | null }> {
  const admin = await getAdminIfSuper()
  if (!admin) return { deshabilitados: [], habilitados: [], error: NO_AUTORIZADO }
  const { data, error } = await admin
    .from("razon_social_config")
    .select("config")
    .eq("razon_social_id", razonSocialId)
    .maybeSingle()
  if (error) return { deshabilitados: [], habilitados: [], error: error.message }
  return { deshabilitados: leerDeshabilitados(data?.config), habilitados: leerHabilitados(data?.config), error: null }
}

/**
 * Habilita (true) o deshabilita (false) un modulo para una empresa. Actualiza la
 * lista correcta segun sea base (opt-out) o nuevo (opt-in).
 */
export async function setModuloEmpresa(input: {
  razonSocialId: number
  moduloNombre: string
  habilitado: boolean
}): Promise<{ error: string | null }> {
  const su = await getSuperadmin()
  if (!su) return { error: "No autorizado." }
  const admin = createAdminClient()
  if (!admin) return { error: "Service role no configurado." }

  const { data: cur } = await admin
    .from("razon_social_config")
    .select("config")
    .eq("razon_social_id", input.razonSocialId)
    .maybeSingle()

  const cfg = (cur?.config as Record<string, unknown>) ?? {}
  const des = new Set<string>(leerDeshabilitados(cfg))
  const hab = new Set<string>(leerHabilitados(cfg))
  if (moduloEsBase(input.moduloNombre)) {
    if (input.habilitado) des.delete(input.moduloNombre)
    else des.add(input.moduloNombre)
  } else {
    if (input.habilitado) hab.add(input.moduloNombre)
    else hab.delete(input.moduloNombre)
  }

  const config = { ...cfg, modulos_deshabilitados: [...des], modulos_habilitados: [...hab] }
  const { error } = await admin.from("razon_social_config").upsert(
    {
      razon_social_id: input.razonSocialId,
      config,
      usuario: su.email,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "razon_social_id" }
  )
  return { error: error ? error.message : null }
}
