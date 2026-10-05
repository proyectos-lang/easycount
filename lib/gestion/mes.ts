/** Mes seleccionado en la barra superior del portal (/gestion?mes=YYYY-MM). Puro. */
import { mesRelativo } from "./reglas"

export interface MesSel { anio: number; mes: number }

/** Lee `?mes=YYYY-MM`; si falta o es inválido, el mes de `hoy` (YYYY-MM-DD). */
export function leerMes(param: string | string[] | undefined, hoy: string): MesSel {
  const v = Array.isArray(param) ? param[0] : param
  const m = v && /^\d{4}-\d{2}$/.test(v) ? v : hoy.slice(0, 7)
  const anio = Number(m.slice(0, 4)), mes = Number(m.slice(5, 7))
  return mes >= 1 && mes <= 12 ? { anio, mes } : { anio: Number(hoy.slice(0, 4)), mes: Number(hoy.slice(5, 7)) }
}

export const claveMes = (s: MesSel) => `${s.anio}-${String(s.mes).padStart(2, "0")}`
export const mesAnterior = (s: MesSel) => mesRelativo(s.anio, s.mes, -1)
export const mesSiguiente = (s: MesSel) => mesRelativo(s.anio, s.mes, 1)

/** Primer y último día del mes ('YYYY-MM-DD'). */
export function rangoMes(s: MesSel): { desde: string; hasta: string } {
  const ultimo = new Date(Date.UTC(s.anio, s.mes, 0)).getUTCDate()
  return { desde: `${claveMes(s)}-01`, hasta: `${claveMes(s)}-${String(ultimo).padStart(2, "0")}` }
}
