import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { getTenantStamp, isValidStamp, SESION_INVALIDA_ERROR } from '@/lib/services/tenant-stamp'
import { aplicarEntradaCompra } from '@/lib/services/stock'
import { getHondurasNowISO } from '@/lib/utils/honduras-time'

// ==================== INTERFACES ====================

export interface CompraEncabezado {
  id?: number
  proveedor_id: number
  proveedor_nombre?: string
  fecha_orden?: string  // timestamp with time zone, defaults to now()
  fecha_tentativa: string  // date
  moneda: 'LPS' | 'USD'
  tasa_cambio: number  // numeric(12,4), default 1
  costos_importacion: number  // numeric(12,2), default 0
  impuestos_compra: number  // numeric(12,2), default 0
  otros_costos: number  // numeric(12,2), default 0
  total_compra_local: number  // numeric(12,2), default 0
  subtotal?: number
  total?: number
  estado: 'Pendiente' | 'Recibida' | 'Cancelada'
  created_at?: string
}

export interface CompraDetalle {
  id?: number
  compra_id: number
  producto_id: number
  producto_nombre?: string
  producto_codigo?: string
  cantidad: number
  cantidad_recibida?: number
  costo_unitario_moneda_origen: number
  costo_final_local?: number
}

export interface TransaccionInventario {
  id?: number
  producto_id: number
  almacen_id: number
  localizacion_id: number
  tipo_movimiento: 'Entrada Compra' | 'Salida Venta' | 'Traslado Entrada' | 'Traslado Salida' | 'Ajuste'
  cantidad: number
  costo_o_precio_unitario: number
  referencia_id: number
  fecha?: string  // defaults to now() in database
}

// ==================== ORDEN DE COMPRA ====================

export async function getCompras(estado?: string): Promise<{ data: CompraEncabezado[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('compras_encabezado')
    let compras: CompraEncabezado[] = saved ? JSON.parse(saved) : []
    if (estado) {
      compras = compras.filter(c => c.estado === estado)
    }
    return { data: compras, error: null }
  }

  const supabase = createClient()
  if (!supabase) return { data: [], error: 'Cliente no disponible' }

  try {
    let query = supabase
      .from('compras_encabezado')
      .select(`
        *,
        proveedores (nombre)
      `)
      .order('id', { ascending: false })

    if (estado) {
      query = query.eq('estado', estado)
    }

    const { data, error } = await query

    if (error) return { data: [], error: error.message }
    
    const formattedData = (data || []).map(c => ({
      ...c,
      proveedor_nombre: c.proveedores?.nombre || ''
    }))
    
    return { data: formattedData, error: null }
  } catch (err) {
    console.error('[Supabase] Error obteniendo compras:', err)
    return { data: [], error: 'Error de conexion' }
  }
}

export async function getCompraById(id: number): Promise<{ data: CompraEncabezado | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('compras_encabezado')
    const compras: CompraEncabezado[] = saved ? JSON.parse(saved) : []
    const compra = compras.find(c => c.id === id) || null
    return { data: compra, error: null }
  }

  const supabase = createClient()
  if (!supabase) return { data: null, error: 'Cliente no disponible' }

  try {
    const { data, error } = await supabase
      .from('compras_encabezado')
      .select(`
        *,
        proveedores (nombre)
      `)
      .eq('id', id)
      .single()

    if (error) return { data: null, error: error.message }
    
    return { 
      data: { ...data, proveedor_nombre: data.proveedores?.nombre || '' }, 
      error: null 
    }
  } catch (err) {
    console.error('[Supabase] Error obteniendo compra:', err)
    return { data: null, error: 'Error de conexion' }
  }
}

export async function getDetallesCompra(compraId: number): Promise<{ data: CompraDetalle[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem('compras_detalle')
    const detalles: CompraDetalle[] = saved ? JSON.parse(saved) : []
    return { data: detalles.filter(d => d.compra_id === compraId), error: null }
  }

  const supabase = createClient()
  if (!supabase) return { data: [], error: 'Cliente no disponible' }

  try {
    const { data, error } = await supabase
      .from('compras_detalle')
      .select(`
        *,
        productos (nombre, codigo_barras)
      `)
      .eq('compra_id', compraId)
      .order('id', { ascending: true })

    if (error) return { data: [], error: error.message }
    
    const formattedData = (data || []).map(d => ({
      ...d,
      producto_nombre: d.productos?.nombre || '',
      producto_codigo: d.productos?.codigo_barras || ''
    }))
    
    return { data: formattedData, error: null }
  } catch (err) {
    console.error('[Supabase] Error obteniendo detalles:', err)
    return { data: [], error: 'Error de conexion' }
  }
}

export async function createCompra(
  encabezado: Omit<CompraEncabezado, 'id' | 'created_at' | 'updated_at'>,
  detalles: Omit<CompraDetalle, 'id' | 'compra_id' | 'created_at'>[]
): Promise<{ data: CompraEncabezado | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const savedEnc = localStorage.getItem('compras_encabezado')
    const savedDet = localStorage.getItem('compras_detalle')
    const compras: CompraEncabezado[] = savedEnc ? JSON.parse(savedEnc) : []
    const allDetalles: CompraDetalle[] = savedDet ? JSON.parse(savedDet) : []
    
    const newCompra: CompraEncabezado = { 
      ...encabezado, 
      id: Date.now(),
      created_at: new Date().toISOString()
    }
    compras.push(newCompra)
    localStorage.setItem('compras_encabezado', JSON.stringify(compras))
    
    const newDetalles = detalles.map((d, idx) => ({
      ...d,
      id: Date.now() + idx + 1,
      compra_id: newCompra.id!,
      created_at: new Date().toISOString()
    }))
    allDetalles.push(...newDetalles)
    localStorage.setItem('compras_detalle', JSON.stringify(allDetalles))
    
    return { data: newCompra, error: null }
  }

  const supabase = createClient()
  if (!supabase) return { data: null, error: 'Cliente no disponible' }

  try {
    const stamp = await getTenantStamp(supabase)
    if (!isValidStamp(stamp)) {
      console.log('[createCompra] Stamp invalido:', stamp)
      return { data: null, error: SESION_INVALIDA_ERROR }
    }

    // Insert encabezado (sello completo: empresa + usuario que crea la orden).
    // fecha_orden HN-as-UTC (dia de negocio); si el caller ya la trae, gana.
    const { data: compraData, error: compraError } = await supabase
      .from('compras_encabezado')
      .insert({ fecha_orden: getHondurasNowISO(), ...encabezado, ...stamp })
      .select()
      .single()

    if (compraError) return { data: null, error: compraError.message }

    // Insert detalles (solo razon_social_id a nivel linea)
    const detallesConCompra = detalles.map(d => ({
      ...d,
      compra_id: compraData.id,
      razon_social_id: stamp.razon_social_id
    }))

    const { error: detallesError } = await supabase
      .from('compras_detalle')
      .insert(detallesConCompra)

    if (detallesError) {
      // Rollback: delete the encabezado
      await supabase.from('compras_encabezado').delete().eq('id', compraData.id)
      return { data: null, error: detallesError.message }
    }

    return { data: compraData, error: null }
  } catch (err) {
    console.error('[Supabase] Error creando compra:', err)
    return { data: null, error: 'Error de conexion' }
  }
}

// ==================== DELETE COMPRA ====================

export async function deleteCompra(compraId: number): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const savedEnc = localStorage.getItem('compras_encabezado')
    const savedDet = localStorage.getItem('compras_detalle')
    
    let compras: CompraEncabezado[] = savedEnc ? JSON.parse(savedEnc) : []
    let detalles: CompraDetalle[] = savedDet ? JSON.parse(savedDet) : []
    
    // Check if order is pending
    const compra = compras.find(c => c.id === compraId)
    if (!compra) return { success: false, error: 'Orden no encontrada' }
    if (compra.estado !== 'Pendiente') return { success: false, error: 'Solo se pueden eliminar ordenes pendientes' }
    
    // Delete
    compras = compras.filter(c => c.id !== compraId)
    detalles = detalles.filter(d => d.compra_id !== compraId)
    
    localStorage.setItem('compras_encabezado', JSON.stringify(compras))
    localStorage.setItem('compras_detalle', JSON.stringify(detalles))
    
    return { success: true, error: null }
  }

  const supabase = createClient()
  if (!supabase) return { success: false, error: 'Cliente no disponible' }

  try {
    // Check if order is pending
    const { data: compra, error: checkError } = await supabase
      .from('compras_encabezado')
      .select('estado')
      .eq('id', compraId)
      .single()

    if (checkError) return { success: false, error: checkError.message }
    if (compra.estado !== 'Pendiente') return { success: false, error: 'Solo se pueden eliminar ordenes pendientes' }

    // Delete details first
    const { error: detError } = await supabase
      .from('compras_detalle')
      .delete()
      .eq('compra_id', compraId)

    if (detError) return { success: false, error: detError.message }

    // Delete encabezado
    const { error: encError } = await supabase
      .from('compras_encabezado')
      .delete()
      .eq('id', compraId)

    if (encError) return { success: false, error: encError.message }

    return { success: true, error: null }
  } catch (err) {
    console.error('[Supabase] Error eliminando compra:', err)
    return { success: false, error: 'Error de conexion' }
  }
}

// ==================== RECEPCION Y PRORRATEO ====================

interface RecepcionData {
  compraId: number
  costos_importacion: number
  impuestos_compra: number
  otros_costos: number
  tasa_cambio: number
  almacen_id: number
  localizacion_id: number
  detalles: {
    detalle_id: number
    producto_id: number
    cantidad_recibida: number
    costo_final_local: number
  }[]
}

export async function procesarRecepcion(data: RecepcionData): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    // LocalStorage fallback
    const savedEnc = localStorage.getItem('compras_encabezado')
    const savedDet = localStorage.getItem('compras_detalle')
    const savedProd = localStorage.getItem('productos')
    const savedTrans = localStorage.getItem('transacciones_inventario')
    
    const compras: CompraEncabezado[] = savedEnc ? JSON.parse(savedEnc) : []
    const detalles: CompraDetalle[] = savedDet ? JSON.parse(savedDet) : []
    const productos: { id: number; costo_promedio: number; stock_total: number }[] = savedProd ? JSON.parse(savedProd) : []
    const transacciones: TransaccionInventario[] = savedTrans ? JSON.parse(savedTrans) : []
    
    // Calculate total_compra_local
    const totalCompraLocal = data.detalles.reduce((acc, d) => acc + (d.cantidad_recibida * d.costo_final_local), 0)
    
    // Update compra encabezado
    const compraIdx = compras.findIndex(c => c.id === data.compraId)
    if (compraIdx >= 0) {
      compras[compraIdx] = {
        ...compras[compraIdx],
        costos_importacion: data.costos_importacion,
        impuestos_compra: data.impuestos_compra,
        otros_costos: data.otros_costos,
        tasa_cambio: data.tasa_cambio,
        total_compra_local: totalCompraLocal,
        estado: 'Recibida'
      }
    }
    
    // Update detalles and products
    for (const item of data.detalles) {
      // Update detalle
      const detIdx = detalles.findIndex(d => d.id === item.detalle_id)
      if (detIdx >= 0) {
        detalles[detIdx] = {
          ...detalles[detIdx],
          cantidad_recibida: item.cantidad_recibida,
          costo_final_local: item.costo_final_local
        }
      }
      
      // Update product stock and average cost
      const prodIdx = productos.findIndex(p => p.id === item.producto_id)
      if (prodIdx >= 0) {
        const prod = productos[prodIdx]
        const stockActual = prod.stock_total || 0
        const costoActual = prod.costo_promedio || 0
        const cantRecibida = item.cantidad_recibida
        const costoFinal = item.costo_final_local
        
        // Weighted average cost formula
        const nuevoStock = stockActual + cantRecibida
        const nuevoCosto = nuevoStock > 0 
          ? ((stockActual * costoActual) + (cantRecibida * costoFinal)) / nuevoStock
          : costoFinal
        
        productos[prodIdx] = {
          ...prod,
          stock_total: nuevoStock,
          costo_promedio: nuevoCosto
        }
      }
      
      // Create inventory transaction
      transacciones.push({
        id: Date.now() + Math.random(),
        producto_id: item.producto_id,
        almacen_id: data.almacen_id,
        localizacion_id: data.localizacion_id,
        tipo_movimiento: 'Entrada Compra',
        cantidad: item.cantidad_recibida,
        costo_o_precio_unitario: item.costo_final_local,
        referencia_id: data.compraId,
        fecha: getHondurasNowISO()
      })
    }
    
    localStorage.setItem('compras_encabezado', JSON.stringify(compras))
    localStorage.setItem('compras_detalle', JSON.stringify(detalles))
    localStorage.setItem('productos', JSON.stringify(productos))
    localStorage.setItem('transacciones_inventario', JSON.stringify(transacciones))
    
    return { success: true, error: null }
  }

  const supabase = createClient()
  if (!supabase) return { success: false, error: 'Cliente no disponible' }

  try {
    const stamp = await getTenantStamp(supabase)
    if (!isValidStamp(stamp)) {
      console.log('[procesarRecepcion] Stamp invalido:', stamp)
      return { success: false, error: SESION_INVALIDA_ERROR }
    }

    // Calculate total_compra_local
    const totalCompraLocal = data.detalles.reduce((acc, d) => acc + (d.cantidad_recibida * d.costo_final_local), 0)
    
    // 1. Update compra encabezado (no alteramos razon_social_id ni usuario
    // originales para preservar aislamiento e historial de autoria)
    const { error: encError } = await supabase
      .from('compras_encabezado')
      .update({
        costos_importacion: data.costos_importacion,
        impuestos_compra: data.impuestos_compra,
        otros_costos: data.otros_costos,
        tasa_cambio: data.tasa_cambio,
        total_compra_local: totalCompraLocal,
        estado: 'Recibida'
      })
      .eq('id', data.compraId)

    if (encError) return { success: false, error: encError.message }

    // 2. Process each detail
    for (const item of data.detalles) {
      // Update detalle
      const { error: detError } = await supabase
        .from('compras_detalle')
        .update({
          cantidad_recibida: item.cantidad_recibida,
          costo_final_local: item.costo_final_local
        })
        .eq('id', item.detalle_id)

      if (detError) return { success: false, error: detError.message }

      // Entrada de mercancia: suma stock y recalcula costo promedio ponderado
      // de forma ATOMICA (evita la condicion de carrera si dos recepciones del
      // mismo producto ocurren a la vez). Ver lib/services/stock.ts + script 018.
      const entrada = await aplicarEntradaCompra(
        supabase,
        item.producto_id,
        item.cantidad_recibida,
        item.costo_final_local
      )
      if (entrada.error) return { success: false, error: entrada.error }

      // Insert inventory transaction (sello completo: empresa + usuario
      // que procesa la recepcion, que puede diferir de quien creo la orden)
      const { error: transError } = await supabase
        .from('transacciones_inventario')
        .insert({
          producto_id: item.producto_id,
          almacen_id: data.almacen_id,
          localizacion_id: data.localizacion_id,
          tipo_movimiento: 'Entrada Compra',
          cantidad: item.cantidad_recibida,
          costo_o_precio_unitario: item.costo_final_local,
          referencia_id: data.compraId,
          // Fecha HN-as-UTC (dia de negocio): el kardex la muestra con split.
          fecha: getHondurasNowISO(),
          ...stamp
        })

      if (transError) return { success: false, error: transError.message }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('[Supabase] Error procesando recepcion:', err)
    return { success: false, error: 'Error de conexion' }
  }
}

// ==================== HELPERS: PRORRATEO ====================

/**
 * Una linea del desglose del prorrateo, con TODOS los pasos intermedios
 * explicitos para que el usuario vea exactamente como se calcula el costo.
 */
export interface ProrrateoLinea {
  detalle_id: number
  producto_id: number
  producto_nombre?: string
  cantidad: number
  costo_unitario_origen: number
  /** cantidad * costo_unitario_origen (en moneda de origen) */
  valor_origen: number
  /** valor_origen convertido a Lempiras (× tasa si es USD) */
  valor_local: number
  /** participacion de la linea en el subtotal (0..1) */
  proporcion: number
  /** costos adicionales asignados a esta linea = costosAdicionales × proporcion */
  costos_asignados: number
  /** valor_local + costos_asignados */
  costo_total_linea: number
  /** costo_total_linea / cantidad (el costo final que entra al inventario) */
  costo_final_unitario: number
}

export interface ProrrateoResultado {
  lineas: ProrrateoLinea[]
  moneda: 'LPS' | 'USD'
  tasaCambio: number
  costosAdicionales: number
  /** subtotal de la mercancia en moneda de origen */
  subtotalOrigen: number
  /** subtotal de la mercancia en Lempiras */
  subtotalLocal: number
  /** suma de costos asignados (debe cuadrar con costosAdicionales) */
  totalCostosAsignados: number
  /** subtotalLocal + costosAdicionales (valor total del inventario recibido) */
  totalFinal: number
}

/**
 * Prorrateo detallado: reparte los costos adicionales (importacion, impuestos,
 * otros) entre las lineas EN PROPORCION a su valor, y devuelve cada paso del
 * calculo para mostrarlo en pantalla.
 *
 * Formula por linea:
 *   valor_local        = cantidad × costo_unit_origen × (USD ? tasa : 1)
 *   proporcion         = valor_local / subtotal_local
 *   costos_asignados   = costos_adicionales × proporcion
 *   costo_final_unit   = (valor_local + costos_asignados) / cantidad
 */
export function calcularProrrateoDetallado(
  detalles: CompraDetalle[],
  costosAdicionales: number,
  moneda: 'LPS' | 'USD',
  tasaCambio: number
): ProrrateoResultado {
  const tasa = moneda === 'USD' ? tasaCambio : 1
  const subtotalOrigen = detalles.reduce((acc, d) => acc + d.cantidad * d.costo_unitario_moneda_origen, 0)
  const subtotalLocal = subtotalOrigen * tasa

  let totalCostosAsignados = 0
  const lineas: ProrrateoLinea[] = detalles.map((d) => {
    const valorOrigen = d.cantidad * d.costo_unitario_moneda_origen
    const valorLocal = valorOrigen * tasa
    const proporcion = subtotalLocal > 0 ? valorLocal / subtotalLocal : 0
    const costosAsignados = costosAdicionales * proporcion
    const costoTotalLinea = valorLocal + costosAsignados
    const costoFinalUnitario = d.cantidad > 0 ? costoTotalLinea / d.cantidad : 0
    totalCostosAsignados += costosAsignados

    return {
      detalle_id: d.id!,
      producto_id: d.producto_id,
      producto_nombre: d.producto_nombre,
      cantidad: d.cantidad,
      costo_unitario_origen: d.costo_unitario_moneda_origen,
      valor_origen: +valorOrigen.toFixed(2),
      valor_local: +valorLocal.toFixed(2),
      proporcion,
      costos_asignados: +costosAsignados.toFixed(2),
      costo_total_linea: +costoTotalLinea.toFixed(2),
      costo_final_unitario: Math.round(costoFinalUnitario * 100) / 100,
    }
  })

  return {
    lineas,
    moneda,
    tasaCambio: tasa,
    costosAdicionales: +costosAdicionales.toFixed(2),
    subtotalOrigen: +subtotalOrigen.toFixed(2),
    subtotalLocal: +subtotalLocal.toFixed(2),
    totalCostosAsignados: +totalCostosAsignados.toFixed(2),
    totalFinal: +(subtotalLocal + costosAdicionales).toFixed(2),
  }
}

/**
 * Version compacta (compatibilidad con los llamadores existentes): usa el
 * calculo detallado y devuelve solo el costo final por linea.
 */
export function calcularProrrateo(
  detalles: CompraDetalle[],
  costosAdicionales: number,
  moneda: 'LPS' | 'USD',
  tasaCambio: number
): { detalle_id: number; producto_id: number; cantidad: number; costo_final_local: number }[] {
  return calcularProrrateoDetallado(detalles, costosAdicionales, moneda, tasaCambio).lineas.map((l) => ({
    detalle_id: l.detalle_id,
    producto_id: l.producto_id,
    cantidad: l.cantidad,
    costo_final_local: l.costo_final_unitario,
  }))
}
