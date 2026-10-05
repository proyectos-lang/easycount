import { datosGestion } from "../datos"
import { leerMes, claveMes } from "@/lib/gestion/mes"
import { NOMBRES_MES, etiquetaMes } from "@/lib/gestion/calculos"
import { liquidacionMes, repartoPorcentajes, saldoSocios, serieLiquidaciones } from "@/lib/gestion/socios"
import { BotonEditarSocio, EliminarLiquidacion, EliminarSocio, LiquidarSocio, SocioForm } from "../_components/socios-ui"
import { ExportarReporte } from "../_components/reportes-export"
import { Etiqueta, Kpi, Panel, Pendiente, Vacio, fmtFecha, fmtMoneda } from "../_components/ui"

export const dynamic = "force-dynamic"

const mesCorto = (k: string) => `${NOMBRES_MES[Number(k.slice(5, 7)) - 1].slice(0, 3)} ${k.slice(2, 4)}`

export default async function SociosPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const datos = await datosGestion()
  if (!datos.data) return null
  const d = datos.data
  if (d.sociosPendiente) return <Pendiente error={d.sociosPendiente} />
  const sel = leerMes(sp.mes, d.hoy)
  const m = d.config.moneda
  const ingresos = d.pagos.map((p) => ({ fecha: p.fecha, monto: p.monto }))
  const gastos = d.gastos.map((g) => ({ fecha: g.fecha, monto: g.monto, socio_id: g.socio_id }))
  const reparto = repartoPorcentajes(d.socios)
  const mes = liquidacionMes({ anio: sel.anio, mes: sel.mes, ingresos, gastos, socios: d.socios })
  const serie = serieLiquidaciones({ anio: sel.anio, mes: sel.mes, meses: 12, ingresos, gastos, socios: d.socios })
  const saldos = saldoSocios({ anio: sel.anio, mes: sel.mes, ingresos, gastos, socios: d.socios, pagos: d.liquidaciones })
  const saldoDe = new Map(saldos.map((s) => [s.socio_id, s]))
  const nombre = new Map(d.socios.map((s) => [s.id, s.nombre]))
  const cuentaNombre = new Map(d.cuentas.map((c) => [c.id, c.nombre]))
  const conMov = d.socios.filter((s) => s.activo || serie.some((l) => l.socios.some((f) => f.socio_id === s.id)))

  const filasExport = serie.flatMap((l) => l.socios.map((f) => ({ Mes: l.mes, Socio: f.nombre, "% participación": f.porcentaje, "Utilidad del mes": l.utilidad, Participación: f.participacion, "Reembolso de gastos": f.reembolso, "A liquidar": f.total })))

  return (
    <div className="space-y-4">
      {!reparto.valido && <Pendiente error={`Los socios activos suman ${reparto.totalSocios}%: no puede pasar de 100%. Ajusta los porcentajes.`} />}

      {/* Socios y reparto */}
      <Panel titulo="Socios" descripcion={`Los socios activos suman ${reparto.totalSocios}%; EasyCount se queda con ${reparto.easycount}% de la utilidad.`} accion={<SocioForm disponible={Math.max(0, reparto.easycount)} />}>
        {d.socios.length === 0 ? <Vacio titulo="Sin socios" texto="Crea los socios con su % de participación." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wide text-stone-500">
                <tr><th className="py-1.5 pr-3 font-medium">Socio</th><th className="py-1.5 pr-3 text-right font-medium">% participación</th><th className="py-1.5 pr-3 text-right font-medium">Devengado acumulado</th><th className="py-1.5 pr-3 text-right font-medium">Pagado</th><th className="py-1.5 pr-3 text-right font-medium">Saldo por liquidar</th><th className="py-1.5"></th></tr>
              </thead>
              <tbody>
                {d.socios.map((s) => {
                  const sa = saldoDe.get(s.id)
                  return (
                    <tr key={s.id} className="border-t">
                      <td className="py-2 pr-3"><span className="font-medium text-stone-800">{s.nombre}</span> {!s.activo && <Etiqueta tono="gris">Inactivo</Etiqueta>}{s.correo && <span className="block text-[11px] text-stone-400">{s.correo}</span>}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{s.porcentaje}%</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmtMoneda(sa?.devengado ?? 0, m)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums text-stone-600">{fmtMoneda(sa?.pagado ?? 0, m)}</td>
                      <td className={`py-2 pr-3 text-right tabular-nums font-semibold ${(sa?.saldo ?? 0) < 0 ? "text-red-700" : "text-emerald-700"}`}>{fmtMoneda(sa?.saldo ?? 0, m)}</td>
                      <td className="py-2 whitespace-nowrap text-right">
                        <LiquidarSocio socio={s} saldo={Math.max(0, sa?.saldo ?? 0)} periodo={claveMes(sel)} hoy={d.hoy} cuentas={d.cuentas} moneda={m} />
                        <BotonEditarSocio socio={s} disponible={Math.max(0, reparto.easycount)} />
                        <EliminarSocio id={s.id} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="mt-2 text-[11px] text-stone-400">Saldo acumulado hasta el fin de {etiquetaMes(sel.anio, sel.mes)}: lo devengado mes a mes menos lo ya liquidado.</p>
          </div>
        )}
      </Panel>

      {/* Liquidación del mes seleccionado */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label={`Ingresos · ${etiquetaMes(sel.anio, sel.mes)}`} value={fmtMoneda(mes.ingresos, m)} tono="verde" />
        <Kpi label="Gastos de EasyCount" value={fmtMoneda(mes.gastosEasycount, m)} tono="rojo" />
        <Kpi label="Gastos asumidos por socios" value={fmtMoneda(mes.gastosSocios, m)} tono="amarillo" sub="salen del pool y se reembolsan" />
        <Kpi label="Utilidad a repartir" value={fmtMoneda(mes.utilidad, m)} tono={mes.utilidad >= 0 ? "verde" : "rojo"} />
      </div>
      <Panel titulo={`Liquidación de ${etiquetaMes(sel.anio, sel.mes)}`} descripcion="Participación = % × utilidad (ingresos − todos los gastos). A liquidar = participación + gastos que pagó el socio.">
        {mes.socios.length === 0 && mes.utilidad === 0 ? <Vacio titulo="Sin movimientos en el mes" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wide text-stone-500">
                <tr><th className="py-1.5 pr-3 font-medium">Socio</th><th className="py-1.5 pr-3 text-right font-medium">%</th><th className="py-1.5 pr-3 text-right font-medium">Participación</th><th className="py-1.5 pr-3 text-right font-medium">Reembolso de gastos</th><th className="py-1.5 text-right font-medium">A liquidar</th></tr>
              </thead>
              <tbody>
                {mes.socios.map((f) => (
                  <tr key={f.socio_id} className="border-t">
                    <td className="py-2 pr-3 font-medium text-stone-800">{f.nombre}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{f.porcentaje}%</td>
                    <td className={`py-2 pr-3 text-right tabular-nums ${f.participacion < 0 ? "text-red-700" : ""}`}>{fmtMoneda(f.participacion, m)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-amber-800">{f.reembolso ? fmtMoneda(f.reembolso, m) : "—"}</td>
                    <td className="py-2 text-right tabular-nums font-semibold">{fmtMoneda(f.total, m)}</td>
                  </tr>
                ))}
                <tr className="border-t bg-stone-50">
                  <td className="py-2 pr-3 font-medium text-stone-600">EasyCount (queda en la empresa)</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{mes.easycountPorcentaje}%</td>
                  <td className={`py-2 pr-3 text-right tabular-nums ${mes.easycountParticipacion < 0 ? "text-red-700" : ""}`}>{fmtMoneda(mes.easycountParticipacion, m)}</td>
                  <td className="py-2 pr-3 text-right">—</td>
                  <td className="py-2 text-right tabular-nums font-semibold">{fmtMoneda(mes.easycountParticipacion, m)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Acumulado por mes */}
      <Panel titulo="Acumulado por mes" descripcion={`12 meses hasta ${etiquetaMes(sel.anio, sel.mes)}: lo que se le devenga a cada socio por mes.`} accion={<ExportarReporte titulo="Liquidación de socios" archivo="gestion-liquidacion-socios" filas={filasExport} />}>
        {conMov.length === 0 ? <Vacio titulo="Sin socios" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wide text-stone-500">
                <tr><th className="py-1.5 pr-3 font-medium">Mes</th><th className="py-1.5 pr-3 text-right font-medium">Utilidad</th>{conMov.map((s) => <th key={s.id} className="py-1.5 pr-3 text-right font-medium">{s.nombre}</th>)}<th className="py-1.5 text-right font-medium">EasyCount</th></tr>
              </thead>
              <tbody>
                {serie.map((l) => (
                  <tr key={l.mes} className="border-t">
                    <td className="py-2 pr-3 whitespace-nowrap">{mesCorto(l.mes)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-stone-600">{fmtMoneda(l.utilidad, m)}</td>
                    {conMov.map((s) => <td key={s.id} className="py-2 pr-3 text-right tabular-nums">{fmtMoneda(l.socios.find((f) => f.socio_id === s.id)?.total ?? 0, m)}</td>)}
                    <td className="py-2 text-right tabular-nums text-stone-600">{fmtMoneda(l.easycountParticipacion, m)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Liquidaciones pagadas */}
      <Panel titulo="Liquidaciones pagadas">
        {d.liquidaciones.length === 0 ? <Vacio titulo="Aún no se ha liquidado a ningún socio" texto="Usa «Liquidar» en la tabla de socios." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wide text-stone-500">
                <tr><th className="py-1.5 pr-3 font-medium">Fecha</th><th className="py-1.5 pr-3 font-medium">Socio</th><th className="py-1.5 pr-3 font-medium">Período</th><th className="py-1.5 pr-3 font-medium">Cuenta</th><th className="py-1.5 pr-3 font-medium">Notas</th><th className="py-1.5 pr-3 text-right font-medium">Monto</th><th className="py-1.5"></th></tr>
              </thead>
              <tbody>
                {d.liquidaciones.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="py-2 pr-3 tabular-nums">{fmtFecha(l.fecha)}</td>
                    <td className="py-2 pr-3 font-medium text-stone-800">{nombre.get(l.socio_id) ?? `Socio #${l.socio_id}`}</td>
                    <td className="py-2 pr-3 text-stone-600">{l.periodo ? mesCorto(l.periodo) : "—"}</td>
                    <td className="py-2 pr-3 text-stone-600">{l.cuenta_id ? cuentaNombre.get(l.cuenta_id) ?? "—" : "—"}</td>
                    <td className="py-2 pr-3 text-xs text-stone-500">{l.notas || "—"}</td>
                    <td className="py-2 pr-3 text-right tabular-nums font-medium">{fmtMoneda(l.monto, m)}</td>
                    <td className="py-2 text-right"><EliminarLiquidacion id={l.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
