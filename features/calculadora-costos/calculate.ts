/**
 * API pública de cálculo (cliente-segura).
 * CostPreview: sí. ProfessionalReport: solo vía /api/professional-report.
 */

export type { CostBreakdownLine } from "@/features/calculadora-costos/cost-aggregation"
export {
  sumCategoryCosts,
  sumRawMaterialsUsedCosts,
} from "@/features/calculadora-costos/cost-aggregation"
export {
  calculateCostPreview,
  type CostPreview,
} from "@/features/calculadora-costos/cost-preview"
export type {
  ProfessionalReport,
  CostCalculatorResult,
} from "@/features/calculadora-costos/professional-report"
export {
  formatClp,
  formatMarginPercent,
  formatQuantity,
} from "@/features/calculadora-costos/format-money"

/** @deprecated El IVA premium se calcula solo en el servidor. */
export const IVA_RATE = 0.19
