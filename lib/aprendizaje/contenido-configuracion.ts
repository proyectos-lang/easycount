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
    modulo: "Listas de Precios",
    titulo: "Listas de Precios",
    descripcion:
      "Precios especiales por cliente: listas por porcentaje (aplican a todo el catálogo) o individuales (precio producto por producto).",
    queHace: [
      "Crea listas de dos tipos: 'Porcentaje general' (un % de DESCUENTO que se aplica sobre el precio del maestro en todos los productos) o 'Individual' (defines un precio específico por producto).",
      "En las de porcentaje, el valor siempre baja el precio (ej. 5 = 5% de descuento).",
      "En las individuales, cada producto sin precio definido usa el precio del maestro.",
      "Las listas se asignan a los clientes desde el módulo Clientes. Un cliente sin lista usa el precio normal del maestro de productos.",
      "En Nueva Venta, al elegir un cliente con lista, el catálogo muestra el precio base tachado y al lado el precio final de la lista; ese precio final es el que entra a la venta.",
      "Este módulo lo habilita el super-admin por empresa; si no lo ves, tu empresa no lo tiene activo.",
    ],
    queNoHace: [
      "No cambia el precio del maestro de productos: la lista es un precio alterno por cliente.",
      "No aplica una lista a una venta si el cliente no la tiene asignada (usa el precio normal).",
    ],
    operaciones: [
      {
        titulo: "Crear una lista por porcentaje",
        pasos: [
          "Abre Configuración → Listas de Precios y presiona 'Nueva lista'.",
          "Nombre (ej. Mayoristas), tipo 'Porcentaje general' y el porcentaje de descuento (ej. 5 = 5% menos).",
          "Guarda: ese descuento se aplicará sobre el precio de todos los productos para los clientes con esa lista.",
        ],
      },
      {
        titulo: "Crear una lista individual (precio por producto)",
        pasos: [
          "Nueva lista → tipo 'Individual' → Guardar.",
          "En la fila de la lista presiona el ícono de precios y escribe el precio de cada producto (los vacíos usan el precio del maestro).",
        ],
      },
      {
        titulo: "Asignar la lista a un cliente",
        pasos: [
          "Abre Configuración → Clientes y edita el cliente.",
          "Elige la lista de precios en el campo correspondiente (o 'Precio normal' para quitarla).",
          "En Nueva Venta, al seleccionar ese cliente, verás el precio base tachado y el precio de la lista.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿No me aparece el módulo Listas de Precios?",
        respuesta:
          "Es una función que el super-admin habilita por empresa. Si no aparece en Configuración, tu empresa aún no lo tiene activo.",
      },
    ],
    keywords: ["lista de precios", "precio por cliente", "mayorista", "descuento", "recargo", "porcentaje", "precio especial", "tarifa"],
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
      "Opción 'Este producto tiene tallas' (al crear, solo si tu empresa tiene activado el sistema de tallas): con el botón 'Agregar talla' añades una línea por cada talla y escribes la talla y su cantidad inicial propia. El precio de venta y el costo son únicos (los del formulario) para todas las tallas. Al guardar se crea un producto independiente por cada talla —mismo nombre + talla, su propio stock y código— en un solo guardado, y quedan agrupados. La talla se muestra en el catálogo de Nueva Venta.",
      "Los productos tallados se AGRUPAN en la lista: la prenda aparece una sola vez con un contador de tallas y un botón para desplegar/contraer sus tallas (cada una con su stock y precio). El mismo agrupamiento se ve en Inventario → Valoración (stock y valor sumados del grupo).",
      "Editar grupo de tallas: en la fila del grupo, el botón de editar abre un panel con todas sus tallas para cambiar el precio de cada una, quitar una talla del grupo o agregar tallas nuevas (crea el producto hermano, con cantidad inicial opcional).",
      "Carga masiva desde Excel: descarga una plantilla, complétala con tus productos (código, nombre, categoría, marca, precio, costo y cantidad inicial) y súbela eligiendo el almacén y la bodega; el sistema crea todos los productos y genera su inventario inicial de una sola vez.",
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
        titulo: "Crear un producto con varias tallas de una vez",
        pasos: [
          "En Nuevo Producto, llena los datos comunes (nombre, precio de venta, costo, marca, categoría, código de barras) una sola vez. El precio y el costo serán iguales para todas las tallas.",
          "Marca la casilla 'Este producto tiene tallas'.",
          "Presiona 'Agregar talla' para añadir una línea; escribe (o elige de la lista) la talla y su cantidad inicial. Repite por cada talla que manejes.",
          "En 'Inventario inicial' elige el almacén y la localización donde entrarán esas cantidades (comunes a todas las tallas) y confirma el costo único.",
          "Guarda: el sistema crea un producto por cada talla (mismo nombre + talla, código base con la talla al final) con su cantidad, sin que repitas el formulario, y los deja agrupados como una sola prenda.",
          "En Nueva Venta cada talla aparece como su propia tarjeta con la talla visible; edita cada una por separado si necesitas ajustar precio o stock.",
        ],
      },
      {
        titulo: "Ver y editar las tallas de una prenda (grupo de tallas)",
        pasos: [
          "En la lista de Productos, la prenda tallada aparece una sola vez con el conteo de tallas; toca el nombre (o la flecha) para desplegar y ver cada talla con su stock y precio.",
          "Presiona el botón de editar del grupo para abrir el panel de tallas.",
          "Ahí puedes cambiar el precio de cada talla (edita y presiona Guardar en esa fila), quitar una talla del grupo, o Agregar una talla nueva.",
          "Al agregar una talla escribe su nombre (ej. XL, 42) y, si quieres, una cantidad inicial con su almacén y localización; se crea el producto hermano y queda dentro del grupo.",
          "El mismo agrupamiento se ve en Inventario → Valoración: la prenda aparece una vez con el stock y el valor sumados, y al desplegar muestra cada talla.",
        ],
      },
      {
        titulo: "Carga masiva de productos (Excel)",
        pasos: [
          "En Configuración → Productos, presiona 'Carga masiva'.",
          "Descarga la plantilla y complétala: código de barras, nombre, categoría, marca, talla, precio de venta, costo unitario y cantidad inicial (una fila por producto). Las columnas Categoría y Marca traen una lista desplegable con los valores registrados de tu empresa (podés elegir o escribir uno nuevo). Además hay una segunda hoja «Referencias» con las categorías, marcas, subcategorías, almacenes y bodegas actuales, para usar los nombres exactos.",
          "Elige el almacén y la bodega donde entrará el inventario inicial (solo se usan para las filas con cantidad mayor a 0).",
          "Sube el archivo: verás un resumen (nuevos, unidades, valor del inventario) y avisos (categorías/marcas sin coincidencia).",
          "Un producto se considera repetido cuando coincide el CÓDIGO de barras (la clave única). Si la fila no trae código, se usa el nombre como respaldo. Un mismo nombre con distinto código se toma como producto nuevo.",
          "Si algún producto del archivo YA existe, el sistema pregunta: «Este producto ya existe, ¿deseas generar el ingreso de inventario?». Activa el interruptor para sumar sus cantidades a las existencias del producto existente, o déjalo apagado para omitirlos.",
          "Presiona 'Cargar': se crean los productos nuevos con su ingreso inicial y, si lo elegiste, se generan ingresos a los que ya existían.",
        ],
      },
      {
        titulo: "Organizar marcas y categorías",
        pasos: [
          "Usa el botón de gestión de marcas/categorías dentro del módulo.",
          "Crea las categorías y subcategorías que reflejen tu negocio (facilitan filtrar y analizar ventas).",
          "Sugerencia: crea las categorías y marcas ANTES de la carga masiva para que se asocien por nombre; si no existen, el producto se crea igual pero sin ese dato.",
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
      {
        pregunta: "Vendo la misma prenda en varias tallas, ¿tengo que crear el producto una y otra vez?",
        respuesta:
          "No, si tu empresa tiene activado el sistema de tallas (se habilita por empresa desde el panel de administración). Al crear el producto marca 'Este producto tiene tallas', elige las tallas y guarda una sola vez: el sistema crea un producto por cada talla (con su propio stock, código y precio) y los deja agrupados. En la lista de Productos y en Inventario → Valoración la prenda aparece una sola vez y se despliega para ver cada talla; el botón de editar del grupo permite cambiar precios, quitar tallas o agregar nuevas. En Nueva Venta cada talla se ve por separado con su etiqueta. Si tu empresa no maneja tallas, no verás nada de esto.",
      },
    ],
    keywords: ["producto", "codigo de barras", "sku", "precio", "marca", "categoria", "talla", "tallas", "variantes", "grupo", "agrupar", "desplegar", "foto", "catalogo", "eliminar", "borrar", "cascada", "comprimir fotos", "imagen pesada", "resolucion", "carga lenta", "carga masiva", "importar productos", "plantilla", "excel", "masivo", "inventario inicial"],
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
      "Marca una localización como 'Punto de venta' (ícono de tienda): esa se preselecciona automáticamente (almacén + localización) al abrir Nueva Venta. Solo puede haber un punto de venta por empresa; al marcar otro se cambia.",
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
    keywords: ["bodega", "sucursal", "estante", "ubicacion", "localizacion", "punto de venta", "pos", "preseleccionar"],
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
