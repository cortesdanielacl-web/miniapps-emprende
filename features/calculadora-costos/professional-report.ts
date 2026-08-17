/**
 * Nivel 2 — ProfessionalReport (premium).
 * Tipo de contrato cliente↔API. El cálculo vive solo en el servidor.
 */

import type { CostBreakdownLine } from "@/features/calculadora-costos/cost-aggregation"
import type { PricingPath } from "@/features/calculadora-costos/schema"

export type ProfessionalReport = {
  productName: string
  quantity: number
  rawMaterialsTotal: number
  laborTotal: number
  indirectTotal: number
  totalCost: number
  unitCost: number
  /** Margen sobre venta (%) — no indica por sí solo el camino elegido. */
  margin: number
  /** Camino con el que el usuario definió el precio. */
  pricingPath: PricingPath
  /** Recargo % ingresado por el usuario. Solo cuando pricingPath === "markup". */
  appliedMarkup: number | null
  netSalePrice: number
  iva: number
  /** Precio de venta recomendado (con IVA). */
  finalSalePrice: number
  /** Utilidad neta. */
  profit: number
  profitPerUnit: number
  /** Rentabilidad sobre costo (%). */
  profitability: number
  recommendations: string
  materialLines: CostBreakdownLine[]
  laborLines: CostBreakdownLine[]
  indirectLines: CostBreakdownLine[]
}

/** @deprecated Usar ProfessionalReport */
export type CostCalculatorResult = ProfessionalReport
