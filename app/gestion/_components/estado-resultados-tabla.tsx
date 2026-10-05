// Tabla del estado de resultados MES A MES (Server Component): conceptos en
// filas, un mes por columna y una columna Total. La participación de socios va
// después de la utilidad bruta; al final, la liquidación de cada socio.
import { cn } from "@/lib/utils"
import { NOMBRES_MES } from "@/lib/gestion/calculos"
import type { ColumnaEstado } from "@/lib/gestion/socios"
import { ExportarReporte, type FilaReporte } from "./reportes-export"
import { Panel, fmtMoneda, fmtPct } from "./ui"

const etiquetaCol = (mes: string) => (mes === "total" ? "Total" : `${NOMBRES_MES[Number(mes.slice(5, 7)) - 1].slice(0, 3)} ${mes.slice(2, 4)}`)

type Fila = { concepto: string; valor: (c: ColumnaEstado) => number | null; estilo?: "total" | "neta" | "resta" | "sub" | "seccion"; formato?: "moneda" | "pct" }

export function EstadoResultadosTabla({ columnas, total, moneda, titulo }: { columnas: ColumnaEstado[]; total: ColumnaEstado; moneda: string; titulo: string }) {
  const cols = [...columnas, total]
  const socios = total.socios

  const filas: Fila[] = [
    { concepto: "Ingresos", valor: (c) => c.ingresos },
    { concepto: "(−) Gastos", valor: (c) => c.gastos, estilo: "resta" },
    { concepto: "Utilidad bruta", valor: (c) => c.utilidadBruta, estilo: "total" },
    { concepto: "Margen bruto", valor: (c) => c.margenBruto, estilo: "sub", formato: "pct" },
    ...socios.map((s, i): Fila => ({ concepto: `(−) Participación ${s.nombre}${s.porcentaje ? ` (${s.porcentaje}%)` : ""}`, valor: (c) => c.socios[i]?.participacion ?? 0, estilo: "resta" })),
    { concepto: "Total participación socios", valor: (c) => c.participacionSocios, estilo: "sub" },
    { concepto: "Utilidad neta (EasyCount)", valor: (c) => c.utilidadNeta, estilo: "neta" },
    { concepto: "Margen neto", valor: (c) => c.margenNeto, estilo: "sub", formato: "pct" },
  ]
  const filasLiquidacion: Fila[] = socios.flatMap((s, i): Fila[] => [
    { concepto: s.nombre, valor: () => 0, estilo: "seccion" },
    { concepto: "Participación", valor: (c) => c.socios[i]?.participacion ?? 0, estilo: "sub" },
    { concepto: "(+) Reembolso de gastos que pagó", valor: (c) => c.socios[i]?.reembolso ?? 0, estilo: "sub" },
    { concepto: `A liquidar a ${s.nombre}`, valor: (c) => c.socios[i]?.liquidacion ?? 0, estilo: "total" },
  ])

  // Exportación: una fila por concepto, una columna por mes + Total.
  const exportar: FilaReporte[] = [...filas, ...filasLiquidacion.filter((f) => f.estilo !== "seccion").map((f, k) => ({ ...f, concepto: f.estilo === "total" ? f.concepto : `${socios[Math.floor(k / 3)]?.nombre ?? ""} · ${f.concepto}` }))].map((f) => {
    const fila: FilaReporte = { Concepto: f.concepto }
    for (const c of cols) {
      const v = f.valor(c)
      fila[etiquetaCol(c.mes)] = v == null ? null : f.formato === "pct" ? Math.round(v * 1000) / 10 : v
    }
    return fila
  })

  return (
    <Panel titulo={titulo} descripcion="Ingresos − Gastos = Utilidad bruta − Participación de cada socio = Utilidad neta (lo que le queda a EasyCount)." accion={<ExportarReporte titulo="Estado de resultados" archivo="gestion-estado-resultados" filas={exportar} />}>
      <div className="overflow-x-auto"><TablaEstado rows={filas} cols={cols} moneda={moneda} /></div>
      {socios.length > 0 && (
        <>
          <h3 className="mt-6 mb-1 text-sm font-semibold text-stone-800">Liquidación de cada socio</h3>
          <p className="mb-2 text-xs text-stone-500">Lo que se le debe a cada socio por mes: su participación más el reembolso de los gastos que pagó de su bolsa (esos gastos ya están restados arriba, en «Gastos»).</p>
          <div className="overflow-x-auto"><TablaEstado rows={filasLiquidacion} cols={cols} moneda={moneda} cabecera="Socio" /></div>
        </>
      )}
    </Panel>
  )
}

function fmtValor(f: Fila, v: number | null, moneda: string): string {
  return f.formato === "pct" ? fmtPct(v) : v == null ? "—" : fmtMoneda(v, moneda)
}
function colorValor(f: Fila, v: number | null): string {
  if (f.estilo === "neta" || f.estilo === "total") return v != null && v < 0 ? "text-red-700" : "text-emerald-700"
  return f.estilo === "resta" && v ? "text-stone-700" : ""
}

function TablaEstado({ rows, cols, moneda, cabecera }: { rows: Fila[]; cols: ColumnaEstado[]; moneda: string; cabecera?: string }) {
  return (
    <table className="w-full min-w-max text-sm">
      <thead className="text-[11px] uppercase tracking-wide text-stone-500">
        <tr className="border-b">
          <th className="sticky left-0 z-10 bg-white py-2 pr-4 text-left font-medium">{cabecera ?? "Concepto"}</th>
          {cols.map((c) => <th key={c.mes} className={cn("px-3 py-2 text-right font-medium whitespace-nowrap", c.mes === "total" && "bg-stone-50 text-stone-700")}>{etiquetaCol(c.mes)}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((f, k) => (
          <tr key={k} className={cn(f.estilo === "total" && "border-t-2 border-stone-300 font-semibold", f.estilo === "neta" && "border-t-2 border-stone-800 font-bold", f.estilo === "seccion" && "border-t")}>
            <td className={cn("sticky left-0 z-10 bg-white py-1.5 pr-4 whitespace-nowrap", f.estilo === "sub" && "pl-3 text-xs text-stone-500", f.estilo === "seccion" && "pt-3 text-xs font-semibold uppercase tracking-wide text-stone-600")}>{f.concepto}</td>
            {cols.map((c) => {
              if (f.estilo === "seccion") return <td key={c.mes} className={cn(c.mes === "total" && "bg-stone-50")} />
              const v = f.valor(c)
              return (
                <td key={c.mes} className={cn("px-3 py-1.5 text-right tabular-nums whitespace-nowrap", f.estilo === "sub" && "text-xs text-stone-500", colorValor(f, v), c.mes === "total" && "bg-stone-50")}>
                  {f.estilo === "resta" && v ? `− ${fmtValor(f, v, moneda)}` : fmtValor(f, v, moneda)}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
