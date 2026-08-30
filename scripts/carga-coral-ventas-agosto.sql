-- ============================================================================
-- Ventas de AGOSTO 2026 - CORAL SWIMWEAR (razon_social_id = 10)
-- SOLO REGISTROS DE VENTA. NO afecta inventario (cero movimientos de kardex,
-- stock intacto). No toca caja ni bancos. PRECIO = total pagado (ISV incluido).
--
-- Ventas (encabezados): 32   |   Lineas de detalle: 59
-- Ingreso total (bruto): L 201884
-- Clientes creados (si no existen): 32
-- Productos NUEVOS creados por ventas sin match en catalogo (stock 0): 34
--   207-2, 26102B, 26117C, 26125C, 26514C, 26528T, 95039, 9642-U, 9642-V, 96493, 967, JZ26011M, JZ26240M, O36254, P17357, P18365, PT2304SBR011, PT2404STR064, PT2748CLD002, PT3057CLD002, PT3067CKL002, PT3155CVT001, PT3392CLD002, PT3440CVT001, PT4005SOC002, PT4011XTE031, PT4016KKB001, PT5139SCC003, PT525, PT5283SOB001, PT5423SCC005, PT5475SOB001, T101364, T87333
-- ============================================================================

DO $$
DECLARE
  v_cliente bigint;
  v_prod    bigint;
  v_venta   bigint;
  v_marca   bigint;
  v_count   int;
  v_seq     int := 0;
BEGIN
  SELECT COUNT(*) INTO v_count FROM ventas_encabezado WHERE razon_social_id = 10 AND usuario = 'carga-agosto';
  IF v_count > 0 THEN
    RAISE EXCEPTION 'Abortado: ya hay % ventas con usuario carga-agosto en rs 10.', v_count;
  END IF;

  -- ===== Clientes (crea solo los que falten) =====
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'REDELL COOPER', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'REDELL COOPER');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'APRIL TOBIE', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'APRIL TOBIE');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'PATRICIA', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'PATRICIA');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'CAROL CABEZA', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'CAROL CABEZA');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'ROXANA CIERRA', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'ROXANA CIERRA');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'ROSIE UMAÑA', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'ROSIE UMAÑA');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'TRISKA MCNANB', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'TRISKA MCNANB');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'MARÍA MORALES', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'MARÍA MORALES');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'JHASSANY RAMIREZ', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'JHASSANY RAMIREZ');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'DARLIN ROMERO', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'DARLIN ROMERO');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'ISABELLA RIVERA', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'ISABELLA RIVERA');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'AMY SARAHI AMADOR', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'AMY SARAHI AMADOR');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'ANA MORALES', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'ANA MORALES');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'MAXIMA CERRATO', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'MAXIMA CERRATO');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'SOFIA OCHOA', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'SOFIA OCHOA');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'ARYANY ORTEGA', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'ARYANY ORTEGA');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'SONIA BUESO', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'SONIA BUESO');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'CRISTIAN PADILLA', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'CRISTIAN PADILLA');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'VALESKA LOPEZ', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'VALESKA LOPEZ');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'CHONGMOON CHO/HAN COREANA', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'CHONGMOON CHO/HAN COREANA');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'JESSICA BUESO', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'JESSICA BUESO');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'ANAIS AVUFELE', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'ANAIS AVUFELE');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'SANDRA DAVID', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'SANDRA DAVID');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'IVETH LOBO', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'IVETH LOBO');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'ROSY UMAÑA', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'ROSY UMAÑA');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'LEILANI SILVESTRE', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'LEILANI SILVESTRE');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'KENCI POSAS', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'KENCI POSAS');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'KARLA BUESO', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'KARLA BUESO');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'MÓNICA IBRAHIM', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'MÓNICA IBRAHIM');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'STEFANY PAZ', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'STEFANY PAZ');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'BRITANY', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'BRITANY');
  INSERT INTO clientes (nombre, razon_social_id, usuario) SELECT 'ELENA', 10, 'carga-agosto' WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE razon_social_id = 10 AND nombre = 'ELENA');

  -- ===== Ventas (encabezado + detalle, SIN inventario) =====
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'REDELL COOPER' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-01 12:00:00', 'Credito', true, 15, 0, 2608.7, 391.3, 3000, 0, 'Pendiente', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '5405' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '5405.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('ZAMBU WHITE SHIRT', '5405', 'SMALL/MEDIUM', 3000, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 3000, 0, 3000, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'APRIL TOBIE' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-03 12:00:00', 'Contado', true, 15, 0, 0, 0, 0, 0, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '9616' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '9616.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('AINA ZAFIRO SUNSET SET', '9616', 'MEDIUM/LARGE', 0, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 0, 0, 0, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'PT3067CKL002' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'PT3067CKL002.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('GOLDEN BLOSSOM SKIRT', 'PT3067CKL002', 'MEDIUM', 0, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 0, 0, 0, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'PT3392CLD002' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'PT3392CLD002.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('COSMIC OZEN DRESS', 'PT3392CLD002', 'SMALL', 0, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 0, 0, 0, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'PT2748CLD002' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'PT2748CLD002.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('SIA DRESS', 'PT2748CLD002', 'SMALL', 0, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 0, 0, 0, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '9642-U' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '9642-U.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('GEM NECKLESS BLANCO VERDE', '9642-U', 'OS', 0, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 0, 0, 0, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'PT5423SCC005' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'PT5423SCC005.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('SUNKISSED SHORE BIKINI', 'PT5423SCC005', 'MEDIUM', 0, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 0, 0, 0, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'T10348' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'T10348.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('GOLDEN GREEN HALO BIKINI', 'T10348', 'MEDIUM', 0, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 0, 0, 0, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'PATRICIA' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-04 12:00:00', 'Contado', true, 15, 0, 4000, 600, 4600, 4600, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'T101352' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'T101352.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('TROPICAL MISTIC CHALO', 'T101352', 'MEDIUM', 4600, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 4600, 0, 4600, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'CAROL CABEZA' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-05 12:00:00', 'Contado', true, 15, 0, 39142.61, 5871.39, 45014, 45014, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'PT3057CLD002' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'PT3057CLD002.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('LUPINE DRESS', 'PT3057CLD002', 'MEDIUM', 4474, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 4474, 0, 4474, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'PT3155CVT001' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'PT3155CVT001.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('SHELL/NELLE SET', 'PT3155CVT001', 'MEDIUM', 7240, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 7240, 0, 7240, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '967' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '967.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('MADDISON SET', '967', 'MEDIUM/LARGE', 9000, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 9000, 0, 9000, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '26102B' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '26102B.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'COSITA LINDA' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('LOVE BLOOM HIGH WAIST BIKINI', '26102B', 'MEDIUM', 6000, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 6000, 0, 6000, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '26528T' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '26528T.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('JUNGLE FEVER SUNHALO BIKINI', '26528T', 'MEDIUM', 2600, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 2600, 0, 2600, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '26117C' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '26117C.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'COSITA LINDA' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('TANK MAXI DRESS', '26117C', 'SMALL', 6800, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 6800, 0, 6800, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'C31333' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'C31333.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('JADE OASIS SET', 'C31333', 'LARGE', 6600, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 6600, 0, 6600, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '9166' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '9166.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('9166', '9166', 'MEDIUM', 2300, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 2300, 0, 2300, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'ROXANA CIERRA' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-05 12:00:00', 'Contado', true, 15, 0, 4043.48, 606.52, 4650, 4650, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'PT2304SBR011' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'PT2304SBR011.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('JUNGLE LANAI BIKINI', 'PT2304SBR011', 'LARGE', 4650, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 4650, 0, 4650, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'ROSIE UMAÑA' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-05 12:00:00', 'Contado', true, 15, 0, 3826.09, 573.91, 4400, 4400, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '96493' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '96493.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('SERINA ONE PIECE', '96493', 'MEDIUM', 4400, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 4400, 0, 4400, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'TRISKA MCNANB' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-06 12:00:00', 'Contado', true, 15, 0, 2608.7, 391.3, 3000, 3000, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '9463' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '9463.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('BIVAL JAQUARD BLACK ONE PIECE', '9463', 'XL', 3000, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 3000, 0, 3000, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'MARÍA MORALES' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-06 12:00:00', 'Contado', true, 15, 0, 3739.13, 560.87, 4300, 4300, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '95784' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '95784.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('STONE TOWN SUNNY IZZIE', '95784', 'MEDIUM', 4300, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 4300, 0, 4300, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'JHASSANY RAMIREZ' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-06 12:00:00', 'Contado', true, 15, 0, 4652.17, 697.83, 5350, 5350, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '9642-V' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '9642-V.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('GEM NECKLES BLANCO CAFE', '9642-V', 'OS', 1450, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 1450, 0, 1450, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'PT3440CVT001' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'PT3440CVT001.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('DEEP SEA CALISTA SKIRT', 'PT3440CVT001', 'MEDIUM', 3900, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 3900, 0, 3900, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'DARLIN ROMERO' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-07 12:00:00', 'Contado', true, 15, 0, 1130.43, 169.57, 1300, 1300, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '5202361' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '5202361.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('ENTERO MANGA LARGA SISA CON COLA', '5202361', 'TALLA 16', 1300, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 1300, 0, 1300, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'ISABELLA RIVERA' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-07 12:00:00', 'Contado', true, 15, 0, 2678.26, 401.74, 3080, 3080, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '95039' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '95039.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('MAUI TRIANGLE CRYSTAL BIKINI', '95039', 'MEDIUM/LARGE', 3080, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 3080, 0, 3080, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'AMY SARAHI AMADOR' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-08 12:00:00', 'Contado', true, 15, 0, 10000, 1500, 11500, 11500, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'T10351' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'T10351.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('GOLD RED HALO BIKINI', 'T10351', 'SMALL/XS', 4500, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 4500, 0, 4500, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '207-2' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '207-2.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('LUCY OINK', '207-2', 'OS', 2350, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 2350, 0, 2350, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'PT4005SOC002' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'PT4005SOC002.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('SUNBEAN GLOW ONE PIECE', 'PT4005SOC002', 'SMALL', 4650, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 4650, 0, 4650, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'ANA MORALES' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-08 12:00:00', 'Contado', true, 15, 0, 17391.3, 2608.7, 20000, 20000, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'PT2404STR064' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'PT2404STR064.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('DREAMSCAPE GLOW BALMY BIKINI', 'PT2404STR064', 'MEDIUM', 4550, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 4550, 0, 4550, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'T01365' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'T01365.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('SUMMER CHARM TRIANGLE BIKINI', 'T01365', 'SMALL', 4750, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 4750, 0, 4750, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'P18365' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'P18365.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('SUMMER CHARM ROONE PAREO', 'P18365', 'OS', 3000, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 3000, 0, 3000, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '9466' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '9466.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('MARGARITA PETRO BLUE ONE PIECE', '9466', 'MEDIUM', 3000, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 3000, 0, 3000, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '196-3' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '196-3.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('DELILAH GOLD', '196-3', 'OS', 2350, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 2350, 0, 2350, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '180-10' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '180-10.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('WESTON EMERALD', '180-10', 'OS', 2350, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 2350, 0, 2350, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'MAXIMA CERRATO' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-10 12:00:00', 'Contado', true, 15, 0, 6260.87, 939.13, 7200, 7200, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'PT4011XTE031' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'PT4011XTE031.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('COSMIC TROPIC SUR BAG', 'PT4011XTE031', 'OS', 1800, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 1800, 0, 1800, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'JZ26240M' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'JZ26240M.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'JANTZEN' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('COBALT 411', 'JZ26240M', 'SIZE 10', 2700, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 2700, 0, 2700, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'JZ26011M' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'JZ26011M.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'JANTZEN' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('BLACK 001', 'JZ26011M', 'SIZE 12', 2700, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 2700, 0, 2700, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'SOFIA OCHOA' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-10 12:00:00', 'Contado', true, 15, 0, 4434.78, 665.22, 5100, 5100, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'PT5139SCC003' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'PT5139SCC003.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('JUNGLE WHISPER RASHGUARD', 'PT5139SCC003', 'LARGE', 5100, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 5100, 0, 5100, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'ARYANY ORTEGA' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-10 12:00:00', 'Contado', true, 15, 0, 5217.39, 782.61, 6000, 6000, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'PT5475SOB001' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'PT5475SOB001.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('PT5475SOB001', 'PT5475SOB001', 'LARGE', 6000, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 6000, 0, 6000, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'SONIA BUESO' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-10 12:00:00', 'Credito', true, 15, 0, 3130.43, 469.57, 3600, 0, 'Pendiente', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'P17357' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'P17357.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('ZEBRA LINE BLUE MUST PAREO', 'P17357', 'OS', 3600, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 3600, 0, 3600, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'CRISTIAN PADILLA' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-11 12:00:00', 'Contado', true, 15, 0, 4826.09, 723.91, 5550, 5550, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '34020' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '34020.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('MILOS SOLID NAVY TRUNK', '34020', 'LARGE', 3950, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 3950, 0, 3950, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '26514C' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '26514C.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('DAY BREAK PRINT SHIRT', '26514C', 'SMALL', 1600, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 1600, 0, 1600, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'VALESKA LOPEZ' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-12 12:00:00', 'Contado', true, 15, 0, 4539.13, 680.87, 5220, 5220, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '9466' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '9466.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('MARGARITA PETRO BLUE ONE PIECE', '9466', 'SMALL', 3000, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 3000, 0, 3000, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '92683' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '92683.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('KAREN ONE PIECE', '92683', 'SMALL', 2220, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 2220, 0, 2220, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'CHONGMOON CHO/HAN COREANA' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-12 12:00:00', 'Contado', true, 15, 0, 2043.48, 306.52, 2350, 2350, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '207-2' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '207-2.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('LUCY PINK', '207-2', 'OS', 2350, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 2350, 0, 2350, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'JESSICA BUESO' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-14 12:00:00', 'Contado', true, 15, 0, 1826.09, 273.91, 2100, 2100, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'PT4016KKB001' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'PT4016KKB001.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('BELLY GIRL SET', 'PT4016KKB001', 'TALLA 10', 2100, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 2100, 0, 2100, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'ANAIS AVUFELE' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-14 12:00:00', 'Contado', true, 15, 0, 2800, 420, 3220, 3220, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'T87333' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'T87333.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('JADE OASIS TORI', 'T87333', 'MEDIUM', 3220, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 3220, 0, 3220, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'SANDRA DAVID' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-14 12:00:00', 'Contado', true, 15, 0, 11956.52, 1793.48, 13750, 13750, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'PT5283SOB001' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'PT5283SOB001.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('MORROCAN PALMS BRIELLA ONE PIECE', 'PT5283SOB001', 'MEDIUM', 5600, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 5600, 0, 5600, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '9508' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '9508.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('WHITE SAGE ZENDA PANT', '9508', 'MEDIUM', 5000, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 5000, 0, 5000, 10);
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '9507' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '9507.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('WHIT AYLA SHIRT', '9507', 'MEDIUM', 3150, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 3150, 0, 3150, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'IVETH LOBO' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-15 12:00:00', 'Contado', true, 15, 0, 2956.52, 443.48, 3400, 3400, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '26125C' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '26125C.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'COSITA LINDA' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('PEACH SARONG', '26125C', 'SMALL', 3400, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 3400, 0, 3400, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'ROSY UMAÑA' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-15 12:00:00', 'Contado', true, 15, 0, 3913.04, 586.96, 4500, 4500, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'O40156' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'O40156.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('TEXTURED BLACK ONE PIECE', 'O40156', 'MEDIUM', 4500, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 4500, 0, 4500, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'LEILANI SILVESTRE' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-19 12:00:00', 'Contado', true, 15, 0, 3478.26, 521.74, 4000, 4000, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '95713' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '95713.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('SACRED SUN HANNA ONE PIECE', '95713', 'MEDIUM', 4000, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 4000, 0, 4000, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'KENCI POSAS' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-19 12:00:00', 'Contado', true, 15, 0, 4173.91, 626.09, 4800, 4800, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'O36254' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'O36254.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('EARTH BROWN ONE PIECE', 'O36254', 'SMALL', 4800, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 4800, 0, 4800, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'KARLA BUESO' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-20 12:00:00', 'Contado', true, 15, 0, 3913.04, 586.96, 4500, 4500, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'T101364' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'T101364.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('SUMMER CHARN HALO BIKINI', 'T101364', 'SMALL', 4500, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 4500, 0, 4500, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'MÓNICA IBRAHIM' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-22 12:00:00', 'Contado', true, 15, 0, 3217.39, 482.61, 3700, 3700, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '9474' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '9474.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('CROCHET ORANGE BAG', '9474', 'OS', 3700, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 3700, 0, 3700, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'STEFANY PAZ' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-24 12:00:00', 'Contado', true, 15, 0, 3217.39, 482.61, 3700, 3700, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = '96123' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE '96123.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('ROCKI ONE PIECE', '96123', 'S', 3700, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 3700, 0, 3700, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'BRITANY' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-24 12:00:00', 'Contado', true, 15, 0, 4086.96, 613.04, 4700, 4700, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'PT525' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 'PT525.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('CALI PETIT', 'PT525', 'S', 4700, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 4700, 0, 4700, 10);
  v_seq := v_seq + 1;
  v_cliente := (SELECT id FROM clientes WHERE razon_social_id = 10 AND nombre = 'ELENA' ORDER BY id LIMIT 1);
  INSERT INTO ventas_encabezado (numero_factura, cliente_id, almacen_id, fecha_venta, tipo_pago, aplica_impuesto, porcentaje_impuesto, descuento, subtotal, impuesto_total, total_venta, valorpago, estado_pago, razon_social_id, usuario)
  VALUES ('CS-2026-08-' || lpad(v_seq::text, 4, '0'), v_cliente, 6, '2026-08-24 12:00:00', 'Contado', true, 15, 0, 3739.13, 560.87, 4300, 4300, 'Pagado', 10, 'carga-agosto') RETURNING id INTO v_venta;
  v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND upper(codigo_barras) = 'T10372' ORDER BY id LIMIT 1);
  IF v_prod IS NULL THEN v_prod := (SELECT id FROM productos WHERE razon_social_id = 10 AND codigo_barras ILIKE 't10372.%' ORDER BY id LIMIT 1); END IF;
  IF v_prod IS NULL THEN
    v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
    INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
    VALUES ('TANGERINE', 't10372', NULL, 4300, 0, 0, v_marca, NULL, 10, 'venta-agosto') RETURNING id INTO v_prod;
  END IF;
  INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, costo_promedio_momento, utilidad_linea, razon_social_id)
  VALUES (v_venta, v_prod, 1, 4300, 0, 4300, 10);

  RAISE NOTICE 'Ventas agosto Coral OK: % ventas, % lineas.', 32, 59;
END
$$;
