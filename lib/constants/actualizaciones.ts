/**
 * Registro de actualizaciones (changelog) visible para el usuario en
 * /actualizaciones. Es la fuente única de verdad: agregar una entrada NUEVA
 * al inicio del array anuncia la actualización (el modal de "novedad" aparece
 * la próxima vez que cada usuario entre o refresque, comparando el id contra
 * lo último que vio, guardado por navegador en localStorage).
 *
 * REGLA DE ORO (flujo de trabajo): NO toda mejora se anuncia. Al terminar de
 * implementar algo, se le pregunta al usuario si desea publicarlo aquí; solo
 * si dice que sí se agrega la entrada. Muchas son menores y no se anuncian.
 *
 * Para publicar una actualización: agrega un objeto al INICIO de
 * `ACTUALIZACIONES` con un `id` único y estable (no reutilizar ids viejos).
 */

export type TipoActualizacion = 'Nuevo módulo' | 'Mejora' | 'Corrección'

export interface Actualizacion {
  /** Identificador único y estable (define "novedad"). Ej: '2026-08-20-analisis-financiero'. */
  id: string
  /** Fecha de la actualización en formato ISO 'YYYY-MM-DD'. */
  fecha: string
  titulo: string
  tipo: TipoActualizacion
  /** Resumen corto (1 frase) para la tarjeta y el modal. */
  resumen: string
  /** Viñetas de lo que se agregó o cambió (lenguaje para el usuario, no técnico). */
  cambios: string[]
}

/** Del más reciente al más antiguo. La primera entrada es "la última actualización". */
export const ACTUALIZACIONES: Actualizacion[] = [
  {
    id: '2026-08-20-analisis-financiero',
    fecha: '2026-08-20',
    titulo: 'Nuevo módulo: Análisis Financiero',
    tipo: 'Nuevo módulo',
    resumen:
      'Analiza la rentabilidad del negocio en un período: cómo se genera el valor y dónde hay fugas de dinero.',
    cambios: [
      'En Finanzas → Análisis Financiero, con un rango de fechas libre (o atajos: este mes, mes pasado, este año).',
      'Resumen / P&L: cascada de Ingresos → Costo → Utilidad bruta → Gastos → Comisiones → Utilidad neta, con márgenes.',
      'Rentabilidad por producto: qué productos dan más o menos margen, con un cuadrante margen×volumen (Estrella, Vaca lechera, Nicho, Bajo desempeño) y Pareto de utilidad.',
      'Análisis de gastos: mayor gasto, gasto como % de ventas y detección de incrementos anómalos por categoría.',
      'Auditoría de costeo: lista de productos mal costeados e historial de costo de cada producto (compras, importaciones y ajustes).',
    ],
  },
]

/** Id de la actualización más reciente; define qué es "novedad" para el modal. */
export const ULTIMA_ACTUALIZACION_ID = ACTUALIZACIONES[0]?.id ?? ''
