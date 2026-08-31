"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/contexts/auth-context"

/** Boton de cerrar sesion para el panel de super-admin (/plataforma). */
export function LogoutButton() {
  const router = useRouter()
  const { logout } = useAuth()
  const [saliendo, setSaliendo] = React.useState(false)

  async function handleLogout() {
    setSaliendo(true)
    try {
      await logout()
      router.replace("/login")
    } finally {
      setSaliendo(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={saliendo}
      className="gap-2 shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-stone-200"
    >
      {saliendo ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Cerrar sesión
    </Button>
  )
}
