import * as XLSX from "xlsx"
import {
  getProductos, getCategorias, getMarcas, saveProducto, type Producto,
} from "@/lib/services/catalogos"
import { procesarIngresoManual } from "@/lib/services/inventario"

// ==================== TIPOS ====================

/** Una fila del Excel (un producto). */
export interface FilaProductoImport {
  fila: number // numero de fila en el Excel (para reportar errores)
  codigo: string
  nombre: string
  categoria: string
  marca: string
  talla: string
  precio_venta: number
  costo_unitario: number
  cantidad_inicial: number
}

/** Opciones que el usuario elige (aplican al inventario inicial de todo el archivo). */
export interface OpcionesImportProductos {
  almacen_id: number
  localizacion_id: number
}

/** Resumen previo (validacion) que se muestra antes de confirmar. */
export interface PreviewProductos {
  total: number
  nuevos: number
  duplicados: string[] // codigos/nombres ya existentes (se omitiran)
  sinNombre: number // filas sin nombre (invalidas)
  categoriasNoEncontradas: string[]
  marcasNoEncontradas: string[]
  valorInventarioInicial: number // Σ cantidad × costo
  unidadesIniciales: number
  error: string | null
}

export interface ResultadoProducto {
  identificador: string
  estado: "creado" | "omitido" | "error" | "sin_inventario"
  detalle?: string
}

export interface ResultadoImportProductos {
  creados: number
  omitidos: number
  errores: number
  conInventario: number
  sinInventario: number
  productos: ResultadoProducto[]
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

/** Parsea el archivo Excel a filas normalizadas. Tolerante a tildes/variaciones. */
export async function parsearArchivoProductos(file: File): Promise<FilaProductoImport[]> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: "array" })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" })

  const filas: FilaProductoImport[] = []
  rows.forEach((row, i) => {
    const nombre = str(col(row, ["Nombre", "Producto", "Descripcion", "Descripción"]))
    const codigo = str(col(row, ["Codigo de Barras", "Código de Barras", "Codigo", "Código", "SKU"]))
    // Filas totalmente vacias (sin nombre ni codigo) se ignoran.
    if (!nombre && !codigo) return

    filas.push({
      fila: i + 2, // +2: fila 1 es el encabezado y sheet_to_json es 0-based
      codigo,
      nombre,
      categoria: str(col(row, ["Categoria", "Categoría"])),
      marca: str(col(row, ["Marca"])),
      talla: str(col(row, ["Talla"])),
      precio_venta: num(col(row, ["Precio Venta", "Precio de Venta", "Precio", "Precio Unitario"])),
      costo_unitario: num(col(row, ["Costo Unitario", "Costo", "Costo Unit", "Costo Unit."])),
      cantidad_inicial: num(col(row, ["Cantidad Inicial", "Cantidad", "Stock Inicial", "Existencias"])),
    })
  })
  return filas
}

// ==================== CONTEXTO ====================

async function cargarContexto(): Promise<{
  codigosExistentes: Set<string>
  nombresExistentes: Set<string>
  catPorNombre: Map<string, number>
  marcaPorNombre: Map<string, number>
}> {
  const [prodRes, catRes, marcaRes] = await Promise.all([getProductos(), getCategorias(), getMarcas()])

  const codigosExistentes = new Set<string>()
  const nombresExistentes = new Set<string>()
  for (const p of prodRes.data || []) {
    if (p.codigo_barras) codigosExistentes.add(p.codigo_barras.trim().toLowerCase())
    if (p.nombre) nombresExistentes.add(p.nombre.trim().toLowerCase())
  }

  const catPorNombre = new Map<string, number>()
  for (const c of catRes.data || []) if (c.id != null) catPorNombre.set(c.nombre.trim().toLowerCase(), c.id)

  const marcaPorNombre = new Map<string, number>()
  for (const m of marcaRes.data || []) if (m.id != null) marcaPorNombre.set(m.nombre.trim().toLowerCase(), m.id)

  return { codigosExistentes, nombresExistentes, catPorNombre, marcaPorNombre }
}

// ==================== PREVIEW ====================

export async function previsualizarImportProductos(filas: FilaProductoImport[]): Promise<PreviewProductos> {
  const vacio: PreviewProductos = {
    total: 0, nuevos: 0, duplicados: [], sinNombre: 0,
    categoriasNoEncontradas: [], marcasNoEncontradas: [],
    valorInventarioInicial: 0, unidadesIniciales: 0, error: null,
  }
  if (filas.length === 0) return { ...vacio, error: "El archivo no tiene filas válidas" }

  const ctx = await cargarContexto()
  const duplicados: string[] = []
  const catNo = new Set<string>()
  const marcaNo = new Set<string>()
  const vistosCodigo = new Set<string>()
  const vistosNombre = new Set<string>()
  let sinNombre = 0, valor = 0, unidades = 0, nuevos = 0

  for (const f of filas) {
    if (!f.nombre) { sinNombre++; continue }
    const codigoKey = f.codigo.trim().toLowerCase()
    const nombreKey = f.nombre.trim().toLowerCase()
    const dup =
      (codigoKey && (ctx.codigosExistentes.has(codigoKey) || vistosCodigo.has(codigoKey))) ||
      ctx.nombresExistentes.has(nombreKey) || vistosNombre.has(nombreKey)
    if (dup) { duplicados.push(f.codigo || f.nombre); continue }

    if (codigoKey) vistosCodigo.add(codigoKey)
    vistosNombre.add(nombreKey)
    nuevos++
    if (f.categoria && !ctx.catPorNombre.has(f.categoria.trim().toLowerCase())) catNo.add(f.categoria)
    if (f.marca && !ctx.marcaPorNombre.has(f.marca.trim().toLowerCase())) marcaNo.add(f.marca)
    if (f.cantidad_inicial > 0) {
      unidades += f.cantidad_inicial
      valor += f.cantidad_inicial * f.costo_unitario
    }
  }

  return {
    total: filas.length,
    nuevos,
    duplicados,
    sinNombre,
    categoriasNoEncontradas: [...catNo],
    marcasNoEncontradas: [...marcaNo],
    valorInventarioInicial: +valor.toFixed(2),
    unidadesIniciales: unidades,
    error: null,
  }
}

// ==================== IMPORTACION ====================

export async function importarProductos(
  filas: FilaProductoImport[],
  opciones: OpcionesImportProductos
): Promise<{ data: ResultadoImportProductos | null; error: string | null }> {
  if (filas.length === 0) return { data: null, error: "El archivo no tiene filas válidas" }

  // Si hay cantidades iniciales, exige almacen + bodega para generar el cargue.
  const hayCantidades = filas.some((f) => f.cantidad_inicial > 0)
  if (hayCantidades && (!opciones.almacen_id || !opciones.localizacion_id)) {
    return { data: null, error: "Selecciona el almacén y la bodega para el inventario inicial." }
  }

  const ctx = await cargarContexto()
  const resultado: ResultadoImportProductos = {
    creados: 0, omitidos: 0, errores: 0, conInventario: 0, sinInventario: 0, productos: [],
  }
  const vistosCodigo = new Set<string>()

  for (const f of filas) {
    const id = f.codigo || f.nombre || `fila ${f.fila}`

    if (!f.nombre) {
      resultado.errores++
      resultado.productos.push({ identificador: `fila ${f.fila}`, estado: "error", detalle: "Sin nombre de producto" })
      continue
    }

    const codigoKey = f.codigo.trim().toLowerCase()
    const nombreKey = f.nombre.trim().toLowerCase()
    if (
      (codigoKey && (ctx.codigosExistentes.has(codigoKey) || vistosCodigo.has(codigoKey))) ||
      ctx.nombresExistentes.has(nombreKey)
    ) {
      resultado.omitidos++
      resultado.productos.push({ identificador: id, estado: "omitido", detalle: "Ya existe un producto con ese código o nombre" })
      continue
    }

    const categoria_id = f.categoria ? ctx.catPorNombre.get(f.categoria.trim().toLowerCase()) ?? null : null
    const marca_id = f.marca ? ctx.marcaPorNombre.get(f.marca.trim().toLowerCase()) ?? null : null

    const productoData: Producto = {
      nombre: f.nombre,
      codigo_barras: f.codigo,
      precio_venta_sugerido: f.precio_venta,
      costo_promedio: f.costo_unitario,
      categoria_id,
      marca_id,
      subcategoria_id: null,
      talla: f.talla || null,
      foto_url: "",
    }

    const { data: creado, error } = await saveProducto(productoData, true)
    if (error || !creado?.id) {
      resultado.errores++
      resultado.productos.push({ identificador: id, estado: "error", detalle: error || "No se pudo crear el producto" })
      continue
    }

    resultado.creados++
    if (codigoKey) vistosCodigo.add(codigoKey)
    ctx.nombresExistentes.add(nombreKey) // evita duplicar por nombre dentro del archivo

    // Inventario inicial: genera el "Ingreso Manual" con la cantidad y costo.
    if (f.cantidad_inicial > 0) {
      const ing = await procesarIngresoManual({
        producto_id: creado.id,
        almacen_id: opciones.almacen_id,
        localizacion_id: opciones.localizacion_id,
        cantidad: f.cantidad_inicial,
        costo_unitario: f.costo_unitario,
        observaciones: "Inventario inicial (carga masiva)",
        stock_anterior: 0,
        costo_anterior: 0,
        nuevo_stock: f.cantidad_inicial,
        nuevo_costo: f.costo_unitario,
      })
      if (ing.error) {
        resultado.sinInventario++
        resultado.productos.push({ identificador: id, estado: "sin_inventario", detalle: `Creado, pero sin inventario inicial: ${ing.error}` })
      } else {
        resultado.conInventario++
        resultado.productos.push({ identificador: id, estado: "creado" })
      }
    } else {
      resultado.productos.push({ identificador: id, estado: "creado" })
    }
  }

  return { data: resultado, error: null }
}

// ==================== PLANTILLA ====================

/** Descarga una plantilla .xlsx con las columnas esperadas y filas de ejemplo. */
export function descargarPlantillaProductos(): void {
  const ejemplo = [
    {
      "Codigo de Barras": "CB-001",
      Nombre: "Camisa Polo Azul",
      Categoria: "Ropa",
      Marca: "Marca X",
      Talla: "M",
      "Precio Venta": 350,
      "Costo Unitario": 180,
      "Cantidad Inicial": 20,
    },
    {
      "Codigo de Barras": "CB-002",
      Nombre: "Pantalon Jean",
      Categoria: "Ropa",
      Marca: "Marca Y",
      Talla: "32",
      "Precio Venta": 650,
      "Costo Unitario": 300,
      "Cantidad Inicial": 10,
    },
  ]
  const ws = XLSX.utils.json_to_sheet(ejemplo)
  ws["!cols"] = [
    { wch: 16 }, { wch: 28 }, { wch: 16 }, { wch: 16 }, { wch: 8 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Productos")
  XLSX.writeFile(wb, "Plantilla_Carga_Productos.xlsx")
}
