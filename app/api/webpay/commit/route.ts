import { NextResponse } from "next/server"
import { WebpayPlus } from "transbank-sdk"

import { getConfirmationPath } from "@/config/commercial"
import { applyWebpayResultCookie } from "@/features/compra/webpay-operation-result.server"
import type { WebpayOperationOutcome } from "@/features/compra/webpay-operation-result"
import { pendingPurchaseService } from "@/features/pending-purchases/pending-purchase-service.server"

/**
 * Webpay Plus — Commit (SDK oficial Transbank v6).
 *
 * Pago aprobado → registra pending_purchases (NO activa licencia)
 * y notifica a SUPPORT_EMAIL. Luego redirige a /compra/confirmacion.
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

function redirectToConfirmation(
  outcome: WebpayOperationOutcome,
  buyOrder?: string
) {
  const appUrl = getRequiredEnv("APP_URL").replace(/\/$/, "")
  const destination = new URL(getConfirmationPath(), `${appUrl}/`)
  destination.searchParams.set("status", outcome)
  const response = NextResponse.redirect(destination, 303)
  applyWebpayResultCookie(response, { outcome, buyOrder })
  return response
}

function safeRedirectToConfirmation(
  outcome: WebpayOperationOutcome,
  buyOrder?: string
) {
  try {
    return redirectToConfirmation(outcome, buyOrder)
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

function readFormString(
  formData: FormData,
  name: string
): string | null {
  const value = formData.get(name)
  return typeof value === "string" && value.trim() ? value.trim() : null
}

async function readReturnParams(request: Request): Promise<{
  tokenWs: string | null
  tbkToken: string | null
  tbkBuyOrder: string | null
}> {
  const url = new URL(request.url)
  let tokenWs = url.searchParams.get("token_ws")
  let tbkToken = url.searchParams.get("TBK_TOKEN")
  let tbkBuyOrder = url.searchParams.get("TBK_ORDEN_COMPRA")

  if (request.method === "POST") {
    try {
      const formData = await request.formData()
      tokenWs = readFormString(formData, "token_ws") ?? tokenWs
      tbkToken = readFormString(formData, "TBK_TOKEN") ?? tbkToken
      tbkBuyOrder =
        readFormString(formData, "TBK_ORDEN_COMPRA") ?? tbkBuyOrder
    } catch {
      // Body no form-urlencoded: se usan solo query params.
    }
  }

  return {
    tokenWs: tokenWs?.trim() || null,
    tbkToken: tbkToken?.trim() || null,
    tbkBuyOrder: tbkBuyOrder?.trim() || null,
  }
}

async function handleCommit(request: Request) {
  let params: Awaited<ReturnType<typeof readReturnParams>>

  try {
    params = await readReturnParams(request)
  } catch (error) {
    console.error("[webpay/commit] params error:", error)
    return safeRedirectToConfirmation("error_before_authorization")
  }

  if (!params.tokenWs) {
    if (params.tbkToken || params.tbkBuyOrder) {
      return safeRedirectToConfirmation("cancelled", params.tbkBuyOrder ?? undefined)
    }
    return safeRedirectToConfirmation("error_before_authorization")
  }

  let transaction: ReturnType<typeof createWebpayTransaction>
  let expectedAmount: number

  try {
    getRequiredEnv("APP_URL")
    getRequiredEnv("WEBPAY_RETURN_URL")
    expectedAmount = getExpectedAmount()
    transaction = createWebpayTransaction()
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Configuración Webpay incompleta"
    console.error("[webpay/commit] config error:", message)
    return safeRedirectToConfirmation("error_before_authorization")
  }

  try {
    const commitResponse = await transaction.commit(params.tokenWs)
    const approved = isApprovedCommit(commitResponse, expectedAmount)
    const buyOrder =
      typeof commitResponse.buy_order === "string"
        ? commitResponse.buy_order
        : ""

    if (approved) {
      if (!buyOrder) {
        console.error("[webpay/commit] approved but missing buy_order")
        return safeRedirectToConfirmation("authorized_persistence_error")
      }

      const amount = Number(commitResponse.amount)
      const purchase = await pendingPurchaseService.registerApprovedWebpayPayment({
        buyOrder,
        transactionToken: params.tokenWs,
        amount: Number.isFinite(amount) ? amount : expectedAmount,
        paymentDate:
          typeof commitResponse.transaction_date === "string"
            ? commitResponse.transaction_date
            : undefined,
      })

      if (!purchase) {
        console.error("[webpay/commit] authorized but persistence failed", {
          buyOrder,
        })
        return safeRedirectToConfirmation(
          "authorized_persistence_error",
          buyOrder
        )
      }

      return safeRedirectToConfirmation("approved", buyOrder)
    }

    console.error("[webpay/commit] payment not authorized", {
      status: commitResponse.status,
      response_code: commitResponse.response_code,
    })
    return safeRedirectToConfirmation("declined", buyOrder || undefined)
  } catch (error) {
    console.error("[webpay/commit] Webpay commit error:", error)
    return safeRedirectToConfirmation("error_before_authorization")
  }
}

export async function GET(request: Request) {
  return handleCommit(request)
}

export async function POST(request: Request) {
  return handleCommit(request)
}
