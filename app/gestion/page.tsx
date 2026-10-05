import Link from "next/link"
import { getSuperadmin } from "@/lib/services/plataforma"
import { leerMes } from "@/lib/gestion/mes"
import { etiquetaMes, resumenInicio } from "@/lib/gestion/calculos"
import { ETIQUETA_TIPO_REUNION } from "@/lib/gestion/reglas"
import { datosGestion } from "./datos"
import { GraficaIngresosGastos } from "./_components/graficas"
import { CobroBadge, Kpi, Panel, Progreso, Vacio, fmtFecha, fmtHora, fmtMoneda, fmtNum } from "./_components/ui"

export const dynamic = "force-dynamic"

export default async function InicioGestion({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const [datos, sa] = await Promise.all([datosGestion(), getSuperadmin()])
  if (!datos.data) return null // el layout ya muestra el aviso del script pendiente
  const d = datos.data
  const sel = leerMes(sp.mes, d.hoy)
  const r = resumenInicio({ empresas: d.empresas, pagos: d.pagos, gastos: d.gastos, reuniones: d.reuniones, hoy: d.hoy, anio: sel.anio, mes: sel.mes, diasPrueba: d.config.dias_prueba })
  const m = d.config.moneda
  const nombre = (sa?.nombre || sa?.email || "").split(" ")[0]
  const nombres = new Map(d.empresas.map((e) => [e.id, e.nombre]))

  const chips = [
    { n: r.chips.atrasados, texto: "pagos atrasados", color: "bg-red-500", href: "/gestion/pagos?filtro=atrasados" },
    { n: r.chips.estaSemana, texto: "pagos esta semana", color: "bg-amber-400", href: "/gestion/pagos?filtro=pendientes" },
    { n: r.chips.pruebasPronto, texto: "pruebas terminan pronto", color: "bg-sky-500", href: "/gestion/empresas?filtro=prueba" },
    { n: r.chips.alDia, texto: "clientes al día", color: "bg-emerald-500", href: "/gestion/pagos?filtro=pagados" },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Hola{nombre ? `, ${nombre}` : ""}</h2>
        <p className="mt-1 text-sm text-stone-500">
          {etiquetaMes(sel.anio, sel.mes)}: {fmtNum(r.kpis.activos)} clientes activos, {fmtMoneda(r.kpis.ingresos, m)} cobrados, {fmtNum(r.kpis.pagosPendientes)} pago{r.kpis.pagosPendientes === 1 ? "" : "s"} pendiente{r.kpis.pagosPendientes === 1 ? "" : "s"} y {fmtNum(r.kpis.reunionesProximas)} reunión{r.kpis.reunionesProximas === 1 ? "" : "es"} próxima{r.kpis.reunionesProximas === 1 ? "" : "s"}.
        </p>
      </div>

      {/* Chips de estado */}
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <Link key={c.texto} href={c.href} className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50">
            <span className={`h-2 w-2 rounded-full ${c.color}`} /> <span className="tabular-nums font-semibold">{c.n}</span> {c.texto}
          </Link>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Clientes activos" value={fmtNum(r.kpis.activos)} tono="verde" />
        <Kpi label="En prueba" value={fmtNum(r.kpis.enPrueba)} tono="azul" />
        <Kpi label="Pagos pendientes" value={fmtNum(r.kpis.pagosPendientes)} tono={r.kpis.pagosPendientes > 0 ? "amarillo" : undefined} />
        <Kpi label="Ingresos del mes" value={fmtMoneda(r.kpis.ingresos, m)} tono="verde" />
        <Kpi label="Gastos del mes" value={fmtMoneda(r.kpis.gastos, m)} tono="rojo" />
        <Kpi label="Utilidad bruta" value={fmtMoneda(r.kpis.utilidad, m)} tono={r.kpis.utilidad >= 0 ? "verde" : "rojo"} />
        <Kpi label="Reuniones próximas" value={fmtNum(r.kpis.reunionesProximas)} />
        <Kpi label="Nuevos prospectos" value={fmtNum(r.kpis.nuevosProspectos)} sub="creados en el mes" />
      </div>

      {/* 65 / 35 */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Panel titulo="Pagos próximos" descripcion="Próximos 30 días" className="lg:col-span-3" accion={<Link href="/gestion/pagos" className="text-xs text-stone-500 underline underline-offset-4">Ver pagos</Link>}>
          {r.pagosProximos.length === 0 ? <Vacio titulo="Sin pagos en los próximos 30 días" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[11px] uppercase tracking-wide text-stone-500">
                  <tr><th className="py-1.5 pr-3 font-medium">Empresa</th><th className="py-1.5 pr-3 font-medium">Fecha</th><th className="py-1.5 pr-3 text-right font-medium">Cuota</th><th className="py-1.5 font-medium">Estado</th></tr>
                </thead>
                <tbody>
                  {r.pagosProximos.slice(0, 10).map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="py-2 pr-3"><Link href={`/gestion/empresas/${e.id}`} className="font-medium text-stone-800 hover:underline">{e.nombre}</Link></td>
                      <td className="py-2 pr-3 tabular-nums text-stone-600">{fmtFecha(e.fecha_proximo_pago)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmtMoneda(e.cuota, m)}</td>
                      <td className="py-2"><CobroBadge estado={e.estado_cobro} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
        <Panel titulo="Pruebas por finalizar" className="lg:col-span-2">
          {r.pruebas.length === 0 ? <Vacio titulo="Nadie en prueba" /> : (
            <ul className="space-y-3">
              {r.pruebas.slice(0, 8).map((p) => (
                <li key={p.id}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <Link href={`/gestion/empresas/${p.id}`} className="truncate font-medium text-stone-800 hover:underline">{p.nombre}</Link>
                    <span className={`shrink-0 text-xs font-semibold tabular-nums ${p.restantes < 0 ? "text-red-600" : p.restantes <= 3 ? "text-amber-700" : "text-stone-500"}`}>
                      {p.restantes < 0 ? `venció hace ${-p.restantes} d` : p.restantes === 0 ? "termina hoy" : `${p.restantes} d restantes`}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400">Instalación {fmtFecha(p.instalacion)} · fin {fmtFecha(p.fin)}</p>
                  <div className="mt-1"><Progreso pct={p.progreso} tono={p.restantes < 0 ? "rojo" : "azul"} /></div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel titulo="Ingresos vs gastos" descripcion="Últimos 6 meses" className="lg:col-span-3">
          <GraficaIngresosGastos serie={r.serie} moneda={m} />
        </Panel>
        <Panel titulo="Próximas reuniones" className="lg:col-span-2" accion={<Link href="/gestion/reuniones" className="text-xs text-stone-500 underline underline-offset-4">Ver todas</Link>}>
          {r.reunionesProximas.length === 0 ? <Vacio titulo="Sin reuniones agendadas" /> : (
            <ul className="divide-y">
              {r.reunionesProximas.map((x) => (
                <li key={x.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <div className="min-w-0">
                    <Link href={`/gestion/empresas/${x.empresa_id}`} className="block truncate font-medium text-stone-800 hover:underline">{nombres.get(x.empresa_id) || "Empresa"}</Link>
                    <p className="text-[11px] text-stone-500">{x.contacto || "—"} · {ETIQUETA_TIPO_REUNION[x.tipo as keyof typeof ETIQUETA_TIPO_REUNION] ?? x.tipo}</p>
                  </div>
                  <div className="shrink-0 text-right text-xs tabular-nums text-stone-600">
                    <p>{fmtFecha(x.fecha)}</p><p>{fmtHora(x.hora)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}
