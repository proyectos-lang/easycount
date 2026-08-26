import Link from "next/link"
import { getSuperadmin } from "@/lib/services/plataforma"

// Depende de la sesion (cookies) -> siempre dinamico.
export const dynamic = "force-dynamic"

export default async function PlataformaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sa = await getSuperadmin()

  // Guard: si el usuario no esta en plataforma_admins, no se renderiza nada del
  // portal (ni sus datos). Pantalla neutra de acceso restringido.
  if (!sa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-stone-800">Acceso restringido</h1>
          <p className="mt-2 text-stone-500">
            Este portal es exclusivo para administradores de la plataforma.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm text-stone-600 underline underline-offset-4"
          >
            Volver a la app
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">EasyCount · Plataforma</span>
            <span className="rounded bg-stone-800 px-1.5 py-0.5 text-[10px] font-medium text-white">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-stone-500">
            <span className="hidden sm:inline">{sa.email}</span>
            <Link href="/dashboard" className="underline underline-offset-4">
              Ir a la app
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
    </div>
  )
}
