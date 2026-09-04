-- =========================================================================
-- Limpia los productos que la carga masiva creo MAL (sin codigo, precio/costo 0
-- y sin stock) por el desajuste de encabezados. Razon social 13 (Marena).
-- Borra SOLO cascarones vacios: sin codigo, stock 0 y SIN historial
-- (sin movimientos de inventario, sin ventas y sin compras) -> es seguro.
-- Ejecutar en el SQL editor de Supabase (service role).
-- =========================================================================

-- 1) PREVIEW: revisa que estos sean los productos a borrar ANTES de ejecutar el DELETE.
SELECT p.id, p.nombre, p.codigo_barras, p.stock_total, p.precio_venta_sugerido, p.costo_promedio
FROM public.productos p
WHERE p.razon_social_id = 13
  AND NULLIF(btrim(COALESCE(p.codigo_barras, '')), '') IS NULL   -- sin codigo
  AND COALESCE(p.stock_total, 0) = 0                              -- sin stock
  AND NOT EXISTS (SELECT 1 FROM public.transacciones_inventario t WHERE t.producto_id = p.id)
  AND NOT EXISTS (SELECT 1 FROM public.ventas_detalle v WHERE v.producto_id = p.id)
  AND NOT EXISTS (SELECT 1 FROM public.compras_detalle c WHERE c.producto_id = p.id)
ORDER BY p.id;

-- 2) DELETE: misma condicion. Corre esto solo si el preview de arriba es correcto.
DELETE FROM public.productos p
WHERE p.razon_social_id = 13
  AND NULLIF(btrim(COALESCE(p.codigo_barras, '')), '') IS NULL
  AND COALESCE(p.stock_total, 0) = 0
  AND NOT EXISTS (SELECT 1 FROM public.transacciones_inventario t WHERE t.producto_id = p.id)
  AND NOT EXISTS (SELECT 1 FROM public.ventas_detalle v WHERE v.producto_id = p.id)
  AND NOT EXISTS (SELECT 1 FROM public.compras_detalle c WHERE c.producto_id = p.id);
