/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  compiler: {
    // En produccion elimina console.log/info/debug/warn (ruido de depuracion
    // heredado del generador, con prefijos [v0]). Conserva console.error para
    // no perder el registro de errores reales.
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
}

export default nextConfig
