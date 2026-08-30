-- =========================================================================
-- ONE-OFF (NO commitear): agrega el metodo "Credito" faltante en el desglose
-- de las ventas de Marena (razon_social_id = 13) generadas al APROBAR un
-- pedido a credito. Esas ventas quedaron sin fila en ventas_pagos_detalle, por
-- lo que el Historial muestra "-" en Metodo. El codigo ya se corrigio; esto
-- arregla las que ya existen.
--
-- Ejecutar en el SQL editor de Supabase: PASO 1 (revisar) -> 2 -> 3.
-- =========================================================================

-- PASO 1 — Ventas de pedido (razon 13) SIN fila de metodo. Revisa valorpago:
--   valorpago = 0 -> es a credito (se le pondra 'Credito'). Si alguna tiene
--   valorpago > 0, era Efectivo/Banco (avisame, NO se toca aqui).
SELECT p.numero_pedido, v.id AS venta_id, v.numero_factura, v.total_venta,
       v.valorpago, v.estado_pago, v.fecha_venta
FROM public.pedidos_encabezado p
JOIN public.ventas_encabezado v ON v.id = p.venta_id
WHERE p.razon_social_id = 13
  AND p.estado = 'Aprobado'
  AND NOT EXISTS (SELECT 1 FROM public.ventas_pagos_detalle d WHERE d.venta_id = v.id)
ORDER BY v.id DESC;

-- PASO 2 — Insertar la fila 'Credito' (monto 0) SOLO para las de credito
--   (valorpago = 0) que no tengan ya un desglose. No genera tesoreria; el
--   saldo sigue como cuenta por cobrar.
BEGIN;

INSERT INTO public.ventas_pagos_detalle
  (razon_social_id, venta_id, metodo_pago, cuenta_id, monto_bruto, porcentaje_comision, monto_neto, usuario)
SELECT v.razon_social_id, v.id, 'Credito', NULL, 0, 0, 0, 'fix-metodo-pedido'
FROM public.pedidos_encabezado p
JOIN public.ventas_encabezado v ON v.id = p.venta_id
WHERE p.razon_social_id = 13
  AND p.estado = 'Aprobado'
  AND COALESCE(v.valorpago, 0) = 0
  AND NOT EXISTS (SELECT 1 FROM public.ventas_pagos_detalle d WHERE d.venta_id = v.id);

COMMIT;

-- PASO 3 — Verificar: las ventas corregidas ya tienen su metodo 'Credito'.
SELECT d.venta_id, v.numero_factura, d.metodo_pago, d.monto_bruto
FROM public.ventas_pagos_detalle d
JOIN public.ventas_encabezado v ON v.id = d.venta_id
WHERE d.razon_social_id = 13
  AND d.usuario = 'fix-metodo-pedido'
ORDER BY d.venta_id DESC;
