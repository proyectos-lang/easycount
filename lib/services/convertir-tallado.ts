/**
 * Convertir un producto normal en un producto TALLADO, repartiendo su stock
 * actual entre las tallas.
 *
 * Mecánica (trazable, sin tocar `stock_total` a mano):
 *   1) SALIDA del stock del original en su localización -> queda en 0.
 *   2) El original recibe SU PROPIA talla (ej. "S") vía saveProducto (update).
 *   3) Las demás tallas se crean como productos nuevos (código base + "-" + talla,
 *      mismo costo/precio que el original) y reciben su cantidad por INGRESO en
 *      la MISMA localización.
 *   4) Se agrupa el original + las tallas nuevas con crearGrupoConProductos.
 *
 * Reglas:
 *   - La suma de cantidades por talla debe coincidir EXACTO con el stock actual
 *     (reparto puro; no crea ni pierde inventario).
 *   - Si el stock está en MÁS de una localización, se bloquea (hay que
 *     consolidar primero).
 */

import { saveProducto, type Producto } from "@/lib/services/catalogos"
import {
  getStockPorLocalizaciones,
  procesarIngresoManual,
} from "@/lib/services/inventario"
import { crearGrupoConProductos } from "@/lib/services/grupos-tallas"

export interface LineaTallaReparto {
  talla: string
  cantidad: number
}

export interface ConvertirTalladoResult {
  success: boolean
  error: string | null
  /** IDs de los productos que quedaron en el grupo (original + tallas nuevas). */
  idsGrupo: number[]
}

/**
 * Info de stock del original para que la UI decida (una localización -> repartir
 * directo; varias -> bloquear).
 */
export async function getRepartoInfo(productoId: number): Promise<{
  stockTotal: number
  localizaciones: { almacen_id: number | null; localizacion_id: number | null; stock: number }[]
  error: string | null
}> {
  const { data, error } = await getStockPorLocalizaciones(productoId)
  if (error) return { stockTotal: 0, localizaciones: [], error }
  const stockTotal = data.reduce((a, l) => a + l.stock, 0)
  return { stockTotal, localizaciones: data, error: null }
}

/**
 * Convierte `original` en tallado repartiendo su stock entre `lineas`.
 * `tallaOriginal` es la talla que se le asigna al propio producto original
 * (debe estar incluida en `lineas`).
 */
export async function convertirProductoATallado(input: {
  original: Producto
  tallaOriginal: string
  lineas: LineaTallaReparto[]
}): Promise<ConvertirTalladoResult> {
  const { original, tallaOriginal, lineas } = input
  const err = (m: string): ConvertirTalladoResult => ({ success: false, error: m, idsGrupo: [] })

  if (original.id == null) return err("Producto inválido")

  // Normaliza y valida líneas.
  const limpias = lineas
    .map((l) => ({ talla: l.talla.trim(), cantidad: Math.max(0, Math.floor(Number(l.cantidad) || 0)) }))
    .filter((l) => l.talla !== "")
  if (limpias.length < 2) return err("Agrega al menos dos tallas para convertir el producto.")

  // Tallas únicas.
  const setTallas = new Set(limpias.map((l) => l.talla.toLowerCase()))
  if (setTallas.size !== limpias.length) return err("Hay tallas repetidas; cada talla debe ser única.")

  const tallaOrig = tallaOriginal.trim()
  if (!tallaOrig) return err("Indica la talla del producto original.")
  if (!limpias.some((l) => l.talla.toLowerCase() === tallaOrig.toLowerCase())) {
    return err("La talla del producto original debe estar en la lista de tallas.")
  }

  // Stock actual y su localización.
  const { stockTotal, localizaciones, error: infoErr } = await getRepartoInfo(original.id)
  if (infoErr) return err(infoErr)

  const totalReparto = limpias.reduce((a, l) => a + l.cantidad, 0)
  if (totalReparto !== stockTotal) {
    return err(`La suma de las tallas (${totalReparto}) debe ser igual al stock actual (${stockTotal}).`)
  }

  // Ubicación del reparto (si hay stock, debe estar en UNA sola localización).
  let almacenId: number | null = null
  let localizacionId: number | null = null
  if (stockTotal > 0) {
    if (localizaciones.length !== 1) {
      return err(
        "El stock de este producto está repartido en varias localizaciones. Consolídalo en una sola (con un traslado) antes de convertirlo en tallado.",
      )
    }
    almacenId = localizaciones[0].almacen_id
    localizacionId = localizaciones[0].localizacion_id
    if (almacenId == null || localizacionId == null) {
      return err("No se pudo determinar la localización del stock actual.")
    }
  }

  const costo = Number(original.costo_promedio || 0)
  const codigoBase = (original.codigo_barras || "").trim()

  // ── 1) SALIDA del stock del original (si tiene) -> queda en 0 ──────────────
  if (stockTotal > 0 && almacenId != null && localizacionId != null) {
    const salida = await procesarIngresoManual({
      tipo: "salida",
      producto_id: original.id,
      almacen_id: almacenId,
      localizacion_id: localizacionId,
      cantidad: stockTotal,
      costo_unitario: costo,
      observaciones: "Conversión a producto tallado (reparto de stock)",
      stock_anterior: stockTotal,
      costo_anterior: costo,
      nuevo_stock: 0,
      nuevo_costo: costo,
    })
    if (salida.error) return err(`No se pudo dar salida al stock original: ${salida.error}`)
  }

  // ── 2) El original recibe su propia talla ──────────────────────────────────
  const cantOriginal = limpias.find((l) => l.talla.toLowerCase() === tallaOrig.toLowerCase())!.cantidad
  const updOriginal = await saveProducto({ ...original, talla: tallaOrig }, false)
  if (updOriginal.error) return err(`No se pudo asignar la talla al producto original: ${updOriginal.error}`)

  const idsGrupo: number[] = [original.id]

  // Re-ingresa al original su cantidad de talla (en la misma localización).
  if (cantOriginal > 0 && almacenId != null && localizacionId != null) {
    const ing = await procesarIngresoManual({
      tipo: "ingreso",
      producto_id: original.id,
      almacen_id: almacenId,
      localizacion_id: localizacionId,
      cantidad: cantOriginal,
      costo_unitario: costo,
      observaciones: `Conversión a tallado · talla ${tallaOrig}`,
      stock_anterior: 0,
      costo_anterior: costo,
      nuevo_stock: cantOriginal,
      nuevo_costo: costo,
    })
    if (ing.error) return err(`No se pudo reingresar la talla del original: ${ing.error}`)
  }

  // ── 3) Crear las demás tallas y darles su cantidad ─────────────────────────
  const errores: string[] = []
  for (const l of limpias) {
    if (l.talla.toLowerCase() === tallaOrig.toLowerCase()) continue // ya es el original
    const nuevo: Producto = {
      nombre: original.nombre,
      codigo_barras: codigoBase ? `${codigoBase}-${l.talla}` : `${original.nombre}-${l.talla}`,
      precio_venta_sugerido: Number(original.precio_venta_sugerido || 0),
      costo_promedio: costo,
      foto_url: original.foto_url || "",
      marca_id: original.marca_id ?? null,
      categoria_id: original.categoria_id ?? null,
      subcategoria_id: original.categoria_id ? (original.subcategoria_id ?? null) : null,
      talla: l.talla,
    }
    const creado = await saveProducto(nuevo, true)
    if (creado.error || !creado.data?.id) {
      errores.push(`Talla ${l.talla}: ${creado.error || "no se pudo crear"}`)
      continue
    }
    idsGrupo.push(creado.data.id)

    if (l.cantidad > 0 && almacenId != null && localizacionId != null) {
      const ing = await procesarIngresoManual({
        tipo: "ingreso",
        producto_id: creado.data.id,
        almacen_id: almacenId,
        localizacion_id: localizacionId,
        cantidad: l.cantidad,
        costo_unitario: costo,
        observaciones: `Conversión a tallado · talla ${l.talla}`,
        stock_anterior: 0,
        costo_anterior: costo,
        nuevo_stock: l.cantidad,
        nuevo_costo: costo,
      })
      if (ing.error) errores.push(`Ingreso talla ${l.talla}: ${ing.error}`)
    }
  }

  // ── 4) Agrupar original + tallas nuevas ────────────────────────────────────
  if (idsGrupo.length > 1) {
    const g = await crearGrupoConProductos(original.nombre, idsGrupo)
    if (g.error) errores.push(`Agrupado: ${g.error}`)
  }

  if (errores.length > 0) {
    return { success: true, error: `Convertido con avisos: ${errores.join(" · ")}`, idsGrupo }
  }
  return { success: true, error: null, idsGrupo }
}
