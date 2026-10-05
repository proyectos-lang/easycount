import { datosGestion } from "../datos"
import { leerMes } from "@/lib/gestion/mes"
import { NOMBRES_MES, etiquetaMes, serieReportes, resumenPublicidad } from "@/lib/gestion/calculos"
import { ETIQUETA_COBRO, ETIQUETA_ESTADO, ETIQUETA_MOTIVO, ETIQUETA_PLATAFORMA, costoPor, esClienteVigente, sumarDias, type MotivoPerdida } from "@/lib/gestion/reglas"
import { ExportarReporte, type FilaReporte } from "../_components/reportes-export"
import { fmtMoneda, fmtNum, fmtPct } from "../_components/ui"

export const dynamic = "force-dynamic"

const mesLargo = (clave: string) => `${NOMBRES_MES[Number(clave.slice(5, 7)) - 1]} ${clave.slice(0, 4)}`

export default async function ReportesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const datos = await datosGestion()
  if (!datos.data) return null
  const d = datos.data
  const sel = leerMes(sp.mes, d.hoy)
  const m = d.config.moneda
  const serie = serieReportes({ empresas: d.empresas, pagos: d.pagos, gastos: d.gastos, anio: sel.anio, mes: sel.mes, meses: 12 })
  const clientes = d.empresas.filter((e) => esClienteVigente(e.estado))
  const hace12 = sumarDias(d.hoy, -365)

  // Conversión por mes: empresas creadas en el mes vs cuántas de ellas hoy son clientes.
  const conversion = serie.map((s) => {
    const creadas = d.empresas.filter((e) => e.created_at.slice(0, 7) === s.mes)
    const convertidas = creadas.filter((e) => esClienteVigente(e.estado)).length
    return { mes: s.mes, creadas: creadas.length, convertidas, tasa: creadas.length ? convertidas / creadas.length : null }
  })
  const totCreadas = conversion.reduce((a, c) => a + c.creadas, 0), totConv = conversion.reduce((a, c) => a + c.convertidas, 0)
  const motivos = d.reuniones.filter((r) => r.resultado === "no_interesado" && r.motivo_perdida && r.fecha >= hace12).reduce<Record<string, number>>((acc, r) => { acc[r.motivo_perdida!] = (acc[r.motivo_perdida!] || 0) + 1; return acc }, {})
  const pub = resumenPublicidad(d.campanas)

  const empresaFila = (e: (typeof d.empresas)[number]): FilaReporte => ({ Empresa: e.nombre, Dueño: e.dueno, Teléfono: e.telefono, Plan: e.plan, Cuota: e.cuota, Ciclo: e.ciclo_cobro, "Próximo pago": e.fecha_proximo_pago, "Último pago": e.ultimo_pago, Cobro: ETIQUETA_COBRO[e.estado_cobro], Estado: ETIQUETA_ESTADO[e.estado] })

  const tarjetas: { titulo: string; valor: string; sub: string; archivo: string; filas: FilaReporte[] }[] = [
    { titulo: "Clientes activos", valor: fmtNum(clientes.length), sub: "vigentes hoy (activos + pago pendiente)", archivo: "clientes-activos", filas: clientes.map(empresaFila) },
    { titulo: "Nuevos clientes por mes", valor: fmtNum(serie.reduce((a, s) => a + s.nuevos, 0)), sub: "últimos 12 meses", archivo: "nuevos-por-mes", filas: serie.map((s) => ({ Mes: mesLargo(s.mes), "Nuevos clientes": s.nuevos })) },
    { titulo: "Cancelados", valor: fmtNum(d.empresas.filter((e) => e.estado === "cancelado").length), sub: "clientes y prospectos perdidos", archivo: "cancelados", filas: d.empresas.filter((e) => e.estado === "cancelado").map((e) => ({ Empresa: e.nombre, Dueño: e.dueno, Motivo: e.motivo_perdida ? ETIQUETA_MOTIVO[e.motivo_perdida] : null, "Último pago": e.ultimo_pago, "Creada": e.created_at.slice(0, 10) })) },
    { titulo: "Ingresos", valor: fmtMoneda(serie.reduce((a, s) => a + s.ingresos, 0), m), sub: "últimos 12 meses", archivo: "ingresos", filas: serie.map((s) => ({ Mes: mesLargo(s.mes), Ingresos: s.ingresos })) },
    { titulo: "Gastos", valor: fmtMoneda(serie.reduce((a, s) => a + s.gastos, 0), m), sub: "últimos 12 meses", archivo: "gastos", filas: serie.map((s) => ({ Mes: mesLargo(s.mes), Gastos: s.gastos })) },
    { titulo: "Utilidad", valor: fmtMoneda(serie.reduce((a, s) => a + s.utilidad, 0), m), sub: "ingresos − gastos, 12 meses", archivo: "utilidad", filas: serie.map((s) => ({ Mes: mesLargo(s.mes), Ingresos: s.ingresos, Gastos: s.gastos, Utilidad: s.utilidad, Margen: s.ingresos ? Math.round((s.utilidad / s.ingresos) * 1000) / 10 : null })) },
    { titulo: "Pagos pendientes", valor: fmtNum(clientes.filter((e) => e.estado_cobro === "pendiente" || e.estado_cobro === "proximo").length), sub: "vencen este mes o en 7 días", archivo: "pagos-pendientes", filas: clientes.filter((e) => e.estado_cobro === "pendiente" || e.estado_cobro === "proximo").map(empresaFila) },
    { titulo: "Pagos atrasados", valor: fmtNum(clientes.filter((e) => e.estado_cobro === "atrasado").length), sub: "fecha vencida sin pago", archivo: "pagos-atrasados", filas: clientes.filter((e) => e.estado_cobro === "atrasado").map(empresaFila) },
    { titulo: "Prospectos convertidos", valor: fmtNum(totConv), sub: `de ${totCreadas} creados en 12 meses`, archivo: "prospectos-convertidos", filas: d.empresas.filter((e) => esClienteVigente(e.estado) && e.created_at.slice(0, 10) >= hace12).map((e) => ({ Empresa: e.nombre, Creada: e.created_at.slice(0, 10), Instalación: e.fecha_instalacion, Plan: e.plan, Cuota: e.cuota })) },
    { titulo: "Tasa de conversión", valor: fmtPct(totCreadas ? totConv / totCreadas : null), sub: "convertidos ÷ creados, por mes", archivo: "tasa-conversion", filas: conversion.map((c) => ({ Mes: mesLargo(c.mes), Creados: c.creadas, Convertidos: c.convertidas, "Tasa %": c.tasa == null ? null : Math.round(c.tasa * 1000) / 10 })) },
    { titulo: "Motivos de pérdida", valor: fmtNum(Object.values(motivos).reduce((a, b) => a + b, 0)), sub: "reuniones «no interesado», 12 meses", archivo: "motivos-perdida", filas: Object.entries(motivos).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ Motivo: ETIQUETA_MOTIVO[k as MotivoPerdida] ?? k, Total: v })) },
    { titulo: "Publicidad vs clientes", valor: pub.costoCliente == null ? "—" : fmtMoneda(pub.costoCliente, m), sub: `costo por cliente · ${fmtMoneda(pub.invertido, m)} invertidos`, archivo: "publicidad-vs-clientes", filas: d.campanas.map((c) => ({ Campaña: c.nombre, Plataforma: ETIQUETA_PLATAFORMA[c.plataforma] ?? c.plataforma, Inicio: c.fecha_inicio, Fin: c.fecha_fin, Invertido: c.monto_invertido, Prospectos: c.prospectos_generados, Reuniones: c.reuniones_generadas, Clientes: c.clientes_obtenidos, "Costo por cliente": costoPor(c.monto_invertido, c.clientes_obtenidos) })) },
  ]

  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-500">Series hasta <span className="font-medium text-stone-800">{etiquetaMes(sel.anio, sel.mes)}</span>. Cada tarjeta se exporta a Excel (.xlsx) o PDF.</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tarjetas.map((t) => (
          <div key={t.archivo} className="flex flex-col justify-between rounded-xl border bg-white p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{t.titulo}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-stone-800">{t.valor}</p>
              <p className="text-[11px] text-stone-400">{t.sub} · {t.filas.length} fila{t.filas.length === 1 ? "" : "s"}</p>
            </div>
            <div className="mt-3"><ExportarReporte titulo={t.titulo} archivo={`gestion-${t.archivo}`} filas={t.filas} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}
