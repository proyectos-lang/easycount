-- =========================================================================
-- 065 - Número de factura del proveedor en compras
-- =========================================================================
-- Guarda el número de la factura del proveedor en cada compra (recepción por
-- factura). Antes las recepciones por factura ni siquiera creaban una fila real
-- en `compras_encabezado`; ahora sí (createCompra), y esta columna guarda el
-- número impreso en la factura del proveedor, para el historial y el kardex.
--
-- ADITIVO: `ADD COLUMN IF NOT EXISTS` sobre `compras_encabezado` (nullable, sin
-- default ni constraints -> instantáneo, no reescribe filas). La RLS de
-- `compras_encabezado` ya cubre la columna. No requiere otros scripts.
-- =========================================================================

ALTER TABLE public.compras_encabezado
  ADD COLUMN IF NOT EXISTS numero_factura text;
