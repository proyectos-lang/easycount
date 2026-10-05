"use client"

import { useRouter } from "next/navigation"

/** Fila de tabla completa clicable (navega al perfil); los enlaces internos siguen funcionando. */
export function TrLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const router = useRouter()
  return (
    <tr
      className={`cursor-pointer border-t hover:bg-stone-50 ${className ?? ""}`}
      onClick={(e) => { if ((e.target as HTMLElement).closest("a,button,input,select")) return; router.push(href) }}
    >
      {children}
    </tr>
  )
}
