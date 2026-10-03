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

const pxAMm = (px: number) => (px * 25.4) / 96

/**
 * Carga `html` en un iframe oculto del ancho de la tirilla, espera imagenes y
 * layout, deja que `ajustar` reescriba el @page con las medidas reales e
 * imprime. Comun a `printTirilla` y `printTirillas`.
 */
function imprimirEnIframe(html: string, widthMm: number, ajustar: (doc: Document) => void): void {
  const widthPx = Math.round((widthMm * 96) / 25.4) // 80mm ~= 302px @96dpi

  const blob = new Blob([html], { type: "text/html;charset=utf-8" })
  const blobUrl = URL.createObjectURL(blob)

  const iframe = document.createElement("iframe")
  // height:1px es CLAVE: asi body.scrollHeight devuelve el alto REAL del
  // contenido y no el del iframe.
  iframe.style.cssText = `position:fixed;left:-9999px;top:0;width:${widthPx}px;height:1px;border:0;visibility:hidden;pointer-events:none;z-index:-9999;`
  document.body.appendChild(iframe)

  const measureAndPrint = () => {
    // Esperar a que el layout/fuentes se estabilicen antes de medir.
    setTimeout(() => {
      const iDoc = iframe.contentDocument
      if (iDoc) ajustar(iDoc)
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

  iframe.onload = () => {
    // Esperar a que las imagenes (p. ej. el logo) terminen de cargar ANTES de
    // medir: si medimos antes, el alto no incluye el logo y ademas podria no
    // salir impreso. Con un tope de seguridad para no colgarnos.
    const iDoc = iframe.contentDocument
    const imgs = iDoc ? Array.from(iDoc.images) : []
    const pending = imgs.filter((img) => !(img.complete && img.naturalHeight > 0))
    if (pending.length === 0) {
      measureAndPrint()
      return
    }
    let done = false
    const go = () => {
      if (done) return
      done = true
      measureAndPrint()
    }
    let left = pending.length
    for (const img of pending) {
      const onEnd = () => {
        left -= 1
        if (left <= 0) go()
      }
      img.addEventListener("load", onEnd, { once: true })
      img.addEventListener("error", onEnd, { once: true })
    }
    // Tope: si alguna imagen no responde, imprimimos igual a los 2.5 s.
    setTimeout(go, 2500)
  }

  iframe.src = blobUrl
}

export function printTirilla(
  fullHtml: string,
  opts?: { widthMm?: number; bottomMarginMm?: number }
): void {
  const widthMm = opts?.widthMm ?? 80
  const bottomMarginMm = opts?.bottomMarginMm ?? 2
  imprimirEnIframe(fullHtml, widthMm, (iDoc) => {
    const scrollH = iDoc.body?.scrollHeight ?? 400
    const heightMm = Math.max(1, Math.ceil(pxAMm(scrollH)) + bottomMarginMm)
    const pageStyle = iDoc.getElementById("page-style")
    if (pageStyle) {
      pageStyle.textContent = `@page { size: ${widthMm}mm ${heightMm}mm; margin: 0 !important; }`
    }
  })
}

// ==================== VARIAS TIRILLAS EN UNA SOLA IMPRESION ====================

/**
 * Prefija cada selector de una hoja de estilos de tirilla con `.sN` para que
 * dos tirillas con clases iguales (`.row`, `.meta`…) no se pisen al ir en el
 * mismo documento. `body` pasa a ser la propia seccion y `html` se descarta.
 * Las hojas de las tirillas son planas (sin @media ni reglas anidadas).
 */
function aislarCss(css: string, scope: string): string {
  return css.replace(/([^{}]+)\{([^{}]*)\}/g, (_, selectores: string, cuerpo: string) => {
    const sels = selectores
      .split(",")
      .map((s) => s.replace(/\/\*[\s\S]*?\*\//g, "").trim())
      .filter((s) => s && s !== "html")
      .map((s) => (s === "body" ? scope : s === "*" ? `${scope} *` : `${scope} ${s}`))
    return sels.length ? `${sels.join(", ")} {${cuerpo}}\n` : ""
  })
}

/**
 * Une varios documentos de tirilla (cada uno con su `<style>` y `<body>`) en
 * un solo HTML: cada tirilla va en su propia PAGINA con nombre (`page: tN`),
 * para que el navegador la imprima como hoja aparte —la termica la corta por
 * separado— con un solo dialogo de impresion. Puro (solo strings): testeable.
 */
export function combinarTirillas(docs: string[]): string {
  const secciones = docs.map((html, i) => {
    const scope = `.tirilla-s${i}`
    const css = [...html.matchAll(/<style(?![^>]*id="page-style")[^>]*>([\s\S]*?)<\/style>/g)]
      .map((m) => aislarCss(m[1], scope))
      .join("")
    const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] ?? ""
    return { css, html: `<div class="tirilla-sec tirilla-s${i}" style="page: t${i}">${body}</div>` }
  })
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<style id="page-style">
  /* Se sobrescribe con el alto exacto de cada tirilla (una @page por seccion). */
  @page { size: 80mm 500mm; margin: 0 !important; }
</style>
<style>
  html, body { margin: 0; padding: 0; }
  .tirilla-sec { break-after: page; }
  .tirilla-sec:last-child { break-after: auto; }
${secciones.map((s) => s.css).join("")}</style></head>
<body>
${secciones.map((s) => s.html).join("\n")}
</body></html>`
}

/**
 * Imprime VARIAS tirillas (p. ej. factura + orden de retiro en bodega) con UN
 * solo clic y un solo dialogo: cada una sale como hoja separada de largo exacto
 * (named pages con su propio `size`). Si el driver de la termica tiene "cortar
 * al final de cada pagina", salen cortadas por separado.
 */
export function printTirillas(
  docs: string[],
  opts?: { widthMm?: number; bottomMarginMm?: number }
): void {
  if (docs.length === 1) return printTirilla(docs[0], opts)
  const widthMm = opts?.widthMm ?? 80
  const bottomMarginMm = opts?.bottomMarginMm ?? 2
  imprimirEnIframe(combinarTirillas(docs), widthMm, (iDoc) => {
    const alturas = Array.from(iDoc.querySelectorAll<HTMLElement>(".tirilla-sec")).map((el) =>
      Math.max(1, Math.ceil(pxAMm(el.scrollHeight)) + bottomMarginMm),
    )
    const pageStyle = iDoc.getElementById("page-style")
    if (pageStyle) {
      // El @page base usa la tirilla mas larga: si un navegador no soporta
      // tamaños por pagina con nombre, nada se corta (solo sobra papel).
      const maxMm = Math.max(1, ...alturas)
      pageStyle.textContent =
        `@page { size: ${widthMm}mm ${maxMm}mm; margin: 0 !important; }\n` +
        alturas.map((h, i) => `@page t${i} { size: ${widthMm}mm ${h}mm; margin: 0 !important; }`).join("\n")
    }
  })
}
