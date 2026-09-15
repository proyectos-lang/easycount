import * as XLSX from "xlsx"
import type { FilaMaterialImport } from "@/lib/services/produccion-materiales"

// ==================== IMPORTAR MATERIALES · Excel ====================
//
// Descarga de plantilla + parseo del Excel de carga masiva de materiales.
// La lógica de creación en lote vive en `produccion-materiales.importarMateriales`.
// Tolerante a tildes y variaciones menores de encabezado (mismo estilo que
// `importar-ventas`).

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

/** Valor de la primera columna cuyo encabezado matchee alguno de los alias. */
function col(row: Record<string, unknown>, alias: string[]): unknown {
  const keys = Object.keys(row)
  for (const a of alias) {
    const k = keys.find((k) => k.trim().toLowerCase() === a.toLowerCase())
    if (k != null) return row[k]
  }
  return undefined
}

/** Encabezados exactos de la plantilla (orden de columnas). */
export const MATERIALES_TEMPLATE_HEADERS = [
  "Nombre",
  "Codigo",
  "Unidad",
  "Stock Inicial",
  "Costo Promedio",
] as const

/**
 * Descarga la plantilla .xlsx de carga de materiales, con encabezados y dos
 * filas de ejemplo para orientar al usuario.
 */
export function descargarPlantillaMateriales(): void {
  const ejemplo: Record<string, unknown>[] = [
    { Nombre: "Tela algodón", Codigo: "MAT-001", Unidad: "m", "Stock Inicial": 50, "Costo Promedio": 45.5 },
    { Nombre: "Hilo negro", Codigo: "MAT-002", Unidad: "rollo", "Stock Inicial": 0, "Costo Promedio": 0 },
  ]
  const ws = XLSX.utils.json_to_sheet(ejemplo, { header: MATERIALES_TEMPLATE_HEADERS as unknown as string[] })
  ws["!cols"] = [{ wch: 28 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 16 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Materiales")
  XLSX.writeFile(wb, "Plantilla_Materiales.xlsx")
}

/**
 * Parsea el Excel a filas normalizadas. Ignora filas sin nombre. El stock y el
 * costo se toleran vacíos (quedan en 0 = material sin carga inicial).
 */
export async function parsearArchivoMateriales(file: File): Promise<FilaMaterialImport[]> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: "array" })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" })

  const filas: FilaMaterialImport[] = []
  rows.forEach((row, i) => {
    const nombre = str(col(row, ["Nombre", "Material", "Descripcion", "Descripción"]))
    if (!nombre) return // fila vacía / encabezado sobrante
    filas.push({
      fila: i + 2, // +2: fila 1 es encabezado; sheet_to_json es 0-based
      nombre,
      codigo: str(col(row, ["Codigo", "Código", "SKU", "Code"])),
      unidad_medida: str(col(row, ["Unidad", "Unidad de Medida", "UM", "Medida"])) || "unidad",
      stock_inicial: num(col(row, ["Stock Inicial", "Stock", "Cantidad", "Cantidad Inicial", "Existencia"])),
      costo_promedio: num(col(row, ["Costo Promedio", "Costo", "Costo Unitario", "Costo Prom", "Precio Costo"])),
    })
  })
  return filas
}
