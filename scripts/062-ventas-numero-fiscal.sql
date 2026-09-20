-- =========================================================================
-- 062 - Número fiscal CAI en ventas (SAR Honduras) - FASE 2
-- =========================================================================
-- Guarda en la venta el número fiscal (CAI) emitido, SIN tocar el correlativo
-- interno `numero_factura` (FC-####), que sigue siendo el id que usan caja,
-- cierre, historial y devoluciones.
--
-- EXCEPCION A LA REGLA ADITIVA: por decisión explícita del dueño del proyecto,
-- este script AGREGA columnas a `ventas_encabezado` (tabla existente) en vez de
-- crear una tabla mapa. Se hace de la forma más segura posible:
--   - ADD COLUMN IF NOT EXISTS (idempotente, no falla si ya existen),
--   - columnas NULLABLE, SIN default y SIN constraints -> operacion instantanea,
--     no reescribe filas, no bloquea, no rompe inserts existentes.
--
--   numero_fiscal          -> correlativo fiscal completo 'ESTAB-PUNTO-TIPO-NNNNNNNN'
--   cai_emitido            -> el CAI vigente al momento de emitir (snapshot)
--   tipo_documento_fiscal  -> '01' Factura / '06' Nota Credito / '07' Nota Debito
--
-- La RLS de `ventas_encabezado` (script 017) sigue cubriendo estas columnas: no
-- se agrega politica nueva. Requiere el script 060 (config CAI) y 061 (RPC).
-- =========================================================================

ALTER TABLE public.ventas_encabezado
  ADD COLUMN IF NOT EXISTS numero_fiscal         text,
  ADD COLUMN IF NOT EXISTS cai_emitido           text,
  ADD COLUMN IF NOT EXISTS tipo_documento_fiscal text;
