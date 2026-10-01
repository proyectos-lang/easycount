-- =========================================================================
-- 069 - transacciones_inventario: columna `observaciones` (respaldo de salida)
-- =========================================================================
-- Para el Kardex / Historial de Transacciones: los movimientos que NO tienen
-- un documento asociado (Salida Manual, Ingreso Manual, Ajuste) quedaban sin
-- "Referencia" (un guión "—"). Esta columna guarda el motivo/respaldo que el
-- usuario escribe, para mostrarlo como referencia del movimiento.
--
-- ADITIVO: una sola columna NULLABLE, sin default ni constraints → operación
-- instantánea que NO reescribe filas. No toca datos ni otras columnas.
-- Ejecutar en el SQL editor de Supabase (service role).
-- =========================================================================

ALTER TABLE public.transacciones_inventario
  ADD COLUMN IF NOT EXISTS observaciones text;
