-- =========================================================================
-- 022 - Log de errores de la aplicacion (monitoreo)
-- =========================================================================
--
-- ADITIVO: solo CREATE TABLE de 1 tabla nueva. No altera nada existente.
--
-- La app reporta errores de runtime (excepciones no capturadas, promesas
-- rechazadas y errores de React) via POST /api/log-error, que inserta aqui
-- con service role. RLS queda ACTIVADO SIN POLICIES: ningun usuario de la
-- app puede leer/escribir la tabla directamente; se consulta desde el
-- panel de Supabase (Table Editor / SQL) o con service role.
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.errores_log (
  id               SERIAL PRIMARY KEY,
  -- Puede venir null (errores en paginas publicas sin sesion).
  razon_social_id  INTEGER REFERENCES public.razon_social(id) ON DELETE SET NULL,
  usuario          TEXT,
  mensaje          TEXT NOT NULL,
  stack            TEXT,
  url              TEXT,
  user_agent       TEXT,
  origen           TEXT,  -- 'window.onerror' | 'unhandledrejection' | 'react-boundary' | otro
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_errores_log_fecha
  ON public.errores_log(created_at DESC);

-- RLS activado sin policies: la tabla queda accesible SOLO via service role.
ALTER TABLE public.errores_log ENABLE ROW LEVEL SECURITY;
