"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts"

/** Ingresos vs gastos (6 meses); el mes seleccionado va resaltado. */
export function GraficaIngresosGastos({ serie, moneda }: { serie: { etiqueta: string; ingresos: number; gastos: number; seleccionado: boolean }[]; moneda: string }) {
  const f = (n: number) => `${moneda} ${Number(n || 0).toLocaleString("es-HN", { maximumFractionDigits: 0 })}`
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={serie} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
          <XAxis dataKey="etiqueta" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} width={64} tickFormatter={(v) => Number(v).toLocaleString("es-HN", { notation: "compact" })} />
          <Tooltip formatter={(v) => f(Number(v))} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="ingresos" name="Ingresos" radius={[4, 4, 0, 0]}>
            {serie.map((s, i) => <Cell key={i} fill={s.seleccionado ? "#059669" : "#a7f3d0"} />)}
          </Bar>
          <Bar dataKey="gastos" name="Gastos" radius={[4, 4, 0, 0]}>
            {serie.map((s, i) => <Cell key={i} fill={s.seleccionado ? "#dc2626" : "#fecaca"} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
