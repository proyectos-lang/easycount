-- =========================================================================
-- 031 - Analisis Financiero (modulo nuevo, solo registro)
-- =========================================================================
--
-- ESTRICTAMENTE ADITIVO: solo INSERT de 1 fila en `modulos`. NO crea tablas
-- ni columnas, NO hace ALTER ni DROP y NO renombra nada.
--
-- El modulo "Analisis Financiero" (Finanzas -> /finanzas/analisis) es 100%
-- de LECTURA/analitica. Se compone de datos ya existentes:
--   - Rentabilidad por producto y CMV: `ventas_detalle` (costo_promedio_momento,
--     utilidad_linea) + `ventas_encabezado`, neteado con `devoluciones_detalle`.
--   - Gastos: `gastos` + `conceptos_gastos.categoria_macro`.
--   - Comisiones: `ventas_pagos_detalle`.
--   - Auditoria/historial de costeo: `transacciones_inventario` (kardex),
--     `compras_encabezado`/`compras_detalle` y la bitacora `ajustes_costo`
--     (script 026).
--
-- Por eso este script NO define funciones ni tablas nuevas: solo registra el
-- modulo para el sistema de permisos. Requiere el script 026 aplicado para el
-- historial de ajustes de costo (si falta, esa seccion queda vacia, no rompe).
-- =========================================================================

-- -------------------------------------------------------------------------
-- Modulo nuevo (dato). Debe calzar EXACTO con lib/constants/modulos.ts.
-- -------------------------------------------------------------------------
INSERT INTO public.modulos (nombre)
VALUES ('Analisis Financiero')
ON CONFLICT (nombre) DO NOTHING;
