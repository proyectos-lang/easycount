import type { TutorialModulo } from "./types"

/**
 * Articulo de primeros pasos: como funciona la aplicacion en general.
 * Visible para TODOS los usuarios (no depende de permisos de modulo).
 */
export const TUTORIAL_GENERAL: TutorialModulo = {
  modulo: "general",
  titulo: "Primeros pasos en EasyCount",
  descripcion:
    "Qué es EasyCount, cómo entrar, cómo funcionan los permisos y cuál es el flujo de trabajo típico de un día.",
  queHace: [
    "EasyCount es un ERP / punto de venta multi-empresa: ventas, compras, inventario, finanzas y configuración en un solo lugar.",
    "Cada usuario pertenece a una empresa (razón social). Todo lo que registras queda marcado con tu empresa y tu nombre de usuario.",
    "Los datos de cada empresa están aislados: un usuario solo ve la información de SU empresa, nunca la de otras.",
    "El menú lateral muestra únicamente los módulos a los que tienes permiso. Un administrador los gestiona en Usuarios y Permisos.",
    "La aplicación funciona desde el navegador, en computadora o celular.",
  ],
  queNoHace: [
    "No funciona sin conexión a internet (los datos viven en la nube).",
    "No envía facturas electrónicas al fisco: genera PDFs de factura para imprimir o compartir.",
    "No permite que un usuario vea o edite datos de otra empresa.",
  ],
  operaciones: [
    {
      titulo: "Iniciar sesión",
      pasos: [
        "Abre la aplicación en el navegador y entra a la pantalla de Login.",
        "Escribe tu correo y contraseña (te los entrega el administrador).",
        "Si no recuerdas tu contraseña, pide al administrador que la restablezca desde Usuarios y Permisos.",
        "Al entrar verás el Dashboard con el resumen de tu empresa.",
      ],
    },
    {
      titulo: "Flujo típico de un día de operación",
      pasos: [
        "Abrir la caja chica con el efectivo inicial (Finanzas → Caja Chica).",
        "Registrar las ventas del día (Ventas → Nueva Venta). Las ventas en efectivo entran automáticamente a la caja; las de tarjeta/banco entran a la cuenta bancaria elegida.",
        "Registrar gastos o pagos a proveedores si los hay (Finanzas → Gastos).",
        "Al final del día, revisar el Cierre Diario (Finanzas → Cierre Diario): cuánto se vendió, cuánto entró por cada método de pago.",
        "Cerrar la caja chica contando el efectivo real; el sistema calcula la diferencia (faltante o sobrante).",
      ],
    },
    {
      titulo: "Instalar EasyCount como aplicación (computadora o celular)",
      pasos: [
        "Abre EasyCount en el navegador (Chrome, Edge o Safari).",
        "En computadora: busca el ícono de instalar en la barra de direcciones (un monitor con flecha) y presiona 'Instalar'.",
        "En Android: menú del navegador (⋮) → 'Agregar a pantalla principal' o 'Instalar aplicación'.",
        "En iPhone/iPad: botón Compartir en Safari → 'Agregar a pantalla de inicio'.",
        "Queda un acceso directo con el ícono de EasyCount que abre la app en su propia ventana.",
        "Las actualizaciones son automáticas: cada vez que se publica una mejora, la app la detecta y se recarga sola con la versión nueva.",
      ],
    },
    {
      titulo: "Buscar en toda la aplicación (Ctrl+K)",
      pasos: [
        "Presiona Ctrl+K (o Cmd+K en Mac), o toca el botón 'Buscar…' en la barra superior.",
        "Escribe el nombre de un módulo (ej. 'devoluciones') para saltar directo a él.",
        "O escribe un tema de ayuda (ej. 'cerrar caja') para ver los tutoriales relacionados del Centro de Aprendizaje.",
      ],
    },
    {
      titulo: "Entender el menú y los permisos",
      pasos: [
        "El menú lateral agrupa los módulos por categoría: Ventas, Compras, Inventario, Finanzas y Configuración.",
        "Si no ves un módulo que necesitas, pide a un administrador que te dé permiso en Configuración → Usuarios y Permisos.",
        "Los administradores ven todos los módulos siempre.",
        "Esta sección de Aprendizaje también se adapta: solo muestra los tutoriales de los módulos que puedes usar.",
      ],
    },
  ],
  faqs: [
    {
      pregunta: "¿Puedo usar la aplicación en el celular?",
      respuesta:
        "Sí. La interfaz es responsive: el menú se colapsa y las tablas se convierten en tarjetas. Todas las operaciones están disponibles.",
    },
    {
      pregunta: "Cambié algo por error, ¿se puede deshacer?",
      respuesta:
        "Depende del módulo. Las ventas pueden eliminarse por completo (revirtiendo inventario y dinero) o corregirse con una devolución parcial. Los movimientos de caja y banco no se borran: se corrigen registrando un movimiento contrario. Ante la duda, consulta el tutorial del módulo específico.",
    },
    {
      pregunta: "¿Por qué me sale 'Sesión inválida' al guardar?",
      respuesta:
        "Tu sesión expiró o tu usuario no tiene empresa asignada. Cierra sesión, vuelve a entrar, y si persiste pide al administrador verificar tu usuario en Usuarios y Permisos.",
    },
    {
      pregunta: "¿Quién ve lo que yo registro?",
      respuesta:
        "Los usuarios de tu misma empresa con permiso al módulo correspondiente. Cada registro guarda quién lo creó, para auditoría.",
    },
  ],
  keywords: [
    "inicio", "login", "empezar", "introduccion", "que es", "ayuda",
    "permisos", "empresa", "razon social", "flujo", "manual", "guia",
    "instalar", "app", "celular", "acceso directo", "buscar", "atajo",
  ],
}
