import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import {
  getTenantStamp,
  isValidStamp,
  SESION_INVALIDA_ERROR,
} from "@/lib/services/tenant-stamp"
import { getCuentas, CUENTAS_FEATURE_PENDING } from "@/lib/services/cuentas"

// ==================== TIPOS ====================

export interface DiaConsolidado {
  dia: number // 1..31
  fecha: string // YYYY-MM-DD
  saldoInicial: number
  entradas: number
  salidas: number
  saldoFinal: number
}

export interface CuentaConsolidada {
  cuenta_id: number
  nombre: string
  tipo: string
  /** Saldo con el que arranca el mes (override manual si existe, si no el calculado). */
  saldoInicialMes: number
  /** Saldo inicial calculado desde el historico de movimientos (referencia para el override). */
  saldoInicialCalculado: number
  /** true si el saldo inicial del mes es un override manual del admin. */
  esManual: boolean
  dias: DiaConsolidado[]
  entradasMes: number
  salidasMes: number
  saldoFinalMes: number
}

export interface ConsolidacionMensual {
  anio: number
  mes: number
  cuentas: CuentaConsolidada[]
  /** Total de todos los bancos, dia por dia. */
  consolidado: {
    saldoInicialMes: number
    dias: DiaConsolidado[]
    entradasMes: number
    salidasMes: number
    saldoFinalMes: number
  }
}

// ==================== LECTURA ====================

const pad2 = (n: number) => String(n).padStart(2, "0")

/**
 * Consolidacion bancaria dia por dia de un mes: por cada cuenta calcula el
 * saldo corriente diario (saldo inicial, entradas, salidas, saldo final) desde
 * `cuenta_movimientos`, y arma el total consolidado de todos los bancos.
 *
 * El saldo inicial del mes por cuenta es el override manual (tabla
 * `consolidacion_saldos_iniciales`) si existe; si no, el saldo calculado =
 * suma de (Ingreso - Egreso) de todos los movimientos ANTERIORES al mes.
 */
export async function getConsolidacionMensual(
  anio: number,
  mes: number
): Promise<{ data: ConsolidacionMensual | null; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: null, error: "Supabase no configurado" }
  const supabase = createClient()
  if (!supabase) return { data: null, error: "Cliente no disponible" }

  // 1) Cuentas activas del tenant.
  const cuentasRes = await getCuentas()
  if (cuentasRes.error && cuentasRes.error !== CUENTAS_FEATURE_PENDING) {
    return { data: null, error: cuentasRes.error }
  }
  const cuentas = (cuentasRes.data || []).filter((c) => c.activo !== false)

  // 2) Rango del mes + tope de dias (no proyectamos dias futuros).
  const lastDay = new Date(anio, mes, 0).getDate()
  const monthStart = `${anio}-${pad2(mes)}-01`
  const monthEnd = `${anio}-${pad2(mes)}-${pad2(lastDay)}`
  const now = new Date()
  const esFuturo =
    anio > now.getFullYear() ||
    (anio === now.getFullYear() && mes > now.getMonth() + 1)
  const esActual = anio === now.getFullYear() && mes === now.getMonth() + 1
  const capDay = esFuturo ? 0 : esActual ? Math.min(lastDay, now.getDate()) : lastDay

  // 3) Overrides manuales de saldo inicial (por cuenta) del mes.
  const { data: overridesData, error: ovErr } = await supabase
    .from("consolidacion_saldos_iniciales")
    .select("cuenta_id, saldo_inicial")
    .eq("anio", anio)
    .eq("mes", mes)
  if (ovErr) return { data: null, error: ovErr.message }
  const overrides = new Map<number, number>()
  for (const o of overridesData || []) overrides.set(Number(o.cuenta_id), Number(o.saldo_inicial))

  // 4) Movimientos de cuenta hasta fin de mes (paginado; RLS filtra por tenant).
  type MovRow = { cuenta_id: number; fecha: string; tipo: string; monto: number }
  const movs: MovRow[] = []
  const PAGE = 1000
  for (let from = 0; from < 500 * PAGE; from += PAGE) {
    const { data, error } = await supabase
      .from("cuenta_movimientos")
      .select("cuenta_id, fecha, tipo, monto")
      .lte("fecha", `${monthEnd}T23:59:59`)
      .order("fecha", { ascending: true })
      .range(from, from + PAGE - 1)
    if (error) return { data: null, error: error.message }
    const rows = data || []
    for (const r of rows) {
      movs.push({
        cuenta_id: Number(r.cuenta_id),
        fecha: String(r.fecha),
        tipo: String(r.tipo),
        monto: Number(r.monto || 0),
      })
    }
    if (rows.length < PAGE) break
  }

  // 5) Consolidacion por cuenta.
  const cuentasConsolidadas: CuentaConsolidada[] = cuentas.map((c) => {
    const cuentaId = c.id!
    const delMes = movs.filter((m) => m.cuenta_id === cuentaId)

    // Saldo calculado = neto de movimientos ANTERIORES al inicio del mes.
    let saldoInicialCalculado = 0
    for (const m of delMes) {
      const dateStr = m.fecha.slice(0, 10)
      if (dateStr < monthStart) {
        saldoInicialCalculado += m.tipo === "Ingreso" ? m.monto : -m.monto
      }
    }
    saldoInicialCalculado = +saldoInicialCalculado.toFixed(2)

    const esManual = overrides.has(cuentaId)
    const saldoInicialMes = esManual ? overrides.get(cuentaId)! : saldoInicialCalculado

    // Entradas/salidas por dia del mes.
    const entradasPorDia = new Map<number, number>()
    const salidasPorDia = new Map<number, number>()
    for (const m of delMes) {
      const dateStr = m.fecha.slice(0, 10)
      if (dateStr < monthStart || dateStr > monthEnd) continue
      const dia = Number(dateStr.slice(8, 10))
      if (m.tipo === "Ingreso") {
        entradasPorDia.set(dia, (entradasPorDia.get(dia) || 0) + m.monto)
      } else {
        salidasPorDia.set(dia, (salidasPorDia.get(dia) || 0) + m.monto)
      }
    }

    const dias: DiaConsolidado[] = []
    let saldoCorriente = saldoInicialMes
    let entradasMes = 0
    let salidasMes = 0
    for (let d = 1; d <= capDay; d++) {
      const entradas = +(entradasPorDia.get(d) || 0).toFixed(2)
      const salidas = +(salidasPorDia.get(d) || 0).toFixed(2)
      const saldoInicial = +saldoCorriente.toFixed(2)
      const saldoFinal = +(saldoInicial + entradas - salidas).toFixed(2)
      dias.push({
        dia: d,
        fecha: `${anio}-${pad2(mes)}-${pad2(d)}`,
        saldoInicial,
        entradas,
        salidas,
        saldoFinal,
      })
      saldoCorriente = saldoFinal
      entradasMes += entradas
      salidasMes += salidas
    }

    return {
      cuenta_id: cuentaId,
      nombre: c.nombre,
      tipo: c.tipo,
      saldoInicialMes: +saldoInicialMes.toFixed(2),
      saldoInicialCalculado,
      esManual,
      dias,
      entradasMes: +entradasMes.toFixed(2),
      salidasMes: +salidasMes.toFixed(2),
      saldoFinalMes: +saldoCorriente.toFixed(2),
    }
  })

  // 6) Total consolidado (suma de todas las cuentas por dia).
  const consDias: DiaConsolidado[] = []
  for (let idx = 0; idx < capDay; idx++) {
    const d = idx + 1
    let saldoInicial = 0
    let entradas = 0
    let salidas = 0
    let saldoFinal = 0
    for (const cc of cuentasConsolidadas) {
      const dd = cc.dias[idx]
      if (!dd) continue
      saldoInicial += dd.saldoInicial
      entradas += dd.entradas
      salidas += dd.salidas
      saldoFinal += dd.saldoFinal
    }
    consDias.push({
      dia: d,
      fecha: `${anio}-${pad2(mes)}-${pad2(d)}`,
      saldoInicial: +saldoInicial.toFixed(2),
      entradas: +entradas.toFixed(2),
      salidas: +salidas.toFixed(2),
      saldoFinal: +saldoFinal.toFixed(2),
    })
  }

  const consolidado = {
    saldoInicialMes: +cuentasConsolidadas.reduce((a, c) => a + c.saldoInicialMes, 0).toFixed(2),
    dias: consDias,
    entradasMes: +cuentasConsolidadas.reduce((a, c) => a + c.entradasMes, 0).toFixed(2),
    salidasMes: +cuentasConsolidadas.reduce((a, c) => a + c.salidasMes, 0).toFixed(2),
    saldoFinalMes: +cuentasConsolidadas.reduce((a, c) => a + c.saldoFinalMes, 0).toFixed(2),
  }

  return {
    data: { anio, mes, cuentas: cuentasConsolidadas, consolidado },
    error: null,
  }
}

// ==================== OVERRIDE MANUAL (ADMIN) ====================

/** Fija/actualiza el saldo inicial del mes de una cuenta (override manual). */
export async function setSaldoInicialMes(input: {
  cuenta_id: number
  anio: number
  mes: number
  saldo_inicial: number
}): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }

  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { error: SESION_INVALIDA_ERROR }

  const { error } = await supabase.from("consolidacion_saldos_iniciales").upsert(
    {
      razon_social_id: stamp.razon_social_id,
      cuenta_id: input.cuenta_id,
      anio: input.anio,
      mes: input.mes,
      saldo_inicial: input.saldo_inicial,
      usuario: stamp.usuario,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "razon_social_id,cuenta_id,anio,mes" }
  )
  if (error) return { error: error.message }
  return { error: null }
}

/** Elimina el override manual -> el saldo inicial vuelve al calculado. */
export async function borrarSaldoInicialMes(input: {
  cuenta_id: number
  anio: number
  mes: number
}): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "Cliente no disponible" }

  // RLS restringe al tenant; no hace falta filtrar por razon_social_id aqui.
  const { error } = await supabase
    .from("consolidacion_saldos_iniciales")
    .delete()
    .eq("cuenta_id", input.cuenta_id)
    .eq("anio", input.anio)
    .eq("mes", input.mes)
  if (error) return { error: error.message }
  return { error: null }
}
