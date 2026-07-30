import * as XLSX from "xlsx"
import { crearVenta, type PagoVentaDetalleInput } from "@/lib/services/ventas"
import { getProductos, type Producto } from "@/lib/services/catalogos"
import { getCuentas, type CuentaConfig } from "@/lib/services/cuentas"
import { getSesionAbierta } from "@/lib/services/caja-chica"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"

// ==================== TIPOS ====================

/** Una fila del Excel (una linea de producto de una factura). */
export interface FilaImport {
  fila: number // numero de fila en el Excel (para reportar errores)
  fecha: string
  factura: string
  producto: string
  codigo: string
  cantidad: number
  precio_unitario: number
  descuento_pct: number
  subtotal: number
}

/** Opciones que el usuario elige en la interfaz (aplican a todo el archivo). */
export interface OpcionesImport {
  cliente_id: number
  almacen_id: number
  localizacion_id: number
  metodo: "Efectivo" | "Banco"
  cuenta_id?: number | null
  aplica_isv: boolean
}

export interface ResultadoFactura {
  numero: string
  estado: "creada" | "omitida" | "error"
  total?: number
  detalle?: string
}

export interface ResultadoImport {
  creadas: number
  omitidas: number
  errores: number
  totalImportado: number
  facturas: ResultadoFactura[]
}

/** Resumen previo (validacion) que se muestra antes de confirmar. */
export interface PreviewImport {
  facturas: number
  lineas: number
  total: number
  duplicadas: string[] // numeros de factura que ya existen
  productosNoEncontrados: string[] // codigos/nombres sin match
  error: string | null
}

// ==================== PARSEO ====================

function num(v: unknown): number {
  if (typeof v === "number") return v
  if (typeof v === "string") {
    // Acepta "1.505,40" y "1505.4".
    const limpio = v.replace(/\s/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".")
    const n = parseFloat(limpio)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function str(v: unknown): string {
  if (v == null) return ""
  return String(v).trim()
}

/** Toma el valor de la primera columna cuyo encabezado matchee alguno de los alias. */
function col(row: Record<string, unknown>, alias: string[]): unknown {
  const keys = Object.keys(row)
  for (const a of alias) {
    const k = keys.find((k) => k.trim().toLowerCase() === a.toLowerCase())
    if (k != null) return row[k]
  }
  return undefined
}

/**
 * Parsea el archivo Excel a filas normalizadas. Tolerante a tildes y a
 * variaciones menores de encabezado.
 */
export async function parsearArchivoVentas(file: File): Promise<FilaImport[]> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: "array" })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" })

  const filas: FilaImport[] = []
  rows.forEach((row, i) => {
    const factura = str(col(row, ["Factura", "N Factura", "No Factura", "Numero Factura"]))
    const cantidad = num(col(row, ["Cantidad", "Cant", "Cant."]))
    if (!factura || cantidad <= 0) return // filas vacias o de encabezado sobrante

    filas.push({
      fila: i + 2, // +2: fila 1 es el encabezado, y sheet_to_json es 0-based
      fecha: str(col(row, ["Fecha"])),
      factura,
      producto: str(col(row, ["Producto", "Descripcion", "Descripción"])),
      codigo: str(col(row, ["Codigo de Barras", "Código de Barras", "Codigo", "Código", "SKU"])),
      cantidad,
      precio_unitario: num(col(row, ["Precio Unitario", "Precio Unit", "Precio Unit.", "Precio"])),
      descuento_pct: num(col(row, ["Descuento (%)", "Descuento", "Desc (%)", "Desc"])),
      subtotal: num(col(row, ["Subtotal", "Total Linea", "Total Línea"])),
    })
  })
  return filas
}

// ==================== HELPERS DE VALORACION ====================

/** Fecha del Excel (DD/MM/YYYY o Date) -> ISO al mediodia (evita corrimiento de dia por TZ). */
function fechaAISO(fecha: string): string {
  const s = fecha.trim()
  const m = s.match(/(\d{1,2})[/\-](\d{1,2})[/\-](\d{2,4})/)
  if (m) {
    const [, d, mo, y] = m
    const anio = y.length === 2 ? 2000 + Number(y) : Number(y)
    const dt = new Date(anio, Number(mo) - 1, Number(d), 12, 0, 0)
    if (!Number.isNaN(dt.getTime())) return dt.toISOString()
  }
  const parsed = new Date(s)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  return new Date().toISOString()
}

/** Precio unitario efectivo (neto de descuento), para que el subtotal cuadre con el Excel. */
function precioEfectivo(f: FilaImport): number {
  if (f.subtotal > 0 && f.cantidad > 0) return +(f.subtotal / f.cantidad).toFixed(4)
  const desc = Math.min(Math.max(f.descuento_pct, 0), 100)
  return +(f.precio_unitario * (1 - desc / 100)).toFixed(4)
}

function buscarProducto(
  f: FilaImport,
  porCodigo: Map<string, Producto>,
  porNombre: Map<string, Producto>
): Producto | null {
  if (f.codigo) {
    const p = porCodigo.get(f.codigo.trim().toLowerCase())
    if (p) return p
  }
  if (f.producto) {
    const p = porNombre.get(f.producto.trim().toLowerCase())
    if (p) return p
  }
  return null
}

/** Agrupa filas por numero de factura preservando el orden de aparicion. */
function agruparPorFactura(filas: FilaImport[]): Map<string, FilaImport[]> {
  const grupos = new Map<string, FilaImport[]>()
  for (const f of filas) {
    const arr = grupos.get(f.factura) ?? []
    arr.push(f)
    grupos.set(f.factura, arr)
  }
  return grupos
}

async function cargarContexto(): Promise<{
  porCodigo: Map<string, Producto>
  porNombre: Map<string, Producto>
  cuentas: CuentaConfig[]
  facturasExistentes: Set<string>
}> {
  const [prodRes, cuentasRes] = await Promise.all([getProductos(), getCuentas()])
  const porCodigo = new Map<string, Producto>()
  const porNombre = new Map<string, Producto>()
  for (const p of prodRes.data || []) {
    if (p.codigo_barras) porCodigo.set(p.codigo_barras.trim().toLowerCase(), p)
    if (p.nombre) porNombre.set(p.nombre.trim().toLowerCase(), p)
  }

  const facturasExistentes = new Set<string>()
  if (isSupabaseConfigured()) {
    const supabase = createClient()
    if (supabase) {
      const { data } = await supabase.from("ventas_encabezado").select("numero_factura")
      for (const v of data || []) {
        if (v.numero_factura) facturasExistentes.add(String(v.numero_factura).trim())
      }
    }
  }

  return { porCodigo, porNombre, cuentas: cuentasRes.data || [], facturasExistentes }
}

// ==================== PREVIEW ====================

export async function previsualizarImport(filas: FilaImport[]): Promise<PreviewImport> {
  if (filas.length === 0) {
    return { facturas: 0, lineas: 0, total: 0, duplicadas: [], productosNoEncontrados: [], error: "El archivo no tiene filas válidas" }
  }
  const { porCodigo, porNombre, facturasExistentes } = await cargarContexto()
  const grupos = agruparPorFactura(filas)

  const duplicadas: string[] = []
  const noEncontrados = new Set<string>()
  let total = 0

  for (const [numero, lineas] of grupos) {
    if (facturasExistentes.has(numero.trim())) duplicadas.push(numero)
    for (const f of lineas) {
      if (!buscarProducto(f, porCodigo, porNombre)) {
        noEncontrados.add(f.codigo || f.producto || `fila ${f.fila}`)
      }
      total += precioEfectivo(f) * f.cantidad
    }
  }

  return {
    facturas: grupos.size,
    lineas: filas.length,
    total: +total.toFixed(2),
    duplicadas,
    productosNoEncontrados: [...noEncontrados],
    error: null,
  }
}

// ==================== IMPORTACION ====================

export async function importarVentas(
  filas: FilaImport[],
  opciones: OpcionesImport
): Promise<{ data: ResultadoImport | null; error: string | null }> {
  if (filas.length === 0) return { data: null, error: "El archivo no tiene filas válidas" }

  // Efectivo requiere caja abierta (misma regla que Nueva Venta).
  if (opciones.metodo === "Efectivo") {
    const { data: sesion } = await getSesionAbierta()
    if (!sesion) {
      return { data: null, error: "Debes abrir la caja chica para importar ventas en efectivo, o elige una cuenta bancaria." }
    }
  }
  if (opciones.metodo === "Banco" && !opciones.cuenta_id) {
    return { data: null, error: "Selecciona la cuenta bancaria de destino." }
  }

  const { porCodigo, porNombre, cuentas, facturasExistentes } = await cargarContexto()
  const cuenta = cuentas.find((c) => c.id === opciones.cuenta_id)
  const comision = opciones.metodo === "Banco" ? Number(cuenta?.porcentaje_comision || 0) : 0

  const grupos = agruparPorFactura(filas)
  const resultado: ResultadoImport = { creadas: 0, omitidas: 0, errores: 0, totalImportado: 0, facturas: [] }

  for (const [numero, lineas] of grupos) {
    // 1) Duplicada: no re-importar.
    if (facturasExistentes.has(numero.trim())) {
      resultado.omitidas++
      resultado.facturas.push({ numero, estado: "omitida", detalle: "Ya existe una factura con este número" })
      continue
    }

    // 2) Resolver productos de la factura.
    const detalles: {
      producto_id: number
      cantidad: number
      precio_unitario: number
      costo_promedio_momento: number
      utilidad_linea: number
    }[] = []
    let subtotal = 0
    let productoFaltante: string | null = null

    for (const f of lineas) {
      const prod = buscarProducto(f, porCodigo, porNombre)
      if (!prod || prod.id == null) {
        productoFaltante = f.codigo || f.producto || `fila ${f.fila}`
        break
      }
      const precio = precioEfectivo(f)
      const costo = Number(prod.costo_promedio || 0)
      subtotal += precio * f.cantidad
      detalles.push({
        producto_id: prod.id,
        cantidad: f.cantidad,
        precio_unitario: precio,
        costo_promedio_momento: costo,
        utilidad_linea: +((precio - costo) * f.cantidad).toFixed(2),
      })
    }

    if (productoFaltante) {
      resultado.errores++
      resultado.facturas.push({ numero, estado: "error", detalle: `Producto no encontrado: ${productoFaltante}` })
      continue
    }

    subtotal = +subtotal.toFixed(2)
    const impuesto = opciones.aplica_isv ? +(subtotal * 0.15).toFixed(2) : 0
    const totalBruto = +(subtotal + impuesto).toFixed(2)
    const totalNeto = +(totalBruto * (1 - comision / 100)).toFixed(2)

    const pagos_detalle: PagoVentaDetalleInput[] = [
      opciones.metodo === "Banco"
        ? { metodo_pago: "Banco", cuenta_id: opciones.cuenta_id, monto_bruto: totalBruto, porcentaje_comision: comision, monto_neto: totalNeto }
        : { metodo_pago: "Efectivo", monto_bruto: totalBruto, porcentaje_comision: 0, monto_neto: totalBruto },
    ]

    // 3) Crear la venta con la MISMA logica que Nueva Venta (inventario,
    //    kardex, ventas_pagos_detalle, caja/bancos).
    const res = await crearVenta({
      encabezado: {
        numero_factura: numero,
        cliente_id: opciones.cliente_id,
        almacen_id: opciones.almacen_id,
        fecha_venta: fechaAISO(lineas[0].fecha),
        aplica_impuesto: opciones.aplica_isv,
        porcentaje_impuesto: 15,
        descuento: 0,
        subtotal,
        impuesto_total: impuesto,
        // BRUTO (lo que paga el cliente). La comision es costo aparte; el
        // neto real recibido se refleja en el movimiento de banco.
        total_venta: totalBruto,
        estado_pago: "Pagado",
        valorpago: totalBruto,
      },
      detalles,
      almacen_id: opciones.almacen_id,
      localizacion_id: opciones.localizacion_id,
      pagos_detalle,
    })

    if (res.error || !res.data) {
      resultado.errores++
      resultado.facturas.push({ numero, estado: "error", detalle: res.error || "No se pudo crear la venta" })
    } else {
      resultado.creadas++
      resultado.totalImportado += totalNeto
      resultado.facturas.push({ numero, estado: "creada", total: totalNeto })
      // Evita duplicar si la misma factura apareciera dos veces en el archivo.
      facturasExistentes.add(numero.trim())
    }
  }

  resultado.totalImportado = +resultado.totalImportado.toFixed(2)
  return { data: resultado, error: null }
}

// ==================== PLANTILLA ====================

/** Descarga una plantilla .xlsx con las columnas esperadas y una fila de ejemplo. */
export function descargarPlantillaVentas(): void {
  const ejemplo = [
    {
      Fecha: "27/06/2026",
      Factura: "FC-0247",
      Producto: "MARSELLA ROJA",
      "Codigo de Barras": "CB-012",
      Cantidad: 1,
      "Precio Unitario": 1505.4,
      "Descuento (%)": 0,
      Subtotal: 1505.4,
    },
    {
      Fecha: "18/06/2026",
      Factura: "FC-0033",
      Producto: "PETIT CUFRA",
      "Codigo de Barras": "CB-070",
      Cantidad: 1,
      "Precio Unitario": 2267.75,
      "Descuento (%)": 0,
      Subtotal: 2267.75,
    },
  ]
  const ws = XLSX.utils.json_to_sheet(ejemplo)
  ws["!cols"] = [{ wch: 12 }, { wch: 12 }, { wch: 28 }, { wch: 16 }, { wch: 10 }, { wch: 14 }, { wch: 12 }, { wch: 14 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Ventas")
  XLSX.writeFile(wb, "Plantilla_Importar_Ventas.xlsx")
}
