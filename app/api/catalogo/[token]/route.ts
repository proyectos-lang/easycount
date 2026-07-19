import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

/**
 * Catalogo publico por token. SIN autenticacion: el token ES la autorizacion.
 * Usa service role (bypassa RLS) y filtra SIEMPRE por el razon_social_id del
 * link. Solo expone campos seguros del producto (nunca costo_promedio).
 *
 * Respuestas: 200 catalogo | 404 token inexistente | 410 link muerto | 500 config.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  if (!token || token.length < 16) {
    return NextResponse.json({ error: "Link inválido" }, { status: 404 })
  }

  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: "Servidor no configurado" }, { status: 500 })
  }

  // 1) Resolver el link por token.
  const { data: link, error: linkErr } = await supabase
    .from("catalogo_links")
    .select("id, razon_social_id, tipo, estado, fecha_expiracion, nombre")
    .eq("token", token)
    .maybeSingle()

  if (linkErr) {
    // Tabla ausente = script 021 sin aplicar: degradar con mensaje claro.
    if (linkErr.code === "42P01" || linkErr.code === "PGRST205") {
      return NextResponse.json(
        { error: "El catálogo en línea no está habilitado todavía" },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: "Error consultando el link" }, { status: 500 })
  }
  if (!link) {
    return NextResponse.json({ error: "Este link no existe" }, { status: 404 })
  }

  // 2) Estado del link.
  if (link.estado !== "Activo") {
    return NextResponse.json(
      { error: "Este link ya fue utilizado o está vencido" },
      { status: 410 }
    )
  }
  if (link.fecha_expiracion && new Date(link.fecha_expiracion) < new Date()) {
    // Marca el vencimiento para que quede consistente en la bandeja del admin.
    await supabase.from("catalogo_links").update({ estado: "Vencido" }).eq("id", link.id)
    return NextResponse.json({ error: "Este link está vencido" }, { status: 410 })
  }

  // 3) Datos de la empresa (para el header del catalogo).
  const { data: empresa } = await supabase
    .from("razon_social")
    .select("nombre_empresa, nombre_comercial, logo_url, telefono")
    .eq("id", link.razon_social_id)
    .maybeSingle()

  // 4) Productos: todos los del tenant (completo) o los del link (seleccion).
  let productoIds: number[] | null = null
  if (link.tipo === "seleccion") {
    const { data: sel, error: selErr } = await supabase
      .from("catalogo_link_productos")
      .select("producto_id")
      .eq("link_id", link.id)
    if (selErr) {
      return NextResponse.json({ error: "Error consultando el catálogo" }, { status: 500 })
    }
    productoIds = (sel || []).map((s) => s.producto_id)
    if (productoIds.length === 0) {
      return NextResponse.json({ error: "Este catálogo no tiene productos" }, { status: 410 })
    }
  }

  let query = supabase
    .from("productos")
    // SOLO campos seguros: nunca costo_promedio.
    .select("id, nombre, foto_url, precio_venta_sugerido, stock_total")
    .eq("razon_social_id", link.razon_social_id)
    .order("nombre", { ascending: true })
  if (productoIds) query = query.in("id", productoIds)

  const { data: productos, error: prodErr } = await query
  if (prodErr) {
    return NextResponse.json({ error: "Error consultando productos" }, { status: 500 })
  }

  return NextResponse.json({
    empresa: {
      nombre: empresa?.nombre_comercial || empresa?.nombre_empresa || "Catálogo",
      logo_url: empresa?.logo_url || null,
      telefono: empresa?.telefono || null,
    },
    link: { nombre: link.nombre, tipo: link.tipo },
    productos: (productos || []).map((p) => ({
      id: p.id,
      nombre: p.nombre,
      foto_url: p.foto_url || null,
      precio: Number(p.precio_venta_sugerido || 0),
      disponible: Number(p.stock_total || 0) > 0,
      // Tope para el stepper del carrito (la UI no muestra la cantidad).
      max: Math.max(0, Number(p.stock_total || 0)),
    })),
  })
}
