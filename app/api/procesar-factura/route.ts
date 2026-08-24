import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const runtime = "nodejs"
export const maxDuration = 60

/**
 * Procesa una factura con Gemini en el servidor para no exponer la API key
 * al navegador. Recibe { tipo, base64, mimeType } y devuelve { data } con el
 * JSON extraido segun el tipo:
 *   - "compra": lineas de productos [{ nombre_extraido, cantidad, costo_unitario_original }]
 *   - "gasto":  { fecha, monto_total, items }
 */

const PROMPT_COMPRA = `Eres un experto en contabilidad y procesamiento de facturas. Analiza esta imagen de factura de proveedor y extrae TODOS los productos/items listados.

INSTRUCCIONES ESTRICTAS:
1. Tu respuesta debe ser UNICAMENTE un JSON valido
2. NO incluyas markdown, comillas triples, ni texto adicional
3. NO expliques nada, solo devuelve el JSON puro

FORMATO DE RESPUESTA REQUERIDO:
[
  {"nombre_extraido": "nombre exacto del producto como aparece", "cantidad": numero, "costo_unitario_original": numero}
]

REGLAS DE EXTRACCION:
- nombre_extraido: El nombre del producto TAL COMO aparece en la factura
- cantidad: Numero de unidades, puede ser decimal (si no es claro, usa 1)
- costo_unitario_original: Precio unitario como numero decimal (sin simbolos de moneda)
- Si hay codigos de producto, incluyelos en el nombre
- Si no puedes leer un valor numerico claramente, usa 0
- Extrae TODOS los items de la factura, no omitas ninguno`

const PROMPT_GASTO = `Eres un experto en contabilidad. Analiza esta imagen de factura o recibo de gasto y extrae la informacion.

INSTRUCCIONES ESTRICTAS:
1. Tu respuesta debe ser UNICAMENTE un JSON valido
2. NO incluyas markdown, comillas triples, ni texto adicional
3. NO expliques nada, solo devuelve el JSON puro

FORMATO DE RESPUESTA REQUERIDO:
{"fecha": "YYYY-MM-DD", "monto_total": number, "items": ["item1", "item2", ...]}

REGLAS DE EXTRACCION:
- fecha: Fecha del documento en formato YYYY-MM-DD. Si no es clara, usa la fecha de hoy.
- monto_total: El total a pagar como numero decimal (sin simbolos de moneda)
- items: Lista de todos los productos o servicios listados en la factura como strings
- Si no puedes leer un valor, haz tu mejor estimacion`

const MIME_PERMITIDOS = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"])

export async function POST(request: Request) {
  let body: { tipo?: string; base64?: string; mimeType?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Body JSON invalido" }, { status: 400 })
  }

  const { tipo, base64, mimeType } = body
  if (tipo !== "compra" && tipo !== "gasto") {
    return NextResponse.json({ error: "tipo debe ser 'compra' o 'gasto'" }, { status: 400 })
  }
  if (!base64 || !mimeType) {
    return NextResponse.json({ error: "Faltan base64 o mimeType" }, { status: 400 })
  }
  if (!MIME_PERMITIDOS.has(mimeType)) {
    return NextResponse.json({ error: "Solo se aceptan imagenes JPG, PNG, WEBP o PDF" }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY no configurada en el servidor" },
      { status: 500 }
    )
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })

    const result = await model.generateContent([
      tipo === "compra" ? PROMPT_COMPRA : PROMPT_GASTO,
      { inlineData: { mimeType, data: base64 } },
    ])

    let text = result.response.text().trim()
    // Limpia bloques de codigo markdown si el modelo los agrega
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()

    const data = JSON.parse(text)
    return NextResponse.json({ data })
  } catch (err) {
    console.error("[procesar-factura] Error:", err)
    return NextResponse.json(
      { error: "No se pudo procesar la factura. Verifique la imagen e intente de nuevo." },
      { status: 502 }
    )
  }
}
