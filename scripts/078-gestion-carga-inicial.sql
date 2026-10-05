-- =========================================================================
-- 078 - ONE-OFF: carga inicial del CRM /gestion desde "Contabilidad EasyCount.xlsx"
-- =========================================================================
-- Fuente: C:\Users\Personal\Downloads\Contabilidad EasyCount.xlsx (Hoja 1):
--   · tabla izquierda: cobros por cliente (fecha de cobro, fecha de pago, cuenta)
--     y gastos (montos negativos: videos y publicidad en Instagram);
--   · tabla derecha: lista de clientes con su cuota y su día de cobro.
--
-- Decisiones (confirmadas con el usuario):
--   · EDCE y Rancho Alba (sin plan ni pagos) NO se cargan.
--   · Run Ticket y Lotería (sin pagos) → prospectos con su cuota.
--   · Mix and Match y VK Design (reuniones) → prospectos en "reunión realizada".
--   · Dayarok y Jorge → en prueba (desde su fecha del archivo).
--   · Food Market (Reynaldo) → suscripción ANUAL de L 9,180 pagada el 20/08/2026.
--   · Los gastos los asumió el socio dueño de la cuenta de salida: BAC Kristel →
--     socio Kristel; BAC Sebas → socio Sebas. Se crean ambos con 0 % (ajústalo
--     en /gestion/socios); igual se les reembolsa lo que pagaron.
--   · Cuota = la de la lista de clientes (columna derecha); cada pago se carga
--     con el monto real recibido. Vanessa paga en COP (95,000) a Sebas Colombia:
--     se registra el equivalente L 800 y el COP va en observaciones.
--   · Cada pago cubre UN período desde su fecha de cobro (no desde la fecha en
--     que se pagó); el próximo pago = último cobro cubierto + 1 período.
--
-- Candado: aborta si ya hay empresas cargadas (no duplica). BEGIN/COMMIT.
-- Requiere 076 y 077. Después de correrlo, al abrir /gestion los clientes con
-- cobro vencido pasan solos a "pago pendiente".
-- =========================================================================

BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.gestion_empresas) THEN
    RAISE EXCEPTION 'gestion_empresas ya tiene datos: la carga inicial no se ejecuta para no duplicar.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.gestion_cuentas WHERE nombre = 'BAC Sebas')
     OR NOT EXISTS (SELECT 1 FROM public.gestion_cuentas WHERE nombre = 'BAC Kristel')
     OR NOT EXISTS (SELECT 1 FROM public.gestion_cuentas WHERE nombre = 'Sebas Colombia') THEN
    RAISE EXCEPTION 'Faltan las cuentas BAC Sebas / BAC Kristel / Sebas Colombia (script 076).';
  END IF;
END $$;

-- ── Socios (0 % hasta que se defina su participación) ─────────────────────
INSERT INTO public.gestion_socios (nombre, porcentaje, notas)
SELECT v.nombre, 0, 'Creado en la carga inicial; define su % en Socios.'
FROM (VALUES ('Kristel'), ('Sebas')) AS v(nombre)
WHERE NOT EXISTS (SELECT 1 FROM public.gestion_socios s WHERE s.nombre = v.nombre);

-- ── Empresas ──────────────────────────────────────────────────────────────
INSERT INTO public.gestion_empresas
  (nombre, contacto_principal, cuota, moneda, ciclo_cobro, dia_cobro, fecha_instalacion, fecha_inicio_prueba, fecha_proximo_pago, estado, etapa_pipeline, proxima_accion, observaciones, updated_at)
VALUES
  -- Clientes mensuales (próximo pago = último cobro cubierto + 1 mes)
  ('Coral',                  'Juliana',  800, 'L', 'mensual', 5,  '2026-05-05', '2026-05-05', '2026-09-05', 'activo', 'cliente', NULL, NULL, now()),
  ('Colorbag',               'Kristel',  650, 'L', 'mensual', 15, '2026-05-15', '2026-05-15', '2026-09-15', 'activo', 'cliente', NULL, 'Pagó L 900 de mayo a julio; desde agosto L 650.', now()),
  ('Colmena',                'Paola',    900, 'L', 'mensual', 17, '2026-06-17', '2026-06-17', '2026-10-17', 'activo', 'cliente', NULL, NULL, now()),
  ('Manufactura de la Moda', 'Moisés',  1000, 'L', 'mensual', 6,  '2026-07-06', '2026-07-06', '2026-10-06', 'activo', 'cliente', NULL, 'Paga por link de pago (L 865 en jul/ago, L 962 en sep).', now()),
  ('Vanessa',                'Vanessa',  800, 'L', 'mensual', 13, '2026-07-13', '2026-07-13', '2026-10-13', 'activo', 'cliente', NULL, 'Paga en COP 95,000 a Sebas Colombia.', now()),
  ('Emprendedores Catrachos','Thomas',   900, 'L', 'mensual', 29, '2026-07-16', '2026-07-16', '2026-09-29', 'activo', 'cliente', NULL, 'Primer cobro el 16/07; desde agosto cobra el día 29.', now()),
  ('Dalma Fun Kids',         'Belinda',  650, 'L', 'mensual', 3,  '2026-08-03', '2026-08-03', '2026-10-03', 'activo', 'cliente', NULL, NULL, now()),
  ('Inversiones Olanchito',  'Thomas',   900, 'L', 'mensual', 2,  '2026-08-24', '2026-08-24', '2026-10-02', 'activo', 'cliente', NULL, 'Primer cobro anotado el 24/08; cobra el día 2.', now()),
  ('Marena',                 'Fredy',    900, 'L', 'mensual', 1,  '2026-09-01', '2026-09-01', '2026-10-01', 'activo', 'cliente', NULL, NULL, now()),
  -- Cliente anual
  ('Food Market',            'Reynaldo',9180, 'L', 'anual',   NULL,'2026-08-20', '2026-08-20', '2027-08-20', 'activo', 'cliente', NULL, 'Suscripción anual.', now()),
  -- En prueba
  ('Dayarok',                'Dunia',    900, 'L', 'mensual', 18, '2026-09-18', '2026-09-18', NULL, 'prueba', 'prueba', NULL, 'Período de prueba desde el 18/09.', now()),
  ('Jorge',                  'Jorge',    900, 'L', 'mensual', 20, '2026-09-20', '2026-09-20', NULL, 'prueba', 'prueba', NULL, 'Período de prueba desde el 20/09.', now()),
  -- Prospectos
  ('Lotería',                'Allan',   1500, 'L', 'mensual', NULL, NULL, NULL, NULL, 'reunion_realizada', 'reunion_realizada', 'Pendiente instalación', NULL, now()),
  ('Run Ticket',             NULL,      3200, 'L', 'mensual', NULL, NULL, NULL, NULL, 'prospecto', 'nuevo', NULL, NULL, now()),
  ('Mix and Match',          'Andrea',     0, 'L', 'mensual', NULL, NULL, NULL, NULL, 'reunion_realizada', 'reunion_realizada', 'Pide facturación con SAR', NULL, now()),
  ('VK Design',              'Karina',   650, 'L', 'mensual', NULL, NULL, NULL, NULL, 'reunion_realizada', 'reunion_realizada', 'Consultar con su socia', NULL, now());

-- ── Pagos de clientes ─────────────────────────────────────────────────────
-- (empresa, fecha de pago, monto, método, cuenta, ciclo, período desde, hasta, observaciones)
INSERT INTO public.gestion_pagos
  (empresa_id, fecha, monto, metodo, cuenta_id, ciclo_aplicado, periodo_cubierto_desde, periodo_cubierto_hasta, observaciones, usuario)
SELECT e.id, v.fecha::date, v.monto, v.metodo, c.id, v.ciclo, v.desde::date, v.hasta::date, v.obs, 'Carga inicial (script 078)'
FROM (VALUES
  ('Coral',                  '2026-05-20',  800, 'transferencia', 'BAC Sebas',      'mensual', '2026-05-05', '2026-06-04', NULL),
  ('Coral',                  '2026-06-13',  800, 'transferencia', 'BAC Sebas',      'mensual', '2026-06-05', '2026-07-04', NULL),
  ('Coral',                  '2026-07-21',  800, 'transferencia', 'BAC Sebas',      'mensual', '2026-07-05', '2026-08-04', NULL),
  ('Coral',                  '2026-09-01',  800, 'transferencia', 'BAC Sebas',      'mensual', '2026-08-05', '2026-09-04', 'Cobro de agosto pagado el 01/09'),
  ('Colorbag',               '2026-06-22',  900, 'transferencia', 'BAC Sebas',      'mensual', '2026-05-15', '2026-06-14', 'Cobro de mayo pagado el 22/06'),
  ('Colorbag',               '2026-06-22',  900, 'transferencia', 'BAC Sebas',      'mensual', '2026-06-15', '2026-07-14', NULL),
  ('Colorbag',               '2026-07-22',  900, 'transferencia', 'BAC Sebas',      'mensual', '2026-07-15', '2026-08-14', NULL),
  ('Colorbag',               '2026-08-20',  650, 'transferencia', 'BAC Kristel',    'mensual', '2026-08-15', '2026-09-14', NULL),
  ('Colmena',                '2026-06-17',  900, 'transferencia', 'BAC Sebas',      'mensual', '2026-06-17', '2026-07-16', NULL),
  ('Colmena',                '2026-07-17',  900, 'transferencia', 'BAC Kristel',    'mensual', '2026-07-17', '2026-08-16', NULL),
  ('Colmena',                '2026-08-18',  900, 'transferencia', 'BAC Kristel',    'mensual', '2026-08-17', '2026-09-16', NULL),
  ('Colmena',                '2026-09-17',  900, 'transferencia', 'BAC Kristel',    'mensual', '2026-09-17', '2026-10-16', NULL),
  ('Manufactura de la Moda', '2026-07-10',  865, 'tarjeta',       'BAC Kristel',    'mensual', '2026-07-06', '2026-08-05', 'Link de pago'),
  ('Manufactura de la Moda', '2026-08-12',  865, 'tarjeta',       'BAC Kristel',    'mensual', '2026-08-06', '2026-09-05', 'Link de pago'),
  ('Manufactura de la Moda', '2026-09-15',  962, 'tarjeta',       'BAC Kristel',    'mensual', '2026-09-06', '2026-10-05', 'Link de pago (cobro anotado el 8 de septiembre)'),
  ('Vanessa',                '2026-08-04',  800, 'transferencia', 'Sebas Colombia', 'mensual', '2026-07-13', '2026-08-12', 'Recibido COP 95,000'),
  ('Vanessa',                '2026-08-27',  800, 'transferencia', 'Sebas Colombia', 'mensual', '2026-08-13', '2026-09-12', 'Recibido COP 95,000'),
  ('Vanessa',                '2026-09-22',  800, 'transferencia', 'Sebas Colombia', 'mensual', '2026-09-13', '2026-10-12', 'Recibido en COP (cobro anotado el 15 de septiembre)'),
  ('Emprendedores Catrachos','2026-07-29',  900, 'transferencia', 'BAC Sebas',      'mensual', '2026-07-16', '2026-08-28', 'Primer cobro (16/07)'),
  ('Emprendedores Catrachos','2026-09-01',  900, 'transferencia', 'BAC Sebas',      'mensual', '2026-08-29', '2026-09-28', NULL),
  ('Dalma Fun Kids',         '2026-08-03',  650, 'transferencia', 'BAC Sebas',      'mensual', '2026-08-03', '2026-09-02', NULL),
  ('Dalma Fun Kids',         '2026-09-04',  650, 'transferencia', 'BAC Sebas',      'mensual', '2026-09-03', '2026-10-02', NULL),
  ('Inversiones Olanchito',  '2026-09-01',  900, 'transferencia', 'BAC Sebas',      'mensual', '2026-09-02', '2026-10-01', 'Cobro anotado el 24/08; cubre septiembre'),
  ('Marena',                 '2026-09-01',  900, 'transferencia', 'BAC Sebas',      'mensual', '2026-09-01', '2026-09-30', NULL),
  ('Food Market',            '2026-08-20', 9180, 'transferencia', 'BAC Sebas',      'anual',   '2026-08-20', '2027-08-19', 'Suscripción anual')
) AS v(empresa, fecha, monto, metodo, cuenta, ciclo, desde, hasta, obs)
JOIN public.gestion_empresas e ON e.nombre = v.empresa
JOIN public.gestion_cuentas  c ON c.nombre = v.cuenta;

-- ── Gastos (asumidos por el socio dueño de la cuenta de salida) ────────────
INSERT INTO public.gestion_gastos (fecha, categoria, descripcion, monto, metodo, socio_id, observaciones, usuario)
SELECT v.fecha::date, v.categoria, v.descripcion, v.monto, v.metodo, s.id, v.obs, 'Carga inicial (script 078)'
FROM (VALUES
  ('2026-07-17', 'publicidad', 'Video (Fernando)',                       900, 'Transferencia', 'Kristel', 'Salió de BAC Kristel'),
  ('2026-08-17', 'publicidad', 'Videos (Fernando)',                     1500, 'Transferencia', 'Sebas',   'Salió de BAC Sebas'),
  ('2026-08-19', 'publicidad', 'Video (Fernando)',                       900, 'Transferencia', 'Kristel', 'Salió de BAC Kristel'),
  ('2026-08-20', 'meta_ads',   'Publicidad video Instagram',            1050, 'Tarjeta',       'Kristel', 'Salió de BAC Kristel'),
  ('2026-08-20', 'meta_ads',   'Publicidad Instagram',                  1050, 'Tarjeta',       'Kristel', 'Salió de BAC Kristel. Revisar: mismo día y monto que «Publicidad video Instagram».'),
  ('2026-08-20', 'meta_ads',   'Publicidad Instagram',                   800, 'Tarjeta',       'Kristel', 'Salió de BAC Kristel'),
  ('2026-09-04', 'meta_ads',   'Publicidad Instagram — Telas creativas', 1050, 'Tarjeta',       'Sebas',   'Salió de BAC Sebas')
) AS v(fecha, categoria, descripcion, monto, metodo, socio, obs)
JOIN public.gestion_socios s ON s.nombre = v.socio;

-- ── Bitácora ──────────────────────────────────────────────────────────────
INSERT INTO public.gestion_actividades (empresa_id, tipo, descripcion, usuario)
SELECT id, 'creada', 'Carga inicial desde «Contabilidad EasyCount.xlsx»', 'Carga inicial (script 078)'
FROM public.gestion_empresas;

COMMIT;

-- Verificación esperada: 16 empresas (10 clientes, 2 en prueba, 4 prospectos),
-- 25 pagos por L 29,322.00, 7 gastos por L 7,250.00 (Kristel 4,700 · Sebas 2,550).
-- SELECT estado, count(*) FROM public.gestion_empresas GROUP BY estado;
-- SELECT count(*), sum(monto) FROM public.gestion_pagos;
-- SELECT s.nombre, count(*), sum(g.monto) FROM public.gestion_gastos g JOIN public.gestion_socios s ON s.id = g.socio_id GROUP BY s.nombre;
