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
      "Ingresa las unidades al almacén y localización que elijas.",
      "Recalcula el costo promedio ponderado del producto con el costo final de la compra.",
      "Deja rastro en el kardex como 'Entrada Compra' vinculada a la orden.",
      "Marca la orden como Recibida cuando se completa.",
    ],
    queNoHace: [
      "No crea órdenes (eso es Orden de Compra) ni recibe mercancía sin orden — para eso está Recepción por Factura o Ingreso Manual.",
      "No registra el pago al proveedor.",
    ],
    operaciones: [
      {
        titulo: "Recibir una orden completa",
        pasos: [
          "Abre Compras → Recepción por OC.",
          "Selecciona la orden pendiente.",
          "Elige el almacén y la localización donde entra la mercancía.",
          "Confirma las cantidades recibidas (por defecto, las ordenadas).",
          "Guarda: el stock sube, el costo promedio se actualiza y la orden queda Recibida.",
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
    keywords: ["recibir", "mercancia", "entrada", "costo promedio", "parcial", "almacen"],
  },
  {
    modulo: "Recepcion por Factura",
    titulo: "Recepción por Factura (con IA)",
    descripcion:
      "Subir la foto de una factura de proveedor: la inteligencia artificial extrae los productos y cantidades para ingresarlos al inventario sin digitar.",
    queHace: [
      "Acepta foto o PDF de la factura del proveedor.",
      "La IA (Gemini) lee la factura y extrae cada línea: nombre del producto, cantidad y costo unitario.",
      "Permite mapear cada línea extraída con un producto del catálogo (o crear el producto al vuelo).",
      "Ingresa el stock y actualiza el costo promedio, igual que una recepción normal.",
    ],
    queNoHace: [
      "No es infalible: la IA puede leer mal cantidades o precios en facturas borrosas — siempre revisa antes de confirmar.",
      "No asocia productos automáticamente: el mapeo línea → producto del catálogo lo confirmas tú.",
      "No registra el pago de la factura (usa Finanzas → Gastos).",
    ],
    operaciones: [
      {
        titulo: "Ingresar mercancía desde una foto de factura",
        pasos: [
          "Abre Compras → Recepción por Factura.",
          "Arrastra o sube la imagen/PDF de la factura (JPG, PNG o PDF).",
          "Presiona 'Procesar con IA' y espera unos segundos.",
          "Revisa las líneas extraídas: corrige cantidades o costos si la lectura falló.",
          "Asocia cada línea con su producto del catálogo (o créalo con el botón rápido).",
          "Elige almacén/localización y confirma el ingreso.",
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
    keywords: ["ia", "inteligencia artificial", "foto", "escanear", "gemini", "factura proveedor", "ocr"],
  },
]
