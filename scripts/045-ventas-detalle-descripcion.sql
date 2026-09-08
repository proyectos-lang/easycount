-- =========================================================================
-- 045 - Descripcion libre de lineas de venta (Venta Rapida)
-- =========================================================================
-- ADITIVO: crea 1 tabla mapa nueva + su RLS. NO toca `ventas_detalle`
-- (regla del proyecto: nunca ALTER/DROP sobre tablas existentes).
--
--   ventas_detalle_descripcion -> texto libre de una linea sin producto
--
-- La "Venta Rapida" agrega al carrito una linea con descripcion y precio a mano
-- (producto/servicio no catalogado) que NO afecta inventario. Esa linea se
-- guarda en `ventas_detalle` con producto_id NULL (la columna ya es nullable),
-- y su descripcion se guarda aqui para poder mostrarla luego en el historial
-- (donde el nombre normalmente viene por join a `productos`).
-- Requiere el script 017 (funcion app_current_tenant).
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.ventas_detalle_descripcion (
  detalle_id      bigint  PRIMARY KEY,
  razon_social_id bigint  NOT NULL,
  descripcion     text    NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ventas_detalle_descripcion ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ventas_detalle_descripcion_tenant ON public.ventas_detalle_descripcion;
CREATE POLICY ventas_detalle_descripcion_tenant ON public.ventas_detalle_descripcion
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());
