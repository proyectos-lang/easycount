import Link from "next/link"
import { datosGestion } from "../datos"
import { leerMes } from "@/lib/gestion/mes"
import { etiquetaMes, resumenFinanzas } from "@/lib/gestion/calculos"
import { estadoResultados, estadoResultadosMensual, liquidacionMes } from "@/lib/gestion/socios"
import { EstadoResultadosTabla } from "../_components/estado-resultados-tabla"
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
  // Estado de resultados: la participación de socios va DESPUÉS de gastos.
  const liq = liquidacionMes({
    anio: sel.anio, mes: sel.mes, socios: d.socios,
    ingresos: d.pagos.map((p) => ({ fecha: p.fecha, monto: p.monto })),
    gastos: d.gastos.map((g) => ({ fecha: g.fecha, monto: g.monto, socio_id: g.socio_id })),
  })
  const er = estadoResultados(liq)
  const mensual = estadoResultadosMensual({
    anio: sel.anio, mes: sel.mes, meses: 12, socios: d.socios,
    ingresos: d.pagos.map((p) => ({ fecha: p.fecha, monto: p.monto })),
    gastos: d.gastos.map((g) => ({ fecha: g.fecha, monto: g.monto, socio_id: g.socio_id })),
  })
  const sociosConParte = liq.socios.filter((s) => s.porcentaje > 0)
  const tonoValor = (n: number) => (n >= 0 ? "text-emerald-700" : "text-red-700")

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
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
          <p className="text-[11px] uppercase tracking-wide text-stone-500">Utilidad bruta</p>
          <p className={`mt-0.5 text-xl font-semibold tabular-nums ${tonoValor(er.utilidadBruta)}`}>{fmtMoneda(er.utilidadBruta, m)}</p>
          <p className="text-[11px] text-stone-400">ingresos − gastos · margen {fmtPct(er.margenBruto)}</p>
        </div>
        <div className="rounded-xl border bg-white px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-stone-500">Participación socios</p>
          <p className="mt-0.5 text-xl font-semibold tabular-nums text-amber-700">{fmtMoneda(er.participacionSocios, m)}</p>
          <p className="text-[11px] text-stone-400">% de la utilidad bruta</p>
        </div>
        <div className="rounded-xl border bg-white px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-stone-500">Utilidad neta</p>
          <p className={`mt-0.5 text-xl font-semibold tabular-nums ${tonoValor(er.utilidadNeta)}`}>{fmtMoneda(er.utilidadNeta, m)}</p>
          <p className="text-[11px] text-stone-400">queda en EasyCount · margen {fmtPct(er.margenNeto)}</p>
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
          <div className="grid gap-4 lg:grid-cols-5">
            <Panel titulo={`Estado de resultados · ${etiquetaMes(sel.anio, sel.mes)}`} descripcion="La participación de los socios se calcula después de los gastos." className="lg:col-span-2">
              <table className="w-full text-sm">
                <tbody>
                  <tr><td className="py-1.5 text-stone-700">Ingresos</td><td className="py-1.5 text-right tabular-nums">{fmtMoneda(er.ingresos, m)}</td></tr>
                  <tr><td className="py-1.5 text-stone-700">(−) Gastos{liq.gastosSocios > 0 && <span className="block text-[11px] text-stone-400">incluye {fmtMoneda(liq.gastosSocios, m)} asumidos por socios</span>}</td><td className="py-1.5 text-right tabular-nums text-red-700">− {fmtMoneda(er.gastos, m)}</td></tr>
                  <tr className="border-t-2 border-stone-300 font-semibold"><td className="py-1.5">Utilidad bruta</td><td className={`py-1.5 text-right tabular-nums ${tonoValor(er.utilidadBruta)}`}>{fmtMoneda(er.utilidadBruta, m)}</td></tr>
                  {sociosConParte.length === 0 ? (
                    <tr><td className="py-1.5 text-stone-700">(−) Participación socios<span className="block text-[11px] text-stone-400">sin socios con % asignado</span></td><td className="py-1.5 text-right tabular-nums">{fmtMoneda(0, m)}</td></tr>
                  ) : sociosConParte.map((s) => (
                    <tr key={s.socio_id}><td className="py-1.5 text-stone-700">(−) Participación {s.nombre} <span className="text-[11px] text-stone-400">({s.porcentaje}%)</span></td><td className="py-1.5 text-right tabular-nums text-amber-700">− {fmtMoneda(s.participacion, m)}</td></tr>
                  ))}
                  <tr className="border-t-2 border-stone-800 font-bold"><td className="py-2">Utilidad neta</td><td className={`py-2 text-right tabular-nums ${tonoValor(er.utilidadNeta)}`}>{fmtMoneda(er.utilidadNeta, m)}</td></tr>
                </tbody>
              </table>
              <p className="mt-2 text-[11px] text-stone-400">Los gastos que pagó un socio de su bolsa ya están dentro de «Gastos»; en su liquidación se le reembolsan además de su participación (ver Socios).</p>
            </Panel>
            <Panel titulo="Ingresos vs gastos" descripcion="Últimos 6 meses" className="lg:col-span-3"><GraficaIngresosGastos serie={f.serie} moneda={m} /></Panel>
          </div>
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
      <EstadoResultadosTabla columnas={mensual.columnas} total={mensual.total} moneda={m} titulo={`Estado de resultados mes a mes · hasta ${etiquetaMes(sel.anio, sel.mes)}`} />
    </div>
  )
}
