-- =========================================================================
-- 058 - Produccion: Reporte de Flujo (FASE 3) — solo registra el modulo
-- =========================================================================
-- El reporte de flujo (tiempos por etapa, carga por operacion, etapas trabadas)
-- se DERIVA de las tablas existentes (produccion_orden_etapas del script 057 +
-- produccion_ordenes). No requiere tablas nuevas: este script solo registra el
-- modulo 'Reporte de Flujo' para poder habilitarlo por empresa.
--
-- El modulo nace DESHABILITADO por empresa (no va en MODULOS_BASE): el
-- super-admin lo habilita desde /plataforma -> Modulos.
--
-- Nota de fase 3: la orden se cierra automaticamente al entregar su ultima
-- etapa (logica en lib/services/produccion-flujo.ts, sin cambios de esquema).
-- =========================================================================

INSERT INTO public.modulos (nombre) VALUES ('Reporte de Flujo')
ON CONFLICT (nombre) DO NOTHING;
