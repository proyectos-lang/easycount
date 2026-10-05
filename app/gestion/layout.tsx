import Link from "next/link"
import { getSuperadmin } from "@/lib/services/plataforma"
import { getRolGestion, sincronizarGestion } from "@/lib/services/gestion"
import { contadoresMenu } from "@/lib/gestion/calculos"
import { getHondurasTodayISODate } from "@/lib/utils/honduras-time"
import { datosGestion } from "./datos"
import { GestionShell } from "./shell"

// Depende de la sesión (cookies) → siempre dinámico.
export const dynamic = "force-dynamic"

export default async function GestionLayout({ children }: { children: React.ReactNode }) {
  const sa = await getSuperadmin()

  // Guard: solo super-admins (plataforma_admins). No se renderiza nada más.
  if (!sa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-stone-800">Acceso restringido</h1>
          <p className="mt-2 text-stone-500">Este portal es exclusivo para el equipo de EasyCount.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm text-stone-600 underline underline-offset-4">Volver a la app</Link>
        </div>
      </div>
    )
  }

  // Sin cron: al cargar se aplican los estados por cobro y se generan las
  // notificaciones del día. Después se lee todo (memoizado para la página).
  await sincronizarGestion()
  const [datos, rol] = await Promise.all([datosGestion(), getRolGestion()])
  const d = datos.data
  const hoy = d?.hoy ?? getHondurasTodayISODate()
  const contadores = d ? contadoresMenu(d.empresas, d.reuniones, d.notificaciones.filter((n) => !n.leida).length, hoy) : { atrasados: 0, prospectos: 0, reuniones: 0, noLeidas: 0 }

  return (
    <GestionShell
      usuario={{ nombre: sa.nombre, email: sa.email }}
      rol={rol}
      contadores={contadores}
      notificaciones={d?.notificaciones ?? []}
      empresas={(d?.empresas ?? []).map((e) => ({ id: e.id, nombre: e.nombre, cuota: e.cuota, ciclo_cobro: e.ciclo_cobro, dia_cobro: e.dia_cobro, fecha_proximo_pago: e.fecha_proximo_pago, estado: e.estado }))}
      cuentas={d?.cuentas ?? []}
      moneda={d?.config.moneda ?? "L"}
      hoy={hoy}
      pendiente={datos.error}
    >
      {children}
    </GestionShell>
  )
}
