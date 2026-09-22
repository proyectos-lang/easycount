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
    id: '2026-09-22-mejoras-rendimiento',
    fecha: '2026-09-22',
    titulo: 'Mejoras de rendimiento y velocidad',
    tipo: 'Mejora',
    resumen:
      'El sistema quedó más rápido en varios módulos. Recarga la página (o cierra y vuelve a abrir la app) para tomar la versión nueva.',
    cambios: [
      'Reportes e inventario más rápidos: consultas optimizadas para que la información cargue con más agilidad, sobre todo a medida que crece el historial.',
      'La Valoración de Inventario ahora calcula el stock por almacén y la última venta de forma más eficiente, sin traer tanta información al navegador.',
      'Las listas grandes de Productos y del Historial de Transacciones (Kardex) ahora se muestran por páginas, para que la pantalla no se sienta pesada con muchos registros.',
      'La descarga de Excel y de PDF ahora carga sus componentes solo cuando los usas, así las pantallas abren más rápido.',
      'Importante: recarga la página para tomar la versión nueva. No necesitas reinstalar nada; si algo se ve raro, recarga con Ctrl+F5.',
    ],
  },
  {
    id: '2026-09-21-recepcion-compras-factura',
    fecha: '2026-09-21',
    titulo: 'Recepción de compras y por factura mejoradas',
    tipo: 'Mejora',
    resumen:
      'Al recibir mercancía ahora puedes ajustar costo y precio, ver tu margen, elegir cómo pagas y llevar un historial de facturas de compra.',
    cambios: [
      'Recepción por Orden de Compra y por Factura: edita por línea la cantidad, el costo y el precio de venta. Ves en vivo el margen, la utilidad por unidad, y el costo y precio anteriores del producto.',
      'El precio de venta que pongas al recibir actualiza el precio del producto en el catálogo.',
      'Método de pago en la recepción: Efectivo (sale de caja chica), Banco (sale de una cuenta que elijas) o Cuenta por pagar (queda pendiente al proveedor). Así tu balance refleja la salida real.',
      'Recepción por Factura: nuevo modo de captura manual (agregar productos por nombre o código, sin subir imagen), campo para el número de factura, y un Historial de facturas de compra donde abres cada una para ver su desglose.',
      'Kardex e Historial de Transacciones: cada movimiento ahora muestra a qué documento está asociado (la factura de venta FC-#### o la factura/orden de compra y el proveedor).',
    ],
  },
  {
    id: '2026-09-20-clientes-credito-cargas-masivas',
    fecha: '2026-09-20',
    titulo: 'Límite de crédito y cargas masivas por Excel',
    tipo: 'Mejora',
    resumen:
      'Controla cuánto crédito puede tener cada cliente y crea muchos clientes o proveedores de una sola vez con una plantilla de Excel.',
    cambios: [
      'Clientes: nuevo campo "Límite de crédito". Si una venta a crédito haría que el cliente supere su tope de deuda, el sistema la bloquea (0 o vacío = sin límite). El límite se ve en la lista de clientes.',
      'Carga masiva de Clientes y de Proveedores: descarga una plantilla de Excel, complétala y súbela para crearlos en lote (omite los que ya existen).',
      'Importación de ventas mejorada: la plantilla trae columnas para el Cliente (si no existe, se crea solo) y el Método de Pago por factura (incluye Crédito, que queda como cuenta por cobrar).',
      'En el punto de venta: el cliente "Consumidor Final" ya no admite ventas a crédito (deben pagarse completas), y al agregar un pago viene "Efectivo" preseleccionado.',
      'El vuelto ahora se muestra más grande y claro al cobrar en efectivo.',
    ],
  },
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
