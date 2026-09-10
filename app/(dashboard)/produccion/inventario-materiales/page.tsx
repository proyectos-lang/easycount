"use client"

import * as React from "react"
import { Warehouse, Search, Download, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, formatNumber } from "@/lib/utils/format"
import { exportToXlsx } from "@/lib/utils/export"
import {
  getValoracionMateriales, getKardexMaterial,
  type ValoracionMaterial, type MovimientoMaterial,
} from "@/lib/services/produccion-materiales"

export default function InventarioMaterialesPage() {
  const { toast } = useToast()
  const [items, setItems] = React.useState<ValoracionMaterial[]>([])
  const [loading, setLoading] = React.useState(true)
  const [busqueda, setBusqueda] = React.useState("")

  // Kardex de un material.
  const [kardexOpen, setKardexOpen] = React.useState(false)
  const [kardexNombre, setKardexNombre] = React.useState("")
  const [kardex, setKardex] = React.useState<MovimientoMaterial[]>([])
  const [cargandoKardex, setCargandoKardex] = React.useState(false)

  React.useEffect(() => {
    getValoracionMateriales().then(({ data }) => { setItems(data); setLoading(false) })
  }, [])

  const filtrados = React.useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return items
    return items.filter((m) => m.nombre.toLowerCase().includes(q) || (m.codigo || "").toLowerCase().includes(q))
  }, [items, busqueda])

  const totales = React.useMemo(() => ({
    valor: filtrados.reduce((a, m) => a + m.valor_total, 0),
    unidades: filtrados.reduce((a, m) => a + m.stock_total, 0),
  }), [filtrados])

  async function verKardex(m: ValoracionMaterial) {
    setKardexNombre(m.nombre)
    setKardexOpen(true)
    setCargandoKardex(true)
    const { data } = await getKardexMaterial(m.id)
    setKardex(data)
    setCargandoKardex(false)
  }

  function exportar() {
    if (filtrados.length === 0) {
      toast({ title: "Sin datos", description: "No hay materiales para exportar", variant: "destructive" })
      return
    }
    const rows = filtrados.map((m) => ({
      Material: m.nombre,
      Codigo: m.codigo || "",
      Unidad: m.unidad_medida,
      Stock: m.stock_total,
      "Costo Prom.": m.costo_promedio,
      "Valor Total": m.valor_total,
    }))
    exportToXlsx(rows, { sheetName: "Materiales", filename: "Valoracion_Materiales", colWidths: [28, 14, 10, 12, 12, 14] })
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <Warehouse className="h-6 w-6 text-stone-600" /> Inventario de Materiales
          </h1>
          <p className="text-sm text-muted-foreground">Valoración de materia prima y su kardex de movimientos.</p>
        </div>
        <Button onClick={exportar} size="sm" variant="outline" className="w-full sm:w-auto gap-1.5">
          <Download className="h-4 w-4" /> Exportar
        </Button>
      </div>

      <Card className="rounded-xl border-stone-200">
        <CardHeader className="p-4 md:p-6 pb-3">
          <CardTitle className="text-base md:text-lg">Valoración</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {filtrados.length} material(es) · Valor total {formatCurrency(totales.valor)}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input className="pl-9" placeholder="Buscar material…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          {loading ? (
            <div className="flex justify-center py-10"><Spinner className="h-6 w-6" /></div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-10 text-stone-500 text-sm">
              <Warehouse className="h-10 w-10 mx-auto mb-2 opacity-40" />
              Sin materiales. Créalos y cómpralos para ver su inventario aquí.
            </div>
          ) : (
            <div className="rounded-lg border border-stone-200 overflow-x-auto">
              <Table containerClassName="max-h-[60vh] overflow-y-auto">
                <TableHeader sticky>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Costo prom.</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrados.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.nombre}</TableCell>
                      <TableCell className="font-mono text-xs text-stone-500">{m.codigo || "-"}</TableCell>
                      <TableCell className="text-sm">{m.unidad_medida}</TableCell>
                      <TableCell className="text-right font-medium">{formatNumber(m.stock_total)}</TableCell>
                      <TableCell className="text-right text-stone-600">{formatCurrency(m.costo_promedio)}</TableCell>
                      <TableCell className="text-right text-emerald-700 font-medium">{formatCurrency(m.valor_total)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver kardex" onClick={() => verKardex(m)}>
                          <History className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={5} className="font-medium">Total</TableCell>
                    <TableCell className="text-right font-bold text-emerald-700">{formatCurrency(totales.valor)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kardex del material */}
      <Dialog open={kardexOpen} onOpenChange={setKardexOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kardex · {kardexNombre}</DialogTitle>
          </DialogHeader>
          {cargandoKardex ? (
            <div className="flex justify-center py-10"><Spinner className="h-6 w-6" /></div>
          ) : kardex.length === 0 ? (
            <p className="text-center py-8 text-sm text-stone-500">Sin movimientos.</p>
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Movimiento</TableHead>
                    <TableHead>Localización</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Costo unit.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kardex.map((mv) => (
                    <TableRow key={mv.id}>
                      <TableCell className="text-xs">{mv.fecha ? mv.fecha.split("T")[0] : "-"}</TableCell>
                      <TableCell className="text-sm">{mv.tipo_movimiento}</TableCell>
                      <TableCell className="text-xs text-stone-500">{mv.localizacion_nombre || "-"}</TableCell>
                      <TableCell className={`text-right font-medium ${mv.cantidad >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                        {mv.cantidad >= 0 ? "+" : ""}{formatNumber(mv.cantidad)}
                      </TableCell>
                      <TableCell className="text-right text-stone-600">{formatCurrency(mv.costo_unitario)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
