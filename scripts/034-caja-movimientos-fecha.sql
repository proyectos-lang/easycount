-- ============================================================================
-- 034: caja_chica_movimientos.fecha (alinea la BD con el codigo)
-- ============================================================================
-- La app asume una columna `fecha` timestamptz en caja_chica_movimientos
-- (definida en scripts/011 y usada por registrarMovimientoCaja, el cierre de
-- caja y getFlujoCajaMensual). Algunas bases se crearon SIN ella, lo que:
--   * rompe los inserts de movimientos de efectivo del POS
--     ("column fecha of relation caja_chica_movimientos does not exist"), y
--   * hace que el Flujo de Caja IGNORE EN SILENCIO los movimientos de caja
--     (getFlujoCajaMensual selecciona `fecha`, la consulta falla y el codigo
--     no chequea el error -> caja aporta 0 al flujo).
--
-- Fix ADITIVO e idempotente (mismo patron ADD COLUMN que scripts/033):
--   1. agrega la columna (nullable, sin default -> las filas existentes quedan
--      NULL, no se rellenan con now()),
--   2. backfillea el valor historico correcto (= created_at),
--   3. pone DEFAULT now() para inserts futuros que omitan `fecha`
--      (ej. el movimiento de Apertura).
-- ============================================================================

ALTER TABLE public.caja_chica_movimientos
  ADD COLUMN IF NOT EXISTS fecha timestamptz;

UPDATE public.caja_chica_movimientos
  SET fecha = created_at
  WHERE fecha IS NULL;

ALTER TABLE public.caja_chica_movimientos
  ALTER COLUMN fecha SET DEFAULT now();
