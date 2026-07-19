import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js'

/**
 * Actualizaciones atomicas de stock/costo de productos.
 *
 * Preferimos las funciones RPC del script 018 (UPDATE con row lock, sin
 * condicion de carrera). Si esas funciones aun no existen en la base (script
 * 018 no aplicado), caemos al patron LEE-MODIFICA-ESCRIBE historico para no
 * romper la app. La ruta de respaldo NO es concurrency-safe: en cuanto
 * apliques el 018 desaparece automaticamente.
 */

// PostgREST devuelve PGRST202 (o un mensaje "Could not find the function")
// cuando la funcion RPC no existe todavia.
function esFuncionInexistente(error: PostgrestError | null): boolean {
  if (!error) return false
  return (
    error.code === 'PGRST202' ||
    /could not find the function|function .* does not exist/i.test(error.message || '')
  )
}

/**
 * Suma `delta` (positivo o negativo) al stock del producto.
 * Devuelve el nuevo stock, o null si no se pudo (producto de otro tenant, etc).
 */
export async function ajustarStock(
  supabase: SupabaseClient,
  productoId: number,
  delta: number,
  razonSocialId?: number | null
): Promise<{ nuevoStock: number | null; error: string | null }> {
  const rpc = await supabase.rpc('ajustar_stock', {
    p_producto_id: productoId,
    p_delta: delta,
  })

  if (!rpc.error) {
    return { nuevoStock: rpc.data as number | null, error: null }
  }
  if (!esFuncionInexistente(rpc.error)) {
    return { nuevoStock: null, error: rpc.error.message }
  }

  // ---- Fallback (script 018 no aplicado): lee-modifica-escribe ----
  let read = supabase.from('productos').select('stock_total').eq('id', productoId)
  if (razonSocialId != null) read = read.eq('razon_social_id', razonSocialId)
  const { data: prod, error: readErr } = await read.single()
  if (readErr) return { nuevoStock: null, error: readErr.message }

  const nuevoStock = (prod?.stock_total || 0) + delta
  let upd = supabase
    .from('productos')
    .update({ stock_total: nuevoStock, updated_at: new Date().toISOString() })
    .eq('id', productoId)
  if (razonSocialId != null) upd = upd.eq('razon_social_id', razonSocialId)
  const { error: updErr } = await upd
  if (updErr) return { nuevoStock: null, error: updErr.message }

  return { nuevoStock, error: null }
}

/**
 * Entrada de mercancia: recalcula costo promedio ponderado y suma stock de
 * forma atomica. Devuelve el nuevo stock y costo.
 */
export async function aplicarEntradaCompra(
  supabase: SupabaseClient,
  productoId: number,
  cantidad: number,
  costoUnitario: number
): Promise<{ nuevoStock: number | null; nuevoCosto: number | null; error: string | null }> {
  const rpc = await supabase.rpc('aplicar_entrada_compra', {
    p_producto_id: productoId,
    p_cantidad: cantidad,
    p_costo_unitario: costoUnitario,
  })

  if (!rpc.error) {
    const row = Array.isArray(rpc.data) ? rpc.data[0] : rpc.data
    return {
      nuevoStock: row?.stock_total ?? null,
      nuevoCosto: row?.costo_promedio ?? null,
      error: null,
    }
  }
  if (!esFuncionInexistente(rpc.error)) {
    return { nuevoStock: null, nuevoCosto: null, error: rpc.error.message }
  }

  // ---- Fallback (script 018 no aplicado): lee-modifica-escribe ----
  const { data: prod, error: readErr } = await supabase
    .from('productos')
    .select('stock_total, costo_promedio')
    .eq('id', productoId)
    .single()
  if (readErr) return { nuevoStock: null, nuevoCosto: null, error: readErr.message }

  const stockActual = prod?.stock_total || 0
  const costoActual = prod?.costo_promedio || 0
  const nuevoStock = stockActual + cantidad
  const nuevoCosto =
    nuevoStock > 0
      ? (stockActual * costoActual + cantidad * costoUnitario) / nuevoStock
      : costoUnitario

  const { error: updErr } = await supabase
    .from('productos')
    .update({
      stock_total: nuevoStock,
      costo_promedio: nuevoCosto,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productoId)
  if (updErr) return { nuevoStock: null, nuevoCosto: null, error: updErr.message }

  return { nuevoStock, nuevoCosto, error: null }
}
