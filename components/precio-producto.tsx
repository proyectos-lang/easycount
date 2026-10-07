import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/format"

/**
 * Precio de venta en pequeño y entre paréntesis, para mostrarlo junto al
 * nombre en los buscadores / selectores de productos: "Camisa polo (L 450.00)".
 * No muestra nada si el producto no tiene precio.
 */
export function PrecioProducto({ precio, className }: { precio?: number | null; className?: string }) {
  if (precio == null || !(Number(precio) > 0)) return null
  return (
    <span className={cn("ml-1 whitespace-nowrap text-[11px] font-normal tabular-nums text-muted-foreground", className)}>
      ({formatCurrency(Number(precio))})
    </span>
  )
}
