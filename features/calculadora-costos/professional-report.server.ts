/**
 * Cálculo de ProfessionalReport — SOLO SERVIDOR.
 * Nunca importar desde Client Components.
 */

import "server-only"

import { aggregateCosts } from "@/features/calculadora-costos/cost-aggregation"
import type { ProfessionalReport } from "@/features/calculadora-costos/professional-report"
import {
  netSalePriceFromMargin,
  profitFromNetPrice,
} from "@/features/calculadora-costos/pricing"
import type { CostCalculatorValues } from "@/features/calculadora-costos/schema"
import { formatClp } from "@/features/calculadora-costos/format-money"

export const IVA_RATE = 0.19

/**
 * Genera el informe profesional completo.
 * Invocar únicamente tras premiumAccessService.requirePremiumAccess().
 */
export function calculateProfessionalReport(
  values: CostCalculatorValues
): ProfessionalReport {
  const agg = aggregateCosts(values)
  const margin = Number(values.desiredMargin)
  const safeMargin = Number.isFinite(margin) ? margin : 0

  const netSalePrice =
    netSalePriceFromMargin(agg.totalCost, safeMargin) ?? agg.totalCost
  const iva = netSalePrice * IVA_RATE
  const finalSalePrice = netSalePrice + iva
  const profit = profitFromNetPrice(agg.totalCost, netSalePrice)
  const profitability =
    agg.totalCost > 0 ? (profit / agg.totalCost) * 100 : 0

  return {
    productName: agg.productName,
    quantity: agg.quantity,
    rawMaterialsTotal: agg.rawMaterialsTotal,
    laborTotal: agg.laborTotal,
    indirectTotal: agg.indirectTotal,
    totalCost: agg.totalCost,
    unitCost: agg.unitCost,
    margin: safeMargin,
    netSalePrice,
    iva,
    finalSalePrice,
    profit,
    profitPerUnit: profit,
    profitability,
    recommendations: `Con los costos ingresados, se recomienda vender este producto desde ${formatClp(finalSalePrice)} para mantener el margen objetivo definido durante el cálculo.`,
    materialLines: agg.materialLines,
    laborLines: agg.laborLines,
    indirectLines: agg.indirectLines,
  }
}
