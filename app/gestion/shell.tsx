"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home, CreditCard, CalendarDays, Building2, Users, Handshake, Megaphone, Wallet, Receipt, BarChart3, PieChart, Repeat, UserCog, Settings, LogOut, Plus, ExternalLink, ShieldCheck,
} from "lucide-react"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu,
  SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/contexts/auth-context"
import type { RolGestion } from "@/lib/gestion/reglas"
import type { GNotificacion } from "@/lib/services/gestion"
import { MesSelector } from "./_components/mes-selector"
import { Notificaciones } from "./_components/notificaciones"
import { Buscador, type EmpresaBusqueda } from "./_components/buscador"
import { RegistrarPagoSheet, type EmpresaLite, type CuentaLite } from "./_components/registrar-pago"
import { Pendiente } from "./_components/ui"

// ==================== CONTEXTO (abrir "Registrar pago" desde cualquier pantalla) ====================

const GestionUICtx = React.createContext<{ abrirRegistrarPago: (empresaId?: number) => void }>({ abrirRegistrarPago: () => {} })
export const useGestionUI = () => React.useContext(GestionUICtx)

// ==================== MENÚ ====================

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; contador?: keyof Contadores }
type Grupo = { titulo: string; roles: RolGestion[]; items: Item[] }
export interface Contadores { atrasados: number; prospectos: number; reuniones: number; noLeidas: number }

const GRUPOS: Grupo[] = [
  { titulo: "Día a día", roles: ["administrador", "ventas", "contabilidad"], items: [
    { href: "/gestion", label: "Inicio", icon: Home },
    { href: "/gestion/pagos", label: "Pagos", icon: CreditCard, contador: "atrasados" },
    { href: "/gestion/calendario", label: "Calendario", icon: CalendarDays },
    { href: "/gestion/empresas", label: "Empresas", icon: Building2 },
  ] },
  { titulo: "Ventas", roles: ["administrador", "ventas"], items: [
    { href: "/gestion/prospectos", label: "Prospectos", icon: Users, contador: "prospectos" },
    { href: "/gestion/reuniones", label: "Reuniones", icon: Handshake, contador: "reuniones" },
    { href: "/gestion/publicidad", label: "Publicidad", icon: Megaphone },
  ] },
  { titulo: "Dinero", roles: ["administrador", "contabilidad"], items: [
    { href: "/gestion/suscripciones", label: "Suscripciones", icon: Repeat },
    { href: "/gestion/finanzas", label: "Finanzas", icon: Wallet },
    { href: "/gestion/gastos", label: "Gastos", icon: Receipt },
    { href: "/gestion/socios", label: "Socios", icon: PieChart },
    { href: "/gestion/reportes", label: "Reportes", icon: BarChart3 },
  ] },
  { titulo: "Sistema", roles: ["administrador"], items: [
    { href: "/gestion/usuarios", label: "Usuarios", icon: UserCog },
    { href: "/gestion/configuracion", label: "Configuración", icon: Settings },
  ] },
]

const TITULOS: Record<string, string> = {
  "/gestion": "Inicio", "/gestion/pagos": "Pagos", "/gestion/calendario": "Calendario", "/gestion/empresas": "Empresas", "/gestion/prospectos": "Prospectos",
  "/gestion/reuniones": "Reuniones", "/gestion/publicidad": "Publicidad", "/gestion/finanzas": "Finanzas", "/gestion/gastos": "Gastos", "/gestion/reportes": "Reportes", "/gestion/socios": "Socios", "/gestion/suscripciones": "Suscripciones",
  "/gestion/usuarios": "Usuarios", "/gestion/configuracion": "Configuración",
}
const CON_MES = new Set(["/gestion", "/gestion/pagos", "/gestion/calendario", "/gestion/gastos", "/gestion/finanzas", "/gestion/publicidad", "/gestion/socios", "/gestion/suscripciones"])

function iniciales(n: string): string {
  const p = n.trim().split(/\s+/)
  return (p.length === 1 ? p[0].slice(0, 2) : p[0][0] + p[p.length - 1][0]).toUpperCase()
}

// ==================== SHELL ====================

export function GestionShell({ usuario, rol, contadores, notificaciones, empresas, cuentas, moneda, hoy, pendiente, children }: {
  usuario: { nombre: string | null; email: string | null }
  rol: RolGestion
  contadores: Contadores
  notificaciones: GNotificacion[]
  empresas: EmpresaLite[]
  cuentas: CuentaLite[]
  moneda: string
  hoy: string
  pendiente: string | null
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const [pago, setPago] = React.useState<{ abierto: boolean; empresaId: number | null; k: number }>({ abierto: false, empresaId: null, k: 0 })
  const abrirRegistrarPago = (empresaId?: number) => setPago((p) => ({ abierto: true, empresaId: empresaId ?? null, k: p.k + 1 }))

  const titulo = TITULOS[pathname] ?? (pathname.startsWith("/gestion/empresas/") ? "Empresa" : "Gestión")
  const nombre = usuario.nombre || usuario.email || "Admin"
  const busqueda: EmpresaBusqueda[] = empresas.map((e) => ({ id: e.id, nombre: e.nombre, dueno: null, telefono: null, estado: e.estado as EmpresaBusqueda["estado"] }))

  async function salir() {
    await logout()
    router.replace("/login")
  }

  return (
    <GestionUICtx.Provider value={{ abrirRegistrarPago }}>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
            <Link href="/gestion" className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-stone-800">EasyCount</span>
              <span className="rounded bg-stone-800 px-1.5 py-0.5 text-[10px] font-medium text-white">GESTIÓN</span>
            </Link>
            <Button onClick={() => abrirRegistrarPago()} className="mt-3 w-full gap-2 bg-emerald-600 hover:bg-emerald-700" size="sm">
              <Plus className="h-4 w-4" /> Registrar pago
            </Button>
          </SidebarHeader>
          <SidebarContent className="[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-300">
            {GRUPOS.filter((g) => g.roles.includes(rol)).map((g) => (
              <SidebarGroup key={g.titulo}>
                <SidebarGroupLabel className="text-stone-500 uppercase text-[10px] tracking-wider font-medium">{g.titulo}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {g.items.map((it) => {
                      const activo = it.href === "/gestion" ? pathname === "/gestion" : pathname === it.href || pathname.startsWith(it.href + "/")
                      const n = it.contador ? contadores[it.contador] : 0
                      return (
                        <SidebarMenuItem key={it.href}>
                          <SidebarMenuButton asChild tooltip={it.label} isActive={activo}>
                            <Link href={it.href}><it.icon className="h-4 w-4" /><span>{it.label}</span></Link>
                          </SidebarMenuButton>
                          {n > 0 && (
                            <SidebarMenuBadge className={it.contador === "atrasados" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}>{n}</SidebarMenuBadge>
                          )}
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border p-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Plataforma"><Link href="/plataforma"><ShieldCheck className="h-4 w-4" /><span>Plataforma</span></Link></SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={salir} tooltip="Cerrar sesión"><LogOut className="h-4 w-4" /><span>Cerrar sesión</span></SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-stone-50 min-h-screen">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-stone-200/60 bg-white/80 px-3 backdrop-blur-sm md:px-5">
            <SidebarTrigger className="-ml-1 rounded-lg hover:bg-stone-100" />
            <h1 className="text-base font-semibold text-stone-800 truncate">{titulo}</h1>
            <div className="ml-auto flex items-center gap-1.5">
              {CON_MES.has(pathname) && <MesSelector hoy={hoy} />}
              <Buscador empresas={busqueda} />
              <Notificaciones items={notificaciones} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: "#abcde0" }} aria-label="Cuenta">
                    {iniciales(nombre)}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium truncate">{nombre}</p>
                    <p className="text-xs text-stone-500 truncate">{usuario.email}</p>
                    <p className="text-[10px] uppercase tracking-wide text-stone-400 mt-0.5">{rol}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/plataforma"><ShieldCheck className="mr-2 h-4 w-4" /> Plataforma</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/dashboard"><ExternalLink className="mr-2 h-4 w-4" /> Ir a la app</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={salir}><LogOut className="mr-2 h-4 w-4" /> Cerrar sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="p-4 md:p-6 space-y-5">
            {pendiente && <Pendiente error={pendiente} />}
            {children}
          </main>
        </SidebarInset>

        <RegistrarPagoSheet
          key={pago.k}
          abierto={pago.abierto}
          onOpenChange={(o) => setPago((p) => ({ ...p, abierto: o }))}
          empresas={empresas.filter((e) => e.estado !== "cancelado")}
          cuentas={cuentas}
          moneda={moneda}
          hoy={hoy}
          empresaInicial={pago.empresaId}
        />
      </SidebarProvider>
    </GestionUICtx.Provider>
  )
}
