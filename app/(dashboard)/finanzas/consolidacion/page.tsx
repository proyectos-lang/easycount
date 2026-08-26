"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Banknote, Download, Pencil, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Indicador } from "@/components/ui/indicador"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/contexts/auth-context"
import { formatCurrency } from "@/lib/utils/format"
import { exportToXlsx } from "@/lib/utils/export"
import {
  getConsolidacionMensual,
  setSaldoInicialMes,
  borrarSaldoInicialMes,
  type ConsolidacionMensual,
  type CuentaConsolidada,
  type DiaConsolidado,
} from "@/lib/services/consolidacion-bancaria"

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

function mesActualYM(): string {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`
}

function saldoClass(v: number): string {
  return v < 0 ? "text-red-700" : "text-stone-800"
}

/** Tabla diaria reutilizable (consolidado o por cuenta). */
function TablaDiaria({ dias }: { dias: DiaConsolidado[] }) {
  if (dias.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No hay días para mostrar en este mes.
      </div>
    )
  }
  return (
    <div className="overflow-x-auto">
      <Table containerClassName="max-h-[55vh] overflow-y-auto">
        <TableHeader sticky>
          <TableRow>
            <TableHead className="w-16">Día</TableHead>
            <TableHead className="text-right">Saldo inicial</TableHead>
            <TableHead className="text-right">Entradas</TableHead>
            <TableHead className="text-right">Salidas</TableHead>
            <TableHead className="text-right">Saldo final</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dias.map((d) => {
            const conMov = d.entradas !== 0 || d.salidas !== 0
            return (
              <TableRow key={d.dia} className={conMov ? "" : "opacity-60"}>
                <TableCell className="font-medium text-stone-600">{d.dia}</TableCell>
                <TableCell className={`text-right font-mono ${saldoClass(d.saldoInicial)}`}>
                  {formatCurrency(d.saldoInicial)}
                </TableCell>
                <TableCell className="text-right font-mono text-emerald-700">
                  {d.entradas ? `+${formatCurrency(d.entradas)}` : "—"}
                </TableCell>
                <TableCell className="text-right font-mono text-red-700">
                  {d.salidas ? `−${formatCurrency(d.salidas)}` : "—"}
                </TableCell>
                <TableCell className={`text-right font-mono font-semibold ${saldoClass(d.saldoFinal)}`}>
                  {formatCurrency(d.saldoFinal)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default function ConsolidacionBancariaPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const isAdmin = (user?.rol || "").trim().toLowerCase() === "admin"

  const [ym, setYm] = useState<string>(mesActualYM())
  const [data, setData] = useState<ConsolidacionMensual | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<string>("consolidado")

  // Dialogo de edicion de saldo inicial (admin).
  const [editCuenta, setEditCuenta] = useState<CuentaConsolidada | null>(null)
  const [editValor, setEditValor] = useState<string>("")
  const [guardando, setGuardando] = useState(false)

  const [anioStr, mesStr] = ym.split("-")
  const anio = Number(anioStr)
  const mes = Number(mesStr)

  const cargar = useCallback(async () => {
    setLoading(true)
    const res = await getConsolidacionMensual(anio, mes)
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" })
      setData(null)
    } else {
      setData(res.data)
    }
    setLoading(false)
  }, [anio, mes, toast])

  useEffect(() => {
    cargar()
  }, [cargar])

  const cons = data?.consolidado

  const tituloMes = useMemo(
    () => (mes >= 1 && mes <= 12 ? `${MESES[mes - 1]} ${anio}` : ""),
    [mes, anio]
  )

  function abrirEdicion(c: CuentaConsolidada) {
    setEditCuenta(c)
    setEditValor(String(c.saldoInicialMes))
  }

  async function guardarSaldo() {
    if (!editCuenta) return
    const valor = Number(editValor)
    if (!Number.isFinite(valor)) {
      toast({ title: "Valor inválido", description: "Escribe un número.", variant: "destructive" })
      return
    }
    setGuardando(true)
    const res = await setSaldoInicialMes({
      cuenta_id: editCuenta.cuenta_id,
      anio,
      mes,
      saldo_inicial: valor,
    })
    setGuardando(false)
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" })
      return
    }
    toast({ title: "Guardado", description: `Saldo inicial de ${editCuenta.nombre} actualizado.` })
    setEditCuenta(null)
    cargar()
  }

  async function usarCalculado() {
    if (!editCuenta) return
    setGuardando(true)
    const res = await borrarSaldoInicialMes({ cuenta_id: editCuenta.cuenta_id, anio, mes })
    setGuardando(false)
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" })
      return
    }
    toast({ title: "Restablecido", description: `${editCuenta.nombre} vuelve al saldo calculado.` })
    setEditCuenta(null)
    cargar()
  }

  function exportar() {
    if (!data || data.cuentas.length === 0) {
      toast({ title: "Sin datos", description: "No hay consolidación para exportar.", variant: "destructive" })
      return
    }
    const rows: Record<string, unknown>[] = []
    for (const c of data.cuentas) {
      for (const d of c.dias) {
        rows.push({
          Cuenta: c.nombre,
          Fecha: d.fecha,
          "Saldo inicial": d.saldoInicial,
          Entradas: d.entradas,
          Salidas: d.salidas,
          "Saldo final": d.saldoFinal,
        })
      }
    }
    for (const d of data.consolidado.dias) {
      rows.push({
        Cuenta: "CONSOLIDADO",
        Fecha: d.fecha,
        "Saldo inicial": d.saldoInicial,
        Entradas: d.entradas,
        Salidas: d.salidas,
        "Saldo final": d.saldoFinal,
      })
    }
    exportToXlsx(rows, {
      sheetName: "Consolidacion",
      filename: `Consolidacion_Bancaria_${anio}_${String(mes).padStart(2, "0")}`,
      colWidths: [24, 12, 16, 14, 14, 16],
    })
    toast({ title: "Exportado", description: "El archivo Excel se descargó correctamente." })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <Banknote className="h-6 w-6 text-stone-500" /> Consolidación Bancaria
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            El saldo de tus bancos día por día. {tituloMes && <span className="font-medium text-stone-600">{tituloMes}</span>}
          </p>
        </div>
        <div className="flex items-end gap-2">
          <div className="grid gap-1.5">
            <Label htmlFor="mes" className="text-xs">Mes</Label>
            <Input
              id="mes"
              type="month"
              value={ym}
              onChange={(e) => e.target.value && setYm(e.target.value)}
              className="w-[170px]"
            />
          </div>
          <Button onClick={exportar} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Excel
          </Button>
        </div>
      </div>

      {/* Indicadores del mes (consolidado) */}
      <Card>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 md:divide-x md:[&>*:not(:first-child)]:pl-4 py-4">
          <Indicador label="Saldo inicial" value={formatCurrency(cons?.saldoInicialMes ?? 0)} loading={loading} valueClass={saldoClass(cons?.saldoInicialMes ?? 0)} />
          <Indicador label="Entradas del mes" value={formatCurrency(cons?.entradasMes ?? 0)} loading={loading} valueClass="text-emerald-700" />
          <Indicador label="Salidas del mes" value={formatCurrency(cons?.salidasMes ?? 0)} loading={loading} valueClass="text-red-700" />
          <Indicador label="Saldo final" value={formatCurrency(cons?.saldoFinalMes ?? 0)} loading={loading} valueClass={saldoClass(cons?.saldoFinalMes ?? 0)} />
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : !data || data.cuentas.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No hay cuentas bancarias configuradas. Créalas en Configuración → Cuentas Bancarias.
          </CardContent>
        </Card>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <div className="overflow-x-auto">
            <TabsList>
              <TabsTrigger value="consolidado">Consolidado</TabsTrigger>
              {data.cuentas.map((c) => (
                <TabsTrigger key={c.cuenta_id} value={String(c.cuenta_id)}>
                  {c.nombre}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Consolidado */}
          <TabsContent value="consolidado" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <TablaDiaria dias={data.consolidado.dias} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Por cuenta */}
          {data.cuentas.map((c) => (
            <TabsContent key={c.cuenta_id} value={String(c.cuenta_id)} className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-stone-500">
                        Saldo inicial del mes {c.esManual && <Badge variant="secondary" className="ml-1 bg-amber-100 text-amber-700">Manual</Badge>}
                      </p>
                      <p className={`text-xl font-semibold tabular-nums ${saldoClass(c.saldoInicialMes)}`}>
                        {formatCurrency(c.saldoInicialMes)}
                      </p>
                      {c.esManual && (
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Calculado: {formatCurrency(c.saldoInicialCalculado)}
                        </p>
                      )}
                    </div>
                    {isAdmin && (
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => abrirEdicion(c)}>
                        <Pencil className="h-3.5 w-3.5" /> Editar saldo inicial
                      </Button>
                    )}
                  </div>
                  <TablaDiaria dias={c.dias} />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Dialogo: fijar saldo inicial del mes (admin) */}
      <Dialog open={!!editCuenta} onOpenChange={(o) => !o && setEditCuenta(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Saldo inicial del mes</DialogTitle>
            <DialogDescription>
              {editCuenta?.nombre} · {tituloMes}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-md bg-stone-50 px-3 py-2 text-sm text-stone-600">
              Saldo calculado (referencia):{" "}
              <span className="font-mono font-medium text-stone-800">
                {formatCurrency(editCuenta?.saldoInicialCalculado ?? 0)}
              </span>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="saldoInicial">Saldo inicial real</Label>
              <Input
                id="saldoInicial"
                type="number"
                step="any"
                value={editValor}
                onChange={(e) => setEditValor(e.target.value)}
                autoFocus
              />
              <p className="text-[11px] text-stone-400">
                Toda la consolidación del mes se recalcula desde este saldo.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            {editCuenta?.esManual ? (
              <Button variant="ghost" className="gap-2 text-stone-500" onClick={usarCalculado} disabled={guardando}>
                <RotateCcw className="h-4 w-4" /> Usar saldo calculado
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditCuenta(null)} disabled={guardando}>
                Cancelar
              </Button>
              <Button onClick={guardarSaldo} disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
