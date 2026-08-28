import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { getTenantStamp, isValidStamp, SESION_INVALIDA_ERROR } from '@/lib/services/tenant-stamp'
import { comprimirImagen } from '@/lib/utils/comprimir-imagen'

// ==================== INTERFACES ====================

export interface Producto {
  id?: number
  nombre: string
  codigo_barras: string
  precio_venta_sugerido: number
  costo_promedio?: number
  stock_total?: number
  /** Talla opcional (ej. S, M, L, 38). Se muestra en el catalogo cuando existe. */
  talla?: string | null
  foto_url?: string
  marca_id?: number | null
  categoria_id?: number | null
  /** Opcional: el producto puede tener solo categoria principal. */
  subcategoria_id?: number | null
  marca_nombre?: string
  categoria_nombre?: string
  /** Nombre flat de la subcategoria (join virtual, no se persiste). */
  subcategoria_nombre?: string | null
  created_at?: string
  updated_at?: string
}

/**
 * Subcategoria: hija de una categoria principal. Multi-tenant: cada tenant
 * mantiene su propio arbol categoria -> subcategorias. La FK a categorias
 * usa ON DELETE CASCADE: borrar la categoria padre elimina sus hijas.
 */
export interface Subcategoria {
  id?: number
  nombre: string
  descripcion?: string | null
  categoria_id: number
  created_at?: string
}

export interface Marca {
  id?: number
  nombre: string
  created_at?: string
}

export interface Categoria {
  id?: number
  nombre: string
  created_at?: string
}

export interface Almacen {
  id?: number
  nombre: string
  ubicacion: string
  created_at?: string
}

export interface Localizacion {
  id?: number
  almacen_id: number
  nombre: string
  descripcion?: string
  created_at?: string
  /** Marcada como "Punto de venta": se preselecciona en Nueva Venta. */
  es_punto_venta?: boolean
}

export interface Cliente {
  id?: number
  nombre: string  // required
  rtn?: string  // optional
  direccion?: string  // optional
  telefono?: string  // optional - contacto CRM
  /**
   * Fecha de nacimiento en formato ISO 'YYYY-MM-DD' (DATE en Postgres).
   * Usado para alertas de cumpleanos en el modulo de clientes.
   */
  fecha_nacimiento?: string
}

export interface Proveedor {
  id?: number
  nombre: string
  rtn: string
  contacto: string
  created_at?: string
}

// ==================== PRODUCTOS ====================

export async function getProductos(): Promise<{ data: Producto[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('productos')
    return { data: saved ? JSON.parse(saved) : [], error: null }
  }

  const supabase = createClient()
  if (!supabase) return { data: [], error: 'Cliente no disponible' }

  try {
    // Intentamos primero con el join a subcategorias (post-migracion 015).
    // Si la columna o la tabla no existen aun, caemos al select clasico
    // sin romper la pagina. Asi el feature de subcategorias se "enciende"
    // automaticamente cuando el script 015 se ejecuta.
    let result = await supabase
      .from('productos')
      .select('*, marcas(nombre), categorias(nombre), subcategorias(nombre)')
      .order('id', { ascending: true })

    if (
      result.error &&
      /subcategoria|column.*does not exist|relation.*does not exist/i.test(
        result.error.message
      )
    ) {
      console.log(
        '[catalogos] subcategorias no disponibles, fallback sin join'
      )
      result = await supabase
        .from('productos')
        .select('*, marcas(nombre), categorias(nombre)')
        .order('id', { ascending: true })
    }

    if (result.error) return { data: [], error: result.error.message }

    // Flatten join data
    const productos = (result.data || []).map((p: any) => ({
      ...p,
      marca_nombre: p.marcas?.nombre || null,
      categoria_nombre: p.categorias?.nombre || null,
      subcategoria_nombre: p.subcategorias?.nombre || null,
      marcas: undefined,
      categorias: undefined,
      subcategorias: undefined,
    }))

    return { data: productos, error: null }
  } catch (err) {
    console.error('[Supabase] Error obteniendo productos:', err)
    return { data: [], error: 'Error de conexion' }
  }
}

export async function saveProducto(
  producto: Producto,
  isNew: boolean
): Promise<{ data: Producto | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('productos')
    const productos: Producto[] = saved ? JSON.parse(saved) : []
    
    if (isNew) {
      const newProducto = { ...producto, id: Date.now() }
      productos.push(newProducto)
      localStorage.setItem('productos', JSON.stringify(productos))
      return { data: newProducto, error: null }
    } else {
      const idx = productos.findIndex(p => p.id === producto.id)
      if (idx >= 0) productos[idx] = producto
      localStorage.setItem('productos', JSON.stringify(productos))
      return { data: producto, error: null }
    }
  }

  const supabase = createClient()
  if (!supabase) return { data: null, error: 'Cliente no disponible' }

  try {
    // Strip join-only fields before sending to DB. subcategoria_nombre es un
    // campo virtual que viene del join en getProductos y no existe como
    // columna real en productos.
    const {
      marca_nombre,
      categoria_nombre,
      subcategoria_nombre,
      ...cleanProducto
    } = producto

    // Si el cliente no asigno subcategoria, no la mandamos en el payload.
    // Asi el codigo sigue funcionando antes de aplicar la migracion 015
    // (cuando productos.subcategoria_id no existe todavia). Cuando si esta
    // asignada, se manda y se persiste normal.
    if (cleanProducto.subcategoria_id == null) {
      delete (cleanProducto as { subcategoria_id?: number | null }).subcategoria_id
    }

    // Talla es opcional (columna nueva, migracion 033). Solo se envia si tiene
    // valor; asi el guardado sigue funcionando en bases sin la columna y los
    // productos sin talla no la mandan.
    if (cleanProducto.talla == null || String(cleanProducto.talla).trim() === '') {
      delete (cleanProducto as { talla?: string | null }).talla
    } else {
      cleanProducto.talla = String(cleanProducto.talla).trim()
    }

    if (isNew) {
      const stamp = await getTenantStamp(supabase)
      if (!isValidStamp(stamp)) {
        console.log('[saveProducto] Stamp invalido:', stamp)
        return { data: null, error: SESION_INVALIDA_ERROR }
      }

      const { id, ...productoData } = cleanProducto
      const { data, error } = await supabase
        .from('productos')
        .insert({ ...productoData, ...stamp })
        .select()
        .single()

      if (error) return { data: null, error: error.message }
      return { data, error: null }
    } else {
      // Strip id, created_at, stock_total (read-only/auto) from the UPDATE
      // payload. costo_promedio SI se permite editar manualmente.
      const { id, created_at, stock_total, ...updateData } = cleanProducto
      const { data, error } = await supabase
        .from('productos')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) return { data: null, error: error.message }
      return { data, error: null }
    }
  } catch (err) {
    console.error('[Supabase] Error guardando producto:', err)
    return { data: null, error: 'Error de conexion' }
  }
}

/** Dependencias de un producto que condicionan si se puede borrar. */
export interface ProductoDependencias {
  /** Lineas de venta (ventas_detalle). Si > 0, NO se borra. */
  ventas: number
  /** Lineas de compra/recepcion (compras_detalle). Si > 0, NO se borra. */
  compras: number
  /** Movimientos de inventario (transacciones_inventario). Se borran en cascada. */
  transacciones: number
}

type SupaErr = { code?: string; message?: string } | null

/** True cuando el error indica que la tabla no existe (no es una dependencia). */
function esTablaAusente(err: SupaErr): boolean {
  if (!err) return false
  if (err.code === '42P01' || err.code === 'PGRST205') return true
  return /relation .* does not exist|could not find the table/i.test(err.message || '')
}

async function contarPorProducto(
  supabase: NonNullable<ReturnType<typeof createClient>>,
  tabla: string,
  productoId: number
): Promise<{ count: number; error: string | null }> {
  const { count, error } = await supabase
    .from(tabla)
    .select('id', { count: 'exact', head: true })
    .eq('producto_id', productoId)
  if (error) {
    // Tabla ausente = feature no aplicada = sin dependencias.
    if (esTablaAusente(error)) return { count: 0, error: null }
    return { count: 0, error: error.message }
  }
  return { count: count || 0, error: null }
}

/** Borra filas hijas por producto_id; ignora tablas ausentes (best-effort). */
async function borrarPorProductoBestEffort(
  supabase: NonNullable<ReturnType<typeof createClient>>,
  tabla: string,
  productoId: number
): Promise<void> {
  const { error } = await supabase.from(tabla).delete().eq('producto_id', productoId)
  if (error && !esTablaAusente(error)) {
    console.warn(`[deleteProducto] No se pudo limpiar ${tabla}:`, error.message)
  }
}

/**
 * Cuenta las dependencias de un producto (ventas, compras, movimientos de
 * inventario). La usa la UI para decidir el mensaje: bloquear si hay ventas o
 * compras, o confirmar el borrado en cascada si solo hay movimientos.
 */
export async function getProductoDependencias(
  id: number
): Promise<{ data: ProductoDependencias; error: string | null }> {
  const vacio = { ventas: 0, compras: 0, transacciones: 0 }
  if (!isSupabaseConfigured()) return { data: vacio, error: null }

  const supabase = createClient()
  if (!supabase) return { data: vacio, error: 'Cliente no disponible' }

  const [v, c, t] = await Promise.all([
    contarPorProducto(supabase, 'ventas_detalle', id),
    contarPorProducto(supabase, 'compras_detalle', id),
    contarPorProducto(supabase, 'transacciones_inventario', id),
  ])
  const error = v.error || c.error || t.error
  return { data: { ventas: v.count, compras: c.count, transacciones: t.count }, error }
}

/** True cuando el RPC no existe todavia (migracion 036 pendiente). */
function funcionRpcInexistente(err: SupaErr): boolean {
  if (!err) return false
  if (err.code === 'PGRST202') return true
  return /could not find the function|function .* does not exist|not exist in the schema cache/i.test(
    err.message || ''
  )
}

/**
 * Elimina un producto. Reglas:
 *  - Si tiene VENTAS (ventas_detalle) o COMPRAS/RECEPCIONES (compras_detalle) ->
 *    NO se borra (protege el historial financiero).
 *  - En otro caso, borra en cascada sus movimientos de inventario
 *    (transacciones_inventario) y las bitacoras que lo referencian
 *    (ajustes_inventario, ajustes_costo, pedidos_detalle), y luego el producto.
 *    `catalogo_link_productos` cae solo (ON DELETE CASCADE).
 *
 * Ruta principal: RPC `eliminar_producto_en_cascada` (SECURITY DEFINER, script
 * 036). Corre del lado servidor IGNORANDO RLS, por lo que borra tambien los
 * movimientos con `razon_social_id` mal sellado (NULL / otra empresa) que el
 * cliente no ve pero que igual bloquean el FK. Si el RPC no existe todavia, cae
 * al metodo JS.
 */
export async function deleteProducto(id: number): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('productos')
    const productos: Producto[] = saved ? JSON.parse(saved) : []
    const filtered = productos.filter(p => p.id !== id)
    localStorage.setItem('productos', JSON.stringify(filtered))
    return { success: true, error: null }
  }

  const supabase = createClient()
  if (!supabase) return { success: false, error: 'Cliente no disponible' }

  try {
    const { data, error } = await supabase.rpc('eliminar_producto_en_cascada', {
      p_producto_id: id,
    })
    if (!error) {
      // La funcion devuelve NULL si borro; o un mensaje de bloqueo/validacion.
      if (data == null) return { success: true, error: null }
      return { success: false, error: String(data) }
    }
    // Migracion 036 pendiente: usar la ruta JS (pasa por RLS).
    if (funcionRpcInexistente(error)) {
      return await deleteProductoFallbackJS(supabase, id)
    }
    return { success: false, error: error.message }
  } catch (err) {
    console.error('[Supabase] Error eliminando producto:', err)
    return { success: false, error: 'Error de conexion' }
  }
}

/**
 * Fallback sin RPC: mismas reglas pero desde el cliente (pasa por RLS, por lo que
 * NO alcanza movimientos con `razon_social_id` mal sellado). Se usa solo mientras
 * no se aplica el script 036.
 */
async function deleteProductoFallbackJS(
  supabase: NonNullable<ReturnType<typeof createClient>>,
  id: number
): Promise<{ success: boolean; error: string | null }> {
  // 1) Proteccion: ventas y compras bloquean el borrado.
  const ventas = await contarPorProducto(supabase, 'ventas_detalle', id)
  if (ventas.error) return { success: false, error: ventas.error }
  if (ventas.count > 0) {
    return {
      success: false,
      error: `No se puede eliminar: el producto tiene ${ventas.count} venta(s) registrada(s). No se borra para conservar el historial de ventas.`,
    }
  }
  const compras = await contarPorProducto(supabase, 'compras_detalle', id)
  if (compras.error) return { success: false, error: compras.error }
  if (compras.count > 0) {
    return {
      success: false,
      error: `No se puede eliminar: el producto tiene ${compras.count} compra(s)/recepcion(es) registrada(s).`,
    }
  }

  // 2) Cascada de movimientos e historiales de inventario.
  const ti = await supabase.from('transacciones_inventario').delete().eq('producto_id', id)
  if (ti.error) return { success: false, error: `No se pudieron eliminar los movimientos de inventario: ${ti.error.message}` }
  await borrarPorProductoBestEffort(supabase, 'ajustes_inventario', id)
  await borrarPorProductoBestEffort(supabase, 'ajustes_costo', id)
  await borrarPorProductoBestEffort(supabase, 'pedidos_detalle', id)

  // 3) Borrar el producto.
  const { error } = await supabase.from('productos').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}

export async function uploadProductoImage(
  file: File,
  opts?: { comprimir?: boolean }
): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { url: URL.createObjectURL(file), error: null }
  }

  try {
    // Comprime en el navegador antes de subir: baja resolucion/peso de fotos
    // muy grandes (celular) para que quepan bajo el limite y carguen rapido.
    // El backfill pasa `comprimir: false` porque ya viene comprimida.
    const procesada =
      opts?.comprimir === false ? file : (await comprimirImagen(file)).file

    const formData = new FormData()
    formData.append('file', procesada)

    const res = await fetch('/api/upload-imagen', {
      method: 'POST',
      body: formData
    })

    const json = await res.json()

    if (!res.ok) {
      return { url: null, error: json.error || 'Error al subir imagen' }
    }

    return { url: json.url, error: null }
  } catch (err) {
    console.error('[Upload] Error subiendo imagen:', err)
    return { url: null, error: 'Error subiendo imagen' }
  }
}

export interface ProgresoRecompresion {
  total: number
  procesados: number
  comprimidas: number
  errores: number
  bytesAhorrados: number
  /** Nombre del producto en proceso (para feedback en vivo). */
  actual?: string
}

/**
 * Backfill: recomprime las fotos YA subidas de los productos de la empresa
 * actual (tenant vía RLS). Para cada foto: la descarga, la comprime en el
 * navegador y, si queda mas liviana, la vuelve a subir y actualiza `foto_url`.
 * Idempotente: una foto ya optimizada se salta (no se recomprime).
 *
 * `onProgress` se llama por cada producto para poder mostrar el avance.
 */
export async function recomprimirFotosProductos(
  onProgress?: (p: ProgresoRecompresion) => void
): Promise<{ data: ProgresoRecompresion; error: string | null }> {
  const prog: ProgresoRecompresion = {
    total: 0,
    procesados: 0,
    comprimidas: 0,
    errores: 0,
    bytesAhorrados: 0,
  }

  if (!isSupabaseConfigured()) return { data: prog, error: 'Supabase no configurado' }
  const supabase = createClient()
  if (!supabase) return { data: prog, error: 'Cliente no disponible' }

  const { data: productos, error } = await getProductos()
  if (error) return { data: prog, error }

  const conFoto = (productos || []).filter(
    (p) => typeof p.foto_url === 'string' && /^https?:\/\//.test(p.foto_url)
  )
  prog.total = conFoto.length
  onProgress?.({ ...prog })

  for (const p of conFoto) {
    prog.actual = p.nombre
    onProgress?.({ ...prog })
    try {
      const resp = await fetch(p.foto_url as string, { cache: 'no-store' })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const blob = await resp.blob()
      const nombre = (p.foto_url as string).split('/').pop() || 'foto.jpg'
      const file = new File([blob], nombre, { type: blob.type || 'image/jpeg' })

      const r = await comprimirImagen(file)
      if (r.comprimida && r.bytesDespues < r.bytesAntes) {
        const { url, error: upErr } = await uploadProductoImage(r.file, { comprimir: false })
        if (upErr || !url) throw new Error(upErr || 'No se pudo subir')
        const { error: updErr } = await supabase
          .from('productos')
          .update({ foto_url: url })
          .eq('id', p.id as number)
        if (updErr) throw new Error(updErr.message)
        prog.comprimidas += 1
        prog.bytesAhorrados += r.bytesAntes - r.bytesDespues
      }
    } catch (err) {
      console.error('[Recompresion] Error con producto', p.id, err)
      prog.errores += 1
    }
    prog.procesados += 1
    onProgress?.({ ...prog })
  }

  prog.actual = undefined
  onProgress?.({ ...prog })
  return { data: prog, error: null }
}

// ==================== MARCAS ====================

export async function getMarcas(): Promise<{ data: Marca[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('marcas')
    return { data: saved ? JSON.parse(saved) : [], error: null }
  }

  const supabase = createClient()
  if (!supabase) return { data: [], error: 'Cliente no disponible' }

  try {
    const { data, error } = await supabase
      .from('marcas')
      .select('*')
      .order('nombre', { ascending: true })

    if (error) return { data: [], error: error.message }
    return { data: data || [], error: null }
  } catch (err) {
    console.error('[Supabase] Error obteniendo marcas:', err)
    return { data: [], error: 'Error de conexion' }
  }
}

export async function createMarca(nombre: string): Promise<{ data: Marca | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('marcas')
    const marcas: Marca[] = saved ? JSON.parse(saved) : []
    const newMarca = { id: Date.now(), nombre }
    marcas.push(newMarca)
    localStorage.setItem('marcas', JSON.stringify(marcas))
    return { data: newMarca, error: null }
  }

  const supabase = createClient()
  if (!supabase) return { data: null, error: 'Cliente no disponible' }

  try {
    const stamp = await getTenantStamp(supabase)
    if (!isValidStamp(stamp)) {
      console.log('[createMarca] Stamp invalido:', stamp)
      return { data: null, error: SESION_INVALIDA_ERROR }
    }

    const { data, error } = await supabase
      .from('marcas')
      .insert({ nombre, ...stamp })
      .select()
      .single()

    if (error) return { data: null, error: error.message }
    return { data, error: null }
  } catch (err) {
    console.error('[Supabase] Error creando marca:', err)
    return { data: null, error: 'Error de conexion' }
  }
}

// ==================== CATEGORIAS ====================

export async function getCategorias(): Promise<{ data: Categoria[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('categorias')
    return { data: saved ? JSON.parse(saved) : [], error: null }
  }

  const supabase = createClient()
  if (!supabase) return { data: [], error: 'Cliente no disponible' }

  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre', { ascending: true })

    if (error) return { data: [], error: error.message }
    return { data: data || [], error: null }
  } catch (err) {
    console.error('[Supabase] Error obteniendo categorias:', err)
    return { data: [], error: 'Error de conexion' }
  }
}

export async function createCategoria(nombre: string): Promise<{ data: Categoria | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('categorias')
    const categorias: Categoria[] = saved ? JSON.parse(saved) : []
    const newCategoria = { id: Date.now(), nombre }
    categorias.push(newCategoria)
    localStorage.setItem('categorias', JSON.stringify(categorias))
    return { data: newCategoria, error: null }
  }

  const supabase = createClient()
  if (!supabase) return { data: null, error: 'Cliente no disponible' }

  try {
    const stamp = await getTenantStamp(supabase)
    if (!isValidStamp(stamp)) {
      console.log('[createCategoria] Stamp invalido:', stamp)
      return { data: null, error: SESION_INVALIDA_ERROR }
    }

    const { data, error } = await supabase
      .from('categorias')
      .insert({ nombre, ...stamp })
      .select()
      .single()

    if (error) return { data: null, error: error.message }
    return { data, error: null }
  } catch (err) {
    console.error('[Supabase] Error creando categoria:', err)
    return { data: null, error: 'Error de conexion' }
  }
}

// ==================== SUBCATEGORIAS ====================

/**
 * Lista subcategorias. Si se pasa `categoriaId` filtra a las hijas de esa
 * categoria (UI de cascada en el form de productos). Sin filtro, devuelve
 * todas las del tenant para la vista de Gestion de Categorias.
 *
 * Resiliente al pre-015: si la tabla aun no existe, regresa lista vacia
 * sin error para que la UI siga funcionando.
 */
export async function getSubcategorias(
  categoriaId?: number
): Promise<{ data: Subcategoria[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('subcategorias')
    let subs: Subcategoria[] = saved ? JSON.parse(saved) : []
    if (categoriaId != null) {
      subs = subs.filter((s) => s.categoria_id === categoriaId)
    }
    return { data: subs, error: null }
  }

  const supabase = createClient()
  if (!supabase) return { data: [], error: 'Cliente no disponible' }

  try {
    let query = supabase
      .from('subcategorias')
      .select('*')
      .order('nombre', { ascending: true })

    if (categoriaId != null) {
      query = query.eq('categoria_id', categoriaId)
    }

    const { data, error } = await query

    if (error) {
      // Migracion 015 pendiente: degradamos silenciosamente.
      if (/relation.*does not exist/i.test(error.message)) {
        console.log('[subcategorias] tabla no existe, devolviendo vacio')
        return { data: [], error: null }
      }
      return { data: [], error: error.message }
    }
    return { data: data || [], error: null }
  } catch (err) {
    console.error('[Supabase] Error obteniendo subcategorias:', err)
    return { data: [], error: 'Error de conexion' }
  }
}

export async function createSubcategoria(
  nombre: string,
  categoriaId: number,
  descripcion?: string
): Promise<{ data: Subcategoria | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('subcategorias')
    const subs: Subcategoria[] = saved ? JSON.parse(saved) : []
    const newSub: Subcategoria = {
      id: Date.now(),
      nombre,
      categoria_id: categoriaId,
      descripcion,
    }
    subs.push(newSub)
    localStorage.setItem('subcategorias', JSON.stringify(subs))
    return { data: newSub, error: null }
  }

  const supabase = createClient()
  if (!supabase) return { data: null, error: 'Cliente no disponible' }

  try {
    const stamp = await getTenantStamp(supabase)
    if (!isValidStamp(stamp)) {
      console.log('[createSubcategoria] Stamp invalido:', stamp)
      return { data: null, error: SESION_INVALIDA_ERROR }
    }

    // Inyectamos categoria_id + razon_social_id (del tenant stamp). El UNIQUE
    // compuesto en BD evitara duplicados dentro de la misma categoria/tenant.
    const { data, error } = await supabase
      .from('subcategorias')
      .insert({
        nombre,
        descripcion: descripcion ?? null,
        categoria_id: categoriaId,
        ...stamp,
      })
      .select()
      .single()

    if (error) return { data: null, error: error.message }
    return { data, error: null }
  } catch (err) {
    console.error('[Supabase] Error creando subcategoria:', err)
    return { data: null, error: 'Error de conexion' }
  }
}

export async function updateSubcategoria(
  id: number,
  nombre: string,
  descripcion?: string | null
): Promise<{ data: Subcategoria | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('subcategorias')
    const subs: Subcategoria[] = saved ? JSON.parse(saved) : []
    const idx = subs.findIndex((s) => s.id === id)
    if (idx >= 0) {
      subs[idx] = { ...subs[idx], nombre, descripcion: descripcion ?? null }
      localStorage.setItem('subcategorias', JSON.stringify(subs))
      return { data: subs[idx], error: null }
    }
    return { data: null, error: 'No encontrada' }
  }

  const supabase = createClient()
  if (!supabase) return { data: null, error: 'Cliente no disponible' }

  try {
    const { data, error } = await supabase
      .from('subcategorias')
      .update({
        nombre,
        descripcion: descripcion ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return { data: null, error: error.message }
    return { data, error: null }
  } catch (err) {
    console.error('[Supabase] Error actualizando subcategoria:', err)
    return { data: null, error: 'Error de conexion' }
  }
}

export async function deleteSubcategoria(
  id: number
): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('subcategorias')
    const subs: Subcategoria[] = saved ? JSON.parse(saved) : []
    const filtered = subs.filter((s) => s.id !== id)
    localStorage.setItem('subcategorias', JSON.stringify(filtered))
    return { success: true, error: null }
  }

  const supabase = createClient()
  if (!supabase) return { success: false, error: 'Cliente no disponible' }

  try {
    // El FK productos.subcategoria_id usa ON DELETE SET NULL, asi que esto
    // no rompe la integridad: los productos que la usaban quedaran solo con
    // categoria principal.
    const { error } = await supabase.from('subcategorias').delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    return { success: true, error: null }
  } catch (err) {
    console.error('[Supabase] Error eliminando subcategoria:', err)
    return { success: false, error: 'Error de conexion' }
  }
}

// ==================== ALMACENES ====================

export async function getAlmacenes(): Promise<{ data: Almacen[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('almacenes')
    return { data: saved ? JSON.parse(saved) : [], error: null }
  }

  const supabase = createClient()
  if (!supabase) return { data: [], error: 'Cliente no disponible' }

  try {
    const { data, error } = await supabase
      .from('almacenes')
      .select('*')
      .order('id', { ascending: true })

    if (error) return { data: [], error: error.message }
    return { data: data || [], error: null }
  } catch (err) {
    console.error('[Supabase] Error obteniendo almacenes:', err)
    return { data: [], error: 'Error de conexion' }
  }
}

export async function saveAlmacen(
  almacen: Almacen,
  isNew: boolean
): Promise<{ data: Almacen | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('almacenes')
    const almacenes: Almacen[] = saved ? JSON.parse(saved) : []
    
    if (isNew) {
      const newAlmacen = { ...almacen, id: Date.now() }
      almacenes.push(newAlmacen)
      localStorage.setItem('almacenes', JSON.stringify(almacenes))
      return { data: newAlmacen, error: null }
    } else {
      const idx = almacenes.findIndex(a => a.id === almacen.id)
      if (idx >= 0) almacenes[idx] = almacen
      localStorage.setItem('almacenes', JSON.stringify(almacenes))
      return { data: almacen, error: null }
    }
  }

  const supabase = createClient()
  if (!supabase) return { data: null, error: 'Cliente no disponible' }

  try {
    if (isNew) {
      const stamp = await getTenantStamp(supabase)
      if (!isValidStamp(stamp)) {
        console.log('[saveAlmacen] Stamp invalido:', stamp)
        return { data: null, error: SESION_INVALIDA_ERROR }
      }

      const { id, ...almacenData } = almacen
      const { data, error } = await supabase
        .from('almacenes')
        .insert({ ...almacenData, ...stamp })
        .select()
        .single()

      if (error) return { data: null, error: error.message }
      return { data, error: null }
    } else {
      // Update: no tocamos razon_social_id (aislamiento) ni usuario
      // (historial del creador original). Solo datos funcionales.
      const { id, ...almacenData } = almacen
      const { data, error } = await supabase
        .from('almacenes')
        .update(almacenData)
        .eq('id', almacen.id)
        .select()
        .single()

      if (error) return { data: null, error: error.message }
      return { data, error: null }
    }
  } catch (err) {
    console.error('[Supabase] Error guardando almacen:', err)
    return { data: null, error: 'Error de conexion' }
  }
}

export async function deleteAlmacen(id: number): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('almacenes')
    const almacenes: Almacen[] = saved ? JSON.parse(saved) : []
    const filtered = almacenes.filter(a => a.id !== id)
    localStorage.setItem('almacenes', JSON.stringify(filtered))
    return { success: true, error: null }
  }

  const supabase = createClient()
  if (!supabase) return { success: false, error: 'Cliente no disponible' }

  try {
    const { error } = await supabase.from('almacenes').delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    return { success: true, error: null }
  } catch (err) {
    console.error('[Supabase] Error eliminando almacen:', err)
    return { success: false, error: 'Error de conexion' }
  }
}

// ==================== LOCALIZACIONES ====================

export async function getLocalizaciones(almacenId?: number): Promise<{ data: Localizacion[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('localizaciones')
    let localizaciones: Localizacion[] = saved ? JSON.parse(saved) : []
    if (almacenId) {
      localizaciones = localizaciones.filter(l => l.almacen_id === almacenId)
    }
    return { data: localizaciones, error: null }
  }

  const supabase = createClient()
  if (!supabase) return { data: [], error: 'Cliente no disponible' }

  try {
    let query = supabase.from('localizaciones').select('*').order('id', { ascending: true })
    
    if (almacenId) {
      query = query.eq('almacen_id', almacenId)
    }

    const { data, error } = await query
    if (error) return { data: [], error: error.message }

    // Merge del flag "Punto de venta" desde localizaciones_config (tabla nueva,
    // script 041). Si aun no existe, es_punto_venta queda false (sin romper).
    let posSet = new Set<number>()
    try {
      const { data: cfg } = await supabase
        .from('localizaciones_config')
        .select('localizacion_id, es_punto_venta')
      posSet = new Set(
        (cfg || []).filter((c) => c.es_punto_venta).map((c) => Number(c.localizacion_id))
      )
    } catch {
      /* tabla pendiente: sin puntos de venta marcados */
    }
    const merged = (data || []).map((l) => ({ ...l, es_punto_venta: posSet.has(Number(l.id)) }))
    return { data: merged, error: null }
  } catch (err) {
    console.error('[Supabase] Error obteniendo localizaciones:', err)
    return { data: [], error: 'Error de conexion' }
  }
}

/**
 * Marca (o desmarca) una localizacion como "Punto de venta". Solo puede haber
 * UN punto de venta por empresa: al marcar uno, se desmarcan los demas. La
 * localizacion marcada se preselecciona en Nueva Venta.
 */
export async function setPuntoVentaLocalizacion(
  localizacion_id: number,
  value: boolean
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) return { error: null }
  const supabase = createClient()
  if (!supabase) return { error: 'Cliente no disponible' }
  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { error: SESION_INVALIDA_ERROR }

  const ahora = new Date().toISOString()
  if (value) {
    // Punto de venta unico: apaga los demas de la empresa.
    await supabase
      .from('localizaciones_config')
      .update({ es_punto_venta: false, updated_at: ahora })
      .eq('razon_social_id', stamp.razon_social_id)
      .eq('es_punto_venta', true)
  }
  const { error } = await supabase
    .from('localizaciones_config')
    .upsert(
      {
        localizacion_id,
        razon_social_id: stamp.razon_social_id,
        es_punto_venta: value,
        usuario: stamp.usuario,
        updated_at: ahora,
      },
      { onConflict: 'localizacion_id' }
    )
  if (error) {
    // Mensaje claro si falta la migracion (tabla nueva sin aplicar).
    if (/does not exist|localizaciones_config|schema cache|PGRST205|relation .* does not exist/i.test(error.message)) {
      return {
        error: 'Falta activar la funcion: aplica scripts/041-localizaciones-punto-venta.sql en Supabase.',
      }
    }
    return { error: error.message }
  }
  return { error: null }
}

export async function saveLocalizacion(
  localizacion: Localizacion,
  isNew: boolean
): Promise<{ data: Localizacion | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('localizaciones')
    const localizaciones: Localizacion[] = saved ? JSON.parse(saved) : []
    
    if (isNew) {
      const newLocalizacion = { ...localizacion, id: Date.now() }
      localizaciones.push(newLocalizacion)
      localStorage.setItem('localizaciones', JSON.stringify(localizaciones))
      return { data: newLocalizacion, error: null }
    } else {
      const idx = localizaciones.findIndex(l => l.id === localizacion.id)
      if (idx >= 0) localizaciones[idx] = localizacion
      localStorage.setItem('localizaciones', JSON.stringify(localizaciones))
      return { data: localizacion, error: null }
    }
  }

  const supabase = createClient()
  if (!supabase) return { data: null, error: 'Cliente no disponible' }

  try {
    if (isNew) {
      const stamp = await getTenantStamp(supabase)
      if (!isValidStamp(stamp)) {
        console.log('[saveLocalizacion] Stamp invalido:', stamp)
        return { data: null, error: SESION_INVALIDA_ERROR }
      }

      const { id, ...locData } = localizacion
      const { data, error } = await supabase
        .from('localizaciones')
        .insert({ ...locData, ...stamp })
        .select()
        .single()

      if (error) return { data: null, error: error.message }
      return { data, error: null }
    } else {
      // Update: no tocamos razon_social_id ni usuario originales
      // (aislamiento e historial del creador).
      const { id, ...locData } = localizacion
      const { data, error } = await supabase
        .from('localizaciones')
        .update(locData)
        .eq('id', localizacion.id)
        .select()
        .single()

      if (error) return { data: null, error: error.message }
      return { data, error: null }
    }
  } catch (err) {
    console.error('[Supabase] Error guardando localizacion:', err)
    return { data: null, error: 'Error de conexion' }
  }
}

export async function deleteLocalizacion(id: number): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('localizaciones')
    const localizaciones: Localizacion[] = saved ? JSON.parse(saved) : []
    const filtered = localizaciones.filter(l => l.id !== id)
    localStorage.setItem('localizaciones', JSON.stringify(filtered))
    return { success: true, error: null }
  }

  const supabase = createClient()
  if (!supabase) return { success: false, error: 'Cliente no disponible' }

  try {
    const { error } = await supabase.from('localizaciones').delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    return { success: true, error: null }
  } catch (err) {
    console.error('[Supabase] Error eliminando localizacion:', err)
    return { success: false, error: 'Error de conexion' }
  }
}

// ==================== CLIENTES ====================

export async function getClientes(): Promise<{ data: Cliente[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('clientes')
    return { data: saved ? JSON.parse(saved) : [], error: null }
  }

  const supabase = createClient()
  if (!supabase) return { data: [], error: 'Cliente no disponible' }

  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('id', { ascending: true })

    if (error) return { data: [], error: error.message }
    return { data: data || [], error: null }
  } catch (err) {
    console.error('[Supabase] Error obteniendo clientes:', err)
    return { data: [], error: 'Error de conexion' }
  }
}

/**
 * Limpia el payload de cliente antes de mandarlo a la BD:
 * - Cadenas vacias en campos opcionales -> null (Postgres acepta NULL en
 *   `fecha_nacimiento DATE`, pero rechaza "" con error de sintaxis).
 * - Trim a strings simples para no guardar espacios accidentales.
 * Devuelve un objeto del mismo shape de Cliente (omitiendo `id`).
 */
function sanitizeClientePayload(
  raw: Omit<Cliente, "id">
): Omit<Cliente, "id"> {
  const blank = (v: unknown) =>
    typeof v === "string" && v.trim() === "" ? null : v
  return {
    ...raw,
    nombre: typeof raw.nombre === "string" ? raw.nombre.trim() : raw.nombre,
    rtn: blank(raw.rtn) as Cliente["rtn"],
    direccion: blank(raw.direccion) as Cliente["direccion"],
    telefono: blank(raw.telefono) as Cliente["telefono"],
    // Critico: si viene "" lo convertimos a null antes de tocar la
    // columna DATE. Mantenemos el valor original si ya es null/undefined.
    fecha_nacimiento: blank(raw.fecha_nacimiento) as Cliente["fecha_nacimiento"],
  }
}

export async function saveCliente(
  cliente: Cliente,
  isNew: boolean
): Promise<{ data: Cliente | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('clientes')
    const clientes: Cliente[] = saved ? JSON.parse(saved) : []
    
    if (isNew) {
      const newCliente = { ...cliente, id: Date.now() }
      clientes.push(newCliente)
      localStorage.setItem('clientes', JSON.stringify(clientes))
      return { data: newCliente, error: null }
    } else {
      const idx = clientes.findIndex(c => c.id === cliente.id)
      if (idx >= 0) clientes[idx] = cliente
      localStorage.setItem('clientes', JSON.stringify(clientes))
      return { data: cliente, error: null }
    }
  }

  const supabase = createClient()
  if (!supabase) return { data: null, error: 'Cliente no disponible' }

  try {
    if (isNew) {
      const stamp = await getTenantStamp(supabase)
      if (!isValidStamp(stamp)) {
        console.log('[saveCliente] Stamp invalido:', stamp)
        return { data: null, error: SESION_INVALIDA_ERROR }
      }

      const { id, ...rawData } = cliente
      // Sanitiza campos opcionales: cadenas vacias -> null. Es critico
      // para `fecha_nacimiento` (columna DATE) porque Postgres rechaza
      // "" con `invalid input syntax for type date`. Aplicamos el mismo
      // criterio a rtn/direccion/telefono para no guardar strings vacios.
      const clienteData = sanitizeClientePayload(rawData)
      let { data, error } = await supabase
        .from('clientes')
        .insert({ ...clienteData, ...stamp })
        .select()
        .single()

      // Fallback: si las columnas `telefono`/`fecha_nacimiento` aun no
      // existen (migracion 010 pendiente), reintentamos sin esos campos
      // para no bloquear la creacion del cliente. El stamp con
      // razon_social_id se mantiene intacto.
      if (error && /telefono|fecha_nacimiento/i.test(error.message || '')) {
        console.warn(
          '[saveCliente] Columnas telefono/fecha_nacimiento ausentes. ' +
          'Aplica scripts/010-add-cliente-telefono-fecha-nacimiento.sql.'
        )
        const { telefono: _t, fecha_nacimiento: _f, ...clienteSinCRM } =
          clienteData
        const retry = await supabase
          .from('clientes')
          .insert({ ...clienteSinCRM, ...stamp })
          .select()
          .single()
        data = retry.data
        error = retry.error
      }

      if (error) return { data: null, error: error.message }
      return { data, error: null }
    } else {
      // Update: no tocamos razon_social_id ni usuario originales
      // (aislamiento e historial del creador).
      const { id, ...rawData } = cliente
      const clienteData = sanitizeClientePayload(rawData)
      let { data, error } = await supabase
        .from('clientes')
        .update(clienteData)
        .eq('id', cliente.id)
        .select()
        .single()

      // Mismo fallback que en insert.
      if (error && /telefono|fecha_nacimiento/i.test(error.message || '')) {
        console.warn(
          '[saveCliente] Columnas telefono/fecha_nacimiento ausentes (update).'
        )
        const { telefono: _t, fecha_nacimiento: _f, ...clienteSinCRM } =
          clienteData
        const retry = await supabase
          .from('clientes')
          .update(clienteSinCRM)
          .eq('id', cliente.id)
          .select()
          .single()
        data = retry.data
        error = retry.error
      }

      if (error) return { data: null, error: error.message }
      return { data, error: null }
    }
  } catch (err) {
    console.error('[Supabase] Error guardando cliente:', err)
    return { data: null, error: 'Error de conexion' }
  }
}

export async function deleteCliente(id: number): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('clientes')
    const clientes: Cliente[] = saved ? JSON.parse(saved) : []
    const filtered = clientes.filter(c => c.id !== id)
    localStorage.setItem('clientes', JSON.stringify(filtered))
    return { success: true, error: null }
  }

  const supabase = createClient()
  if (!supabase) return { success: false, error: 'Cliente no disponible' }

  try {
    const { error } = await supabase.from('clientes').delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    return { success: true, error: null }
  } catch (err) {
    console.error('[Supabase] Error eliminando cliente:', err)
    return { success: false, error: 'Error de conexion' }
  }
}

// ==================== PROVEEDORES ====================

export async function getProveedores(): Promise<{ data: Proveedor[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('proveedores')
    return { data: saved ? JSON.parse(saved) : [], error: null }
  }

  const supabase = createClient()
  if (!supabase) return { data: [], error: 'Cliente no disponible' }

  try {
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .order('id', { ascending: true })

    if (error) return { data: [], error: error.message }
    return { data: data || [], error: null }
  } catch (err) {
    console.error('[Supabase] Error obteniendo proveedores:', err)
    return { data: [], error: 'Error de conexion' }
  }
}

export async function saveProveedor(
  proveedor: Proveedor,
  isNew: boolean
): Promise<{ data: Proveedor | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('proveedores')
    const proveedores: Proveedor[] = saved ? JSON.parse(saved) : []
    
    if (isNew) {
      const newProveedor = { ...proveedor, id: Date.now() }
      proveedores.push(newProveedor)
      localStorage.setItem('proveedores', JSON.stringify(proveedores))
      return { data: newProveedor, error: null }
    } else {
      const idx = proveedores.findIndex(p => p.id === proveedor.id)
      if (idx >= 0) proveedores[idx] = proveedor
      localStorage.setItem('proveedores', JSON.stringify(proveedores))
      return { data: proveedor, error: null }
    }
  }

  const supabase = createClient()
  if (!supabase) return { data: null, error: 'Cliente no disponible' }

  try {
    if (isNew) {
      const stamp = await getTenantStamp(supabase)
      if (!isValidStamp(stamp)) {
        console.log('[saveProveedor] Stamp invalido:', stamp)
        return { data: null, error: SESION_INVALIDA_ERROR }
      }

      const { id, ...proveedorData } = proveedor
      const { data, error } = await supabase
        .from('proveedores')
        .insert({ ...proveedorData, ...stamp })
        .select()
        .single()

      if (error) return { data: null, error: error.message }
      return { data, error: null }
    } else {
      // Update: no tocamos razon_social_id ni usuario originales
      // (aislamiento e historial del creador).
      const { id, ...proveedorData } = proveedor
      const { data, error } = await supabase
        .from('proveedores')
        .update(proveedorData)
        .eq('id', proveedor.id)
        .select()
        .single()

      if (error) return { data: null, error: error.message }
      return { data, error: null }
    }
  } catch (err) {
    console.error('[Supabase] Error guardando proveedor:', err)
    return { data: null, error: 'Error de conexion' }
  }
}

export async function deleteProveedor(id: number): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('proveedores')
    const proveedores: Proveedor[] = saved ? JSON.parse(saved) : []
    const filtered = proveedores.filter(p => p.id !== id)
    localStorage.setItem('proveedores', JSON.stringify(filtered))
    return { success: true, error: null }
  }

  const supabase = createClient()
  if (!supabase) return { success: false, error: 'Cliente no disponible' }

  try {
    const { error } = await supabase.from('proveedores').delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    return { success: true, error: null }
  } catch (err) {
    console.error('[Supabase] Error eliminando proveedor:', err)
    return { success: false, error: 'Error de conexion' }
  }
}
