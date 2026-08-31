import type { TutorialModulo } from "./types"

export const TUTORIALES_INVENTARIO: TutorialModulo[] = [
  {
    modulo: "Historial de Transacciones",
    titulo: "Historial de Transacciones (Kardex)",
    descripcion:
      "El libro mayor del inventario: cada entrada, salida, traslado y ajuste de cada producto, con filtros y export a Excel.",
    queHace: [
      "Muestra todos los movimientos de inventario: Entrada Compra, Salida Venta, Traslados, Ajustes y Entradas por Devolución.",
      "Filtros por producto, almacén, localización, tipo de movimiento y rango de fechas. El selector de producto tiene búsqueda por nombre o código.",
      "Dos pestañas: 'Kardex por producto' e 'Historial general'. En Kardex eliges un producto, presionas 'Buscar kardex' y trae TODA su historia desde el servidor (sin límite de filas), en orden cronológico con el SALDO acumulado (existencias) tras cada movimiento, separando Entradas y Salidas.",
      "El kardex NO carga solo al seleccionar: hay que presionar 'Buscar kardex' para garantizar que se traiga la historia completa. Los filtros de fecha, almacén, localización y tipo refinan sobre lo ya traído, sin volver a consultar.",
      "Si filtras por fechas, calcula el 'Saldo inicial' (lo acumulado antes del rango) para que el saldo de cada fila siga siendo real; el cargue inicial y todo lo anterior a la 'Fecha Inicio' quedan resumidos ahí. Quita la 'Fecha Inicio' para ver el cargue inicial como movimiento.",
      "Cada movimiento indica cantidad, costo/precio unitario y referencia al documento origen (compra, venta, devolución…).",
      "Exporta a Excel: el historial general, o el kardex del producto con Entrada/Salida/Saldo.",
    ],
    queNoHace: [
      "No permite editar ni borrar movimientos: el kardex es el registro histórico. Los errores se corrigen con movimientos de ajuste, no borrando.",
      "No muestra el stock consolidado (eso está en Valoración); aquí ves el detalle movimiento a movimiento.",
    ],
    operaciones: [
      {
        titulo: "Ver el Kardex de un producto (con saldo acumulado)",
        pasos: [
          "Abre Inventario → Historial de Transacciones y quédate en la pestaña 'Kardex por producto'.",
          "En 'Producto (kardex)' escribe el nombre o código y selecciónalo.",
          "Presiona 'Buscar kardex': trae toda la historia del producto desde el servidor.",
          "Se muestra el kardex cronológico: cada fila con Entrada/Salida y el Saldo (existencias) resultante. El encabezado indica el Saldo actual. (Opcional: refina por almacén, localización, tipo o rango de fechas.)",
          "Para ver el cargue inicial como movimiento, deja vacía la 'Fecha Inicio'.",
          "Revisa la secuencia: cada venta debe tener su 'Salida Venta', cada compra su 'Entrada Compra'. Si el stock no cuadra con lo físico, registra un ajuste en Movimientos Manuales.",
        ],
      },
      {
        titulo: "Exportar el kardex a Excel",
        pasos: [
          "Aplica los filtros que necesites.",
          "Presiona 'Exportar': se descarga un .xlsx con fecha, hora, producto, tipo, almacén y cantidades.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿Por qué el stock del sistema no coincide con lo físico?",
        respuesta:
          "Causas típicas: ventas o recepciones no registradas, mermas o robos. Audita el kardex del producto para encontrar el faltante y regístralo como ajuste en Movimientos Manuales (cantidad negativa o positiva).",
      },
      {
        pregunta: "En el kardex solo veo 'Saldo inicial' y no el cargue inicial del producto",
        respuesta:
          "Es porque pusiste una 'Fecha Inicio' posterior a la fecha del cargue: el kardex resume todo lo anterior al rango en el 'Saldo inicial'. Quita la 'Fecha Inicio' (o ponla igual/antes de la fecha del cargue) y el cargue aparecerá como el primer movimiento.",
      },
      {
        pregunta: "¿Por qué el kardex ya no se muestra al seleccionar el producto?",
        respuesta:
          "Para asegurar que se traiga TODA la historia del producto (sin el límite de filas de la vista general), el kardex se consulta al presionar 'Buscar kardex'. Si cambias de producto, vuelve a presionarlo.",
      },
    ],
    keywords: ["kardex", "movimientos", "auditar", "trazabilidad", "entradas", "salidas", "libro", "saldo", "saldo acumulado", "saldo inicial", "existencias", "buscar producto", "buscar kardex", "cargue inicial"],
  },
  {
    modulo: "Movimientos Manuales",
    titulo: "Movimientos Manuales (Ingresos y Salidas)",
    descripcion:
      "Registrar entradas y salidas manuales de inventario: ingresar mercancía sin orden de compra, o retirar unidades (mermas, consumo interno, correcciones).",
    queHace: [
      "Ingreso: suma unidades de un producto a un almacén/localización con su costo unitario y recalcula el costo promedio ponderado.",
      "Salida: resta unidades del inventario al costo promedio actual (sin cambiar el costo promedio).",
      "Sirve para inventario inicial, regularizaciones, mermas y correcciones.",
      "Deja rastro en el kardex ('Ingreso Manual' o 'Salida Manual').",
    ],
    queNoHace: [
      "No permite una salida si el producto no tiene existencias, ni una que deje el stock en negativo.",
      "No está pensado para recepciones de compras con orden (usa Recepción por OC, que además controla al proveedor).",
      "No modifica el precio de venta del producto; solo el stock (y el costo promedio solo en ingresos).",
    ],
    operaciones: [
      {
        titulo: "Ingresar mercancía / inventario inicial",
        pasos: [
          "Abre Inventario → Movimientos Manuales y elige «Ingreso».",
          "Selecciona el producto, el almacén y la localización.",
          "Ingresa la cantidad y el costo unitario real.",
          "Guarda: el stock sube y el costo promedio se recalcula.",
        ],
      },
      {
        titulo: "Dar salida manual (merma, consumo, corrección)",
        pasos: [
          "Elige «Salida» y selecciona el producto (verás su stock disponible).",
          "Ingresa la cantidad a retirar (no puede superar las existencias).",
          "Anota el motivo en observaciones y procesa: el stock baja al costo promedio actual.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿Puedo dar salida a más de lo que hay en stock?",
        respuesta:
          "No. Una salida no puede dejar el inventario en negativo ni hacerse si el stock es 0; el sistema la bloquea y muestra las existencias disponibles.",
      },
      {
        pregunta: "¿La salida cambia el costo promedio?",
        respuesta:
          "No. Las salidas retiran unidades al costo promedio actual sin modificarlo. Solo los ingresos recalculan el costo promedio ponderado.",
      },
    ],
    keywords: ["ingreso", "salida", "movimiento", "ajuste", "inventario inicial", "cuadrar", "conteo", "merma", "regularizar"],
  },
  {
    modulo: "Traslados",
    titulo: "Traslados entre almacenes",
    descripcion:
      "Mover mercancía entre almacenes o localizaciones, dejando rastro de salida y entrada en el kardex.",
    queHace: [
      "Traslada uno o varios productos de un almacén/localización origen a otro destino en una sola operación.",
      "Filtros por categoría y marca para acotar el catálogo (aplican al buscador y a 'Agregar todos con stock').",
      "Botón 'Agregar todos con stock': tras elegir el origen, agrega de una vez todas las referencias con existencias en esa localización (respetando los filtros de categoría/marca), con la cantidad igual al stock disponible (editable). Ideal para vaciar una bodega o mover solo una categoría/marca hacia otra.",
      "Genera dos movimientos por producto: 'Traslado Salida' en el origen y 'Traslado Entrada' en el destino.",
      "El stock total del producto no cambia, solo su ubicación.",
    ],
    queNoHace: [
      "No cambia costos ni precios: es un movimiento físico, no económico.",
      "No permite trasladar más unidades de las que hay en el origen.",
    ],
    operaciones: [
      {
        titulo: "Trasladar productos entre bodegas",
        pasos: [
          "Abre Inventario → Traslados.",
          "Elige el almacén y localización de ORIGEN.",
          "Elige el almacén y localización de DESTINO.",
          "Opcional: filtra por categoría o marca para acotar el catálogo.",
          "Agrega los productos uno por uno con el buscador, o usa 'Agregar todos con stock' para traer de una vez todas las referencias con existencias en el origen (según el filtro elegido).",
          "Ajusta las cantidades a mover (por defecto, cada línea trae el stock disponible). Usa 'Vaciar lista' para empezar de nuevo.",
          "Confirma: el kardex registra la salida en origen y la entrada en destino.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "Me equivoqué de destino, ¿cómo corrijo?",
        respuesta:
          "Registra un nuevo traslado en sentido contrario (del destino equivocado al correcto). Ambos quedan en el kardex para trazabilidad.",
      },
    ],
    keywords: ["mover", "bodega", "transferir mercancia", "ubicacion", "localizacion", "seleccionar todos", "agregar todos", "vaciar bodega", "traslado masivo", "filtrar categoria", "filtrar marca"],
  },
  {
    modulo: "Ajustes de Inventario",
    titulo: "Ajustes de Inventario",
    descripcion:
      "Cuadra el inventario contra un conteo físico: escribe la cantidad real y el sistema genera las entradas/salidas para corregir, sin cambiar el costo.",
    queHace: [
      "Dos modos: ajustar un producto puntual, o contar una localización completa (lista todo el catálogo con su stock en esa localización).",
      "Muestra la cantidad actual del sistema y te deja escribir la cantidad real contada.",
      "Genera automáticamente un movimiento de 'Ajuste' por producto en el kardex: entrada si sobra, salida si falta.",
      "Usa el costo promedio ACTUAL del producto en el movimiento, así el ajuste NO altera la valoración/costo promedio.",
      "Guarda una bitácora con el motivo, el antes/después y quién hizo el ajuste (auditoría).",
    ],
    queNoHace: [
      "No cambia el costo promedio del producto: solo corrige la cantidad.",
      "No genera movimiento para los productos cuya cantidad real coincide con la del sistema (solo ajusta lo que difiere).",
      "No es para ingresar mercancía nueva con costo (eso es Movimientos Manuales o Compras); es para cuadrar existencias.",
    ],
    operaciones: [
      {
        titulo: "Ajustar un producto",
        pasos: [
          "Abre Inventario → Ajustes de Inventario.",
          "Elige el almacén y la localización.",
          "En 'Un producto', busca y selecciona el producto: verás su cantidad actual y su costo promedio.",
          "Escribe la cantidad real contada. Aparece la diferencia (entrada o salida).",
          "Escribe el motivo (opcional) y presiona 'Aplicar ajuste'; confirma el resumen.",
        ],
      },
      {
        titulo: "Contar una localización completa",
        pasos: [
          "Elige almacén y localización, y entra a la pestaña 'Localización completa'.",
          "El sistema lista los productos con su stock actual; escribe la cantidad real de cada uno (usa el buscador para ubicarlos).",
          "Solo las filas con diferencia se ajustarán. Revisa el resumen de entradas/salidas.",
          "Motivo (opcional) y 'Aplicar ajuste' → confirma.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿El ajuste cambia el costo de mi producto?",
        respuesta:
          "No. El movimiento de ajuste usa el costo promedio actual, así la valoración no se distorsiona. Solo cambia la cantidad en existencia.",
      },
      {
        pregunta: "Conté una localización y no pasó nada con varios productos.",
        respuesta:
          "Es lo esperado: solo se generan movimientos para los productos cuya cantidad real difiere de la del sistema. Los que ya cuadraban no se tocan.",
      },
      {
        pregunta: "¿Dónde veo el ajuste después?",
        respuesta:
          "En Inventario → Historial de Transacciones aparece como movimiento 'Ajuste' (con la cantidad en + o −). El motivo y el antes/después quedan en la bitácora de ajustes.",
      },
    ],
    keywords: ["ajuste", "conteo", "cuadrar", "inventario fisico", "merma", "faltante", "sobrante", "toma fisica"],
  },
  {
    modulo: "Ajuste de Costo",
    titulo: "Ajuste de Costo",
    descripcion:
      "Cambia manualmente el costo unitario de un producto y, opcionalmente, recalcula el costo de sus ventas pasadas en un intervalo de fechas.",
    queHace: [
      "Fija un nuevo costo promedio para un producto (por si el costo de compra se capturó mal o cambió de proveedor).",
      "Al cambiar el costo, la valoración de inventario (Inventario → Valoración) se actualiza de inmediato, porque se calcula como stock × costo promedio.",
      "Opcionalmente recalcula el costo CONGELADO de las ventas del producto en un rango de fechas: reescribe el costo y la utilidad de cada línea de venta, el costo del kardex y el de las devoluciones del período.",
      "Muestra una vista previa del impacto antes de aplicar: nuevo valor de inventario, cuántas ventas se afectan y cómo cambia el CMV y la utilidad del rango.",
      "Guarda una bitácora con el costo anterior/nuevo, el rango, las ventas afectadas y el motivo (auditoría).",
    ],
    queNoHace: [
      "No recalcula un promedio ponderado histórico: aplica el nuevo costo PLANO a todas las ventas del intervalo. Si en el período hubo compras a distintos costos, esa variación legítima se uniforma al nuevo costo.",
      "No deja un movimiento en el kardex por el cambio de costo (el kardex registra movimiento de cantidad, no de costo); la auditoría vive en la bitácora de ajustes de costo.",
      "No cambia cantidades ni stock: para eso están Movimientos Manuales, Traslados o Ajustes de Inventario.",
      "Si no activas el recálculo, el historial de ventas y el CMV pasado quedan intactos (solo cambia la valoración actual).",
    ],
    operaciones: [
      {
        titulo: "Cambiar solo el costo actual",
        pasos: [
          "Abre Inventario → Ajuste de Costo.",
          "Busca y selecciona el producto: verás su costo promedio y stock actuales.",
          "Escribe el nuevo costo unitario. La tarjeta muestra el nuevo valor de inventario.",
          "Deja SIN marcar 'Recalcular ventas'. Escribe un motivo (opcional) y 'Aplicar cambio de costo'; confirma.",
        ],
      },
      {
        titulo: "Cambiar el costo y recalcular ventas de un período",
        pasos: [
          "Selecciona el producto y escribe el nuevo costo.",
          "Marca 'Recalcular ventas en un intervalo' y elige las fechas Desde y Hasta.",
          "Revisa la vista previa: ventas afectadas, CMV antes→después y cambio en la utilidad.",
          "Escribe el motivo y 'Aplicar cambio de costo'. En la confirmación verás la advertencia de que se reescribe el CMV histórico; confirma.",
          "Verifica en Finanzas → Estado de Resultados del período que el CMV y el margen cambiaron.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿Por qué mi estado de resultados de meses pasados no cambió?",
        respuesta:
          "El costo de las ventas se congela al vender. Cambiar el costo actual solo afecta la valoración de inventario. Para corregir el CMV/margen histórico debes activar 'Recalcular ventas' y elegir el rango de fechas.",
      },
      {
        pregunta: "¿Qué costo les queda a las ventas del rango?",
        respuesta:
          "El nuevo costo, plano: todas las ventas del intervalo quedan con el mismo costo unitario. Si en ese período compraste a precios distintos, esa diferencia se uniforma. Úsalo cuando el costo estaba mal y quieres corregirlo parejo.",
      },
      {
        pregunta: "¿Se puede deshacer?",
        respuesta:
          "No hay un botón de deshacer, pero puedes volver a correr el ajuste con el costo anterior y el mismo rango. La bitácora guarda el costo anterior de cada operación.",
      },
    ],
    keywords: ["costo", "costo unitario", "costo promedio", "recalcular costo", "cmv", "margen", "corregir costo", "valoracion"],
  },
  {
    modulo: "Valoracion",
    titulo: "Valoración de Inventario",
    descripcion:
      "Cuánto vale tu inventario: stock por producto al costo promedio, valor comercial, margen potencial y días sin venta.",
    queHace: [
      "Lista cada producto con stock total, costo promedio, precio de venta, valor al costo y valor comercial.",
      "Calcula el margen potencial (valor comercial menos valor al costo).",
      "Muestra días sin venta y última venta por producto (detecta inventario estancado).",
      "Desglosa el stock por almacén al expandir un producto.",
      "Filtro por almacén y export a Excel con fila de totales.",
    ],
    queNoHace: [
      "No modifica stock ni costos: es un reporte. Los ajustes se hacen en Movimientos Manuales.",
      "No proyecta ventas ni sugiere pedidos automáticamente.",
    ],
    operaciones: [
      {
        titulo: "Conocer el valor del inventario",
        pasos: [
          "Abre Inventario → Valoración.",
          "Revisa las tarjetas superiores: total de unidades, valor al costo y valor comercial.",
          "Filtra por almacén si necesitas el valor de una sola bodega.",
        ],
      },
      {
        titulo: "Detectar productos estancados",
        pasos: [
          "Ordena o revisa la columna 'Días sin venta'.",
          "Los productos con muchos días sin venta y stock alto son candidatos a promoción o descontinuación.",
        ],
      },
      {
        titulo: "Exportar la valoración a Excel",
        pasos: [
          "Aplica el filtro de almacén si aplica.",
          "Presiona 'Descargar Excel': incluye una fila TOTAL al final.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿De dónde sale el costo promedio?",
        respuesta:
          "De las compras recibidas y los ingresos manuales: cada entrada mezcla su costo con el del stock existente (promedio ponderado). Las ventas no lo cambian.",
      },
    ],
    keywords: ["valor inventario", "costo", "margen", "stock", "estancado", "reporte", "excel"],
  },
]
