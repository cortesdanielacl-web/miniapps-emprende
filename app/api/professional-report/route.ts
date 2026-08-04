import { NextResponse } from "next/server"

import { calculateProfessionalReport } from "@/features/calculadora-costos/professional-report.server"
import { costCalculatorSchema } from "@/features/calculadora-costos/schema"
import {
  PremiumAccessDeniedError,
  premiumAccessService,
} from "@/features/licensing/premium-access-service"
import {
  ACCESS_VALIDATION_FAILED_MESSAGE,
  logSecurityError,
} from "@/lib/security-log"
import { isSupabaseConfigured } from "@/lib/supabase/env"

/**
 * POST /api/professional-report
 * Fail closed: auth/licencia/Supabase fallidos → 401/403, nunca 200 con datos.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    logSecurityError(
      "professional-report",
      new Error("supabase_not_configured"),
      "rejecting request"
    )
    return NextResponse.json(
      { error: ACCESS_VALIDATION_FAILED_MESSAGE },
      { status: 403 }
    )
  }

  try {
    await premiumAccessService.requirePremiumAccess()
  } catch (error) {
    if (error instanceof PremiumAccessDeniedError) {
      return NextResponse.json(
        { error: ACCESS_VALIDATION_FAILED_MESSAGE },
        { status: 403 }
      )
    }
    logSecurityError("professional-report", error, "auth failed")
    return NextResponse.json(
      { error: ACCESS_VALIDATION_FAILED_MESSAGE },
      { status: 401 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "No fue posible procesar la solicitud." },
      { status: 400 }
    )
  }

  const valuesRaw =
    typeof body === "object" && body !== null && "values" in body
      ? (body as { values: unknown }).values
      : null

  const parsed = costCalculatorSchema.safeParse(valuesRaw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Los datos del cálculo son inválidos." },
      { status: 400 }
    )
  }

  try {
    const report = calculateProfessionalReport(parsed.data)
    return NextResponse.json({ report })
  } catch (error) {
    logSecurityError("professional-report", error, "calculation failed")
    // Fail closed: no datos parciales.
    return NextResponse.json(
      { error: ACCESS_VALIDATION_FAILED_MESSAGE },
      { status: 403 }
    )
  }
}
