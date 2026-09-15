"use client"

import * as React from "react"
import { PackageCheck, Loader2, Inbox, History, CalendarRange } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils/format"
import { getHondurasTodayISODate } from "@/lib/utils/honduras-time"
import {
  getCorridasPendientesRecepcion, recibirCorrida, getHistorialRecepciones,
  type CorridaPendiente, type RecepcionHistorial,
} from "@/lib/services/produccion-recepcion"
import {
  getAlmacenes, getLocalizaciones, type Almacen, type Localizacion,
} from "@/lib/services/catalogos"

export default function RecepcionProduccionPage() {
  const { toast } = useToast()
  const [pendientes, setPendientes] = React.useState<CorridaPendiente[]>([])
  const [almacenes, setAlmacenes] = React.useState<Almacen[]>([])
  const [loading, setLoading] = React.useState(true)

  const [recibir, setRecibir] = React.useState<CorridaPendiente | null>(null)
  const [almacenId, setAlmacenId] = React.useState("")
  const [locId, setLocId] = React.useState("")
  const [locs, setLocs] = React.useState<Localizacion[]>([])
  const [recibiendo, setRecibiendo] = React.useState(false)
  // Se incrementa tras cada recepción para que el historial se recargue.
  const [refreshHist, setRefreshHist] = React.useState(0)

  const cargar = React.useCallback(async () => {
    setLoading(true)
    const [p, a] = await Promise.all([getCorridasPendientesRecepcion(), getAlmacenes()])
    setPendientes(p.data)
    setAlmacenes(a.data)
    setLoading(false)
  }, [])
  React.useEffect(() => { cargar() }, [cargar])

  React.useEffect(() => {
    if (almacenId) getLocalizaciones(Number(almacenId)).then((r) => { setLocs(r.data); setLocId("") })
    else setLocs([])
  }, [almacenId])

  async function ejecutar() {
    if (!recibir) return
    if (!almacenId || !locId) {
      toast({ title: "Faltan datos", description: "Elige almacén y localización.", variant: "destructive" })
      return
    }
    setRecibiendo(true)
    const res = await recibirCorrida(recibir.corrida_id, Number(almacenId), Number(locId))
    setRecibiendo(false)
    if (!res.success) {
      toast({ title: "Error", description: res.error || "No se pudo recibir", variant: "destructive" })
      return
    }
    toast({ title: "Producción recibida", description: `${recibir.unidades_buenas} unidad(es) de ${recibir.producto_nombre} entraron al inventario.` })
    setRecibir(null); setAlmacenId(""); setLocId("")
    cargar()
    setRefreshHist((k) => k + 1)
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
          <PackageCheck className="h-6 w-6 text-stone-600" /> Recepción de Producción
        </h1>
        <p className="text-sm text-muted-foreground">
          Confirma las corridas ejecutadas y recibe el producto terminado al inventario con su costo real.
        </p>
      </div>

      <Tabs defaultValue="pendientes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pendientes" className="gap-1.5"><Inbox className="h-4 w-4" /> Por recibir</TabsTrigger>
          <TabsTrigger value="historial" className="gap-1.5"><History className="h-4 w-4" /> Historial</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: pendientes de recibir ── */}
        <TabsContent value="pendientes">
          <Card className="rounded-xl border-stone-200">
            <CardHeader className="p-4 md:p-6 pb-3">
              <CardTitle className="text-base md:text-lg">Corridas por recibir</CardTitle>
              <CardDescription className="text-xs md:text-sm">Entran las unidades buenas de cada corrida, con el costo real calculado.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {loading ? (
                <div className="flex justify-center py-10"><Spinner className="h-6 w-6" /></div>
              ) : pendientes.length === 0 ? (
                <div className="text-center py-10 text-stone-500 text-sm">
                  <PackageCheck className="h-10 w-10 mx-auto mb-2 opacity-40" /> No hay corridas ejecutadas pendientes de recibir.
                </div>
              ) : (
                <div className="rounded-lg border border-stone-200 overflow-x-auto">
                  <Table containerClassName="max-h-[60vh] overflow-y-auto">
                    <TableHeader sticky>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Unidades buenas</TableHead>
                        <TableHead className="text-right">Costo unit. real</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="w-28"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendientes.map((c) => (
                        <TableRow key={c.corrida_id}>
                          <TableCell className="font-medium">{c.producto_nombre || `Producto #${c.producto_id}`}</TableCell>
                          <TableCell className="text-right font-medium">{c.unidades_buenas}</TableCell>
                          <TableCell className="text-right text-stone-600">{formatCurrency(c.costo_unitario_real)}</TableCell>
                          <TableCell className="text-right text-emerald-700 font-medium">{formatCurrency(c.unidades_buenas * c.costo_unitario_real)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => { setRecibir(c); setAlmacenId(""); setLocId("") }}>
                              <PackageCheck className="h-3.5 w-3.5" /> Recibir
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: historial de recepciones ── */}
        <TabsContent value="historial">
          <HistorialRecepciones refreshKey={refreshHist} />
        </TabsContent>
      </Tabs>

      {/* Recepción */}
      <AlertDialog open={recibir != null} onOpenChange={(o) => { if (!o && !recibiendo) setRecibir(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Recibir producción</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>
                  Entrarán <strong>{recibir?.unidades_buenas}</strong> unidad(es) de{" "}
                  <strong>{recibir?.producto_nombre}</strong> a{" "}
                  <strong>{formatCurrency(recibir?.costo_unitario_real ?? 0)}</strong> c/u. El costo del producto se recalcula (promedio ponderado).
                </p>
                <div className="grid gap-2">
                  <Label className="text-xs">Almacén</Label>
                  <Select value={almacenId} onValueChange={setAlmacenId}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {almacenes.map((a) => (<SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">Localización</Label>
                  <Select value={locId} onValueChange={setLocId} disabled={!almacenId}>
                    <SelectTrigger className="h-9"><SelectValue placeholder={almacenId ? "Seleccionar" : "Elige almacén"} /></SelectTrigger>
                    <SelectContent>
                      {locs.map((l) => (<SelectItem key={l.id} value={String(l.id)}>{l.nombre}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={recibiendo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); ejecutar() }} disabled={recibiendo || !almacenId || !locId}>
              {recibiendo ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Recibiendo…</> : "Confirmar recepción"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ==================== HISTORIAL DE RECEPCIONES ====================

/** Suma N días a "YYYY-MM-DD" sin corrimiento de TZ. */
function sumarDias(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map((x) => parseInt(x, 10))
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

function HistorialRecepciones({ refreshKey }: { refreshKey: number }) {
  const { toast } = useToast()
  const hoy = getHondurasTodayISODate()
  const [desde, setDesde] = React.useState<string>(() => sumarDias(hoy, -30))
  const [hasta, setHasta] = React.useState<string>(hoy)
  const [rows, setRows] = React.useState<RecepcionHistorial[]>([])
  const [loading, setLoading] = React.useState(true)

  const cargar = React.useCallback(async () => {
    if (desde > hasta) { toast({ title: "Rango inválido", description: "La fecha inicial no puede ser mayor que la final.", variant: "destructive" }); return }
    setLoading(true)
    const { data, error } = await getHistorialRecepciones({ desde, hasta })
    if (error) toast({ title: "Error", description: error, variant: "destructive" })
    setRows(data)
    setLoading(false)
  }, [desde, hasta, toast])

  // Carga inicial + cuando se recibe una nueva producción (refreshKey).
  React.useEffect(() => { cargar() }, [cargar, refreshKey])

  const tot = React.useMemo(() => {
    let unidades = 0, valor = 0
    for (const r of rows) { unidades += r.cantidad; valor += r.valor_total }
    return { recepciones: rows.length, unidades: +unidades.toFixed(2), valor: +valor.toFixed(2) }
  }, [rows])

  return (
    <div className="space-y-4">
      {/* Filtro de rango */}
      <Card className="rounded-xl border-stone-200 bg-stone-50">
        <CardContent className="p-4 flex flex-wrap items-end gap-3">
          <div className="grid gap-1"><Label className="text-xs">Desde</Label><Input type="date" value={desde} max={hasta} onChange={(e) => setDesde(e.target.value)} className="h-9 w-44 bg-white" /></div>
          <div className="grid gap-1"><Label className="text-xs">Hasta</Label><Input type="date" value={hasta} max={hoy} onChange={(e) => setHasta(e.target.value)} className="h-9 w-44 bg-white" /></div>
          <Button onClick={cargar} disabled={loading} className="h-9">{loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CalendarRange className="h-4 w-4 mr-1" />} Consultar</Button>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-stone-200">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Recepciones</CardTitle>
              <CardDescription className="text-xs">Producto terminado que entró al inventario, del {desde} al {hasta}.</CardDescription>
            </div>
            {!loading && rows.length > 0 && (
              <div className="text-right text-xs text-stone-500">
                <div>{tot.recepciones} recepción(es) · {tot.unidades} u</div>
                <div className="text-emerald-700 font-semibold text-sm">{formatCurrency(tot.valor)}</div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner className="h-6 w-6" /></div>
          ) : rows.length === 0 ? (
            <div className="text-center py-10 text-stone-500 text-sm">
              <History className="h-10 w-10 mx-auto mb-2 opacity-40" /> Sin recepciones en este rango.
            </div>
          ) : (
            <div className="rounded-lg border border-stone-200 overflow-x-auto">
              <Table containerClassName="max-h-[60vh] overflow-y-auto">
                <TableHeader sticky>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Costo unit.</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Usuario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs whitespace-nowrap tabular-nums">{(r.fecha || "").slice(0, 10)}</TableCell>
                      <TableCell className="text-sm font-medium">{r.producto_nombre}</TableCell>
                      <TableCell className="text-xs text-stone-500">
                        {r.almacen_nombre || "—"}{r.localizacion_nombre ? ` · ${r.localizacion_nombre}` : ""}
                      </TableCell>
                      <TableCell className="text-right font-medium">{r.cantidad}</TableCell>
                      <TableCell className="text-right text-stone-600">{formatCurrency(r.costo_unitario_real)}</TableCell>
                      <TableCell className="text-right text-emerald-700 font-medium">{formatCurrency(r.valor_total)}</TableCell>
                      <TableCell className="text-xs text-stone-500">{r.usuario || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
