/**
 * Edición de una línea de Recepción por Factura: cantidad, costo unitario y
 * TOTAL de la línea quedan siempre consistentes. PURO (tests en
 * tests/recepcion-linea.test.ts).
 *
 *   · Si se escribe el TOTAL → costo unitario = total ÷ cantidad, y el total
 *     queda "fijado" (lo que dice la factura).
 *   · Si luego cambia la cantidad y hay total fijado → se respeta el total y
 *     se recalcula el costo unitario.
 *   · Si se escribe el COSTO UNITARIO → se suelta el total fijado (pasa a ser
 *     cantidad × costo).
 */

export interface LineaEditable {
  cantidad: number
  costoOriginal: number
  /** Total de la línea escrito por el usuario (null/undefined = se calcula). */
  totalLinea?: number | null
}

export type CampoLinea = "cantidad" | "costoOriginal" | "totalLinea"

/** Costo unitario con 4 decimales (evita arrastrar 33.333333… a la base). */
const r4 = (n: number) => Math.round(n * 10000) / 10000
const r2 = (n: number) => Math.round(n * 100) / 100

export function aplicarCambioLinea<T extends LineaEditable>(linea: T, campo: CampoLinea, valor: number): T {
  const v = Number.isFinite(valor) && valor >= 0 ? valor : 0
  if (campo === "totalLinea") {
    return { ...linea, totalLinea: v, costoOriginal: linea.cantidad > 0 ? r4(v / linea.cantidad) : linea.costoOriginal }
  }
  if (campo === "cantidad") {
    const fijado = linea.totalLinea != null
    return { ...linea, cantidad: v, costoOriginal: fijado && v > 0 ? r4((linea.totalLinea as number) / v) : linea.costoOriginal }
  }
  return { ...linea, costoOriginal: v, totalLinea: null }
}

/** Total que se muestra en la línea: el fijado por el usuario o cantidad × costo. */
export function totalDeLinea(linea: LineaEditable): number {
  return linea.totalLinea != null ? linea.totalLinea : r2(linea.cantidad * linea.costoOriginal)
}
