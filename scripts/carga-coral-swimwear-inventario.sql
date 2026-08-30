-- ============================================================================
-- Carga de inventario inicial - CORAL SWIMWEAR (razon_social_id = 10)
-- Almacen 6 (BOUTIQUE CORAL) / Localizacion 7 (TIENDA / PERCHEROS)
-- Generado desde el conteo fisico. Costo promedio = 0 (sin dato de costo).
-- Movimiento de kardex: 'Ingreso Manual' (cantidad = existencia contada).
--
-- Productos:            697
-- Con existencia (>0):  687  (kardex)  |  unidades: 792
-- Categorias destino:   31  (16 nuevas, 15 existentes)
-- Marcas destino:       17  (6 nuevas, 11 existentes)
--
-- Categorias NUEVAS: ACCESORIOS, BANDANA, BODY SPRAY, BOLSA, CARTERA, CARTERA DE HOMBRE, CHUMPA, EXFOLEANTES, FUNDA, GORRA, KIT DE CUIDADO, MINI MONEDERO, SEA SPRAY, SHORT, SUNCREEN FACE, SUNCREEN SPRAY
-- Marcas NUEVAS:     ESTIVO, MOLA MOLA, REBELL, SUN BUM, TOUCHÉ, TRUE OCEAN
-- ============================================================================

DO $$
DECLARE
  v_cat   bigint;
  v_marca bigint;
  v_prod  bigint;
  v_count int;
BEGIN
  -- Guarda anti doble-carga: exige razon_social 10 en ceros (corre el reset antes).
  SELECT COUNT(*) INTO v_count FROM productos WHERE razon_social_id = 10;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'Abortado: razon_social 10 ya tiene % productos. Corre el reset antes de cargar.', v_count;
  END IF;

  -- ===== Categorias (crea solo las que falten para el tenant 10) =====
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'ACCESORIOS', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'BANDANA', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'BANDANA');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'Bikinis', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'BODY SPRAY', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'BODY SPRAY');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'BOLSA', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'BOLSA');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'CAMISAS DE HOMBRE', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'CAMISAS/TOPS', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'CARTERA', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'CARTERA');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'CARTERA DE HOMBRE', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'CARTERA DE HOMBRE');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'CHUMPA', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'CHUMPA');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'Enteros', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'EXFOLEANTES', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'EXFOLEANTES');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'FALDAS', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'FALDAS');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'FUNDA', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'FUNDA');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'GORRA', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'GORRA');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'Kids', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'Kids');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'KIT DE CUIDADO', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'KIT DE CUIDADO');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'Lentes', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'MINI MONEDERO', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'MINI MONEDERO');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'PANT', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANT');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'PANTS DE HOMBRE', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANTS DE HOMBRE');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'SALIDAS/PAREOS', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'SEA SPRAY', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'SEA SPRAY');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'SETS', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'SHORT', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORT');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'SHORTS DE HOMBRE', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORTS DE HOMBRE');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'SUNCREEN FACE', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'SUNCREEN FACE');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'SUNCREEN SPRAY', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'SUNCREEN SPRAY');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'TENNIS ', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'TRAJE DE BAÑO', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO');
  INSERT INTO categorias (nombre, razon_social_id, usuario) SELECT 'VESTIDOS', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS');

  -- ===== Marcas (crea solo las que falten para el tenant 10) =====
  INSERT INTO marcas (nombre, razon_social_id, usuario) SELECT 'ACCESORIOS', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS');
  INSERT INTO marcas (nombre, razon_social_id, usuario) SELECT 'CORPO', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO');
  INSERT INTO marcas (nombre, razon_social_id, usuario) SELECT 'COSITA LINDA', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM marcas WHERE razon_social_id = 10 AND nombre = 'COSITA LINDA');
  INSERT INTO marcas (nombre, razon_social_id, usuario) SELECT 'ESTIVO', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM marcas WHERE razon_social_id = 10 AND nombre = 'ESTIVO');
  INSERT INTO marcas (nombre, razon_social_id, usuario) SELECT 'FREYERS', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS');
  INSERT INTO marcas (nombre, razon_social_id, usuario) SELECT 'KIBYS', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS');
  INSERT INTO marcas (nombre, razon_social_id, usuario) SELECT 'MAAJI', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI');
  INSERT INTO marcas (nombre, razon_social_id, usuario) SELECT 'MALAI', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI');
  INSERT INTO marcas (nombre, razon_social_id, usuario) SELECT 'MOLA MOLA', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM marcas WHERE razon_social_id = 10 AND nombre = 'MOLA MOLA');
  INSERT INTO marcas (nombre, razon_social_id, usuario) SELECT 'OFF CORSE', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE');
  INSERT INTO marcas (nombre, razon_social_id, usuario) SELECT 'PHAX', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX');
  INSERT INTO marcas (nombre, razon_social_id, usuario) SELECT 'REBELL', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM marcas WHERE razon_social_id = 10 AND nombre = 'REBELL');
  INSERT INTO marcas (nombre, razon_social_id, usuario) SELECT 'SEA SALT', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT');
  INSERT INTO marcas (nombre, razon_social_id, usuario) SELECT 'SUN BUM', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM marcas WHERE razon_social_id = 10 AND nombre = 'SUN BUM');
  INSERT INTO marcas (nombre, razon_social_id, usuario) SELECT 'SWIMS', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS');
  INSERT INTO marcas (nombre, razon_social_id, usuario) SELECT 'TOUCHÉ', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM marcas WHERE razon_social_id = 10 AND nombre = 'TOUCHÉ');
  INSERT INTO marcas (nombre, razon_social_id, usuario) SELECT 'TRUE OCEAN', 10, 'carga-inicial' WHERE NOT EXISTS (SELECT 1 FROM marcas WHERE razon_social_id = 10 AND nombre = 'TRUE OCEAN');

  -- ===== Productos + kardex =====
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SHADOWPLAY BIKINI', 'T19213', 'SMALL', 4000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ORCHID GHANA', 'T75258', 'MEDIUM', 3800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TERRA GLIMMER TORI BIKINI', 'T87271.1', 'SMALL', 3900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TERRA GLIMMER TORI BIKINI', 'T87271.2', 'MEDIUM', 3900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('COFFE MAJESTIC BIKINI', 'T86337', 'SMALL', 4300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TANGIRE TEXTURED CAST BIKINI', 'T93297', 'MEDIUM', 4200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BRIGTSIDE TORI BIKINI', 'T87217', 'SMALL', 3800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('GOLDEN GREEN HALO BIKINI', 'T10348.1', 'XS', 4500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('GOLDEN GREEN HALO BIKINI', 'T10348.2', 'SMALL', 4500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('GOLDEN GREEN HALO BIKINI', 'T10348.3', 'MEDIUM', 4500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('GOLDEN GREEN HALO BIKINI', 'T10348.4', 'LARGE', 4500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('GOLD RED HALO BIKINI', 'T10351', 'MEDIUM', 4500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TROPICAL MYSTIC HELLA BIKINI', 'T86352', 'SMALL', 4800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ZEBRA BLUE AXELL BIKINI', 'T40357.1', 'SMALL', 4700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ZEBRA BLUE AXELL BIKINI', 'T40357.2', 'LARGE', 4700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TAKE IT SLOW TORI BIKINI', 'T87201', 'LARGE', 3800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLACK MOON KNOTTY BIKINI', 'T81001', 'LARGE', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLACK STARDUST BIKINI', 'T58001', 'SMALL', 5000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('LANGO FRESH BIKINI', 'T106361.1', 'SMALL', 4500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('LANGO FRESH BIKINI', 'T106361.2', 'MEDIUM', 4500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('WAVY ANIMAL HELLA BIKINI', 'T95332', 'SMALL', 4850, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('WHITE SHELL BIKINI', 'T105002.1', 'SMALL', 4500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('WHITE SHELL BIKINI', 'T105002.2', 'MEDIUM', 4500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUNNY BLUE SHELL BIKINI', 'T105226.1', 'SMALL', 4500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUNNY BLUE SHELL BIKINI', 'T105226.2', 'MEDIUM', 4500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('EARTHY GREEN TRIANGLE BIKINI', 'T106255.1', 'SMALL', 4300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('EARTHY GREEN TRIANGLE BIKINI', 'T106255.2', 'MEDIUM', 4300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('EARTHY GREEN KNOTTY BIKINI', 'T81255', 'LARGE', 4300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TROPICAL MYSTIC HALO BIKINI', 'T101352', 'SMALL', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUMMER CHARM TRIANGLE BIKINI', 'T01365.1', 'MEDIUM', 4750, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUMMER CHARM TRIANGLE BIKINI', 'T01365.2', 'LARGE', 4750, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUMMER CHARM ELOWEN BIKINI', 'T64365', 'SMALL', 4700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('EASY PINK AXEL BIKINI', 'T40374.1', 'XS', 4700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('EASY PINK AXEL BIKINI', 'T40374.2', 'SMALL', 4700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('EASY PINK AXEL BIKINI', 'T40374.3', 'MEDIUM', 4700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('EASY PINK HALO BIKINI', 'T10374', 'MEDIUM', 4700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUMMER PALMS ZOE CLASSY BIKINI', 'T10364', 'MEDIUM', 4800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TANGERINE BASAL BIKINI', 'T10372', 'MEDIUM', 4300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLACK CAST BAMDEAU BIKINI', 'T93001', 'SMALL', 3500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TEXTURED WAVE SUNSET ORANGE', 'T86211', 'LARGE', 3800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUNHEATWAVE TORI BIKINI', 'T87216', 'SMALL', 3800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PINK MALAI', 'T22033', 'LARGE', 3900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TEXTURED RASPBERRY ONE PIECE', 'O29295', 'SMALL', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BARN RED RASHGUARD', 'O36320', 'SMALL', 4600, 0, 0, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TEXTURED BLACK ONE PIECE', 'O40156', 'LARGE', 4500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUNRISE PALM LUNARIA ONE PIECE', 'O41317', 'SMALL', 4700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BARN RED DANZA ONE PIECE', 'O39320', 'SMALL', 4800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLACK ANTONIA ONE PIECE', 'O46001.1', 'SMALL', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLACK ANTONIA ONE PIECE', 'O46001.2', 'LARGE', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('WHITE ANTHONIA ONE PIECE', 'O46002.1', 'SMALL', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('WHITE ANTHONIA ONE PIECE', 'O46002.2', 'MEDIUM', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('WHITE ANTHONIA ONE PIECE', 'O46002.3', 'LARGE', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('JADE OASIS MISHA ONE PIECE', 'O37333.1', 'LARGE', 4700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('JADE OASIS MISHA ONE PIECE', 'O37333.2', 'MEDIUM', 4700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('EASY PINK COLOR BLEN ENTERO', 'O47374.1', 'SMALL', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('EASY PINK COLOR BLEN ENTERO', 'O47374.2', 'MEDIUM', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('EASY PINK COLOR BLEN ENTERO', 'O47374.3', 'LARGE', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUMMER PALMS ANTHONIA ENTERO', 'O46364', 'MEDIUM', 4800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BUTTERCREAM TWIX ONE PIECE', 'O29358.1', 'SMALL', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BUTTERCREAM TWIX ONE PIECE', 'O29358.2', 'MEDIUM', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BUTTERCREAM TWIX ONE PIECE', 'O29358.3', 'LARGE', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SLATE VIOLET MUSHY ONE PIECE', 'O23147', 'LARGE', 4100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('O42561', 'O42561', 'SMALL', 0, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SLOW ROSE OPERA ONE PIECE', 'O31188', 'SMALL', 4100, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('STONE TOWN SUNNY BIKINI', '95784', 'SMALL', 4000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SACRED SUN CHAELOTE BIKINI', '95704.1', 'SMALL', 4300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SACRED SUN CHAELOTE BIKINI', '95704.2', 'MEDIUM CON LARGE', 4300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SACRED SUN CHAELOTE BIKINI', '95704.3', 'LARGE', 4300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ANCESTRAL LINES VERA/LAILA BIKINI', '96276', 'SMALL', 4000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('LAOS ELAN BIKINI', '91186', 'SMALL', 3400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SHELL TIDE FED BIKINI', '95956.1', 'SMALL', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SHELL TIDE FED BIKINI', '95956.2', 'LARGE', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUNSET LINES ALDARA BIKINI', '96116', 'SMALL', 4000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLOSSOM BLAIR BIKINI', '9137.1', 'LARGE', 3100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLOSSOM BLAIR BIKINI', '9137.2', 'SMALL', 3100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('FER ETERNAL SAND BIKINI', '94986', 'LARGE', 4650, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TRANGLE BLUE BIKINI', '95036.1', 'MEDIUM', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TRANGLE BLUE BIKINI', '95036.2', 'LARGE', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('JANA BIKINI', '93366', 'SMALL', 3900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MAIRA/ALEXIA BIKINI', '95016', 'SMALL', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUNNY ETERNAL SAND BIKINI', '95006.1', 'SMALL', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUNNY ETERNAL SAND BIKINI', '95006.2', 'MEDIUM', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLOSSOM FLORA BIKINI', '91336.1', 'MEDIUM', 4000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLOSSOM FLORA BIKINI', '91336.2', 'LARGE', 4000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ISLAND MAIRA BIKINI', '95536', 'SMALL', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ISLAND SUNNY BIKINI', '95526', 'MEDIUM', 4500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('VEHA WHITE BIKINI', '94006', 'SMALL', 4100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PRAIA CYTRUS BIKINI', '94134.1', 'SMALL', 4900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PRAIA CYTRUS BIKINI', '94134.2', 'MEDIUM', 4900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUNNY ETERNAL SAND BIKINI', '95006.3', 'SMALL', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUNNY ETERNAL SAND BIKINI', '95006.4', 'MEDIUM', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLOSSOM FLORA BIKINI HIGH WAIST', '91336.3', 'LARGE', 3700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MAIRA MATCHA BIKINI', '93986', 'SMALL', 5000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ALIX YELLOW LIME BIKINI', '94106.1', 'SMALL', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ALIX YELLOW LIME BIKINI', '94106.2', 'MEDIUM', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('FIORE IRENE BIKINI', '90026', 'LARGE', 3600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SACRED SUN HANNA ONE PIECE', '95713', 'MEDIUM', 4000, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SILVI SUN ESSENCE ONE PIECE', '94903', 'MEDIUM', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('KAREN ONE PIECE', '92683', 'SMALL', 3700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SHINY BLUE ONE PIECE', '95053', 'LARGE', 4200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUNSET LINES ONE PIECE', '96123.1', 'SMALL', 3700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUNSET LINES ONE PIECE', '96123.2', 'MEDIUM', 3700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUNSET LINES ONE PIECE', '96123.3', 'LARGE', 3700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TERRACOTA ONE PIECE', '96143.1', 'SMALL', 4000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TERRACOTA ONE PIECE', '96143.2', 'MEDIUM', 4000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('OLIVIA ETERNAL SAND ONE PIECE', '94993', 'MEDIUM', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SHELLS EMMA', '89783', 'SMALL', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLAS BLACK RIB ONE PIECE', '93903', 'MEDIUM', 4000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ESRA CLASSIC ONE PIECE', '96503', 'SMALL', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('NUBEONE PIECE', '93993', 'MEDIUM', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SELENE GREEN', '92983', 'MEDIUM', 3800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('STONE TOEN GREEN ALISSA', '95793.1', 'SMALL', 4000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('STONE TOEN GREEN ALISSA', '95793.2', 'MEDIUM', 4000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('STONE TOEN GREEN ALISSA', '95793.3', 'LARGE', 4000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('DUNA', '92743', 'LARGE', 3800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('STELLA EMMA ONE PIECE', '91113', 'MEDIUM', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SELENE ONE PIECE', '90073', 'SMALL', 3400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BIVAL WHITE ONE PIECE', '9463.1', 'SMALL', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BIVAL WHITE ONE PIECE', '9463.2', 'MEDIUM', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BIVAL WHITE ONE PIECE', '9463.3', 'LARGE', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CARACOL JAQUARD BLACK BIKINI', '9462.1', 'MEDIUM', 2900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CARACOL JAQUARD BLACK BIKINI', '9462.2', 'XL', 2900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('NASSA BLUE BIGARO BIKINI', '9465T.1', 'LARGE', 2900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('NASSA BLUE BIGARO BIKINI', '9465T.2', 'XL-L', 2900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('NASSA BLUE BIGARO BIKINI', '9465T.3', 'MEDIUM', 2900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CARACOL JAQUARD CHERRY BIKINI', '9462.3', 'SMALL', 2900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CARACOL JAQUARD CHERRY BIKINI', '9462.4', 'LARGE', 2900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CARACOL CHERRY BIKINI', '9459.1', 'SMALL', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CARACOL CHERRY BIKINI', '9459.2', 'LARGE', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BIVAL JAQUARD BLACK ONE PIECE', '9463.4', 'MEDIUM', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BIVAL JAQUARD BLACK ONE PIECE', '9463.5', 'LARGE', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TYLA BLACK ONE PIECE', '9467.1', 'MEDIUM', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TYLA BLACK ONE PIECE', '9467.2', 'XL', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BIVAL JAQUARD CHERRY ONE PIECE', '9463.6', 'MEDIUM', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BIVAL JAQUARD CHERRY ONE PIECE', '9463.7', 'LARGE', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BIVAL JAQUARD CHERRY ONE PIECE', '9463.8', 'XL', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('NASSA BTEXTURED BLUE DONA BIKINI', '9465T.4', 'SMALL', 2900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TYLA BLUE TEXTURED ONE PIECE', '9467.3', 'SMALL', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TYLA BLUE TEXTURED ONE PIECE', '9467.4', 'MEDIUM', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TYLA BLUE TEXTURED ONE PIECE', '9467.5', 'LARGE', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TYLA BLUE TEXTURED ONE PIECE', '9467.6', 'XL', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MARGARITA PETRO BLUE ONE PIECE', '9466.1', 'XL', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MARGARITA PETRO BLUE ONE PIECE', '9466.2', 'LARGE', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TYLA WHITE ONE PIECE', '9467.7', 'SMALL', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TYLA WHITE ONE PIECE', '9467.8', 'MEDIUM', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TYLA WHITE ONE PIECE', '9467.9', 'LARGE', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CHERRY PRINT SET', '5398.1', 'SMALL', 5250, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CHERRY PRINT SET', '5398.2', 'MEDIUM', 5250, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CHERRY PRINT SET', '5398.3', 'LARGE', 5250, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'FALDAS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ZAMBU BLUE LACE SHIRT', '5404.1', 'XL', 3500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'FALDAS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ZAMBU BLUE LACE SHIRT', '5404.2', 'SMALL', 3500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'FALDAS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ZAMBU BLUE LACE SHIRT', '5404.3', 'MEDIUM', 3500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('DARK GREY SET', '5398.4', 'MEDIUM', 5250, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('DARK GREY SET', '5398.5', 'SMALL', 5250, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'FALDAS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ZAMBU WHITE SKIRT', '5405.1', 'SMALL', 3000, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLUE NAVA PAREO', '5405.2', 'OS', 1900, 0, 3, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 3, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MARGARITA TEXTURED BLUE ONE PIECE', '9466.3', 'MEDIUM', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'FALDAS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AVANO BLACK SKIRT', '5401.1', 'LARGE', 2500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'FALDAS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'CORPO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AVANO WHITE SKIRT', '5401.2', 'MEDIUM', 2500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('GRACE BIKINI', '702', 'MEDIUM', 5400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('IVY BIKINI', '741', 'MEDIUM', 5500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BRISA BIKINI', '674T', 'MEDIUM', 6100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('FOREST BIKINI', '938', 'SMALL', 7200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ASTER BIKINI', '982', 'MEDIUM', 6800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MIRA ONE PIECE', '9220', 'LARGE', 5500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BROOKE ONE PIECE', '9550', 'SMALL', 5700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SOLARA ONE PIECE', '620', 'MEDIUM', 5200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CAMILLE ONE PIECE', '9190.1', 'LARGE', 6000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CAMILLE ONE PIECE', '9190.2', 'MEDIUM', 6000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('RITA JUMPER', '932P.1', 'XS', 7300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('RITA JUMPER', '932P.2', 'SMALL', 7300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('JULES ONE PIECE', '939', 'MEDIUM', 6900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('IRENE ONE PIECE', '9860', 'LARGE', 5700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PHOBE ONE PIECE', '921', 'LARGE', 5900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SEA SKIRT', '675S.1', 'XS', 6100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SEA SKIRT', '675S.2', 'SMALL', 6100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('HELEN DREES', '858', 'SMALL', 5000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PIPER DRESS', '941.1', 'XS', 6860, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PIPER DRESS', '941.2', 'SMALL', 6860, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('DANIELLE DRESS', '979D.1', 'XS', 6600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('DANIELLE DRESS', '979D.2', 'SMALL', 6600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SEA SALT' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('DONNA DRESS', '966D', 'U', 6370, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('STARFLOW/GLOWSHORE BIKINI', '26505T', 'MEDIUM', 2850, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUNFUSED/GLOWSCAPE BIKINI', '26506T', 'MEDIUM', 2800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SALTMIST/BRAINER BIKINI', '26516T', 'SMALL', 2850, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SPRITZ CELESTE/WAVE BIKINI', '26524', 'MEDIUM', 2600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('JUNGLE GILD/BAYSHORE BIKINI', '2653B', 'SMALL', 2600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('LOST GARDEN DEPSEA BIKINI', '26549', 'MEDIUM', 2600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLACK SUNVEIL BIKINI', '26558', 'SMALL', 2600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUNKISSED ONE PIECE', '26503O', 'SMALL', 2500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUNSOAKED ONE PIECE', '26510O', 'SMALL', 2200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BRINY RASHGUARD ONE PIECE', '26517O.1', 'SMALL', 2400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BRINY RASHGUARD ONE PIECE', '26517O.2', 'LARGE', 2400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SAPHIRE ONE PIECE', '26521O.1', 'SMALL', 2300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SAPHIRE ONE PIECE', '26521O.2', 'MEDIUM', 2300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('JUNGLE FEVER SOLARIS ONE PIECE', '26220', 'SMALL', 2200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('NOCTURNAL BLOOM ONE PIECE', '26535.1', 'SMALL', 2300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('NOCTURNAL BLOOM ONE PIECE', '26535.2', 'MEDIUM', 2300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TIDALFLARE PINK DRESS', '26504C.1', 'SMALL', 2700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TIDALFLARE PINK DRESS', '26504C.2', 'MEDIUM', 2700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'PHAX' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AQUA DRESS', '26522C', 'SMALL', 2700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'COSITA LINDA' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('HALTER MINT ONE PIECE', 'CL26058M.1', 'SMALL', 4990, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'COSITA LINDA' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('HALTER MINT ONE PIECE', 'CL26058M.2', 'MEDIUM', 4990, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'COSITA LINDA' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ONE SHOULDER LOVE BLOOM', 'CL26100M', 'SMALL', 6800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'COSITA LINDA' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUNLIST PALMS OTS LACE ONE PIECE', 'CL26115M', 'SMALL', 6500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'COSITA LINDA' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUNLIST PALM HALTER ONE PIECE', 'CL26116O.1', 'MEDIUM', 7200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'COSITA LINDA' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUNLIST PALM HALTER ONE PIECE', 'CL26116O.2', 'LARGE', 7200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'COSITA LINDA' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('HIGH NECK HALTER ONE PIECE', '26015M', 'LARGE', 5600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'COSITA LINDA' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ONE SHOULDER ONE PIECE', 'CL26027M', 'SMALL', 5300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'COSITA LINDA' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('HIGH NECK HALTER BLUE MEXICAN ONE PIECE', 'CL26078M', 'LARGE', 7200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'COSITA LINDA' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('LOVE BLOOM HIGH WAIST BIKINI', 'CL26102B', 'LARGE', 6000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'COSITA LINDA' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TRIANGLE BRA BLUE MEXICAN BIKINI', 'CL26075B', 'LARGE', 6000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'COSITA LINDA' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TRIANGLE SUNLIT PALMS BIKINI', 'CL26111B', 'SMALL', 5800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'COSITA LINDA' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLUE CHOCHET TOP', 'CL26123C', 'SMALL', 3400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'COSITA LINDA' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('FRINGE SKIRT', 'CL26090C', 'SMALL', 2670, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'COSITA LINDA' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CORAL MAXI DRESS', 'CL26032C', 'SMALL', 6400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'COSITA LINDA' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('FLOWER HALTER DRESS', 'CL26025C', 'SMALL', 5300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ENTERO RASHGUARD MORADO', '4202200', '6/9', 1090, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('3D FUSIA GIRASOLES', '4202210.1', '2', 1100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('3D FUSIA GIRASOLES', '4202210.2', '3', 1100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('3D FUSIA GIRASOLES', '4202210.3', '4', 1100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('3D FUSIA GIRASOLES', '4202210.4', '12', 1100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ENTERO CON ABERTURA MELON', '5202346.1', '14', 1100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ENTERO MANGA SISA CON COLA', '5202361.1', '16', 1300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AMARILLO EMOJI', '4202195.1', '4T', 900, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AMARILLO EMOJI', '4202195.2', '12', 900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ENTERO RASDGUARD PAJARITO', '4202212.1', '24', 1590, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ENTERO RASDGUARD PAJARITO', '4202212.2', '6/9', 1590, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ENTERO RASDGUARD PAJARITO', '4202212.3', '3T', 1590, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ENTERO RASDGUARD PAJARITO', '4202212.4', '12', 1590, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Kids' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('4133597', '4133597', '4T', 0, 0, 0, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Kids' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('3451053', '3451053', NULL, 0, 0, 0, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('4202212.5', '4202212.5', '3T', 1390, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('4202212.6', '4202212.6', '6/9', 1390, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Kids' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('4226400', '4226400', 'M', 940, 0, 0, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Kids' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('5134271', '5134271', '10', 2155, 0, 0, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('RASHGUARD AZUL PAJARO SET', '4202209.1', '4T', 1400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('RASHGUARD AZUL PAJARO SET', '4202209.2', '6/9', 1400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('RASHGUARD AZUL PAJARO SET', '4202209.3', '12', 1400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SET RASHGUARD REVERSIBLE', '4202215', '24', 1390, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := NULL;
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('4202213', '4202213', '6/9', 1060, 0, 0, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  v_cat := NULL;
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT3421KRS003.1', 'PT3421KRS003.1', '14', 2100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := NULL;
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'OFF CORSE' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT3421KRS003.2', 'PT3421KRS003.2', '1', 2100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('EAGLE GIRL TRPICAL GIRL ONE PIECE', 'PT4018KKO500', '10/8', 2150, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('NOSY BE GIRL ONE PIECE', 'PT3804KKO002', '2', 1100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ENTERO CON ABERTURA MELON', '5202346.2', '14', 1100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ENTERO MANGA SISA CON COLA', '5202361.2', '16', 1300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AMARILLO EMOJI', '4202195.3', '4T', 900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ENTERO RASDGUARD PAJARITO', '4202212.7', '24', 1590, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ENTERO RASDGUARD PAJARITO', '4202212.8', '6/9', 1590, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ENTERO RASDGUARD PAJARITO', '4202212.9', '3T', 1590, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ENTERO RASDGUARD PAJARITO', '4202212.10', '12', 1590, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Kids' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('1072INV001.1', '1072INV001.1', '4-6', 1800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Kids' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('1072INV001.2', '1072INV001.2', '6-8', 1800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT3340KKO0090.1', 'PT3340KKO0090.1', '8', 2150, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT3340KKO0090.2', 'PT3340KKO0090.2', '1', 2150, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT4014KKB01', 'PT4014KKB01', '12', 0, 0, 0, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT4018KKO5000', 'PT4018KKO5000', '8', 2150, 0, 0, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Kids' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('3415KKO001', '3415KKO001', '12', 2300, 0, 0, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT4005KKB001', 'PT4005KKB001', '6', 2100, 0, 0, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MYRTOS POLO SHIRT/BLANCO', '32010.1', 'S', 3300, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MYRTOS POLO SHIRT/BLANCO', '32010.2', 'XL', 3300, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MYRTOS POLO SHIRT/BLANCO', '32010.3', 'L', 3300, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MYRTOS POLO SHIRT/SPRAY BLUE', '32010.4', 'L', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MYRTOS POLO SHIRT/SPRAY BLUE', '32010.5', 'XL', 3300, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MYRTOS POLO SHIRT/SPRAY BLUE', '32010.6', 'M', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MYRTOS POLO SHIRT/NAVY', '32010.7', 'XL', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MYRTOS POLO SHIRT/NAVY', '32010.8', 'S', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PARADIS SS T-SHIRT/MIST', '31002.1', 'XL', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PARADIS SS T-SHIRT/MIST', '31002.2', 'L', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PARADIS SS T-SHIRT/MIST', '31002.3', 'M', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CORFU SS T-SHIRT/CALYPSO', '31000.1', 'S', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CORFU SS T-SHIRT/CALYPSO', '31000.2', 'XL', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CORFU SS T-SHIRT/CALYPSO', '31000.3', 'L', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CORFU SS T-SHIRT/WHITE', '31000.4', 'XL', 3300, 0, 3, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 3, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CORFU SS T-SHIRT/WHITE', '31000.5', 'L', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CORFU SS T-SHIRT/SPRAY BLUE', '31000.6', 'L', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CORFU SS T-SHIRT/SPRAY BLUE', '31000.7', 'XL', 3300, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CORFU SS T-SHIRT/SPRAY BLUE', '31000.8', 'S', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AKSLA T SHIRT/HICKORY', 'SWU127CP.1', 'XL', 2200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AKSLA T SHIRT/HICKORY', 'SWU127CP.2', 'L', 2200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AKSLA T SHIRT/HICKORY', 'SWU127CP.3', 'S', 2200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AKSLA T SHIRT/NAVY', 'SWU127CP.4', 'XL', 2200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AKSLA T SHIRT/NAVY', 'SWU127CP.5', 'L', 2200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PALERMO SEERSUCKER SHIRT/NAVY', 'SWC374CO.1', 'XXL', 3750, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PALERMO SEERSUCKER SHIRT/WHITE', 'SWC374CO.2', 'XXL', 3750, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AMALFI LINEN SHIRT/WHITE', 'SWQ156LN.1', 'XXL', 4300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AMALFI LINEN SHIRT/WHITE', 'SWQ156LN.2', 'M', 4300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AMALFI LINEN SHIRT/WHITE', 'SWQ156LN.3', 'L', 4300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SANTORINI LS SPORT SHIRT/SPRAY BLUE', '35000.1', 'S', 4850, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SANTORINI LS SPORT SHIRT/SPRAY BLUE', '35000.2', 'M', 4850, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SANTORINI LS SPORT SHIRT/SPRAY BLUE', '35000.3', 'L', 4850, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AMALFI LINEN SHIRT/FADED CORAL', 'SWQ156LN.4', 'XXL', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AMALFI LINEN SHIRT/FADED CORAL', 'SWQ156LN.5', 'S', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AMALFI LINEN SHIRT/SAND DUNE', 'SWQ156LN.6', 'XXL', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AMALFI LINEN SHIRT/SAND DUNE', 'SWQ156LN.7', 'S', 4400, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AMALFI LINEN SHIRT/SAND DUNE', 'SWQ156LN.8', 'M', 4400, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AMALFI LINEN SHIRT/SAND DUNE', 'SWQ156LN.9', 'XL', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AMALFI LINEN SHIRT/SAND DUNE', 'SWQ156LN.10', 'L', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SANTORINI LS SPORT SHIRT/NAVY', '35000.4', 'L', 4850, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SANTORINI LS SPORT SHIRT/NAVY', '35000.5', 'XL', 4850, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SANTORINI LS SPORT SHIRT/NAVY', '35000.6', 'S', 4850, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SANTORINI LS SPORT SHIRT/WHITE', '35000.7', 'M', 4850, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SANTORINI LS SPORT SHIRT/WHITE', '35000.8', 'XL', 4850, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SANTORINI LS SPORT SHIRT/WHITE', '35000.9', 'S', 4850, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SANTORINI LS SPORT SHIRT/WHITE', '35000.10', 'L', 4850, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SAMOS SOLID SHORT/WHITE', '37001.1', 'M', 3950, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SAMOS SOLID SHORT/WHITE', '37001.2', 'S', 3950, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SAMOS SOLID SHORT/WHITE', '37001.3', 'L', 3950, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AMALFI LINEN SHORT/SAND DUNE', 'SWR166LN.1', 'L', 3400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CIRCE SOLID SHORT/KHAKI', '37000.1', '30', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CIRCE SOLID SHORT/KHAKI', '37000.2', '32', 4600, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CIRCE SOLID SHORT/KHAKI', '37000.3', '36', 4600, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CIRCE SOLID SHORT/KHAKI', '37000.4', '34', 4600, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CIRCE SOLID SHORT/KHAKI', '37000.5', '38', 4600, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CIRCE SOLID SHORT/KHAKI', '37000.6', '40', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CIRCE SOLID SHORT/NAVY', '3700.1', '30', 4600, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CIRCE SOLID SHORT/NAVY', '3700.2', '32', 4600, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CIRCE SOLID SHORT/NAVY', '3700.3', '36', 4600, 0, 3, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 3, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CIRCE SOLID SHORT/NAVY', '3700.4', '34', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CIRCE SOLID SHORT/NAVY', '3700.5', '38', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CIRCE SOLID SHORT/NAVY', '3700.6', '40', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AMALFI LINEN SHORT/WHITE', 'SWR166LN.2', 'L', 3400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SKIATHOS SOLID PANT/NAVY', '38000.1', '34', 5100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SKIATHOS SOLID PANT/NAVY', '38000.2', '32', 5100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SKIATHOS SOLID PANT/NAVY', '38000.3', '36', 5100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SKIATHOS SOLID PANT/NAVY', '38000.4', '38', 5100, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SKIATHOS SOLID PANT/MIST', '38000.5', '36', 5100, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SKIATHOS SOLID PANT/MIST', '38000.6', '34', 5100, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SKIATHOS SOLID PANT/MIST', '38000.7', '32', 5100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SKIATHOS SOLID PANT/MIST', '38000.8', '38', 5100, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MOSAICO PRINTED SWIM SHORT/BLUE', '34001.1', 'L', 3950, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MOSAICO PRINTED SWIM SHORT/ORANGE', '34001.2', 'L', 3950, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MARE SWIM HORT/ARANCIA', 'SWW451PS.1', 'L', 3750, 0, 3, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 3, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('NAXOS SOLID SWIM SHORT/TIDAL BLUE', '34000.1', 'M', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MARE SWIM HORT/TIDAL BLUE', 'SWW451PS.2', 'XL', 3750, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MARE SWIM HORT/TIDAL BLUE', 'SWW451PS.3', 'S', 3750, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MARE SWIM HORT/TIDAL BLUE', 'SWW451PS.4', 'L', 3750, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('STAND YARN DYED SWIM TRUNK/TIDAL BLUE', '34021.1', 'M', 3950, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('STAND YARN DYED SWIM TRUNK/TIDAL BLUE', '34021.2', 'L', 3950, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('STAND YARN DYED SWIM TRUNK/TIDAL BLUE', '34021.3', 'S', 3950, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('GIA SWIM SHORT/AEGEAN BLUE', 'SWW504PS.1', 'L', 3750, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('GIA SWIM SHORT/AEGEAN BLUE', 'SWW504PS.2', 'XXL', 3750, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('NAXOS SOLID SWIM SHORT/NAVY', '34000.2', 'M', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('NAXOS SOLID SWIM SHORT/NAVY', '34000.3', 'L', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('NAXOS SOLID SWIM SHORT/NAVY', '34000.4', 'XL', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MILOS SOLID SWIM TRUNK/NAVY', '34020.1', 'S', 3950, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MILOS SOLID SWIM TRUNK/NAVY', '34020.2', 'M', 3950, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MILOS SOLID SWIM TRUNK/NAVY', '34020.3', 'XL', 3950, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PANZA SWIM SHORT/NAVY', 'SWW450PS', 'XXL', 3750, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('KOS SOLID SWIM TRUNK/BLACK', '34010.1', 'M', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('KOS SOLID SWIM TRUNK/BLACK', '34010.2', 'XL', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SWIM TRUNK /NAVY', 'ST13433/STEAM.1', 'S', 2100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SWIM TRUNK /NAVY', 'ST13433/STEAM.2', 'XL', 2100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SWIM TRUNK/DAIQUIRI GREEN', 'ST13430/STEAM.1', 'L', 2100, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SWIM TRUNK/CORAL', 'ST13430/STEAM.2', 'L', 2100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CHESS SAILOR TRUNK', 'MAAJI/1049TSS064SM.1', 'S', 2100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CHESS SAILOR TRUNK', 'MAAJI/1049TSS064SM.2', 'L', 2100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('RACING PALMS SAILOR TRUNK', 'MAAJI/PT1049TSS095SM.1', 'S', 2100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TRAJE DE BAÑO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('RACING PALMS SAILOR TRUNK', 'MAAJI/PT1049TSS095SM.2', 'XL', 2100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SH42022', 'ILOT.1', 'L', 3090, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SH06D21', 'ILOT.2', 'S', 1900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SH06D21', 'ILOT.3', 'L', 1900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('LINEN PANTS CAMEL', 'STEAM/ST10738.1', 'L', 2900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('LINEN PANTS CAMEL', 'STEAM/ST10738.2', 'S', 2900, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANTS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('LINEN PANTS CAMEL', 'STEAM/ST10738.3', 'M', 2900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('STEAM/ST11820.1', 'STEAM/ST11820.1', 'M', 3800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('STEAM/ST11820.2', 'STEAM/ST11820.2', 'L', 3800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ILOT.4', 'ILOT.4', NULL, 0, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MADISON LOAFER/NAVY', '21014.1', '10', 4600, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MADISON LOAFER/NAVY', '21014.2', '9', 4600, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MADISON LOAFER/NAVY', '21014.3', '8', 4600, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MADISON LOAFER/NAVY', '21014.4', '11', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MADISON LOAFER/MIST', '21014.5', '8', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MADISON LOAFER/MIST', '21014.6', '9', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MADISON LOAFER/MIST', '21014.7', '11', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BREEZE TENNIS/WHITE ORANGE', '21285.1', '9', 3750, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CABANA SLIDE/BLACK', 'SWB203SL.1', '10', 2450, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BREEZE TENNIS/WHITE', '21285032.1', '10', 3750, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BREEZE TENNIS/SAND DUNE', '21285913.1', '10.5', 3750, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MARE TRAINER/MIST', '23020.1', '8', 5000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MARE TRAINER/MIST', '23020.2', '11', 5000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MARE TRAINER/WHITE', '23020.3', '10', 5000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BREEZE TENNIS/WHITE BLUE', '21285914.1', '11', 3750, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CARTERA DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('NECESSAIRE/BLACK', '53228001.1', 'OS', 2300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('DELILAH GOLD GRAY', '196-2', 'OS', 2270, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUPEIOR SOFT GREEN', '206-4.1', 'OS', 2350, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('DELILAH BROWN', '196-1', 'OS', 2350, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('DELILAH GOLD LAVNDER', '196-3', 'OS', 2350, 0, 3, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 3, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUPERIOR SOFT GREEN', '206-4.2', 'OS', 2350, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MADISON BLACK', '166-3', 'OS', 2100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('JETSETTER BLACK', '194-1', 'OS', 2350, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('WESTON EMERALD', '180-10', 'OS', 2350, 0, 3, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 3, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SOPHIE PEARL', '202-4', 'OS', 2350, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CARTON ROSE', '218-3', 'OS', 2400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('NICO TORTOISE', '198-2', 'OS', 2350, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('JADE CHOCOLATE', '216-4', 'OS', 2400, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SHAY TORTOISE', '92-11', 'OS', 2350, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ARIA EMERALD', '183-5', 'OS', 2350, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ARIA MILKY TORTOISE', '183-3', 'OS', 2350, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ARIA DARK CHERRY', '183-6', 'OS', 2350, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BILLIE TORTOISE', '124-5A', 'OS', 2350, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('LOGAN TORTOISE SUNRISE', '1149-6', 'OS', 2100, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ASTROTIA TORTOISE', '174-2', 'OS', 2100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ASTROTIA BROWN PEARL', '174-3', 'OS', 2100, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('FULTRON GRAY TORTOISE', '126-2', 'OS', 1650, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('STELLA BLUE TORTOISE', '165-2', 'OS', 2270, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SHAY NEW BLACK', '92-2A', 'OS', 2270, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Lentes' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'FREYERS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('LOGAN LIGHT GOLD GRAY', '1149-7', 'OS', 2100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TOPO COCACOLA DORADO', '112.1', 'OS', 1360, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TOPO COCACOLA PLATA', '112.2', 'OS', 1360, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ARETE SHERA SEA', '112.3', 'OS', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ARETE VINOSA', '112.4', 'OS', 2450, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CANDONGA PLATA', '112.5', 'OS', 1800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MONERA LARGO', '112.6', 'OS', 3260, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SETA PERLAS', '112.7', 'OS', 3160, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('COLLAR COCACOLA PLATEADO', '112.8', 'OS', 1560, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('COLLAR AGARICUS MORADO', '112.9', 'OS', 1930, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('COLLAR SIARA VERDE', '112.10', 'OS', 1100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('COLLAR SIARA MORADO', '112.11', 'OS', 1100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('COLLAR SIARA AZUL', '112.12', 'OS', 1100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PULSERA VERDE OSCURO', '112.13', 'OS', 1100, 0, 3, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 3, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PULSERA AZUL', '112.14', 'OS', 1100, 0, 3, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 3, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('LACON COLLAR', '112.15', 'OS', 1500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SETA FUNKY', '112.16', 'OS', 2400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CUFF AMANITA', '112.17', 'OS', 2080, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CUFF PERLA', '112.18', 'OS', 1700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ANILLO PLATA', '112.19', 'OS', 1880, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CUFF SARTA', '112.20', 'OS', 2100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CUFF BLAN', '112.21', 'OS', 2100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MELIAN ANILLO', '112.22', 'OS', 2300, 0, 3, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 3, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ACCESORIOS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ANILLO L', '112.23', 'OS', 2000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('EDEN BECCA ETERNAL SAND SET', '9521.1', 'MEDIUM', 8200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('EDEN BECCA ETERNAL SAND SET', '9521.2', 'SMALL', 8200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('EDEN BECCA ETERNAL SAND SET', '9521.3', 'M', 8200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AINA ZAFIRO SUNSET SET', '9616.1', 'M', 9700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AINA ZAFIRO SUNSET SET', '9616.2', 'L', 9700, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AINA ZAFIRO SUNSET SET', '9616.3', 'S', 9700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AINA ZAFIRO SUNSET SET', '9616.4', 'M', 9700, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('RUBI DRESS', '9607.1', 'S', 5600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('RUBI DRESS', '9607.2', 'M', 5600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('KATIA/AYANA SET RED', '9518', 'SMALL', 8840, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MALAK/AURORA VEST', '9539.1', 'S', 7500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MALAK/AURORA VEST', '9539.2', 'M', 7500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MALAK/AURORA VEST', '9539.3', 'M', 7500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MALAK/AURORA VEST', '9539.4', 'ML', 7500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'GORRA' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('KIBYS CAP', '9543', 'OS', 1800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SHELL TIDES SET', '9608.1', 'S', 7000, 0, 3, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 3, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SHELL TIDES SET', '9608.2', 'MEDIUM', 7000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SHELL TIDES SET', '9608.3', 'LARGE', 7000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PERLA WHITE SET', '9459.3', 'M', 6400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ZENDA SAGE SET', '9507.1', 'L', 8150, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ALANA MAXI DRESS', '9442.1', 'S', 5400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ALANA MAXI DRESS', '9442.2', 'M', 5400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ALANA MAXI DRESS', '9442.3', 'L', 5400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ADELE BLUE SET', '9201.1', 'SM', 5820, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ADELE BLUE SET', '9201.2', 'ML', 5820, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ARABELLA TSHIRT', '9448', 'ML', 2900, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AGATHA WITHE PANT', '9467.10', 'L', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AGATHA WITHE PANT', '9467.11', 'S', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SAND NOVA PANT', '9173', 'ML', 2900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SHORT BEIGE', '8428', 'ML', 2300, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TERRACOTA SKIRT', '9645.1', 'ML', 3300, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TERRACOTA SKIRT', '9645.2', 'SM', 3300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('STONE TOWN SET', '9637.1', 'ML', 9800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('STONE TOWN SET', '9637.2', 'SM', 9800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PEACH SET', '9619.1', 'ML', 7800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PEACH SET', '9619.2', 'SM', 7800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('VALE OOEN PANTS', '8417.1', 'ML', 2500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('VALE OOEN PANTS', '8417.2', 'SM', 2500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('DAPHNE VEST/BECCA PANT', '9641', 'S', 8100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('EDEN VEST ARISHA PANT SET', '9587', 'S', 7750, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('WHITE AYLA SHIRT', '9507.2', 'S', 3150, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ZAIRA CROP TOP', '9506', 'S', 2250, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('WHITE SAGE ZENDA PANT', '9508', 'S', 5000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('LENA/DAKOTA SET', '9572', 'S', 7300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PERLA WHITE SHIRT', '9459.4', 'S', 3400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ARABELLA/ARISHA SET', '9589', 'M', 8800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ITZA YELLOW LIME SHIRT', '9443', 'ML', 2600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLACK BECCA PANT', '9632', 'M', 4900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ARIEL SHORT', '9444.1', 'M', 3200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ARIEL SHORT', '9444.2', 'SM', 3200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PUERTO VEST', '9277', 'ML', 2100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PUERTO ARIEL SKIRT', '9278', 'ML', 2300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MIKU SAND SET', '9531', 'ML', 6250, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ADELE WHITE SET', '9202', 'ML', 5820, 0, 3, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 3, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CORAL BLUSH', '9053', 'SM', 3200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('DEVON SHORT', '9196.1', 'M', 2300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('DEVON SHORT', '9196.2', 'L', 2300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MACA SET TOWEL FABRIC', '9176', 'SM', 3600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AMIRA/BECCA SET', '9514', 'ML', 8840, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ANCESTRAL LINES RUBI DRESS', '9607.3', 'ML', 5600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('FLAIR WHITE JUMPSIUT', '9436', 'L', 4200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ODETH DRESS', '9434.1', 'M', 4800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ODETH DRESS', '9434.2', 'L', 4800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PALOMA DRESS', '9186.1', 'M', 4000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PALOMA DRESS', '9186.2', 'L', 4000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('STONE TOWN RUBI DRESS', '9635', 'ML', 5600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('GRETA DRESS', '9358', 'ML', 5900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('GRETA ETERNAL SAND DRESS', '9526', 'ML', 6000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'FALDAS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SIERRA CARAMEL SKRT', '9341.1', 'SM', 3900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'FALDAS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SIERRA CARAMEL SKRT', '9341.2', 'ML', 3900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'FALDAS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('DEBORA SET', '9184.1', 'SM', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'FALDAS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('DEBORA SET', '9184.2', 'ML', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CECI CROP TOP', '9321', 'SM', 2400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ANIKA CROP TOP', '9166', 'M', 2300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('KATYA SHIRT', '9435', 'L', 3950, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('DOLLY VEST', '9446', 'SM', 2660, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLACK CARLOTA MESH SHIRT', '9633', 'SM', 2700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CAMILLE SHORT DRESS', '9162', 'M', 3500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('LORETTA SHELL SARONG', '9602', 'OS', 3500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MARGARET SKIRT', '9005.1', 'M', 2000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MARGARET SKIRT', '9005.2', 'S', 2000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CANDIE SKIRT', '9147', 'OS', 2000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('EMILIA SKIRT', '9640', 'SM', 3200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('LORETTA PAREO', '9510', 'OS', 2960, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SOLID STELLA SET', '9016', 'ML', 4800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SMOKEY WHITE PRINT TEMPLE TARA BOTTOM', '91494', 'L', 5500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANT' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLACK NOVA PANT', '8547', 'ML', 2600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANT' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('GREEN NOVA PANT', '9297', 'ML', 2750, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'BOLSA' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SOLID GREEN BAG', '9085', 'OS', 1600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'BOLSA' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('KNITTED FLOWER BAG', '9160', 'OS', 3500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'BOLSA' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CRCHET ORANGE BAG', '9474', 'OS', 3700, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'BOLSA' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BAG KIBYS', '9086', 'OS', 3200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'BANDANA' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CROCHET BANDANA', '9609', 'OS', 2500, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'KIBYS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('GRETA ETERNAL SAND DRESS CAFE', '9528', 'ML', 6000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MADISON LOAFER/NAVY', '21014.8', '10', 4600, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MADISON LOAFER/NAVY', '21014.9', '9', 4600, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MADISON LOAFER/NAVY', '21014.10', '8', 4600, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MADISON LOAFER/NAVY', '21014.11', '11', 4600, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MADISON LOAFER/MIST', '21014.12', '8', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MADISON LOAFER/MIST', '21014.13', '9', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MADISON LOAFER/MIST', '21014.14', '11', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BREEZE TENNIS/WHITE ORANGE', '21285.2', '9', 3750, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('CABANA SLIDE/BLACK', 'SWB203SL.2', '10', 2450, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BREEZE TENNIS/WHITE', '21285032.2', '10', 3750, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BREEZE TENNIS/SAND DUNE', '21285913.2', '10.5', 3750, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MARE TRAINER/MIST', '23020.4', '8', 5000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MARE TRAINER/MIST', '23020.5', '11', 5000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MARE TRAINER/WHITE', '23020.6', '10', 5000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MARE TRAINER/WHITE', '23020.7', '11', 5000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BREEZE TENNIS/WHITE BLUE', '21285914.2', '11', 3750, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'TENNIS ' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PENNY LOAFER/BLACK', '20201001A', '9', 3980, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CARTERA DE HOMBRE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SWIMS' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('NECESSAIRE/BLACK', '53228001.2', 'OS', 2300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('HEARTWOOD DRESS', 'A35182.1', 'M', 3600, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ROSEWOODE ENLIGHT DRESS', 'A66203.1', 'S', 4300, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ROSEWOODE ENLIGHT DRESS', 'A66203.2', 'L', 4300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('OLDROSE LOVEY DRESS', 'C45214.1', 'S', 3900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('OLDROSE LOVEY DRESS', 'C45214.2', 'M', 3900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('EASY PINK DRESS', 'A22170.1', 'M', 4000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TAKE IT SLOW DRESS', 'A50201', 'SMALL', 4200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('IVORY RING REEF DRESS', 'C105002', 'SMALL', 3700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('IVORY ENCAJE SET', 'A75338', 'LARGE', 7200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANT' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('FALWLESS PANT', 'A48203', 'L', 2950, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('WILLOWING DREEM DENIM', 'A08145.1', 'M', 2500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('NEBULA DRESS', 'C100325.1', 'M', 4000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('NEBULA DRESS', 'C100325.2', 'S', 4000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PYTHON DUCK', 'A90252.1', 'S', 6700, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PYTHON DUCK', 'A90252.2', 'M', 6700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ANIMAL PRINT PJ', '1214.1', 'L', 3200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ROSEWOOD AKUMAL SHIRT', 'C18203.1', 'S', 2700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ROSEWOOD AKUMAL SHIRT', 'C18203.2', 'M', 2700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ROSEWOOD AKUMAL SHIRT', 'C18203.3', 'M', 2700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ROSEWOOD AKUMAL SHIRT', 'C18203.4', 'L', 2700, 0, 3, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 3, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('WHITE VERA LACE SHIRT', 'C102002', 'LARGE', 4300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANT' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLACK NEBULA PANT', 'D07001', 'M', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ROSIE CROP TOP ROSA VIEJO', 'A23170.1', 'M', 1300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ROSIE CROP TOP ROSA VIEJO', 'A23170.2', 'S', 1300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ROSIE CROP TOP VERDE', 'A23172.1', 'S', 1300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ROSIE CROP TOP AZUL', 'A23173', 'L', 1300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLACK MERY CROCHET', 'A24001.1', 'S', 2900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLACK MERY CROCHET', 'A24001.2', 'M', 2900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLACK MERY CROCHET', 'A24001.3', 'M', 2900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLACK MERY CROCHET', 'A24001.4', 'L', 2900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANT' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('DAY TO DAY PANT VERDE AQUA', 'A38172', 'S', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANT' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('IVORY MALLA PANT', 'A70327.1', 'S', 3900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANT' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('IVORY MALLA PANT', 'A70327.2', 'M', 3900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('JADE OASIS SET', 'C31333', 'LARGE', 6600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORT' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SOLARA LELI SHORT', 'A52264', 'L', 2750, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SLOW DOWN T SHIRT', 'A20067', 'M', 1900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLACK KEIN T SHIRT', 'C113001', 'S', 2000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SETTLER SHIRT', '176002', 'S', 1700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SUNKISS MALLA AKUMAL SHIRT', 'C18345', 'M', 4100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANT' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('DAY TO DAY PANT BEIGE', 'A34002', 'L', 3000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANT' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('WILLOWING GREEN MALLA PANT', 'A70145', 'L', 3900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SHORT' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('GREEN WOOD LELI SHORT', 'A52250', 'M', 2700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLACK REFLEX DRESS', 'C74217', 'LARGE', 3900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('BLACK UTOPIA DRESS', 'A99001', 'SMALL', 2700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ROOSE', 'A66203.3', 'SMALL', 4300, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('ROOSE', 'A66203.4', 'LARGE', 4300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := NULL;
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('A35182.2', 'A35182.2', 'MEDIUM', 2880, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'FALDAS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('A08145.2', 'A08145.2', 'MEDIUM', 2000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := NULL;
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('A23172.2', 'A23172.2', 'SMALL', 1300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('1214.2', '1214.2', 'LARGE', 3200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('A22172', 'A22172', 'SMALL', 0, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MALAI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('A22170.2', 'A22170.2', 'MEDIUM', 4000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT9874SBR276MD', 'PT9874SBR276MD', 'MEDIUM', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2404STR048MB', 'PT2404STR048MB', 'MEDIUM', 4500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5436STR001SM', 'PT5436STR001SM', 'SMALL', 4900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5369SBA001SM.1', 'PT5369SBA001SM.1', 'SMALL', 6200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5369SBA001SM.2', 'PT5369SBA001SM.2', 'MEDIUM', 6200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2782SBR008MD', 'PT2782SBR008MD', 'MEDIUM', 5200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT3906SCC001SM', 'PT3906SCC001SM', 'SMALL', 4550, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5097STR001LG', 'PT5097STR001LG', 'LARGE', 3360, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT3899SBR001SM', 'PT3899SBR001SM', 'SMALL', 4100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2860SBR007XS', 'PT2860SBR007XS', 'XS', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT0908SBR284SM', 'PT0908SBR284SM', 'SMALL', 4200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5017SBA002MD', 'PT5017SBA002MD', 'MEDIUM', 4800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5150SBR006SM', 'PT5150SBR006SM', 'SMALL', 4700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5477SBA001MB', 'PT5477SBA001MB', 'MEDIUM', 4800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT7154SBR545MD', 'PT7154SBR545MD', 'MEDIUM', 5500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2404STR540SM', 'PT2404STR540SM', 'SMALL', 3200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT4044SBR001MD', 'PT4044SBR001MD', 'MEDIUM', 4150, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT3812SUN003MD', 'PT3812SUN003MD', 'MEDIUM', 4200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT3899SBR003XL', 'PT3899SBR003XL', 'XL', 3100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5308STR790LG', 'PT5308STR790LG', 'LARGE', 4500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT9916SBC195', 'PT9916SBC195', 'MEDIUM', 4900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5186SCR001SM', 'PT5186SCR001SM', 'SMALL', 4800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5150SBR512XS', 'PT5150SBR512XS', 'XS', 4100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5225SUN005SM', 'PT5225SUN005SM', 'SMALL', 4700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2304SBR011XS.1', 'PT2304SBR011XS.1', 'SMALL', 4650, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2304SBR011XS.2', 'PT2304SBR011XS.2', 'MEDIUM', 4650, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2249SBC055', 'PT2249SBC055', 'MEDIUM', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5255SBA007MD', 'PT5255SBA007MD', 'MEDIUM', 4650, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('2976STR001.1', '2976STR001.1', 'SMALL', 2700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('2976STR001.2', '2976STR001.2', 'MEDIUM', 2700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT4669SBR796MD', 'PT4669SBR796MD', 'MEDIUM', 0, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5331SBA001', 'PT5331SBA001', 'MEDIUM', 4700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT3679SBR003', 'PT3679SBR003', 'MEDIUM', 3900, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2743SUN002', 'PT2743SUN002', 'LARGE', 3900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Bikinis' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT3727SUN002', 'PT3727SUN002', 'LARGE', 4000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5299SOC002.1', 'PT5299SOC002.1', 'SMALL', 5650, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5299SOC002.2', 'PT5299SOC002.2', 'MEDIUM', 5650, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT3932SOC001', 'PT3932SOC001', 'MEDIUM', 4500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT9783SOC380', 'PT9783SOC380', 'MEDIUM', 5700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT3871SOC166', 'PT3871SOC166', 'LARGE', 5700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5431SOB002', 'PT5431SOB002', 'SMALL', 6400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5248SOC001', 'PT5248SOC001', 'SMALL', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5257SOC001', 'PT5257SOC001', 'SMALL', 4600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5431SOB001', 'PT5431SOB001', 'SMALL', 4950, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5283SOC002', 'PT5283SOC002', 'LARGE', 4700, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT3952SOC002.1', 'PT3952SOC002.1', 'MEDIUM', 5700, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT3952SOC002.2', 'PT3952SOC002.2', 'LARGE', 5700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('DIANTHUS ALICIA', '123389', NULL, 3120, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5047SOC600', 'PT5047SOC600', 'MEDIUM', 5800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5047SOC001', 'PT5047SOC001', 'MEDIUM', 4400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT3623SOC001', 'PT3623SOC001', 'MEDIUM', 5000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('30854', '30854', 'MEDIUM', 3120, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2671SOC002', 'PT2671SOC002', 'LARGE', 2460, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2391CKS503', 'PT2391CKS503', 'SMALL', 1900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2391CKS504', 'PT2391CKS504', 'MEDIUM', 2400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2391CKS502', 'PT2391CKS502', 'SMALL', 2400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT3135CKS588', 'PT3135CKS588', 'SMALL', 2000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('2003CPR005', '2003CPR005', 'OS', 0, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'FALDAS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2572CKS002', 'PT2572CKS002', 'LARGE', 2200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2795CRO001', 'PT2795CRO001', 'MEDIUM', 2700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2578CHT001', 'PT2578CHT001', 'SMALL', 3500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'FALDAS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2746CKL001', 'PT2746CKL001', 'SMALL', 4100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANT' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5255SBA003', 'PT5255SBA003', 'SMALL', 3060, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('1991CKL001', '1991CKL001', 'LARGE', 1980, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANT' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT1836CPA003', 'PT1836CPA003', 'LARGE', 3400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANT' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2318CPA001', 'PT2318CPA001', 'LARGE', 2640, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2358CJU001', 'PT2358CJU001', 'SMALL', 5000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2707CLD001', 'PT2707CLD001', 'MEDIUM', 4700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('1940CLD002', '1940CLD002', 'LARGE', 2880, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2172CLD001', 'PT2172CLD001', 'LARGE', 3280, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2268CMD001', 'PT2268CMD001', 'MEDIUM', 3040, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT5138SCC001', 'PT5138SCC001', 'SMALL', 4300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SETS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('LACE SET', 'PT2321CPA016', 'SMALL', 11400, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('1951CSD001', '1951CSD001', 'LARGE', 2500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('OWEN DRESS', 'PT2530CLD001', 'SMALL', 6500, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2592CLD001.1', 'PT2592CLD001.1', 'SMALL', 4900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2592CLD001.2', 'PT2592CLD001.2', 'MEDIUM', 4900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'VESTIDOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('PT2592CLD001.3', 'PT2592CLD001.3', 'LARGE', 4900, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANT' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('2053ALL024.1', '2053ALL024.1', 'MEDIUM', 2200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANT' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('2053ALL024.2', '2053ALL024.2', 'SMALL', 2200, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANT' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('2053ALL032.1', '2053ALL032.1', 'MEDIUM', 2100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANT' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('2053ALL032.2', '2053ALL032.2', 'LARGE', 2100, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CAMISAS/TOPS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('2222ACT005', '2222ACT005', 'SMALL', 1600, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'FUNDA' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('4118XTC001.1', '4118XTC001.1', 'U', 1250, 0, 3, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 3, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'FUNDA' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('4118XTC001.2', '4118XTC001.2', 'U', 150, 0, 4, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 4, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CHUMPA' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('1072INV0036', '1072INV0036', '8', 1800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'CARTERA' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('4106XTE003', '4106XTE003', 'OS', 1800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'MINI MONEDERO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MAAJI' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('4126XPK001', '4126XPK001', 'OS', 1100, 0, 2, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 2, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MOLA MOLA' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('NOVA RETRO SET', '5', 'LARGE', 4000, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'PANT' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MOLA MOLA' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('MIKA RETRO PANTS', '4', 'SMALL', 4700, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SALIDAS/PAREOS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'MOLA MOLA' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('AMBER ROAR SKIRT', '2', 'SMALL', 1950, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'EXFOLEANTES' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'TRUE OCEAN' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TO46753', 'TO46753', 'OS', 750, 0, 4, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 4, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'BODY SPRAY' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'TRUE OCEAN' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TO59359', 'TO59359', 'OS', 650, 0, 6, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 6, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'KIT DE CUIDADO' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'TRUE OCEAN' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('TO59279', 'TO59279', 'OS', 1850, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SUNCREEN FACE' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SUN BUM' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SB24156', 'SB24156', 'OS', 500, 0, 5, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 5, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SEA SPRAY' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SUN BUM' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SB47619', 'SB47619', 'OS', 630, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'SUNCREEN SPRAY' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'SUN BUM' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('SB10430', 'SB10430', 'OS', 880, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'FALDAS' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'TOUCHÉ' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('0A86022', '0A86022', 'SMALL', 1800, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'REBELL' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('E020', 'E020', 'XL', 2300, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'REBELL' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('EG019', 'EG019', '2XL', 1955, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');
  v_cat := (SELECT id FROM categorias WHERE razon_social_id = 10 AND nombre = 'Enteros' ORDER BY id LIMIT 1);
  v_marca := (SELECT id FROM marcas WHERE razon_social_id = 10 AND nombre = 'ESTIVO' ORDER BY id LIMIT 1);
  INSERT INTO productos (nombre, codigo_barras, talla, precio_venta_sugerido, costo_promedio, stock_total, marca_id, categoria_id, razon_social_id, usuario)
  VALUES ('3061', '3061', 'MEDIUM', 3040, 0, 1, v_marca, v_cat, 10, 'carga-inicial') RETURNING id INTO v_prod;
  INSERT INTO transacciones_inventario (producto_id, almacen_id, localizacion_id, tipo_movimiento, cantidad, costo_o_precio_unitario, razon_social_id, usuario)
  VALUES (v_prod, 6, 7, 'Ingreso Manual', 1, 0, 10, 'carga-inicial');

  RAISE NOTICE 'Carga Coral OK: % productos, % con existencia.', 697, 687;
END
$$;
