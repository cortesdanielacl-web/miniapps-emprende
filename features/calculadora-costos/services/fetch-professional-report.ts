/**
 * Cliente → API profesional.
 * El cálculo premium nunca ocurre en el navegador.
 */

import type { ProfessionalReport } from "@/features/calculadora-costos/professional-report"
import type { CostCalculatorValues } from "@/features/calculadora-costos/schema"
import { PremiumAccessDeniedError } from "@/features/licensing/premium-access-service"
import { ACCESS_VALIDATION_FAILED_MESSAGE } from "@/lib/security-log"

export async function fetchProfessionalReport(
  values: CostCalculatorValues
): Promise<ProfessionalReport> {
  let response: Response
  try {
    response = await fetch("/api/professional-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ values }),
    })
  } catch {
    // Red / Supabase caído → fail closed (sin datos premium).
    throw new PremiumAccessDeniedError(ACCESS_VALIDATION_FAILED_MESSAGE)
  }

  if (response.status === 401 || response.status === 403) {
    throw new PremiumAccessDeniedError(ACCESS_VALIDATION_FAILED_MESSAGE)
  }

  let payload: { report?: ProfessionalReport; error?: string } | null = null
  try {
    payload = (await response.json()) as {
      report?: ProfessionalReport
      error?: string
    }
  } catch {
    throw new PremiumAccessDeniedError(ACCESS_VALIDATION_FAILED_MESSAGE)
  }

  if (!response.ok || !payload?.report) {
    throw new PremiumAccessDeniedError(ACCESS_VALIDATION_FAILED_MESSAGE)
  }

  return payload.report
}
