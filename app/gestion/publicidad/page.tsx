import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { datosGestion } from "../datos"
import { leerMes, rangoMes } from "@/lib/gestion/mes"
import { etiquetaMes, resumenPublicidad } from "@/lib/gestion/calculos"
import { ETIQUETA_PLATAFORMA, costoPor } from "@/lib/gestion/reglas"
import { CampanaForm, EliminarCampana } from "../_components/campana-form"
import { Chips, Kpi, Panel, Vacio, fmtFecha, fmtMoneda, fmtNum } from "../_components/ui"

export const dynamic = "force-dynamic"

export default async function PublicidadPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const datos = await datosGestion()
  if (!datos.data) return null
  const d = datos.data
  const sel = leerMes(sp.mes, d.hoy)
  const { desde, hasta } = rangoMes(sel)
  const todas = sp.alcance === "todas"
  const m = d.config.moneda
  // Del mes: campañas cuyo rango de fechas se cruza con el mes (sin fechas = siempre).
  const lista = todas ? d.campanas : d.campanas.filter((c) => (!c.fecha_inicio || c.fecha_inicio <= hasta) && (!c.fecha_fin || c.fecha_fin >= desde))
  const r = resumenPublicidad(lista)
  const mesQ = `mes=${sel.anio}-${String(sel.mes).padStart(2, "0")}`

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Chips items={[
          { href: `/gestion/publicidad?${mesQ}`, label: `Activas en ${etiquetaMes(sel.anio, sel.mes)}`, activo: !todas },
          { href: `/gestion/publicidad?alcance=todas&${mesQ}`, label: "Todas las campañas", activo: todas, count: d.campanas.length },
        ]} />
        <CampanaForm />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi label="Total invertido" value={fmtMoneda(r.invertido, m)} tono="rojo" />
        <Kpi label="Prospectos" value={fmtNum(r.prospectos)} />
        <Kpi label="Clientes" value={fmtNum(r.clientes)} tono="verde" />
        <Kpi label="Costo por prospecto" value={r.costoProspecto == null ? "—" : fmtMoneda(r.costoProspecto, m)} />
        <Kpi label="Costo por cliente" value={r.costoCliente == null ? "—" : fmtMoneda(r.costoCliente, m)} />
      </div>
      <Panel titulo="Campañas">
        {lista.length === 0 ? <Vacio titulo="Sin campañas en este período" texto="Crea una con «Nueva campaña» o mira «Todas las campañas»." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wide text-stone-500">
                <tr><th className="py-1.5 pr-3 font-medium">Campaña</th><th className="py-1.5 pr-3 font-medium">Plataforma</th><th className="py-1.5 pr-3 font-medium">Período</th><th className="py-1.5 pr-3 text-right font-medium">Invertido</th><th className="py-1.5 pr-3 text-right font-medium">Prospectos</th><th className="py-1.5 pr-3 text-right font-medium">Reuniones</th><th className="py-1.5 pr-3 text-right font-medium">Clientes</th><th className="py-1.5 pr-3 text-right font-medium">Costo/prospecto</th><th className="py-1.5 pr-3 text-right font-medium">Costo/cliente</th><th className="py-1.5"></th></tr>
              </thead>
              <tbody>
                {lista.map((c) => {
                  const cp = costoPor(c.monto_invertido, c.prospectos_generados), cc = costoPor(c.monto_invertido, c.clientes_obtenidos)
                  return (
                    <tr key={c.id} className="border-t">
                      <td className="py-2 pr-3 font-medium text-stone-800">{c.nombre}</td>
                      <td className="py-2 pr-3">{ETIQUETA_PLATAFORMA[c.plataforma] ?? c.plataforma}</td>
                      <td className="py-2 pr-3 tabular-nums text-xs text-stone-600">{fmtFecha(c.fecha_inicio)} – {fmtFecha(c.fecha_fin)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmtMoneda(c.monto_invertido, m)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmtNum(c.prospectos_generados)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmtNum(c.reuniones_generadas)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmtNum(c.clientes_obtenidos)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{cp == null ? "—" : fmtMoneda(cp, m)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums font-medium">{cc == null ? "—" : fmtMoneda(cc, m)}</td>
                      <td className="py-2 whitespace-nowrap text-right">
                        <CampanaForm campana={c} trigger={<Button size="icon" variant="ghost" className="h-7 w-7 text-stone-400 hover:text-stone-700" aria-label="Editar"><Pencil className="h-3.5 w-3.5" /></Button>} />
                        <EliminarCampana id={c.id} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
