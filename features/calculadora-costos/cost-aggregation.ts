/**
 * Agregación de costos base (sin pricing premium).
 * Usada por CostPreview (cliente) y ProfessionalReport (servidor).
 */

import type {
  CostLineValues,
  CostCalculatorValues,
  RawMaterialLineValues,
} from "@/features/calculadora-costos/schema"
import { calculateUsedCost } from "@/features/calculadora-costos/units"

export type CostBreakdownLine = {
  concept: string
  quantity: number | null
  unit: string | null
  unitCost: number | null
  totalCost: number
}

export type CostAggregation = {
  productName: string
  quantity: number
  rawMaterialsTotal: number
  laborTotal: number
  indirectTotal: number
  totalCost: number
  unitCost: number
  materialLines: CostBreakdownLine[]
  laborLines: CostBreakdownLine[]
  indirectLines: CostBreakdownLine[]
}

function buildMaterialLines(
  items: RawMaterialLineValues[]
): CostBreakdownLine[] {
  return items.map((item) => {
    const usedCost = calculateUsedCost(item)
    const quantity = Number(item.usedQuantity)
    const safeTotal =
      usedCost != null && Number.isFinite(usedCost) && usedCost >= 0
        ? usedCost
        : 0
    const safeQuantity =
      Number.isFinite(quantity) && quantity > 0 ? quantity : null
    const unitCost =
      safeQuantity != null && safeTotal > 0 ? safeTotal / safeQuantity : null

    return {
      concept: item.name.trim(),
      quantity: safeQuantity,
      unit: item.usedUnit,
      unitCost,
      totalCost: safeTotal,
    }
  })
}

function buildNamedCostLines(items: CostLineValues[]): CostBreakdownLine[] {
  return items.map((item) => {
    const total = Number(item.cost)
    return {
      concept: item.name.trim(),
      quantity: null,
      unit: null,
      unitCost: null,
      totalCost: Number.isFinite(total) && total >= 0 ? total : 0,
    }
  })
}

/** Suma costos de mano de obra / indirectos (UI de formulario). */
export function sumCategoryCosts(items: CostLineValues[]): number {
  return items.reduce((sum, item) => {
    const value = Number(item.cost)
    if (Number.isNaN(value) || value < 0) return sum
    return sum + value
  }, 0)
}

/** Suma costos utilizados de materia prima (UI de formulario). */
export function sumRawMaterialsUsedCosts(
  items: RawMaterialLineValues[]
): number {
  return items.reduce((sum, item) => {
    const usedCost = calculateUsedCost(item)
    if (usedCost == null || !Number.isFinite(usedCost) || usedCost < 0) {
      return sum
    }
    return sum + usedCost
  }, 0)
}

/** Totales y desglose de costo — sin margen, precio ni utilidad. */
export function aggregateCosts(values: CostCalculatorValues): CostAggregation {
  const materialLines = buildMaterialLines(values.rawMaterials)
  const laborLines = buildNamedCostLines(values.laborItems)
  const indirectLines = buildNamedCostLines(values.indirectItems)

  const rawMaterialsTotal = materialLines.reduce(
    (sum, line) => sum + line.totalCost,
    0
  )
  const laborTotal = laborLines.reduce((sum, line) => sum + line.totalCost, 0)
  const indirectTotal = indirectLines.reduce(
    (sum, line) => sum + line.totalCost,
    0
  )
  const totalCost = rawMaterialsTotal + laborTotal + indirectTotal

  return {
    productName: values.productName.trim(),
    quantity: 1,
    rawMaterialsTotal,
    laborTotal,
    indirectTotal,
    totalCost,
    unitCost: totalCost,
    materialLines,
    laborLines,
    indirectLines,
  }
}
