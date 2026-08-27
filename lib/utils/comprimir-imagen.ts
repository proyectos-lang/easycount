/**
 * Compresion de imagenes en el NAVEGADOR (canvas), sin dependencias.
 *
 * Reduce la resolucion (lado maximo) y recodifica a JPEG con calidad ajustable.
 * Las fotos de celular suelen venir en varios MB / 4000px; para el catalogo
 * basta ~1280px, lo que baja el peso a cientos de KB y acelera la carga.
 *
 * Se usa tanto al SUBIR una foto nueva como en el backfill de fotos ya subidas.
 * Si algo falla (formato raro, canvas tainted por CORS), devuelve el archivo
 * original para no bloquear el flujo.
 */

export interface OpcionesCompresion {
  /** Lado maximo (px) del lado mas largo. Default 1280. */
  maxLado?: number
  /** Calidad JPEG 0..1. Default 0.8. */
  calidad?: number
  /**
   * Si la imagen ya es <= este tamano (bytes) Y no necesita reescalado, se
   * devuelve tal cual (no se recodifica). Default 300 KB.
   */
  omitirSiMenorA?: number
}

/** Resultado de comprimir: el archivo (comprimido u original) + metadatos. */
export interface ResultadoCompresion {
  file: File
  comprimida: boolean
  bytesAntes: number
  bytesDespues: number
}

export async function comprimirImagen(
  file: File,
  opciones: OpcionesCompresion = {}
): Promise<ResultadoCompresion> {
  const maxLado = opciones.maxLado ?? 1280
  const calidad = opciones.calidad ?? 0.8
  const omitirSiMenorA = opciones.omitirSiMenorA ?? 300 * 1024

  const original: ResultadoCompresion = {
    file,
    comprimida: false,
    bytesAntes: file.size,
    bytesDespues: file.size,
  }

  // Solo imagenes raster. Los GIF (posible animacion) y SVG se dejan intactos.
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return original
  }

  try {
    const bitmap = await createImageBitmap(file)
    const { width, height } = bitmap
    const escala = Math.min(1, maxLado / Math.max(width, height))

    // No necesita reescalar y ya es liviana -> se deja como esta.
    if (escala === 1 && file.size <= omitirSiMenorA) {
      bitmap.close?.()
      return original
    }

    const w = Math.max(1, Math.round(width * escala))
    const h = Math.max(1, Math.round(height * escala))

    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      bitmap.close?.()
      return original
    }
    // Fondo blanco: al pasar PNG con transparencia a JPEG, evita el negro.
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close?.()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", calidad)
    )
    if (!blob) return original

    // Si "comprimir" no ayudo (imagen ya optima), conservamos el original.
    if (blob.size >= file.size) return original

    const nombre = file.name.replace(/\.[^.]+$/, "") + ".jpg"
    const comprimido = new File([blob], nombre, { type: "image/jpeg" })
    return {
      file: comprimido,
      comprimida: true,
      bytesAntes: file.size,
      bytesDespues: comprimido.size,
    }
  } catch {
    return original
  }
}
