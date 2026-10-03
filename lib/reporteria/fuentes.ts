import type { SupabaseClient } from "@supabase/supabase-js"
import type { ColumnaDef, TipoColumna } from "@/lib/reporteria/motor"
import { codigoOrden } from "@/lib/services/produccion-ordenes"

/**
 * Catálogo de FUENTES de Reportería: cada fuente define sus columnas (con
 * tipo) y cómo cargar sus filas planas, ya acotadas al período por la fecha
 * indicada en `fecha`. Las fuentes "foto" (sin fecha) ignoran el período o
 * lo aplican a sus métricas (clientes, proveedores).
 *
 * Portado de Officemart y adaptado al esquema de EasyCount (`docs/DATABASE.md`):
 * sin vendedores/zonas/puntos de facturación, sin anulación de ventas, sin
 * cotizaciones, comisiones, recepciones parciales, pagos a OC ni CRM.
 * Las lecturas van por `ctx.supabase` (RLS acota al tenant) y se paginan de
 * 1000 en 1000 (tope de PostgREST).
 */

export type Sistema = "Ventas" | "Compras" | "Inventario" | "Producción" | "Finanzas" | "Clientes y proveedores" | "RRHH"
export const SISTEMAS: Sistema[] = ["Ventas", "Compras", "Inventario", "Producción", "Finanzas", "Clientes y proveedores", "RRHH"]

export interface CtxCarga {
  supabase: SupabaseClient
  desde: string | null
  hasta: string | null
  hoy: string
}

export interface FuenteReporte {
  id: string
  sistema: Sistema
  nombre: string
  descripcion: string
  /** Qué fecha filtra el período; null = foto actual (sin período). */
  fecha: string | null
  columnas: ColumnaDef[]
  cargar: (ctx: CtxCarga) => Promise<Record<string, unknown>[]>
}

// ==================== AYUDAS ====================

type Fila = Record<string, unknown>
type Resp = { data: unknown[] | null; error: { message: string } | null }

const c = (key: string, label: string, tipo: TipoColumna, porDefecto = false, sumable?: boolean): ColumnaDef => ({ key, label, tipo, porDefecto, ...(sumable === false ? { sumable } : {}) })
const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100
const num = (v: unknown) => Number(v) || 0
const pad = (id: unknown, p: string) => (id == null ? null : `${p}-${String(id).padStart(4, "0")}`)
const siNo = (v: unknown) => v === true
const txt = (v: unknown): string | null => (v == null ? null : String(v))

async function todas(fn: (a: number, b: number) => PromiseLike<Resp>): Promise<Fila[]> {
  const out: Fila[] = []
  for (let a = 0; a < 500_000; a += 1000) {
    const { data, error } = await fn(a, a + 999)
    if (error) throw new Error(error.message)
    out.push(...((data || []) as Fila[]))
    if ((data || []).length < 1000) break
  }
  return out
}

interface FiltroRango<Q> { gte(col: string, v: unknown): Q; lte(col: string, v: unknown): Q }
/** Aplica el período a una columna timestamptz (o date si `soloFecha`). */
function rango<Q extends FiltroRango<Q>>(q: Q, col: string, ctx: CtxCarga, soloFecha = false): Q {
  let r = q
  if (ctx.desde) r = r.gte(col, soloFecha ? ctx.desde : `${ctx.desde}T00:00:00.000Z`)
  if (ctx.hasta) r = r.lte(col, soloFecha ? ctx.hasta : `${ctx.hasta}T23:59:59.999Z`)
  return r
}

/** ¿La fecha (ISO) cae dentro del período? Para filtrar en memoria. */
function enPeriodo(iso: unknown, ctx: CtxCarga): boolean {
  if (iso == null) return !ctx.desde && !ctx.hasta
  const d = String(iso).slice(0, 10)
  return (!ctx.desde || d >= ctx.desde) && (!ctx.hasta || d <= ctx.hasta)
}

/** Diccionario id → fila de una tabla de catálogo (memoizado por carga). */
function diccionarios(supabase: SupabaseClient) {
  const cache = new Map<string, Promise<Map<number, Fila>>>()
  return (tabla: string, cols = "id, nombre"): Promise<Map<number, Fila>> => {
    const k = `${tabla}|${cols}`
    if (!cache.has(k)) {
      cache.set(k, todas((a, b) => supabase.from(tabla).select(cols).range(a, b)).then((rows) => new Map(rows.map((r) => [Number(r.id), r]))).catch(() => new Map()))
    }
    return cache.get(k)!
  }
}
const nom = (m: Map<number, Fila>, id: unknown, campo = "nombre"): string | null => (id == null ? null : ((m.get(Number(id))?.[campo] as string) ?? null))

/** Filas de una tabla por ids (en lotes). */
async function porIds(supabase: SupabaseClient, tabla: string, cols: string, ids: unknown[], campo = "id"): Promise<Fila[]> {
  const unicos = [...new Set(ids.filter((x) => x != null).map(Number))]
  const out: Fila[] = []
  for (let i = 0; i < unicos.length; i += 200) {
    const { data, error } = await supabase.from(tabla).select(cols).in(campo, unicos.slice(i, i + 200))
    if (error) throw new Error(error.message)
    out.push(...((data || []) as unknown as Fila[]))
  }
  return out
}

function diasEntre(a: string, b: string): number {
  return Math.round((Date.parse(`${b.slice(0, 10)}T00:00:00Z`) - Date.parse(`${a.slice(0, 10)}T00:00:00Z`)) / 86_400_000)
}
function rangoAntiguedad(dias: number): string {
  if (dias <= 0) return "Corriente"
  if (dias <= 30) return "1–30 días"
  if (dias <= 60) return "31–60 días"
  if (dias <= 90) return "61–90 días"
  return "Más de 90 días"
}
function horasEntre(inicio: unknown, fin: unknown): number | null {
  if (!inicio || !fin) return null
  const ms = Date.parse(String(fin)) - Date.parse(String(inicio))
  return Number.isFinite(ms) ? r2(ms / 3_600_000) : null
}

/** `ref_tipo` que escriben los servicios en cuenta_movimientos / caja_chica_movimientos. */
const ORIGEN_TESORERIA: Record<string, string> = {
  venta: "Venta", gasto: "Pago de gasto", devolucion: "Devolución", transferencia: "Transferencia entre cuentas",
  apertura: "Saldo inicial", caja_chica_mov: "Traslado desde caja chica", nomina: "Nómina",
}
const origen = (ref: unknown) => (ref ? ORIGEN_TESORERIA[String(ref)] ?? String(ref) : "Manual")

// ==================== VENTAS ====================

const ventasFacturas: FuenteReporte = {
  id: "ventas_facturas", sistema: "Ventas", nombre: "Facturas de venta",
  descripcion: "Una fila por factura: cliente, almacén, subtotal, descuento, ISV, total, pagado, saldo y estado de pago.",
  fecha: "Fecha de la factura",
  columnas: [
    c("fecha", "Fecha", "fechahora", true), c("numero_factura", "Factura", "texto", true), c("numero_fiscal", "Número fiscal (CAI)", "texto"),
    c("cliente", "Cliente", "texto", true), c("rtn", "RTN cliente", "texto"), c("almacen", "Almacén", "texto"),
    c("subtotal", "Subtotal (bruto)", "moneda", true), c("descuento_pct", "Descuento %", "porcentaje"), c("descuento", "Descuento", "moneda"),
    c("impuesto", "ISV", "moneda", true), c("total", "Total", "moneda", true), c("pagado", "Pagado", "moneda", true), c("saldo", "Saldo", "moneda", true),
    c("estado_pago", "Estado de pago", "texto", true), c("tipo_pago", "Tipo de pago", "texto"), c("usuario", "Registrada por", "texto"),
  ],
  async cargar(ctx) {
    const dic = diccionarios(ctx.supabase)
    const [v, cli, alm] = await Promise.all([
      todas((a, b) => rango(ctx.supabase.from("ventas_encabezado").select("*"), "fecha_venta", ctx).order("fecha_venta").range(a, b)),
      dic("clientes", "id, nombre, rtn"), dic("almacenes"),
    ])
    return v.map((r) => {
      const cl = cli.get(Number(r.cliente_id))
      const desc = r2((num(r.subtotal) * num(r.descuento)) / 100)
      return {
        fecha: r.fecha_venta, numero_factura: r.numero_factura, numero_fiscal: r.numero_fiscal, cliente: cl?.nombre ?? null, rtn: cl?.rtn ?? null,
        almacen: nom(alm, r.almacen_id), subtotal: num(r.subtotal), descuento_pct: num(r.descuento), descuento: desc, impuesto: num(r.impuesto_total),
        total: num(r.total_venta), pagado: num(r.valorpago), saldo: r2(num(r.total_venta) - num(r.valorpago)), estado_pago: r.estado_pago,
        tipo_pago: r.tipo_pago, usuario: r.usuario,
      }
    })
  },
}

const ventasProductos: FuenteReporte = {
  id: "ventas_productos", sistema: "Ventas", nombre: "Ventas por producto (líneas)",
  descripcion: "Una fila por línea vendida: producto, categoría, subcategoría, marca, cantidad, venta, costo, utilidad y margen.",
  fecha: "Fecha de la factura",
  columnas: [
    c("fecha", "Fecha", "fecha", true), c("numero_factura", "Factura", "texto", true), c("cliente", "Cliente", "texto", true), c("almacen", "Almacén", "texto"),
    c("producto", "Producto", "texto", true), c("codigo", "Código", "texto"), c("categoria", "Categoría", "texto", true), c("subcategoria", "Subcategoría", "texto"),
    c("marca", "Marca", "texto"), c("cantidad", "Cantidad", "numero", true), c("precio_unitario", "Precio unitario", "moneda", false, false),
    c("venta", "Venta", "moneda", true), c("costo_unitario", "Costo unitario", "moneda", false, false), c("costo", "Costo", "moneda", true),
    c("utilidad", "Utilidad", "moneda", true), c("margen", "Margen %", "porcentaje"),
  ],
  async cargar(ctx) {
    const dic = diccionarios(ctx.supabase)
    const v = await todas((a, b) => rango(ctx.supabase.from("ventas_encabezado").select("id, fecha_venta, numero_factura, cliente_id, almacen_id"), "fecha_venta", ctx).order("fecha_venta").range(a, b))
    const vm = new Map(v.map((x) => [Number(x.id), x]))
    const [d, prod, cat, sub, mar, cli, alm] = await Promise.all([
      porIds(ctx.supabase, "ventas_detalle", "*", v.map((x) => x.id), "venta_id"),
      dic("productos", "id, nombre, codigo_barras, categoria_id, subcategoria_id, marca_id"), dic("categorias"), dic("subcategorias"), dic("marcas"), dic("clientes"), dic("almacenes"),
    ])
    return d.map((r) => {
      const ve = vm.get(Number(r.venta_id))
      const p = prod.get(Number(r.producto_id))
      const cant = num(r.cantidad), precio = num(r.precio_unitario), cu = num(r.costo_promedio_momento)
      const venta = r2(cant * precio), costo = r2(cant * cu)
      const utilidad = r.utilidad_linea != null ? r2(num(r.utilidad_linea)) : r2(venta - costo)
      return {
        fecha: ve?.fecha_venta ?? null, numero_factura: ve?.numero_factura ?? null, cliente: nom(cli, ve?.cliente_id), almacen: nom(alm, ve?.almacen_id),
        producto: p?.nombre ?? null, codigo: p?.codigo_barras ?? null, categoria: nom(cat, p?.categoria_id), subcategoria: nom(sub, p?.subcategoria_id), marca: nom(mar, p?.marca_id),
        cantidad: cant, precio_unitario: precio, venta, costo_unitario: cu, costo, utilidad, margen: venta ? r2((utilidad / venta) * 100) : null,
      }
    }).sort((x, y) => String(x.fecha ?? "").localeCompare(String(y.fecha ?? "")))
  },
}

const ventasCobros: FuenteReporte = {
  id: "ventas_cobros", sistema: "Ventas", nombre: "Cobros y abonos de clientes",
  descripcion: "Abonos registrados a facturas al crédito después de la venta (cuentas por cobrar).",
  fecha: "Fecha del abono",
  columnas: [c("fecha", "Fecha", "fechahora", true), c("factura", "Factura", "texto", true), c("cliente", "Cliente", "texto", true), c("metodo", "Método", "texto", true), c("monto", "Monto", "moneda", true), c("usuario", "Registrado por", "texto")],
  async cargar(ctx) {
    const dic = diccionarios(ctx.supabase)
    const p = await todas((a, b) => rango(ctx.supabase.from("pagos_ventas").select("*"), "fecha_pago", ctx).order("fecha_pago").range(a, b))
    const [ventas, cli] = await Promise.all([porIds(ctx.supabase, "ventas_encabezado", "id, numero_factura, cliente_id", p.map((x) => x.venta_id)), dic("clientes")])
    const vm = new Map(ventas.map((v) => [Number(v.id), v]))
    return p.map((r) => {
      const v = vm.get(Number(r.venta_id))
      return { fecha: r.fecha_pago, factura: v?.numero_factura ?? null, cliente: nom(cli, v?.cliente_id), metodo: r.metodo_pago, monto: num(r.monto), usuario: r.usuario }
    })
  },
}

const ventasPagos: FuenteReporte = {
  id: "ventas_pagos_metodo", sistema: "Ventas", nombre: "Pagos al facturar por método",
  descripcion: "Desglose de cómo se pagó cada venta al registrarla: efectivo, banco, link de pago; con comisión y neto.",
  fecha: "Fecha del pago",
  columnas: [c("fecha", "Fecha", "fechahora", true), c("factura", "Factura", "texto", true), c("cliente", "Cliente", "texto", true), c("metodo", "Método", "texto", true), c("cuenta", "Cuenta", "texto", true), c("bruto", "Monto bruto", "moneda", true), c("comision_pct", "Comisión %", "porcentaje"), c("comision", "Comisión", "moneda", true), c("neto", "Neto", "moneda", true)],
  async cargar(ctx) {
    const dic = diccionarios(ctx.supabase)
    const p = await todas((a, b) => rango(ctx.supabase.from("ventas_pagos_detalle").select("*"), "fecha", ctx).order("fecha").range(a, b))
    const [ventas, cli, cue] = await Promise.all([porIds(ctx.supabase, "ventas_encabezado", "id, numero_factura, cliente_id", p.map((x) => x.venta_id)), dic("clientes"), dic("cuentas_config")])
    const vm = new Map(ventas.map((v) => [Number(v.id), v]))
    return p.map((r) => {
      const v = vm.get(Number(r.venta_id))
      const bruto = num(r.monto_bruto ?? r.monto_recibido)
      const neto = r.monto_neto != null ? num(r.monto_neto) : bruto
      return { fecha: r.fecha, factura: v?.numero_factura ?? null, cliente: nom(cli, v?.cliente_id), metodo: r.metodo_pago, cuenta: nom(cue, r.cuenta_id), bruto, comision_pct: num(r.porcentaje_comision), comision: r2(bruto - neto), neto }
    })
  },
}

const ventasCxc: FuenteReporte = {
  id: "ventas_cxc", sistema: "Ventas", nombre: "Cuentas por cobrar (antigüedad)",
  descripcion: "Facturas con saldo pendiente: total, pagado, saldo, días transcurridos desde la factura y rango de antigüedad.",
  fecha: "Fecha de la factura",
  columnas: [
    c("fecha", "Fecha factura", "fecha", true), c("numero_factura", "Factura", "texto", true), c("cliente", "Cliente", "texto", true), c("rtn", "RTN", "texto"),
    c("total", "Total", "moneda", true), c("pagado", "Pagado", "moneda"), c("saldo", "Saldo", "moneda", true),
    c("dias", "Días desde la factura", "numero", true, false), c("antiguedad", "Antigüedad", "texto", true), c("estado_pago", "Estado de pago", "texto"), c("tipo_pago", "Tipo de pago", "texto"),
  ],
  async cargar(ctx) {
    const dic = diccionarios(ctx.supabase)
    const [v, cli] = await Promise.all([
      todas((a, b) => rango(ctx.supabase.from("ventas_encabezado").select("*").neq("estado_pago", "Pagado"), "fecha_venta", ctx).order("fecha_venta").range(a, b)),
      dic("clientes", "id, nombre, rtn"),
    ])
    return v.filter((r) => num(r.total_venta) - num(r.valorpago) > 0.009).map((r) => {
      const cl = cli.get(Number(r.cliente_id))
      const dias = diasEntre(String(r.fecha_venta), ctx.hoy)
      return {
        fecha: r.fecha_venta, numero_factura: r.numero_factura, cliente: cl?.nombre ?? null, rtn: cl?.rtn ?? null,
        total: num(r.total_venta), pagado: num(r.valorpago), saldo: r2(num(r.total_venta) - num(r.valorpago)),
        dias: Math.max(0, dias), antiguedad: rangoAntiguedad(dias), estado_pago: r.estado_pago, tipo_pago: r.tipo_pago,
      }
    })
  },
}

const ventasDevoluciones: FuenteReporte = {
  id: "ventas_devoluciones", sistema: "Ventas", nombre: "Devoluciones",
  descripcion: "Notas de devolución con factura original, motivo, monto y destino del reembolso.",
  fecha: "Fecha de la devolución",
  columnas: [c("fecha", "Fecha", "fechahora", true), c("numero", "Devolución", "texto", true), c("factura", "Factura original", "texto", true), c("cliente", "Cliente", "texto", true), c("motivo", "Motivo", "texto", true), c("monto", "Monto", "moneda", true), c("destino", "Reembolso", "texto"), c("usuario", "Registrada por", "texto")],
  async cargar(ctx) {
    const dic = diccionarios(ctx.supabase)
    const d = await todas((a, b) => rango(ctx.supabase.from("devoluciones_encabezado").select("*"), "fecha", ctx).order("fecha").range(a, b))
    const [ventas, cli] = await Promise.all([porIds(ctx.supabase, "ventas_encabezado", "id, numero_factura, cliente_id", d.map((x) => x.venta_id)), dic("clientes")])
    const vm = new Map(ventas.map((v) => [Number(v.id), v]))
    return d.map((r) => {
      const v = vm.get(Number(r.venta_id))
      return { fecha: r.fecha, numero: r.numero_devolucion, factura: v?.numero_factura ?? null, cliente: nom(cli, v?.cliente_id), motivo: r.motivo, monto: num(r.monto_total), destino: r.destino_reembolso === "cuenta" ? "Banco" : "Caja", usuario: r.usuario }
    })
  },
}

// ==================== COMPRAS ====================

const comprasOc: FuenteReporte = {
  id: "compras_oc", sistema: "Compras", nombre: "Órdenes de compra",
  descripcion: "Órdenes con proveedor, estado, moneda, valor de la orden, costos de importación y total en Lempiras.",
  fecha: "Fecha de la orden",
  columnas: [
    c("fecha", "Fecha", "fecha", true), c("oc", "Orden", "texto", true), c("proveedor", "Proveedor", "texto", true), c("factura_proveedor", "Factura proveedor", "texto"),
    c("estado", "Estado", "texto", true), c("fecha_tentativa", "Llegada estimada", "fecha"), c("moneda", "Moneda", "texto"), c("tasa", "Tasa de cambio", "numero", false, false),
    c("valor_orden", "Valor de la orden (moneda origen)", "moneda", true), c("importacion", "Costos de importación", "moneda"), c("impuestos", "Impuestos de compra", "moneda"),
    c("otros", "Otros costos", "moneda"), c("total_local", "Total (L)", "moneda", true), c("notas", "Notas", "texto"), c("usuario", "Registrada por", "texto"),
  ],
  async cargar(ctx) {
    const dic = diccionarios(ctx.supabase)
    const [o, prov] = await Promise.all([todas((a, b) => rango(ctx.supabase.from("compras_encabezado").select("*"), "fecha_orden", ctx).order("fecha_orden").range(a, b)), dic("proveedores")])
    return o.map((r) => ({
      fecha: r.fecha_orden, oc: pad(r.id, "OC"), proveedor: nom(prov, r.proveedor_id), factura_proveedor: r.numero_factura, estado: r.estado, fecha_tentativa: r.fecha_tentativa,
      moneda: r.moneda, tasa: num(r.tasa_cambio), valor_orden: num(r.total), importacion: num(r.costos_importacion), impuestos: num(r.impuestos_compra), otros: num(r.otros_costos),
      total_local: num(r.total_compra_local), notas: r.notas, usuario: r.usuario,
    }))
  },
}

const comprasProductos: FuenteReporte = {
  id: "compras_productos", sistema: "Compras", nombre: "Compras por producto (líneas)",
  descripcion: "Una fila por producto comprado: cantidad ordenada, recibida, pendiente y costos.",
  fecha: "Fecha de la orden",
  columnas: [c("fecha", "Fecha", "fecha", true), c("oc", "Orden", "texto", true), c("proveedor", "Proveedor", "texto", true), c("producto", "Producto", "texto", true), c("codigo", "Código", "texto"), c("categoria", "Categoría", "texto", true), c("cantidad", "Ordenado", "numero", true), c("recibida", "Recibido", "numero", true), c("pendiente", "Pendiente", "numero", true), c("costo_origen", "Costo unitario (origen)", "moneda", false, false), c("costo_final", "Costo final (L)", "moneda", false, false), c("subtotal", "Subtotal (origen)", "moneda", true), c("total_final", "Total final (L)", "moneda", true), c("moneda", "Moneda", "texto"), c("estado", "Estado OC", "texto")],
  async cargar(ctx) {
    const dic = diccionarios(ctx.supabase)
    const o = await todas((a, b) => rango(ctx.supabase.from("compras_encabezado").select("id, fecha_orden, proveedor_id, moneda, estado"), "fecha_orden", ctx).range(a, b))
    const om = new Map(o.map((x) => [Number(x.id), x]))
    const [d, prov, prod, cat] = await Promise.all([porIds(ctx.supabase, "compras_detalle", "*", o.map((x) => x.id), "compra_id"), dic("proveedores"), dic("productos", "id, nombre, codigo_barras, categoria_id"), dic("categorias")])
    return d.map((r) => {
      const oc = om.get(Number(r.compra_id))
      const p = prod.get(Number(r.producto_id))
      return { fecha: oc?.fecha_orden, oc: pad(r.compra_id, "OC"), proveedor: nom(prov, oc?.proveedor_id), producto: p?.nombre ?? null, codigo: p?.codigo_barras ?? null, categoria: nom(cat, p?.categoria_id), cantidad: num(r.cantidad), recibida: num(r.cantidad_recibida), pendiente: Math.max(0, num(r.cantidad) - num(r.cantidad_recibida)), costo_origen: num(r.costo_unitario_moneda_origen), costo_final: num(r.costo_final_local), subtotal: r2(num(r.cantidad) * num(r.costo_unitario_moneda_origen)), total_final: r2(num(r.cantidad) * num(r.costo_final_local)), moneda: oc?.moneda, estado: oc?.estado }
    }).sort((x, y) => String(x.fecha ?? "").localeCompare(String(y.fecha ?? "")))
  },
}

const comprasCxp: FuenteReporte = {
  id: "compras_cxp", sistema: "Compras", nombre: "Cuentas por pagar (antigüedad)",
  descripcion: "Gastos pendientes de pago: proveedor, concepto, total, pagado, saldo, vencimiento, días vencida y antigüedad.",
  fecha: "Fecha del gasto",
  columnas: [c("fecha", "Fecha", "fecha", true), c("documento", "Documento", "texto", true), c("proveedor", "Proveedor", "texto", true), c("concepto", "Concepto", "texto", true), c("descripcion", "Descripción", "texto"), c("total", "Total", "moneda", true), c("pagado", "Pagado", "moneda"), c("saldo", "Saldo", "moneda", true), c("vence", "Vence", "fecha", true), c("dias_vencida", "Días vencida", "numero", true, false), c("antiguedad", "Antigüedad", "texto", true), c("estado_pago", "Estado de pago", "texto")],
  async cargar(ctx) {
    const dic = diccionarios(ctx.supabase)
    const [g, prov, con] = await Promise.all([
      todas((a, b) => rango(ctx.supabase.from("gastos").select("*").neq("estado_pago", "Pagado"), "fecha_gasto", ctx, true).order("fecha_gasto").range(a, b)),
      dic("proveedores"), dic("conceptos_gastos"),
    ])
    return g.filter((r) => num(r.monto) - num(r.monto_pagado) > 0.009).map((r) => {
      const vence = (r.fecha_vencimiento as string) ?? String(r.fecha_gasto)
      const dv = diasEntre(vence, ctx.hoy)
      return { fecha: r.fecha_gasto, documento: pad(r.id, "G"), proveedor: nom(prov, r.proveedor_id), concepto: nom(con, r.concepto_id), descripcion: r.descripcion, total: num(r.monto), pagado: num(r.monto_pagado), saldo: r2(num(r.monto) - num(r.monto_pagado)), vence, dias_vencida: Math.max(0, dv), antiguedad: rangoAntiguedad(dv), estado_pago: r.estado_pago }
    })
  },
}

// ==================== INVENTARIO ====================

const inventarioExistencias: FuenteReporte = {
  id: "inventario_existencias", sistema: "Inventario", nombre: "Existencias y valoración",
  descripcion: "Foto actual por producto: stock, costo promedio, valor a costo, precio y valor a precio de venta.",
  fecha: null,
  columnas: [c("codigo", "Código", "texto", true), c("producto", "Producto", "texto", true), c("categoria", "Categoría", "texto", true), c("subcategoria", "Subcategoría", "texto"), c("marca", "Marca", "texto"), c("talla", "Talla", "texto"), c("stock", "Existencia", "numero", true), c("costo", "Costo promedio", "moneda", true, false), c("valor_costo", "Valor a costo", "moneda", true), c("precio", "Precio de venta", "moneda", true, false), c("valor_venta", "Valor a precio de venta", "moneda"), c("margen", "Margen %", "porcentaje")],
  async cargar(ctx) {
    const dic = diccionarios(ctx.supabase)
    const [p, cat, sub, mar] = await Promise.all([todas((a, b) => ctx.supabase.from("productos").select("*").order("nombre").range(a, b)), dic("categorias"), dic("subcategorias"), dic("marcas")])
    return p.map((r) => {
      const stock = num(r.stock_total), costo = num(r.costo_promedio), precio = num(r.precio_venta_sugerido)
      return { codigo: r.codigo_barras, producto: r.nombre, categoria: nom(cat, r.categoria_id), subcategoria: nom(sub, r.subcategoria_id), marca: nom(mar, r.marca_id), talla: r.talla, stock, costo, valor_costo: r2(stock * costo), precio, valor_venta: r2(stock * precio), margen: precio ? r2(((precio - costo) / precio) * 100) : null }
    })
  },
}

const inventarioKardex: FuenteReporte = {
  id: "inventario_kardex", sistema: "Inventario", nombre: "Movimientos de inventario (kardex)",
  descripcion: "Entradas y salidas por producto, almacén y localización: compras, ventas, traslados, ajustes, movimientos manuales y producción.",
  fecha: "Fecha del movimiento",
  columnas: [c("fecha", "Fecha", "fechahora", true), c("producto", "Producto", "texto", true), c("codigo", "Código", "texto"), c("categoria", "Categoría", "texto"), c("almacen", "Almacén", "texto", true), c("localizacion", "Localización", "texto"), c("tipo", "Tipo de movimiento", "texto", true), c("entrada", "Entrada", "numero", true), c("salida", "Salida", "numero", true), c("cantidad", "Cantidad (±)", "numero"), c("costo", "Costo unitario", "moneda", false, false), c("valor", "Valor (±)", "moneda", true), c("referencia", "Referencia / motivo", "texto"), c("usuario", "Usuario", "texto")],
  async cargar(ctx) {
    const dic = diccionarios(ctx.supabase)
    const [t, prod, cat, alm, loc] = await Promise.all([todas((a, b) => rango(ctx.supabase.from("transacciones_inventario").select("*"), "fecha", ctx).order("fecha").range(a, b)), dic("productos", "id, nombre, codigo_barras, categoria_id"), dic("categorias"), dic("almacenes"), dic("localizaciones")])
    return t.map((r) => {
      const p = prod.get(Number(r.producto_id))
      const q = num(r.cantidad)
      const referencia = txt(r.observaciones) ?? (r.referencia_id != null ? `${r.tipo_movimiento} #${r.referencia_id}` : null)
      return { fecha: r.fecha, producto: p?.nombre ?? null, codigo: p?.codigo_barras ?? null, categoria: nom(cat, p?.categoria_id), almacen: nom(alm, r.almacen_id), localizacion: nom(loc, r.localizacion_id), tipo: r.tipo_movimiento, entrada: q > 0 ? q : 0, salida: q < 0 ? -q : 0, cantidad: q, costo: num(r.costo_o_precio_unitario), valor: r2(q * num(r.costo_o_precio_unitario)), referencia, usuario: r.usuario }
    })
  },
}

const inventarioMateriales: FuenteReporte = {
  id: "inventario_materiales", sistema: "Inventario", nombre: "Materiales de producción",
  descripcion: "Foto actual de materiales: existencia, costo promedio y valor.",
  fecha: null,
  columnas: [c("codigo", "Código", "texto", true), c("material", "Material", "texto", true), c("unidad", "Unidad", "texto", true), c("stock", "Existencia", "numero", true), c("costo", "Costo promedio", "moneda", true, false), c("valor", "Valor", "moneda", true), c("activo", "Activo", "booleano")],
  async cargar(ctx) {
    const m = await todas((a, b) => ctx.supabase.from("materiales").select("*").order("nombre").range(a, b))
    return m.map((r) => ({ codigo: r.codigo, material: r.nombre, unidad: r.unidad_medida, stock: num(r.stock_total), costo: num(r.costo_promedio), valor: r2(num(r.stock_total) * num(r.costo_promedio)), activo: r.activo !== false }))
  },
}

const inventarioMovMateriales: FuenteReporte = {
  id: "inventario_mov_materiales", sistema: "Inventario", nombre: "Movimientos de materiales",
  descripcion: "Compras, consumos de producción y ajustes de materiales.",
  fecha: "Fecha del movimiento",
  columnas: [c("fecha", "Fecha", "fechahora", true), c("material", "Material", "texto", true), c("almacen", "Almacén", "texto"), c("localizacion", "Localización", "texto"), c("tipo", "Tipo", "texto", true), c("entrada", "Entrada", "numero", true), c("salida", "Salida", "numero", true), c("costo", "Costo unitario", "moneda", false, false), c("valor", "Valor (±)", "moneda", true), c("referencia", "Referencia", "numero", false, false), c("usuario", "Usuario", "texto")],
  async cargar(ctx) {
    const dic = diccionarios(ctx.supabase)
    const [m, mat, alm, loc] = await Promise.all([todas((a, b) => rango(ctx.supabase.from("materiales_movimientos").select("*"), "fecha", ctx).order("fecha").range(a, b)), dic("materiales"), dic("almacenes"), dic("localizaciones")])
    return m.map((r) => {
      const q = num(r.cantidad)
      return { fecha: r.fecha, material: nom(mat, r.material_id), almacen: nom(alm, r.almacen_id), localizacion: nom(loc, r.localizacion_id), tipo: r.tipo_movimiento, entrada: q > 0 ? q : 0, salida: q < 0 ? -q : 0, costo: num(r.costo_unitario), valor: r2(q * num(r.costo_unitario)), referencia: r.referencia_id, usuario: r.usuario }
    })
  },
}

// ==================== PRODUCCIÓN ====================

const produccionOrdenes: FuenteReporte = {
  id: "produccion_ordenes", sistema: "Producción", nombre: "Órdenes de producción",
  descripcion: "Cada orden con su producto, cantidad objetivo, fecha objetivo, programación y estado.",
  fecha: "Fecha de creación",
  columnas: [c("creada", "Creada", "fechahora", true), c("orden", "Orden", "texto", true), c("producto", "Producto", "texto", true), c("codigo", "Código", "texto"), c("cantidad", "Cantidad objetivo", "numero", true), c("fecha_objetivo", "Fecha objetivo", "fecha", true), c("programada", "Fecha programada", "fecha"), c("duracion", "Duración planeada (h)", "numero", false, false), c("estado", "Estado", "texto", true), c("notas", "Notas", "texto"), c("usuario", "Creada por", "texto")],
  async cargar(ctx) {
    const dic = diccionarios(ctx.supabase)
    const [o, prod] = await Promise.all([todas((a, b) => rango(ctx.supabase.from("produccion_ordenes").select("*"), "created_at", ctx).order("created_at").range(a, b)), dic("productos", "id, nombre, codigo_barras")])
    return o.map((r) => {
      const p = prod.get(Number(r.producto_id))
      return { creada: r.created_at, orden: codigoOrden(Number(r.id)), producto: p?.nombre ?? null, codigo: p?.codigo_barras ?? null, cantidad: num(r.cantidad_objetivo), fecha_objetivo: r.fecha_objetivo, programada: r.fecha_programada, duracion: r.duracion_horas != null ? num(r.duracion_horas) : null, estado: r.estado, notas: r.notas, usuario: r.usuario }
    })
  },
}

const produccionEtapas: FuenteReporte = {
  id: "produccion_etapas", sistema: "Producción", nombre: "Etapas de producción",
  descripcion: "Una fila por etapa de cada orden: operación, responsable, recepción y entrega reales, horas y cantidad procesada.",
  fecha: "Fecha de recepción en la etapa (o creación de la orden si aún no inició)",
  columnas: [c("orden", "Orden", "texto", true), c("producto", "Producto", "texto", true), c("etapa", "Etapa", "texto", true), c("secuencia", "Secuencia", "numero", false, false), c("estado", "Estado", "texto", true), c("responsable", "Responsable", "texto", true), c("inicio", "Recepción", "fechahora", true), c("fin", "Entrega", "fechahora", true), c("horas", "Horas", "numero", true, false), c("cantidad", "Cantidad procesada", "numero", true), c("notas", "Notas", "texto")],
  async cargar(ctx) {
    const dic = diccionarios(ctx.supabase)
    const e = await todas((a, b) => ctx.supabase.from("produccion_orden_etapas").select("*").order("orden_id").order("orden_secuencia").range(a, b))
    const [ordenes, prod, ops] = await Promise.all([porIds(ctx.supabase, "produccion_ordenes", "id, producto_id, created_at", e.map((x) => x.orden_id)), dic("productos"), dic("produccion_operaciones")])
    const om = new Map(ordenes.map((o) => [Number(o.id), o]))
    return e
      .filter((r) => enPeriodo(r.fecha_recepcion ?? om.get(Number(r.orden_id))?.created_at, ctx))
      .map((r) => {
        const o = om.get(Number(r.orden_id))
        return { orden: codigoOrden(Number(r.orden_id)), producto: nom(prod, o?.producto_id), etapa: txt(r.nombre) ?? nom(ops, r.operacion_id), secuencia: num(r.orden_secuencia), estado: r.estado, responsable: r.responsable, inicio: r.fecha_recepcion, fin: r.fecha_entrega, horas: horasEntre(r.fecha_recepcion, r.fecha_entrega), cantidad: r.cantidad_procesada != null ? num(r.cantidad_procesada) : null, notas: r.notas }
      })
  },
}

const produccionCorridas: FuenteReporte = {
  id: "produccion_corridas", sistema: "Producción", nombre: "Corridas de fabricación",
  descripcion: "Corridas con unidades buenas y defectuosas, calidad, paros, tiempo planificado y costos reales.",
  fecha: "Fecha de la corrida",
  columnas: [c("fecha", "Fecha", "fechahora", true), c("orden", "Orden", "texto", true), c("producto", "Producto", "texto", true), c("operador", "Operador", "texto"), c("inicio", "Hora inicio", "fechahora"), c("fin", "Hora fin", "fechahora"), c("buenas", "Buenas", "numero", true), c("defectuosas", "Defectuosas", "numero", true), c("procesadas", "Procesadas", "numero"), c("calidad", "Calidad %", "porcentaje", true), c("paros", "Paros (min)", "numero"), c("planificado", "Tiempo planificado (min)", "numero"), c("costo_materiales", "Costo materiales", "moneda"), c("costo_factores", "Costo conversión", "moneda"), c("costo_unitario", "Costo unitario", "moneda", true, false), c("estado", "Estado", "texto"), c("novedades", "Novedades", "texto")],
  async cargar(ctx) {
    const dic = diccionarios(ctx.supabase)
    const [k, prod] = await Promise.all([todas((a, b) => rango(ctx.supabase.from("produccion_corridas").select("*"), "created_at", ctx).order("created_at").range(a, b)), dic("productos")])
    return k.map((r) => ({ fecha: r.created_at, orden: r.orden_id != null ? codigoOrden(Number(r.orden_id)) : null, producto: nom(prod, r.producto_id), operador: r.operador, inicio: r.hora_inicio, fin: r.hora_fin, buenas: num(r.unidades_buenas), defectuosas: num(r.unidades_defectuosas), procesadas: num(r.unidades_procesadas), calidad: num(r.unidades_procesadas) ? r2((num(r.unidades_buenas) / num(r.unidades_procesadas)) * 100) : null, paros: num(r.paros_minutos), planificado: num(r.tiempo_planificado_minutos), costo_materiales: num(r.costo_materiales_total), costo_factores: num(r.costo_factores_total), costo_unitario: num(r.costo_unitario_real), estado: r.estado, novedades: r.novedades }))
  },
}

// ==================== FINANZAS ====================

const finanzasGastos: FuenteReporte = {
  id: "finanzas_gastos", sistema: "Finanzas", nombre: "Gastos",
  descripcion: "Gastos por concepto y categoría, con proveedor, pagado, saldo y vencimiento.",
  fecha: "Fecha del gasto",
  columnas: [c("fecha", "Fecha", "fecha", true), c("concepto", "Concepto", "texto", true), c("categoria", "Categoría", "texto", true), c("proveedor", "Proveedor", "texto"), c("descripcion", "Descripción", "texto", true), c("monto", "Monto", "moneda", true), c("pagado", "Pagado", "moneda"), c("saldo", "Saldo", "moneda"), c("estado_pago", "Estado de pago", "texto", true), c("vence", "Vence", "fecha"), c("metodo", "Método", "texto"), c("usuario", "Registrado por", "texto")],
  async cargar(ctx) {
    const dic = diccionarios(ctx.supabase)
    const [g, con, prov] = await Promise.all([todas((a, b) => rango(ctx.supabase.from("gastos").select("*"), "fecha_gasto", ctx, true).order("fecha_gasto").range(a, b)), dic("conceptos_gastos", "id, nombre, categoria_macro"), dic("proveedores")])
    return g.map((r) => {
      const co = con.get(Number(r.concepto_id))
      return { fecha: r.fecha_gasto, concepto: co?.nombre ?? null, categoria: co?.categoria_macro ?? null, proveedor: nom(prov, r.proveedor_id), descripcion: r.descripcion, monto: num(r.monto), pagado: num(r.monto_pagado), saldo: r2(num(r.monto) - num(r.monto_pagado)), estado_pago: r.estado_pago, vence: r.fecha_vencimiento, metodo: r.metodo_pago, usuario: r.usuario }
    })
  },
}

/**
 * Bancos (`cuenta_movimientos`, tipo Ingreso/Egreso) + caja chica
 * (`caja_chica_movimientos`, monto con signo). Se excluyen los movimientos
 * sintéticos `Apertura` y `Cierre` de la sesión de caja (no son dinero que
 * entra o sale, replican el saldo).
 */
async function tesoreria(ctx: CtxCarga): Promise<Fila[]> {
  const dic = diccionarios(ctx.supabase)
  const [b, cj, cue] = await Promise.all([
    todas((a, z) => rango(ctx.supabase.from("cuenta_movimientos").select("*"), "fecha", ctx).order("fecha").range(a, z)),
    todas((a, z) => rango(ctx.supabase.from("caja_chica_movimientos").select("*"), "fecha", ctx).order("fecha").range(a, z)).catch(() => [] as Fila[]),
    dic("cuentas_config"),
  ])
  return [
    ...b.map((r) => ({ fecha: r.fecha, medio: "Banco", cuenta: nom(cue, r.cuenta_id), direccion: r.tipo === "Ingreso" ? "Ingreso" : "Egreso", origen: origen(r.ref_tipo), concepto: r.concepto, monto: num(r.monto), usuario: r.usuario })),
    ...cj.filter((r) => r.tipo !== "Apertura" && r.tipo !== "Cierre").map((r) => ({
      fecha: r.fecha ?? r.created_at, medio: "Caja chica", cuenta: "Caja chica", direccion: String(r.tipo).startsWith("Ingreso") ? "Ingreso" : "Egreso",
      origen: r.tipo === "Transferencia_Banco" ? "Traslado a banco" : origen(r.ref_tipo), concepto: r.concepto, monto: Math.abs(num(r.monto)), usuario: r.usuario,
    })),
  ].sort((x, y) => String(x.fecha).localeCompare(String(y.fecha)))
}
const COL_TESORERIA = [c("fecha", "Fecha", "fechahora", true), c("medio", "Medio", "texto", true), c("cuenta", "Cuenta", "texto", true), c("origen", "Origen", "texto", true), c("concepto", "Concepto", "texto", true), c("monto", "Monto", "moneda", true), c("usuario", "Usuario", "texto")]

const finanzasIngresos: FuenteReporte = {
  id: "finanzas_ingresos", sistema: "Finanzas", nombre: "Ingresos de dinero",
  descripcion: "Todo lo que entró a bancos y caja chica: ventas, abonos de clientes, ingresos manuales y traslados recibidos.",
  fecha: "Fecha del movimiento", columnas: COL_TESORERIA,
  async cargar(ctx) { return (await tesoreria(ctx)).filter((r) => r.direccion === "Ingreso") },
}
const finanzasEgresos: FuenteReporte = {
  id: "finanzas_egresos", sistema: "Finanzas", nombre: "Egresos de dinero",
  descripcion: "Todo lo que salió de bancos y caja chica: gastos, reembolsos de devoluciones, salidas manuales y traslados.",
  fecha: "Fecha del movimiento", columnas: COL_TESORERIA,
  async cargar(ctx) { return (await tesoreria(ctx)).filter((r) => r.direccion === "Egreso") },
}
const finanzasFlujo: FuenteReporte = {
  id: "finanzas_flujo", sistema: "Finanzas", nombre: "Flujo de caja (ingresos y egresos)",
  descripcion: "Ingresos y egresos de bancos y caja en una sola tabla, con el monto con signo para calcular el flujo neto.",
  fecha: "Fecha del movimiento",
  columnas: [...COL_TESORERIA.slice(0, 3), c("direccion", "Ingreso / egreso", "texto", true), ...COL_TESORERIA.slice(3, 5), c("ingreso", "Ingreso", "moneda", true), c("egreso", "Egreso", "moneda", true), c("neto", "Neto (±)", "moneda", true), COL_TESORERIA[6]],
  async cargar(ctx) {
    return (await tesoreria(ctx)).map((r) => ({ ...r, ingreso: r.direccion === "Ingreso" ? r.monto : 0, egreso: r.direccion === "Egreso" ? r.monto : 0, neto: r.direccion === "Ingreso" ? r.monto : -Number(r.monto) }))
  },
}
const finanzasBancos: FuenteReporte = {
  id: "finanzas_bancos", sistema: "Finanzas", nombre: "Movimientos bancarios con saldo",
  descripcion: "Libro de cada cuenta bancaria con saldo resultante, origen y concepto.",
  fecha: "Fecha del movimiento",
  columnas: [c("fecha", "Fecha", "fechahora", true), c("cuenta", "Cuenta", "texto", true), c("tipo", "Tipo", "texto", true), c("origen", "Origen", "texto", true), c("concepto", "Concepto", "texto", true), c("ingreso", "Ingreso", "moneda", true), c("egreso", "Egreso", "moneda", true), c("saldo", "Saldo", "moneda", true, false), c("usuario", "Usuario", "texto")],
  async cargar(ctx) {
    const dic = diccionarios(ctx.supabase)
    const [b, cue] = await Promise.all([todas((a, z) => rango(ctx.supabase.from("cuenta_movimientos").select("*"), "fecha", ctx).order("fecha").order("id").range(a, z)), dic("cuentas_config")])
    return b.map((r) => ({ fecha: r.fecha, cuenta: nom(cue, r.cuenta_id), tipo: r.tipo, origen: origen(r.ref_tipo), concepto: r.concepto, ingreso: r.tipo === "Ingreso" ? num(r.monto) : 0, egreso: r.tipo === "Ingreso" ? 0 : num(r.monto), saldo: num(r.saldo_resultante), usuario: r.usuario }))
  },
}

const finanzasResultados: FuenteReporte = {
  id: "finanzas_resultados", sistema: "Finanzas", nombre: "Estado de resultados por mes",
  descripcion: "Una fila por mes del período: ventas sin ISV, costo, utilidad bruta, gastos por categoría, comisiones y utilidad neta.",
  fecha: "Mes",
  columnas: [c("mes", "Mes", "fecha", true), c("ventas", "Ventas netas", "moneda", true), c("cmv", "Costo de ventas", "moneda", true), c("utilidad_bruta", "Utilidad bruta", "moneda", true), c("nomina", "Nómina", "moneda"), c("arriendo", "Arriendo", "moneda"), c("servicios", "Servicios", "moneda"), c("publicidad", "Publicidad", "moneda"), c("mantenimiento", "Mantenimiento", "moneda"), c("impuestos", "Impuestos", "moneda"), c("suministros", "Suministros", "moneda"), c("otros", "Otros gastos", "moneda"), c("gastos", "Total gastos operativos", "moneda", true), c("comisiones", "Comisiones bancarias", "moneda"), c("utilidad_neta", "Utilidad neta", "moneda", true), c("margen_bruto", "Margen bruto %", "porcentaje"), c("margen_neto", "Margen neto %", "porcentaje", true)],
  async cargar(ctx) {
    const { getEstadoResultadosMensual } = await import("@/lib/services/estado-resultados")
    const hasta = ctx.hasta ?? ctx.hoy
    const desde = ctx.desde ?? `${hasta.slice(0, 4)}-01-01`
    const meses: [number, number][] = []
    for (let y = Number(desde.slice(0, 4)), m = Number(desde.slice(5, 7)); y * 12 + m <= Number(hasta.slice(0, 4)) * 12 + Number(hasta.slice(5, 7)) && meses.length < 36; m++) {
      if (m > 12) { m = 1; y++ }
      meses.push([y, m])
    }
    const out: Fila[] = []
    for (const [y, m] of meses) {
      const { data: d } = await getEstadoResultadosMensual(y, m)
      if (!d) continue
      out.push({ mes: `${y}-${String(m).padStart(2, "0")}-01`, ventas: r2(d.ventas_totales), cmv: r2(d.costo_mercancia_vendida), utilidad_bruta: r2(d.utilidad_bruta), nomina: r2(d.gastos_nomina), arriendo: r2(d.gastos_arriendo), servicios: r2(d.gastos_servicios), publicidad: r2(d.gastos_publicidad), mantenimiento: r2(d.gastos_mantenimiento), impuestos: r2(d.gastos_impuestos), suministros: r2(d.gastos_suministros), otros: r2(d.gastos_otros), gastos: r2(d.total_gastos_operativos), comisiones: r2(d.comisiones_bancarias), utilidad_neta: r2(d.utilidad_neta), margen_bruto: r2(d.margen_bruto), margen_neto: r2(d.margen_neto) })
    }
    return out
  },
}

// ==================== CLIENTES Y PROVEEDORES ====================

const catClientes: FuenteReporte = {
  id: "cat_clientes", sistema: "Clientes y proveedores", nombre: "Clientes (con compras del período)",
  descripcion: "Ficha de cada cliente con su límite de crédito, sus compras en el período (facturas, total, ticket, última compra) y saldo pendiente actual.",
  fecha: "Compras del período",
  columnas: [c("cliente", "Cliente", "texto", true), c("rtn", "RTN", "texto"), c("telefono", "Teléfono", "texto"), c("direccion", "Dirección", "texto"), c("limite_credito", "Límite de crédito", "moneda", false, false), c("facturas", "Facturas en el período", "numero", true), c("comprado", "Comprado en el período", "moneda", true), c("ticket", "Ticket promedio", "moneda", false, false), c("ultima_compra", "Última compra", "fecha", true), c("saldo", "Saldo pendiente", "moneda", true), c("activo", "Activo", "booleano")],
  async cargar(ctx) {
    const [cl, v, pend] = await Promise.all([
      todas((a, b) => ctx.supabase.from("clientes").select("*").order("nombre").range(a, b)),
      todas((a, b) => rango(ctx.supabase.from("ventas_encabezado").select("cliente_id, fecha_venta, total_venta"), "fecha_venta", ctx).range(a, b)),
      todas((a, b) => ctx.supabase.from("ventas_encabezado").select("cliente_id, total_venta, valorpago").neq("estado_pago", "Pagado").range(a, b)),
    ])
    const met = new Map<number, { n: number; total: number; ultima: string }>()
    for (const r of v) {
      const k = Number(r.cliente_id)
      const m = met.get(k) || { n: 0, total: 0, ultima: "" }
      m.n++; m.total += num(r.total_venta)
      if (String(r.fecha_venta) > m.ultima) m.ultima = String(r.fecha_venta)
      met.set(k, m)
    }
    const saldo = new Map<number, number>()
    for (const r of pend) saldo.set(Number(r.cliente_id), (saldo.get(Number(r.cliente_id)) || 0) + num(r.total_venta) - num(r.valorpago))
    return cl.map((r) => {
      const m = met.get(Number(r.id))
      return { cliente: r.nombre, rtn: r.rtn, telefono: r.telefono, direccion: r.direccion, limite_credito: num(r.limite_credito), facturas: m?.n ?? 0, comprado: r2(m?.total ?? 0), ticket: m?.n ? r2(m.total / m.n) : 0, ultima_compra: m?.ultima || null, saldo: r2(Math.max(0, saldo.get(Number(r.id)) || 0)), activo: r.activo !== false }
    })
  },
}

const catProveedores: FuenteReporte = {
  id: "cat_proveedores", sistema: "Clientes y proveedores", nombre: "Proveedores (con compras del período)",
  descripcion: "Ficha de cada proveedor con sus órdenes de compra y gastos en el período, y el saldo por pagar actual (gastos pendientes).",
  fecha: "Compras del período",
  columnas: [c("proveedor", "Proveedor", "texto", true), c("rtn", "RTN", "texto"), c("contacto", "Contacto", "texto"), c("ordenes", "Órdenes en el período", "numero", true), c("comprado", "Compras (L)", "moneda", true), c("gastos", "Gastos en el período", "moneda", true), c("saldo", "Saldo por pagar", "moneda", true)],
  async cargar(ctx) {
    const [pr, oc, g, gPend] = await Promise.all([
      todas((a, b) => ctx.supabase.from("proveedores").select("*").order("nombre").range(a, b)),
      todas((a, b) => rango(ctx.supabase.from("compras_encabezado").select("proveedor_id, total_compra_local").neq("estado", "Cancelada"), "fecha_orden", ctx).range(a, b)),
      todas((a, b) => rango(ctx.supabase.from("gastos").select("proveedor_id, monto"), "fecha_gasto", ctx, true).range(a, b)),
      todas((a, b) => ctx.supabase.from("gastos").select("proveedor_id, monto, monto_pagado").neq("estado_pago", "Pagado").range(a, b)),
    ])
    const acc = (rows: Fila[], f: (r: Fila) => number) => { const m = new Map<number, number>(); for (const r of rows) if (r.proveedor_id != null) m.set(Number(r.proveedor_id), (m.get(Number(r.proveedor_id)) || 0) + f(r)); return m }
    const nOc = acc(oc, () => 1), cOc = acc(oc, (r) => num(r.total_compra_local)), gs = acc(g, (r) => num(r.monto))
    const sPend = acc(gPend, (r) => Math.max(0, num(r.monto) - num(r.monto_pagado)))
    return pr.map((r) => { const id = Number(r.id); return { proveedor: r.nombre, rtn: r.rtn, contacto: r.contacto, ordenes: nOc.get(id) || 0, comprado: r2(cOc.get(id) || 0), gastos: r2(gs.get(id) || 0), saldo: r2(sPend.get(id) || 0) } })
  },
}

// ==================== RRHH ====================

const rrhhEmpleados: FuenteReporte = {
  id: "rrhh_empleados", sistema: "RRHH", nombre: "Empleados",
  descripcion: "Foto actual del personal: puesto, departamento, ingreso, antigüedad, contrato, salario y forma de pago.",
  fecha: null,
  columnas: [c("codigo", "Código", "texto", true), c("nombre", "Empleado", "texto", true), c("identidad", "Identidad", "texto"), c("puesto", "Puesto", "texto", true), c("departamento", "Departamento", "texto", true), c("ingreso", "Fecha de ingreso", "fecha", true), c("salida", "Fecha de salida", "fecha"), c("antiguedad", "Antigüedad (años)", "numero", false, false), c("contrato", "Contrato", "texto"), c("salario", "Salario mensual", "moneda", true), c("frecuencia", "Frecuencia de pago", "texto"), c("forma_pago", "Forma de pago", "texto"), c("banco", "Banco", "texto"), c("cuenta", "Cuenta", "texto"), c("estado", "Estado", "texto", true)],
  async cargar(ctx) {
    const e = await todas((a, b) => ctx.supabase.from("empleados").select("*").order("nombre").range(a, b))
    return e.map((r) => ({ codigo: r.codigo, nombre: r.nombre, identidad: r.identidad, puesto: r.puesto, departamento: r.departamento, ingreso: r.fecha_ingreso, salida: r.fecha_salida, antiguedad: r.fecha_ingreso ? r2(diasEntre(String(r.fecha_ingreso), String(r.fecha_salida ?? ctx.hoy)) / 365.25) : null, contrato: r.tipo_contrato, salario: num(r.salario_mensual), frecuencia: r.frecuencia_pago, forma_pago: r.forma_pago, banco: r.banco, cuenta: r.cuenta_bancaria, estado: r.estado }))
  },
}

const rrhhNomina: FuenteReporte = {
  id: "rrhh_nomina", sistema: "RRHH", nombre: "Nómina por empleado",
  descripcion: "Una fila por empleado y nómina: devengado, IHSS, RAP, ISR, otras deducciones, neto, aportes patronales y costo empresa.",
  fecha: "Fin del período de la nómina",
  columnas: [c("periodo_hasta", "Período hasta", "fecha", true), c("nomina", "Nómina", "texto", true), c("tipo", "Tipo", "texto"), c("periodo_desde", "Período desde", "fecha"), c("estado", "Estado de la nómina", "texto"), c("empleado", "Empleado", "texto", true), c("departamento", "Departamento", "texto", true), c("salario_mensual", "Salario mensual", "moneda", false, false), c("dias_pagados", "Días pagados", "numero"), c("salario_periodo", "Salario del período", "moneda", true), c("horas_extra", "Horas extra", "moneda"), c("otros_ingresos", "Otros ingresos", "moneda"), c("devengado", "Total devengado", "moneda", true), c("ihss", "IHSS empleado", "moneda", true), c("rap", "RAP empleado", "moneda", true), c("isr", "ISR", "moneda", true), c("otras", "Otras deducciones", "moneda"), c("deducciones", "Total deducciones", "moneda"), c("neto", "Neto", "moneda", true), c("ihss_patronal", "IHSS patronal", "moneda"), c("rap_patronal", "RAP patronal", "moneda"), c("costo_empresa", "Costo empresa", "moneda", true)],
  async cargar(ctx) {
    const dic = diccionarios(ctx.supabase)
    const n = await todas((a, b) => rango(ctx.supabase.from("rrhh_nominas").select("*").neq("estado", "Anulada"), "periodo_hasta", ctx, true).range(a, b))
    const nm = new Map(n.map((x) => [Number(x.id), x]))
    const [d, emp] = await Promise.all([porIds(ctx.supabase, "rrhh_nominas_detalle", "*", n.map((x) => x.id), "nomina_id"), dic("empleados", "id, departamento")])
    return d.map((r) => {
      const no = nm.get(Number(r.nomina_id))!
      return { periodo_hasta: no.periodo_hasta, nomina: `#${no.id}`, tipo: no.tipo, periodo_desde: no.periodo_desde, estado: no.estado, empleado: r.empleado_nombre, departamento: nom(emp, r.empleado_id, "departamento"), salario_mensual: num(r.salario_mensual), dias_pagados: r2(num(r.dias_periodo) - num(r.dias_no_pagados)), salario_periodo: num(r.salario_periodo), horas_extra: num(r.horas_extra), otros_ingresos: num(r.otros_ingresos), devengado: num(r.total_devengado), ihss: num(r.ihss_empleado), rap: num(r.rap_empleado), isr: num(r.isr), otras: num(r.otras_deducciones), deducciones: num(r.total_deducciones), neto: num(r.neto), ihss_patronal: num(r.ihss_patronal), rap_patronal: num(r.rap_patronal), costo_empresa: r2(num(r.total_devengado) + num(r.ihss_patronal) + num(r.rap_patronal)) }
    })
  },
}

const rrhhNovedades: FuenteReporte = {
  id: "rrhh_novedades", sistema: "RRHH", nombre: "Novedades de nómina",
  descripcion: "Horas extra, bonos, comisiones, vacaciones, ausencias, deducciones y anticipos por empleado.",
  fecha: "Fecha de la novedad",
  columnas: [c("fecha", "Fecha", "fecha", true), c("empleado", "Empleado", "texto", true), c("tipo", "Tipo", "texto", true), c("cantidad", "Horas / días", "numero", true), c("monto", "Monto", "moneda", true), c("gravable", "Grava ISR", "booleano"), c("cotizable", "Cotiza IHSS/RAP", "booleano"), c("descripcion", "Descripción", "texto"), c("aplicada", "Aplicada en nómina", "booleano")],
  async cargar(ctx) {
    const dic = diccionarios(ctx.supabase)
    const [n, emp] = await Promise.all([todas((a, b) => rango(ctx.supabase.from("rrhh_novedades").select("*"), "fecha", ctx, true).order("fecha").range(a, b)), dic("empleados")])
    return n.map((r) => ({ fecha: r.fecha, empleado: nom(emp, r.empleado_id), tipo: r.tipo, cantidad: r.cantidad != null ? num(r.cantidad) : null, monto: r.monto != null ? num(r.monto) : null, gravable: siNo(r.gravable), cotizable: siNo(r.cotizable), descripcion: r.descripcion, aplicada: r.nomina_id != null }))
  },
}

const rrhhAsistencia: FuenteReporte = {
  id: "rrhh_asistencia", sistema: "RRHH", nombre: "Asistencia (marcaciones)",
  descripcion: "Entrada, salida y horas trabajadas por empleado y día.",
  fecha: "Fecha de la marcación",
  columnas: [c("fecha", "Fecha", "fecha", true), c("empleado", "Empleado", "texto", true), c("departamento", "Departamento", "texto"), c("entrada", "Entrada", "fechahora", true), c("salida", "Salida", "fechahora", true), c("horas", "Horas", "numero", true), c("origen", "Origen", "texto"), c("notas", "Notas", "texto")],
  async cargar(ctx) {
    const dic = diccionarios(ctx.supabase)
    const [m, emp] = await Promise.all([todas((a, b) => rango(ctx.supabase.from("rrhh_marcaciones").select("*"), "fecha", ctx, true).order("fecha").range(a, b)), dic("empleados", "id, nombre, departamento")])
    return m.map((r) => ({ fecha: r.fecha, empleado: nom(emp, r.empleado_id), departamento: nom(emp, r.empleado_id, "departamento"), entrada: r.entrada, salida: r.salida, horas: r.horas != null ? num(r.horas) : null, origen: r.origen, notas: r.notas }))
  },
}

/** 28 fuentes. Toda fuente tiene al menos una columna `porDefecto` (lo exige tests/reporteria.test.ts). */
export const FUENTES: FuenteReporte[] = [
  ventasFacturas, ventasProductos, ventasCobros, ventasPagos, ventasCxc, ventasDevoluciones,
  comprasOc, comprasProductos, comprasCxp,
  inventarioExistencias, inventarioKardex, inventarioMateriales, inventarioMovMateriales,
  produccionOrdenes, produccionEtapas, produccionCorridas,
  finanzasResultados, finanzasIngresos, finanzasEgresos, finanzasFlujo, finanzasGastos, finanzasBancos,
  catClientes, catProveedores,
  rrhhEmpleados, rrhhNomina, rrhhNovedades, rrhhAsistencia,
]

export function getFuente(id: string): FuenteReporte | null {
  return FUENTES.find((f) => f.id === id) ?? null
}
