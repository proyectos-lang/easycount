-- =========================================================================
-- 024 - Bitacora de ediciones de ventas
-- =========================================================================
--
-- ADITIVO: solo CREATE TABLE de 1 tabla nueva + CREATE POLICY. No hace ALTER
-- ni toca ninguna tabla existente. No inserta modulo (editar vive dentro de
-- "Historial Ventas").
--
-- Cada vez que se edita una venta (editarVenta), se guarda aqui quien la
-- edito, cuando, un motivo opcional y un snapshot antes/despues (JSONB) para
-- auditoria. Es best-effort: si esta tabla no existe, la edicion igual se
-- aplica (solo no queda el historial de cambios).
--
-- Requiere el script 017 (funcion app_current_tenant) ya aplicado.
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.ventas_ediciones (
  id               SERIAL PRIMARY KEY,
  razon_social_id  INTEGER NOT NULL REFERENCES public.razon_social(id) ON DELETE CASCADE,
  venta_id         INTEGER NOT NULL REFERENCES public.ventas_encabezado(id) ON DELETE CASCADE,
  numero_factura   TEXT,
  usuario          TEXT,
  motivo           TEXT,
  -- Snapshot del estado antes y despues de la edicion (total, valorpago,
  -- estado_pago, cliente, lineas...).
  antes            JSONB,
  despues          JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ventas_ediciones_venta
  ON public.ventas_ediciones(venta_id);
CREATE INDEX IF NOT EXISTS idx_ventas_ediciones_razon_social
  ON public.ventas_ediciones(razon_social_id, created_at DESC);

-- RLS de aislamiento por tenant (patron del script 017).
ALTER TABLE public.ventas_ediciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ventas_ediciones ON public.ventas_ediciones;
CREATE POLICY tenant_isolation_ventas_ediciones ON public.ventas_ediciones
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());
