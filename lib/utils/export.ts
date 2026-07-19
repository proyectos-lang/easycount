import * as XLSX from "xlsx"

/**
 * Exporta un arreglo de objetos a un archivo Excel (.xlsx) con columnas
 * separadas. Fuente unica para todos los exports de la app — reemplaza el
 * codigo duplicado inline y elimina la generacion manual de CSV (que tenia
 * bugs de comillas con comas/comillas en los datos).
 *
 * Las llaves de cada objeto en `rows` se vuelven los encabezados de columna,
 * en el orden del primer objeto.
 *
 * @param rows      Filas a exportar (cada objeto = una fila).
 * @param opts.sheetName Nombre de la hoja (default "Datos").
 * @param opts.filename  Nombre del archivo SIN extension (se agrega .xlsx y la fecha si se pide).
 * @param opts.colWidths Anchos de columna opcionales (en caracteres), en orden.
 * @param opts.appendDate Si true (default), agrega _YYYY-MM-DD al nombre.
 */
export function exportToXlsx(
  rows: Record<string, unknown>[],
  opts: {
    sheetName?: string
    filename: string
    colWidths?: number[]
    appendDate?: boolean
  }
): void {
  const { sheetName = "Datos", filename, colWidths, appendDate = true } = opts

  const ws = XLSX.utils.json_to_sheet(rows)
  if (colWidths && colWidths.length > 0) {
    ws["!cols"] = colWidths.map((wch) => ({ wch }))
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  const fecha = appendDate ? `_${new Date().toISOString().split("T")[0]}` : ""
  XLSX.writeFile(wb, `${filename}${fecha}.xlsx`)
}
