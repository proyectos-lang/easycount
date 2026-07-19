/**
 * Modelo de contenido del Centro de Aprendizaje.
 *
 * Un `TutorialModulo` por cada modulo de la app (MODULOS.nombre exacto como
 * clave) mas el articulo "general" de primeros pasos. El contenido vive en
 * los archivos contenido-*.ts de esta carpeta y se actualiza en el MISMO
 * commit que cualquier cambio funcional (ver CLAUDE.md).
 */

export interface OperacionPaso {
  /** Nombre de la operacion, ej. "Registrar una venta de contado" */
  titulo: string
  /** Pasos en orden. Texto plano, una accion por paso. */
  pasos: string[]
}

export interface PreguntaFrecuente {
  pregunta: string
  respuesta: string
}

export interface TutorialModulo {
  /**
   * Clave del tutorial. Debe ser EXACTAMENTE el `nombre` del modulo en
   * lib/constants/modulos.ts (es tambien la clave de permisos), o el valor
   * especial "general" para el articulo de primeros pasos.
   */
  modulo: string
  titulo: string
  /** 1-2 frases de resumen. */
  descripcion: string
  /** Capacidades: lo que el modulo SI hace. */
  queHace: string[]
  /** Limites explicitos: lo que el modulo NO hace (evita malentendidos). */
  queNoHace: string[]
  /** Guias paso a paso de cada operacion del modulo. */
  operaciones: OperacionPaso[]
  /** Dudas frecuentes y errores comunes con su solucion. */
  faqs: PreguntaFrecuente[]
  /** Terminos adicionales para el buscador (sinonimos, jerga local). */
  keywords: string[]
}
