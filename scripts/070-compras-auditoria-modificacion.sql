-- =========================================================================
-- 070 - compras_encabezado: auditoría de modificación (editar OC recibida)
-- =========================================================================
-- Permite editar una Orden de Compra DESPUÉS de recibida (proveedor, número de
-- factura, fecha tentativa, notas y el precio de venta de sus productos), SIN
-- tocar cantidad ni costo. Estas columnas guardan CUÁNDO y QUIÉN hizo la última
-- modificación, para dejar rastro.
--
-- ADITIVO: columnas NULLABLE, sin default ni constraints → operación
-- instantánea que NO reescribe filas. No toca datos ni otras columnas.
-- (También `notas` para observaciones de la OC, que hoy no existe.)
-- Ejecutar en el SQL editor de Supabase (service role).
-- =========================================================================

ALTER TABLE public.compras_encabezado
  ADD COLUMN IF NOT EXISTS notas text;

ALTER TABLE public.compras_encabezado
  ADD COLUMN IF NOT EXISTS modificado_en timestamptz;

ALTER TABLE public.compras_encabezado
  ADD COLUMN IF NOT EXISTS modificado_por text;
