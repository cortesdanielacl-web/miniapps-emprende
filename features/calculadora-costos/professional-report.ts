/**
 * Nivel 2 — ProfessionalReport (premium).
 * Tipo de contrato cliente↔API. El cálculo vive solo en el servidor.
 */

import type { CostBreakdownLine } from "@/features/calculadora-costos/cost-aggregation"

export type ProfessionalReport = {
  productName: string
  quantity: number
  rawMaterialsTotal: number
  laborTotal: number
  indirectTotal: number
  totalCost: number
  unitCost: number
  /** Margen objetivo (%) ingresado / aplicado. */
  margin: number
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
