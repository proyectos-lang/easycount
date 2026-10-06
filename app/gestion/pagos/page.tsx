import Link from "next/link"
import { datosGestion } from "../datos"
import { leerMes } from "@/lib/gestion/mes"
import { adeudoCliente, etiquetaMes, mesISO, resumenPagos } from "@/lib/gestion/calculos"
import { ETIQUETA_METODO, esClienteVigente } from "@/lib/gestion/reglas"
import { TrLink } from "../_components/tr-link"
import { Chips, CicloBadge, CobroBadge, Kpi, Panel, Vacio, fmtFecha, fmtMoneda, fmtNum } from "../_components/ui"
import { EliminarPago } from "../_components/perfil-acciones"

export const dynamic = "force-dynamic"

export default async function PagosPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const datos = await datosGestion()
  if (!datos.data) return null
  const d = datos.data
  const sel = leerMes(sp.mes, d.hoy)
  const filtro = String(sp.filtro ?? "mes")
  const m = d.config.moneda
  const k = resumenPagos(d.empresas, d.pagos, sel.anio, sel.mes, d.hoy)
  const clave = mesISO(sel.anio, sel.mes)

  const clientes = d.empresas.filter((e) => esClienteVigente(e.estado))
  const adeudo = new Map(clientes.map((e) => [e.id, adeudoCliente(e, d.hoy, sel.anio, sel.mes)]))
  const ultimoPagoPorEmpresa = new Map<number, (typeof d.pagos)[number]>()
  for (const p of d.pagos) if (!ultimoPagoPorEmpresa.has(p.empresa_id)) ultimoPagoPorEmpresa.set(p.empresa_id, p)

  const FILTROS = [
    // Este mes: quien debe algo hasta fin de mes (también lo atrasado de meses
    // anteriores) o quien pagó en el mes.
    { clave: "mes", label: "Este mes", fn: (e: (typeof clientes)[number]) => (adeudo.get(e.id)?.fechas.length ?? 0) > 0 || d.pagos.some((p) => p.empresa_id === e.id && p.fecha.startsWith(clave)) },
    { clave: "pagados", label: "Pagados", fn: (e: (typeof clientes)[number]) => e.estado_cobro === "pagado" },
    { clave: "pendientes", label: "Pendientes", fn: (e: (typeof clientes)[number]) => e.estado_cobro === "pendiente" || e.estado_cobro === "proximo" },
    { clave: "atrasados", label: "Atrasados", fn: (e: (typeof clientes)[number]) => e.estado_cobro === "atrasado" },
    { clave: "todos", label: "Todos", fn: () => true },
  ]
  const f = FILTROS.find((x) => x.clave === filtro) ?? FILTROS[0]
  const orden = { atrasado: 0, pendiente: 1, proximo: 2, pagado: 3 }
  const lista = clientes.filter(f.fn).sort((a, b) => orden[a.estado_cobro] - orden[b.estado_cobro] || String(a.fecha_proximo_pago || "").localeCompare(String(b.fecha_proximo_pago || "")))
  const pagosMes = d.pagos.filter((p) => p.fecha.startsWith(clave))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label={`Cobrado · ${etiquetaMes(sel.anio, sel.mes)}`} value={fmtMoneda(k.cobrado, m)} tono="verde" />
        <Kpi label="Por cobrar" value={fmtMoneda(k.porCobrar, m)} tono="amarillo" sub="cuotas que vencen hasta fin de mes" />
        <Kpi label="Atrasado" value={fmtMoneda(k.atrasado, m)} tono={k.atrasado > 0 ? "rojo" : undefined} sub={k.clientesAtrasados ? `${k.clientesAtrasados} cliente(s) con cuotas vencidas` : "nada vencido"} />
        <Kpi label="Pagos registrados" value={fmtNum(k.cantidad)} sub="en el mes" />
      </div>

      <Chips items={FILTROS.map((x) => ({ href: `/gestion/pagos?filtro=${x.clave}&mes=${clave}`, label: x.label, activo: x.clave === f.clave, count: clientes.filter(x.fn).length }))} />

      <Panel titulo="Cobros por cliente" descripcion="Estado del cobro de cada cliente vigente (derivado de su próximo pago y sus pagos).">
        {lista.length === 0 ? <Vacio titulo="Sin clientes en este filtro" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="py-1.5 pr-3 font-medium">Empresa</th><th className="py-1.5 pr-3 text-right font-medium">Cuota</th><th className="py-1.5 pr-3 font-medium">Ciclo · cobro</th>
                  <th className="py-1.5 pr-3 font-medium">Último pago</th><th className="py-1.5 pr-3 font-medium">Próximo pago</th><th className="py-1.5 pr-3 text-right font-medium">Adeuda</th><th className="py-1.5 pr-3 font-medium">Cuenta</th><th className="py-1.5 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((e) => {
                  const up = ultimoPagoPorEmpresa.get(e.id)
                  return (
                    <TrLink key={e.id} href={`/gestion/empresas/${e.id}`}>
                      <td className="py-2 pr-3 font-medium text-stone-800">{e.nombre}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmtMoneda(e.cuota, e.moneda || m)}</td>
                      <td className="py-2 pr-3 whitespace-nowrap"><CicloBadge ciclo={e.ciclo_cobro} /> <span className="text-xs text-stone-500">{e.ciclo_cobro === "mensual" ? `día ${e.dia_cobro ?? "—"}` : fmtFecha(e.fecha_proximo_pago)}</span></td>
                      <td className="py-2 pr-3 tabular-nums text-stone-600">{fmtFecha(e.ultimo_pago)}</td>
                      <td className="py-2 pr-3 tabular-nums text-stone-600">{fmtFecha(e.fecha_proximo_pago)}</td>
                      <td className="py-2 pr-3 text-right whitespace-nowrap"><Adeudo a={adeudo.get(e.id)} moneda={e.moneda || m} /></td>
                      <td className="py-2 pr-3 text-stone-600">{up?.cuenta_nombre || "—"}</td>
                      <td className="py-2"><CobroBadge estado={e.estado_cobro} /></td>
                    </TrLink>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel titulo={`Pagos registrados · ${etiquetaMes(sel.anio, sel.mes)}`}>
        {pagosMes.length === 0 ? <Vacio titulo="Sin pagos registrados en el mes" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wide text-stone-500">
                <tr><th className="py-1.5 pr-3 font-medium">Fecha</th><th className="py-1.5 pr-3 font-medium">Empresa</th><th className="py-1.5 pr-3 font-medium">Método</th><th className="py-1.5 pr-3 font-medium">Cuenta</th><th className="py-1.5 pr-3 font-medium">Referencia</th><th className="py-1.5 pr-3 text-right font-medium">Monto</th><th className="py-1.5"></th></tr>
              </thead>
              <tbody>
                {pagosMes.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="py-2 pr-3 tabular-nums">{fmtFecha(p.fecha)}</td>
                    <td className="py-2 pr-3"><Link href={`/gestion/empresas/${p.empresa_id}`} className="font-medium text-stone-800 hover:underline">{p.empresa_nombre}</Link></td>
                    <td className="py-2 pr-3">{ETIQUETA_METODO[p.metodo]}</td>
                    <td className="py-2 pr-3">{p.cuenta_nombre || "—"}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{p.referencia || "—"}</td>
                    <td className="py-2 pr-3 text-right tabular-nums font-medium">{fmtMoneda(p.monto, m)}</td>
                    <td className="py-2 text-right"><EliminarPago pagoId={p.id} /></td>
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

/** Cuotas que debe el cliente hasta fin de mes (rojo si alguna ya venció). */
function Adeudo({ a, moneda }: { a: ReturnType<typeof adeudoCliente> | undefined; moneda: string }) {
  if (!a || a.fechas.length === 0) return <span className="text-xs text-stone-400">—</span>
  const n = a.fechas.length, v = a.vencidos.length
  return (
    <span className={v ? "text-red-700" : "text-amber-700"} title={a.fechas.map((x) => fmtFecha(x)).join(", ")}>
      <span className="tabular-nums font-semibold">{fmtMoneda(a.total, moneda)}</span>
      <span className="block text-[10px]">{n} cuota{n === 1 ? "" : "s"}{v ? ` · ${v} vencida${v === 1 ? "" : "s"}` : ""}</span>
    </span>
  )
}
