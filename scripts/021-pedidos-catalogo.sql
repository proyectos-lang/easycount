-- =========================================================================
-- 021 - Pedidos por Catalogo (links publicos + pedidos de clientes)
-- =========================================================================
--
-- ESTRICTAMENTE ADITIVO: solo CREATE TABLE de 4 tablas nuevas, CREATE POLICY
-- sobre ellas, e INSERT de 1 fila en `modulos`. No hace ALTER ni toca
-- ninguna tabla existente.
--
-- FLUJO
--   1. La empresa genera un link tokenizado (catalogo completo o seleccion
--      de productos) con vigencia opcional en dias.
--   2. El cliente (SIN login) abre /catalogo/{token}, arma su carrito con
--      los precios de catalogo y lo envia con su nombre/telefono.
--   3. Al enviar, el link pasa a 'Usado' (muere). Tambien muere al vencer
--      su fecha o si el admin lo anula.
--   4. El admin revisa el pedido (puede modificar lineas), lo rechaza o lo
--      aprueba. Al aprobar se crea una VENTA normal (factura, inventario,
--      caja/bancos) y el pedido guarda el venta_id.
--
-- SEGURIDAD
--   - RLS de aislamiento por tenant en las 4 tablas (lado autenticado).
--   - El lado PUBLICO (cliente con link) NO toca estas tablas directamente:
--     entra por endpoints server-side con service role donde el token es la
--     autorizacion y el razon_social_id se resuelve del propio link.
--
-- Requiere el script 017 (funcion app_current_tenant) ya aplicado.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. catalogo_links
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.catalogo_links (
  id               SERIAL PRIMARY KEY,
  razon_social_id  INTEGER NOT NULL REFERENCES public.razon_social(id) ON DELETE CASCADE,
  token            TEXT NOT NULL UNIQUE,
  -- Referencia interna para la empresa (ej. "Catalogo Dona Maria - julio")
  nombre           TEXT,
  tipo             TEXT NOT NULL CHECK (tipo IN ('completo','seleccion')),
  estado           TEXT NOT NULL DEFAULT 'Activo'
                     CHECK (estado IN ('Activo','Usado','Vencido','Anulado')),
  fecha_expiracion TIMESTAMPTZ,
  usuario          TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_catalogo_links_token
  ON public.catalogo_links(token);
CREATE INDEX IF NOT EXISTS idx_catalogo_links_razon_social
  ON public.catalogo_links(razon_social_id, estado);

-- -------------------------------------------------------------------------
-- 2. catalogo_link_productos (solo para tipo 'seleccion')
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.catalogo_link_productos (
  id               SERIAL PRIMARY KEY,
  razon_social_id  INTEGER NOT NULL REFERENCES public.razon_social(id) ON DELETE CASCADE,
  link_id          INTEGER NOT NULL REFERENCES public.catalogo_links(id) ON DELETE CASCADE,
  producto_id      INTEGER NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_catalogo_link_productos_link
  ON public.catalogo_link_productos(link_id);

-- -------------------------------------------------------------------------
-- 3. pedidos_encabezado
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pedidos_encabezado (
  id               SERIAL PRIMARY KEY,
  razon_social_id  INTEGER NOT NULL REFERENCES public.razon_social(id) ON DELETE CASCADE,
  link_id          INTEGER NOT NULL REFERENCES public.catalogo_links(id),
  numero_pedido    TEXT,
  -- Datos que el cliente escribe en el formulario publico.
  cliente_nombre   TEXT NOT NULL,
  cliente_telefono TEXT,
  notas            TEXT,
  total            NUMERIC(14,2) NOT NULL DEFAULT 0,
  estado           TEXT NOT NULL DEFAULT 'Pendiente'
                     CHECK (estado IN ('Pendiente','Aprobado','Rechazado')),
  motivo_rechazo   TEXT,
  -- Venta generada al aprobar (nullable hasta entonces).
  venta_id         INTEGER REFERENCES public.ventas_encabezado(id),
  -- Admin que resolvio el pedido (aprobo/rechazo).
  usuario          TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_enc_razon_social
  ON public.pedidos_encabezado(razon_social_id, estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_enc_link
  ON public.pedidos_encabezado(link_id);

-- -------------------------------------------------------------------------
-- 4. pedidos_detalle
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pedidos_detalle (
  id               SERIAL PRIMARY KEY,
  razon_social_id  INTEGER NOT NULL REFERENCES public.razon_social(id) ON DELETE CASCADE,
  pedido_id        INTEGER NOT NULL REFERENCES public.pedidos_encabezado(id) ON DELETE CASCADE,
  producto_id      INTEGER NOT NULL REFERENCES public.productos(id),
  cantidad         NUMERIC(14,2) NOT NULL CHECK (cantidad > 0),
  -- Precio de catalogo al momento del pedido (recalculado server-side,
  -- nunca confiado del navegador del cliente). El admin puede ajustarlo
  -- al revisar.
  precio_unitario  NUMERIC(14,2) NOT NULL DEFAULT 0,
  subtotal         NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_det_pedido
  ON public.pedidos_detalle(pedido_id);

-- -------------------------------------------------------------------------
-- 5. RLS de aislamiento multi-empresa (patron del script 017)
-- -------------------------------------------------------------------------
ALTER TABLE public.catalogo_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_catalogo_links ON public.catalogo_links;
CREATE POLICY tenant_isolation_catalogo_links ON public.catalogo_links
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

ALTER TABLE public.catalogo_link_productos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_catalogo_link_productos ON public.catalogo_link_productos;
CREATE POLICY tenant_isolation_catalogo_link_productos ON public.catalogo_link_productos
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

ALTER TABLE public.pedidos_encabezado ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pedidos_encabezado ON public.pedidos_encabezado;
CREATE POLICY tenant_isolation_pedidos_encabezado ON public.pedidos_encabezado
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

ALTER TABLE public.pedidos_detalle ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pedidos_detalle ON public.pedidos_detalle;
CREATE POLICY tenant_isolation_pedidos_detalle ON public.pedidos_detalle
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- -------------------------------------------------------------------------
-- 6. Modulo nuevo (dato). Debe calzar EXACTO con lib/constants/modulos.ts.
-- -------------------------------------------------------------------------
INSERT INTO public.modulos (nombre)
VALUES ('Pedidos por Catalogo')
ON CONFLICT (nombre) DO NOTHING;
