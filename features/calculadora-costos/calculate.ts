import type {
  CostCalculatorValues,
  CostLineValues,
  RawMaterialLineValues,
} from "@/features/calculadora-costos/schema"
import { calculateUsedCost } from "@/features/calculadora-costos/units"

export const IVA_RATE = 0.19

export type CostCalculatorResult = {
  productName: string
  rawMaterialsTotal: number
  laborTotal: number
  indirectTotal: number
  totalCost: number
  margin: number
  netSalePrice: number
  iva: number
  finalSalePrice: number
}

/** Suma los costos de mano de obra / indirectos. */
export function sumCategoryCosts(items: CostLineValues[]): number {
  return items.reduce((sum, item) => {
    const value = Number(item.cost)
    if (Number.isNaN(value) || value < 0) return sum
    return sum + value
  }, 0)
}

/** Suma los costos utilizados de materia prima. */
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

/**
 * Costo Total = Total Materiales e Insumos + Total Mano de Obra + Total Costos Indirectos
 * Precio Venta Neto = Costo Total × (1 + Margen / 100)
 * IVA = Precio Venta Neto × 19%
 * Precio Venta Final = Precio Venta Neto + IVA
 */
export function calculateCost(
  values: CostCalculatorValues
): CostCalculatorResult {
  const rawMaterialsTotal = sumRawMaterialsUsedCosts(values.rawMaterials)
  const laborTotal = sumCategoryCosts(values.laborItems)
  const indirectTotal = sumCategoryCosts(values.indirectItems)
  const margin = Number(values.desiredMargin)

  const totalCost = rawMaterialsTotal + laborTotal + indirectTotal
  const netSalePrice = totalCost * (1 + margin / 100)
  const iva = netSalePrice * IVA_RATE
  const finalSalePrice = netSalePrice + iva

  return {
    productName: values.productName.trim(),
    rawMaterialsTotal,
    laborTotal,
    indirectTotal,
    totalCost,
    margin,
    netSalePrice,
    iva,
    finalSalePrice,
  }
}

/** Formato moneda chilena sin decimales. Ej: $12.500. Nunca muestra NaN. */
export function formatClp(value: number): string {
  if (!Number.isFinite(value)) {
    return "—"
  }

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(value))
}

export function formatMarginPercent(margin: number): string {
  return `${margin}%`
}
