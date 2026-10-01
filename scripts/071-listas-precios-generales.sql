-- =========================================================================
-- 071 - Listas de precios GENERALES por fecha (vigencia)
-- =========================================================================
-- Extiende el modelo del script 042 para permitir "listas generales por fecha":
-- listas que NO se asignan a un cliente, sino que aplican a TODOS los productos
-- dentro de un rango de fechas (promociones/temporadas). Tienen PRIORIDAD sobre
-- la lista del cliente mientras están vigentes.
--
-- ADITIVO: solo columnas NULLABLE sobre `listas_precios`, sin default ni
-- constraints → operación instantánea que NO reescribe filas.
--   - es_general   : true = lista general por fecha (no se asigna a cliente).
--                    null/false = lista normal por cliente (comportamiento actual).
--   - vigente_desde: fecha de inicio de vigencia (inclusive). null = sin cota inferior.
--   - vigente_hasta: fecha de fin de vigencia (inclusive). null = sin cota superior.
-- El tipo ('porcentaje' | 'individual') y el detalle por producto se reutilizan
-- tal cual del script 042 (una general puede ser % o precios por producto).
-- Ejecutar en el SQL editor de Supabase (service role).
-- =========================================================================

ALTER TABLE public.listas_precios
  ADD COLUMN IF NOT EXISTS es_general boolean;

ALTER TABLE public.listas_precios
  ADD COLUMN IF NOT EXISTS vigente_desde date;

ALTER TABLE public.listas_precios
  ADD COLUMN IF NOT EXISTS vigente_hasta date;
