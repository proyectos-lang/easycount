/**
 * Convierte un monto en Lempiras a su representación literal para la factura
 * fiscal del SAR (Honduras). Función PURA (fácil de testear).
 *
 * Formato objetivo (igual a la factura demo del SAR):
 *   1150.00 -> "MIL CIENTO CINCUENTA LEMPIRAS Y CERO CENTAVOS EXACTOS"
 *   0.00    -> "CERO LEMPIRAS Y CERO CENTAVOS EXACTOS"
 *   1.50    -> "UN LEMPIRA Y CINCUENTA CENTAVOS"
 *
 * Los centavos se toman de los 2 primeros decimales (redondeo bancario simple).
 * Si los centavos son 0 se agrega "EXACTOS". La moneda se pluraliza (LEMPIRA /
 * LEMPIRAS, CENTAVO / CENTAVOS).
 */

const UNIDADES = [
  "CERO", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO",
  "NUEVE", "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS",
  "DIECISIETE", "DIECIOCHO", "DIECINUEVE", "VEINTE",
]
const VEINTES = [
  "VEINTE", "VEINTIUNO", "VEINTIDOS", "VEINTITRES", "VEINTICUATRO",
  "VEINTICINCO", "VEINTISEIS", "VEINTISIETE", "VEINTIOCHO", "VEINTINUEVE",
]
const DECENAS = [
  "", "", "", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA",
  "OCHENTA", "NOVENTA",
]
const CENTENAS = [
  "", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS",
  "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS",
]

/** 0..999 en letras (sin apocope para "uno"; el ajuste UN/UNO lo hace el caller). */
function centenasEnLetras(n: number): string {
  if (n === 0) return ""
  if (n === 100) return "CIEN"
  const c = Math.floor(n / 100)
  const resto = n % 100
  const parteC = CENTENAS[c]
  const parteD = decenasEnLetras(resto)
  return [parteC, parteD].filter(Boolean).join(" ")
}

/** 0..99 en letras. */
function decenasEnLetras(n: number): string {
  if (n <= 20) return n === 0 ? "" : UNIDADES[n]
  if (n < 30) return VEINTES[n - 20]
  const d = Math.floor(n / 10)
  const u = n % 10
  if (u === 0) return DECENAS[d]
  return `${DECENAS[d]} Y ${UNIDADES[u]}`
}

/**
 * Convierte un entero >= 0 a letras (sin moneda). Soporta hasta billones.
 * Aplica apócope "UN" antes de "MIL"/"MILLON" y grupos ("UN MIL DOSCIENTOS").
 */
export function enteroALetras(n: number): string {
  const entero = Math.floor(Math.abs(n))
  if (entero === 0) return "CERO"

  const grupos: number[] = []
  let resto = entero
  while (resto > 0) {
    grupos.push(resto % 1000)
    resto = Math.floor(resto / 1000)
  }

  // grupos[0]=unidades, [1]=miles, [2]=millones, [3]=miles de millones...
  const escalas = ["", "MIL", "MILLON", "MIL MILLONES", "BILLON"]
  const partes: string[] = []
  for (let i = grupos.length - 1; i >= 0; i--) {
    const g = grupos[i]
    if (g === 0) continue
    let txt = centenasEnLetras(g)
    // Apocope de "UNO" -> "UN" cuando le sigue una escala (mil/millon...):
    //   grupo unidades (i=0)   -> se deja "UNO" ("CIENTO UNO", "...Y UNO")
    //   grupo MILES (i=1), g=1 -> "" ("MIL", no "UN MIL"); si g=21 -> "VEINTIUN MIL"
    //   grupo MILLONES+ (i>=2), g=1 -> "UN" ("UN MILLON")
    if (i === 1 && g === 1) {
      txt = ""
    } else if (i > 0) {
      // Cualquier grupo con escala apocopa el "UNO" final (21->VEINTIUN, 1->UN).
      // Sin \b: "VEINTIUNO" es una sola palabra y debe volverse "VEINTIUN".
      txt = txt.replace(/UNO$/, "UN")
    }
    let escala = escalas[i] || ""
    // Pluralizar "MILLON" -> "MILLONES" si el grupo es > 1.
    if (i === 2 && g > 1) escala = "MILLONES"
    partes.push([txt, escala].filter(Boolean).join(" "))
  }
  return partes.join(" ").replace(/\s+/g, " ").trim()
}

/**
 * Monto en Lempiras a letras para la factura. Ver ejemplos en el encabezado.
 * @param monto  valor numérico (p.ej. 1150.5)
 */
export function montoEnLetrasLempiras(monto: number): string {
  const abs = Math.abs(monto || 0)
  const entero = Math.floor(abs)
  const centavos = Math.round((abs - entero) * 100)
  // Si el redondeo llega a 100 centavos, sube el entero.
  const enteroFinal = centavos === 100 ? entero + 1 : entero
  const centavosFinal = centavos === 100 ? 0 : centavos

  // Apocope "UNO" -> "UN" antes del sustantivo de moneda (UN LEMPIRA, VEINTIUN
  // CENTAVOS). Sin \b: "VEINTIUNO" es una sola palabra.
  const apocope = (s: string) => s.replace(/UNO$/, "UN")

  const enteroTxt = apocope(enteroALetras(enteroFinal))
  const monedaLempira = enteroFinal === 1 ? "LEMPIRA" : "LEMPIRAS"

  const centavosTxt = apocope(enteroALetras(centavosFinal))
  const monedaCentavo = centavosFinal === 1 ? "CENTAVO" : "CENTAVOS"
  const exactos = centavosFinal === 0 ? " EXACTOS" : ""

  return `${enteroTxt} ${monedaLempira} Y ${centavosTxt} ${monedaCentavo}${exactos}`
}
