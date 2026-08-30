/**
 * Construye el HTML de una tirilla termica (80 mm) para el CIERRE DIARIO.
 * Mismo estilo que las demas tirillas (comparte lib/utils/tirilla-styles.ts).
 * Recibe una estructura ya "aplanada" para no acoplarse a los tipos del modulo.
 */
import { formatCurrency } from "@/lib/utils/format"
import { escTirilla as esc, wrapTirillaHtml } from "@/lib/utils/tirilla-styles"

export interface TirillaCierreKV {
  label: string
  value: string
}
export interface TirillaCierreBanco {
  banco: string
  ingresos: number
  egresos: number
  saldoFinal: number
}
export interface TirillaCierreProducto {
  nombre: string
  codigo?: string | null
  cantidad: number
  total: number
}
export interface TirillaCierreMovCaja {
  hora: string
  tipo: string
  concepto?: string | null
  monto: number
}
export interface TirillaCierreGasto {
  hora: string
  detalle: string
  metodo: string
  monto: number
}

export interface TirillaCierre {
  empresa: { nombre: string; rtn?: string | null; logoUrl?: string | null }
  fechaTexto: string
  resumen: TirillaCierreKV[]
  bancos?: TirillaCierreBanco[]
  productos?: TirillaCierreProducto[]
  movimientosCaja?: TirillaCierreMovCaja[]
  gastos?: TirillaCierreGasto[]
}

export function buildTirillaCierreHtml(c: TirillaCierre): string {
  const e = c.empresa

  const resumenHtml = c.resumen
    .map((r) => `<div class="row"><span>${esc(r.label)}</span><span>${esc(r.value)}</span></div>`)
    .join("")

  const seccion = (titulo: string, filas: string) =>
    filas ? `<div class="line"></div><div class="meta"><b>${esc(titulo)}</b></div>${filas}` : ""

  const bancosHtml = seccion(
    "Bancos",
    (c.bancos || [])
      .map(
        (b) =>
          `<div class="item"><div class="item-name">${esc(b.banco)}</div>` +
          `<div class="row"><span>Ing ${formatCurrency(b.ingresos)} / Egr ${formatCurrency(b.egresos)}</span>` +
          `<span>${formatCurrency(b.saldoFinal)}</span></div></div>`
      )
      .join("")
  )

  const productosHtml = seccion(
    "Productos vendidos",
    (c.productos || [])
      .map(
        (p) =>
          `<div class="row"><span>${esc(p.nombre)} x${esc(String(p.cantidad))}</span>` +
          `<span>${formatCurrency(p.total)}</span></div>`
      )
      .join("")
  )

  const cajaHtml = seccion(
    "Caja chica",
    (c.movimientosCaja || [])
      .map(
        (m) =>
          `<div class="row"><span>${esc(m.hora)} ${esc(m.tipo)}${m.concepto ? " - " + esc(m.concepto) : ""}</span>` +
          `<span>${formatCurrency(m.monto)}</span></div>`
      )
      .join("")
  )

  const gastosHtml = seccion(
    "Gastos pagados hoy",
    (c.gastos || [])
      .map(
        (g) =>
          `<div class="row"><span>${esc(g.hora)} ${esc(g.detalle)} (${esc(g.metodo)})</span>` +
          `<span>${formatCurrency(g.monto)}</span></div>`
      )
      .join("")
  )

  const body = `
  ${e.logoUrl ? `<img class="logo" src="${esc(e.logoUrl)}" alt="">` : ""}
  <div class="emp">${esc(e.nombre)}</div>
  ${e.rtn ? `<div class="sub">RTN: ${esc(e.rtn)}</div>` : ""}
  <div class="line"></div>
  <div class="title">CIERRE DIARIO</div>
  <div class="meta center">${esc(c.fechaTexto)}</div>
  <div class="line"></div>
  <div class="meta"><b>Resumen</b></div>
  ${resumenHtml}
  ${bancosHtml}
  ${productosHtml}
  ${cajaHtml}
  ${gastosHtml}
  <div class="line"></div>
  <div class="foot">Generado por EasyCount</div>`

  return wrapTirillaHtml(body)
}
