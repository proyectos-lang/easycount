-- =========================================================================
-- 050 - Produccion FASE 5: Dashboard de produccion (modulo nuevo, solo registro)
-- =========================================================================
-- ESTRICTAMENTE ADITIVO: solo INSERT de 1 fila en `modulos`. NO crea tablas ni
-- columnas, NO hace ALTER ni DROP.
--
-- El modulo "Dashboard Produccion" (Produccion -> /produccion/dashboard) es 100%
-- de LECTURA. Se compone de datos ya existentes de las fases previas:
--   - Corridas: `produccion_corridas` (unidades buenas/defectuosas/procesadas,
--     paros, horas, tiempo planificado, costos) y `produccion_corrida_defectos`.
--   - Estandar de produccion (u/min): `produccion_recetas`.
--
-- OEE = Disponibilidad x Rendimiento x Calidad, derivado de esos datos. Por eso
-- este script NO crea tablas: solo registra el modulo para permisos/sidebar.
-- Requiere 046-049 aplicados. El modulo nace DESHABILITADO (no esta en
-- MODULOS_BASE): el super-admin lo habilita por empresa.
-- =========================================================================

INSERT INTO public.modulos (nombre) VALUES ('Dashboard Produccion')
ON CONFLICT (nombre) DO NOTHING;
