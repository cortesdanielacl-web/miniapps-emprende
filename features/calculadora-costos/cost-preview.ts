/**
 * Nivel 1 — CostPreview (público).
 * Calculable en el cliente. Nunca incluye campos premium.
 */

import { aggregateCosts } from "@/features/calculadora-costos/cost-aggregation"
import type { CostCalculatorValues } from "@/features/calculadora-costos/schema"

/** Únicos campos públicos permitidos sin licencia. */
export type CostPreview = {
  productName: string
  quantity: number
  totalCost: number
  unitCost: number
}

/**
 * Calcula únicamente la vista previa pública.
 * No calcula ni expone precio, margen, utilidad ni rentabilidad.
 */
export function calculateCostPreview(
  values: CostCalculatorValues
): CostPreview {
  const agg = aggregateCosts(values)
  return {
    productName: agg.productName,
    quantity: agg.quantity,
    totalCost: agg.totalCost,
    unitCost: agg.unitCost,
  }
}
