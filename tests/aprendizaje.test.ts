import { describe, it, expect } from "vitest"
import { MODULOS } from "@/lib/constants/modulos"
import {
  TUTORIALES,
  TUTORIAL_GENERAL,
  modulosSinTutorial,
  buscarTemas,
  getTutorial,
} from "@/lib/aprendizaje"

describe("cobertura del Centro de Aprendizaje", () => {
  it("todos los modulos registrados tienen tutorial (guardrail)", () => {
    expect(modulosSinTutorial()).toEqual([])
  })

  it("hay un tutorial por modulo (sin duplicados) + el articulo general", () => {
    const claves = TUTORIALES.map((t) => t.modulo)
    expect(new Set(claves).size).toBe(claves.length)
    expect(TUTORIALES.length).toBe(MODULOS.length)
    expect(TUTORIAL_GENERAL.modulo).toBe("general")
  })

  it("cada tutorial esta completo (que hace, que no hace, pasos y faqs)", () => {
    for (const t of [TUTORIAL_GENERAL, ...TUTORIALES]) {
      expect(t.queHace.length, `${t.modulo}: queHace vacio`).toBeGreaterThan(0)
      expect(t.queNoHace.length, `${t.modulo}: queNoHace vacio`).toBeGreaterThan(0)
      expect(t.operaciones.length, `${t.modulo}: sin operaciones`).toBeGreaterThan(0)
      expect(t.keywords.length, `${t.modulo}: sin keywords`).toBeGreaterThan(0)
    }
  })
})

describe("buscarTemas", () => {
  const todos = [TUTORIAL_GENERAL, ...TUTORIALES]

  it("ignora tildes (comision encuentra comisión)", () => {
    const r = buscarTemas("comision", todos)
    expect(r.length).toBeGreaterThan(0)
  })

  it("encuentra por keyword (cumpleanos -> Clientes)", () => {
    const r = buscarTemas("cumpleanos", todos)
    expect(r.some((x) => x.tutorial.modulo === "Clientes")).toBe(true)
  })

  it("no busca con menos de 2 caracteres", () => {
    expect(buscarTemas("a", todos)).toEqual([])
  })

  it("devuelve maximo un resultado por tutorial", () => {
    const r = buscarTemas("venta", todos)
    const claves = r.map((x) => x.tutorial.modulo)
    expect(new Set(claves).size).toBe(claves.length)
  })
})

describe("getTutorial", () => {
  it("resuelve por nombre exacto de modulo y el especial 'general'", () => {
    expect(getTutorial("general")?.modulo).toBe("general")
    expect(getTutorial("Nueva Venta")?.modulo).toBe("Nueva Venta")
    expect(getTutorial("NoExiste")).toBeNull()
  })
})
