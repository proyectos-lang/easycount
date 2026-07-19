import type { TutorialModulo } from "./types"

export const TUTORIALES_VENTAS: TutorialModulo[] = [
  {
    modulo: "Dashboard Ventas",
    titulo: "Dashboard de Ventas",
    descripcion:
      "Analítica del área de ventas: tendencias, comparativos, top de clientes y productos más vendidos.",
    queHace: [
      "Gráficos de ventas y ganancia por mes y por año, con filtros de período.",
      "Ranking de clientes que más compran y de productos más vendidos.",
      "Comparativo entre almacenes/bodegas.",
      "Conteo de clientes activos y productos vendidos en el período.",
    ],
    queNoHace: [
      "No registra ventas (eso es Nueva Venta) ni las modifica.",
      "No muestra el flujo de dinero por método de pago — para eso está el Cierre Diario y el Dashboard de Finanzas.",
    ],
    operaciones: [
      {
        titulo: "Analizar las ventas de un período",
        pasos: [
          "Entra a Ventas → Dashboard Ventas.",
          "Elige el año y el mes en los filtros superiores.",
          "Revisa el gráfico de tendencia: compara meses para detectar temporadas.",
          "Baja al top de clientes y productos para saber qué y a quién le vendes más.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿La 'ganancia' incluye los gastos del negocio?",
        respuesta:
          "No. Aquí la ganancia es utilidad bruta de las ventas (precio menos costo del producto). La utilidad neta con gastos está en Finanzas → Estado de Resultados.",
      },
    ],
    keywords: ["analitica", "graficos", "top clientes", "mas vendidos", "tendencia", "estadisticas"],
  },
  {
    modulo: "Nueva Venta",
    titulo: "Nueva Venta (punto de venta)",
    descripcion:
      "Registrar una venta: elegir cliente y productos, aplicar descuento e impuesto, y cobrar con uno o varios métodos de pago.",
    queHace: [
      "Genera el número de factura correlativo automáticamente (FC-0001, FC-0002…).",
      "Catálogo de productos con búsqueda y stock disponible por almacén.",
      "Descuento porcentual sobre el subtotal e impuesto ISV (15 % por defecto, activable por venta).",
      "Pago multi-método en una misma venta: efectivo, banco/tarjeta, link de pago, crédito. Ej.: 500 en efectivo + 1,000 con tarjeta.",
      "Aplica la comisión bancaria configurada en cada cuenta: registra el monto bruto que paga el cliente y el neto que entra al banco.",
      "El efectivo entra automáticamente a la caja chica abierta; lo de banco entra a la cuenta elegida.",
      "Descuenta el stock del almacén y deja rastro en el kardex de inventario.",
      "Genera la factura en PDF al terminar.",
    ],
    queNoHace: [
      "No permite vender en efectivo sin una sesión de caja chica abierta (el sistema lo bloquea).",
      "No permite editar una venta ya guardada: se corrige con una Devolución (parcial) o eliminándola desde Historial (total).",
      "No modifica el precio de lista del producto: el precio se puede cambiar por línea solo para esa venta.",
    ],
    operaciones: [
      {
        titulo: "Registrar una venta de contado",
        pasos: [
          "Abre Ventas → Nueva Venta.",
          "Selecciona el cliente (o créalo rápido si no existe) y el almacén del que sale la mercancía.",
          "Busca cada producto en el catálogo y agrégalo; ajusta cantidades con los botones + / −.",
          "Si aplica, ingresa el descuento (%) y activa el impuesto.",
          "En el desglose de pago agrega una línea 'Efectivo' (o 'Banco' y elige la cuenta) por el total.",
          "Verifica el total y presiona Guardar. Se genera la factura PDF.",
        ],
      },
      {
        titulo: "Venta con pago mixto (efectivo + tarjeta)",
        pasos: [
          "Arma la venta normalmente (cliente, productos, totales).",
          "En el desglose de pago agrega una línea 'Efectivo' con el monto en efectivo.",
          "Agrega otra línea 'Banco', elige la cuenta (ej. BAC) e ingresa el monto con tarjeta.",
          "El sistema muestra la comisión bancaria y el neto que entrará al banco.",
          "La suma de las líneas debe cubrir el total; guarda la venta.",
        ],
      },
      {
        titulo: "Venta al crédito",
        pasos: [
          "Arma la venta y en el desglose de pago usa el método 'Crédito' por el monto fiado (puede combinarse con un abono inicial en efectivo).",
          "La venta queda con estado 'Pendiente' o 'Parcial'.",
          "Los abonos posteriores se registran en Ventas → Cuentas por Cobrar / Pagos.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "Me dice 'Debe abrir caja antes de realizar ventas en efectivo', ¿qué hago?",
        respuesta:
          "Ve a Finanzas → Caja Chica y abre la sesión del día con el efectivo inicial. Solo entonces el sistema acepta cobros en efectivo (así el dinero queda controlado en caja).",
      },
      {
        pregunta: "¿Por qué el total que entra al banco es menor a lo que pagó el cliente?",
        respuesta:
          "Porque la cuenta tiene un % de comisión configurado (Configuración → Cuentas Bancarias). El cliente paga el bruto; el banco deposita el neto. La diferencia queda registrada como comisión y aparece en el Estado de Resultados.",
      },
      {
        pregunta: "Vendí un producto equivocado, ¿cómo lo corrijo?",
        respuesta:
          "Si el cliente devuelve parte, usa Ventas → Devoluciones (repone stock y reembolsa dinero). Si toda la venta fue un error, elimínala desde Ventas → Historial: se revierte inventario, caja y banco por completo.",
      },
      {
        pregunta: "¿Puedo vender sin stock?",
        respuesta:
          "El catálogo muestra el stock disponible como referencia. Evita vender sin existencias: el inventario quedaría negativo y la valoración se distorsiona.",
      },
    ],
    keywords: [
      "vender", "factura", "pos", "cobrar", "efectivo", "tarjeta", "credito",
      "descuento", "isv", "impuesto", "comision", "ticket", "punto de venta",
    ],
  },
  {
    modulo: "Historial Ventas",
    titulo: "Historial de Ventas",
    descripcion:
      "Consultar todas las facturas emitidas, ver su detalle, reimprimir PDF, registrar abonos y eliminar ventas erróneas.",
    queHace: [
      "Lista todas las facturas con filtros por fecha, cliente y método de pago.",
      "Detalle de cada factura: productos, cantidades, pagos registrados y saldo pendiente.",
      "Reimprime la factura en PDF.",
      "Registra abonos a facturas al crédito.",
      "Pestaña 'Detalle por Producto': todas las líneas vendidas con costo y utilidad, exportable a Excel.",
      "Elimina una venta por completo: devuelve el stock, borra los movimientos de caja/banco asociados y elimina la factura (pide confirmación).",
    ],
    queNoHace: [
      "No permite editar montos o productos de una factura guardada — solo eliminar completo o devolver parcial (módulo Devoluciones).",
      "La eliminación no es reversible: una vez confirmada, la factura desaparece.",
    ],
    operaciones: [
      {
        titulo: "Buscar y reimprimir una factura",
        pasos: [
          "Abre Ventas → Historial Ventas.",
          "Filtra por rango de fechas o busca por cliente/número.",
          "Haz clic en el ícono de ojo para ver el detalle.",
          "Usa el botón de PDF para regenerar la factura.",
        ],
      },
      {
        titulo: "Eliminar una venta errónea",
        pasos: [
          "Ubica la factura en la lista y presiona el ícono de basurero.",
          "Lee el resumen de lo que se revertirá (stock, caja, banco) y confirma.",
          "Verifica en Inventario y Caja/Banco que los saldos volvieron a su estado anterior.",
        ],
      },
      {
        titulo: "Exportar el detalle de ventas a Excel",
        pasos: [
          "Ve a la pestaña 'Detalle por Producto'.",
          "Aplica los filtros de fecha que necesites.",
          "Presiona 'Exportar': se descarga un .xlsx con columnas separadas (fecha, factura, cliente, producto, cantidades, costos y utilidad).",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿Cuándo eliminar una venta y cuándo hacer una devolución?",
        respuesta:
          "Eliminar es para errores de captura (la venta nunca debió existir): borra todo el rastro. Devolución es para cuando el cliente regresa productos de una venta real: la factura original queda intacta y se genera una nota de crédito.",
      },
      {
        pregunta: "Registré un abono y no bajó el saldo, ¿qué reviso?",
        respuesta:
          "Confirma que el abono se guardó en la factura correcta (detalle → pagos). El saldo pendiente es total menos abonos acumulados.",
      },
    ],
    keywords: ["facturas", "consultar", "reimprimir", "abono", "eliminar venta", "exportar", "excel", "historial"],
  },
  {
    modulo: "Devoluciones",
    titulo: "Devoluciones (notas de crédito)",
    descripcion:
      "Devolver productos de una factura: repone el inventario y reembolsa el dinero, dejando la factura original intacta.",
    queHace: [
      "Busca la factura por número o cliente y muestra sus líneas.",
      "Permite elegir cuántas unidades devolver por producto (devolución parcial), con tope en lo vendido menos lo ya devuelto.",
      "Repone el stock al almacén del que salió la venta y deja rastro en el kardex.",
      "Reembolsa el dinero al destino que elijas: efectivo de caja chica o egreso de una cuenta bancaria.",
      "Pide confirmación con un resumen (productos, cantidades, monto, destino) antes de ejecutar.",
      "Genera un correlativo DEV-0001, guarda el motivo, y mantiene un historial exportable a Excel.",
      "El Estado de Resultados descuenta automáticamente las devoluciones (ventas netas).",
    ],
    queNoHace: [
      "No modifica ni elimina la factura original: la devolución es un registro aparte (nota de crédito).",
      "No permite devolver más unidades de las vendidas (ni de las que ya se devolvieron antes).",
      "No recalcula el costo promedio del producto: la mercancía reingresa al costo que tenía al venderse.",
      "El reembolso en efectivo requiere una sesión de caja chica abierta.",
    ],
    operaciones: [
      {
        titulo: "Procesar una devolución parcial",
        pasos: [
          "Abre Ventas → Devoluciones, pestaña 'Nueva devolución'.",
          "Busca la factura (ej. FC-0042) y selecciónala.",
          "En cada producto a devolver, indica la cantidad con los botones + / − (la columna 'Ya devuelto' muestra devoluciones previas).",
          "Elige a dónde devolver el dinero: Caja Chica (efectivo) o una cuenta bancaria.",
          "Escribe el motivo (opcional) y presiona 'Procesar devolución'.",
          "Revisa el resumen del diálogo de confirmación y confirma.",
          "Verifica el resultado en la pestaña 'Historial'.",
        ],
      },
      {
        titulo: "Consultar y exportar el historial de devoluciones",
        pasos: [
          "Entra a la pestaña 'Historial'.",
          "Revisa devolución, fecha, factura, cliente, vía de reembolso y monto.",
          "Presiona 'Exportar a Excel' para descargar el listado.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿El dinero sale de donde entró originalmente?",
        respuesta:
          "Tú eliges el destino al confirmar: caja (efectivo) o la cuenta bancaria que indiques, sin importar cómo pagó el cliente. Elige la vía por la que realmente le devuelves el dinero.",
      },
      {
        pregunta: "La venta era al crédito y no se ha pagado, ¿igual devuelvo dinero?",
        respuesta:
          "Si no hubo pago real, no deberías sacar dinero. Registra la devolución solo si vas a entregar dinero; para ajustar una deuda no cobrada, considera eliminar la venta y refacturar correctamente.",
      },
      {
        pregunta: "Me dice que no puedo devolver esa cantidad.",
        respuesta:
          "El tope por línea es lo vendido menos lo ya devuelto en devoluciones anteriores. Revisa la columna 'Ya devuelto'.",
      },
      {
        pregunta: "¿Dónde veo el efecto en los reportes?",
        respuesta:
          "El stock sube en Inventario, el dinero sale en Caja Chica o Movimientos de Cuentas (concepto 'Devolución DEV-XXXX'), y el Estado de Resultados del mes resta la devolución de las ventas.",
      },
    ],
    keywords: [
      "devolver", "reembolso", "nota de credito", "cambio", "producto defectuoso",
      "regresar", "reversar", "dev",
    ],
  },
]
