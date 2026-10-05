import { datosGestion } from "../datos"
import { ETAPAS_EN_VENTA } from "@/lib/gestion/reglas"
import { Kanban } from "../_components/kanban"
import { EmpresaForm } from "../_components/empresa-form"

export const dynamic = "force-dynamic"

export default async function ProspectosPage() {
  const datos = await datosGestion()
  if (!datos.data) return null
  const d = datos.data
  const enVenta = d.empresas.filter((e) => ETAPAS_EN_VENTA.includes(e.etapa_pipeline)).length
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500"><span className="font-semibold text-stone-800">{enVenta}</span> prospecto{enVenta === 1 ? "" : "s"} en etapas de venta. Arrastra las tarjetas entre columnas; a «Cliente» te pedirá completar la ficha y a «No interesado» el motivo.</p>
        <EmpresaForm config={d.config} hoy={d.hoy} empresa={{ estado: "prospecto" }} titulo="Nuevo prospecto" />
      </div>
      <Kanban empresas={d.empresas} config={d.config} hoy={d.hoy} />
    </div>
  )
}
