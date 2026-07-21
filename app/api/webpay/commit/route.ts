import { NextResponse } from "next/server"
import { WebpayPlus } from "transbank-sdk"

import {
  PAYMENT_STATUS,
  type PaymentResultStatus,
} from "@/features/calculadora-costos/services/paymentStatus"

/**
 * Webpay Plus — Commit (SDK oficial Transbank v6).
 * Docs: https://www.transbankdevelopers.cl/documentacion/webpay-plus
 *
 * Valida el pago con Transbank y redirige a `/resultado-pago`.
 * No renderiza UI ni lee sessionStorage (responsabilidad del cliente).
 */

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`)
  }
  return value
}

function getExpectedAmount(): number {
  const reportPriceRaw = getRequiredEnv("REPORT_PRICE")
  const amount = Number(reportPriceRaw)

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("REPORT_PRICE debe ser un número mayor que cero")
  }

  return amount
}

function createWebpayTransaction() {
  const env = getRequiredEnv("WEBPAY_ENV").toLowerCase()
  const commerceCode = getRequiredEnv("WEBPAY_COMMERCE_CODE")
  const apiKey = getRequiredEnv("WEBPAY_API_KEY")

  if (env !== "integration" && env !== "production") {
    throw new Error('WEBPAY_ENV debe ser "integration" o "production"')
  }

  return env === "production"
    ? WebpayPlus.Transaction.buildForProduction(commerceCode, apiKey)
    : WebpayPlus.Transaction.buildForIntegration(commerceCode, apiKey)
}

function redirectToResultadoPago(status: PaymentResultStatus) {
  const appUrl = getRequiredEnv("APP_URL").replace(/\/$/, "")
  const destination = new URL("/resultado-pago", `${appUrl}/`)
  destination.searchParams.set("status", status)
  return NextResponse.redirect(destination, 303)
}

/** Redirige al resultado; si falta APP_URL, responde JSON controlado. */
function safeRedirect(status: PaymentResultStatus) {
  try {
    return redirectToResultadoPago(status)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Configuración incompleta"
    console.error("[webpay/commit] config error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function isApprovedCommit(
  commitResponse: {
    status?: string
    response_code?: number | string
    amount?: number | string
  },
  expectedAmount: number
): boolean {
  const responseCode = Number(commitResponse.response_code)
  const paidAmount = Number(commitResponse.amount)

  return (
    commitResponse.status === "AUTHORIZED" &&
    responseCode === 0 &&
    Number.isFinite(paidAmount) &&
    paidAmount === expectedAmount
  )
}

async function readReturnParams(request: Request): Promise<{
  tokenWs: string | null
}> {
  const url = new URL(request.url)
  let tokenWs = url.searchParams.get("token_ws")

  if (request.method === "POST") {
    try {
      const formData = await request.formData()
      const formToken = formData.get("token_ws")

      if (typeof formToken === "string" && formToken) {
        tokenWs = formToken
      }
    } catch {
      // Body no form-urlencoded: se usan solo query params.
    }
  }

  return {
    tokenWs: tokenWs?.trim() || null,
  }
}

async function handleCommit(request: Request) {
  let params: Awaited<ReturnType<typeof readReturnParams>>

  try {
    params = await readReturnParams(request)
  } catch (error) {
    console.error("[webpay/commit] params error:", error)
    return safeRedirect(PAYMENT_STATUS.ERROR)
  }

  // Cancelación en Webpay (TBK_TOKEN) o retorno sin token_ws.
  if (!params.tokenWs) {
    return safeRedirect(PAYMENT_STATUS.REJECTED)
  }

  let transaction: ReturnType<typeof createWebpayTransaction>
  let expectedAmount: number

  try {
    // APP_URL se valida aquí para fallar controlado antes del commit.
    getRequiredEnv("APP_URL")
    getRequiredEnv("WEBPAY_RETURN_URL")
    expectedAmount = getExpectedAmount()
    transaction = createWebpayTransaction()
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Configuración Webpay incompleta"
    console.error("[webpay/commit] config error:", message)
    return safeRedirect(PAYMENT_STATUS.ERROR)
  }

  try {
    const commitResponse = await transaction.commit(params.tokenWs)
    const approved = isApprovedCommit(commitResponse, expectedAmount)

    return safeRedirect(
      approved ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.REJECTED
    )
  } catch (error) {
    console.error("[webpay/commit] Webpay commit error:", error)
    return safeRedirect(PAYMENT_STATUS.ERROR)
  }
}

export async function GET(request: Request) {
  return handleCommit(request)
}

export async function POST(request: Request) {
  return handleCommit(request)
}
