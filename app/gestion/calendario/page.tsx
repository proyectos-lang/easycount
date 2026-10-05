import Link from "next/link"
import { datosGestion } from "../datos"
import { leerMes } from "@/lib/gestion/mes"
import { etiquetaMes, mesISO } from "@/lib/gestion/calculos"
import { esClienteVigente, ultimoDiaMes } from "@/lib/gestion/reglas"
import { cn } from "@/lib/utils"
import { fmtHora } from "../_components/ui"

export const dynamic = "force-dynamic"

type Evento = { tipo: "pago" | "prueba" | "reunion" | "atrasado"; texto: string; href: string }
const ESTILO: Record<Evento["tipo"], string> = {
  pago: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  prueba: "bg-sky-100 text-sky-800 hover:bg-sky-200",
  reunion: "bg-slate-800 text-white hover:bg-slate-700",
  atrasado: "bg-red-100 text-red-800 hover:bg-red-200",
}
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

export default async function CalendarioPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const datos = await datosGestion()
  if (!datos.data) return null
  const d = datos.data
  const sel = leerMes(sp.mes, d.hoy)
  const clave = mesISO(sel.anio, sel.mes)

  const eventos = new Map<string, Evento[]>()
  const add = (fecha: string | null | undefined, ev: Evento) => { if (fecha && fecha.startsWith(clave)) eventos.set(fecha, [...(eventos.get(fecha) || []), ev]) }
  for (const e of d.empresas) {
    if (esClienteVigente(e.estado) && e.fecha_proximo_pago) {
      add(e.fecha_proximo_pago, { tipo: e.fecha_proximo_pago < d.hoy ? "atrasado" : "pago", texto: `${e.nombre}`, href: `/gestion/empresas/${e.id}` })
    }
    if (e.estado === "prueba" && e.fin_prueba) add(e.fin_prueba, { tipo: "prueba", texto: `Fin prueba · ${e.nombre}`, href: `/gestion/empresas/${e.id}` })
  }
  for (const r of d.reuniones) add(r.fecha, { tipo: "reunion", texto: `${fmtHora(r.hora)} ${r.empresa_nombre || "Reunión"}`, href: `/gestion/reuniones?reunion=${r.id}` })

  const dias = ultimoDiaMes(sel.anio, sel.mes)
  const offset = (new Date(Date.UTC(sel.anio, sel.mes - 1, 1)).getUTCDay() + 6) % 7 // lunes = 0
  const celdas: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: dias }, (_, i) => i + 1)]
  while (celdas.length % 7 !== 0) celdas.push(null)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-stone-800">{etiquetaMes(sel.anio, sel.mes)}</h2>
        <div className="flex flex-wrap gap-2 text-[11px] text-stone-600">
          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-300" /> Pago</span>
          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-sky-300" /> Fin de prueba</span>
          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-slate-800" /> Reunión</span>
          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-red-300" /> Atrasado</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[720px] overflow-hidden rounded-xl border bg-white">
          <div className="grid grid-cols-7 border-b bg-stone-50 text-center text-[11px] font-medium uppercase tracking-wide text-stone-500">
            {DIAS.map((x) => <div key={x} className="py-2">{x}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {celdas.map((dia, i) => {
              const fecha = dia ? `${clave}-${String(dia).padStart(2, "0")}` : null
              const evs = fecha ? eventos.get(fecha) || [] : []
              const esHoy = fecha === d.hoy
              return (
                <div key={i} className={cn("min-h-[104px] border-b border-r p-1.5 [&:nth-child(7n)]:border-r-0", !dia && "bg-stone-50/60", esHoy && "bg-amber-50/60")}>
                  {dia && (
                    <>
                      <p className={cn("mb-1 text-xs font-semibold tabular-nums", esHoy ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-stone-800 text-white" : "text-stone-500")}>{dia}</p>
                      <div className="space-y-1">
                        {evs.slice(0, 4).map((ev, j) => (
                          <Link key={j} href={ev.href} className={cn("block truncate rounded px-1.5 py-0.5 text-[11px] font-medium", ESTILO[ev.tipo])} title={ev.texto}>{ev.texto}</Link>
                        ))}
                        {evs.length > 4 && <p className="text-[10px] text-stone-400">+{evs.length - 4} más</p>}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
