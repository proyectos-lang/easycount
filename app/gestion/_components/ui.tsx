// Piezas visuales compartidas del portal /gestion (sin hooks: sirven en
// Server y Client Components). Misma estética que el resto de EasyCount.
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  ETIQUETA_COBRO, ETIQUETA_ESTADO, ETIQUETA_ETAPA, type Ciclo, type EstadoCobro, type EstadoEmpresa, type EtapaPipeline,
} from "@/lib/gestion/reglas"

export const fmtMoneda = (n: number | null | undefined, moneda = "L") =>
  `${moneda} ${(Number(n) || 0).toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const fmtNum = (n: number | null | undefined) => (Number(n) || 0).toLocaleString("es-HN")
export const fmtPct = (p: number | null | undefined) => (p == null ? "—" : `${Math.round(p * 1000) / 10}%`)
export const fmtFecha = (iso?: string | null) => {
  if (!iso) return "—"
  const [y, m, d] = iso.slice(0, 10).split("-")
  return `${d}/${m}/${y}`
}
export const fmtFechaHora = (iso?: string | null) => {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString("es-HN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
  } catch { return iso }
}
export const fmtHora = (h?: string | null) => (h ? h.slice(0, 5) : "—")

/** Tonos de badge (verde / amarillo / rojo / azul / gris / morado). */
export type Tono = "verde" | "amarillo" | "rojo" | "azul" | "gris" | "morado"
const TONO: Record<Tono, string> = {
  verde: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amarillo: "bg-amber-50 text-amber-800 border-amber-200",
  rojo: "bg-red-50 text-red-700 border-red-200",
  azul: "bg-sky-50 text-sky-800 border-sky-200",
  gris: "bg-stone-100 text-stone-600 border-stone-200",
  morado: "bg-violet-50 text-violet-800 border-violet-200",
}
export function Etiqueta({ tono, children, className }: { tono: Tono; children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap", TONO[tono], className)}>{children}</span>
}

export const TONO_ESTADO: Record<EstadoEmpresa, Tono> = {
  prospecto: "gris", reunion_pendiente: "azul", reunion_realizada: "azul", prueba: "azul", activo: "verde", pago_pendiente: "amarillo", cancelado: "gris",
}
export const TONO_COBRO: Record<EstadoCobro, Tono> = { pagado: "verde", proximo: "amarillo", pendiente: "amarillo", atrasado: "rojo" }
export const TONO_ETAPA: Record<EtapaPipeline, Tono> = { nuevo: "gris", reunion_pendiente: "azul", reunion_realizada: "azul", prueba: "azul", cliente: "verde", no_interesado: "rojo" }

export const EstadoBadge = ({ estado }: { estado: EstadoEmpresa }) => <Etiqueta tono={TONO_ESTADO[estado]}>{ETIQUETA_ESTADO[estado]}</Etiqueta>
export const CobroBadge = ({ estado }: { estado: EstadoCobro }) => <Etiqueta tono={TONO_COBRO[estado]}>{ETIQUETA_COBRO[estado]}</Etiqueta>
export const CicloBadge = ({ ciclo }: { ciclo: Ciclo }) => <Etiqueta tono={ciclo === "anual" ? "morado" : "gris"}>{ciclo === "anual" ? "Anual" : "Mensual"}</Etiqueta>
export const EtapaBadge = ({ etapa }: { etapa: EtapaPipeline }) => <Etiqueta tono={TONO_ETAPA[etapa]}>{ETIQUETA_ETAPA[etapa]}</Etiqueta>

export function Kpi({ label, value, sub, tono }: { label: string; value: string; sub?: string; tono?: "verde" | "rojo" | "amarillo" | "azul" }) {
  const color = tono === "verde" ? "text-emerald-700" : tono === "rojo" ? "text-red-700" : tono === "amarillo" ? "text-amber-700" : tono === "azul" ? "text-sky-800" : "text-stone-800"
  return (
    <div className="rounded-xl border bg-white px-4 py-3 min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-stone-500 truncate">{label}</p>
      <p className={cn("mt-0.5 text-xl font-semibold tabular-nums whitespace-nowrap", color)}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-stone-400 truncate">{sub}</p>}
    </div>
  )
}

export function Panel({ titulo, descripcion, accion, children, className }: { titulo?: string; descripcion?: string; accion?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border bg-white", className)}>
      {(titulo || accion) && (
        <header className="flex items-start justify-between gap-3 border-b px-4 py-3">
          <div className="min-w-0">
            {titulo && <h2 className="text-sm font-semibold text-stone-800">{titulo}</h2>}
            {descripcion && <p className="text-xs text-stone-500">{descripcion}</p>}
          </div>
          {accion && <div className="shrink-0">{accion}</div>}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  )
}

/** Filtros en chips (enlaces que conservan el resto de la URL). */
export function Chips({ items }: { items: { href: string; label: string; activo: boolean; count?: number }[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <Link
          key={it.href + it.label}
          href={it.href}
          className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors", it.activo ? "border-stone-800 bg-stone-800 text-white" : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50")}
        >
          {it.label}
          {it.count != null && <span className={cn("ml-1.5 tabular-nums", it.activo ? "text-stone-300" : "text-stone-400")}>{it.count}</span>}
        </Link>
      ))}
    </div>
  )
}

export function Vacio({ titulo, texto, accion }: { titulo: string; texto?: string; accion?: React.ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-stone-200 px-6 py-10 text-center">
      <p className="text-sm font-medium text-stone-700">{titulo}</p>
      {texto && <p className="mt-1 text-xs text-stone-500">{texto}</p>}
      {accion && <div className="mt-3">{accion}</div>}
    </div>
  )
}

/** Barras horizontales (categorías, cuentas, motivos). */
export function BarrasHorizontales({ filas, formato }: { filas: { etiqueta: string; valor: number; sub?: string }[]; formato?: (n: number) => string }) {
  const max = Math.max(1, ...filas.map((f) => f.valor))
  const f = formato ?? fmtNum
  if (filas.length === 0) return <p className="text-xs text-stone-400">Sin datos.</p>
  return (
    <ul className="space-y-2">
      {filas.map((r) => (
        <li key={r.etiqueta}>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-stone-700">{r.etiqueta}{r.sub ? <span className="text-stone-400"> · {r.sub}</span> : null}</span>
            <span className="tabular-nums font-medium text-stone-800 whitespace-nowrap">{f(r.valor)}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-stone-100">
            <div className="h-2 rounded-full bg-stone-700" style={{ width: `${Math.round((r.valor / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Aviso cuando el script 076 no está aplicado. */
export function Pendiente({ error }: { error: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      {error}
    </div>
  )
}

/** Barra de progreso simple (pruebas por finalizar). */
export function Progreso({ pct, tono = "azul" }: { pct: number; tono?: "azul" | "rojo" | "verde" }) {
  const c = tono === "rojo" ? "bg-red-500" : tono === "verde" ? "bg-emerald-500" : "bg-sky-500"
  return <div className="h-1.5 w-full rounded-full bg-stone-100"><div className={cn("h-1.5 rounded-full", c)} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} /></div>
}
