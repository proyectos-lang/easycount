/**
 * Feature flags / mini-personalizaciones por empresa.
 *
 * Un solo codigo para todas las empresas; el comportamiento se ajusta por DATOS
 * (tabla `razon_social_config.config`, JSONB) — no por forks de codigo ni
 * `if (razon_social_id === X)`. Los defaults viven AQUI; la BD solo guarda los
 * flags que difieren del default para una empresa puntual.
 *
 * Para agregar un flag nuevo: agrega la propiedad + su default en DEFAULT_FLAGS
 * y leelo en `mergeFlags`. No requiere migracion (la columna es JSONB).
 */
export interface FeatureFlags {
  /** Muestra el campo/ISV (15%) en Nueva Venta. Si es false, la empresa vende sin ISV. */
  ventas_mostrar_isv: boolean
  /** Imprime el codigo del producto debajo de su nombre en la tirilla termica. */
  tirilla_mostrar_codigo: boolean
  /** Activa el lector de codigo de barras en Nueva Venta (escanear = ubicar/agregar). */
  ventas_lector_codigo_barras: boolean
  /**
   * Activa el sistema de productos por TALLA: el check "tiene tallas" al crear
   * producto, el agrupamiento de tallas en Productos e Inventario, y el editor
   * de grupo. Si es false, la empresa no ve nada del sistema de tallas.
   */
  productos_por_talla: boolean
  /**
   * Activa "Venta Rápida" en Nueva Venta: agregar al carrito una linea con
   * descripcion y precio escritos a mano (producto/servicio no catalogado),
   * SIN afectar inventario. Si es false, el boton no aparece.
   */
  venta_rapida: boolean
  /**
   * Activa "Facturación CAI" (facturas oficiales del SAR de Honduras). Cuando es
   * true, la empresa ve/usa el modulo "Facturación CAI" en Configuracion para
   * capturar CAI, rango autorizado, correlativo, punto de emision y fecha limite,
   * y (Fase 2) las facturas impresas (tirilla y carta) salen como comprobante
   * fiscal. Si es false, el modulo avisa "funcion no activada".
   */
  facturacion_cai: boolean
}

export const DEFAULT_FLAGS: FeatureFlags = {
  ventas_mostrar_isv: true,
  tirilla_mostrar_codigo: false,
  ventas_lector_codigo_barras: false,
  productos_por_talla: false,
  venta_rapida: false,
  facturacion_cai: false,
}

/** Etiquetas legibles para el portal (que flags se pueden togglear por empresa). */
export const FLAG_LABELS: Record<keyof FeatureFlags, string> = {
  ventas_mostrar_isv: "Mostrar ISV en ventas",
  tirilla_mostrar_codigo: "Mostrar codigo del producto en la tirilla",
  ventas_lector_codigo_barras: "Lector de codigo de barras en ventas",
  productos_por_talla: "Productos por talla (tallas agrupadas)",
  venta_rapida: "Venta rápida (linea manual sin inventario)",
  facturacion_cai: "Impresión de factura CAI (SAR Honduras)",
}

/**
 * Combina la config guardada (JSONB, puede ser parcial o null) con los defaults.
 * Ignora claves desconocidas y castea a boolean de forma segura.
 */
export function mergeFlags(config: Record<string, unknown> | null | undefined): FeatureFlags {
  const c = config ?? {}
  return {
    ventas_mostrar_isv:
      c.ventas_mostrar_isv === undefined
        ? DEFAULT_FLAGS.ventas_mostrar_isv
        : Boolean(c.ventas_mostrar_isv),
    tirilla_mostrar_codigo:
      c.tirilla_mostrar_codigo === undefined
        ? DEFAULT_FLAGS.tirilla_mostrar_codigo
        : Boolean(c.tirilla_mostrar_codigo),
    ventas_lector_codigo_barras:
      c.ventas_lector_codigo_barras === undefined
        ? DEFAULT_FLAGS.ventas_lector_codigo_barras
        : Boolean(c.ventas_lector_codigo_barras),
    productos_por_talla:
      c.productos_por_talla === undefined
        ? DEFAULT_FLAGS.productos_por_talla
        : Boolean(c.productos_por_talla),
    venta_rapida:
      c.venta_rapida === undefined
        ? DEFAULT_FLAGS.venta_rapida
        : Boolean(c.venta_rapida),
    facturacion_cai:
      c.facturacion_cai === undefined
        ? DEFAULT_FLAGS.facturacion_cai
        : Boolean(c.facturacion_cai),
  }
}
