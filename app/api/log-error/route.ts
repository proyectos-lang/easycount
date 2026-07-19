import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

/**
 * Recibe reportes de errores del navegador y los guarda en `errores_log`
 * (service role; la tabla tiene RLS sin policies = solo accesible aqui).
 * Best-effort: nunca falla ruidosamente para no generar bucles de error.
 */
export async function POST(request: Request) {
  let body: {
    mensaje?: string
    stack?: string
    url?: string
    origen?: string
    usuario?: string
    razon_social_id?: number | null
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const mensaje = (body.mensaje || "").toString().slice(0, 1000)
  if (!mensaje) return NextResponse.json({ ok: false }, { status: 400 })

  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ ok: false }, { status: 500 })

  await supabase.from("errores_log").insert({
    mensaje,
    stack: (body.stack || "").toString().slice(0, 4000) || null,
    url: (body.url || "").toString().slice(0, 500) || null,
    user_agent: (request.headers.get("user-agent") || "").slice(0, 300) || null,
    origen: (body.origen || "desconocido").toString().slice(0, 50),
    usuario: (body.usuario || "").toString().slice(0, 120) || null,
    razon_social_id: typeof body.razon_social_id === "number" ? body.razon_social_id : null,
  })
  // Si el insert falla (tabla ausente), respondemos ok igual: es best-effort.

  return NextResponse.json({ ok: true })
}
