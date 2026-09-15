-- =========================================================================
-- 054 - Produccion: Planeador (programacion de ordenes tipo Gantt de un dia)
-- =========================================================================
-- Agrega, de forma ADITIVA, lo necesario para programar las ordenes de
-- produccion en una linea de tiempo por dia:
--   * En `produccion_ordenes` (patron ADD COLUMN IF NOT EXISTS):
--       - fecha_programada  : dia en el que se planea correr la orden.
--       - inicio_min_dia    : hora de inicio como MINUTOS desde medianoche del
--                             dia (0..1439). Se guarda como entero para evitar
--                             enredos de zona horaria; la UI lo formatea a HH:MM.
--       - duracion_horas    : duracion estimada (editable). Si es NULL, la UI la
--                             calcula desde la receta (cantidad / estandar).
--   * Tabla nueva `produccion_jornadas`: horario laboral por DIA (una fila por
--       razon_social + fecha), tambien en minutos desde medianoche. Define el
--       rango visible del planeador (ej. 08:00-17:00 = 480..1020).
--
-- Solo ADD COLUMN IF NOT EXISTS y CREATE TABLE IF NOT EXISTS: idempotente y sin
-- perdida de datos. NO toca el resto del esquema. Requiere el script 048.
-- =========================================================================

-- 1) Campos de programacion en la orden.
ALTER TABLE public.produccion_ordenes
  ADD COLUMN IF NOT EXISTS fecha_programada date,
  ADD COLUMN IF NOT EXISTS inicio_min_dia   integer,        -- 0..1439 (minutos desde medianoche)
  ADD COLUMN IF NOT EXISTS duracion_horas   numeric(8,2);   -- NULL => la UI la calcula desde la receta

-- 2) Jornada laboral por dia (rango visible del planeador). Minutos desde
--    medianoche: hora_inicio_min / hora_fin_min. Una fila por (empresa, fecha).
CREATE TABLE IF NOT EXISTS public.produccion_jornadas (
  razon_social_id bigint  NOT NULL,
  fecha           date    NOT NULL,
  hora_inicio_min integer NOT NULL DEFAULT 480,   -- 08:00
  hora_fin_min    integer NOT NULL DEFAULT 1020,  -- 17:00
  usuario         text,
  updated_at      timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (razon_social_id, fecha)
);
ALTER TABLE public.produccion_jornadas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS produccion_jornadas_tenant ON public.produccion_jornadas;
CREATE POLICY produccion_jornadas_tenant ON public.produccion_jornadas
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- Indice para traer rapido las ordenes programadas de un dia.
CREATE INDEX IF NOT EXISTS idx_produccion_ordenes_fecha_prog
  ON public.produccion_ordenes (razon_social_id, fecha_programada);
