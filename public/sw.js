/**
 * Service Worker de EasyCount.
 *
 * Deliberadamente MINIMO: existe para que la app sea instalable (PWA) y para
 * garantizar que cada despliegue nuevo se aplique de inmediato. NO cachea la
 * aplicacion (network-first puro): asi nunca se sirve una version vieja.
 *
 * Auto-actualizacion: al haber un deploy nuevo, el registro (pwa-register)
 * detecta el SW nuevo, este toma control con skipWaiting + clients.claim y
 * la pagina se recarga sola.
 */

self.addEventListener("install", () => {
  // El SW nuevo entra en accion sin esperar a que cierren las pestanas.
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Toma control de todas las pestanas abiertas de inmediato.
      await self.clients.claim()
      // Limpia caches de versiones anteriores (si alguna vez se usaron).
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    })()
  )
})

self.addEventListener("fetch", (event) => {
  // Passthrough: red siempre. Si la red falla en una navegacion, respuesta
  // minima de "sin conexion" para no mostrar el dinosaurio del navegador.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(
        () =>
          new Response(
            `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Sin conexión</title></head><body style="font-family:system-ui;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#fafaf9;color:#44403c"><div style="text-align:center"><h1 style="margin:0 0 8px">Sin conexión</h1><p>EasyCount necesita internet. Verifica tu conexión e intenta de nuevo.</p></div></body></html>`,
            { headers: { "Content-Type": "text/html; charset=utf-8" } }
          )
      )
    )
  }
})
