import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { getTenantStamp, isValidStamp, SESION_INVALIDA_ERROR } from "@/lib/services/tenant-stamp"

// ==================== TIPOS ====================

export interface CatalogoLink {
  id: number
  token: string
  nombre: string | null
  tipo: "completo" | "seleccion"
  estado: "Activo" | "Usado" | "Vencido" | "Anulado"
  fecha_expiracion: string | null
  usuario: string | null
  created_at: string
  /** Cantidad de productos si es seleccion (0 = completo). */
  cantidad_productos?: number
}

export interface PedidoEncabezado {
  id: number
  link_id: number
  numero_pedido: string | null
  cliente_nombre: string
  cliente_telefono: string | null
  notas: string | null
  total: number
  estado: "Pendiente" | "Aprobado" | "Rechazado"
  motivo_rechazo: string | null
  venta_id: number | null
  usuario: string | null
  created_at: string
  /** Nombre de referencia del link que origino el pedido. */
  link_nombre?: string | null
}

export interface PedidoLinea {
  id: number
  pedido_id: number
  producto_id: number
  cantidad: number
  precio_unitario: number
  subtotal: number
  // joined (para la revision del admin)
  producto_nombre?: string
  producto_codigo?: string
  foto_url?: string | null
  stock_actual?: number
  costo_promedio_actual?: number
}

export const PEDIDOS_FEATURE_PENDING =
  "Función de pedidos pendiente: aplica scripts/021-pedidos-catalogo.sql"

function isMissingTable(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false
  const msg = (err.message || "").toLowerCase()
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    /relation .*(catalogo_links|pedidos_).* does not exist/.test(msg) ||
    msg.includes("could not find the table")
  )
}

function generarToken(): string {
  const uuid = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "")
      : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  return uuid() + uuid()
}

// ==================== LINKS ====================

export async function crearLink(input: {
  nombre?: string
  tipo: "completo" | "seleccion"
  producto_ids?: number[]
  dias_vigencia?: number | null
}): Promise<{ data: CatalogoLink | null; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: null, error: "Supabase no configurado" }
  const supabase = createClient()
  if (!supabase) return { data: null, error: "Cliente no disponible" }

  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { data: null, error: SESION_INVALIDA_ERROR }

  if (input.tipo === "seleccion" && (!input.producto_ids || input.producto_ids.length === 0)) {
    return { data: null, error: "Selecciona al menos un producto para el catálogo" }
  }

  const token = generarToken()
  const fechaExpiracion =
    input.dias_vigencia && input.dias_vigencia > 0
      ? new Date(Date.now() + input.dias_vigencia * 24 * 60 * 60 * 1000).toISOString()
      : null

  const { data: link, error } = await supabase
    .from("catalogo_links")
    .insert({
      token,
      nombre: input.nombre?.trim() || null,
      tipo: input.tipo,
      fecha_expiracion: fechaExpiracion,
      ...stamp,
    })
    .select("*")
    .single()

  if (error) {
    if (isMissingTable(error)) return { data: null, error: PEDIDOS_FEATURE_PENDING }
    return { data: null, error: error.message }
  }

  if (input.tipo === "seleccion" && input.producto_ids) {
    const { error: selErr } = await supabase.from("catalogo_link_productos").insert(
      input.producto_ids.map((pid) => ({
        link_id: link.id,
        producto_id: pid,
        ...stamp,
      }))
    )
    if (selErr) {
      await supabase.from("catalogo_links").delete().eq("id", link.id)
      return { data: null, error: selErr.message }
    }
  }

  return { data: link as CatalogoLink, error: null }
}

export async function getLinks(): Promise<{ data: CatalogoLink[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }
  const supabase = createClient()
  if (!supabase) return { data: [], error: "Cliente no disponible" }

  const { data, error } = await supabase
    .from("catalogo_links")
    .select("*, catalogo_link_productos (id)")
    .order("created_at", { ascending: false })
    .limit(300)

  if (error) {
    if (isMissingTable(error)) return { data: [], error: PEDIDOS_FEATURE_PENDING }
    return { data: [], error: error.message }
  }

  const ahora = new Date()
  const rows: CatalogoLink[] = (data || []).map((l) => {
    const sel = Array.isArray(l.catalogo_link_productos) ? l.catalogo_link_productos : []
    // Estado visual: un Activo con fecha vencida se muestra Vencido.
    const estado =
      l.estado === "Activo" && l.fecha_expiracion && new Date(l.fecha_expiracion) < ahora
        ? "Vencido"
        : l.estado
    return { ...(l as CatalogoLink), estado, cantidad_productos: sel.length }
  })
  return { data: rows, error: null }
}

export async function anularLink(id: number): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }
  const { error } = await supabase
    .from("catalogo_links")
    .update({ estado: "Anulado" })
    .eq("id", id)
    .eq("estado", "Activo")
  return { error: error?.message ?? null }
}

// ==================== PEDIDOS ====================

export async function getPedidos(): Promise<{ data: PedidoEncabezado[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }
  const supabase = createClient()
  if (!supabase) return { data: [], error: "Cliente no disponible" }

  const { data, error } = await supabase
    .from("pedidos_encabezado")
    .select("*, catalogo_links:link_id (nombre)")
    .order("created_at", { ascending: false })
    .limit(500)

  if (error) {
    if (isMissingTable(error)) return { data: [], error: PEDIDOS_FEATURE_PENDING }
    return { data: [], error: error.message }
  }

  const rows: PedidoEncabezado[] = (data || []).map((p) => {
    const link = Array.isArray(p.catalogo_links) ? p.catalogo_links[0] : p.catalogo_links
    return { ...(p as PedidoEncabezado), link_nombre: (link as { nombre?: string } | null)?.nombre ?? null }
  })
  return { data: rows, error: null }
}

/**
 * Detalle de un pedido para la revision del admin: lineas con nombre/foto
 * del producto y su stock/costo ACTUALES (para validar disponibilidad y
 * calcular utilidad al aprobar).
 */
export async function getPedidoConDetalle(
  pedidoId: number
): Promise<{ data: PedidoLinea[]; error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { data: [], error: "Cliente no disponible" }

  const { data, error } = await supabase
    .from("pedidos_detalle")
    .select("*, productos:producto_id (nombre, codigo_barras, foto_url, stock_total, costo_promedio)")
    .eq("pedido_id", pedidoId)
    .order("id", { ascending: true })

  if (error) return { data: [], error: error.message }

  const rows: PedidoLinea[] = (data || []).map((d) => {
    const prod = Array.isArray(d.productos) ? d.productos[0] : d.productos
    const p = prod as {
      nombre?: string
      codigo_barras?: string
      foto_url?: string | null
      stock_total?: number
      costo_promedio?: number
    } | null
    return {
      id: d.id,
      pedido_id: d.pedido_id,
      producto_id: d.producto_id,
      cantidad: Number(d.cantidad || 0),
      precio_unitario: Number(d.precio_unitario || 0),
      subtotal: Number(d.subtotal || 0),
      producto_nombre: p?.nombre || "",
      producto_codigo: p?.codigo_barras || "",
      foto_url: p?.foto_url ?? null,
      stock_actual: Number(p?.stock_total || 0),
      costo_promedio_actual: Number(p?.costo_promedio || 0),
    }
  })
  return { data: rows, error: null }
}

/** Actualiza cantidad/precio de una linea durante la revision (recalcula subtotal y total). */
export async function actualizarLineaPedido(
  linea: { id: number; pedido_id: number; cantidad: number; precio_unitario: number }
): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }

  if (linea.cantidad <= 0) return { error: "La cantidad debe ser mayor a 0" }
  if (linea.precio_unitario < 0) return { error: "El precio no puede ser negativo" }

  const subtotal = +(linea.cantidad * linea.precio_unitario).toFixed(2)
  const { error } = await supabase
    .from("pedidos_detalle")
    .update({ cantidad: linea.cantidad, precio_unitario: linea.precio_unitario, subtotal })
    .eq("id", linea.id)
  if (error) return { error: error.message }

  // Recalcular el total del encabezado desde las lineas.
  const { data: lineas } = await supabase
    .from("pedidos_detalle")
    .select("subtotal")
    .eq("pedido_id", linea.pedido_id)
  const total = +(lineas || []).reduce((a, l) => a + Number(l.subtotal || 0), 0).toFixed(2)
  await supabase.from("pedidos_encabezado").update({ total }).eq("id", linea.pedido_id)

  return { error: null }
}

export async function rechazarPedido(
  pedidoId: number,
  motivo: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }

  const stamp = await getTenantStamp(supabase)
  const { error } = await supabase
    .from("pedidos_encabezado")
    .update({ estado: "Rechazado", motivo_rechazo: motivo || null, usuario: stamp.usuario })
    .eq("id", pedidoId)
    .eq("estado", "Pendiente")
  return { error: error?.message ?? null }
}

/** Marca el pedido Aprobado y enlaza la venta generada (llamar TRAS crearVenta OK). */
export async function marcarPedidoAprobado(
  pedidoId: number,
  ventaId: number
): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }

  const stamp = await getTenantStamp(supabase)
  const { error } = await supabase
    .from("pedidos_encabezado")
    .update({ estado: "Aprobado", venta_id: ventaId, usuario: stamp.usuario })
    .eq("id", pedidoId)
    .eq("estado", "Pendiente")
  return { error: error?.message ?? null }
}
