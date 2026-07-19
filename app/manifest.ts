import type { MetadataRoute } from "next"

/**
 * Manifest PWA: hace la app instalable como acceso directo en escritorio,
 * Android y (via apple-touch-icon) iOS. Servido en /manifest.webmanifest.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EasyCount — ERP Contable y Administrativo",
    short_name: "EasyCount",
    description:
      "Gestiona tu empresa: ventas, compras, inventario y finanzas en un solo sistema.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fafaf9",
    theme_color: "#f59e0b",
    lang: "es",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
