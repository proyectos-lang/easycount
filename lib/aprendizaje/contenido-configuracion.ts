import type { TutorialModulo } from "./types"

export const TUTORIALES_CONFIGURACION: TutorialModulo[] = [
  {
    modulo: "Razon Social",
    titulo: "Razón Social (datos de la empresa)",
    descripcion:
      "Los datos de tu empresa: nombre, RTN, contacto y logo, que aparecen en las facturas y documentos PDF.",
    queHace: [
      "Edita nombre legal, nombre comercial, RTN, correo, teléfono y dirección de la empresa.",
      "Sube o cambia el logo (aparece en facturas y órdenes de compra en PDF).",
      "Los cambios se reflejan en los documentos generados a partir de ese momento.",
    ],
    queNoHace: [
      "No crea empresas nuevas: cada usuario pertenece a una empresa ya definida.",
      "No re-genera PDFs pasados: los documentos ya emitidos conservan los datos con que se crearon.",
    ],
    operaciones: [
      {
        titulo: "Actualizar los datos y el logo",
        pasos: [
          "Abre Configuración → Razón Social.",
          "Edita los campos necesarios (RTN, dirección, teléfono…).",
          "Para el logo, sube una imagen JPG/PNG (idealmente cuadrada y liviana).",
          "Guarda y genera un PDF de prueba (Preview PDFs) para verificar cómo se ve.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "Subí el logo y no aparece en la factura.",
        respuesta:
          "Verifica que la imagen se guardó (recarga la página). Si persiste, puede ser un formato no soportado: usa JPG o PNG.",
      },
    ],
    keywords: ["empresa", "rtn", "logo", "datos fiscales", "membrete"],
  },
  {
    modulo: "Usuarios y Permisos",
    titulo: "Usuarios y Permisos",
    descripcion:
      "Crear usuarios de tu empresa, asignarles rol (admin o usuario) y decidir exactamente qué módulos puede ver cada uno.",
    queHace: [
      "Crea usuarios con correo y contraseña (quedan listos para entrar, sin verificación por correo).",
      "Dos roles: admin (ve y puede todo) y usuario (solo los módulos permitidos).",
      "Permisos granulares: activa o desactiva cada módulo por usuario; el menú lateral de esa persona se ajusta solo.",
      "Restablece contraseñas y desactiva usuarios (sin borrarlos, conservando su historial).",
    ],
    queNoHace: [
      "Solo los administradores pueden usar este módulo (aunque otro usuario tuviera el permiso, el servidor rechaza la operación).",
      "No permite que un usuario vea datos de otra empresa: el aislamiento es total e independiente de los permisos.",
      "No elimina usuarios definitivamente: se desactivan para conservar la auditoría de lo que registraron.",
    ],
    operaciones: [
      {
        titulo: "Crear un usuario nuevo",
        pasos: [
          "Abre Configuración → Usuarios y Permisos (como admin).",
          "Presiona Nuevo Usuario: nombre, correo, contraseña y rol.",
          "Guarda: el usuario ya puede iniciar sesión.",
          "Asigna sus módulos en la sección de permisos (por defecto un usuario nuevo sin configurar ve todo — configúralo de una vez).",
        ],
      },
      {
        titulo: "Dar o quitar acceso a un módulo",
        pasos: [
          "Selecciona el usuario en la lista.",
          "Activa o desactiva el interruptor del módulo (ej. quitar 'Estado de Resultados' a un cajero).",
          "El cambio aplica en el próximo inicio de sesión o recarga del usuario.",
        ],
      },
      {
        titulo: "Restablecer una contraseña",
        pasos: [
          "Selecciona el usuario y usa la opción de restablecer contraseña.",
          "Define la nueva contraseña temporal y comunícasela por un medio seguro.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "Un usuario no ve un módulo que necesita.",
        respuesta:
          "Activa el permiso de ese módulo en su ficha. Si aún no lo ve, que cierre sesión y vuelva a entrar.",
      },
      {
        pregunta: "¿Qué diferencia hay entre desactivar y borrar?",
        respuesta:
          "Desactivar impide el acceso pero conserva el historial de todo lo que esa persona registró. Por auditoría, la app no borra usuarios.",
      },
    ],
    keywords: ["crear usuario", "contraseña", "rol", "admin", "acceso", "permisos", "desactivar"],
  },
  {
    modulo: "Productos",
    titulo: "Catálogo de Productos",
    descripcion:
      "El catálogo maestro: productos con código de barras, marca, categoría, foto, costo promedio y precio de venta sugerido.",
    queHace: [
      "Crea y edita productos: nombre, código de barras, marca, categoría/subcategoría, foto y precio de venta sugerido.",
      "Gestiona marcas, categorías y subcategorías desde el mismo módulo.",
      "Muestra el stock total y el costo promedio actuales (informativos).",
      "La foto se sube al almacenamiento de la nube y aparece en el catálogo de Nueva Venta. Las fotos grandes (de celular) se comprimen automáticamente al subir para que carguen rápido.",
      "Botón 'Comprimir fotos': optimiza de una sola vez el peso de las fotos ya subidas de la empresa (baja la resolución sin borrar ni cambiar los productos). Útil si el catálogo carga lento por fotos de muy alta resolución.",
      "Al crear un producto puedes indicar una cantidad inicial (con su costo, almacén y localización): el sistema genera automáticamente un ingreso manual al inventario para que arranque con existencias.",
      "Elimina productos: si solo tiene movimientos de inventario, se borran en cascada junto con el producto (te avisa cuántos); si tiene ventas o compras registradas, no se borra para proteger el historial.",
    ],
    queNoHace: [
      "No modifica stock ni costo promedio a mano: esos los gobiernan las compras, ventas y ajustes de inventario.",
      "El 'precio de venta sugerido' es una referencia: en Nueva Venta se puede ajustar el precio por línea.",
      "No borra un producto con ventas o compras registradas (protege la trazabilidad financiera).",
    ],
    operaciones: [
      {
        titulo: "Crear un producto (con inventario inicial opcional)",
        pasos: [
          "Abre Configuración → Productos y presiona Nuevo Producto.",
          "Nombre, código de barras (puedes escanearlo), marca y categoría.",
          "Define el precio de venta sugerido y sube la foto si la tienes.",
          "En 'Inventario inicial (opcional)' indica la cantidad y el costo unitario con que arranca; elige almacén y localización.",
          "Guarda: se crea el producto y, si pusiste cantidad, se genera el ingreso al inventario automáticamente. Déjalo en 0 si aún no tienes existencias (las cargas luego por Compras o Ingreso Manual).",
        ],
      },
      {
        titulo: "Organizar marcas y categorías",
        pasos: [
          "Usa el botón de gestión de marcas/categorías dentro del módulo.",
          "Crea las categorías y subcategorías que reflejen tu negocio (facilitan filtrar y analizar ventas).",
        ],
      },
      {
        titulo: "Eliminar un producto",
        pasos: [
          "Presiona el ícono de basura en la fila del producto.",
          "Si el producto tiene ventas o compras registradas, el sistema NO lo borra y te lo indica (protege el historial).",
          "Si solo tiene movimientos de inventario (ingresos, ajustes, traslados), te avisa cuántos se eliminarán y, al confirmar, borra el producto junto con esos movimientos.",
          "Si no tiene ningún movimiento, se borra directo tras confirmar.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿Por qué no puedo editar el stock aquí?",
        respuesta:
          "El stock es el resultado del kardex (compras − ventas ± ajustes). Editarlo a mano rompería la trazabilidad. Al CREAR el producto sí puedes poner una cantidad inicial (genera un ingreso trazable); después los cambios se hacen por Compras o Inventario → Ingreso Manual.",
      },
      {
        pregunta: "¿Por qué no me deja borrar un producto?",
        respuesta:
          "Porque tiene ventas o compras registradas. Para no perder la trazabilidad de esos documentos, un producto con historial de ventas o compras no se elimina. Si solo tiene movimientos de inventario, sí se puede borrar y esos movimientos se eliminan en cascada con él.",
      },
    ],
    keywords: ["producto", "codigo de barras", "sku", "precio", "marca", "categoria", "foto", "catalogo", "eliminar", "borrar", "cascada", "comprimir fotos", "imagen pesada", "resolucion", "carga lenta"],
  },
  {
    modulo: "Almacenes",
    titulo: "Almacenes y Localizaciones",
    descripcion:
      "Definir tus bodegas (almacenes) y las localizaciones internas donde se guarda la mercancía.",
    queHace: [
      "Crea almacenes con nombre y ubicación (ej. Tienda Centro, Bodega Principal).",
      "Dentro de cada almacén, crea localizaciones (ej. Estante A, Vitrina).",
      "El inventario se controla por almacén + localización: ventas, recepciones y traslados exigen indicar ambos.",
    ],
    queNoHace: [
      "No elimina almacenes con movimientos de inventario asociados (perderías la trazabilidad).",
      "No mueve mercancía: para eso está Inventario → Traslados.",
    ],
    operaciones: [
      {
        titulo: "Configurar la estructura de bodegas",
        pasos: [
          "Abre Configuración → Almacenes.",
          "Crea cada almacén físico de tu negocio.",
          "Selecciona un almacén y agrega sus localizaciones internas.",
          "Como mínimo crea un almacén con una localización general para poder operar.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿Necesito localizaciones si mi bodega es pequeña?",
        respuesta:
          "Sí, al menos una genérica (ej. 'General'): el sistema siempre registra los movimientos con almacén y localización.",
      },
    ],
    keywords: ["bodega", "sucursal", "estante", "ubicacion", "localizacion"],
  },
  {
    modulo: "Clientes",
    titulo: "Clientes",
    descripcion:
      "El directorio de clientes: datos de contacto, RTN para factura y fecha de nacimiento para felicitarlos.",
    queHace: [
      "Crea y edita clientes: nombre, RTN, teléfono, dirección y fecha de nacimiento.",
      "El RTN aparece en la factura del cliente.",
      "La fecha de nacimiento alimenta las alertas de cumpleaños.",
      "Los clientes se eligen en Nueva Venta y alimentan el ranking del Dashboard de Ventas.",
    ],
    queNoHace: [
      "No controla límites de crédito ni bloquea clientes morosos (la cartera se ve en Cuentas por Cobrar).",
    ],
    operaciones: [
      {
        titulo: "Registrar un cliente",
        pasos: [
          "Abre Configuración → Clientes y presiona Nuevo Cliente.",
          "Nombre (obligatorio), RTN si pedirá factura con datos fiscales, teléfono y dirección.",
          "Agrega la fecha de nacimiento si quieres la alerta de cumpleaños.",
          "Guarda. También puedes crear clientes al vuelo desde Nueva Venta.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿Puedo vender sin registrar al cliente?",
        respuesta:
          "Crea un cliente genérico (ej. 'Consumidor Final') para ventas de mostrador, y registra con datos reales a quienes pidan factura o compren al crédito.",
      },
    ],
    keywords: ["cliente", "rtn", "cumpleaños", "directorio", "contacto"],
  },
  {
    modulo: "Proveedores",
    titulo: "Proveedores",
    descripcion: "El directorio de proveedores para órdenes de compra y gastos.",
    queHace: [
      "Crea y edita proveedores: nombre, RTN y datos de contacto.",
      "Se eligen al crear órdenes de compra y al registrar gastos/facturas por pagar.",
    ],
    queNoHace: [
      "No lleva estado de cuenta del proveedor — el saldo por pagar vive en Finanzas → Gastos (Cuentas por Pagar).",
    ],
    operaciones: [
      {
        titulo: "Registrar un proveedor",
        pasos: [
          "Abre Configuración → Proveedores y presiona Nuevo Proveedor.",
          "Nombre, RTN y contacto (teléfono/correo del vendedor).",
          "Guarda: ya aparece disponible en Compras y en Gastos.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿Cuánto le debo a un proveedor?",
        respuesta:
          "Revisa Finanzas → Gastos, vista de Cuentas por Pagar: ahí están las facturas pendientes por proveedor con su saldo y vencimiento.",
      },
    ],
    keywords: ["proveedor", "suplidor", "compras", "contacto"],
  },
  {
    modulo: "Cuentas Bancarias",
    titulo: "Cuentas Bancarias",
    descripcion:
      "Configurar tus cuentas de banco y links de pago, con su % de comisión y saldo inicial.",
    queHace: [
      "Crea cuentas de tipo Banco, Link de Pago u Otro.",
      "Define el % de comisión que cobra el banco/pasarela: se aplica automáticamente en las ventas con tarjeta (bruto vs. neto).",
      "Permite establecer un saldo inicial al crear la cuenta (queda registrado como movimiento de apertura).",
      "Activa/desactiva cuentas: solo las activas aparecen al cobrar en Nueva Venta.",
      "El saldo de cada cuenta se actualiza solo con cada venta, gasto, transferencia o movimiento manual.",
      "Botón de reconciliación (ícono de flechas circulares): recalcula el saldo desde la suma real de los movimientos y corrige cualquier descuadre del cache.",
    ],
    queNoHace: [
      "No se puede eliminar una cuenta con movimientos (desactívala en su lugar).",
      "No edita el saldo directamente: el saldo lo gobiernan los movimientos (corrige con una entrada/salida manual).",
      "El saldo inicial solo se define al CREAR la cuenta, no al editarla.",
    ],
    operaciones: [
      {
        titulo: "Crear una cuenta bancaria con saldo inicial",
        pasos: [
          "Abre Configuración → Cuentas Bancarias y presiona Nueva Cuenta.",
          "Nombre (ej. 'BAC Empresarial'), tipo Banco y % de comisión si aplica a cobros con tarjeta.",
          "Ingresa el Saldo inicial con el que arranca la cuenta (o déjalo en 0).",
          "Guarda: el saldo inicial queda como un movimiento de apertura auditable.",
        ],
      },
      {
        titulo: "Configurar la comisión de una pasarela/tarjeta",
        pasos: [
          "Edita la cuenta y define el % de comisión (ej. 3.5).",
          "Desde entonces, cada venta cobrada a esa cuenta registra el bruto que paga el cliente y el neto que entra al banco.",
          "Las comisiones acumuladas aparecen como gasto financiero en el Estado de Resultados.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "Cambié la comisión, ¿afecta las ventas pasadas?",
        respuesta:
          "No. Cada venta guarda la comisión vigente al momento de cobrarse (snapshot). El cambio aplica solo a ventas futuras.",
      },
      {
        pregunta: "El saldo no cuadra con el banco.",
        respuesta:
          "Concíliala en Finanzas → Movimientos de Cuentas contra el estado de cuenta, y registra las diferencias (comisiones de manejo, intereses) como movimientos manuales.",
      },
    ],
    keywords: ["banco", "cuenta", "comision", "saldo inicial", "tarjeta", "pos", "link de pago"],
  },
  {
    modulo: "Preview PDFs",
    titulo: "Previsualización de PDFs",
    descripcion:
      "Ver cómo quedan los documentos PDF (facturas, órdenes) con los datos y logo de tu empresa, sin registrar operaciones reales.",
    queHace: [
      "Genera ejemplos de los PDFs que produce el sistema con datos de muestra.",
      "Sirve para revisar el logo, los datos de la razón social y el formato antes de emitir documentos reales.",
    ],
    queNoHace: [
      "No permite personalizar el diseño de los documentos (colores, columnas): el formato es fijo.",
      "No emite documentos válidos: son previsualizaciones con datos de prueba.",
    ],
    operaciones: [
      {
        titulo: "Verificar el formato de tus documentos",
        pasos: [
          "Configura primero Razón Social (datos y logo).",
          "Abre Configuración → Preview PDFs.",
          "Genera la previsualización del documento y revisa logo, RTN y dirección.",
          "Si algo está mal, corrígelo en Razón Social y vuelve a previsualizar.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿Puedo cambiar el diseño de la factura?",
        respuesta:
          "El formato es fijo por ahora. Lo que sí controlas son los datos y el logo desde Razón Social.",
      },
    ],
    keywords: ["pdf", "factura formato", "vista previa", "documento", "plantilla"],
  },
]
