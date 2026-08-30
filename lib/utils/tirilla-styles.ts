/**
 * Estilos y armazon comun de las tirillas termicas (80 mm), reutilizados por los
 * comprobantes de devolucion y cierre. La tirilla de VENTA
 * (lib/utils/tirilla-venta.ts) mantiene su propia copia identica de estos
 * estilos; si cambias uno, refleja el otro para que se vean igual.
 *
 * `wrapTirillaHtml` devuelve el documento COMPLETO listo para `printTirilla`
 * (incluye el <style id="page-style"> con el @page que el helper sobrescribe con
 * el alto exacto medido).
 */

/** Escapa `< > &` para no romper el HTML con textos del usuario. */
export const escTirilla = (s: string | null | undefined): string =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

export const TIRILLA_PAGE_STYLE = `<style id="page-style">
  /* Se sobrescribe dinamicamente con el alto exacto medido. */
  @page { size: 80mm 500mm; margin: 0 !important; }
</style>`

export const TIRILLA_MAIN_STYLE = `<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { margin: 0; padding: 0; }
  body {
    width: 80mm;
    margin: 0;
    padding: 1mm 3mm 3mm 3mm;
    /* Sans-serif y peso alto: en impresoras termicas el texto delgado sale
       tenue; con bold se lee nitido sin verse deforme. */
    font-family: Arial, Helvetica, 'Segoe UI', sans-serif;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.45;
    color: #000;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .center { text-align: center; }
  .logo   { display: block; margin: 0 auto 4px; max-width: 55mm; max-height: 30mm; width: auto; height: auto; }
  .emp    { font-size: 17px; font-weight: 800; text-align: center; word-wrap: break-word; }
  .sub    { font-size: 11px; font-weight: 700; text-align: center; line-height: 1.35; word-wrap: break-word; }
  .title  { font-size: 15px; font-weight: 800; text-align: center; margin: 2px 0; }
  .meta   { font-size: 12px; margin: 1px 0; }
  .line   { border-top: 1px solid #000; margin: 5px 0; }
  .item       { margin: 4px 0; }
  .item-name  { font-size: 12px; font-weight: 800; word-wrap: break-word; }
  .item-code  { font-size: 10px; font-weight: 700; word-wrap: break-word; }
  .row    { display: flex; justify-content: space-between; font-size: 12px; margin: 2px 0; gap: 8px; }
  .row span:last-child { white-space: nowrap; text-align: right; }
  .row.bold   { font-weight: 800; }
  .row.total  { font-size: 16px; font-weight: 800; margin: 4px 0; }
  .foot   { text-align: center; font-size: 12px; margin-top: 8px; }
</style>`

/** Envuelve el cuerpo de una tirilla en el documento HTML completo. */
export function wrapTirillaHtml(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
${TIRILLA_PAGE_STYLE}
${TIRILLA_MAIN_STYLE}
</head>
<body>
${bodyHtml}
</body></html>`
}
