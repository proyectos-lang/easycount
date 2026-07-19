import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { getTenantStamp, isValidStamp, SESION_INVALIDA_ERROR } from "@/lib/services/tenant-stamp"
import { ajustarStock } from "@/lib/services/stock"
import { registrarMovimientoCaja } from "@/lib/services/caja-chica"
import { registrarMovimientoCuenta } from "@/lib/services/cuentas"

// ==================== TIPOS ====================

export interface DevolucionLineaInput {
  venta_detalle_id: number
  producto_id: number
  cantidad_devuelta: number
  precio_unitario: number
  costo_promedio_momento: number
}

export interface CrearDevolucionInput {
  venta_id: number
  lineas: DevolucionLineaInput[]
  destino: { tipo: "caja" | "cuenta"; cuenta_id?: number | null }
  motivo?: string
}

export interface DevolucionEncabezado {
  id: number
  venta_id: number
  numero_devolucion: string | null
  fecha: string
  motivo: string | null
  monto_total: number
  destino_reembolso: "caja" | "cuenta"
  cuenta_id: number | null
  usuario: string | null
  // joined
  numero_factura?: string
  cliente_nombre?: string
}

/** Marca la ausencia de las tablas (script 020 no aplicado). */
export const DEVOLUCIONES_FEATURE_PENDING =
  "Funcion de devoluciones pendiente: aplica scripts/020-devoluciones.sql"

function isMissingTable(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false
  const msg = (err.message || "").toLowerCase()
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    /relation .*devoluciones.* does not exist/.test(msg) ||
    msg.includes("could not find the table")
  )
}

// El valor ideal para el kardex; si la BD tuviera un CHECK que lo rechace,
// se reintenta con un tipo ya permitido (no se altera la tabla).
const TIPO_MOV_DEVOLUCION = "Entrada Devolucion"
const TIPO_MOV_FALLBACK = "Ingreso Manual"

// ==================== CONSULTAS ====================

/**
 * Cantidad ya devuelta por cada `venta_detalle_id` de una venta. Sirve para
 * topar cuanto mas se puede devolver por linea.
 */
export async function getCantidadesDevueltasPorVenta(
  ventaId: number
): Promise<{ data: Record<number, number>; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: {}, error: null }
  const supabase = createClient()
  if (!supabase) return { data: {}, error: "Cliente no disponible" }

  const { data, error } = await supabase
    .from("devoluciones_detalle")
    .select("venta_detalle_id, cantidad_devuelta, devoluciones_encabezado!inner(venta_id)")
    .eq("devoluciones_encabezado.venta_id", ventaId)

  if (error) {
    if (isMissingTable(error)) return { data: {}, error: null }
    return { data: {}, error: error.message }
  }

  const mapa: Record<number, number> = {}
  for (const r of data || []) {
    const id = Number(r.venta_detalle_id)
    mapa[id] = (mapa[id] || 0) + Number(r.cantidad_devuelta || 0)
  }
  return { data: mapa, error: null }
}

/** Historial de devoluciones del tenant (con factura y cliente). */
export async function getDevoluciones(): Promise<{ data: DevolucionEncabezado[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { data: [], error: null }
  const supabase = createClient()
  if (!supabase) return { data: [], error: "Cliente no disponible" }

  const { data, error } = await supabase
    .from("devoluciones_encabezado")
    .select("*, ventas_encabezado:venta_id (numero_factura, clientes:cliente_id (nombre))")
    .order("fecha", { ascending: false })
    .limit(500)

  if (error) {
    if (isMissingTable(error)) return { data: [], error: DEVOLUCIONES_FEATURE_PENDING }
    return { data: [], error: error.message }
  }

  const rows: DevolucionEncabezado[] = (data || []).map((d) => {
    const venta = Array.isArray(d.ventas_encabezado) ? d.ventas_encabezado[0] : d.ventas_encabezado
    const cliente = venta ? (Array.isArray(venta.clientes) ? venta.clientes[0] : venta.clientes) : null
    return {
      ...(d as DevolucionEncabezado),
      numero_factura: (venta as { numero_factura?: string } | null)?.numero_factura || "",
      cliente_nombre: (cliente as { nombre?: string } | null)?.nombre || "",
    }
  })
  return { data: rows, error: null }
}

/**
 * Totales de devoluciones de un mes: monto vendido devuelto y costo devuelto.
 * Usado para netear ventas y CMV en el estado de resultados.
 */
export async function getDevolucionesDelPeriodo(
  anio: number,
  mes: number
): Promise<{ montoVentas: number; montoCosto: number; error: string | null }> {
  if (!isSupabaseConfigured()) return { montoVentas: 0, montoCosto: 0, error: null }
  const supabase = createClient()
  if (!supabase) return { montoVentas: 0, montoCosto: 0, error: "Cliente no disponible" }

  const desde = `${anio}-${String(mes).padStart(2, "0")}-01T00:00:00`
  const finMes = new Date(anio, mes, 0).getDate()
  const hasta = `${anio}-${String(mes).padStart(2, "0")}-${finMes}T23:59:59`

  const { data, error } = await supabase
    .from("devoluciones_detalle")
    .select("cantidad_devuelta, precio_unitario, costo_promedio_momento, devoluciones_encabezado!inner(fecha)")
    .gte("devoluciones_encabezado.fecha", desde)
    .lte("devoluciones_encabezado.fecha", hasta)

  if (error) {
    if (isMissingTable(error)) return { montoVentas: 0, montoCosto: 0, error: null }
    return { montoVentas: 0, montoCosto: 0, error: error.message }
  }

  let montoVentas = 0
  let montoCosto = 0
  for (const r of data || []) {
    const cant = Number(r.cantidad_devuelta || 0)
    montoVentas += cant * Number(r.precio_unitario || 0)
    montoCosto += cant * Number(r.costo_promedio_momento || 0)
  }
  return { montoVentas: +montoVentas.toFixed(2), montoCosto: +montoCosto.toFixed(2), error: null }
}

// ==================== CREAR DEVOLUCION ====================

export async function crearDevolucion(
  input: CrearDevolucionInput
): Promise<{ data: { id: number; numero_devolucion: string } | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: "Supabase no configurado" }
  }
  const supabase = createClient()
  if (!supabase) return { data: null, error: "Cliente no disponible" }

  const stamp = await getTenantStamp(supabase)
  if (!isValidStamp(stamp)) return { data: null, error: SESION_INVALIDA_ERROR }
  const tenantId = stamp.razon_social_id

  const lineas = (input.lineas || []).filter((l) => l.cantidad_devuelta > 0)
  if (lineas.length === 0) return { data: null, error: "Seleccione al menos un producto a devolver" }
  if (input.destino.tipo === "cuenta" && !input.destino.cuenta_id) {
    return { data: null, error: "Seleccione la cuenta para el reembolso" }
  }

  // 1) La venta debe ser del tenant.
  const { data: venta, error: ventaErr } = await supabase
    .from("ventas_encabezado")
    .select("id, almacen_id, razon_social_id")
    .eq("id", input.venta_id)
    .eq("razon_social_id", tenantId)
    .single()
  if (ventaErr || !venta) return { data: null, error: "La venta no existe o no pertenece a tu empresa" }

  // 2) Validar cantidades vs. vendido - ya devuelto.
  const { data: detallesVenta, error: detErr } = await supabase
    .from("ventas_detalle")
    .select("id, producto_id, cantidad")
    .eq("venta_id", input.venta_id)
    .eq("razon_social_id", tenantId)
  if (detErr) return { data: null, error: detErr.message }

  const yaDevuelto = await getCantidadesDevueltasPorVenta(input.venta_id)
  for (const l of lineas) {
    const dv = (detallesVenta || []).find((d) => d.id === l.venta_detalle_id)
    if (!dv) return { data: null, error: "Una linea no corresponde a la factura" }
    const disponible = Number(dv.cantidad || 0) - (yaDevuelto.data[l.venta_detalle_id] || 0)
    if (l.cantidad_devuelta > disponible + 1e-9) {
      return { data: null, error: `No puedes devolver mas de lo vendido/pendiente en un producto (max ${disponible})` }
    }
  }

  const montoTotal = +lineas.reduce((a, l) => a + l.cantidad_devuelta * l.precio_unitario, 0).toFixed(2)

  // 3) Correlativo DEV-XXXX.
  const { count } = await supabase
    .from("devoluciones_encabezado")
    .select("*", { count: "exact", head: true })
  const numeroDevolucion = `DEV-${((count || 0) + 1).toString().padStart(4, "0")}`

  // 4) Insertar encabezado.
  const { data: enc, error: encErr } = await supabase
    .from("devoluciones_encabezado")
    .insert({
      venta_id: input.venta_id,
      numero_devolucion: numeroDevolucion,
      motivo: input.motivo || null,
      monto_total: montoTotal,
      destino_reembolso: input.destino.tipo,
      cuenta_id: input.destino.tipo === "cuenta" ? input.destino.cuenta_id : null,
      ...stamp,
    })
    .select("id")
    .single()
  if (encErr) {
    if (isMissingTable(encErr)) return { data: null, error: DEVOLUCIONES_FEATURE_PENDING }
    return { data: null, error: encErr.message }
  }
  const devolucionId = enc.id as number

  // 5) Insertar detalle.
  const detalleRows = lineas.map((l) => ({
    devolucion_id: devolucionId,
    venta_detalle_id: l.venta_detalle_id,
    producto_id: l.producto_id,
    cantidad_devuelta: l.cantidad_devuelta,
    precio_unitario: l.precio_unitario,
    costo_promedio_momento: l.costo_promedio_momento,
    subtotal: +(l.cantidad_devuelta * l.precio_unitario).toFixed(2),
    ...stamp,
  }))
  const { error: detInsErr } = await supabase.from("devoluciones_detalle").insert(detalleRows)
  if (detInsErr) {
    // Rollback minimo del encabezado.
    await supabase.from("devoluciones_encabezado").delete().eq("id", devolucionId)
    return { data: null, error: detInsErr.message }
  }

  // 6) Inventario: devolver stock + fila de kardex por linea.
  //    Reusa el almacen/localizacion de la salida original de la venta.
  const { data: salidas } = await supabase
    .from("transacciones_inventario")
    .select("producto_id, almacen_id, localizacion_id, costo_o_precio_unitario")
    .eq("referencia_id", input.venta_id)
    .eq("tipo_movimiento", "Salida Venta")
    .eq("razon_social_id", tenantId)

  const salidaPorProducto = new Map<number, { almacen_id: number; localizacion_id: number; costo: number }>()
  for (const s of salidas || []) {
    if (!salidaPorProducto.has(s.producto_id)) {
      salidaPorProducto.set(s.producto_id, {
        almacen_id: s.almacen_id,
        localizacion_id: s.localizacion_id,
        costo: Number(s.costo_o_precio_unitario || 0),
      })
    }
  }

  for (const l of lineas) {
    await ajustarStock(supabase, l.producto_id, l.cantidad_devuelta, tenantId)

    const ref = salidaPorProducto.get(l.producto_id)
    if (ref) {
      const filaKardex = {
        producto_id: l.producto_id,
        almacen_id: ref.almacen_id,
        localizacion_id: ref.localizacion_id,
        tipo_movimiento: TIPO_MOV_DEVOLUCION,
        cantidad: l.cantidad_devuelta,
        costo_o_precio_unitario: ref.costo || l.costo_promedio_momento,
        referencia_id: devolucionId,
        ...stamp,
      }
      const { error: kErr } = await supabase.from("transacciones_inventario").insert(filaKardex)
      // Si un CHECK rechaza el tipo nuevo, reintenta con un tipo permitido
      // (NO se altera la tabla).
      if (kErr && /check constraint|violates check/i.test(kErr.message || "")) {
        await supabase
          .from("transacciones_inventario")
          .insert({ ...filaKardex, tipo_movimiento: TIPO_MOV_FALLBACK })
      }
    }
  }

  // 7) Reembolso de dinero (salida real, al destino elegido).
  let dineroErr: string | null = null
  if (input.destino.tipo === "caja") {
    const res = await registrarMovimientoCaja({
      tipo: "Salida",
      monto: montoTotal,
      concepto: `Devolución ${numeroDevolucion}`,
      ref_tipo: "devolucion",
      ref_id: devolucionId,
    })
    dineroErr = res.error
  } else {
    const res = await registrarMovimientoCuenta({
      cuenta_id: input.destino.cuenta_id!,
      tipo: "Egreso",
      monto: montoTotal,
      concepto: `Devolución ${numeroDevolucion}`,
      ref_tipo: "devolucion",
      ref_id: devolucionId,
    })
    dineroErr = res.error
  }

  if (dineroErr) {
    // El inventario y los registros ya se hicieron; informamos para que el
    // usuario registre el reembolso a mano (misma politica que en ventas).
    return {
      data: { id: devolucionId, numero_devolucion: numeroDevolucion },
      error: `Devolución registrada, pero el reembolso de dinero falló: ${dineroErr}. Regístralo manualmente en Finanzas.`,
    }
  }

  return { data: { id: devolucionId, numero_devolucion: numeroDevolucion }, error: null }
}
