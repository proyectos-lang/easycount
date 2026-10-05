// Lectura compartida del portal /gestion, memoizada por request con React
// `cache` para que el layout (menú, notificaciones, panel "Registrar pago") y
// la página no consulten la base dos veces en la misma carga.
import { cache } from "react"
import { getDatosGestion } from "@/lib/services/gestion"

export const datosGestion = cache(getDatosGestion)
