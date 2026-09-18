import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

/**
 * Búsqueda de imágenes en la web via Google Custom Search API (searchType=image).
 * La API key y el motor (cx) viven SOLO en el servidor (env), nunca en el
 * navegador — mismo patrón que /api/procesar-factura con Gemini.
 *
 * Requiere las variables de entorno:
 *   GOOGLE_CSE_API_KEY  -> clave de API de Google Cloud (Custom Search API).
 *   GOOGLE_CSE_ID       -> ID del Programmable Search Engine (cx), con "Image
 *                          search" activado.
 * Si faltan, responde 503 con un mensaje claro (la UI degrada, no rompe).
 */

export const runtime = 'nodejs'

interface ResultadoImagen {
  url: string
  thumbnail: string
  titulo: string
  ancho: number
  alto: number
  contexto: string
}

export async function POST(req: NextRequest) {
  // Solo usuarios autenticados (evita quemar la cuota de forma anónima).
  const authClient = await createServerClient()
  if (!authClient) return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const apiKey = process.env.GOOGLE_CSE_API_KEY
  const cx = process.env.GOOGLE_CSE_ID
  if (!apiKey || !cx) {
    return NextResponse.json(
      { error: 'La búsqueda de imágenes no está configurada. Falta GOOGLE_CSE_API_KEY / GOOGLE_CSE_ID.' },
      { status: 503 },
    )
  }

  let q = ''
  try {
    const body = await req.json()
    q = String(body?.q || '').trim()
  } catch {
    return NextResponse.json({ error: 'Petición inválida' }, { status: 400 })
  }
  if (!q) return NextResponse.json({ error: 'Escribe qué buscar' }, { status: 400 })

  try {
    const params = new URLSearchParams({
      key: apiKey,
      cx,
      q,
      searchType: 'image',
      num: '10',
      safe: 'active',
    })
    const resp = await fetch(`https://www.googleapis.com/customsearch/v1?${params.toString()}`)
    if (!resp.ok) {
      const detalle = await resp.text().catch(() => '')
      // 429/403 suelen ser cuota agotada o clave/cx inválidos.
      const msg = resp.status === 429 || resp.status === 403
        ? 'Se agotó la cuota diaria de búsqueda o las credenciales no son válidas.'
        : 'No se pudo consultar la búsqueda de imágenes.'
      console.warn('[buscar-imagenes] Google CSE error', resp.status, detalle.slice(0, 200))
      return NextResponse.json({ error: msg }, { status: 502 })
    }
    const data = await resp.json()
    const items: ResultadoImagen[] = (data.items || []).map((it: Record<string, unknown>) => {
      const img = (it.image || {}) as Record<string, unknown>
      return {
        url: String(it.link || ''),
        thumbnail: String(img.thumbnailLink || it.link || ''),
        titulo: String(it.title || ''),
        ancho: Number(img.width || 0),
        alto: Number(img.height || 0),
        contexto: String(img.contextLink || ''),
      }
    }).filter((r: ResultadoImagen) => r.url)

    return NextResponse.json({ resultados: items })
  } catch (err) {
    console.error('[buscar-imagenes] excepción:', err)
    return NextResponse.json({ error: 'Error al buscar imágenes' }, { status: 500 })
  }
}
