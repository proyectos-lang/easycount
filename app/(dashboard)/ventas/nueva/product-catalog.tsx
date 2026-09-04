"use client"

import * as React from "react"
import Image from "next/image"
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  Plus,
  Check,
  ImageIcon,
  Loader2,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Producto, Marca, Categoria } from "@/lib/services/catalogos"

const VIEW_STORAGE_KEY = "pos.catalogo.view"
const STOCK_BAJO = 5
const TODOS = "__todos__"

interface ProductCatalogProps {
  productos: Producto[]
  marcas: Marca[]
  categorias: Categoria[]
  /** IDs de productos ya agregados al carrito (para marcar visualmente). */
  idsEnVenta: number[]
  onAdd: (producto: Producto) => void
  disabled?: boolean
  /** Si hay una localizacion seleccionada, el catalogo filtra por disponibilidad. */
  localizacionSeleccionada?: boolean
  /** Stock real de cada producto en la localizacion seleccionada (id -> cantidad). */
  stockPorLocalizacion?: Record<number, number>
  /** Indica que el stock de la localizacion aun se esta cargando. */
  loadingStock?: boolean
  /**
   * Modo "buscar contra la BD": el filtro de texto NO es en vivo; el usuario
   * escribe y dispara la busqueda con el boton Buscar (o Enter) via onBuscar.
   * El padre resuelve la consulta y pasa los resultados por `productos`.
   */
  serverSearch?: boolean
  /** Llamado al presionar Buscar (o Enter) con el texto actual. */
  onBuscar?: (query: string) => void
  /** Indica que la busqueda contra la BD esta en curso. */
  buscando?: boolean
  /** Texto de la caja de busqueda controlado por el padre (opcional). */
  searchValue?: string
  /** Cambios del texto de busqueda (si se controla desde el padre). */
  onSearchChange?: (value: string) => void
  /** Agrega a la venta TODAS las referencias actualmente filtradas. */
  onAddTodos?: (productos: Producto[]) => void
  /**
   * Precio final a mostrar/usar por producto (ej. lista de precios del cliente).
   * Si devuelve un valor distinto al precio base, el catalogo muestra el base
   * tachado y al lado el final. Por defecto usa el precio del maestro.
   */
  precioFinal?: (p: Producto) => number
}

/**
 * Catalogo de productos para el POS. Permite buscar por texto (nombre o
 * codigo de barras), filtrar por categoria y marca (combinables) y alternar
 * entre vista de mosaico (grid) y vista de lista. La preferencia de vista se
 * persiste en localStorage para que el usuario la conserve entre sesiones.
 *
 * Cuando hay una localizacion seleccionada, el catalogo muestra unicamente las
 * referencias con existencias en esa localizacion (stock > 0) y la cantidad
 * disponible real; sin localizacion, muestra el stock total como referencia.
 */
export function ProductCatalog({
  productos,
  marcas,
  categorias,
  idsEnVenta,
  onAdd,
  disabled,
  localizacionSeleccionada = false,
  stockPorLocalizacion,
  loadingStock = false,
  serverSearch = false,
  onBuscar,
  buscando = false,
  searchValue,
  onSearchChange,
  onAddTodos,
  precioFinal,
}: ProductCatalogProps) {
  const [view, setView] = React.useState<"grid" | "list">("grid")
  const [searchInternal, setSearchInternal] = React.useState("")
  // Caja de busqueda controlada por el padre si pasa searchValue/onSearchChange
  // (lo usa el lector de codigo de barras); si no, estado interno.
  const search = searchValue !== undefined ? searchValue : searchInternal
  const setSearch = (v: string) => (onSearchChange ? onSearchChange(v) : setSearchInternal(v))
  const [categoriaFiltro, setCategoriaFiltro] = React.useState<string>(TODOS)
  const [marcaFiltro, setMarcaFiltro] = React.useState<string>(TODOS)

  // Resuelve el stock a mostrar para un producto: si hay localizacion activa,
  // usa el stock de esa localizacion; si no, cae al stock total del producto.
  const getStock = React.useCallback(
    (p: Producto): number => {
      if (localizacionSeleccionada) {
        return stockPorLocalizacion?.[p.id!] ?? 0
      }
      return p.stock_total ?? 0
    },
    [localizacionSeleccionada, stockPorLocalizacion]
  )

  // Hidratamos la preferencia de vista desde localStorage al montar.
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_STORAGE_KEY)
      if (saved === "grid" || saved === "list") setView(saved)
    } catch {
      // localStorage puede no estar disponible (SSR / modo privado).
    }
  }, [])

  function cambiarVista(next: "grid" | "list") {
    setView(next)
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next)
    } catch {
      // no-op
    }
  }

  // Filtrado local combinable: texto + categoria + marca + disponibilidad.
  // Si hay localizacion seleccionada, ocultamos las referencias sin stock.
  const filtrados = React.useMemo(() => {
    const q = search.toLowerCase().trim()
    return productos.filter((p) => {
      const nombre = (p.nombre ?? "").toString().toLowerCase()
      const codigo = (p.codigo_barras ?? "").toString().toLowerCase()
      // En modo servidor el texto ya lo aplico la BD; aqui no re-filtramos por
      // texto (el padre pasa los resultados en `productos`).
      const matchTexto = serverSearch || !q || nombre.includes(q) || codigo.includes(q)
      const matchCategoria =
        categoriaFiltro === TODOS ||
        String(p.categoria_id ?? "") === categoriaFiltro
      const matchMarca =
        marcaFiltro === TODOS || String(p.marca_id ?? "") === marcaFiltro
      const matchDisponibilidad =
        !localizacionSeleccionada || (stockPorLocalizacion?.[p.id!] ?? 0) > 0
      return matchTexto && matchCategoria && matchMarca && matchDisponibilidad
    })
  }, [productos, search, categoriaFiltro, marcaFiltro, localizacionSeleccionada, stockPorLocalizacion, serverSearch])

  return (
    <div className="flex flex-col gap-3 h-full min-h-0">
      {/* Barra de busqueda + filtros + toggle de vista */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={
                serverSearch
                  ? (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        onBuscar?.(search)
                      }
                    }
                  : undefined
              }
              placeholder="Buscar por nombre o codigo de barras..."
              className="pl-9"
            />
          </div>
          {serverSearch && (
            <Button
              type="button"
              onClick={() => onBuscar?.(search)}
              disabled={buscando}
              className="shrink-0 gap-1.5"
              title="Buscar productos"
            >
              {buscando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Buscar</span>
            </Button>
          )}
          <div className="flex items-center rounded-md border bg-muted/40 p-0.5 shrink-0">
            <Button
              type="button"
              variant={view === "grid" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => cambiarVista("grid")}
              title="Vista de mosaico"
              aria-label="Vista de mosaico"
              aria-pressed={view === "grid"}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={view === "list" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => cambiarVista("list")}
              title="Vista de lista"
              aria-label="Vista de lista"
              aria-pressed={view === "list"}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas las categorias</SelectItem>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={marcaFiltro} onValueChange={setMarcaFiltro}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas las marcas</SelectItem>
              {marcas.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Barra de accion: cantidad filtrada + Seleccionar todo */}
      {onAddTodos && !disabled && !buscando && filtrados.length > 0 && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {filtrados.length} referencia{filtrados.length === 1 ? "" : "s"}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 gap-1.5"
            onClick={() => onAddTodos(filtrados)}
            title="Agregar a la venta todas las referencias filtradas"
          >
            <Plus className="h-3.5 w-3.5" />
            Seleccionar todo
          </Button>
        </div>
      )}

      {/* Resultados */}
      <div className="flex-1 overflow-auto min-h-0">
        {buscando ? (
          <div className="h-full min-h-40 flex flex-col items-center justify-center text-muted-foreground gap-2 py-10">
            <Loader2 className="h-8 w-8 animate-spin opacity-40" />
            <p className="text-sm">Buscando productos...</p>
          </div>
        ) : loadingStock ? (
          <div className="h-full min-h-40 flex flex-col items-center justify-center text-muted-foreground gap-2 py-10">
            <Loader2 className="h-8 w-8 animate-spin opacity-40" />
            <p className="text-sm">Cargando disponibilidad...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="h-full min-h-40 flex flex-col items-center justify-center text-muted-foreground gap-2 py-10">
            <ImageIcon className="h-10 w-10 opacity-20" />
            <p className="text-sm">
              {serverSearch && search.trim()
                ? "No se encontraron productos para esa busqueda."
                : localizacionSeleccionada
                  ? "No hay productos disponibles en esta localizacion."
                  : "No se encontraron productos."}
            </p>
          </div>
        ) : view === "grid" ? (
          <ProductGrid
            productos={filtrados}
            idsEnVenta={idsEnVenta}
            onAdd={onAdd}
            disabled={disabled}
            getStock={getStock}
            precioFinal={precioFinal}
          />
        ) : (
          <ProductTable
            productos={filtrados}
            idsEnVenta={idsEnVenta}
            onAdd={onAdd}
            disabled={disabled}
            getStock={getStock}
            precioFinal={precioFinal}
          />
        )}
      </div>
    </div>
  )
}

function stockClass(stock: number): string {
  return stock <= STOCK_BAJO ? "text-red-600" : "text-emerald-600"
}

function ProductImage({
  url,
  nombre,
  className,
}: {
  url?: string
  nombre: string
  className?: string
}) {
  const [errored, setErrored] = React.useState(false)
  if (!url || errored) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
      >
        <ImageIcon className="h-1/3 w-1/3 opacity-40" />
      </div>
    )
  }
  return (
    <Image
      src={url || "/placeholder.svg"}
      alt={nombre}
      width={160}
      height={160}
      unoptimized
      onError={() => setErrored(true)}
      // El object-fit lo decide cada uso (contain en el grid, cover en la lista).
      className={cn(className)}
    />
  )
}

interface ListProps {
  productos: Producto[]
  idsEnVenta: number[]
  onAdd: (p: Producto) => void
  disabled?: boolean
  getStock: (p: Producto) => number
  precioFinal?: (p: Producto) => number
}

function ProductGrid({ productos, idsEnVenta, onAdd, disabled, getStock, precioFinal }: ListProps) {
  return (
    <div className="grid grid-cols-3 min-[480px]:grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-2.5">
      {productos.map((p) => {
        const enVenta = idsEnVenta.includes(p.id!)
        const stock = getStock(p)
        const base = p.precio_venta_sugerido ?? 0
        const final = precioFinal ? precioFinal(p) : base
        const hayLista = precioFinal != null && Math.abs(final - base) > 0.009
        return (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            onClick={() => onAdd(p)}
            className={cn(
              "group relative flex flex-col rounded-lg border bg-card text-left overflow-hidden transition-colors",
              "hover:border-primary hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              enVenta && "border-primary"
            )}
          >
            <div className="relative aspect-square w-full bg-muted/30">
              <ProductImage
                url={p.foto_url}
                nombre={p.nombre}
                className="h-full w-full object-contain"
              />
              {enVenta && (
                <span className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
            <div className="flex flex-col gap-0.5 p-1.5 sm:p-2 min-w-0">
              <p className="text-[10px] sm:text-[11px] font-medium leading-tight line-clamp-2 break-words">
                {p.nombre}
              </p>
              {p.codigo_barras && (
                <p className="text-[9px] sm:text-[10px] font-mono text-muted-foreground truncate">
                  {p.codigo_barras}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 mt-0.5">
                {hayLista ? (
                  <span className="flex flex-col items-start leading-none">
                    <span className="text-[8px] sm:text-[9px] text-muted-foreground line-through">L {base.toFixed(2)}</span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 whitespace-nowrap">L {final.toFixed(2)}</span>
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] font-bold text-primary whitespace-nowrap">
                    L {base.toFixed(2)}
                  </span>
                )}
                <span
                  className={cn(
                    "text-[9px] sm:text-[10px] font-medium whitespace-nowrap",
                    stockClass(stock)
                  )}
                >
                  Stock: {stock}
                </span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function ProductTable({ productos, idsEnVenta, onAdd, disabled, getStock, precioFinal }: ListProps) {
  return (
    <div className="rounded-lg border overflow-x-auto">
      <table className="w-full min-w-[34rem] text-[11px]">
        <thead className="bg-muted/60 text-[10px] uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="text-left font-medium px-2 sm:px-3 py-1.5 w-10">Foto</th>
            <th className="text-left font-medium px-2 sm:px-3 py-1.5">Nombre</th>
            <th className="text-left font-medium px-3 py-1.5">
              Codigo
            </th>
            <th className="text-left font-medium px-3 py-1.5 hidden lg:table-cell">
              Marca
            </th>
            <th className="text-left font-medium px-3 py-1.5 hidden lg:table-cell">
              Categoria
            </th>
            <th className="text-right font-medium px-2 sm:px-3 py-1.5">Stock</th>
            <th className="text-right font-medium px-2 sm:px-3 py-1.5">Precio</th>
            <th className="px-2 sm:px-3 py-1.5 w-10" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {productos.map((p) => {
            const enVenta = idsEnVenta.includes(p.id!)
            const stock = getStock(p)
            const base = p.precio_venta_sugerido ?? 0
            const final = precioFinal ? precioFinal(p) : base
            const hayLista = precioFinal != null && Math.abs(final - base) > 0.009
            return (
              <tr key={p.id} className="hover:bg-muted/40">
                <td className="px-2 sm:px-3 py-1.5">
                  <ProductImage
                    url={p.foto_url}
                    nombre={p.nombre}
                    className="h-8 w-8 rounded-md shrink-0 object-cover"
                  />
                </td>
                <td className="px-2 sm:px-3 py-1.5 max-w-[16rem]">
                  <span className="font-medium line-clamp-2 break-words">{p.nombre}</span>
                  {enVenta && (
                    <Badge variant="secondary" className="mt-1 text-[9px]">
                      En venta
                    </Badge>
                  )}
                </td>
                <td className="px-3 py-1.5 font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                  {p.codigo_barras || "-"}
                </td>
                <td className="px-3 py-1.5 text-muted-foreground hidden lg:table-cell">
                  {p.marca_nombre || "-"}
                </td>
                <td className="px-3 py-1.5 text-muted-foreground hidden lg:table-cell">
                  {p.categoria_nombre || "-"}
                </td>
                <td
                  className={cn(
                    "px-2 sm:px-3 py-1.5 text-right font-medium whitespace-nowrap",
                    stockClass(stock)
                  )}
                >
                  {stock}
                </td>
                <td className="px-2 sm:px-3 py-1.5 text-right whitespace-nowrap">
                  {hayLista ? (
                    <span className="flex flex-col items-end leading-tight">
                      <span className="text-[10px] text-muted-foreground line-through">L {base.toFixed(2)}</span>
                      <span className="font-bold text-emerald-600">L {final.toFixed(2)}</span>
                    </span>
                  ) : (
                    <span className="font-bold text-primary">L {base.toFixed(2)}</span>
                  )}
                </td>
                <td className="px-2 sm:px-3 py-1.5 text-right">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    disabled={disabled}
                    onClick={() => onAdd(p)}
                    title="Agregar al carrito"
                    aria-label={`Agregar ${p.nombre} al carrito`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
