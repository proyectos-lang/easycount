-- ============================================================================
-- Carga de inventario inicial - MARENA (joyeria)
-- One-off, NO commitear. Ejecutar en el SQL editor de Supabase.
-- Razon social Marena = id 13 (confirmado). Resuelve por nombre: almacen,
-- localizacion 'tienda', marca 'Marena' y las categorias/subcategorias.
--
-- Productos:       120
-- Unidades (>0):   180
-- Categorias:      Oro, Acero, Plata
-- Subcategorias:   Oro/Arito, Acero/Pulsera, Acero/Collar, Acero/Arito, Acero/Set, Acero/Anillo, Plata/Arito, Plata/Collar, Plata/Set, Plata/Pulsera, Plata/Anillo
-- Costo: SI hay costo (a diferencia de Coral) -> costo_promedio = costo.
-- Kardex: 'Ingreso Manual' con cantidad = existencia y costo = costo unitario.
-- ============================================================================

DO $$
DECLARE
  v_rs    bigint;
  v_alm   bigint;
  v_loc   bigint;
  v_count int;
BEGIN
  -- Razon social Marena = id 13 (confirmado por el usuario). Validamos que
  -- exista y que su nombre calce con Marena, para no cargar en la equivocada.
  v_rs := 13;
  IF NOT EXISTS (SELECT 1 FROM razon_social WHERE id = v_rs) THEN
    RAISE EXCEPTION 'No existe la razon social id 13.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM razon_social WHERE id = v_rs AND nombre_empresa ILIKE '%marena%') THEN
    RAISE EXCEPTION 'La razon social id 13 no parece ser Marena (su nombre no contiene "marena"). Abortado por seguridad.';
  END IF;

  -- Guarda anti doble-carga
  SELECT COUNT(*) INTO v_count FROM productos WHERE razon_social_id = v_rs AND usuario = 'carga-marena';
  IF v_count > 0 THEN RAISE EXCEPTION 'Abortado: Marena ya tiene % productos con usuario carga-marena.', v_count; END IF;

  -- Localizacion 'tienda' (+ su almacen). Si no existe, se crea bajo el primer almacen del tenant.
  SELECT id, almacen_id INTO v_loc, v_alm FROM localizaciones WHERE razon_social_id = v_rs AND nombre ILIKE 'tienda' ORDER BY id LIMIT 1;
  IF v_loc IS NULL THEN
    SELECT id INTO v_alm FROM almacenes WHERE razon_social_id = v_rs ORDER BY id LIMIT 1;
    IF v_alm IS NULL THEN RAISE EXCEPTION 'Marena no tiene almacen configurado.'; END IF;
    INSERT INTO localizaciones (nombre, almacen_id, razon_social_id, usuario) VALUES ('tienda', v_alm, v_rs, 'carga-marena') RETURNING id INTO v_loc;
  END IF;

  -- ===== Marca (crea si falta) =====
  INSERT INTO marcas (nombre, razon_social_id, usuario) SELECT 'Marena', v_rs, 'carga-marena' WHERE NOT EXISTS (SELECT 1 FROM marcas WHERE razon_social_id = v_rs AND nombre = 'Marena');

  -- ===== Categorias (crea las que falten) =====
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'Oro', v_rs, 'carga-marena' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = v_rs AND nombre = 'Oro');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'Acero', v_rs, 'carga-marena' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = v_rs AND nombre = 'Acero');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'Plata', v_rs, 'carga-marena' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = v_rs AND nombre = 'Plata');

  -- ===== Subcategorias (crea las que falten). En esta BD subcategorias NO tiene columna usuario. =====
  INSERT INTO subcategorias (nombre, categoria_id, razon_social_id)
    SELECT 'Arito', c.id, v_rs FROM categorias c
    WHERE c.razon_social_id = v_rs AND c.nombre = 'Oro'
      AND NOT EXISTS (SELECT 1 FROM subcategorias s WHERE s.razon_social_id = v_rs AND s.categoria_id = c.id AND s.nombre = 'Arito');
  INSERT INTO subcategorias (nombre, categoria_id, razon_social_id)
    SELECT 'Pulsera', c.id, v_rs FROM categorias c
    WHERE c.razon_social_id = v_rs AND c.nombre = 'Acero'
      AND NOT EXISTS (SELECT 1 FROM subcategorias s WHERE s.razon_social_id = v_rs AND s.categoria_id = c.id AND s.nombre = 'Pulsera');
  INSERT INTO subcategorias (nombre, categoria_id, razon_social_id)
    SELECT 'Collar', c.id, v_rs FROM categorias c
    WHERE c.razon_social_id = v_rs AND c.nombre = 'Acero'
      AND NOT EXISTS (SELECT 1 FROM subcategorias s WHERE s.razon_social_id = v_rs AND s.categoria_id = c.id AND s.nombre = 'Collar');
  INSERT INTO subcategorias (nombre, categoria_id, razon_social_id)
    SELECT 'Arito', c.id, v_rs FROM categorias c
    WHERE c.razon_social_id = v_rs AND c.nombre = 'Acero'
      AND NOT EXISTS (SELECT 1 FROM subcategorias s WHERE s.razon_social_id = v_rs AND s.categoria_id = c.id AND s.nombre = 'Arito');
  INSERT INTO subcategorias (nombre, categoria_id, razon_social_id)
    SELECT 'Set', c.id, v_rs FROM categorias c
    WHERE c.razon_social_id = v_rs AND c.nombre = 'Acero'
      AND NOT EXISTS (SELECT 1 FROM subcategorias s WHERE s.razon_social_id = v_rs AND s.categoria_id = c.id AND s.nombre = 'Set');
  INSERT INTO subcategorias (nombre, categoria_id, razon_social_id)
    SELECT 'Anillo', c.id, v_rs FROM categorias c
    WHERE c.razon_social_id = v_rs AND c.nombre = 'Acero'
      AND NOT EXISTS (SELECT 1 FROM subcategorias s WHERE s.razon_social_id = v_rs AND s.categoria_id = c.id AND s.nombre = 'Anillo');
  INSERT INTO subcategorias (nombre, categoria_id, razon_social_id)
    SELECT 'Arito', c.id, v_rs FROM categorias c
    WHERE c.razon_social_id = v_rs AND c.nombre = 'Plata'
      AND NOT EXISTS (SELECT 1 FROM subcategorias s WHERE s.razon_social_id = v_rs AND s.categoria_id = c.id AND s.nombre = 'Arito');
  INSERT INTO subcategorias (nombre, categoria_id, razon_social_id)
    SELECT 'Collar', c.id, v_rs FROM categorias c
    WHERE c.razon_social_id = v_rs AND c.nombre = 'Plata'
      AND NOT EXISTS (SELECT 1 FROM subcategorias s WHERE s.razon_social_id = v_rs AND s.categoria_id = c.id AND s.nombre = 'Collar');
  INSERT INTO subcategorias (nombre, categoria_id, razon_social_id)
    SELECT 'Set', c.id, v_rs FROM categorias c
    WHERE c.razon_social_id = v_rs AND c.nombre = 'Plata'
      AND NOT EXISTS (SELECT 1 FROM subcategorias s WHERE s.razon_social_id = v_rs AND s.categoria_id = c.id AND s.nombre = 'Set');
  INSERT INTO subcategorias (nombre, categoria_id, razon_social_id)
    SELECT 'Pulsera', c.id, v_rs FROM categorias c
    WHERE c.razon_social_id = v_rs AND c.nombre = 'Plata'
      AND NOT EXISTS (SELECT 1 FROM subcategorias s WHERE s.razon_social_id = v_rs AND s.categoria_id = c.id AND s.nombre = 'Pulsera');
  INSERT INTO subcategorias (nombre, categoria_id, razon_social_id)
    SELECT 'Anillo', c.id, v_rs FROM categorias c
    WHERE c.razon_social_id = v_rs AND c.nombre = 'Plata'
      AND NOT EXISTS (SELECT 1 FROM subcategorias s WHERE s.razon_social_id = v_rs AND s.categoria_id = c.id AND s.nombre = 'Anillo');

  -- ===== Productos =====
  INSERT INTO productos (nombre, codigo_barras, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, subcategoria_id, razon_social_id, usuario)
  SELECT d.nombre, d.codigo, d.precio, d.costo, d.cantidad,
         (SELECT id FROM marcas WHERE razon_social_id = v_rs AND nombre = 'Marena' ORDER BY id LIMIT 1),
         c.id, s.id, v_rs, 'carga-marena'
  FROM (VALUES
    ('397AROR001', 'Oro Arito de rosca', 2, 397, 795, 'Oro', 'Arito'),
    ('425AROR001', 'Oro Arito de rosca', 3, 425, 850, 'Oro', 'Arito'),
    ('538AROR001', 'Oro Arito de rosca', 1, 538, 1080, 'Oro', 'Arito'),
    ('538AROR002', 'Oro Arito de rosca', 1, 538, 1080, 'Oro', 'Arito'),
    ('482AROR001', 'Oro Arito de rosca', 1, 482, 965, 'Oro', 'Arito'),
    ('482AROR002', 'Oro Arito de rosca', 1, 482, 965, 'Oro', 'Arito'),
    ('595AROR001', 'Oro Arito de rosca', 2, 595, 1200, 'Oro', 'Arito'),
    ('652AROR001', 'Oro Arito de rosca', 1, 652, 1300, 'Oro', 'Arito'),
    ('680AROR001', 'Oro Arito de rosca', 1, 680, 1370, 'Oro', 'Arito'),
    ('822AROR001', 'Oro Arito de rosca', 1, 822, 1650, 'Oro', 'Arito'),
    ('1304AROR001', 'Oro Arito de rosca', 1, 1304, 2610, 'Oro', 'Arito'),
    ('140PLAC002', 'Acero Pulsera', 1, 140, 350, 'Acero', 'Pulsera'),
    ('110COAC001', 'Acero Collar', 3, 110, 350, 'Acero', 'Collar'),
    ('272COAC001', 'Acero Collar', 2, 272, 580, 'Acero', 'Collar'),
    ('111COAC001', 'Acero Collar', 2, 111, 350, 'Acero', 'Collar'),
    ('156COAC001', 'Acero Collar', 1, 156, 395, 'Acero', 'Collar'),
    ('300COAC001', 'Acero Collar', 1, 300, 620, 'Acero', 'Collar'),
    ('137COAC001', 'Acero Collar', 2, 137, 380, 'Acero', 'Collar'),
    ('195COAC001', 'Acero Collar', 2, 195, 495, 'Acero', 'Collar'),
    ('192PLAC001', 'Acero Pulsera', 1, 192, 485, 'Acero', 'Pulsera'),
    ('104PLAC001', 'Acero Pulsera', 1, 104, 285, 'Acero', 'Pulsera'),
    ('122PLAC001', 'Acero Pulsera', 6, 122, 310, 'Acero', 'Pulsera'),
    ('132PLAC001', 'Acero Pulsera', 1, 132, 350, 'Acero', 'Pulsera'),
    ('89PLAC001', 'Acero Pulsera', 3, 89, 285, 'Acero', 'Pulsera'),
    ('64PLAC001', 'Acero Pulsera', 6, 64, 220, 'Acero', 'Pulsera'),
    ('78ARAC001', 'Acero Arito', 2, 78, 250, 'Acero', 'Arito'),
    ('66ARAC001', 'Acero Arito', 2, 66, 250, 'Acero', 'Arito'),
    ('114ARAC001', 'Acero Arito', 1, 114, 300, 'Acero', 'Arito'),
    ('133ARAC001', 'Acero Arito', 1, 133, 350, 'Acero', 'Arito'),
    ('210SEAC001', 'Acero Set', 1, 210, 550, 'Acero', 'Set'),
    ('93COAC001', 'Acero Collar', 2, 93, 300, 'Acero', 'Collar'),
    ('200COAC001', 'Acero Collar', 3, 200, 520, 'Acero', 'Collar'),
    ('96ANAC001', 'Acero Anillo', 2, 96, 300, 'Acero', 'Anillo'),
    ('96ANAC002', 'Acero Anillo', 2, 96, 300, 'Acero', 'Anillo'),
    ('92ANAC001', 'Acero Anillo', 2, 92, 300, 'Acero', 'Anillo'),
    ('93ANAC001', 'Acero Anillo', 2, 93, 300, 'Acero', 'Anillo'),
    ('78ANAC001', 'Acero Anillo', 3, 78, 250, 'Acero', 'Anillo'),
    ('144ANAC001', 'Acero Anillo', 2, 144, 370, 'Acero', 'Anillo'),
    ('113ANAC001', 'Acero Anillo', 2, 113, 300, 'Acero', 'Anillo'),
    ('212ARPA001', 'Plata Arito', 1, 212, 470, 'Plata', 'Arito'),
    ('299ARPA001', 'Plata Arito', 1, 299, 660, 'Plata', 'Arito'),
    ('322ARPA001', 'Plata Arito', 1, 322, 710, 'Plata', 'Arito'),
    ('361ARPA001', 'Plata Arito', 1, 361, 795, 'Plata', 'Arito'),
    ('385ARPA001', 'Plata Arito', 1, 385, 850, 'Plata', 'Arito'),
    ('386ARPA001', 'Plata Arito', 1, 386, 850, 'Plata', 'Arito'),
    ('387ARPA001', 'Plata Arito', 1, 387, 850, 'Plata', 'Arito'),
    ('410ARPA001', 'Plata Arito', 1, 410, 910, 'Plata', 'Arito'),
    ('427ARPA001', 'Plata Arito', 1, 427, 940, 'Plata', 'Arito'),
    ('427ARPA002', 'Plata Arito', 1, 427, 860, 'Plata', 'Arito'),
    ('429ARPA001', 'Plata Arito', 1, 429, 950, 'Plata', 'Arito'),
    ('435ARPA001', 'Plata Arito', 1, 435, 960, 'Plata', 'Arito'),
    ('447ARPA001', 'Plata Arito', 1, 447, 985, 'Plata', 'Arito'),
    ('451ARPA001', 'Plata Arito', 1, 451, 995, 'Plata', 'Arito'),
    ('453ARPA001', 'Plata Arito', 1, 453, 995, 'Plata', 'Arito'),
    ('478ARPA001', 'Plata Arito', 2, 478, 1060, 'Plata', 'Arito'),
    ('505ARPA001', 'Plata Arito', 1, 505, 1115, 'Plata', 'Arito'),
    ('517ARPA001', 'Plata Arito', 1, 517, 1140, 'Plata', 'Arito'),
    ('557ARPA001', 'Plata Arito', 1, 557, 1230, 'Plata', 'Arito'),
    ('590ARPA001', 'Plata Arito', 1, 590, 1300, 'Plata', 'Arito'),
    ('596ARPA001', 'Plata Arito', 1, 596, 1320, 'Plata', 'Arito'),
    ('605ARPA001', 'Plata Arito', 1, 605, 1340, 'Plata', 'Arito'),
    ('633ARPA001', 'Plata Arito', 1, 633, 1395, 'Plata', 'Arito'),
    ('661ARPA001', 'Plata Arito', 1, 661, 1460, 'Plata', 'Arito'),
    ('662ARPA001', 'Plata Arito', 1, 662, 1460, 'Plata', 'Arito'),
    ('687ARPA001', 'Plata Arito', 1, 687, 1515, 'Plata', 'Arito'),
    ('716ARPA001', 'Plata Arito', 1, 716, 1580, 'Plata', 'Arito'),
    ('844ARPA001', 'Plata Arito', 1, 844, 1860, 'Plata', 'Arito'),
    ('846ARPA001', 'Plata Arito', 1, 846, 1860, 'Plata', 'Arito'),
    ('874ARPA001', 'Plata Arito', 1, 874, 1930, 'Plata', 'Arito'),
    ('1010ARPA001', 'Plata Arito', 1, 1010, 2230, 'Plata', 'Arito'),
    ('1055ARPA001', 'Plata Arito', 1, 1055, 2325, 'Plata', 'Arito'),
    ('279COPA001', 'Plata Collar', 1, 279, 620, 'Plata', 'Collar'),
    ('325COPA001', 'Plata Collar', 1, 325, 720, 'Plata', 'Collar'),
    ('325COPA002', 'Plata Collar', 1, 325, 720, 'Plata', 'Collar'),
    ('325COPA003', 'Plata Collar', 1, 325, 720, 'Plata', 'Collar'),
    ('334COPA001', 'Plata Collar', 1, 334, 740, 'Plata', 'Collar'),
    ('361COPA001', 'Plata Collar colores', 2, 361, 795, 'Plata', 'Collar'),
    ('363COPA001', 'Plata Collar', 1, 363, 800, 'Plata', 'Collar'),
    ('376COPA001', 'Plata Collar', 1, 376, 830, 'Plata', 'Collar'),
    ('470COPA001', 'Plata Collar', 1, 470, 950, 'Plata', 'Collar'),
    ('575COPA001', 'Plata Collar', 1, 575, 1150, 'Plata', 'Collar'),
    ('589COPA001', 'Plata Collar', 1, 589, 1180, 'Plata', 'Collar'),
    ('595COPA001', 'Plata Collar', 1, 595, 1200, 'Plata', 'Collar'),
    ('626COPA001', 'Plata Collar', 1, 626, 1260, 'Plata', 'Collar'),
    ('644COPA001', 'Plata Collar', 1, 644, 1300, 'Plata', 'Collar'),
    ('520COPA001', 'Plata Collar', 1, 520, 1150, 'Plata', 'Collar'),
    ('494SEPA001', 'Plata Set', 1, 494, 1090, 'Plata', 'Set'),
    ('494SEPA002', 'Plata Set', 1, 494, 1090, 'Plata', 'Set'),
    ('708SEPA001', 'Plata Set', 1, 708, 1560, 'Plata', 'Set'),
    ('708SEPA002', 'Plata Set', 1, 708, 1560, 'Plata', 'Set'),
    ('708SEPA003', 'Plata Set', 1, 708, 1560, 'Plata', 'Set'),
    ('771SEPA001', 'Plata Set', 1, 771, 1695, 'Plata', 'Set'),
    ('803SEPA001', 'Plata Set', 1, 803, 1620, 'Plata', 'Set'),
    ('821SEPA001', 'Plata Set', 1, 821, 1800, 'Plata', 'Set'),
    ('822SEPA001', 'Plata Set', 1, 822, 1800, 'Plata', 'Set'),
    ('853SEPA001', 'Plata Set', 1, 853, 1880, 'Plata', 'Set'),
    ('1052SEPA001', 'Plata Set', 1, 1052, 2100, 'Plata', 'Set'),
    ('1332SEPA001', 'Plata Set', 1, 1332, 2665, 'Plata', 'Set'),
    ('1709SEPA001', 'Plata Set', 1, 1709, 3420, 'Plata', 'Set'),
    ('1848SEPA001', 'Plata Set', 1, 1848, 3700, 'Plata', 'Set'),
    ('1269SEPA001', 'Plata Set', 1, 1269, 2540, 'Plata', 'Set'),
    ('249PLPA001', 'Plata Pulsera colores', 11, 249, 495, 'Plata', 'Pulsera'),
    ('572ANPA001', 'Plata Anillo', 1, 572, 1150, 'Plata', 'Anillo'),
    ('634ANPA001', 'Plata Anillo', 2, 634, 1270, 'Plata', 'Anillo'),
    ('747ANPA001', 'Plata Anillo', 2, 747, 1495, 'Plata', 'Anillo'),
    ('559PLPA001', 'Plata Pulsera', 2, 559, 1120, 'Plata', 'Pulsera'),
    ('719PLPA001', 'Plata Pulsera', 2, 719, 1440, 'Plata', 'Pulsera'),
    ('733PLPLA001', 'Plata Pulsera', 2, 733, 1470, 'Plata', 'Pulsera'),
    ('418COPA001', 'Plata Collar', 2, 418, 840, 'Plata', 'Collar'),
    ('471COPA001', 'Plata Collar', 1, 471, 950, 'Plata', 'Collar'),
    ('474COPA001', 'Plata Collar', 2, 474, 960, 'Plata', 'Collar'),
    ('698COPA001', 'Plata Collar', 2, 698, 1400, 'Plata', 'Collar'),
    ('559SEPA001', 'Plata Set', 2, 559, 1230, 'Plata', 'Set'),
    ('705SEPA001', 'Plata Set', 2, 705, 1560, 'Plata', 'Set'),
    ('965SEPA001', 'Plata Set', 2, 965, 1950, 'Plata', 'Set'),
    ('290ARPA001', 'Plata Arito', 2, 290, 580, 'Plata', 'Arito'),
    ('375ARPA001', 'Plata Arito', 2, 375, 760, 'Plata', 'Arito'),
    ('503ARPA001', 'Plata Arito', 1, 503, 1020, 'Plata', 'Arito'),
    ('779ARPA001', 'Plata Arito', 1, 779, 1560, 'Plata', 'Arito'),
    ('843ARPA001', 'Plata Arito', 1, 843, 1695, 'Plata', 'Arito')
  ) AS d(codigo, nombre, cantidad, costo, precio, categoria, subcategoria)
  JOIN categorias c ON c.razon_social_id = v_rs AND c.nombre = d.categoria
  JOIN subcategorias s ON s.razon_social_id = v_rs AND s.categoria_id = c.id AND s.nombre = d.subcategoria
  WHERE NOT EXISTS (SELECT 1 FROM productos p2 WHERE p2.razon_social_id = v_rs AND p2.codigo_barras = d.codigo);

  -- Conteo insertado (los codigos que ya existan en el tenant se omiten para no duplicar)
  SELECT COUNT(*) INTO v_count FROM productos WHERE razon_social_id = v_rs AND usuario = 'carga-marena';
  RAISE NOTICE 'Marena: insertados % de 120 productos (codigos ya existentes se omitieron).', v_count;

  -- ===== Kardex (Ingreso Manual) por producto con existencia =====
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  SELECT p.id, v_alm, v_loc, 'Ingreso Manual', p.stock_total, p.costo_promedio, v_rs, 'carga-marena'
  FROM productos p
  WHERE p.razon_social_id = v_rs AND p.usuario = 'carga-marena' AND p.stock_total > 0;

  RAISE NOTICE 'Marena OK: rs=%, almacen=%, localizacion=%, productos=%.', v_rs, v_alm, v_loc, v_count;
END $$;
