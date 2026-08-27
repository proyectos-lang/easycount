/**
 * Fechas en horario LOCAL. EasyCount opera en Honduras (UTC-6, sin horario de
 * verano) y trata la fecha como "dia de negocio": la porcion de fecha del
 * string ES el dia local que ve el usuario.
 *
 * Por eso NO usamos `toISOString()` para el dia de negocio: esa funcion
 * convierte a UTC y, de noche, adelanta la fecha un dia (p. ej. 26/08 20:30
 * local -> 27/08 02:30Z). Guardamos y comparamos en "naive-local" (sin 'Z' ni
 * offset): el filtro usa `${dia}T00:00:00` sin offset y el guardado tambien,
 * asi todo queda consistente (dia elegido = guardado = filtrado = mostrado).
 */

/** Hoy en horario local, formato YYYY-MM-DD (sin desfase de zona horaria). */
export function hoyISO(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** Hora local actual en formato HH:MM:SS. */
export function horaLocal(d: Date = new Date()): string {
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  const ss = String(d.getSeconds()).padStart(2, "0")
  return `${hh}:${mm}:${ss}`
}

/**
 * Combina un dia (YYYY-MM-DD) con la hora local actual en un timestamp
 * "naive-local" (sin 'Z' ni offset). Se persiste tal cual: la porcion de fecha
 * del string queda IGUAL al dia elegido por el usuario, sin correrse a UTC.
 */
export function timestampNaiveLocal(fecha: string, d: Date = new Date()): string {
  return `${fecha}T${horaLocal(d)}`
}
