import type { TutorialModulo } from "./types"

/**
 * Tutoriales del módulo PRODUCCIÓN (Fase 1: Materiales). Cada `modulo` debe
 * calzar EXACTO con el nombre en `lib/constants/modulos.ts`. Al agregar más
 * módulos de producción (recetas, órdenes, etc.), agrega aquí su TutorialModulo.
 */
export const TUTORIALES_PRODUCCION: TutorialModulo[] = [
  {
    modulo: "Materiales",
    titulo: "Materiales de fabricación",
    descripcion:
      "El catálogo de materia prima para fabricar: nombre, unidad de medida, costo promedio y stock. Es la base del módulo de Producción.",
    queHace: [
      "Crea y edita materiales con su unidad de medida (kg, m, unidad, caja… texto libre con sugerencias).",
      "Muestra el costo promedio y el stock de cada material, que se actualizan con las compras de material.",
      "Es un catálogo SEPARADO de los productos que vendes: la materia prima no aparece en el punto de venta.",
    ],
    queNoHace: [
      "No fija el costo ni el stock a mano: el costo promedio y las existencias las gobierna la Compra de Materiales (y más adelante el consumo en producción).",
      "No se vende: los materiales no aparecen en Nueva Venta ni en el catálogo de productos.",
    ],
    operaciones: [
      {
        titulo: "Crear un material",
        pasos: [
          "Abre Producción → Materiales y presiona 'Nuevo material'.",
          "Escribe el nombre (ej. 'Tela algodón'), un código opcional y la unidad de medida (elige una sugerencia o escribe la tuya).",
          "Guarda. El material arranca con stock y costo en 0; se cargan al comprarlo.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿No me aparece el módulo de Producción?",
        respuesta:
          "El módulo de Producción se habilita por empresa desde el panel de administración (super-admin). Si no lo ves, pídele a tu administrador que lo active para tu empresa.",
      },
      {
        pregunta: "¿Cómo cargo el stock de un material?",
        respuesta:
          "Con Producción → Compra de Materiales: registras la compra y la recibes; ahí entra el stock y se calcula el costo promedio del material.",
      },
    ],
    keywords: ["material", "materia prima", "insumo", "produccion", "fabricacion", "unidad de medida", "kg", "metro"],
  },
  {
    modulo: "Compra de Materiales",
    titulo: "Compra de Materiales",
    descripcion:
      "Comprar materia prima a un proveedor y recibirla para cargar su inventario y costo, con prorrateo de costos de importación.",
    queHace: [
      "Registra una compra de material: proveedor, moneda (LPS/USD con tasa), líneas de material con cantidad y costo, y costos extra (importación, impuestos, otros).",
      "Prorratea los costos extra entre las líneas en proporción a su valor y calcula el costo final por material.",
      "Al RECIBIR la compra, suma el stock del material en el almacén/localización elegidos y recalcula su costo promedio ponderado.",
    ],
    queNoHace: [
      "No mueve inventario hasta que recibes la compra: una compra 'Pendiente' aún no cargó stock.",
      "No registra el pago al proveedor (eso es Finanzas → Gastos).",
      "No permite recibir dos veces la misma compra (evita duplicar stock).",
    ],
    operaciones: [
      {
        titulo: "Comprar y recibir material",
        pasos: [
          "Abre Producción → Compra de Materiales y presiona 'Nueva compra'.",
          "Elige el proveedor (opcional) y la moneda; en USD indica la tasa de cambio.",
          "Agrega una línea por material con su cantidad y costo unitario; ingresa los costos extra si aplica (se prorratean solos).",
          "Guarda: la compra queda 'Pendiente'. Verás el total con el prorrateo aplicado.",
          "Presiona 'Recibir', elige almacén y localización y confirma: el material entra al inventario y se actualiza su costo promedio.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿Por qué el costo final del material es distinto al que puse?",
        respuesta:
          "Porque los costos extra (importación, impuestos, otros) se reparten entre los materiales según su valor. El costo final que entra al inventario incluye esa parte prorrateada.",
      },
      {
        pregunta: "Recibí la compra y no cambió el stock, ¿qué reviso?",
        respuesta:
          "Verifica que la compra tenga líneas con cantidad mayor a 0 y que hayas elegido almacén y localización al recibir. El stock se ve en Producción → Inventario de Materiales.",
      },
    ],
    keywords: ["compra material", "proveedor", "recepcion", "prorrateo", "importacion", "costo material", "produccion"],
  },
  {
    modulo: "Inventario de Materiales",
    titulo: "Inventario de Materiales",
    descripcion:
      "La valoración de tu materia prima (stock, costo y valor) y el kardex de movimientos de cada material.",
    queHace: [
      "Lista cada material con su stock, costo promedio y valor total (stock × costo).",
      "Muestra el valor total del inventario de materiales.",
      "Kardex por material: todos sus movimientos (entradas por compra, consumos de producción, ajustes) con fecha, cantidad y costo.",
      "Exporta la valoración a Excel.",
    ],
    queNoHace: [
      "No edita el stock ni el costo directamente: son el resultado de las compras y (más adelante) los consumos de producción.",
    ],
    operaciones: [
      {
        titulo: "Ver la valoración y el kardex de un material",
        pasos: [
          "Abre Producción → Inventario de Materiales.",
          "Busca el material por nombre o código; ves su stock, costo promedio y valor.",
          "Presiona el ícono de historial para ver su kardex (movimientos cronológicos).",
          "Usa 'Exportar' para descargar la valoración completa en Excel.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿El valor del inventario de materiales suma al de los productos?",
        respuesta:
          "No. Los materiales tienen su inventario y valoración propios, separados del inventario de productos terminados (Inventario → Valoración).",
      },
    ],
    keywords: ["inventario material", "valoracion", "kardex", "stock material", "costo promedio", "produccion", "exportar"],
  },
  {
    modulo: "Recetas",
    titulo: "Recetas (MRP)",
    descripcion:
      "La receta de cada producto fabricado: qué materiales consume por unidad y sus factores de costo (energía, mano de obra, overhead). Calcula el costo estimado del artículo.",
    queHace: [
      "Arma la receta de un producto EXISTENTE del catálogo: elige el producto y agrega una línea por material con su consumo por unidad producida.",
      "Registra factores de costo POR UNIDAD: energía, mano de obra y overhead (en Lempiras).",
      "Calcula en vivo el costo estimado por unidad = Σ(consumo × costo del material) + factores.",
      "Guarda el estándar de producción (unidades por minuto), usado luego para el rendimiento/OEE.",
      "Tener una receta MARCA al producto como fabricado (se distingue de los productos que solo se compran/venden).",
    ],
    queNoHace: [
      "No cambia el costo real del producto: el costo estimado es una referencia. El costo REAL se fija al recibir cada corrida de producción (con el consumo real de esa corrida).",
      "No crea el producto: debe existir antes en Configuración → Productos.",
      "No consume inventario: la receta es solo la definición; el consumo ocurre en Control de Piso.",
    ],
    operaciones: [
      {
        titulo: "Crear la receta de un producto",
        pasos: [
          "Abre Producción → Recetas y elige el producto a fabricar en el buscador.",
          "Escribe su estándar de producción (unidades por minuto), si lo conoces.",
          "Agrega una línea por cada material y su consumo por unidad producida (ej. 0.5 kg de tela por camiseta).",
          "Ingresa los factores de costo por unidad (energía, mano de obra, overhead).",
          "Revisa el costo estimado por unidad que se calcula solo y presiona 'Guardar receta'.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿El costo estimado se vuelve el costo del producto?",
        respuesta:
          "No directamente. Es una estimación con el costo actual de los materiales. El costo real del producto se fija al recibir cada corrida de producción, con los materiales realmente consumidos y los factores de esa corrida.",
      },
      {
        pregunta: "Cambié el costo de un material, ¿se actualiza la receta?",
        respuesta:
          "El costo estimado se recalcula cuando abres la receta (usa el costo promedio vigente de cada material). Vuelve a guardarla para dejar cacheado el nuevo estimado.",
      },
    ],
    keywords: ["receta", "mrp", "bom", "consumo", "material por unidad", "costo estimado", "factores", "mano de obra", "overhead", "estandar", "unidades por minuto", "fabricado", "produccion"],
  },
  {
    modulo: "Ordenes de Produccion",
    titulo: "Órdenes de Producción",
    descripcion:
      "Planifica qué producto fabricar, cuánto y para cuándo. Cada orden congela la receta del producto para el control de piso y el costeo.",
    queHace: [
      "Crea órdenes para productos marcados como fabricados: cantidad a producir, fecha objetivo y notas.",
      "Al crear la orden, congela la receta vigente del producto (si tiene) para que el control de piso sepa qué materiales consumir.",
      "Maneja el estado de cada orden: Abierta, En Proceso, Cerrada o Cancelada.",
      "Solo muestra productos marcados como 'Es producto fabricado' (se marca en Configuración → Productos).",
    ],
    queNoHace: [
      "No descuenta materiales ni fabrica nada: eso ocurre en el Control de Piso al registrar las corridas.",
      "No obliga a que el producto tenga receta para crear la orden, pero avisa: sin receta no se podrá descontar materiales ni costear la producción.",
    ],
    operaciones: [
      {
        titulo: "Marcar un producto como fabricado",
        pasos: [
          "Abre Configuración → Productos y edita el producto.",
          "Activa la casilla 'Es producto fabricado' y guarda.",
          "Ese producto ya aparece en Recetas y en Órdenes de Producción.",
        ],
      },
      {
        titulo: "Crear una orden de producción",
        pasos: [
          "Abre Producción → Órdenes de Producción y presiona 'Nueva orden'.",
          "Elige el producto fabricado, la cantidad a producir, la fecha objetivo y notas si aplica.",
          "Guarda. Si el producto no tiene receta, el sistema te avisa para que la definas en Recetas.",
          "Usa el selector de estado para pasar la orden a 'En Proceso' o 'Cerrada' (o Cancelada).",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "No me aparece mi producto al crear la orden.",
        respuesta:
          "Solo se muestran los productos marcados como 'Es producto fabricado'. Edítalo en Configuración → Productos y activa esa casilla.",
      },
      {
        pregunta: "Creé la orden pero dice 'Sin receta', ¿qué hago?",
        respuesta:
          "Define la receta del producto en Producción → Recetas. Sin receta, el control de piso no puede descontar materiales ni calcular el costo real de la producción.",
      },
    ],
    keywords: ["orden de produccion", "orden", "fabricar", "planificar", "cantidad", "fecha objetivo", "estado", "abierta", "en proceso", "cerrada", "produccion"],
  },
  {
    modulo: "Control de Piso",
    titulo: "Control de Piso",
    descripcion:
      "Registra las corridas de producción de cada orden (unidades, horas, paros, defectos) y, al ejecutarlas, descuenta automáticamente los materiales según la receta.",
    queHace: [
      "Elige una orden abierta o en proceso y registra una o varias corridas (turnos/lotes).",
      "Captura por corrida: hora de inicio y fin, unidades buenas y defectuosas (con motivos), paros en minutos, tiempo planificado y novedades.",
      "Al 'Ejecutar' la corrida, descuenta los materiales = receta × unidades PROCESADAS (buenas + defectuosas) y calcula el costo real (materiales + factores) por unidad buena.",
      "Bloquea la ejecución si algún material no alcanza (nunca deja el stock de material en negativo).",
    ],
    queNoHace: [
      "No descuenta material al registrar la corrida: solo al ejecutarla.",
      "No permite ejecutar una corrida dos veces (evita doble descuento).",
      "No recibe el producto terminado al inventario: eso es Producción → Recepción de Producción (fase siguiente).",
      "No permite ejecutar si la orden no tiene receta.",
    ],
    operaciones: [
      {
        titulo: "Registrar y ejecutar una corrida",
        pasos: [
          "Abre Producción → Control de Piso y elige la orden.",
          "Presiona 'Registrar corrida' y captura las unidades buenas/defectuosas, horas, paros y novedades. Si hubo defectos, agrega sus motivos.",
          "Guarda: la corrida queda 'Registrada' (aún no descuenta material).",
          "Presiona 'Ejecutar' en la fila: se descuentan los materiales de la receta según las unidades procesadas y se calcula el costo real. Si falta material, te avisa y no ejecuta.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿Por qué el consumo usa las unidades defectuosas también?",
        respuesta:
          "Porque el material se gastó aunque algunas unidades salieran defectuosas. Por eso el consumo se calcula sobre las procesadas (buenas + defectuosas), y el costo de esas unidades malas se reparte encareciendo la unidad buena.",
      },
      {
        pregunta: "No me deja ejecutar: 'Stock de material insuficiente'.",
        respuesta:
          "Falta stock de uno o más materiales para el consumo requerido. Compra o ajusta ese material (Producción → Compra de Materiales) y vuelve a ejecutar.",
      },
    ],
    keywords: ["control de piso", "corrida", "produccion", "consumo material", "defectos", "paros", "oee", "unidades procesadas", "descuento material", "costo real"],
  },
  {
    modulo: "Dashboard Produccion",
    titulo: "Dashboard de Producción",
    descripcion:
      "Los indicadores de producción del período: unidades fabricadas por día, calidad y el OEE (Disponibilidad × Rendimiento × Calidad).",
    queHace: [
      "Muestra en un rango de fechas (con atajos: este mes, mes pasado, 7 días, este año) las unidades buenas y defectuosas, número de corridas y costo unitario promedio.",
      "Calcula el OEE y sus tres componentes: Disponibilidad (tiempo operativo vs planificado), Rendimiento (producción real vs el estándar de la receta) y Calidad (buenas ÷ procesadas).",
      "Grafica las unidades fabricadas por día (buenas y defectuosas).",
      "Solo considera corridas ya ejecutadas.",
    ],
    queNoHace: [
      "No captura datos: se alimenta de las corridas registradas en Control de Piso.",
      "Si una corrida no tiene tiempo planificado/horas o el producto no tiene estándar de producción, esa corrida se excluye del componente del OEE que no se puede calcular (se te indica); la Calidad siempre se calcula.",
    ],
    operaciones: [
      {
        titulo: "Revisar el rendimiento de producción",
        pasos: [
          "Abre Producción → Dashboard Producción.",
          "Elige el período (usa un atajo o fija desde/hasta).",
          "Revisa los KPIs, el OEE con sus tres componentes y la gráfica de unidades por día.",
          "Para mejorar el OEE: si la Disponibilidad es baja, revisa paros; si el Rendimiento es bajo, revisa el estándar y la velocidad real; si la Calidad es baja, revisa los defectos y sus motivos.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "El OEE me sale con guiones o incompleto.",
        respuesta:
          "Un componente aparece en '—' cuando ninguna corrida del período tenía el dato para calcularlo: Disponibilidad necesita tiempo planificado u horas de inicio/fin; Rendimiento necesita el estándar de producción (u/min) en la receta. Captura esos datos para ver el OEE completo.",
      },
    ],
    keywords: ["dashboard produccion", "oee", "disponibilidad", "rendimiento", "calidad", "unidades por dia", "indicadores", "produccion", "eficiencia"],
  },
  {
    modulo: "Recepcion de Produccion",
    titulo: "Recepción de Producción",
    descripcion:
      "Confirma las corridas ejecutadas y recibe el producto terminado al inventario, con el costo real de la corrida (promedio ponderado).",
    queHace: [
      "Lista las corridas ejecutadas pendientes de recibir, con sus unidades buenas y el costo unitario real.",
      "Al recibir, entran las unidades BUENAS al almacén y localización que elijas.",
      "Registra la entrada en el kardex del producto (movimiento 'Entrada Producción') y recalcula su costo promedio ponderado, igual que una compra.",
      "No permite recibir dos veces la misma corrida.",
    ],
    queNoHace: [
      "No recibe unidades defectuosas: solo entran al inventario las unidades buenas (vendibles).",
      "No descuenta materiales: eso ya ocurrió al ejecutar la corrida en Control de Piso.",
    ],
    operaciones: [
      {
        titulo: "Recibir una corrida al inventario",
        pasos: [
          "Abre Producción → Recepción de Producción.",
          "En la lista de corridas por recibir, presiona 'Recibir' en la que corresponda.",
          "Elige el almacén y la localización donde entra el producto terminado y confirma.",
          "El stock del producto sube por las unidades buenas y su costo promedio se recalcula con el costo real de la corrida.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿Por qué el costo del producto cambió tras recibir?",
        respuesta:
          "Porque el producto entra con el costo real de esa corrida y su costo promedio se pondera con el stock que ya tenías (como una recepción de compra). Así el costo refleja tanto lo anterior como lo recién producido.",
      },
      {
        pregunta: "Una corrida no aparece para recibir.",
        respuesta:
          "Solo aparecen las corridas en estado 'Ejecutada' con unidades buenas mayores a 0. Ejecuta la corrida primero en Control de Piso (eso descuenta el material y calcula el costo).",
      },
    ],
    keywords: ["recepcion produccion", "recibir", "producto terminado", "entrada produccion", "costo real", "inventario", "corrida", "almacen"],
  },
]
