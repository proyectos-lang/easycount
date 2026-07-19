import type { TutorialModulo } from "./types"

export const TUTORIALES_DASHBOARD: TutorialModulo[] = [
  {
    modulo: "Dashboard",
    titulo: "Dashboard general",
    descripcion:
      "La pantalla de inicio: resumen del negocio con ventas, utilidad, alertas de stock y compras pendientes.",
    queHace: [
      "Muestra tarjetas con las métricas clave del negocio (ventas, utilidad, inventario).",
      "Gráficos de ventas por período para ver la tendencia.",
      "Alertas de productos con stock bajo, con enlace directo al catálogo de productos.",
      "Lista de órdenes de compra pendientes de recibir, con enlace a Recepción.",
      "Actividad reciente de la empresa.",
    ],
    queNoHace: [
      "No permite registrar operaciones: es solo de consulta. Para vender, comprar o mover inventario usa el módulo correspondiente.",
      "No muestra datos de otras empresas ni de módulos a los que no tienes permiso de entrar.",
    ],
    operaciones: [
      {
        titulo: "Revisar el estado del negocio al iniciar el día",
        pasos: [
          "Entra a la aplicación: el Dashboard es la primera pantalla.",
          "Revisa las tarjetas superiores: ventas y utilidad del período.",
          "Baja a 'Alertas de Stock': si un producto está en rojo, considera hacer una orden de compra.",
          "Revisa 'Compras Pendientes': si un proveedor ya entregó, ve a Compras → Recepción por OC para ingresar la mercancía.",
        ],
      },
    ],
    faqs: [
      {
        pregunta: "¿Cada cuánto se actualizan los números?",
        respuesta:
          "Cada vez que abres o recargas la página. Los datos se leen en vivo de la base de datos.",
      },
      {
        pregunta: "Un producto aparece en alerta de stock pero sí tengo unidades, ¿por qué?",
        respuesta:
          "El stock del sistema se alimenta de compras recibidas, ventas y ajustes. Si difiere de la realidad física, registra un ajuste en Inventario → Ingreso Manual para cuadrarlo.",
      },
    ],
    keywords: ["inicio", "resumen", "kpi", "metricas", "alertas", "panel"],
  },
]
