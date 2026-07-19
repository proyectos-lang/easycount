import { describe, it, expect } from "vitest"
import { MODULOS, findModuloByPath, findModuloByDBName } from "@/lib/constants/modulos"

describe("MODULOS", () => {
  it("no tiene nombres ni rutas duplicadas", () => {
    const nombres = MODULOS.map((m) => m.nombre)
    const hrefs = MODULOS.map((m) => m.href)
    expect(new Set(nombres).size).toBe(nombres.length)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })
})

describe("findModuloByPath", () => {
  it("matchea exacto y por prefijo", () => {
    expect(findModuloByPath("/ventas/nueva")?.nombre).toBe("Nueva Venta")
    expect(findModuloByPath("/ventas/nueva/extra")?.nombre).toBe("Nueva Venta")
  })

  it("en colision gana el href mas largo (dashboard de ventas vs ventas)", () => {
    expect(findModuloByPath("/ventas/dashboard")?.nombre).toBe("Dashboard Ventas")
    expect(findModuloByPath("/finanzas/dashboard")?.nombre).toBe("Dashboard Finanzas")
  })

  it("rutas sin modulo devuelven null (pasan el RouteGuard)", () => {
    expect(findModuloByPath("/")).toBeNull()
    expect(findModuloByPath("/aprendizaje")).toBeNull()
    expect(findModuloByPath("/catalogo/un-token")).toBeNull()
  })
})

describe("findModuloByDBName", () => {
  it("tolera tildes y variantes de la BD", () => {
    expect(findModuloByDBName("Valoración")?.nombre).toBe("Valoracion")
    expect(findModuloByDBName("Recepción por OC")?.nombre).toBe("Recepcion por OC")
  })

  it("resuelve alias abreviados (Historial -> Historial Ventas)", () => {
    expect(findModuloByDBName("Historial")?.nombre).toBe("Historial Ventas")
  })

  it("prefiere el match mas especifico", () => {
    expect(findModuloByDBName("Dashboard de Ventas")?.nombre).toBe("Dashboard Ventas")
    expect(findModuloByDBName("Dashboard")?.nombre).toBe("Dashboard")
  })
})
