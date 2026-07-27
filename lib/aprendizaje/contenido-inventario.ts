import type { TutorialModulo } from "./types"

export const TUTORIALES_INVENTARIO: TutorialModulo[] = [
  {
    modulo: "Historial de Transacciones",
    titulo: "Historial de Transacciones (Kardex)",
    descripcion:
      "El libro mayor del inventario: cada entrada, salida, traslado y ajuste de cada producto, con filtros y export a Excel.",
    queHace: [
      "Muestra todos los movimientos de inventario: Entrada Compra, Salida Venta, Traslados, Ajustes y Entradas por Devolución.",
      "Filtros por producto, almacén, localización, tipo de movimiento y rango de fechas.",
      "Cada movimiento indica cantidad, costo/precio unitario y referencia al documento origen (compra, venta, devolución…).",
      "Exporta el resultado filtrado a Excel.",
    ],
    queNoHace: [
      "No permite editar ni borrar movimientos: el kardex es el registro histórico. Los errores se corrigen con movimientos de ajuste, no borrando.",
      "No muestra el stock consolidado (eso está en Valoración); aquí ves el detalle movimiento a movimiento.",
    ],
    operaciones: [
      {
        titulo: "Auditar los movimientos de un producto",
        pasos: [
          "Abre Inventario → Historial de Transacciones.",
          "Filtra por el producto (y opcionalmente el almacén o rango de fechas).",
          "Revisa la secuencia: cada venta debe tener su 'Salida Venta', cada compra su 'Entrada Compra'.",
          "Si el stock no cuadra con la realidad física, registra un ajuste en Ingreso Manual.",
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
          "Causas típicas: ventas o recepciones no registradas, mermas o robos. Audita el kardex del producto para encontrar el faltante y regístralo como ajuste en Ingreso Manual (cantidad negativa o positiva).",
      },
    ],
    keywords: ["kardex", "movimientos", "auditar", "trazabilidad", "entradas", "salidas", "libro"],
  },
  {
    modulo: "Ingreso Manual",
    titulo: "Ingreso Manual / Ajustes",
    descripcion:
      "Ingresar mercancía sin orden de compra o ajustar el inventario para cuadrarlo con la realidad física.",
    queHace: [
      "Ingresa unidades de un producto a un almacén/localización con su costo unitario.",
      "Recalcula el costo promedio ponderado del producto con el costo ingresado.",
      "Sirve para inventario inicial, regularizaciones y correcciones.",
      "Deja rastro en el kardex.",
    ],
    queNoHace: [
      "No está pensado para recepciones de compras con orden (usa Recepción por OC, que además controla al proveedor).",
      "No modifica el precio de venta del producto, solo stock y costo.",
    ],
    operaciones: [
      {
        titulo: "Cargar inventario inicial de un producto",
        pasos: [
          "Abre Inventario → Ingreso Manual.",
          "Selecciona el producto, el almacén y la localización.",
          "Ingresa la cantidad física contada y el costo unitario real.",
          "Guarda: el stock y el costo promedio quedan establecidos.",
        ],
      },
      {
        titulo: "Ajustar un descuadre de inventario",
        pasos: [
          "Cuenta físicamente el producto y compara con el stock del sistema (Valoración).",
          "Registra un ingreso por la diferencia (si falta en el sistema) usando el costo promedio actual.",
          "Anota en observaciones el motivo del ajuste para auditoría.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿Qué costo pongo en un ajuste?",
        respuesta:
          "Si solo corriges cantidades, usa el costo promedio actual del producto para no distorsionar la valoración. Si es mercancía nueva con costo conocido, usa el costo real.",
      },
    ],
    keywords: ["ajuste", "inventario inicial", "cuadrar", "conteo", "regularizar", "merma"],
  },
  {
    modulo: "Traslados",
    titulo: "Traslados entre almacenes",
    descripcion:
      "Mover mercancía entre almacenes o localizaciones, dejando rastro de salida y entrada en el kardex.",
    queHace: [
      "Traslada uno o varios productos de un almacén/localización origen a otro destino en una sola operación.",
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
          "Agrega los productos y cantidades a mover.",
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
    keywords: ["mover", "bodega", "transferir mercancia", "ubicacion", "localizacion"],
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
      "No es para ingresar mercancía nueva con costo (eso es Ingreso Manual o Compras); es para cuadrar existencias.",
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
      "No modifica stock ni costos: es un reporte. Los ajustes se hacen en Ingreso Manual.",
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
