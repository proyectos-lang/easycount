/**
 * Formato de moneda en Lempiras (Honduras). Fuente compartida para las
 * paginas nuevas — hoy este formato esta duplicado en casi cada pagina.
 *
 *   formatCurrency(1234.5) => "L 1,234.50"
 */
export function formatCurrency(value: number): string {
  return `L ${(value || 0).toLocaleString("es-HN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** Numero con separador de miles, sin simbolo de moneda. */
export function formatNumber(value: number): string {
  return (value || 0).toLocaleString("es-HN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}
