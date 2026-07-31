-- =========================================================================
-- 028 - Reparar columnas de ventas_pagos_detalle (desglose de pago)
-- =========================================================================
--
-- ADITIVO y SEGURO: solo agrega columnas que faltan (ADD COLUMN IF NOT EXISTS)
-- y pone un DEFAULT a una columna obligatoria. NO borra, NO renombra, NO toca
-- datos existentes.
--
-- PROBLEMA: en algunas bases la tabla `ventas_pagos_detalle` se creo con un
-- esquema anterior (pensado para la vista de cierre diario: `comision_monto`,
-- `monto_recibido`, `fecha`) que NO tiene las columnas que la app usa para el
-- desglose multi-metodo y la comision: `porcentaje_comision` y `usuario`.
-- Ademas `monto_recibido` quedo NOT NULL sin default y la app no lo llena.
-- Como el script 011 usa `CREATE TABLE IF NOT EXISTS`, al existir ya la tabla
-- NO le agrego esas columnas -> cada insert del desglose fallaba y la app
-- (con su deteccion de error demasiado amplia, ya corregida) lo tragaba en
-- silencio: creaba la venta y los movimientos de cuenta, pero NO el desglose.
-- Resultado: en el Historial el metodo y la comision salian vacios.
--
-- Este script deja la tabla compatible con la app SIN romper la vista de
-- cierre (la app no lee `monto_recibido`/`comision_monto`; solo la vista SQL
-- podria usarlas, y les queda su valor por defecto).
--
-- Idempotente: correrlo dos veces no cambia nada. Seguro en bases nuevas
-- (creadas desde el 011 actual) porque usa IF NOT EXISTS y chequea existencia.
-- =========================================================================

DO $$
BEGIN
  -- 1) Columnas que la app inserta y podrian faltar.
  ALTER TABLE public.ventas_pagos_detalle
    ADD COLUMN IF NOT EXISTS porcentaje_comision NUMERIC(5,2) NOT NULL DEFAULT 0;
  ALTER TABLE public.ventas_pagos_detalle
    ADD COLUMN IF NOT EXISTS usuario TEXT;

  -- Por consistencia con el 011: si faltaran monto_bruto/monto_neto tambien
  -- los agregamos (en la mayoria ya existen).
  ALTER TABLE public.ventas_pagos_detalle
    ADD COLUMN IF NOT EXISTS monto_bruto NUMERIC(14,2) NOT NULL DEFAULT 0;
  ALTER TABLE public.ventas_pagos_detalle
    ADD COLUMN IF NOT EXISTS monto_neto NUMERIC(14,2) NOT NULL DEFAULT 0;

  -- 2) `monto_recibido`: si existe (esquema viejo) y es NOT NULL sin default,
  --    la app no lo llena -> le damos default 0 para que el insert no falle.
  --    La app no lee esta columna; solo la vista de cierre podria usarla.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ventas_pagos_detalle'
      AND column_name = 'monto_recibido'
  ) THEN
    ALTER TABLE public.ventas_pagos_detalle ALTER COLUMN monto_recibido SET DEFAULT 0;
  END IF;
END $$;

-- -------------------------------------------------------------------------
-- Verificacion (opcional): deben aparecer porcentaje_comision y usuario.
-- -------------------------------------------------------------------------
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'ventas_pagos_detalle'
-- ORDER BY ordinal_position;
