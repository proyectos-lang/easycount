import Link from "next/link"
import { datosGestion } from "../datos"
import { leerMes } from "@/lib/gestion/mes"
import { etiquetaMes, resumenFinanzas } from "@/lib/gestion/calculos"
import { GraficaIngresosGastos } from "../_components/graficas"
import { BarrasHorizontales, Panel, Vacio, fmtMoneda, fmtPct } from "../_components/ui"

export const dynamic = "force-dynamic"

export default async function FinanzasPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const datos = await datosGestion()
  if (!datos.data) return null
  const d = datos.data
  const sel = leerMes(sp.mes, d.hoy)
  const m = d.config.moneda
  const f = resumenFinanzas({ empresas: d.empresas, pagos: d.pagos, gastos: d.gastos, cuentas: d.cuentas, anio: sel.anio, mes: sel.mes })
  const sinDatos = f.ingresos === 0 && f.gastos === 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-emerald-800">Ingresos · {etiquetaMes(sel.anio, sel.mes)}</p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums text-emerald-800">{fmtMoneda(f.ingresos, m)}</p>
          <p className="text-[11px] text-emerald-700">cobrado en el mes</p>
        </div>
        <div className="rounded-xl border bg-white px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-stone-500">Gastos</p>
          <p className="mt-0.5 text-xl font-semibold tabular-nums text-red-700">{fmtMoneda(f.gastos, m)}</p>
          <p className="text-[11px] text-stone-400">publicidad {fmtMoneda(f.publicidad, m)}</p>
        </div>
        <div className="rounded-xl border bg-white px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-stone-500">Utilidad</p>
          <p className={`mt-0.5 text-xl font-semibold tabular-nums ${f.utilidad >= 0 ? "text-emerald-700" : "text-red-700"}`}>{fmtMoneda(f.utilidad, m)}</p>
          <p className="text-[11px] text-stone-400">margen {fmtPct(f.margen)}</p>
        </div>
        <div className="rounded-xl border bg-white px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-stone-500">MRR</p>
          <p className="mt-0.5 text-xl font-semibold tabular-nums text-stone-800">{fmtMoneda(f.mrr, m)}</p>
          <p className="text-[11px] text-stone-400">mensuales + anuales ÷ 12</p>
        </div>
      </div>

      {sinDatos ? (
        <Vacio titulo={`Sin ingresos ni gastos en ${etiquetaMes(sel.anio, sel.mes)}`} texto="Cambia de mes arriba, o registra pagos y gastos." />
      ) : (
        <>
          <Panel titulo="Ingresos vs gastos" descripcion="Últimos 6 meses"><GraficaIngresosGastos serie={f.serie} moneda={m} /></Panel>
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel titulo="Ingresos por cuenta" descripcion="Pagos del mes agrupados por la cuenta que los recibió.">
              <BarrasHorizontales filas={f.porCuenta.filter((c) => c.total > 0).map((c) => ({ etiqueta: c.nombre, valor: c.total }))} formato={(n) => fmtMoneda(n, m)} />
            </Panel>
            <Panel titulo="Top de clientes del mes">
              {f.topClientes.length === 0 ? <p className="text-xs text-stone-400">Sin pagos en el mes.</p> : (
                <ol className="space-y-1.5">
                  {f.topClientes.map((c, i) => (
                    <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate"><span className="mr-2 inline-block w-5 text-right text-xs text-stone-400 tabular-nums">{i + 1}.</span><Link href={`/gestion/empresas/${c.id}`} className="text-stone-800 hover:underline">{c.nombre}</Link></span>
                      <span className="tabular-nums font-medium">{fmtMoneda(c.total, m)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  )
}
