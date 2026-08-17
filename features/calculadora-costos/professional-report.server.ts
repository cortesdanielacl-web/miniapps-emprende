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
import {
  PRICING_PATHS,
  type CostCalculatorValues,
  type PricingPath,
} from "@/features/calculadora-costos/schema"
import {
  formatClp,
  formatPercentOneDecimal,
} from "@/features/calculadora-costos/format-money"

export const IVA_RATE = 0.19

function resolvePricingPath(
  value: CostCalculatorValues["pricingPath"]
): PricingPath {
  if (value && PRICING_PATHS.includes(value)) {
    return value
  }
  return "margin"
}

function resolveAppliedMarkup(
  path: PricingPath,
  raw: string | undefined
): number | null {
  if (path !== "markup") {
    return null
  }
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

function buildRecommendations(
  path: PricingPath,
  finalSalePrice: number,
  netSalePrice: number,
  profit: number,
  margin: number
): string {
  const chargePrice = formatClp(finalSalePrice)
  if (path === "markup") {
    return `Con los costos ingresados y el recargo definido, el precio de venta calculado para tu producto es de ${chargePrice}, IVA incluido.`
  }
  if (path === "sale-price") {
    return `Con un precio de venta de ${formatClp(netSalePrice)}, obtienes una ganancia de ${formatClp(profit)} y un margen de ${formatPercentOneDecimal(margin)}.`
  }
  return `Para alcanzar el margen objetivo definido, el precio de venta calculado para tu producto es de ${chargePrice}, IVA incluido.`
}

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
  const pricingPath = resolvePricingPath(values.pricingPath)
  const appliedMarkup = resolveAppliedMarkup(pricingPath, values.appliedMarkup)

  return {
    productName: agg.productName,
    quantity: agg.quantity,
    rawMaterialsTotal: agg.rawMaterialsTotal,
    laborTotal: agg.laborTotal,
    indirectTotal: agg.indirectTotal,
    totalCost: agg.totalCost,
    unitCost: agg.unitCost,
    margin: safeMargin,
    pricingPath,
    appliedMarkup,
    netSalePrice,
    iva,
    finalSalePrice,
    profit,
    profitPerUnit: profit,
    profitability,
    recommendations: buildRecommendations(
      pricingPath,
      finalSalePrice,
      netSalePrice,
      profit,
      safeMargin
    ),
    materialLines: agg.materialLines,
    laborLines: agg.laborLines,
    indirectLines: agg.indirectLines,
  }
}
