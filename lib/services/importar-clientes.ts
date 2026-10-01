import * as XLSX from "xlsx"
import { getClientes, saveCliente, getAlmacenes, getLocalizaciones, type Cliente } from "@/lib/services/catalogos"
import { crearVenta } from "@/lib/services/ventas"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"

// ==================== IMPORTAR CLIENTES · Excel ====================
//
// Descarga de plantilla + parseo + preview + carga masiva de clientes. Mismo
// estilo tolerante a tildes/variaciones de encabezado que importar-materiales.
// Dedup por RTN (si viene) y, si no, por nombre. Crea con saveCliente(_, true).

function str(v: unknown): string {
  if (v == null) return ""
  return String(v).trim()
}

/** Convierte a número tolerando "1.505,40" y "1505.4"; vacío/invalid -> 0. */
function num(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0
  if (typeof v === "string") {
    const limpio = v.replace(/\s/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".")
    const n = parseFloat(limpio)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

/** Valor de la primera columna cuyo encabezado matchee alguno de los alias. */
function col(row: Record<string, unknown>, alias: string[]): unknown {
  const keys = Object.keys(row)
  for (const a of alias) {
    const k = keys.find((k) => k.trim().toLowerCase() === a.toLowerCase())
    if (k != null) return row[k]
  }
  return undefined
}

/** Normaliza una fecha de Excel a ISO 'YYYY-MM-DD' (o "" si no se reconoce). */
function fechaISO(v: unknown): string {
  if (v == null || v === "") return ""
  // Excel puede entregar un número de serie de fecha o un string.
  if (typeof v === "number") {
    const d = XLSX.SSF ? XLSX.SSF.parse_date_code(v) : null
    if (d && d.y) {
      const mm = String(d.m).padStart(2, "0")
      const dd = String(d.d).padStart(2, "0")
      return `${d.y}-${mm}-${dd}`
    }
    return ""
  }
  const s = String(v).trim()
  // dd/mm/yyyy o dd-mm-yyyy -> yyyy-mm-dd
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`
  // yyyy-mm-dd ya válido
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  return ""
}

export interface FilaClienteImport {
  fila: number
  nombre: string
  rtn: string
  direccion: string
  telefono: string
  fecha_nacimiento: string // ISO o ""
  saldo_pendiente: number // > 0 => se crea venta de apertura a crédito
}

export interface PreviewClientes {
  total: number
  nuevos: number
  duplicados: string[] // nombres/RTN que ya existen
  sinNombre: number
  /** Clientes NUEVOS con saldo pendiente > 0 (se les creará una venta de apertura). */
  conSaldo: number
  /** Σ de los saldos de apertura a crear. */
  totalSaldo: number
}

/** Opciones de la carga (para las ventas de saldo inicial). */
export interface OpcionesImportClientes {
  /** Fecha de la venta de saldo inicial (ISO 'YYYY-MM-DD'). */
  fechaSaldoInicial: string
}

export interface ResultadoCliente {
  identificador: string
  estado: "creado" | "omitido" | "error"
  detalle: string
}

export interface ResultadoImportClientes {
  creados: number
  omitidos: number
  errores: number
  /** Ventas de saldo inicial (cuentas por cobrar de apertura) creadas. */
  saldosCreados: number
  /** Ventas de saldo inicial que fallaron (el cliente sí se creó). */
  saldosConError: number
  clientes: ResultadoCliente[]
}

/** Siguiente correlativo `SI-####` para ventas de saldo inicial del tenant. */
async function siguienteNumeroSaldoInicial(): Promise<string> {
  if (!isSupabaseConfigured()) return `SI-${Date.now().toString().slice(-6)}`
  const supabase = createClient()
  if (!supabase) return `SI-${Date.now().toString().slice(-6)}`
  // Cuenta las ventas SI- ya existentes (RLS acota al tenant) para continuar la serie.
  const { count } = await supabase
    .from("ventas_encabezado")
    .select("id", { count: "exact", head: true })
    .like("numero_factura", "SI-%")
  const n = (count ?? 0) + 1
  return `SI-${String(n).padStart(4, "0")}`
}

const CLIENTES_TEMPLATE_HEADERS = [
  "Nombre",
  "RTN",
  "Direccion",
  "Telefono",
  "Fecha Nacimiento",
  "Saldo Pendiente",
] as const

/** Descarga la plantilla .xlsx de carga de clientes con 2 filas de ejemplo. */
export function descargarPlantillaClientes(): void {
  const ejemplo: Record<string, unknown>[] = [
    { Nombre: "Juan Pérez", RTN: "0801-1990-00123", Direccion: "Col. Centro, Tegucigalpa", Telefono: "9999-9999", "Fecha Nacimiento": "1990-05-20", "Saldo Pendiente": 0 },
    { Nombre: "María López", RTN: "", Direccion: "", Telefono: "8888-8888", "Fecha Nacimiento": "", "Saldo Pendiente": 1500 },
  ]
  const ws = XLSX.utils.json_to_sheet(ejemplo, { header: CLIENTES_TEMPLATE_HEADERS as unknown as string[] })
  ws["!cols"] = [{ wch: 28 }, { wch: 18 }, { wch: 30 }, { wch: 14 }, { wch: 16 }, { wch: 16 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Clientes")
  XLSX.writeFile(wb, "Plantilla_Clientes.xlsx")
}

/** Parsea el Excel a filas normalizadas. Ignora filas sin nombre. */
export async function parsearArchivoClientes(file: File): Promise<FilaClienteImport[]> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: "array" })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" })

  const filas: FilaClienteImport[] = []
  rows.forEach((row, i) => {
    const nombre = str(col(row, ["Nombre", "Cliente", "Razon Social", "Razón Social"]))
    const rtn = str(col(row, ["RTN", "Rtn", "Identidad", "DNI"]))
    // Ignora filas totalmente vacías (sin nombre y sin rtn).
    if (!nombre && !rtn) return
    filas.push({
      fila: i + 2,
      nombre,
      rtn,
      direccion: str(col(row, ["Direccion", "Dirección", "Domicilio"])),
      telefono: str(col(row, ["Telefono", "Teléfono", "Celular", "Tel"])),
      fecha_nacimiento: fechaISO(col(row, ["Fecha Nacimiento", "Fecha de Nacimiento", "Nacimiento", "Cumpleaños", "Cumpleanos"])),
      saldo_pendiente: Math.max(0, num(col(row, ["Saldo Pendiente", "Saldo", "Saldo Inicial", "Deuda", "Por Cobrar"]))),
    })
  })
  return filas
}

/** Contexto de dedup: clientes existentes por RTN y por nombre (lowercased). */
async function cargarContexto(): Promise<{ porRtn: Set<string>; porNombre: Set<string> }> {
  const { data } = await getClientes()
  const porRtn = new Set<string>()
  const porNombre = new Set<string>()
  for (const c of data) {
    if (c.rtn) porRtn.add(c.rtn.trim().toLowerCase())
    if (c.nombre) porNombre.add(c.nombre.trim().toLowerCase())
  }
  return { porRtn, porNombre }
}

/** true si la fila ya existe (por RTN si lo trae, o por nombre). */
function esDuplicado(f: FilaClienteImport, ctx: { porRtn: Set<string>; porNombre: Set<string> }): boolean {
  if (f.rtn) return ctx.porRtn.has(f.rtn.trim().toLowerCase())
  return ctx.porNombre.has(f.nombre.trim().toLowerCase())
}

export async function previsualizarImportClientes(filas: FilaClienteImport[]): Promise<PreviewClientes> {
  const ctx = await cargarContexto()
  let nuevos = 0
  let sinNombre = 0
  let conSaldo = 0
  let totalSaldo = 0
  const duplicados: string[] = []
  for (const f of filas) {
    if (!f.nombre) { sinNombre++; continue }
    if (esDuplicado(f, ctx)) { duplicados.push(f.rtn || f.nombre); continue }
    nuevos++
    if (f.saldo_pendiente > 0) { conSaldo++; totalSaldo += f.saldo_pendiente }
  }
  return { total: filas.length, nuevos, duplicados, sinNombre, conSaldo, totalSaldo: +totalSaldo.toFixed(2) }
}

export async function importarClientes(
  filas: FilaClienteImport[],
  opciones?: OpcionesImportClientes,
): Promise<{ data: ResultadoImportClientes | null; error: string | null }> {
  const ctx = await cargarContexto()
  const res: ResultadoImportClientes = { creados: 0, omitidos: 0, errores: 0, saldosCreados: 0, saldosConError: 0, clientes: [] }

  // ¿Hay saldos de apertura por cargar? Resolvemos almacén/localización (la venta
  // de apertura es una línea de Venta Rápida que NO mueve inventario; el almacén
  // es solo un requisito formal del registro) y preparamos el correlativo SI-.
  const haySaldos = filas.some((f) => f.nombre && !esDuplicado(f, ctx) && f.saldo_pendiente > 0)
  let almacenId = 0
  let localizacionId = 0
  let fechaSaldo = opciones?.fechaSaldoInicial || ""
  let siCounter = 0
  if (haySaldos) {
    const almRes = await getAlmacenes()
    const alm = (almRes.data || [])[0]
    if (alm?.id != null) {
      almacenId = alm.id
      const locRes = await getLocalizaciones(alm.id)
      localizacionId = (locRes.data || [])[0]?.id ?? 0
    }
    // Base del correlativo SI-#### (se incrementa localmente por cada venta).
    const base = await siguienteNumeroSaldoInicial()
    const m = base.match(/SI-(\d+)/)
    siCounter = m ? parseInt(m[1]) : 1
  }

  for (const f of filas) {
    const ident = f.rtn || f.nombre || `Fila ${f.fila}`
    if (!f.nombre) {
      res.omitidos++
      res.clientes.push({ identificador: `Fila ${f.fila}`, estado: "omitido", detalle: "Sin nombre" })
      continue
    }
    if (esDuplicado(f, ctx)) {
      res.omitidos++
      res.clientes.push({ identificador: ident, estado: "omitido", detalle: "Ya existe" })
      continue
    }
    const cliente: Cliente = {
      nombre: f.nombre,
      rtn: f.rtn || undefined,
      direccion: f.direccion || undefined,
      telefono: f.telefono || undefined,
      fecha_nacimiento: f.fecha_nacimiento || undefined,
    }
    const { data: creado, error } = await saveCliente(cliente, true)
    if (error || !creado?.id) {
      res.errores++
      res.clientes.push({ identificador: ident, estado: "error", detalle: error || "No se pudo crear el cliente" })
      continue
    }
    res.creados++
    // Actualiza el contexto para dedup dentro del mismo archivo.
    if (f.rtn) ctx.porRtn.add(f.rtn.trim().toLowerCase())
    ctx.porNombre.add(f.nombre.trim().toLowerCase())

    // Saldo de apertura: venta a crédito con una línea de Venta Rápida "Saldo
    // inicial" (sin producto, sin inventario). Queda como cuenta por cobrar.
    if (f.saldo_pendiente > 0 && almacenId && localizacionId) {
      const total = +f.saldo_pendiente.toFixed(2)
      const numero = `SI-${String(siCounter++).padStart(4, "0")}`
      const ventaRes = await crearVenta({
        encabezado: {
          numero_factura: numero,
          cliente_id: creado.id,
          almacen_id: almacenId,
          fecha_venta: fechaSaldo || undefined,
          aplica_impuesto: false,
          porcentaje_impuesto: 15,
          descuento: 0,
          subtotal: total,
          impuesto_total: 0,
          total_venta: total,
          estado_pago: "Pendiente",
          valorpago: 0,
        },
        detalles: [{
          producto_id: null,
          cantidad: 1,
          precio_unitario: total,
          costo_promedio_momento: 0,
          utilidad_linea: 0,
          descripcion_libre: "Saldo inicial / deuda de apertura",
        }],
        almacen_id: almacenId,
        localizacion_id: localizacionId,
        pagos_detalle: [], // sin pago => 100% crédito (cuenta por cobrar)
        conservarNumeroFactura: true,
      })
      if (ventaRes.error) {
        res.saldosConError++
        res.clientes.push({ identificador: ident, estado: "creado", detalle: `Creado, pero no se cargó su saldo inicial: ${ventaRes.error}` })
      } else {
        res.saldosCreados++
        res.clientes.push({ identificador: ident, estado: "creado", detalle: `Con saldo inicial ${numero}: L ${total.toFixed(2)}` })
      }
    } else {
      res.clientes.push({ identificador: ident, estado: "creado", detalle: "" })
    }
  }
  return { data: res, error: null }
}
