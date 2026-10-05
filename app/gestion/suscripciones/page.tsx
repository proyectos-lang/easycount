import Link from "next/link"
import { datosGestion } from "../datos"
import { leerMes, claveMes } from "@/lib/gestion/mes"
import { etiquetaMes } from "@/lib/gestion/calculos"
import { curvaCrecimiento, inicioSuscripcion, resumenSuscripciones, valorMensual } from "@/lib/gestion/suscripciones"
import { esClienteVigente } from "@/lib/gestion/reglas"
import { GraficaCrecimiento } from "../_components/grafica-crecimiento"
import { TrLink } from "../_components/tr-link"
import { CicloBadge, CobroBadge, Etiqueta, Kpi, Panel, Vacio, fmtFecha, fmtMoneda, fmtNum } from "../_components/ui"

export const dynamic = "force-dynamic"

export default async function SuscripcionesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const datos = await datosGestion()
  if (!datos.data) return null
  const d = datos.data
  const sel = leerMes(sp.mes, d.hoy)
  const m = d.config.moneda
  const pagos = d.pagos.map((p) => ({ empresa_id: p.empresa_id, fecha: p.fecha, monto: p.monto, periodo_cubierto_desde: p.periodo_cubierto_desde, periodo_cubierto_hasta: p.periodo_cubierto_hasta }))
  const r = resumenSuscripciones({ empresas: d.empresas, pagos, anio: sel.anio, mes: sel.mes, hoy: d.hoy })
  const curva = curvaCrecimiento({ empresas: d.empresas, pagos, hasta: sel, hoy: d.hoy, proyeccionMeses: 3 })
  const vigentes = d.empresas.filter((e) => esClienteVigente(e.estado)).sort((a, b) => valorMensual(b) - valorMensual(a))
  const avance = r.porCobrar > 0 ? Math.round((r.cobrosCubiertos / r.porCobrar) * 100) : 0
  const etiqueta = etiquetaMes(sel.anio, sel.mes)

  return (
    <div className="space-y-4">
      {/* Valor actual */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Suscripciones activas" value={fmtNum(r.activas)} sub={`${r.mensuales} mensual(es) · ${r.anuales} anual(es)`} />
        <Kpi label="Valor recurrente mensual" value={fmtMoneda(r.mrr, m)} tono="verde" sub="MRR: mensuales + anuales ÷ 12" />
        <Kpi label="Valor anual" value={fmtMoneda(r.arr, m)} sub="ARR = MRR × 12" />
        <Kpi label="Ticket promedio" value={fmtMoneda(r.activas ? r.mrr / r.activas : 0, m)} sub="por suscripción, al mes" />
      </div>

      {/* A cobrar vs cobrado del mes */}
      <Panel titulo={`Cobro de ${etiqueta}`} descripcion="Lo que toca cobrar en el mes según las suscripciones vigentes, frente a lo que ya pagaron.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi label="A cobrar en el mes" value={fmtMoneda(r.porCobrar, m)} tono="amarillo" sub={`${r.cobros.length} cobro(s) que vencen en el mes`} />
          <Kpi label="Ya pagado" value={fmtMoneda(r.cobrosCubiertos, m)} tono="verde" sub={`${avance}% de lo que toca cobrar`} />
          <Kpi label="Falta por cobrar" value={fmtMoneda(r.pendiente, m)} tono={r.pendiente > 0 ? "rojo" : undefined} sub={r.vencido > 0 ? `${fmtMoneda(r.vencido, m)} ya vencido` : "nada vencido"} />
          <Kpi label="Entró en el mes" value={fmtMoneda(r.cobradoMes, m)} sub="todos los pagos recibidos (incluye atrasos y adelantos)" />
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, avance)}%` }} />
        </div>
        {r.cobros.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wide text-stone-500">
                <tr><th className="py-1.5 pr-3 font-medium">Vence</th><th className="py-1.5 pr-3 font-medium">Empresa</th><th className="py-1.5 pr-3 font-medium">Ciclo</th><th className="py-1.5 pr-3 text-right font-medium">Monto</th><th className="py-1.5 font-medium">Estado</th></tr>
              </thead>
              <tbody>
                {r.cobros.map((c) => (
                  <TrLink key={c.empresa_id} href={`/gestion/empresas/${c.empresa_id}`}>
                    <td className="py-2 pr-3 tabular-nums">{fmtFecha(c.vence)}</td>
                    <td className="py-2 pr-3 font-medium text-stone-800">{c.nombre}</td>
                    <td className="py-2 pr-3"><CicloBadge ciclo={c.ciclo} /></td>
                    <td className="py-2 pr-3 text-right tabular-nums">{fmtMoneda(c.monto, m)}</td>
                    <td className="py-2">{c.estado === "pagado" ? <CobroBadge estado="pagado" /> : c.estado === "vencido" ? <CobroBadge estado="atrasado" /> : <CobroBadge estado="pendiente" />}</td>
                  </TrLink>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Curva de crecimiento */}
      <Panel titulo="Crecimiento de las suscripciones" descripcion="Mes a mes, lo que generan las suscripciones ya concretadas desde que iniciaron (los próximos 3 meses son proyección con las suscripciones actuales).">
        {curva.length === 0 ? <Vacio titulo="Sin suscripciones vigentes" /> : (
          <>
            <GraficaCrecimiento puntos={curva} moneda={m} mesSeleccionado={claveMes(sel)} />
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-max text-xs">
                <thead className="text-[10px] uppercase tracking-wide text-stone-500">
                  <tr className="border-b">
                    <th className="sticky left-0 bg-white py-1.5 pr-3 text-left font-medium">Mes</th>
                    {curva.map((p) => <th key={p.mes} className="px-2 py-1.5 text-right font-medium whitespace-nowrap">{p.mes.slice(5, 7)}/{p.mes.slice(2, 4)}{p.proyeccion ? "*" : ""}</th>)}
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  <tr><td className="sticky left-0 bg-white py-1 pr-3 text-stone-600">Suscripciones</td>{curva.map((p) => <td key={p.mes} className="px-2 py-1 text-right">{p.suscripciones}{p.nuevas ? <span className="text-emerald-600"> +{p.nuevas}</span> : ""}</td>)}</tr>
                  <tr><td className="sticky left-0 bg-white py-1 pr-3 text-stone-600">A cobrar</td>{curva.map((p) => <td key={p.mes} className="px-2 py-1 text-right whitespace-nowrap">{fmtNum(p.esperado)}</td>)}</tr>
                  <tr><td className="sticky left-0 bg-white py-1 pr-3 text-stone-600">MRR</td>{curva.map((p) => <td key={p.mes} className="px-2 py-1 text-right whitespace-nowrap text-emerald-700">{fmtNum(p.mrr)}</td>)}</tr>
                  <tr><td className="sticky left-0 bg-white py-1 pr-3 text-stone-600">Cobrado real</td>{curva.map((p) => <td key={p.mes} className="px-2 py-1 text-right whitespace-nowrap text-stone-500">{p.proyeccion ? "—" : fmtNum(p.cobrado)}</td>)}</tr>
                </tbody>
              </table>
              <p className="mt-1 text-[10px] text-stone-400">* proyección. «A cobrar» incluye la cuota anual completa en el mes aniversario de cada suscripción anual; el MRR la reparte en 12.</p>
            </div>
          </>
        )}
      </Panel>

      {/* Suscripciones actuales */}
      <Panel titulo="Suscripciones actuales" accion={<Link href="/gestion/empresas?filtro=activos" className="text-xs text-stone-500 underline underline-offset-4">Ver empresas</Link>}>
        {vigentes.length === 0 ? <Vacio titulo="Sin suscripciones vigentes" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="py-1.5 pr-3 font-medium">Empresa</th><th className="py-1.5 pr-3 font-medium">Plan</th><th className="py-1.5 pr-3 font-medium">Ciclo</th>
                  <th className="py-1.5 pr-3 text-right font-medium">Cuota</th><th className="py-1.5 pr-3 text-right font-medium">Valor mensual</th><th className="py-1.5 pr-3 font-medium">Inició</th>
                  <th className="py-1.5 pr-3 font-medium">Cobra</th><th className="py-1.5 pr-3 font-medium">Próximo pago</th><th className="py-1.5 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {vigentes.map((e) => (
                  <TrLink key={e.id} href={`/gestion/empresas/${e.id}`}>
                    <td className="py-2 pr-3 font-medium text-stone-800">{e.nombre}</td>
                    <td className="py-2 pr-3 text-stone-600">{e.plan || "—"}</td>
                    <td className="py-2 pr-3"><CicloBadge ciclo={e.ciclo_cobro} /></td>
                    <td className="py-2 pr-3 text-right tabular-nums">{fmtMoneda(e.cuota, m)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-emerald-700">{fmtMoneda(valorMensual(e), m)}</td>
                    <td className="py-2 pr-3 tabular-nums text-stone-600">{fmtFecha(inicioSuscripcion(e))}</td>
                    <td className="py-2 pr-3 text-stone-600 whitespace-nowrap">{e.ciclo_cobro === "anual" ? "cada año" : `día ${e.dia_cobro ?? "—"}`}</td>
                    <td className="py-2 pr-3 tabular-nums text-stone-600">{fmtFecha(e.fecha_proximo_pago)}</td>
                    <td className="py-2">{e.estado === "pago_pendiente" ? <Etiqueta tono="amarillo">Pago pendiente</Etiqueta> : <CobroBadge estado={e.estado_cobro} />}</td>
                  </TrLink>
                ))}
                <tr className="border-t-2 border-stone-300 font-semibold">
                  <td className="py-2 pr-3" colSpan={4}>Total ({vigentes.length})</td>
                  <td className="py-2 pr-3 text-right tabular-nums text-emerald-700">{fmtMoneda(r.mrr, m)}</td>
                  <td colSpan={4} />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
