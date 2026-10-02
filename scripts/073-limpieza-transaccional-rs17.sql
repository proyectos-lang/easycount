-- =========================================================================
-- 073 - ONE-OFF: limpieza TRANSACCIONAL de la razón social 17 ("El Super")
-- =========================================================================
-- ⚠️ DESTRUCTIVO E IRREVERSIBLE. Borra SOLO los datos transaccionales de la
-- empresa 17; NO toca otras empresas (todo va acotado a razon_social_id = 17).
--
-- SE BORRA: productos, transacciones de inventario, ventas (detalle, pagos,
--   desglose de pago, descripciones de venta rápida), compras (detalle),
--   gastos, movimientos de cuentas, caja chica (movimientos y sesiones),
--   devoluciones (detalle), ajustes de inventario.
-- SE CONSERVA: la razón social, usuarios, almacenes, localizaciones, cuentas
--   (sus SALDOS se dejan en 0), clientes, proveedores, categorías/sub/marcas,
--   listas de precios y la config de módulos/flags. La empresa queda operable,
--   como recién estrenada con su gente y catálogos base.
--
-- Todas las tablas hijas tienen `razon_social_id`, así que cada DELETE va
-- acotado por tenant; el ORDEN respeta las FKs (hijas antes que padres).
-- Envuelto en una transacción: si algo falla, no queda a medias.
--
-- VERIFICAR ANTES DE CORRER: que 17 sea "El Super". Ejecutar en el SQL editor
-- de Supabase (service role). NO re-ejecutar (es idempotente de facto: tras
-- correrlo, los conteos quedan en 0).
-- =========================================================================

BEGIN;

-- Candado de seguridad: aborta si la empresa 17 no es la esperada. Evita correr
-- el borrado contra una razón social equivocada.
DO $$
DECLARE v_nombre text;
BEGIN
  SELECT COALESCE(nombre_empresa, nombre_comercial) INTO v_nombre
  FROM public.razon_social WHERE id = 17;
  IF v_nombre IS NULL THEN
    RAISE EXCEPTION 'La razón social 17 no existe; abortando por seguridad.';
  END IF;
  IF lower(v_nombre) NOT LIKE '%super%' THEN
    RAISE EXCEPTION 'La razón social 17 es "%", no "El Super"; abortando por seguridad.', v_nombre;
  END IF;
  RAISE NOTICE 'Limpiando datos transaccionales de la razón social 17 (%).', v_nombre;
END $$;

-- ── Pedidos por catálogo y links (ANTES que ventas y productos) ─────────────
-- pedidos_encabezado.venta_id referencia a ventas_encabezado (sin CASCADE), y
-- pedidos_detalle / catalogo_link_productos referencian a productos (sin CASCADE).
DELETE FROM public.pedidos_detalle             WHERE razon_social_id = 17;
DELETE FROM public.pedidos_encabezado          WHERE razon_social_id = 17;
DELETE FROM public.catalogo_link_productos     WHERE razon_social_id = 17;
DELETE FROM public.catalogo_links              WHERE razon_social_id = 17;

-- ── Ventas (hijas → encabezado) ─────────────────────────────────────────────
DELETE FROM public.ventas_detalle_descripcion WHERE razon_social_id = 17;
DELETE FROM public.ventas_pagos_detalle        WHERE razon_social_id = 17;
DELETE FROM public.pagos_ventas                WHERE razon_social_id = 17;
DELETE FROM public.ventas_detalle              WHERE razon_social_id = 17;

-- ── Devoluciones (hijas → encabezado) antes de borrar sus ventas ────────────
DELETE FROM public.devoluciones_detalle        WHERE razon_social_id = 17;
DELETE FROM public.devoluciones_encabezado     WHERE razon_social_id = 17;

DELETE FROM public.ventas_encabezado           WHERE razon_social_id = 17;

-- ── Compras (detalle → encabezado) ──────────────────────────────────────────
DELETE FROM public.compras_detalle             WHERE razon_social_id = 17;
DELETE FROM public.compras_encabezado          WHERE razon_social_id = 17;

-- ── Inventario ──────────────────────────────────────────────────────────────
DELETE FROM public.ajustes_inventario          WHERE razon_social_id = 17;
DELETE FROM public.ajustes_costo               WHERE razon_social_id = 17;  -- bitácora de ajuste de costo (FK a productos)
DELETE FROM public.transacciones_inventario    WHERE razon_social_id = 17;

-- ── Finanzas / tesorería ────────────────────────────────────────────────────
DELETE FROM public.gastos                      WHERE razon_social_id = 17;
DELETE FROM public.caja_chica_movimientos      WHERE razon_social_id = 17;
DELETE FROM public.caja_chica_sesiones         WHERE razon_social_id = 17;
DELETE FROM public.cuenta_movimientos          WHERE razon_social_id = 17;
-- Sin movimientos, los saldos cacheados de las cuentas quedan en 0.
UPDATE public.cuentas_config SET saldo = 0 WHERE razon_social_id = 17;

-- ── Productos (al final: ventas/compras/kardex ya no los referencian) ───────
-- Los precios por producto de listas de precios (listas_precios_detalle)
-- apuntan a productos: se limpian para no dejar referencias colgadas.
DELETE FROM public.listas_precios_detalle      WHERE razon_social_id = 17;
-- Agrupación de tallas (si hubiera) de los productos de esta empresa.
DELETE FROM public.producto_grupo_tallas       WHERE razon_social_id = 17;
DELETE FROM public.productos                   WHERE razon_social_id = 17;

COMMIT;

-- VERIFICACIÓN (corre por separado tras el COMMIT): todos deben dar 0.
-- SELECT
--   (SELECT count(*) FROM public.productos                WHERE razon_social_id = 17) AS productos,
--   (SELECT count(*) FROM public.transacciones_inventario WHERE razon_social_id = 17) AS kardex,
--   (SELECT count(*) FROM public.ventas_encabezado        WHERE razon_social_id = 17) AS ventas,
--   (SELECT count(*) FROM public.compras_encabezado       WHERE razon_social_id = 17) AS compras,
--   (SELECT count(*) FROM public.gastos                   WHERE razon_social_id = 17) AS gastos,
--   (SELECT count(*) FROM public.cuenta_movimientos       WHERE razon_social_id = 17) AS mov_cuentas;
