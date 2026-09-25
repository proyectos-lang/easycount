import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { getHondurasTodayISODate } from '@/lib/utils/honduras-time'

/**
 * PostgREST corta cada `.select()` en 1000 filas. Este helper pagina con
 * `.range()` hasta traer TODAS — sin él, los KPIs del dashboard (cartera,
 * utilidad, top productos/deudores) salían SUBESTIMADOS para empresas con más
 * de 1000 ventas/detalles. `buildQuery()` reconstruye la consulta base.
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

/** Parte un arreglo en bloques (para `.in(...)` con muchos ids). */
function chunk<T>(arr: T[], size: number): T[][] {
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
  for (const grupo of chunk(ids, idChunk)) {
    const { data, error } = await fetchAllRows<T>(() => buildQuery(grupo))
    if (error) return { data: acc, error }
    acc.push(...data)
  }
  return { data: acc, error: null }
}

// ==================== INTERFACES ====================

export interface DashboardMetrics {
  valorInventario: number
  cuentasPorCobrar: number
  utilidadBruta: number
  ventasMes: number
  ventasMesCount: number
}

export interface VentasVsCobros {
  fecha: string
  ventas: number
  cobros: number
}

export interface TopProducto {
  producto_id: number
  producto_nombre: string
  cantidad_vendida: number
}

export interface ProductoStockBajo {
  id: number
  nombre: string
  codigo_barras: string
  stock_total: number
}

export interface CompraPendiente {
  id: number
  proveedor_nombre: string
  fecha_tentativa: string
  total_compra_local: number
  estado: string
}

export interface ClienteDeudor {
  cliente_id: number
  cliente_nombre: string
  total_deuda: number
  facturas_pendientes: number
}

const DEFAULT_METRICS: DashboardMetrics = {
  valorInventario: 0,
  cuentasPorCobrar: 0,
  utilidadBruta: 0,
  ventasMes: 0,
  ventasMesCount: 0,
}

// ==================== DASHBOARD DATA ====================

export async function getDashboardMetrics(
  razonSocialId: number | null
): Promise<{ data: DashboardMetrics; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { data: DEFAULT_METRICS, error: null }
  }

  const supabase = createClient()
  if (!supabase) return { data: DEFAULT_METRICS, error: 'Cliente no disponible' }

  if (razonSocialId == null) {
    console.log('[Dashboard] getDashboardMetrics: razonSocialId es null, devolviendo ceros')
    return { data: DEFAULT_METRICS, error: null }
  }

  try {
    // Primer dia del mes en curso (Honduras), codificado como UTC para casar con
    // las columnas de dia-de-negocio HN-as-UTC (fecha_venta, etc.).
    const firstDayOfMonth = `${getHondurasTodayISODate().slice(0, 7)}-01T00:00:00.000Z`

    // Todas paginadas: PostgREST corta en 1000 filas y estos KPIs suman el
    // conjunto completo (mes con >1000 ventas, histórico con >1000 detalles, etc.).
    // Ventas Mes: total facturado del mes actual.
    const ventasMesRes = await fetchAllRows<{ total_venta: number }>(() =>
      supabase
        .from('ventas_encabezado')
        .select('total_venta')
        .eq('razon_social_id', razonSocialId)
        .gte('fecha_venta', firstDayOfMonth) as unknown as RangeableQuery
    )

    // Por Cobrar (cartera): saldo pendiente de TODAS las ventas, sin filtrar
    // por mes. Una venta de un mes anterior con saldo abierto sigue siendo
    // dinero por cobrar hoy. Si la columna `valorpago` no existe, hacemos
    // fallback historico (no se puede inferir el saldo y queda en 0).
    const carteraRes = await fetchAllRows<{ total_venta: number; valorpago: number }>(() =>
      supabase
        .from('ventas_encabezado')
        .select('total_venta, valorpago')
        .eq('razon_social_id', razonSocialId) as unknown as RangeableQuery
    )

    let tieneValorpago = true
    if (carteraRes.error && /valorpago/i.test(carteraRes.error || '')) {
      tieneValorpago = false
    }

    const [productosRes, detallesRes] = await Promise.all([
      fetchAllRows<{ stock_total: number; costo_promedio: number }>(() =>
        supabase
          .from('productos')
          .select('stock_total, costo_promedio')
          .eq('razon_social_id', razonSocialId) as unknown as RangeableQuery
      ),
      fetchAllRows<{ utilidad_linea: number }>(() =>
        supabase
          .from('ventas_detalle')
          .select('utilidad_linea, ventas_encabezado!inner(razon_social_id)')
          .eq('ventas_encabezado.razon_social_id', razonSocialId) as unknown as RangeableQuery
      ),
    ])

    // Log errores de cada consulta para debug
    if (productosRes.error) console.log('[Dashboard] productos error:', productosRes.error)
    if (detallesRes.error) console.log('[Dashboard] detalles error:', detallesRes.error)
    if (ventasMesRes.error) console.log('[Dashboard] ventasMes error:', ventasMesRes.error)
    if (carteraRes.error) console.log('[Dashboard] cartera error:', carteraRes.error)

    const valorInventario = (productosRes.data || []).reduce(
      (acc, p: any) => acc + ((p.stock_total || 0) * (p.costo_promedio || 0)),
      0
    )

    const utilidadBruta = (detallesRes.data || []).reduce(
      (acc, d: any) => acc + (d.utilidad_linea || 0),
      0
    )

    const ventasMes = (ventasMesRes.data || []).reduce(
      (acc: number, v: any) => acc + (v.total_venta || 0),
      0
    )
    const ventasMesCount = (ventasMesRes.data || []).length

    // Por Cobrar = suma de (total_venta - valorpago) por cada venta con saldo.
    // valorpago es el total abonado acumulado; el saldo nunca es negativo.
    const cuentasPorCobrar = tieneValorpago
      ? (carteraRes.data || []).reduce(
          (acc: number, v: any) => acc + Math.max(0, (v.total_venta || 0) - (v.valorpago || 0)),
          0
        )
      : 0

    return {
      data: { valorInventario, cuentasPorCobrar, utilidadBruta, ventasMes, ventasMesCount },
      error: null,
    }
  } catch (err: any) {
    console.log('[Dashboard] Excepcion en getDashboardMetrics:', err)
    return { data: DEFAULT_METRICS, error: err?.message || 'Error de conexion' }
  }
}

export async function getVentasVsCobros(
  razonSocialId: number | null,
  dias: number = 7
): Promise<{ data: VentasVsCobros[]; error: string | null }> {
  // Eje de dias en horario de Honduras (codificado como UTC para casar con las
  // columnas de dia-de-negocio HN-as-UTC). Evita que "hoy" caiga fuera del eje
  // por la noche (cuando toISOString() ya reporta el dia UTC siguiente).
  const baseUtcMs = new Date(`${getHondurasTodayISODate()}T00:00:00.000Z`).getTime()
  const result: VentasVsCobros[] = []
  for (let i = dias - 1; i >= 0; i--) {
    const fecha = new Date(baseUtcMs - i * 86400000).toISOString().slice(0, 10)
    result.push({ fecha, ventas: 0, cobros: 0 })
  }

  if (!isSupabaseConfigured()) return { data: result, error: null }

  const supabase = createClient()
  if (!supabase) return { data: result, error: 'Cliente no disponible' }
  if (razonSocialId == null) return { data: result, error: null }

  try {
    const startDate = new Date(baseUtcMs - (dias - 1) * 86400000).toISOString()

    const [ventasRes, pagosRes] = await Promise.all([
      fetchAllRows<{ total_venta: number; fecha_venta: string | null }>(() =>
        supabase
          .from('ventas_encabezado')
          .select('total_venta, fecha_venta')
          .eq('razon_social_id', razonSocialId)
          .gte('fecha_venta', startDate) as unknown as RangeableQuery
      ),
      fetchAllRows<{ monto: number; fecha_pago: string | null }>(() =>
        supabase
          .from('pagos_ventas')
          .select('monto, fecha_pago, ventas_encabezado!inner(razon_social_id)')
          .eq('ventas_encabezado.razon_social_id', razonSocialId)
          .gte('fecha_pago', startDate) as unknown as RangeableQuery
      ),
    ])

    if (ventasRes.error) console.log('[Dashboard] ventasVsCobros ventas error:', ventasRes.error)
    if (pagosRes.error) console.log('[Dashboard] ventasVsCobros pagos error:', pagosRes.error)

    ;(ventasRes.data || []).forEach((v: any) => {
      if (!v.fecha_venta) return
      const fecha = v.fecha_venta.split('T')[0]
      const item = result.find(r => r.fecha === fecha)
      if (item) item.ventas += v.total_venta || 0
    })

    ;(pagosRes.data || []).forEach((p: any) => {
      if (!p.fecha_pago) return
      const fecha = p.fecha_pago.split('T')[0]
      const item = result.find(r => r.fecha === fecha)
      if (item) item.cobros += p.monto || 0
    })

    return { data: result, error: null }
  } catch (err: any) {
    console.log('[Dashboard] Excepcion en getVentasVsCobros:', err)
    return { data: result, error: err?.message || 'Error de conexion' }
  }
}

export async function getTopProductos(
  razonSocialId: number | null,
  limit: number = 5
): Promise<{ data: TopProducto[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }

  const supabase = createClient()
  if (!supabase) return { data: [], error: 'Cliente no disponible' }
  if (razonSocialId == null) return { data: [], error: null }

  try {
    // Paginado: el ranking se calcula sobre TODO el histórico de líneas; sin esto,
    // con >1000 líneas el top y las cantidades salían mal.
    const { data, error } = await fetchAllRows<{ producto_id: number; cantidad: number; productos?: { nombre?: string } | null }>(() =>
      supabase
        .from('ventas_detalle')
        .select('producto_id, cantidad, productos(nombre), ventas_encabezado!inner(razon_social_id)')
        .eq('ventas_encabezado.razon_social_id', razonSocialId) as unknown as RangeableQuery
    )

    if (error) {
      console.log('[Dashboard] getTopProductos error:', error)
      return { data: [], error }
    }

    const aggregated: Record<number, { nombre: string; cantidad: number }> = {}
    ;(data || []).forEach((d: any) => {
      if (!aggregated[d.producto_id]) {
        aggregated[d.producto_id] = {
          nombre: d.productos?.nombre || 'Desconocido',
          cantidad: 0,
        }
      }
      aggregated[d.producto_id].cantidad += d.cantidad || 0
    })

    const sorted = Object.entries(aggregated)
      .map(([id, info]) => ({
        producto_id: parseInt(id),
        producto_nombre: info.nombre,
        cantidad_vendida: info.cantidad,
      }))
      .sort((a, b) => b.cantidad_vendida - a.cantidad_vendida)
      .slice(0, limit)

    return { data: sorted, error: null }
  } catch (err: any) {
    console.log('[Dashboard] Excepcion en getTopProductos:', err)
    return { data: [], error: err?.message || 'Error de conexion' }
  }
}

export async function getProductosStockBajo(
  razonSocialId: number | null,
  umbral: number = 5
): Promise<{ data: ProductoStockBajo[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }

  const supabase = createClient()
  if (!supabase) return { data: [], error: 'Cliente no disponible' }
  if (razonSocialId == null) return { data: [], error: null }

  try {
    const { data, error } = await supabase
      .from('productos')
      .select('id, nombre, codigo_barras, stock_total')
      .eq('razon_social_id', razonSocialId)
      .lt('stock_total', umbral)
      .order('stock_total', { ascending: true })

    if (error) {
      console.log('[Dashboard] getProductosStockBajo error:', error)
      return { data: [], error: error.message }
    }
    return { data: data || [], error: null }
  } catch (err: any) {
    console.log('[Dashboard] Excepcion en getProductosStockBajo:', err)
    return { data: [], error: err?.message || 'Error de conexion' }
  }
}

export async function getComprasPendientes(
  razonSocialId: number | null
): Promise<{ data: CompraPendiente[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }

  const supabase = createClient()
  if (!supabase) return { data: [], error: 'Cliente no disponible' }
  if (razonSocialId == null) return { data: [], error: null }

  try {
    const { data, error } = await supabase
      .from('compras_encabezado')
      .select('id, fecha_tentativa, total_compra_local, estado, proveedores(nombre)')
      .eq('razon_social_id', razonSocialId)
      .eq('estado', 'Pendiente')
      .order('fecha_tentativa', { ascending: true })

    if (error) {
      console.log('[Dashboard] getComprasPendientes error:', error)
      return { data: [], error: error.message }
    }

    const formatted: CompraPendiente[] = (data || []).map((c: any) => ({
      id: c.id,
      proveedor_nombre: c.proveedores?.nombre || 'Desconocido',
      fecha_tentativa: c.fecha_tentativa,
      total_compra_local: c.total_compra_local || 0,
      estado: c.estado,
    }))

    return { data: formatted, error: null }
  } catch (err: any) {
    console.log('[Dashboard] Excepcion en getComprasPendientes:', err)
    return { data: [], error: err?.message || 'Error de conexion' }
  }
}

export async function getTopClientesDeudores(
  razonSocialId: number | null,
  limit: number = 5
): Promise<{ data: ClienteDeudor[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }

  const supabase = createClient()
  if (!supabase) return { data: [], error: 'Cliente no disponible' }
  if (razonSocialId == null) return { data: [], error: null }

  try {
    // Paginado: la deuda por cliente suma TODAS las facturas abiertas del tenant.
    const { data: ventasData, error: ventasError } = await fetchAllRows<{ id: number; cliente_id: number; total_venta: number; clientes?: { nombre?: string } | null }>(() =>
      supabase
        .from('ventas_encabezado')
        .select('id, cliente_id, total_venta, clientes(nombre)')
        .eq('razon_social_id', razonSocialId)
        .neq('estado_pago', 'Pagado') as unknown as RangeableQuery
    )

    if (ventasError) {
      console.log('[Dashboard] getTopClientesDeudores ventas error:', ventasError)
      return { data: [], error: ventasError }
    }

    const ventaIds = (ventasData || []).map((v) => v.id)
    let pagosMap: Record<number, number> = {}

    if (ventaIds.length > 0) {
      // Chunked + paginado: los ids pueden ser >1000 y los pagos también.
      const { data: pagosData, error: pagosError } = await fetchAllRowsIn<{ venta_id: number; monto: number }>(
        ventaIds,
        (grupo) =>
          supabase
            .from('pagos_ventas')
            .select('venta_id, monto')
            .in('venta_id', grupo) as unknown as RangeableQuery
      )

      if (pagosError) console.log('[Dashboard] getTopClientesDeudores pagos error:', pagosError)

      pagosMap = (pagosData || []).reduce((acc: Record<number, number>, p) => {
        acc[p.venta_id] = (acc[p.venta_id] || 0) + p.monto
        return acc
      }, {})
    }

    const deudaCliente: Record<number, { nombre: string; deuda: number; facturas: number }> = {}

    ;(ventasData || []).forEach((v: any) => {
      const pagado = pagosMap[v.id] || 0
      const saldo = v.total_venta - pagado
      if (saldo > 0) {
        if (!deudaCliente[v.cliente_id]) {
          deudaCliente[v.cliente_id] = {
            nombre: v.clientes?.nombre || 'Desconocido',
            deuda: 0,
            facturas: 0,
          }
        }
        deudaCliente[v.cliente_id].deuda += saldo
        deudaCliente[v.cliente_id].facturas += 1
      }
    })

    const sorted = Object.entries(deudaCliente)
      .map(([id, info]) => ({
        cliente_id: parseInt(id),
        cliente_nombre: info.nombre,
        total_deuda: info.deuda,
        facturas_pendientes: info.facturas,
      }))
      .sort((a, b) => b.total_deuda - a.total_deuda)
      .slice(0, limit)

    return { data: sorted, error: null }
  } catch (err: any) {
    console.log('[Dashboard] Excepcion en getTopClientesDeudores:', err)
    return { data: [], error: err?.message || 'Error de conexion' }
  }
}
