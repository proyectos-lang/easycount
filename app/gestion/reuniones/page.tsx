import { datosGestion } from "../datos"
import { motivosPerdida } from "@/lib/gestion/calculos"
import { ETIQUETA_MOTIVO } from "@/lib/gestion/reglas"
import { ReunionesUI } from "../_components/reuniones-ui"
import { BarrasHorizontales, Panel } from "../_components/ui"

export const dynamic = "force-dynamic"

export default async function ReunionesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const datos = await datosGestion()
  if (!datos.data) return null
  const d = datos.data
  const empresaInicial = sp.empresa ? Number(sp.empresa) : null
  const reunionInicial = sp.reunion ? Number(sp.reunion) : null
  const motivos = motivosPerdida(d.reuniones, d.hoy, 90)
  return (
    <div className="space-y-4">
      <ReunionesUI
        reuniones={d.reuniones}
        empresas={d.empresas.filter((e) => e.estado !== "cancelado").map((e) => ({ id: e.id, nombre: e.nombre, contacto: e.contacto_principal || e.dueno }))}
        hoy={d.hoy}
        empresaInicial={empresaInicial}
        reunionInicial={reunionInicial}
      />
      <Panel titulo="Motivos de pérdida" descripcion="Reuniones con resultado «No interesado» en los últimos 90 días.">
        <BarrasHorizontales filas={motivos.map((m) => ({ etiqueta: ETIQUETA_MOTIVO[m.motivo], valor: m.total }))} />
      </Panel>
    </div>
  )
}
