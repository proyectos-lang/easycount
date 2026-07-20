"use client"

import { Calculator, Info } from "lucide-react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/format"
import type { ProrrateoResultado } from "@/lib/services/compras"

/**
 * Muestra EXPLICITAMENTE el calculo del prorrateo de costos adicionales
 * (importacion, impuestos, otros) sobre cada linea de la recepcion, para
 * que el usuario entienda al 100% como se forma el costo final del producto.
 */
export function DesgloseProrrateo({ resultado }: { resultado: ProrrateoResultado }) {
  const esUSD = resultado.moneda === "USD"
  const hayCostos = resultado.costosAdicionales > 0
  // Pequeña diferencia por redondeo entre lo asignado y los costos totales.
  const descuadre = Math.abs(resultado.totalCostosAsignados - resultado.costosAdicionales)

  return (
    <Card className="border-sky-200/70 bg-sky-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-sky-900">
          <Calculator className="h-4 w-4" /> Cómo se calcula el costo (prorrateo)
        </CardTitle>
        <CardDescription className="text-xs">
          {hayCostos ? (
            <>
              Los costos adicionales ({formatCurrency(resultado.costosAdicionales)}) se reparten entre
              los productos <strong>en proporción a su valor</strong>. Cada línea recibe:
              <code className="mx-1 rounded bg-white/70 px-1 py-0.5 text-[11px]">
                costo adicional × (valor de la línea ÷ valor total)
              </code>
            </>
          ) : (
            <>Sin costos adicionales: el costo final es el costo de compra{esUSD ? " convertido a Lempiras" : ""}.</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-center">Cant.</TableHead>
                {esUSD && <TableHead className="text-right">Costo unit. (USD)</TableHead>}
                <TableHead className="text-right">Valor{esUSD ? " (L)" : ""}</TableHead>
                <TableHead className="text-right">% del total</TableHead>
                <TableHead className="text-right">Costos asignados (L)</TableHead>
                <TableHead className="text-right">Costo total (L)</TableHead>
                <TableHead className="text-right font-semibold">Costo final unit. (L)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultado.lineas.map((l) => (
                <TableRow key={l.detalle_id || l.producto_id}>
                  <TableCell className="max-w-[180px] truncate text-sm">
                    {l.producto_nombre || `Producto #${l.producto_id}`}
                  </TableCell>
                  <TableCell className="text-center">{l.cantidad}</TableCell>
                  {esUSD && (
                    <TableCell className="text-right font-mono text-xs">
                      ${l.costo_unitario_origen.toFixed(2)}
                    </TableCell>
                  )}
                  <TableCell className="text-right font-mono">{formatCurrency(l.valor_local)}</TableCell>
                  <TableCell className="text-right font-mono text-xs text-stone-500">
                    {(l.proporcion * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right font-mono text-sky-700">
                    + {formatCurrency(l.costos_asignados)}
                  </TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(l.costo_total_linea)}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-emerald-700">
                    {formatCurrency(l.costo_final_unitario)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-medium">Totales</TableCell>
                <TableCell />
                {esUSD && <TableCell />}
                <TableCell className="text-right font-mono font-medium">{formatCurrency(resultado.subtotalLocal)}</TableCell>
                <TableCell className="text-right text-xs text-stone-500">100%</TableCell>
                <TableCell className="text-right font-mono font-medium text-sky-700">
                  {formatCurrency(resultado.totalCostosAsignados)}
                </TableCell>
                <TableCell className="text-right font-mono font-medium">{formatCurrency(resultado.totalFinal)}</TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        {/* Verificación de cuadre */}
        <div className="mt-3 flex items-start gap-1.5 text-xs text-stone-500">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>
            Valor de la mercancía {formatCurrency(resultado.subtotalLocal)} + costos adicionales{" "}
            {formatCurrency(resultado.costosAdicionales)} ={" "}
            <strong>{formatCurrency(resultado.totalFinal)}</strong> de inventario recibido.
            {descuadre > 0.05 && (
              <span className="text-amber-600"> (Ajuste por redondeo: {formatCurrency(descuadre)}.)</span>
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
