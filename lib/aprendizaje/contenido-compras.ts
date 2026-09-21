import type { TutorialModulo } from "./types"

export const TUTORIALES_COMPRAS: TutorialModulo[] = [
  {
    modulo: "Orden de Compra",
    titulo: "Orden de Compra",
    descripcion:
      "Crear órdenes de compra a proveedores, en Lempiras o dólares, con costos de importación que se reparten al costo final de cada producto.",
    queHace: [
      "Crea órdenes con proveedor, fecha tentativa de llegada y líneas de productos con costo unitario.",
      "Soporta moneda LPS o USD con tasa de cambio.",
      "Registra costos de importación, impuestos de compra y otros costos; el sistema los prorratea en el costo final local de cada producto.",
      "Estados de la orden: Pendiente → Recibida (o Cancelada).",
      "Genera la orden en PDF con el logo de la empresa para enviarla al proveedor.",
    ],
    queNoHace: [
      "No mueve inventario ni costos al crearla: el stock y el costo promedio cambian solo al RECIBIR la mercancía (Recepción por OC).",
      "No registra el pago al proveedor — el pago se maneja en Finanzas → Gastos (cuentas por pagar).",
    ],
    operaciones: [
      {
        titulo: "Crear una orden de compra local (Lempiras)",
        pasos: [
          "Abre Compras → Orden de Compra y presiona Nueva Orden.",
          "Elige el proveedor y la fecha tentativa de llegada.",
          "Agrega los productos con cantidad y costo unitario.",
          "Guarda: la orden queda 'Pendiente' y aparece en el Dashboard como compra por recibir.",
          "Genera el PDF si necesitas enviarla al proveedor.",
        ],
      },
      {
        titulo: "Crear una orden de importación (USD)",
        pasos: [
          "Crea la orden y elige moneda USD con su tasa de cambio.",
          "Ingresa los costos unitarios en dólares.",
          "Registra los costos de importación, impuestos y otros costos (flete, aduana…).",
          "El sistema calcula el costo final en Lempiras por producto, con el prorrateo incluido — ese será el costo que entre al inventario al recibir.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿Puedo modificar una orden ya creada?",
        respuesta:
          "Mientras esté Pendiente puedes cancelarla y crear una nueva. Una vez recibida, los movimientos de inventario ya se generaron.",
      },
      {
        pregunta: "¿Cómo afecta la orden al costo de mis productos?",
        respuesta:
          "Al recibirla, el sistema recalcula el costo promedio ponderado de cada producto usando el costo final local (incluye el prorrateo de importación).",
      },
    ],
    keywords: ["oc", "pedido", "proveedor", "importacion", "dolares", "tasa cambio", "prorrateo", "flete"],
  },
  {
    modulo: "Recepcion por OC",
    titulo: "Recepción por Orden de Compra",
    descripcion:
      "Recibir la mercancía de una orden de compra: ingresa el stock al almacén y actualiza el costo promedio de cada producto.",
    queHace: [
      "Lista las órdenes pendientes y permite recibirlas total o parcialmente (cantidad recibida por línea).",
      "Puedes EDITAR por línea la cantidad, el costo final y el precio de venta. Ves en vivo el margen, la utilidad por unidad, el costo anterior y el precio anterior del producto para decidir.",
      "El precio de venta que pongas ACTUALIZA el precio de lista del producto en el catálogo.",
      "Ingresa las unidades al almacén y localización que elijas.",
      "Recalcula el costo promedio ponderado del producto con el costo final de la compra.",
      "Método de pago: eliges cómo se paga la recepción — Efectivo (sale de caja chica), Banco (sale de una cuenta) o Cuenta por pagar (queda pendiente al proveedor). Se registra un gasto por el total, así tu balance refleja la salida real.",
      "Deja rastro en el kardex como 'Entrada Compra' vinculada a la orden.",
      "Marca la orden como Recibida cuando se completa.",
      "Muestra un desglose explícito del prorrateo: cuánto de los costos de importación/impuestos/otros se asigna a cada producto (según su valor) y cómo se forma el costo final unitario, con total de control.",
    ],
    queNoHace: [
      "No crea órdenes (eso es Orden de Compra) ni recibe mercancía sin orden — para eso está Recepción por Factura o Ingreso Manual.",
    ],
    operaciones: [
      {
        titulo: "Recibir una orden completa",
        pasos: [
          "Abre Compras → Recepción por OC.",
          "Selecciona la orden pendiente.",
          "Elige el almacén y la localización donde entra la mercancía.",
          "Revisa/edita por línea la cantidad, el costo y el precio de venta (ves margen, utilidad, costo y precio anteriores).",
          "Elige el método de pago: Efectivo, Banco (con su cuenta) o Cuenta por pagar.",
          "Guarda: el stock sube, el costo promedio y el precio se actualizan, se registra el pago/gasto y la orden queda Recibida.",
        ],
      },
      {
        titulo: "Entender el costo con importación (prorrateo)",
        pasos: [
          "Al recibir, ingresa los costos de importación, impuestos y otros costos en Lempiras.",
          "Aparece la tabla 'Cómo se calcula el costo': cada producto muestra su valor, el % que representa del total, cuánto costo adicional se le asignó y el costo final unitario.",
          "Los costos se reparten en proporción al valor de cada línea (más caro = recibe más costo). Verifica el total de control: valor de mercancía + costos adicionales = inventario recibido.",
        ],
      },
      {
        titulo: "Recepción parcial (llegó menos de lo pedido)",
        pasos: [
          "Selecciona la orden y ajusta la cantidad recibida en cada línea a lo que realmente llegó.",
          "Guarda la recepción: solo esas unidades entran al inventario.",
          "La orden mantiene el saldo pendiente para recibir el resto después.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿Por qué cambió el costo de mi producto después de recibir?",
        respuesta:
          "El sistema usa costo promedio ponderado: mezcla el stock existente a su costo anterior con las unidades nuevas a su costo de compra. Es el método correcto para valorar inventario.",
      },
      {
        pregunta: "Recibí en el almacén equivocado, ¿cómo corrijo?",
        respuesta:
          "Usa Inventario → Traslados para mover las unidades al almacén correcto. El kardex conserva ambos movimientos para auditoría.",
      },
    ],
    keywords: ["recibir", "mercancia", "entrada", "costo promedio", "parcial", "almacen", "precio de venta", "margen", "utilidad", "metodo de pago", "cuenta por pagar", "pago proveedor"],
  },
  {
    modulo: "Recepcion por Factura",
    titulo: "Recepción por Factura (con IA)",
    descripcion:
      "Subir la foto de una factura de proveedor: la inteligencia artificial extrae los productos y cantidades para ingresarlos al inventario sin digitar.",
    queHace: [
      "Tres modos: 'Digitalizar (IA)' (subir foto/PDF), 'Captura manual' (agregar productos por nombre o código de barras, sin imagen) e 'Historial' (facturas de compra recibidas).",
      "Campo para el número de factura del proveedor, que se guarda con la compra.",
      "Cada recepción crea una compra real (con proveedor, número de factura, fecha, líneas y total), así queda registrada en el historial y el kardex puede apuntar a ella.",
      "Historial: lista las facturas de compra recibidas; abre cada una para ver su desglose de productos (cantidad, costo, subtotal).",
      "Acepta foto o PDF de la factura del proveedor.",
      "La IA (Gemini) lee la factura y extrae cada línea: nombre del producto, cantidad y costo unitario.",
      "Permite mapear cada línea extraída con un producto del catálogo (o crear el producto al vuelo).",
      "Editas por línea la cantidad, el costo y el precio de venta; ves el margen, la utilidad por unidad, el costo anterior y el precio anterior. El precio que pongas actualiza el precio de lista del producto.",
      "Ingresa el stock y actualiza el costo promedio, igual que una recepción normal.",
      "Método de pago: Efectivo (caja chica), Banco (una cuenta) o Cuenta por pagar (pendiente al proveedor). Se registra un gasto por el total.",
      "Con costos de importación/impuestos/otros, muestra el mismo desglose explícito del prorrateo que la Recepción por OC.",
      "Detección de tallas (si tu empresa usa tallas): cuando la factura desglosa una referencia por talla (S/M/L… o 6/8/10…), la IA la agrupa en una sola línea y marca las tallas detectadas. Al crear ese producto, el diálogo llega precargado con las tallas y sus cantidades; al guardarlo se crean los productos hermanos agrupados y la línea de factura se reemplaza por una línea por talla (cada una entra a inventario con su cantidad).",
    ],
    queNoHace: [
      "No es infalible: la IA puede leer mal cantidades o precios en facturas borrosas — siempre revisa antes de confirmar.",
      "No asocia productos automáticamente: el mapeo línea → producto del catálogo lo confirmas tú.",
      "La detección de tallas depende de que la factura las liste legibles; siempre puedes corregir/agregar tallas y cantidades a mano en el diálogo.",
    ],
    operaciones: [
      {
        titulo: "Ingresar mercancía desde una foto de factura",
        pasos: [
          "Abre Compras → Recepción por Factura, pestaña 'Digitalizar (IA)'.",
          "Arrastra o sube la imagen/PDF de la factura (JPG, PNG o PDF) y presiona 'Extraer Productos'.",
          "Elige el proveedor y escribe el número de factura.",
          "Revisa las líneas extraídas: corrige cantidad, costo y precio de venta si hace falta (ves margen y utilidad).",
          "Asocia cada línea con su producto del catálogo (o créalo con el botón rápido).",
          "Elige almacén/localización, el método de pago (Efectivo/Banco/Cuenta por pagar) y confirma. Se crea la compra y queda en el historial.",
        ],
      },
      {
        titulo: "Crear una factura de compra manual (sin imagen)",
        pasos: [
          "Abre Compras → Recepción por Factura, pestaña 'Captura manual'.",
          "Elige el proveedor y escribe el número de factura.",
          "Presiona 'Agregar producto' y búscalo por nombre o código de barras; se agrega una línea editable (repite por cada producto).",
          "Ajusta cantidad, costo y precio de venta de cada línea.",
          "Elige almacén/localización, el método de pago y confirma.",
        ],
      },
      {
        titulo: "Ver el historial de facturas de compra",
        pasos: [
          "Abre la pestaña 'Historial'.",
          "Verás las facturas recibidas con su número, proveedor, fecha y total.",
          "Presiona 'Ver' en una factura para abrir su desglose de productos.",
        ],
      },
      {
        titulo: "Ingresar una referencia con tallas desde la factura",
        pasos: [
          "Requiere que tu empresa use tallas (se activa de forma centralizada).",
          "Tras procesar con IA, la línea con tallas aparece marcada con las tallas detectadas (ej. 'Tallas: S(5) M(8) L(3)').",
          "Presiona 'Crear producto tallado' en esa línea: el diálogo llega con la casilla 'Este producto tiene tallas' activa y las tallas precargadas.",
          "Corrige o completa las tallas y cantidades si hace falta; define el costo y el precio (iguales para todas las tallas) y guarda.",
          "La línea de la factura se reemplaza por una línea por talla, cada una asociada a su producto. Confirma el ingreso: entra el stock de cada talla con el costo prorrateado.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "La IA no extrajo nada o marcó error, ¿qué hago?",
        respuesta:
          "Verifica que la foto sea legible y bien iluminada. Si persiste, puede faltar la clave de IA en el servidor (avisar al administrador) o la factura tiene un formato muy inusual — ingresa las líneas a mano con Ingreso Manual.",
      },
      {
        pregunta: "¿Se guarda la foto de la factura?",
        respuesta:
          "En este módulo la imagen solo se usa para la extracción. Si quieres guardar el comprobante, adjúntalo al gasto correspondiente en Finanzas → Gastos.",
      },
    ],
    keywords: ["ia", "inteligencia artificial", "foto", "escanear", "gemini", "factura proveedor", "ocr", "tallas", "talla", "tallado", "detectar tallas", "precio de venta", "margen", "utilidad", "metodo de pago", "cuenta por pagar", "pago proveedor"],
  },
  {
    modulo: "Recalcular Recepcion",
    titulo: "Recalcular Recepción",
    descripcion:
      "Tomar una compra ya recibida y recomputar el costo del lote con costos fijos corregidos (importación, impuestos, otros, tasa de cambio), aplicando la diferencia al costo de los productos.",
    queHace: [
      "Lista las compras ya recibidas (por Orden de Compra) para elegir el lote a corregir.",
      "Precarga los costos fijos del lote (importación, impuestos, otros, tasa) y permite editarlos.",
      "Re-corre el prorrateo y muestra, por producto, el costo final antiguo vs. el nuevo y la diferencia.",
      "Actualiza el costo final de cada línea, el kardex de la entrada y el total del lote.",
      "Corrige el costo promedio de cada producto por la diferencia del lote proporcional al stock actual (ajuste por delta).",
      "Opcional: recalcula el costo de las ventas pasadas de esos productos en un rango de fechas (afecta el CMV y el margen histórico).",
    ],
    queNoHace: [
      "No recalcula recepciones hechas por Recepción por Factura (IA): esas no generan una compra en el sistema y no aparecen en la lista.",
      "No cambia las cantidades recibidas ni los costos unitarios de compra; solo redistribuye los costos fijos.",
      "No revierte el promedio ponderado lote por lote: aplica la diferencia sobre el stock actual, así que si ya se vendió gran parte del lote el ajuste es aproximado.",
    ],
    operaciones: [
      {
        titulo: "Corregir el flete/aduana de una importación ya recibida",
        pasos: [
          "Abre Compras → Recalcular Recepción y busca la compra por número o proveedor.",
          "Selecciona la compra recibida: se precargan sus costos fijos.",
          "Ajusta los costos de importación, impuestos, otros costos y/o la tasa de cambio a los valores reales.",
          "Revisa el desglose del prorrateo y la tabla de impacto por producto (costo final y costo promedio, antiguo → nuevo).",
          "Si quieres corregir también las ventas ya hechas, activa «Recalcular ventas» y elige el rango (por defecto desde la recepción hasta hoy).",
          "Presiona Aplicar recálculo y confirma.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿Por qué el costo promedio no cambia exactamente al nuevo costo final del lote?",
        respuesta:
          "Porque el costo promedio mezcla todos los lotes en stock. Se aplica solo la diferencia del lote proporcional al stock actual, para no borrar el costo de la mercancía de otras compras.",
      },
      {
        pregunta: "¿Qué pasa si el producto ya no tiene stock?",
        respuesta:
          "Sin stock no hay ajuste del costo actual hacia adelante; el costo final de la línea y el kardex sí se actualizan. Si activas el recálculo de ventas, el CMV histórico del rango sí se corrige.",
      },
      {
        pregunta: "¿Queda registro del cambio?",
        respuesta:
          "Sí. Cada ajuste de costo por producto queda en la bitácora de ajustes de costo, con el motivo «Recálculo recepción #<número>».",
      },
    ],
    keywords: ["recalcular", "recepcion", "importacion", "prorrateo", "costos fijos", "flete", "aduana", "costo lote", "delta", "tasa cambio"],
  },
]
