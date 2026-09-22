-- =========================================================================
-- 067 - Vistas de agregación para la Valoración de Inventario
-- =========================================================================
-- Hoy `getValoracionInventarioExtendida` trae TODAS las filas de
-- `transacciones_inventario` al navegador y hace un bucle O(productos ×
-- transacciones) en JS para calcular (a) el stock por almacén y (b) la última
-- venta por producto. Estas dos vistas hacen ESE MISMO cálculo en la base con
-- GROUP BY, para que el servicio lea el resultado ya agregado.
--
-- No cambian datos ni resultados: devuelven exactamente las mismas sumas/máximos
-- que el JS actual. El servicio las usa con FALLBACK: si una vista no existe,
-- cae al cálculo actual (nada se rompe si no corres este script).
--
-- SEGURIDAD (multi-tenant): las vistas NO exponen datos de otros tenants porque
-- consultan tablas con RLS y se crean con `security_invoker = true` (Postgres 15+),
-- de modo que la RLS de `transacciones_inventario` se aplica con los permisos del
-- usuario que consulta, no del creador de la vista. El servicio además filtra por
-- los ids de producto del tenant.
--
-- ADITIVO: solo CREATE VIEW. No toca tablas ni datos.
-- =========================================================================

-- Stock por (producto, almacén) = SUMA de la cantidad (con signo) del kardex.
-- Coincide con: transacciones.filter(prod==p && alm==a).reduce(+cantidad).
CREATE OR REPLACE VIEW public.vista_stock_producto_almacen
  WITH (security_invoker = true) AS
SELECT
  razon_social_id,
  producto_id,
  almacen_id,
  SUM(COALESCE(cantidad, 0))::numeric AS stock
FROM public.transacciones_inventario
GROUP BY razon_social_id, producto_id, almacen_id;

-- Última venta por producto = MAX(fecha) de los movimientos 'Salida Venta'.
-- Coincide con: transacciones.filter(prod==p && tipo=='Salida Venta') -> max fecha.
CREATE OR REPLACE VIEW public.vista_ultima_venta_producto
  WITH (security_invoker = true) AS
SELECT
  razon_social_id,
  producto_id,
  MAX(fecha) AS ultima_venta
FROM public.transacciones_inventario
WHERE tipo_movimiento = 'Salida Venta'
GROUP BY razon_social_id, producto_id;

GRANT SELECT ON public.vista_stock_producto_almacen  TO authenticated;
GRANT SELECT ON public.vista_ultima_venta_producto   TO authenticated;
