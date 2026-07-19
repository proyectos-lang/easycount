import type { TutorialModulo } from "./types"

export const TUTORIALES_FINANZAS: TutorialModulo[] = [
  {
    modulo: "Dashboard Finanzas",
    titulo: "Dashboard de Finanzas",
    descripcion:
      "Panorama financiero del negocio: saldos por cuenta, cartera por cobrar y pagar, ventas del mes, balance de bancos y flujo de caja mensual.",
    queHace: [
      "Tarjetas KPI: Ventas del Mes, Por Cobrar (CxC), Por Pagar (CxP) y Balance de Bancos (bancos + caja + CxC − CxP).",
      "Una tarjeta de saldo por cada cuenta bancaria activa, más la caja chica.",
      "Gráfico del flujo de caja real por mes: dinero efectivamente entrado vs. salido (excluye transferencias internas para no inflar cifras).",
      "Acciones rápidas: registrar una entrada/salida de dinero a una cuenta o a la caja, y transferir entre cuentas, sin salir del dashboard.",
    ],
    queNoHace: [
      "No detalla movimiento por movimiento (para eso está Movimientos de Cuentas).",
      "Las ventas al crédito no aparecen en el flujo de caja hasta que se cobran (el flujo es dinero real).",
    ],
    operaciones: [
      {
        titulo: "Registrar una entrada o salida rápida de dinero",
        pasos: [
          "Abre Finanzas → Dashboard Finanzas.",
          "Presiona el botón 'Movimiento'.",
          "Elige el destino: Caja Chica o una cuenta bancaria.",
          "Elige Entrada o Salida, escribe el monto y un concepto.",
          "Guarda: el saldo se actualiza al instante y el movimiento queda en el historial.",
        ],
      },
      {
        titulo: "Transferir dinero entre cuentas bancarias",
        pasos: [
          "Presiona el botón 'Transferencia'.",
          "Elige la cuenta origen y la cuenta destino.",
          "Escribe el monto y confirma.",
          "Se registra un egreso en la origen y un ingreso en la destino, enlazados como transferencia.",
        ],
      },
      {
        titulo: "Interpretar el Balance de Bancos",
        pasos: [
          "El Balance de Bancos = saldos de cuentas + caja chica + lo que te deben (CxC) − lo que debes (CxP).",
          "Es tu posición financiera real: cuánto tendrías si hoy cobraras y pagaras todo.",
          "Si es negativo, debes más de lo que tienes más lo que te deben: revisa CxP.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿Por qué la transferencia entre cuentas no aparece en el flujo de caja?",
        respuesta:
          "Porque no es dinero que entra o sale del negocio, solo cambia de bolsillo. Incluirla duplicaría entradas y salidas.",
      },
      {
        pregunta: "El saldo de una cuenta no cuadra con el banco real, ¿qué hago?",
        respuesta:
          "Revisa Movimientos de Cuentas de esa cuenta y compara contra el estado de cuenta bancario. Registra los movimientos faltantes (comisiones bancarias, intereses) con una entrada/salida manual.",
      },
    ],
    keywords: ["finanzas", "saldos", "balance", "flujo de caja", "cxc", "cxp", "transferencia", "kpi"],
  },
  {
    modulo: "Movimientos de Cuentas",
    titulo: "Movimientos de Cuentas",
    descripcion:
      "El historial de entradas y salidas de cada cuenta bancaria, con filtros por cuenta y rango de fechas, totales y export a Excel.",
    queHace: [
      "Lista todos los movimientos de tus cuentas: ventas cobradas, gastos pagados, transferencias, ajustes manuales y saldos iniciales.",
      "Filtro por cuenta específica o todas, y por rango de fechas.",
      "Tarjetas de Total Entradas, Total Salidas y Neto del período filtrado.",
      "Cada movimiento muestra fecha, cuenta, tipo, concepto, monto y el saldo resultante después del movimiento.",
      "Export a Excel del listado filtrado.",
    ],
    queNoHace: [
      "No incluye la caja chica (su historial vive en Finanzas → Caja Chica).",
      "No permite editar ni borrar movimientos: las correcciones se hacen con un movimiento contrario.",
    ],
    operaciones: [
      {
        titulo: "Revisar los movimientos de una cuenta en un período",
        pasos: [
          "Abre Finanzas → Movimientos de Cuentas.",
          "Selecciona la cuenta en el filtro (o deja 'Todas las cuentas').",
          "Define el rango Desde / Hasta.",
          "Revisa los totales y la tabla; la columna Saldo muestra el saldo después de cada movimiento.",
        ],
      },
      {
        titulo: "Conciliar contra el estado de cuenta del banco",
        pasos: [
          "Filtra la cuenta y el mes a conciliar.",
          "Exporta a Excel y compara línea por línea con el estado de cuenta del banco.",
          "Registra las diferencias (comisiones, intereses) como movimientos manuales desde el Dashboard de Finanzas.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿Qué significa la referencia 'venta' o 'devolucion' en un movimiento?",
        respuesta:
          "Indica el documento que originó el movimiento: una venta cobrada por banco, el reembolso de una devolución, una transferencia, etc. Sirve para rastrear el porqué de cada entrada o salida.",
      },
    ],
    keywords: ["historial banco", "extracto", "conciliar", "entradas salidas", "filtrar fechas", "excel"],
  },
  {
    modulo: "Estado de Resultados",
    titulo: "Estado de Resultados (P&L)",
    descripcion:
      "La utilidad del negocio mes a mes: ventas netas, costo de lo vendido, gastos por categoría, comisiones bancarias y utilidad neta.",
    queHace: [
      "Calcula por mes (o acumulado del año): Ventas − CMV = Utilidad Bruta; − Gastos Operativos − Comisiones Bancarias = Utilidad Neta.",
      "Las ventas son NETAS: descuentan automáticamente las devoluciones del período.",
      "Desglosa los gastos por categoría (Servicios, Publicidad, Nómina, Arriendo, etc.).",
      "Muestra márgenes bruto y neto en porcentaje.",
      "Gráficos de evolución y export del reporte a PDF.",
    ],
    queNoHace: [
      "No es flujo de caja: una venta al crédito cuenta como venta aunque no se haya cobrado (el flujo real está en Dashboard Finanzas).",
      "No incluye gastos sin registrar: si no capturas los gastos en Finanzas → Gastos, la utilidad se sobreestima.",
    ],
    operaciones: [
      {
        titulo: "Revisar la utilidad de un mes",
        pasos: [
          "Abre Finanzas → Estado de Resultados.",
          "Elige el año y el mes.",
          "Lee de arriba a abajo: Ingresos → Costos → Utilidad Bruta → Gastos → Utilidad Neta.",
          "Revisa el Margen Neto: es el porcentaje de cada lempira vendido que queda como ganancia.",
        ],
      },
      {
        titulo: "Comparar el año completo",
        pasos: [
          "Cambia a la vista Acumulado / Anual.",
          "Analiza la evolución mensual en el gráfico para detectar meses malos y estacionalidad.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿Qué es el CMV?",
        respuesta:
          "Costo de la Mercancía Vendida: la suma del costo promedio (al momento de la venta) de cada unidad vendida. Es lo que te costó lo que vendiste, no lo que compraste en el mes.",
      },
      {
        pregunta: "¿Por qué mis ventas aquí no cuadran con el total de facturas?",
        respuesta:
          "Este reporte muestra ventas netas: descuenta las devoluciones del período. Además excluye impuestos si así se registraron las ventas.",
      },
    ],
    keywords: ["utilidad", "ganancia", "perdidas", "pyg", "p&l", "margen", "cmv", "resultados"],
  },
  {
    modulo: "Gastos",
    titulo: "Gastos y Cuentas por Pagar",
    descripcion:
      "Registrar los gastos del negocio, controlar facturas de proveedores con vencimiento y abonarlas parcialmente.",
    queHace: [
      "Registra gastos por concepto (los conceptos tienen categoría: Servicios, Nómina, Arriendo…) con proveedor opcional.",
      "Adjunta el comprobante como imagen.",
      "Maneja cuentas por pagar: facturas con fecha de vencimiento, monto pagado acumulado y estado (Pendiente/Parcial/Pagado).",
      "Los abonos pueden salir de la caja chica (efectivo) o de una cuenta bancaria, quedando enlazados al gasto.",
      "Registro por foto de factura con IA (Registrar Gasto por Factura).",
      "Alimenta el Estado de Resultados por categoría de gasto.",
    ],
    queNoHace: [
      "No registra compras de mercancía para inventario (eso va por Compras, que afecta stock y costo).",
      "No programa pagos automáticos: los abonos los registras tú.",
    ],
    operaciones: [
      {
        titulo: "Registrar un gasto pagado de inmediato",
        pasos: [
          "Abre Finanzas → Gastos y presiona Nuevo Gasto.",
          "Elige el concepto (créalo si no existe, con su categoría).",
          "Ingresa monto, fecha y método de pago; adjunta el comprobante si lo tienes.",
          "Registra el pago completo: el gasto queda Pagado y el dinero sale de caja o banco según el método.",
        ],
      },
      {
        titulo: "Registrar una factura a crédito y abonarla",
        pasos: [
          "Crea el gasto con su fecha de vencimiento y sin pago inicial (queda Pendiente).",
          "Cuando abones, abre el gasto y registra el abono indicando si sale de caja o de qué cuenta.",
          "El estado pasa a Parcial y luego a Pagado al completar el monto.",
          "La vista de Cuentas por Pagar muestra el saldo vivo y los días vencidos.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿La compra de mercancía va aquí o en Compras?",
        respuesta:
          "En Compras: ahí afecta inventario y costo promedio. Gastos es para todo lo demás (alquiler, luz, sueldos, publicidad…). Registrar mercancía como gasto duplicaría el costo en el Estado de Resultados.",
      },
      {
        pregunta: "¿Por qué me pide caja abierta al pagar en efectivo?",
        respuesta:
          "Todo efectivo sale de la caja chica para mantener el control. Abre la sesión en Finanzas → Caja Chica.",
      },
    ],
    keywords: ["gasto", "pagar", "proveedor", "factura", "vencimiento", "abono", "cxp", "comprobante"],
  },
  {
    modulo: "Caja Chica",
    titulo: "Caja Chica",
    descripcion:
      "El control del efectivo: abrir la caja con un saldo inicial, registrar entradas y salidas, transferir al banco y cerrar contando el dinero real.",
    queHace: [
      "Abre una sesión de caja con el efectivo inicial (solo puede haber UNA sesión abierta por empresa a la vez).",
      "Recibe automáticamente el efectivo de las ventas.",
      "Registra ingresos manuales y salidas de efectivo con su concepto.",
      "Transfiere efectivo de la caja a una cuenta bancaria (depósito), reflejándose en ambos lados.",
      "Al cerrar, comparas el efectivo contado contra el calculado: el sistema registra la diferencia (faltante/sobrante).",
      "Historial de sesiones anteriores con sus movimientos.",
    ],
    queNoHace: [
      "No permite salidas que dejen el saldo negativo.",
      "No permite dos sesiones abiertas a la vez.",
      "Sin sesión abierta, la app bloquea ventas y pagos en efectivo.",
    ],
    operaciones: [
      {
        titulo: "Abrir la caja del día",
        pasos: [
          "Abre Finanzas → Caja Chica.",
          "Presiona 'Abrir Caja' e ingresa el efectivo con el que inicias.",
          "Desde ese momento las ventas en efectivo entran solas a la caja.",
        ],
      },
      {
        titulo: "Registrar una salida de efectivo",
        pasos: [
          "Con la sesión abierta, presiona 'Salida'.",
          "Ingresa el monto y el concepto (ej. compra de bolsas).",
          "El saldo de caja baja y el movimiento queda en la lista.",
        ],
      },
      {
        titulo: "Depositar efectivo al banco",
        pasos: [
          "Presiona 'Transferencia a Banco'.",
          "Elige la cuenta destino y el monto.",
          "La caja baja y la cuenta bancaria sube, con ambos movimientos enlazados.",
        ],
      },
      {
        titulo: "Cerrar la caja",
        pasos: [
          "Cuenta físicamente el efectivo.",
          "Presiona 'Cerrar Caja' e ingresa el monto contado.",
          "El sistema compara contra el saldo calculado y registra la diferencia.",
          "Revisa el cierre en el Historial de Sesiones.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "Cerré la caja con diferencia, ¿qué significa?",
        respuesta:
          "Faltante: contaste menos de lo que el sistema esperaba (posible vuelto mal dado o salida no registrada). Sobrante: contaste más. La diferencia queda registrada en la sesión para control.",
      },
      {
        pregunta: "¿Puedo tener una caja por cajero?",
        respuesta:
          "No: hay una sola sesión de caja abierta por empresa. Todos los cobros en efectivo entran a esa sesión.",
      },
    ],
    keywords: ["efectivo", "caja", "abrir caja", "cerrar caja", "arqueo", "deposito", "faltante", "sobrante"],
  },
  {
    modulo: "Cierre Diario",
    titulo: "Cierre Diario",
    descripcion:
      "El resumen de un día de operación: cuánto se vendió, cuánto entró por cada método de pago, gastos pagados y estado de la caja.",
    queHace: [
      "Resumen del día: cantidad de tickets, total vendido, ingresos en efectivo, por banco (bruto y neto), crédito otorgado y comisiones.",
      "Desglose por cuenta bancaria con sus movimientos del día.",
      "Productos vendidos en el día.",
      "Gastos del día y pagos a gastos (efectivo y banco).",
      "Devoluciones (notas de crédito) registradas en el día, con su factura y monto reembolsado.",
      "Detalle de la caja: sesiones y movimientos del día.",
      "Exporta el cierre completo a PDF con el nombre de la empresa.",
    ],
    queNoHace: [
      "No cierra la caja (eso se hace en Caja Chica); este módulo solo reporta.",
      "No permite modificar nada: es un reporte de consulta.",
    ],
    operaciones: [
      {
        titulo: "Hacer el corte del día",
        pasos: [
          "Abre Finanzas → Cierre Diario.",
          "Elige la fecha (por defecto, hoy).",
          "Revisa el resumen: ventas, efectivo, banco, crédito y comisiones.",
          "Expande cada cuenta bancaria para ver sus movimientos.",
          "Compara los ingresos en efectivo con el arqueo de caja antes de cerrarla.",
          "Genera el PDF si necesitas archivar o enviar el corte.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "El efectivo del cierre no cuadra con mi caja, ¿qué reviso?",
        respuesta:
          "Verifica salidas de caja no registradas y ventas cobradas con método incorrecto (ej. marcada Banco cuando fue efectivo). El detalle de ingresos en efectivo del cierre lista cada movimiento con su venta.",
      },
    ],
    keywords: ["corte", "dia", "resumen diario", "cuadre", "reporte dia", "pdf"],
  },
]
