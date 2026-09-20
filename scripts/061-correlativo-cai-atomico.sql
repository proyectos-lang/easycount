-- =========================================================================
-- 061 - Correlativo fiscal CAI atómico (SAR Honduras) - FASE 2
-- =========================================================================
-- Emite el SIGUIENTE correlativo fiscal de una empresa para un tipo de documento
-- (01 Factura / 06 Nota Credito / 07 Nota Debito), de forma ATOMICA. Consume el
-- `correlativo_actual` de `facturacion_cai_config` (script 060) y lo incrementa,
-- con lock de fila (UPDATE ... RETURNING) para que dos ventas concurrentes nunca
-- reciban el mismo numero.
--
-- A diferencia del correlativo global `siguiente_correlativo_venta()` (una sola
-- serie 'FC-####' para todas las empresas), este es POR EMPRESA y respeta el
-- rango autorizado por el SAR: si el correlativo se sale del rango, o la config
-- no existe / esta inactiva, la funcion FALLA (RAISE) y la app cae a modo
-- degradado (usa el correlativo interno, sin numero fiscal).
--
-- SECURITY INVOKER (respeta RLS): cada empresa solo puede tocar SU fila, porque
-- la politica de `facturacion_cai_config` filtra por app_current_tenant(). Asi no
-- hay fuga de correlativos entre empresas. La fecha limite NO se valida aqui (es
-- una regla "blanda": la UI avisa; no queremos bloquear una venta en curso por
-- una fecha; el control fuerte es el rango).
--
-- ADITIVO: solo CREATE FUNCTION nuevas. NO toca tablas.
-- Requiere el script 060 (tabla facturacion_cai_config).
-- =========================================================================

-- Emite (consume) el siguiente correlativo. Devuelve una fila con las partes y
-- el numero ya formateado 'ESTAB-PUNTO-TIPO-NNNNNNNN'. Falla si no hay rango
-- disponible o la config no esta lista.
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
  -- Lock de la fila del tenant para este tipo de documento (RLS ya la aisla).
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

  -- El correlativo a emitir debe caer dentro del rango autorizado.
  IF v_next < v_row.rango_inicial THEN
    v_next := v_row.rango_inicial;
  END IF;
  IF v_row.rango_final > 0 AND v_next > v_row.rango_final THEN
    RAISE EXCEPTION 'CAI_RANGE_EXHAUSTED: se agoto el rango autorizado (% al %)',
      v_row.rango_inicial, v_row.rango_final;
  END IF;

  -- Consume: el siguiente a emitir queda en v_next + 1.
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

-- PEEK (solo lectura, NO consume): el numero que se emitiria a continuacion,
-- para mostrarlo en Nueva Venta sin quemar folios. NULL si no hay config.
CREATE OR REPLACE FUNCTION public.peek_correlativo_cai(p_tipo_documento text DEFAULT '01')
RETURNS text
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT lpad(coalesce(establecimiento,'000'), 3, '0')
    || '-' || lpad(coalesce(punto_emision,'001'), 3, '0')
    || '-' || lpad(coalesce(tipo_documento,'01'), 2, '0')
    || '-' || lpad(greatest(correlativo_actual, rango_inicial)::text, 8, '0')
  FROM public.facturacion_cai_config
  WHERE tipo_documento = p_tipo_documento
    AND razon_social_id = public.app_current_tenant()
    AND activo = true;
$$;
REVOKE ALL ON FUNCTION public.peek_correlativo_cai(text) FROM public;
GRANT EXECUTE ON FUNCTION public.peek_correlativo_cai(text) TO authenticated;
