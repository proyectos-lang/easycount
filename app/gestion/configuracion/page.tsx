import { datosGestion } from "../datos"
import { ConfigForm } from "../_components/config-form"

export const dynamic = "force-dynamic"

export default async function ConfiguracionPage() {
  const datos = await datosGestion()
  if (!datos.data) return null
  return <ConfigForm config={datos.data.config} cuentas={datos.data.cuentas} />
}
