"use client"

import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ReferenceLine } from "recharts"
import { NOMBRES_MES } from "@/lib/gestion/calculos"
import type { PuntoCrecimiento } from "@/lib/gestion/suscripciones"

/**
 * Curva de crecimiento de las suscripciones: barras = lo que toca cobrar en el
 * mes (mensuales + anuales en su aniversario; los meses futuros son
 * proyección y van más claros), línea verde = valor recurrente mensual (MRR),
 * línea gris punteada = lo realmente cobrado.
 */
export function GraficaCrecimiento({ puntos, moneda, mesSeleccionado }: { puntos: PuntoCrecimiento[]; moneda: string; mesSeleccionado: string }) {
  const data = puntos.map((p) => ({ ...p, etiqueta: `${NOMBRES_MES[Number(p.mes.slice(5, 7)) - 1].slice(0, 3)} ${p.mes.slice(2, 4)}`, cobrado: p.proyeccion ? null : p.cobrado }))
  const f = (n: number) => `${moneda} ${Number(n || 0).toLocaleString("es-HN", { maximumFractionDigits: 0 })}`
  const sel = data.find((p) => p.mes === mesSeleccionado)?.etiqueta
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
          <XAxis dataKey="etiqueta" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} width={64} tickFormatter={(v) => Number(v).toLocaleString("es-HN", { notation: "compact" })} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(v, name) => [v == null ? "—" : f(Number(v)), name]}
            labelFormatter={(l, payload) => {
              const p = payload?.[0]?.payload as (PuntoCrecimiento & { etiqueta: string }) | undefined
              return p ? `${l}${p.proyeccion ? " (proyección)" : ""} · ${p.suscripciones} suscripción(es)${p.nuevas ? `, ${p.nuevas} nueva(s)` : ""}` : String(l)
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {sel && <ReferenceLine x={sel} stroke="#a8a29e" strokeDasharray="4 4" />}
          <Bar dataKey="esperado" name="A cobrar en el mes" radius={[4, 4, 0, 0]}>
            {data.map((p, i) => <Cell key={i} fill={p.proyeccion ? "#fde68a" : p.mes === mesSeleccionado ? "#d97706" : "#fbbf24"} />)}
          </Bar>
          <Line type="monotone" dataKey="mrr" name="Valor recurrente mensual (MRR)" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="cobrado" name="Cobrado real" stroke="#57534e" strokeWidth={1.5} strokeDasharray="5 4" dot={{ r: 2 }} connectNulls={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
