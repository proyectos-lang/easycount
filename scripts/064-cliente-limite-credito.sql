-- =========================================================================
-- 064 - Límite de crédito por cliente
-- =========================================================================
-- Agrega el límite de crédito acumulado de cada cliente. Si es > 0, una venta a
-- crédito que haga que el saldo pendiente TOTAL del cliente supere este monto se
-- bloquea (en Nueva Venta) o se omite (en la carga masiva). 0 o NULL = sin
-- límite (crédito libre, comportamiento actual): los clientes existentes no se
-- ven afectados hasta que se les asigne un límite.
--
-- ADITIVO: `ADD COLUMN IF NOT EXISTS` sobre `clientes` (columna nullable, sin
-- default y sin constraints -> instantáneo, no reescribe filas). La RLS de
-- `clientes` (script 017) ya cubre la columna. No requiere otros scripts.
-- =========================================================================

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS limite_credito numeric(14,2);
