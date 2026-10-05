import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { datosGestion } from "../datos"
import { EmpresaForm } from "../_components/empresa-form"
import { TrLink } from "../_components/tr-link"
import { Chips, CicloBadge, EstadoBadge, Vacio, fmtFecha, fmtMoneda } from "../_components/ui"
import type { EstadoEmpresa } from "@/lib/gestion/reglas"

export const dynamic = "force-dynamic"

const FILTROS: { clave: string; label: string; estados: EstadoEmpresa[] | null }[] = [
  { clave: "todos", label: "Todos", estados: null },
  { clave: "prospectos", label: "Prospectos", estados: ["prospecto"] },
  { clave: "reunion", label: "Reunión", estados: ["reunion_pendiente", "reunion_realizada"] },
  { clave: "prueba", label: "Prueba", estados: ["prueba"] },
  { clave: "activos", label: "Activos", estados: ["activo"] },
  { clave: "pago_pendiente", label: "Pago pendiente", estados: ["pago_pendiente"] },
  { clave: "cancelados", label: "Cancelados", estados: ["cancelado"] },
]

export default async function EmpresasPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const datos = await datosGestion()
  if (!datos.data) return null
  const d = datos.data
  const q = String(sp.q ?? "").trim().toLowerCase()
  const filtro = String(sp.filtro ?? "todos")
  const f = FILTROS.find((x) => x.clave === filtro) ?? FILTROS[0]
  const lista = d.empresas
    .filter((e) => !f.estados || f.estados.includes(e.estado))
    .filter((e) => !q || [e.nombre, e.nombre_comercial, e.dueno, e.contacto_principal, e.telefono, e.correo, e.ciudad].some((v) => (v || "").toLowerCase().includes(q)))
  const m = d.config.moneda

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input name="q" defaultValue={q} placeholder="Buscar por nombre, dueño, teléfono…" className="pl-9 bg-white" />
          {filtro !== "todos" && <input type="hidden" name="filtro" value={filtro} />}
        </form>
        <EmpresaForm config={d.config} hoy={d.hoy} />
      </div>

      <Chips items={FILTROS.map((x) => ({
        href: `/gestion/empresas?filtro=${x.clave}${q ? `&q=${encodeURIComponent(q)}` : ""}`, label: x.label, activo: x.clave === f.clave,
        count: d.empresas.filter((e) => !x.estados || x.estados.includes(e.estado)).length,
      }))} />

      {lista.length === 0 ? (
        <Vacio titulo="Sin empresas en este filtro" texto={d.empresas.length === 0 ? "Crea la primera con «Nueva empresa»." : undefined} />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-[11px] uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-3 py-2 font-medium">Empresa</th>
                <th className="px-3 py-2 font-medium">Dueño</th>
                <th className="px-3 py-2 font-medium">Contacto</th>
                <th className="px-3 py-2 font-medium">Teléfono</th>
                <th className="px-3 py-2 font-medium">Instalación</th>
                <th className="px-3 py-2 font-medium">Fin de prueba</th>
                <th className="px-3 py-2 font-medium">Próximo pago</th>
                <th className="px-3 py-2 text-right font-medium">Cuota</th>
                <th className="px-3 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((e) => (
                <TrLink key={e.id} href={`/gestion/empresas/${e.id}`}>
                  <td className="px-3 py-2">
                    <p className="font-medium text-stone-800">{e.nombre}</p>
                    {e.nombre_comercial && e.nombre_comercial !== e.nombre && <p className="text-[11px] text-stone-400">{e.nombre_comercial}</p>}
                  </td>
                  <td className="px-3 py-2 text-stone-600">{e.dueno || "—"}</td>
                  <td className="px-3 py-2 text-stone-600">{e.contacto_principal || "—"}</td>
                  <td className="px-3 py-2 tabular-nums text-stone-600 whitespace-nowrap">{e.telefono || e.whatsapp || "—"}</td>
                  <td className="px-3 py-2 tabular-nums text-stone-600">{fmtFecha(e.fecha_instalacion)}</td>
                  <td className="px-3 py-2 tabular-nums text-stone-600">{e.estado === "prueba" ? fmtFecha(e.fin_prueba) : "—"}</td>
                  <td className="px-3 py-2 tabular-nums text-stone-600">{e.estado === "activo" || e.estado === "pago_pendiente" ? fmtFecha(e.fecha_proximo_pago) : "—"}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <span className="tabular-nums">{fmtMoneda(e.cuota, e.moneda || m)}</span> <CicloBadge ciclo={e.ciclo_cobro} />
                  </td>
                  <td className="px-3 py-2"><EstadoBadge estado={e.estado} /></td>
                </TrLink>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
