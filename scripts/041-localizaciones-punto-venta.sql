-- =========================================================================
-- 041 - Localizaciones: marcar una como "Punto de venta" (default en ventas)
-- =========================================================================
-- ADITIVO: crea 1 tabla nueva + su RLS. No toca `localizaciones` (no ALTER).
--
-- Config por localizacion. Hoy solo `es_punto_venta`: la localizacion marcada
-- se preselecciona automaticamente en Nueva Venta (almacen + localizacion).
-- A diferencia de `razon_social_config` (solo el portal escribe), aqui el
-- admin de la empresa SI administra: lee y escribe su propia config.
--
-- Requiere el script 017 (funcion app_current_tenant).
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.localizaciones_config (
  localizacion_id  INTEGER PRIMARY KEY REFERENCES public.localizaciones(id) ON DELETE CASCADE,
  razon_social_id  INTEGER NOT NULL REFERENCES public.razon_social(id) ON DELETE CASCADE,
  es_punto_venta   BOOLEAN NOT NULL DEFAULT false,
  usuario          TEXT,
  updated_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_localizaciones_config_razon
  ON public.localizaciones_config(razon_social_id);

ALTER TABLE public.localizaciones_config ENABLE ROW LEVEL SECURITY;

-- Cada empresa lee y administra SOLO sus filas (aislamiento por tenant).
DROP POLICY IF EXISTS localizaciones_config_select ON public.localizaciones_config;
CREATE POLICY localizaciones_config_select ON public.localizaciones_config
  FOR SELECT TO authenticated
  USING (razon_social_id = public.app_current_tenant());

DROP POLICY IF EXISTS localizaciones_config_insert ON public.localizaciones_config;
CREATE POLICY localizaciones_config_insert ON public.localizaciones_config
  FOR INSERT TO authenticated
  WITH CHECK (razon_social_id = public.app_current_tenant());

DROP POLICY IF EXISTS localizaciones_config_update ON public.localizaciones_config;
CREATE POLICY localizaciones_config_update ON public.localizaciones_config
  FOR UPDATE TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

DROP POLICY IF EXISTS localizaciones_config_delete ON public.localizaciones_config;
CREATE POLICY localizaciones_config_delete ON public.localizaciones_config
  FOR DELETE TO authenticated
  USING (razon_social_id = public.app_current_tenant());
