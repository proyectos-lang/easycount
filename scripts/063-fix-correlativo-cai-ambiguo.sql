-- =========================================================================
-- 063 - FIX: ambigüedad de `tipo_documento` en siguiente_correlativo_cai
-- =========================================================================
-- El RPC `siguiente_correlativo_cai` (script 061) fallaba con
--   ERROR 42702: column reference "tipo_documento" is ambiguous
-- porque `tipo_documento` es a la vez una COLUMNA de la tabla y una COLUMNA de
-- SALIDA del RETURNS TABLE. En el WHERE, Postgres no sabia a cual referirse.
-- Consecuencia: al crear una venta con Facturación CAI activa, el RPC fallaba y
-- la venta caia a modo degradado -> `numero_fiscal` quedaba NULL y la
-- tirilla/PDF salian sin los datos fiscales.
--
-- Arreglo: calificar las columnas del WHERE con el nombre de la tabla. Solo
-- `CREATE OR REPLACE FUNCTION` (idempotente, no toca tablas). Requiere 060, 061.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.siguiente_correlativo_cai(p_tipo_documento text DEFAULT '01')
RETURNS TABLE (
  numero            text,
  correlativo       bigint,
  establecimiento   text,
  punto_emision     text,
  tipo_documento    text,
  cai               text
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_row public.facturacion_cai_config%ROWTYPE;
  v_next bigint;
BEGIN
  -- Se califica con el nombre de la tabla porque `tipo_documento` tambien es una
  -- columna de salida (RETURNS TABLE) -> sin calificar es ambiguo (42702).
  SELECT * INTO v_row
  FROM public.facturacion_cai_config
  WHERE facturacion_cai_config.tipo_documento = p_tipo_documento
    AND facturacion_cai_config.razon_social_id = public.app_current_tenant()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CAI_CONFIG_MISSING: no hay configuracion CAI para el tipo %', p_tipo_documento;
  END IF;
  IF NOT v_row.activo THEN
    RAISE EXCEPTION 'CAI_CONFIG_INACTIVE: la autorizacion CAI del tipo % esta inactiva', p_tipo_documento;
  END IF;

  v_next := v_row.correlativo_actual;

  IF v_next < v_row.rango_inicial THEN
    v_next := v_row.rango_inicial;
  END IF;
  IF v_row.rango_final > 0 AND v_next > v_row.rango_final THEN
    RAISE EXCEPTION 'CAI_RANGE_EXHAUSTED: se agoto el rango autorizado (% al %)',
      v_row.rango_inicial, v_row.rango_final;
  END IF;

  UPDATE public.facturacion_cai_config
  SET correlativo_actual = v_next + 1,
      updated_at = now()
  WHERE id = v_row.id;

  numero := lpad(coalesce(v_row.establecimiento,'000'), 3, '0')
    || '-' || lpad(coalesce(v_row.punto_emision,'001'), 3, '0')
    || '-' || lpad(coalesce(v_row.tipo_documento,'01'), 2, '0')
    || '-' || lpad(v_next::text, 8, '0');
  correlativo := v_next;
  establecimiento := v_row.establecimiento;
  punto_emision := v_row.punto_emision;
  tipo_documento := v_row.tipo_documento;
  cai := v_row.cai;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.siguiente_correlativo_cai(text) FROM public;
GRANT EXECUTE ON FUNCTION public.siguiente_correlativo_cai(text) TO authenticated;
