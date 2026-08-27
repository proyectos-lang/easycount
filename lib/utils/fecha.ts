/**
 * Fechas de "día de negocio" en horario de Honduras (UTC-6, sin DST).
 *
 * Delega en `honduras-time.ts` (convención del proyecto): la hora se codifica
 * como UTC con el reloj de Honduras (ej. 14:00 HN -> `...T14:00:00.000Z`), de
 * modo que la porción de fecha (`.split('T')[0]`) SIEMPRE es el día local, sin
 * importar la zona horaria del dispositivo ni la de la sesión de la BD.
 *
 * NO usar `new Date().toISOString()` para un día de negocio: eso da el día UTC
 * real y de noche (después de las 18:00 HN) adelanta la fecha un día.
 */
import { getHondurasNowISO, getHondurasTodayISODate } from "./honduras-time"

/** Hoy en Honduras, formato YYYY-MM-DD (sin desfase de zona horaria). */
export function hoyISO(): string {
  return getHondurasTodayISODate()
}

/** Hora actual de Honduras en formato HH:MM:SS. */
export function horaLocal(): string {
  return getHondurasNowISO().slice(11, 19)
}

/**
 * Combina un día elegido (YYYY-MM-DD) con la hora ACTUAL de Honduras, en un
 * timestamp codificado como UTC (sufijo Z). Así el instante es inequívoco y su
 * porción de fecha queda EXACTAMENTE igual al día elegido — sin correrse a UTC.
 * Pensado para columnas timestamptz que se muestran con `.split('T')[0]`.
 */
export function timestampNaiveLocal(fecha: string): string {
  return `${fecha}T${getHondurasNowISO().slice(11)}`
}
