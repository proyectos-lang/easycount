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
    id: '2026-10-02-orden-retiro-bodega',
    fecha: '2026-10-02',
    titulo: 'Orden de retiro en bodega al imprimir la factura',
    tipo: 'Mejora',
    resumen:
      'Al imprimir la tirilla de una venta puede salir también una orden de retiro para la bodega, con el mismo número de factura. Es opcional: para activarla, contacta al personal de EasyCount.',
    cambios: [
      'Después de la tirilla de la factura se imprime una segunda tirilla "ORDEN DE RETIRO EN BODEGA" con el mismo número de factura, la fecha y el cliente.',
      'Lleva el listado de productos con su código y cantidad (sin precios), el total de referencias y unidades, y espacio para la firma de quien entrega y quien recibe.',
      'También sale al reimprimir la tirilla desde el Historial de ventas, y en la ventana "Venta registrada" hay un botón para imprimir solo la orden de retiro.',
      '¿La quieres para tu empresa? Contacta al personal de EasyCount para activarla.',
    ],
  },
  {
    id: '2026-10-02-nuevo-modulo-reporteria',
    fecha: '2026-10-02',
    titulo: 'Nuevo módulo: Reportería',
    tipo: 'Nuevo módulo',
    resumen:
      'Arma tus propios reportes de ventas, compras, inventario, producción, finanzas, clientes, proveedores y RRHH, elige las columnas y descárgalos en Excel. Es opcional: para activarlo, contacta al personal de EasyCount.',
    cambios: [
      '28 fuentes de datos listas para usar: facturas, ventas por producto, cobros, pagos por método, cuentas por cobrar, devoluciones, órdenes de compra, compras por producto, cuentas por pagar, existencias y valoración, kardex, materiales, producción, estado de resultados por mes, ingresos, egresos, flujo de caja, gastos, movimientos bancarios, clientes, proveedores, empleados, nómina, novedades y asistencia.',
      'Elige el período (hoy, este mes, mes anterior, trimestre, año, últimos 30 días, personalizado o todo el historial), marca las columnas que quieres y ordénalas como saldrán en el Excel.',
      'Filtra por cualquier columna (contiene, igual, mayor, menor, entre, lista de valores, vacío…) y agrega una fila de TOTAL.',
      'Exporta a Excel con fechas y montos como valores reales: autofiltro, encabezado fijo y una hoja «Parámetros» con lo que se usó para generarlo. Ideal para tablas dinámicas.',
      'Guarda tus reportes con nombre para toda la empresa, márcalos como destacados y vuelve a exportarlos con un clic (el período relativo se recalcula solo).',
      '¿Quieres activarlo para tu empresa? Es un módulo opcional: contacta al personal de EasyCount para habilitártelo.',
    ],
  },
  {
    id: '2026-10-01-nuevo-modulo-rrhh',
    fecha: '2026-10-01',
    titulo: 'Nuevo módulo: Recursos Humanos y Nómina',
    tipo: 'Nuevo módulo',
    resumen:
      'Lleva a tus empleados, asistencia, novedades y la nómina (con IHSS, RAP e ISR) dentro de EasyCount. Es opcional: para activarlo, contacta al personal de EasyCount.',
    cambios: [
      'Empleados: ficha completa de cada colaborador (identidad, puesto, fechas de ingreso/salida, salario, forma de pago y afiliaciones a IHSS/RAP) y su expediente de documentos (identidad, contrato, certificados…) con aviso de vencimiento.',
      'Asistencia: registra la entrada y salida de cada empleado por día y lleva el control de las horas trabajadas.',
      'Novedades: horas extra, bonos, comisiones, aguinaldo, vacaciones, permisos, incapacidades, ausencias, deducciones, anticipos y préstamos, que luego se aplican a la nómina.',
      'Nómina: genera la planilla Mensual o Quincenal con el cálculo automático de IHSS, RAP e ISR, deducciones y aportes patronales; pásala de Borrador → Aprobada → Pagada (registra el gasto) e imprime la boleta de pago de cada empleado.',
      'Parámetros RRHH: define los valores legales vigentes (porcentajes y techos de IHSS/RAP, tabla del ISR, recargos de horas extra) con su fecha de vigencia.',
      '¿Quieres activarlo para tu empresa? Es un módulo opcional: contacta al personal de EasyCount para habilitártelo.',
    ],
  },
  {
    id: '2026-10-01-mejoras-compras-ventas-listas',
    fecha: '2026-10-01',
    titulo: 'Compras, ventas, clientes y listas de precios: lote de mejoras',
    tipo: 'Mejora',
    resumen:
      'Un paquete de mejoras pedidas desde el uso diario: compras más ágiles, crédito del cliente a la vista, listas de precios por fecha y saldos iniciales de clientes.',
    cambios: [
      'Recepción por Factura: ahora puedes subir VARIAS fotos de una misma factura y de todas se arma un solo listado; la moneda viene en Lempiras por defecto; y en la captura manual hay un botón "Pantalla completa" para revisar y mapear los productos con más comodidad.',
      'Crear producto al instante: en la Orden de Compra (y ya en Recepción por Factura) puedes crear un artículo nuevo sin salir de la pantalla. Además, al buscar un producto y presionar Enter se agrega el primero de la lista, sin saltar al final.',
      'Orden de Compra: puedes EDITAR una orden ya recibida para corregir el proveedor, el número de factura, la fecha, las notas y el precio de venta de los productos (la cantidad y el costo no se tocan). Cada cambio queda registrado con su fecha y el usuario que lo hizo.',
      'Ventas — crédito del cliente a la vista: al elegir un cliente con límite de crédito verás cuánto crédito le queda (y un aviso en rojo si la venta lo superaría), para no armar una factura grande que luego se bloquee. Ese crédito disponible también sale impreso en la tirilla.',
      'Ventas — tu vista del catálogo se recuerda: si lo prefieres en lista o en cuadrícula, queda guardado para tu usuario y así lo verás la próxima vez.',
      'Listas de precios por fecha: puedes programar una lista GENERAL con vigencia (desde/hasta) que aplica a todos los clientes mientras esté activa (ideal para promociones o temporadas) y tiene prioridad sobre la lista de cada cliente.',
      'Clientes — saldo inicial en la carga masiva: la plantilla de Excel incluye una columna "Saldo Pendiente". A cada cliente nuevo con saldo se le crea su cuenta por cobrar de apertura; eliges la fecha del saldo inicial para que no cuente como venta del mes.',
      'Inventario (Kardex): las salidas e ingresos manuales y los ajustes ahora muestran el motivo que escribiste en la columna "Referencia" (por eso conviene siempre justificar una salida manual).',
      'Importante: recarga la página para tomar la versión nueva. Algunas funciones nuevas (editar orden recibida, listas por fecha, motivos en el kardex) requieren que el administrador aplique la actualización de base de datos; si no la ves aún, avísale.',
    ],
  },
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
