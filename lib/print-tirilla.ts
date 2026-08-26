/**
 * Impresion de tirillas termicas de LARGO EXACTO (80 mm por defecto).
 *
 * El problema: si generas la pagina con un alto fijo (o un "piso" minimo) y el
 * contenido es mas corto, sobra papel en blanco arriba/abajo. La solucion:
 * renderizar el HTML en un iframe oculto, MEDIR el alto real del contenido y
 * setear `@page { size: <ancho>mm <altoExacto>mm; margin: 0 }` antes de imprimir.
 *
 * 100% DOM (sin dependencias). SOLO cliente (no SSR): llamalo desde un handler
 * del navegador. `fullHtml` debe ser un documento HTML completo cuyo <head>
 * incluya un `<style id="page-style">` con un @page inicial (se sobrescribe).
 *
 * Caveat de hardware: aunque el codigo pida el largo exacto, la impresora solo
 * lo respeta si su "tamano de papel" en el driver esta en rollo/continuo (o un
 * tamano custom). Si el driver esta en A4/Carta, el navegador coloca la tirilla
 * sobre esa hoja y reaparece el blanco. Eso es configuracion del sistema.
 */
export function printTirilla(
  fullHtml: string,
  opts?: { widthMm?: number; bottomMarginMm?: number }
): void {
  const widthMm = opts?.widthMm ?? 80
  const bottomMarginMm = opts?.bottomMarginMm ?? 2
  const widthPx = Math.round((widthMm * 96) / 25.4) // 80mm ~= 302px @96dpi

  const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" })
  const blobUrl = URL.createObjectURL(blob)

  const iframe = document.createElement("iframe")
  // height:1px es CLAVE: asi body.scrollHeight devuelve el alto REAL del
  // contenido y no el del iframe.
  iframe.style.cssText = `position:fixed;left:-9999px;top:0;width:${widthPx}px;height:1px;border:0;visibility:hidden;pointer-events:none;z-index:-9999;`
  document.body.appendChild(iframe)

  iframe.onload = () => {
    // Esperar a que el layout/fuentes se estabilicen antes de medir.
    setTimeout(() => {
      const iDoc = iframe.contentDocument
      const scrollH = iDoc?.body?.scrollHeight ?? 400
      const heightMm = Math.max(1, Math.ceil((scrollH * 25.4) / 96) + bottomMarginMm)
      const pageStyle = iDoc?.getElementById("page-style")
      if (pageStyle) {
        pageStyle.textContent = `@page { size: ${widthMm}mm ${heightMm}mm; margin: 0 !important; }`
      }
      setTimeout(() => {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
        URL.revokeObjectURL(blobUrl)
        setTimeout(() => {
          if (document.body.contains(iframe)) document.body.removeChild(iframe)
        }, 3000)
      }, 150)
    }, 400)
  }

  iframe.src = blobUrl
}
