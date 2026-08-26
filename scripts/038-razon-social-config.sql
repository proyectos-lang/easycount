-- =========================================================================
-- 038 - Configuracion por empresa (feature flags / mini-personalizaciones)
-- =========================================================================
-- ADITIVO: crea 1 tabla nueva + su RLS. No toca tablas existentes.
--
-- Modelo: un JSON de flags por empresa. Un solo codigo para todas; el
-- comportamiento por empresa lo gobiernan DATOS (esta tabla), no forks de
-- codigo. Los defaults viven en lib/constants/feature-flags.ts.
--
--   * LECTURA: cada empresa lee SU config (la app aplica sus flags).
--   * ESCRITURA: solo el service role (portal de super-admin). Los admins de
--     empresa NO cambian sus propios flags -> gobernanza centralizada.
--
-- Ejemplo de flag: { "ventas_mostrar_isv": false } oculta el ISV en Nueva Venta.
--
-- Requiere el script 017 (funcion app_current_tenant).
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.razon_social_config (
  razon_social_id  INTEGER PRIMARY KEY REFERENCES public.razon_social(id) ON DELETE CASCADE,
  config           JSONB NOT NULL DEFAULT '{}'::jsonb,
  usuario          TEXT,
  updated_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.razon_social_config ENABLE ROW LEVEL SECURITY;

-- Lectura: cada empresa ve SOLO su fila (para aplicar sus flags en la app).
DROP POLICY IF EXISTS razon_social_config_select ON public.razon_social_config;
CREATE POLICY razon_social_config_select ON public.razon_social_config
  FOR SELECT TO authenticated
  USING (razon_social_id = public.app_current_tenant());

-- Escritura: NO hay politica para authenticated -> solo el service role (portal)
-- puede insertar/actualizar/borrar. Asi los flags los administra el dueno de la
-- app, no cada empresa.
