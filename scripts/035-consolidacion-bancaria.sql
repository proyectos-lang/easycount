-- =========================================================================
-- 035 - Consolidacion Bancaria (modulo de Finanzas)
-- =========================================================================
-- ESTRICTAMENTE ADITIVO: crea 1 tabla nueva, su politica RLS, e inserta 1 fila
-- en `modulos`. No hace ALTER ni toca ninguna tabla existente.
--
-- La consolidacion diaria se CALCULA en el servicio a partir de
-- `cuenta_movimientos` (no se persiste). Lo unico que se guarda aqui es el
-- override manual del "saldo de inicio del mes" por cuenta, que el admin puede
-- fijar cuando el saldo calculado no arranca donde debe (ej. no hay historico
-- de movimientos anteriores). Una fila por (cuenta, anio, mes).
--
-- Requiere que el script 017 (funcion app_current_tenant) ya este aplicado.
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.consolidacion_saldos_iniciales (
  id               SERIAL PRIMARY KEY,
  razon_social_id  INTEGER NOT NULL REFERENCES public.razon_social(id) ON DELETE CASCADE,
  cuenta_id        INTEGER NOT NULL REFERENCES public.cuentas_config(id) ON DELETE CASCADE,
  anio             INTEGER NOT NULL,
  mes              INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  saldo_inicial    NUMERIC(14,2) NOT NULL,
  usuario          TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ,
  -- Un unico override por cuenta / mes / empresa (permite el UPSERT del servicio).
  CONSTRAINT uq_consolidacion_saldo_inicial
    UNIQUE (razon_social_id, cuenta_id, anio, mes)
);

CREATE INDEX IF NOT EXISTS idx_consolidacion_saldos_razon_social
  ON public.consolidacion_saldos_iniciales(razon_social_id, anio, mes);

-- -------------------------------------------------------------------------
-- RLS de aislamiento multi-empresa (mismo patron que scripts/017 y 020).
-- -------------------------------------------------------------------------
ALTER TABLE public.consolidacion_saldos_iniciales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_consolidacion_saldos ON public.consolidacion_saldos_iniciales;
CREATE POLICY tenant_isolation_consolidacion_saldos ON public.consolidacion_saldos_iniciales
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- -------------------------------------------------------------------------
-- Modulo nuevo (dato). Debe calzar EXACTO con lib/constants/modulos.ts.
-- -------------------------------------------------------------------------
INSERT INTO public.modulos (nombre)
VALUES ('Consolidacion Bancaria')
ON CONFLICT (nombre) DO NOTHING;
