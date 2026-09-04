-- =========================================================================
-- LIMPIEZA TOTAL de la razon social 13 (Marena)
-- Borra ventas/facturacion, devoluciones, pedidos, compras, gastos, caja
-- menor y movimientos bancarios. CONSERVA solo las ENTRADAS de inventario
-- (tipo 'Ingreso Manual' / 'Entrada Compra') y las consolida en la
-- localizacion id 12. Recalcula el stock de cada producto.
--
--  *** IRREVERSIBLE. HACE UN RESPALDO ANTES DE EJECUTAR. ***
--
-- Se conservan (catalogos): productos, clientes, proveedores, marcas,
-- categorias, subcategorias, almacenes, localizaciones, conceptos_gastos,
-- cuentas_config (con saldo reiniciado a 0), usuarios.
--
-- Es atomico (bloque DO): si la localizacion 12 no es de la razon 13, o si
-- algo falla, NO borra nada. Salta tablas que no existan en tu base.
-- Ejecutar en el SQL editor de Supabase (service role).
-- =========================================================================

-- ---------- (opcional) Estado ANTES: correlo primero para ver que hay ----------
-- SELECT 'ventas' t, COUNT(*) n FROM public.ventas_encabezado WHERE razon_social_id = 13
-- UNION ALL SELECT 'gastos', COUNT(*) FROM public.gastos WHERE razon_social_id = 13
-- UNION ALL SELECT 'caja_mov', COUNT(*) FROM public.caja_chica_movimientos WHERE razon_social_id = 13
-- UNION ALL SELECT 'inv_total', COUNT(*) FROM public.transacciones_inventario WHERE razon_social_id = 13
-- UNION ALL SELECT 'inv_entradas', COUNT(*) FROM public.transacciones_inventario
--   WHERE razon_social_id = 13 AND tipo_movimiento IN ('Ingreso Manual','Entrada Compra');

DO $$
DECLARE
  v_razon INT   := 13;   -- razon social a limpiar
  v_loc   INT   := 12;   -- localizacion destino (todo el inventario queda aqui)
  v_alm   BIGINT;
  t TEXT;
  -- Tablas transaccionales/financieras a VACIAR por completo para la razon.
  -- Orden: hijos antes que padres (respeta las FK). Se saltan las que no existan.
  tablas TEXT[] := ARRAY[
    'devoluciones_detalle','devoluciones_encabezado',
    'pagos_ventas','ventas_pagos_detalle','ventas_detalle','ventas_ediciones',
    'pedidos_detalle','pedidos_encabezado','catalogo_link_productos','catalogo_links',
    'ventas_encabezado',
    'compras_detalle','compras_encabezado',
    'gastos_pagos_detalle','gastos',
    'caja_chica_movimientos','caja_chica_sesiones',
    'cuenta_movimientos','consolidacion_saldos_iniciales',
    'ajustes_inventario','ajustes_costo'
  ];
BEGIN
  -- Seguridad: la localizacion destino debe existir y ser de la razon social.
  SELECT almacen_id INTO v_alm
  FROM public.localizaciones
  WHERE id = v_loc AND razon_social_id = v_razon;
  IF v_alm IS NULL THEN
    RAISE EXCEPTION 'Abortado: la localizacion % no existe o no pertenece a la razon social %.', v_loc, v_razon;
  END IF;

  -- 1) Borra todos los registros transaccionales/financieros de la razon.
  FOREACH t IN ARRAY tablas LOOP
    IF to_regclass('public.'||t) IS NOT NULL THEN
      EXECUTE format('DELETE FROM public.%I WHERE razon_social_id = %L', t, v_razon);
    END IF;
  END LOOP;

  -- 2) Bancos: se conservan las cuentas pero se reinicia el saldo cache a 0.
  IF to_regclass('public.cuentas_config') IS NOT NULL THEN
    EXECUTE format('UPDATE public.cuentas_config SET saldo = 0 WHERE razon_social_id = %L', v_razon);
  END IF;

  -- 3) Inventario: conserva SOLO las entradas (Ingreso Manual / Entrada Compra).
  --    Borra salidas de venta, traslados, ajustes y entradas por devolucion.
  DELETE FROM public.transacciones_inventario
  WHERE razon_social_id = v_razon
    AND tipo_movimiento NOT IN ('Ingreso Manual', 'Entrada Compra');

  -- 4) Consolida TODO el inventario conservado en la localizacion 12.
  UPDATE public.transacciones_inventario
  SET localizacion_id = v_loc,
      almacen_id      = v_alm
  WHERE razon_social_id = v_razon;

  -- 5) Recalcula el stock global de cada producto = suma de sus entradas.
  --    (No se toca costo_promedio: sigue reflejando el promedio de las entradas.)
  UPDATE public.productos p
  SET stock_total = COALESCE((
        SELECT SUM(x.cantidad)
        FROM public.transacciones_inventario x
        WHERE x.producto_id = p.id AND x.razon_social_id = v_razon
      ), 0)
  WHERE p.razon_social_id = v_razon;

  RAISE NOTICE 'Limpieza OK. Razon %: inventario consolidado en localizacion % (almacen %).', v_razon, v_loc, v_alm;
END $$;

-- ---------- Estado DESPUES: verifica que quedo todo limpio ----------
SELECT 'ventas' t, COUNT(*) n FROM public.ventas_encabezado WHERE razon_social_id = 13
UNION ALL SELECT 'gastos', COUNT(*) FROM public.gastos WHERE razon_social_id = 13
UNION ALL SELECT 'caja_mov', COUNT(*) FROM public.caja_chica_movimientos WHERE razon_social_id = 13
UNION ALL SELECT 'banco_mov', COUNT(*) FROM public.cuenta_movimientos WHERE razon_social_id = 13
UNION ALL SELECT 'inv_total', COUNT(*) FROM public.transacciones_inventario WHERE razon_social_id = 13;

-- Movimientos de inventario que quedaron (deben ser solo entradas) y su localizacion:
SELECT tipo_movimiento, localizacion_id, COUNT(*) filas, SUM(cantidad) unidades
FROM public.transacciones_inventario
WHERE razon_social_id = 13
GROUP BY tipo_movimiento, localizacion_id
ORDER BY 1, 2;

-- Stock final por producto:
SELECT id, nombre, stock_total
FROM public.productos
WHERE razon_social_id = 13
ORDER BY id;
