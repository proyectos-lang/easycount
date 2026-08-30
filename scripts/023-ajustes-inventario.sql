  -- =========================================================================
  -- 023 - Ajustes de Inventario (conteo fisico / cuadre)
  -- =========================================================================
  --
  -- ADITIVO: solo CREATE TABLE de 1 tabla nueva + CREATE POLICY sobre ella +
  -- INSERT de 1 fila en `modulos`. No hace ALTER ni toca ninguna tabla
  -- existente.
  --
  -- El modulo cuadra el inventario contra un conteo fisico: por cada linea
  -- ajustada genera un movimiento 'Ajuste' en `transacciones_inventario`
  -- (entrada si sobra, salida si falta) usando el COSTO PROMEDIO ACTUAL del
  -- producto (no altera el costo). Como `transacciones_inventario` no tiene
  -- columna de motivo, esta tabla guarda la bitacora (motivo, antes/despues,
  -- quien) para auditoria. Es una bitacora PLANA (una fila por linea), no un
  -- documento cabecera+detalle.
  --
  -- Requiere el script 017 (funcion app_current_tenant) ya aplicado.
  -- =========================================================================

  CREATE TABLE IF NOT EXISTS public.ajustes_inventario (
    id               SERIAL PRIMARY KEY,
    razon_social_id  INTEGER NOT NULL REFERENCES public.razon_social(id) ON DELETE CASCADE,
    producto_id      INTEGER NOT NULL REFERENCES public.productos(id),
    almacen_id       INTEGER NOT NULL REFERENCES public.almacenes(id),
    localizacion_id  INTEGER NOT NULL REFERENCES public.localizaciones(id),
    stock_anterior   NUMERIC(14,2) NOT NULL,
    stock_real       NUMERIC(14,2) NOT NULL,
    -- delta = stock_real - stock_anterior (positivo = entrada, negativo = salida)
    delta            NUMERIC(14,2) NOT NULL,
    -- costo promedio del producto al momento del ajuste (congelado, informativo)
    costo_unitario   NUMERIC(14,2) NOT NULL DEFAULT 0,
    motivo           TEXT,
    usuario          TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_ajustes_inventario_razon_social
    ON public.ajustes_inventario(razon_social_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_ajustes_inventario_producto
    ON public.ajustes_inventario(producto_id);

  -- RLS de aislamiento por tenant (patron del script 017).
  ALTER TABLE public.ajustes_inventario ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS tenant_isolation_ajustes_inventario ON public.ajustes_inventario;
  CREATE POLICY tenant_isolation_ajustes_inventario ON public.ajustes_inventario
    FOR ALL TO authenticated
    USING (razon_social_id = public.app_current_tenant())
    WITH CHECK (razon_social_id = public.app_current_tenant());

  -- Modulo nuevo (dato). Debe calzar EXACTO con lib/constants/modulos.ts.
  INSERT INTO public.modulos (nombre)
  VALUES ('Ajustes de Inventario')
  ON CONFLICT (nombre) DO NOTHING;
