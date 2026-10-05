import { getAdminsGestion } from "@/lib/services/gestion"
import { getSuperadmin } from "@/lib/services/plataforma"
import { RolSelect } from "../_components/rol-select"
import { Panel, Pendiente, Vacio } from "../_components/ui"

export const dynamic = "force-dynamic"

export default async function UsuariosPage() {
  const [res, sa] = await Promise.all([getAdminsGestion(), getSuperadmin()])
  if (!res.data) return <Pendiente error={res.error} />
  return (
    <div className="space-y-4">
      <Panel titulo="Equipo EasyCount" descripcion="Quiénes entran al portal de gestión y con qué rol. Administrador ve todo; Ventas ve Día a día + Ventas; Contabilidad ve Día a día + Dinero.">
        {res.data.length === 0 ? <Vacio titulo="Sin usuarios" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wide text-stone-500">
                <tr><th className="py-1.5 pr-3 font-medium">Nombre</th><th className="py-1.5 pr-3 font-medium">Correo</th><th className="py-1.5 font-medium">Rol</th></tr>
              </thead>
              <tbody>
                {res.data.map((u) => (
                  <tr key={u.user_id} className="border-t">
                    <td className="py-2 pr-3 font-medium text-stone-800">{u.nombre || "—"}{u.user_id === sa?.id && <span className="ml-2 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500">tú</span>}</td>
                    <td className="py-2 pr-3 text-stone-600">{u.email || "—"}</td>
                    <td className="py-2"><RolSelect userId={u.user_id} rol={u.rol} deshabilitado={u.user_id === sa?.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <p className="text-xs text-stone-500">
        Para agregar a alguien del equipo: crea su cuenta en EasyCount (o usa una existente) y agrégalo a la tabla <code>plataforma_admins</code> en Supabase; aquí le asignas el rol. Tu propio rol no se cambia desde aquí.
      </p>
    </div>
  )
}
