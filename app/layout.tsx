import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/lib/contexts/auth-context'
import { PwaRegister } from '@/components/pwa-register'
import { MonitoringInit } from '@/components/monitoring-init'
import './globals.css'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: 'EasyCount | Tu ERP Contable y Administrativo',
  description: 'EasyCount: gestiona tu empresa de forma simple e inteligente. Inventario, ventas, compras y finanzas en un solo sistema.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/favicon.png',
        type: 'image/png',
      },
    ],
    apple: '/icons/icon-192.png',
    shortcut: '/favicon.png',
  },
  // PWA: instalable en iOS (Safari usa estas etiquetas, no el manifest).
  appleWebApp: {
    capable: true,
    title: 'EasyCount',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  themeColor: '#f59e0b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
          <Analytics />
          <PwaRegister />
          <MonitoringInit />
        </AuthProvider>
      </body>
    </html>
  )
}
