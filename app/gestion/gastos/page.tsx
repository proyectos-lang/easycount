import { datosGestion } from "../datos"
import { leerMes, rangoMes } from "@/lib/gestion/mes"
import { etiquetaMes, resumenFinanzas } from "@/lib/gestion/calculos"
import { ETIQUETA_CATEGORIA } from "@/lib/gestion/reglas"
import { EliminarGasto, GastoForm, VerComprobante } from "../_components/gasto-form"
import { BarrasHorizontales, Kpi, Panel, Vacio, fmtFecha, fmtMoneda } from "../_components/ui"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function GastosPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const datos = await datosGestion()
  if (!datos.data) return null
  const d = datos.data
  const sel = leerMes(sp.mes, d.hoy)
  const { desde, hasta } = rangoMes(sel)
  const m = d.config.moneda
  const f = resumenFinanzas({ empresas: d.empresas, pagos: d.pagos, gastos: d.gastos, cuentas: d.cuentas, anio: sel.anio, mes: sel.mes })
  const lista = d.gastos.filter((g) => g.fecha >= desde && g.fecha <= hasta)
  const categorias = d.config.categorias_gasto.length ? d.config.categorias_gasto : ["otros"]
  const nombreSocio = new Map(d.socios.map((s) => [s.id, s.nombre]))
  const deSocios = lista.filter((g) => g.socio_id != null).reduce((a, g) => a + g.monto, 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
          <Kpi label={`Gastos · ${etiquetaMes(sel.anio, sel.mes)}`} value={fmtMoneda(f.gastos, m)} tono="rojo" />
          <Kpi label="Publicidad" value={fmtMoneda(f.publicidad, m)} sub="publicidad, Meta Ads, Google Ads" />
          <Kpi label="Otros" value={fmtMoneda(f.otros, m)} />
        </div>
        <GastoForm categorias={categorias} hoy={d.hoy} socios={d.socios} />
      </div>
      {deSocios > 0 && <p className="text-xs text-amber-700">De estos gastos, {fmtMoneda(deSocios, m)} los asumieron socios y se les reembolsan en su liquidación (ver Socios).</p>}

      {lista.length === 0 ? (
        <Vacio titulo={`Sin gastos en ${etiquetaMes(sel.anio, sel.mes)}`} texto="Registra el primero con «Nuevo gasto» o cambia de mes arriba." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel titulo="Gastos por categoría" className="lg:col-span-1">
            <BarrasHorizontales filas={f.porCategoria.map((c) => ({ etiqueta: ETIQUETA_CATEGORIA[c.categoria] ?? c.categoria, valor: c.total }))} formato={(n) => fmtMoneda(n, m)} />
          </Panel>
          <Panel titulo="Movimientos" className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[11px] uppercase tracking-wide text-stone-500">
                  <tr><th className="py-1.5 pr-3 font-medium">Fecha</th><th className="py-1.5 pr-3 font-medium">Categoría</th><th className="py-1.5 pr-3 font-medium">Descripción</th><th className="py-1.5 pr-3 font-medium">Método</th><th className="py-1.5 pr-3 font-medium">Pagado por</th><th className="py-1.5 pr-3 text-right font-medium">Monto</th><th className="py-1.5 pr-3 font-medium">Comprobante</th><th className="py-1.5"></th></tr>
                </thead>
                <tbody>
                  {lista.map((g) => (
                    <tr key={g.id} className="border-t">
                      <td className="py-2 pr-3 tabular-nums">{fmtFecha(g.fecha)}</td>
                      <td className="py-2 pr-3">{ETIQUETA_CATEGORIA[g.categoria] ?? g.categoria}</td>
                      <td className="py-2 pr-3 text-stone-700">{g.descripcion || "—"}{g.observaciones && <span className="block text-[11px] text-stone-400">{g.observaciones}</span>}</td>
                      <td className="py-2 pr-3 text-stone-600">{g.metodo || "—"}</td>
                      <td className="py-2 pr-3">{g.socio_id != null ? <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">{nombreSocio.get(g.socio_id) ?? `Socio #${g.socio_id}`}</span> : <span className="text-xs text-stone-500">EasyCount</span>}</td>
                      <td className="py-2 pr-3 text-right tabular-nums font-medium">{fmtMoneda(g.monto, m)}</td>
                      <td className="py-2 pr-3">{g.comprobante_path ? <VerComprobante path={g.comprobante_path} /> : <span className="text-xs text-stone-400">—</span>}</td>
                      <td className="py-2 whitespace-nowrap text-right">
                        <GastoForm gasto={g} categorias={categorias} hoy={d.hoy} socios={d.socios} trigger={<Button size="icon" variant="ghost" className="h-7 w-7 text-stone-400 hover:text-stone-700" aria-label="Editar"><Pencil className="h-3.5 w-3.5" /></Button>} />
                        <EliminarGasto id={g.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}
    </div>
  )
}
