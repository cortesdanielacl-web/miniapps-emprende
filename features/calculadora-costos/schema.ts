import { z } from "zod"

import {
  areUnitsCompatible,
  UNITS,
  type Unit,
} from "@/features/calculadora-costos/units"

const requiredText = (message: string) =>
  z.string().trim().min(1, message)

const requiredNonNegativeNumber = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine((value) => !Number.isNaN(Number(value)), {
      message: "Ingresa un número válido",
    })
    .refine((value) => Number(value) >= 0, {
      message: "No se permiten valores menores que cero",
    })

const requiredPositiveNumber = (message: string) =>
  requiredNonNegativeNumber(message).refine((value) => Number(value) > 0, {
    message: "Debe ser mayor que cero",
  })

const requiredMargin = (message: string) =>
  requiredNonNegativeNumber(message).refine((value) => Number(value) <= 500, {
    message: "Ingresa un margen válido.",
  })

export const unitSchema = z.enum(UNITS)

export const costLineSchema = z.object({
  name: requiredText("El nombre es obligatorio"),
  cost: requiredNonNegativeNumber("El costo es obligatorio"),
})

export type CostLineValues = z.infer<typeof costLineSchema>

const costLinesSchema = z
  .array(costLineSchema)
  .min(1, "Agrega al menos un ítem")

export const rawMaterialLineSchema = z
  .object({
    name: requiredText("El nombre del insumo es obligatorio"),
    purchasePrice: requiredNonNegativeNumber(
      "El precio de compra es obligatorio"
    ),
    purchaseQuantity: requiredPositiveNumber(
      "La cantidad comprada es obligatoria"
    ),
    purchaseUnit: unitSchema,
    usedQuantity: requiredNonNegativeNumber(
      "La cantidad utilizada es obligatoria"
    ),
    usedUnit: unitSchema,
  })
  .superRefine((line, ctx) => {
    if (!areUnitsCompatible(line.purchaseUnit, line.usedUnit)) {
      ctx.addIssue({
        code: "custom",
        path: ["usedUnit"],
        message: "Las unidades de compra y uso no son compatibles",
      })
    }
  })

export type RawMaterialLineValues = z.infer<typeof rawMaterialLineSchema>

const rawMaterialsSchema = z
  .array(rawMaterialLineSchema)
  .min(1, "Agrega al menos un insumo")

export const costCalculatorSchema = z.object({
  productName: requiredText("El nombre del producto es obligatorio"),
  rawMaterials: rawMaterialsSchema,
  laborItems: costLinesSchema,
  indirectItems: costLinesSchema,
  desiredMargin: requiredMargin("El margen de ganancia es obligatorio"),
})

export type CostCalculatorValues = z.infer<typeof costCalculatorSchema>

export const emptyCostLine: CostLineValues = {
  name: "",
  cost: "",
}

export const emptyRawMaterialLine: RawMaterialLineValues = {
  name: "",
  purchasePrice: "",
  purchaseQuantity: "",
  purchaseUnit: "g",
  usedQuantity: "",
  usedUnit: "g",
}

export const costCalculatorDefaultValues: CostCalculatorValues = {
  productName: "",
  rawMaterials: [{ ...emptyRawMaterialLine }],
  laborItems: [{ ...emptyCostLine }],
  indirectItems: [{ ...emptyCostLine }],
  desiredMargin: "",
}

export type { Unit }
