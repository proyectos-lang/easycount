-- =========================================================================
-- 052 - Correlativo de factura ATOMICO (elimina duplicados de numero_factura)
-- =========================================================================
-- PROBLEMA: `numero_factura` se generaba en el navegador con COUNT(*)+1 sobre
-- `ventas_encabezado` (ver getNextCorrelativo en lib/services/ventas.ts). Eso
-- tiene condicion de carrera: dos ventas casi simultaneas (o un reintento)
-- leen el mismo conteo y generan el MISMO numero. Como no hay unicidad, la BD
-- acepta ambos -> se observaron 119 numeros duplicados (algunos triplicados)
-- en produccion. Ademas el COUNT no filtraba por empresa.
--
-- SOLUCION (aditiva, no toca `ventas_encabezado`): un contador GLOBAL unico
-- incrementado de forma ATOMICA en el servidor via RPC. La app llama al RPC al
-- momento de crear la venta (fuente de verdad server-side), en vez de calcular
-- el numero en el cliente. El diseno es una SOLA serie compartida entre todas
-- las razones sociales (decision de negocio), igual que el comportamiento
-- historico, pero ahora a prueba de concurrencia/reintentos.
--
-- NOTA: NO se agrega UNIQUE a `ventas_encabezado.numero_factura` porque ya
-- existen 119 duplicados historicos; un UNIQUE fallaria al crearse. La unicidad
-- a futuro la garantiza el incremento atomico (+ el retry-on-collision del
-- servicio como cinturon de seguridad). La renumeracion de lo historico es un
-- ejercicio aparte (no lo hace este script).
--
-- SEED: el contador arranca en el MAX numero FC actual GLOBAL (1759 al
-- 2026-09-14), de modo que el proximo numero emitido sea FC-1760 y no colisione
-- con lo existente. El seed se recalcula de forma segura desde la propia tabla
-- (MAX del sufijo numerico), no un literal, por si el script corre mas tarde.
-- =========================================================================

-- 1) Tabla del contador. Fila unica (id = 1). Es un recurso GLOBAL compartido,
--    por eso NO lleva razon_social_id ni RLS por tenant: el acceso se hace
--    exclusivamente por el RPC SECURITY DEFINER de abajo (la tabla queda
--    bloqueada a lectura/escritura directa de usuarios).
CREATE TABLE IF NOT EXISTS public.venta_correlativos (
  id             smallint PRIMARY KEY DEFAULT 1,
  prefijo        text     NOT NULL DEFAULT 'FC-',
  ultimo_numero  bigint   NOT NULL DEFAULT 0,
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT venta_correlativos_fila_unica CHECK (id = 1)
);

-- RLS ON sin politicas -> nadie accede directo a la tabla (solo el RPC DEFINER).
ALTER TABLE public.venta_correlativos ENABLE ROW LEVEL SECURITY;

-- 2) Seed idempotente: crea la fila unica si no existe, y ajusta `ultimo_numero`
--    al MAX del sufijo numerico de los numeros FC- existentes (GLOBAL). Solo
--    SUBE el contador (GREATEST) para nunca retroceder por debajo de lo emitido.
INSERT INTO public.venta_correlativos (id, prefijo, ultimo_numero)
VALUES (1, 'FC-', 0)
ON CONFLICT (id) DO NOTHING;

UPDATE public.venta_correlativos c
SET ultimo_numero = GREATEST(
      c.ultimo_numero,
      COALESCE((
        SELECT MAX((regexp_replace(numero_factura, '\D', '', 'g'))::bigint)
        FROM public.ventas_encabezado
        WHERE numero_factura ~ '^FC-\d+$'
      ), 0)
    ),
    updated_at = now()
WHERE c.id = 1;

-- 3) RPC atomico: incrementa el contador y devuelve el numero formateado
--    (ej. 'FC-1760'). UPDATE ... RETURNING toma un lock de fila, asi dos
--    llamadas concurrentes se serializan y nunca devuelven el mismo numero.
--    SECURITY DEFINER porque el contador es un recurso global (no de un tenant)
--    y la tabla tiene RLS cerrada; el RPC solo devuelve un texto (sin fuga de
--    datos entre empresas). Relleno a 4 digitos como el formato historico
--    (numeros >= 10000 simplemente crecen de largo).
CREATE OR REPLACE FUNCTION public.siguiente_correlativo_venta()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prefijo text;
  v_num     bigint;
BEGIN
  UPDATE public.venta_correlativos
  SET ultimo_numero = ultimo_numero + 1,
      updated_at = now()
  WHERE id = 1
  RETURNING prefijo, ultimo_numero INTO v_prefijo, v_num;

  -- Si por alguna razon la fila no existe (script parcial), la creamos sembrada.
  IF NOT FOUND THEN
    INSERT INTO public.venta_correlativos (id, prefijo, ultimo_numero)
    VALUES (1, 'FC-', 1)
    ON CONFLICT (id) DO UPDATE SET ultimo_numero = venta_correlativos.ultimo_numero + 1
    RETURNING prefijo, ultimo_numero INTO v_prefijo, v_num;
  END IF;

  RETURN v_prefijo || lpad(v_num::text, 4, '0');
END;
$$;

REVOKE ALL ON FUNCTION public.siguiente_correlativo_venta() FROM public;
GRANT EXECUTE ON FUNCTION public.siguiente_correlativo_venta() TO authenticated;

-- 4) PEEK (solo lectura, NO incrementa): devuelve el numero que se emitiria a
--    continuacion, para MOSTRARLO en la pantalla de Nueva Venta sin "quemar"
--    correlativos cada vez que se abre la pagina. El numero definitivo lo
--    asigna `siguiente_correlativo_venta()` al momento de guardar. Por eso el
--    valor de peek es solo indicativo (puede cambiar si otra venta se guarda
--    antes). SECURITY DEFINER por el mismo motivo (tabla con RLS cerrada).
CREATE OR REPLACE FUNCTION public.peek_correlativo_venta()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT prefijo || lpad((ultimo_numero + 1)::text, 4, '0')
  FROM public.venta_correlativos
  WHERE id = 1;
$$;
REVOKE ALL ON FUNCTION public.peek_correlativo_venta() FROM public;
GRANT EXECUTE ON FUNCTION public.peek_correlativo_venta() TO authenticated;
