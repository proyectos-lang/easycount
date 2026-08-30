/**
 * Logo estatico a imprimir arriba de las tirillas, por empresa (asset en
 * /public). Pedido puntual: la empresa 14 (Inversiones Mi Olanchito) lleva su
 * logo. Para sumar otra, agrega { id: "/archivo.png" } y coloca el PNG en
 * /public. Compartido por las tirillas de venta, devolucion y cierre.
 */
export const TIRILLA_LOGOS: Record<number, string> = {
  14: "/logoolanchito.png",
}

/**
 * URL ABSOLUTA del logo de tirilla de una empresa (o null). Absoluta porque la
 * tirilla se renderiza en un iframe blob (origen opaco) y una ruta relativa no
 * resolveria. Solo cliente (usa window.location.origin).
 */
export function tirillaLogoUrl(razonSocialId?: number | null): string | null {
  if (razonSocialId == null) return null
  const path = TIRILLA_LOGOS[razonSocialId]
  if (!path) return null
  if (typeof window === "undefined") return path
  return `${window.location.origin}${path}`
}
