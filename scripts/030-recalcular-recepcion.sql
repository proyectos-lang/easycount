-- =========================================================================
-- 030 - Recalcular Recepcion (modulo nuevo, solo registro)
-- =========================================================================
--
-- ESTRICTAMENTE ADITIVO: solo INSERT de 1 fila en `modulos`. NO crea tablas
-- ni columnas, NO hace ALTER ni DROP y NO renombra nada.
--
-- El modulo "Recalcular Recepcion" (Compras -> /compras/recalcular) toma una
-- compra ya recibida y re-corre el prorrateo con costos fijos corregidos
-- (importacion, impuestos, otros, tasa de cambio). Reutiliza por completo la
-- infraestructura existente:
--   - `compras_encabezado` / `compras_detalle` / `transacciones_inventario`
--     (actualiza costo_final_local, el kardex de la entrada y el total del lote).
--   - El modulo Ajuste de Costo (script 026): fija el costo promedio por delta
--     via `fijar_costo_promedio` y recalcula OPCIONALMENTE el costo de ventas
--     via `recalcular_costo_ventas`, dejando bitacora en `ajustes_costo`.
--
-- Por eso este script NO define funciones ni tablas nuevas: solo registra el
-- modulo para el sistema de permisos. Requiere el script 026 ya aplicado.
-- =========================================================================

-- -------------------------------------------------------------------------
-- Modulo nuevo (dato). Debe calzar EXACTO con lib/constants/modulos.ts.
-- -------------------------------------------------------------------------
INSERT INTO public.modulos (nombre)
VALUES ('Recalcular Recepcion')
ON CONFLICT (nombre) DO NOTHING;
