/**
 * Orden natural de tallas para mostrarlas como en una etiqueta: primero las de
 * letra en su orden de prenda (XXS … XXXL), luego las numéricas de menor a
 * mayor (6, 8, 10, 40, 42…), y al final cualquier otra en orden alfabético.
 * Puro: sirve para cualquier listado de hermanos de talla.
 */
const ORDEN_LETRAS = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "XXXL", "3XL", "4XL", "5XL"]

function claveTalla(talla: string | null | undefined): [number, number, string] {
  const t = String(talla ?? "").trim().toUpperCase()
  const i = ORDEN_LETRAS.indexOf(t)
  if (i >= 0) return [0, i, t]
  const n = Number(t.replace(",", "."))
  if (t !== "" && Number.isFinite(n)) return [1, n, t]
  return [2, 0, t]
}

export function compararTallas(a: string | null | undefined, b: string | null | undefined): number {
  const [ga, na, ta] = claveTalla(a)
  const [gb, nb, tb] = claveTalla(b)
  return ga - gb || na - nb || ta.localeCompare(tb, "es")
}
