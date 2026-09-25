import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { getTenantStamp, isValidStamp, SESION_INVALIDA_ERROR } from '@/lib/services/tenant-stamp'
import { fijarCostoPromedio } from '@/lib/services/stock'

/**
 * PostgREST corta cada `.select()` en 1000 filas. Pagina con `.range()` hasta
 * traerlas todas. Crítico aquí: `resolverAfectados` devuelve los ids de ventas
 * que el fallback recorre para REESCRIBIR costo/utilidad; truncar dejaría el
 * recálculo retroactivo INCOMPLETO.
 */
type RangeableQuery = {
  range: (from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>
}
async function fetchAllRows<T>(buildQuery: () => RangeableQuery): Promise<{ data: T[]; error: string | null }> {
  const PAGE = 1000
  let from = 0
  const acc: T[] = []
  for (let guard = 0; guard < 100; guard++) {
    const { data, error } = await buildQuery().range(from, from + PAGE - 1)
    if (error) return { data: acc, error: error.message }
    const rows = (data || []) as T[]
    acc.push(...rows)
    if (rows.length < PAGE) break
    from += PAGE
  }
  return { data: acc, error: null }
}

function chunkIds<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/** Trae todas las filas de una consulta `.in(campo, ids)` con ids grandes. */
async function fetchAllRowsIn<T>(
  ids: number[],
  buildQuery: (grupo: number[]) => RangeableQuery,
  idChunk = 300,
): Promise<{ data: T[]; error: string | null }> {
  const acc: T[] = []
  for (const grupo of chunkIds(ids, idChunk)) {
    const { data, error } = await fetchAllRows<T>(() => buildQuery(grupo))
    if (error) return { data: acc, error }
    acc.push(...data)
  }
  return { data: acc, error: null }
}

/**
 * Ajuste manual de costo unitario (`productos.costo_promedio`) con recalculo
 * retroactivo OPCIONAL del costo congelado de las ventas pasadas del producto
 * en un intervalo de fechas.
 *
 * Dos efectos:
 *  - Cambiar el costo actual -> la valoracion de inventario se actualiza sola
 *    (lee `productos.costo_promedio`). Lo hace `fijarCostoPromedio` (stock.ts).
 *  - Recalcular ventas -> reescribe `ventas_detalle` (costo/utilidad),
 *    `transacciones_inventario` (kardex) y `devoluciones_detalle` del rango.
 *    Se prefiere la RPC transaccional `recalcular_costo_ventas` (script 026);
 *    si no existe, se cae a un fallback JS best-effort NO atomico.
 *
 * La bitacora en `ajustes_costo` es best-effort (si la tabla no existe, el
 * ajuste igual se aplica).
 */

/** Marca la ausencia de la tabla/RPC de ajuste de costo (script 026 no aplicado). */
export const AJUSTE_COSTO_FEATURE_PENDING =
  'Recalculo atomico pendiente: aplica scripts/026-ajuste-costo.sql'

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

// PostgREST devuelve PGRST202 cuando la funcion RPC no existe todavia.
function esFuncionInexistente(error: PostgrestError | null): boolean {
  if (!error) return false
  return (
    error.code === 'PGRST202' ||
    /could not find the function|function .* does not exist/i.test(error.message || '')
  )
}

// ==================== HELPER PURO ====================

export interface ImpactoCosto {
  valorInvAnterior: number
  valorInvNuevo: number
  deltaValorInventario: number
  /** CMV neto (ventas - devoluciones) del rango con el costo anterior */
  cmvAnterior: number
  /** CMV neto del rango con el costo nuevo */
  cmvNuevo: number
  /** Cuanto sube la utilidad bruta (= cmvAnterior - cmvNuevo) */
  deltaUtilidad: number
}

/**
 * Helper PURO (sin DB): calcula el impacto de cambiar el costo de un producto.
 * `cantidadVendida`/`cantidadDevuelta` son los totales del producto en el rango
 * a recalcular; la cantidad NETA (vendida - devuelta) es la que mueve el CMV.
 */
export function calcularImpactoCosto(input: {
  stock: number
  costoAnterior: number
  costoNuevo: number
  cantidadVendida: number
  cantidadDevuelta: number
}): ImpactoCosto {
  const { stock, costoAnterior, costoNuevo, cantidadVendida, cantidadDevuelta } = input
  const cantidadNeta = cantidadVendida - cantidadDevuelta

  const valorInvAnterior = round2(stock * costoAnterior)
  const valorInvNuevo = round2(stock * costoNuevo)
  const cmvAnterior = round2(cantidadNeta * costoAnterior)
  const cmvNuevo = round2(cantidadNeta * costoNuevo)

  return {
    valorInvAnterior,
    valorInvNuevo,
    deltaValorInventario: round2(valorInvNuevo - valorInvAnterior),
    cmvAnterior,
    cmvNuevo,
    // La utilidad bruta sube cuando el CMV baja.
    deltaUtilidad: round2(cmvAnterior - cmvNuevo),
  }
}

// ==================== RESOLUCION DE AFECTADOS ====================

interface Afectados {
  ventaIds: number[]
  ventasAfectadas: number
  cantidadVendida: number
  devolucionIds: number[]
  cantidadDevuelta: number
}

/**
 * Resuelve las ventas y devoluciones del producto en el rango [desde, hasta]
 * (fechas `YYYY-MM-DD`). RLS limita todo al tenant logueado.
 */
async function resolverAfectados(
  supabase: SupabaseClient,
  productoId: number,
  desde: string,
  hasta: string
): Promise<Afectados> {
  const inicio = `${desde}T00:00:00`
  const fin = `${hasta}T23:59:59`

  // Ventas del rango (paginado: un rango amplio puede tener >1000 ventas y sus
  // ids alimentan el recálculo retroactivo de costo).
  const { data: ventas } = await fetchAllRows<{ id: number }>(() =>
    supabase
      .from('ventas_encabezado')
      .select('id')
      .gte('fecha_venta', inicio)
      .lte('fecha_venta', fin) as unknown as RangeableQuery
  )
  const ventaIds = (ventas || []).map((v) => v.id as number)

  let ventasAfectadas = 0
  let cantidadVendida = 0
  if (ventaIds.length > 0) {
    // Chunked + paginado: >1000 ids en el .in y >1000 líneas del producto.
    const { data: detalles } = await fetchAllRowsIn<{ cantidad: number }>(ventaIds, (grupo) =>
      supabase
        .from('ventas_detalle')
        .select('cantidad')
        .eq('producto_id', productoId)
        .in('venta_id', grupo) as unknown as RangeableQuery
    )
    ventasAfectadas = (detalles || []).length
    cantidadVendida = (detalles || []).reduce((acc, d) => acc + Number(d.cantidad || 0), 0)
  }

  // Devoluciones del rango (paginado + chunk igual que ventas).
  const { data: devs } = await fetchAllRows<{ id: number }>(() =>
    supabase
      .from('devoluciones_encabezado')
      .select('id')
      .gte('fecha', inicio)
      .lte('fecha', fin) as unknown as RangeableQuery
  )
  const devolucionIds = (devs || []).map((d) => d.id as number)

  let cantidadDevuelta = 0
  if (devolucionIds.length > 0) {
    const { data: devDet } = await fetchAllRowsIn<{ cantidad_devuelta: number }>(devolucionIds, (grupo) =>
      supabase
        .from('devoluciones_detalle')
        .select('cantidad_devuelta')
        .eq('producto_id', productoId)
        .in('devolucion_id', grupo) as unknown as RangeableQuery
    )
    cantidadDevuelta = (devDet || []).reduce((acc, d) => acc + Number(d.cantidad_devuelta || 0), 0)
  }

  return { ventaIds, ventasAfectadas, cantidadVendida, devolucionIds, cantidadDevuelta }
}

// ==================== PREVIEW ====================

export interface PreviewAjusteCosto extends ImpactoCosto {
  stock: number
  costoAnterior: number
  costoNuevo: number
  ventasAfectadas: number
  cantidadVendida: number
  cantidadDevuelta: number
}

/**
 * Solo lecturas: calcula el impacto (valor de inventario y CMV antes/despues)
 * de fijar `costoNuevo` en el producto, y cuantas ventas se recalcularian.
 */
export async function previewAjusteCosto(
  productoId: number,
  costoNuevo: number,
  recalcular: boolean,
  desde?: string,
  hasta?: string
): Promise<{ data: PreviewAjusteCosto | null; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: null, error: 'Supabase no configurado' }
  const supabase = createClient()
  if (!supabase) return { data: null, error: 'Cliente no disponible' }

  const { data: prod, error: prodErr } = await supabase
    .from('productos')
    .select('stock_total, costo_promedio')
    .eq('id', productoId)
    .single()
  if (prodErr) return { data: null, error: prodErr.message }

  const stock = Number(prod?.stock_total || 0)
  const costoAnterior = Number(prod?.costo_promedio || 0)

  let ventasAfectadas = 0
  let cantidadVendida = 0
  let cantidadDevuelta = 0
  if (recalcular && desde && hasta) {
    const af = await resolverAfectados(supabase, productoId, desde, hasta)
    ventasAfectadas = af.ventasAfectadas
    cantidadVendida = af.cantidadVendida
    cantidadDevuelta = af.cantidadDevuelta
  }

  const impacto = calcularImpactoCosto({ stock, costoAnterior, costoNuevo, cantidadVendida, cantidadDevuelta })

  return {
    data: {
      ...impacto,
      stock,
      costoAnterior,
      costoNuevo,
      ventasAfectadas,
      cantidadVendida,
      cantidadDevuelta,
    },
    error: null,
  }
}

// ==================== PROCESAR ====================

export interface AjusteCostoInput {
  producto_id: number
  costo_nuevo: number
  recalcular: boolean
  desde?: string
  hasta?: string
  motivo?: string
}

/**
 * Aplica el ajuste de costo:
 *  1) Fija `costo_promedio` (via stock.ts, RPC o fallback).
 *  2) Si `recalcular`: reescribe el costo congelado de las ventas del rango
 *     (RPC transaccional `recalcular_costo_ventas`, o fallback JS best-effort).
 *  3) Guarda bitacora en `ajustes_costo` (best-effort).
 *
 * Estados: si el costo se fijo pero el recalculo fallo, el costo actual ya
 * quedo cambiado (valoracion correcta) y el historial intacto -> reintentable.
 */
export async function procesarAjusteCosto(
  input: AjusteCostoInput
): Promise<{ success: boolean; ventasAfectadas: number; error: string | null }> {
  const { producto_id, costo_nuevo, recalcular, desde, hasta, motivo } = input

  if (!(costo_nuevo >= 0)) {
    return { success: false, ventasAfectadas: 0, error: 'El costo debe ser un numero mayor o igual a 0' }
  }
  if (!isSupabaseConfigured()) {
    return { success: false, ventasAfectadas: 0, error: 'Supabase no configurado' }
  }
  const supabase = createClient()
  if (!supabase) return { success: false, ventasAfectadas: 0, error: 'Cliente no disponible' }

  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) {
    return { success: false, ventasAfectadas: 0, error: SESION_INVALIDA_ERROR }
  }

  // Estado actual (para bitacora e impacto), antes de tocar nada.
  const { data: prod, error: prodErr } = await supabase
    .from('productos')
    .select('stock_total, costo_promedio')
    .eq('id', producto_id)
    .single()
  if (prodErr) return { success: false, ventasAfectadas: 0, error: prodErr.message }
  const stock = Number(prod?.stock_total || 0)
  const costoAnterior = Number(prod?.costo_promedio || 0)

  // Afectados del rango (para CMV de bitacora y para el fallback JS).
  const usarRango = recalcular && !!desde && !!hasta
  const af = usarRango
    ? await resolverAfectados(supabase, producto_id, desde!, hasta!)
    : { ventaIds: [], ventasAfectadas: 0, cantidadVendida: 0, devolucionIds: [], cantidadDevuelta: 0 }
  const impacto = calcularImpactoCosto({
    stock,
    costoAnterior,
    costoNuevo: costo_nuevo,
    cantidadVendida: af.cantidadVendida,
    cantidadDevuelta: af.cantidadDevuelta,
  })

  // 1) Fijar el costo actual. Si falla, no se toco nada mas.
  const fij = await fijarCostoPromedio(supabase, producto_id, costo_nuevo, stamp.razon_social_id)
  if (fij.error) {
    return { success: false, ventasAfectadas: 0, error: fij.error }
  }

  let ventasAfectadas = 0
  let recalcError: string | null = null

  // 2) Recalculo retroactivo (opcional).
  if (usarRango) {
    const inicio = `${desde}T00:00:00`
    const fin = `${hasta}T23:59:59`

    const rpc = await supabase.rpc('recalcular_costo_ventas', {
      p_producto_id: producto_id,
      p_costo: costo_nuevo,
      p_desde: inicio,
      p_hasta: fin,
    })

    if (!rpc.error) {
      ventasAfectadas = Number(rpc.data ?? 0)
    } else if (esFuncionInexistente(rpc.error)) {
      // Fallback best-effort (script 026 no aplicado): NO atomico.
      const r = await recalcularFallback(supabase, producto_id, costo_nuevo, af)
      ventasAfectadas = r.ventasAfectadas
      recalcError = r.error
    } else {
      // El costo ya se fijo; el recalculo fallo por otra razon.
      recalcError = rpc.error.message
    }
  }

  // 3) Bitacora (best-effort; ignora si la tabla no existe).
  await supabase.from('ajustes_costo').insert({
    producto_id,
    costo_anterior: costoAnterior,
    costo_nuevo,
    stock_al_momento: stock,
    valor_inv_anterior: impacto.valorInvAnterior,
    valor_inv_nuevo: impacto.valorInvNuevo,
    recalculo_ventas: usarRango,
    rango_desde: usarRango ? desde : null,
    rango_hasta: usarRango ? hasta : null,
    ventas_afectadas: ventasAfectadas,
    cmv_anterior: impacto.cmvAnterior,
    cmv_nuevo: impacto.cmvNuevo,
    motivo: motivo || null,
    ...stamp,
  })

  if (recalcError) {
    return {
      success: true,
      ventasAfectadas,
      error: `Costo actualizado, pero el recalculo fallo parcialmente: ${recalcError}. Aplica scripts/026-ajuste-costo.sql para un recalculo atomico.`,
    }
  }
  return { success: true, ventasAfectadas, error: null }
}

/**
 * Fallback JS (sin RPC): reescribe costo/utilidad de las ventas, el kardex y
 * las devoluciones del rango. NO es transaccional (puede quedar parcial si un
 * UPDATE intermedio falla); por eso se recomienda aplicar el script 026.
 */
async function recalcularFallback(
  supabase: SupabaseClient,
  productoId: number,
  costo: number,
  af: Afectados
): Promise<{ ventasAfectadas: number; error: string | null }> {
  if (af.ventaIds.length === 0) return { ventasAfectadas: 0, error: null }

  // 1) ventas_detalle: costo + utilidad por fila (utilidad depende de precio/cantidad).
  //    Lectura paginada + chunk de ids (el rango puede tener >1000 ventas).
  const { data: detalles, error: detErr } = await fetchAllRowsIn<{ id: number; precio_unitario: number; cantidad: number }>(
    af.ventaIds,
    (grupo) =>
      supabase
        .from('ventas_detalle')
        .select('id, precio_unitario, cantidad')
        .eq('producto_id', productoId)
        .in('venta_id', grupo) as unknown as RangeableQuery
  )
  if (detErr) return { ventasAfectadas: 0, error: detErr }

  for (const d of detalles || []) {
    const utilidad = (Number(d.precio_unitario || 0) - costo) * Number(d.cantidad || 0)
    const { error } = await supabase
      .from('ventas_detalle')
      .update({ costo_promedio_momento: costo, utilidad_linea: utilidad })
      .eq('id', d.id)
    if (error) return { ventasAfectadas: 0, error: error.message }
  }

  // 2) Kardex de las 'Salida Venta' de esas ventas (update por chunks de ids
  //    para no exceder el límite de PostgREST en la lista del .in).
  for (const grupo of chunkIds(af.ventaIds, 300)) {
    const { error: kardexErr } = await supabase
      .from('transacciones_inventario')
      .update({ costo_o_precio_unitario: costo })
      .eq('producto_id', productoId)
      .eq('tipo_movimiento', 'Salida Venta')
      .in('referencia_id', grupo)
    if (kardexErr) return { ventasAfectadas: (detalles || []).length, error: kardexErr.message }
  }

  // 3) Devoluciones del rango (update por chunks de ids).
  if (af.devolucionIds.length > 0) {
    for (const grupo of chunkIds(af.devolucionIds, 300)) {
      const { error: devErr } = await supabase
        .from('devoluciones_detalle')
        .update({ costo_promedio_momento: costo })
        .eq('producto_id', productoId)
        .in('devolucion_id', grupo)
      if (devErr) return { ventasAfectadas: (detalles || []).length, error: devErr.message }
    }
  }

  return { ventasAfectadas: (detalles || []).length, error: null }
}
