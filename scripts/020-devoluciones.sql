-- =========================================================================
-- 020 - Devoluciones de ventas (notas de credito)  [Fase 3]
-- =========================================================================
--
-- ESTRICTAMENTE ADITIVO: solo CREATE TABLE de 2 tablas nuevas, CREATE POLICY
-- sobre ellas, e INSERT de 1 fila en `modulos`. No hace ALTER ni toca
-- ninguna tabla existente (ventas_encabezado, transacciones_inventario, etc.).
--
-- La factura original queda INTACTA. Cada devolucion es un registro aparte
-- (encabezado + detalle) que reversa inventario y reembolsa dinero. Los
-- reportes calculan ventas netas restando estas devoluciones (en el servicio).
--
-- Requiere que el script 017 (funcion app_current_tenant) ya este aplicado.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. devoluciones_encabezado
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.devoluciones_encabezado (
  id                 SERIAL PRIMARY KEY,
  razon_social_id    INTEGER NOT NULL REFERENCES public.razon_social(id) ON DELETE CASCADE,
  venta_id           INTEGER NOT NULL REFERENCES public.ventas_encabezado(id) ON DELETE CASCADE,
  numero_devolucion  TEXT,
  fecha              TIMESTAMPTZ NOT NULL DEFAULT now(),
  motivo             TEXT,
  monto_total        NUMERIC(14,2) NOT NULL DEFAULT 0,
  -- Destino del reembolso: 'caja' (efectivo) o 'cuenta' (banco).
  destino_reembolso  TEXT NOT NULL CHECK (destino_reembolso IN ('caja','cuenta')),
  cuenta_id          INTEGER REFERENCES public.cuentas_config(id),
  usuario            TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_devoluciones_enc_venta
  ON public.devoluciones_encabezado(venta_id);
CREATE INDEX IF NOT EXISTS idx_devoluciones_enc_razon_social
  ON public.devoluciones_encabezado(razon_social_id);

-- -------------------------------------------------------------------------
-- 2. devoluciones_detalle
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.devoluciones_detalle (
  id                     SERIAL PRIMARY KEY,
  razon_social_id        INTEGER NOT NULL REFERENCES public.razon_social(id) ON DELETE CASCADE,
  devolucion_id          INTEGER NOT NULL REFERENCES public.devoluciones_encabezado(id) ON DELETE CASCADE,
  venta_detalle_id       INTEGER NOT NULL REFERENCES public.ventas_detalle(id) ON DELETE CASCADE,
  producto_id            INTEGER NOT NULL REFERENCES public.productos(id),
  cantidad_devuelta      NUMERIC(14,2) NOT NULL CHECK (cantidad_devuelta > 0),
  precio_unitario        NUMERIC(14,2) NOT NULL DEFAULT 0,
  costo_promedio_momento NUMERIC(14,2) NOT NULL DEFAULT 0,
  subtotal               NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_devoluciones_det_devolucion
  ON public.devoluciones_detalle(devolucion_id);
CREATE INDEX IF NOT EXISTS idx_devoluciones_det_venta_detalle
  ON public.devoluciones_detalle(venta_detalle_id);
CREATE INDEX IF NOT EXISTS idx_devoluciones_det_razon_social
  ON public.devoluciones_detalle(razon_social_id);

-- -------------------------------------------------------------------------
-- 3. RLS de aislamiento multi-empresa (solo sobre las 2 tablas nuevas)
--    Mismo patron que scripts/017-rls-policies.sql.
-- -------------------------------------------------------------------------
ALTER TABLE public.devoluciones_encabezado ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_devoluciones_encabezado ON public.devoluciones_encabezado;
CREATE POLICY tenant_isolation_devoluciones_encabezado ON public.devoluciones_encabezado
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

ALTER TABLE public.devoluciones_detalle ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_devoluciones_detalle ON public.devoluciones_detalle;
CREATE POLICY tenant_isolation_devoluciones_detalle ON public.devoluciones_detalle
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- -------------------------------------------------------------------------
-- 4. Modulo nuevo (dato). Debe calzar EXACTO con lib/constants/modulos.ts.
-- -------------------------------------------------------------------------
INSERT INTO public.modulos (nombre)
VALUES ('Devoluciones')
ON CONFLICT (nombre) DO NOTHING;
