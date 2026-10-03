import { describe, it, expect } from "vitest"
import { compararTallas } from "@/lib/utils/tallas"

describe("compararTallas", () => {
  it("ordena letras como en la etiqueta", () => {
    expect(["XL", "S", "M", "XS", "L"].sort(compararTallas)).toEqual(["XS", "S", "M", "L", "XL"])
  })

  it("ordena números de menor a mayor (no alfabético)", () => {
    expect(["10", "8", "42", "6", "16"].sort(compararTallas)).toEqual(["6", "8", "10", "16", "42"])
  })

  it("letras, luego números, luego el resto; ignora mayúsculas y espacios", () => {
    expect(["Única", "38", " m ", "s", null].sort(compararTallas)).toEqual(["s", " m ", "38", null, "Única"])
  })
})
