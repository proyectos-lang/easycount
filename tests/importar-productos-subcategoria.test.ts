import { describe, it, expect, vi, beforeEach } from "vitest"

// ── Mock de catálogos e inventario (importados por importar-productos) ──────
// Registramos las llamadas para verificar que la subcategoría se crea y se pasa
// a saveProducto. Simulamos un tenant con la categoría "Anillos" ya existente
// (id 100) pero SIN subcategorías, para reproducir el caso reportado (rs 15).

const state = {
  categorias: [{ id: 100, nombre: "Anillos" }],
  subcategorias: [] as { id: number; nombre: string; categoria_id: number }[],
  marcas: [] as { id: number; nombre: string }[],
  nextSubId: 500,
  nextMarcaId: 700,
  nextCatId: 900,
  productosGuardados: [] as any[],
}

vi.mock("@/lib/services/catalogos", () => ({
  getProductos: vi.fn(async () => ({ data: [], error: null })),
  getCategorias: vi.fn(async () => ({ data: state.categorias, error: null })),
  getMarcas: vi.fn(async () => ({ data: state.marcas, error: null })),
  getSubcategorias: vi.fn(async () => ({ data: state.subcategorias, error: null })),
  getAlmacenes: vi.fn(async () => ({ data: [], error: null })),
  getLocalizaciones: vi.fn(async () => ({ data: [], error: null })),
  createCategoria: vi.fn(async (nombre: string) => {
    const c = { id: state.nextCatId++, nombre }
    state.categorias.push(c)
    return { data: c, error: null }
  }),
  createMarca: vi.fn(async (nombre: string) => {
    const m = { id: state.nextMarcaId++, nombre }
    state.marcas.push(m)
    return { data: m, error: null }
  }),
  createSubcategoria: vi.fn(async (nombre: string, categoriaId: number) => {
    const s = { id: state.nextSubId++, nombre, categoria_id: categoriaId }
    state.subcategorias.push(s)
    return { data: s, error: null }
  }),
  saveProducto: vi.fn(async (producto: any) => {
    const saved = { ...producto, id: 1000 + state.productosGuardados.length }
    state.productosGuardados.push(saved)
    return { data: saved, error: null }
  }),
}))

vi.mock("@/lib/services/inventario", () => ({
  procesarIngresoManual: vi.fn(async () => ({ error: null })),
}))

import { importarProductos, previsualizarImportProductos, type FilaProductoImport } from "@/lib/services/importar-productos"
import * as catalogos from "@/lib/services/catalogos"

function fila(over: Partial<FilaProductoImport>): FilaProductoImport {
  return {
    fila: 2, codigo: "", nombre: "Prod", categoria: "", subcategoria: "",
    marca: "", talla: "", precio_venta: 0, costo_unitario: 0, cantidad_inicial: 0,
    ...over,
  }
}

beforeEach(() => {
  state.categorias = [{ id: 100, nombre: "Anillos" }]
  state.subcategorias = []
  state.marcas = []
  state.nextSubId = 500
  state.nextMarcaId = 700
  state.nextCatId = 900
  state.productosGuardados = []
  vi.clearAllMocks()
})

describe("carga masiva: subcategoría por nombre", () => {
  it("crea la subcategoría dentro de su categoría y la asigna al producto", async () => {
    const filas = [fila({ codigo: "A1", nombre: "Anillo oro", categoria: "Anillos", subcategoria: "Oro" })]
    const res = await importarProductos(filas, { almacen_id: 0, localizacion_id: 0 })

    expect(res.error).toBeNull()
    expect(res.data?.subcategoriasCreadas).toBe(1)
    // Se creó dentro de la categoría existente (id 100).
    expect(catalogos.createSubcategoria).toHaveBeenCalledWith("Oro", 100)
    // El producto guardado lleva el subcategoria_id recién creado.
    const guardado = state.productosGuardados[0]
    expect(guardado.categoria_id).toBe(100)
    expect(guardado.subcategoria_id).toBe(500)
  })

  it("crea también la categoría si no existe, y la subcategoría cuelga de ella", async () => {
    const filas = [fila({ codigo: "B1", nombre: "Collar", categoria: "Collares", subcategoria: "Plata" })]
    const res = await importarProductos(filas, { almacen_id: 0, localizacion_id: 0 })

    expect(res.data?.categoriasCreadas).toBe(1)
    expect(res.data?.subcategoriasCreadas).toBe(1)
    const nuevaCatId = state.categorias.find((c) => c.nombre === "Collares")!.id
    expect(catalogos.createSubcategoria).toHaveBeenCalledWith("Plata", nuevaCatId)
    expect(state.productosGuardados[0].subcategoria_id).toBe(500)
  })

  it("reutiliza la subcategoría entre filas (no la duplica)", async () => {
    const filas = [
      fila({ codigo: "C1", nombre: "Anillo 1", categoria: "Anillos", subcategoria: "Oro" }),
      fila({ codigo: "C2", nombre: "Anillo 2", categoria: "Anillos", subcategoria: "Oro" }),
    ]
    const res = await importarProductos(filas, { almacen_id: 0, localizacion_id: 0 })
    expect(res.data?.subcategoriasCreadas).toBe(1)
    expect(catalogos.createSubcategoria).toHaveBeenCalledTimes(1)
    expect(state.productosGuardados[0].subcategoria_id).toBe(500)
    expect(state.productosGuardados[1].subcategoria_id).toBe(500)
  })

  it("sin categoría, la subcategoría NO se crea (cuelga de una categoría)", async () => {
    const filas = [fila({ codigo: "D1", nombre: "Suelto", categoria: "", subcategoria: "Oro" })]
    const res = await importarProductos(filas, { almacen_id: 0, localizacion_id: 0 })
    expect(res.data?.subcategoriasCreadas).toBe(0)
    expect(catalogos.createSubcategoria).not.toHaveBeenCalled()
    expect(state.productosGuardados[0].subcategoria_id).toBeNull()
  })

  it("preview lista la subcategoría como 'nueva'", async () => {
    const filas = [fila({ codigo: "E1", nombre: "Anillo", categoria: "Anillos", subcategoria: "Oro" })]
    const prev = await previsualizarImportProductos(filas)
    expect(prev.subcategoriasNuevas).toContain("Oro")
  })
})
