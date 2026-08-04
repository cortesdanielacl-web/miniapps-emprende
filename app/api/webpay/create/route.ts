import { NextResponse } from "next/server"
import { WebpayPlus } from "transbank-sdk"

import { COMMERCIAL } from "@/config/commercial"
import type { CostCalculatorValues } from "@/features/calculadora-costos/schema"
import { getCurrentUser } from "@/features/auth/session.server"
import { pendingPurchaseService } from "@/features/pending-purchases/pending-purchase-service.server"

/**
 * Webpay Plus — Create (SDK oficial Transbank v6).
 * Docs: https://www.transbankdevelopers.cl/documentacion/webpay-plus
 * Ref:  https://www.transbankdevelopers.cl/referencia/webpay
 *
 * Crea la transacción a partir del estado actual de la calculadora
 * (sin persistencia en Supabase).
 * Tras el commit, el retorno postventa es siempre /compra/confirmacion.
 *
 * El checkout comercial activo hoy es Link de Pago (report-checkout).
 * Este endpoint queda para integración Webpay Plus.
 *
 * Patrón recomendado:
 *   WebpayPlus.Transaction.buildForIntegration|buildForProduction(commerceCode, apiKey)
 *   await transaction.create(buyOrder, sessionId, amount, returnUrl)
 *   → response.url, response.token
 */

/** Límites oficiales Transaction.create (referencia Webpay). */
const BUY_ORDER_MAX = 26
const SESSION_ID_MAX = 61
const RETURN_URL_MAX = 256

type CreateBody = {
  values?: unknown
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`)
  }
  return value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * Valida inputs del formulario (nunca resultados premium del cliente).
 * El monto de cobro sale de REPORT_PRICE, no del cálculo.
 */
function parseCheckoutValues(body: CreateBody): CostCalculatorValues | null {
  if (!isRecord(body.values)) {
    return null
  }

  const productName =
    typeof body.values.productName === "string"
      ? body.values.productName.trim()
      : ""

  if (!productName) {
    return null
  }

  if (
    !Array.isArray(body.values.rawMaterials) ||
    !Array.isArray(body.values.laborItems) ||
    !Array.isArray(body.values.indirectItems) ||
    typeof body.values.desiredMargin !== "string"
  ) {
    return null
  }

  return body.values as CostCalculatorValues
}

function createWebpayTransaction() {
  const env = getRequiredEnv("WEBPAY_ENV").toLowerCase()
  const commerceCode = getRequiredEnv("WEBPAY_COMMERCE_CODE")
  const apiKey = getRequiredEnv("WEBPAY_API_KEY")
  const returnUrl = getRequiredEnv("WEBPAY_RETURN_URL")
  // Requerida por configuración del proyecto (flujo de retorno posterior).
  getRequiredEnv("APP_URL")
  const reportPriceRaw = getRequiredEnv("REPORT_PRICE")
  const amount = Number(reportPriceRaw)

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("REPORT_PRICE debe ser un número mayor que cero")
  }

  if (returnUrl.length > RETURN_URL_MAX) {
    throw new Error(
      `WEBPAY_RETURN_URL excede el máximo de ${RETURN_URL_MAX} caracteres`
    )
  }

  if (env !== "integration" && env !== "production") {
    throw new Error('WEBPAY_ENV debe ser "integration" o "production"')
  }

  // Métodos de configuración recomendados por Transbank (no Options legacy).
  const transaction =
    env === "production"
      ? WebpayPlus.Transaction.buildForProduction(commerceCode, apiKey)
      : WebpayPlus.Transaction.buildForIntegration(commerceCode, apiKey)

  return { transaction, returnUrl, amount }
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user?.id || !user.email) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para iniciar el pago." },
      { status: 401 }
    )
  }

  let body: CreateBody

  try {
    body = (await request.json()) as CreateBody
  } catch {
    return NextResponse.json(
      { error: "Cuerpo JSON inválido" },
      { status: 400 }
    )
  }

  const values = parseCheckoutValues(body)

  if (!values) {
    return NextResponse.json(
      { error: "El estado del cálculo es inválido o incompleto" },
      { status: 400 }
    )
  }

  let webpay: ReturnType<typeof createWebpayTransaction>

  try {
    webpay = createWebpayTransaction()
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Configuración Webpay incompleta"
    console.error("[webpay/create] config error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const buyOrder = `ME-${Date.now()}`
  const sessionId = crypto.randomUUID()
  const paymentId = crypto.randomUUID()

  if (buyOrder.length > BUY_ORDER_MAX) {
    console.error("[webpay/create] buyOrder exceeds max length:", buyOrder)
    return NextResponse.json(
      { error: "No se pudo generar una orden de compra válida" },
      { status: 500 }
    )
  }

  if (sessionId.length > SESSION_ID_MAX) {
    return NextResponse.json(
      { error: "No se pudo generar un session_id válido" },
      { status: 500 }
    )
  }

  try {
    await pendingPurchaseService.saveWebpayIntent({
      buyOrder,
      userId: user.id,
      email: user.email,
      customerName: user.name,
      product: COMMERCIAL.productName,
      amount: webpay.amount,
    })
  } catch (error) {
    console.error("[webpay/create] intent persist error:", error)
    return NextResponse.json(
      { error: "No se pudo preparar la compra pendiente." },
      { status: 500 }
    )
  }

  let token: string
  let url: string

  try {
    const response = await webpay.transaction.create(
      buyOrder,
      sessionId,
      webpay.amount,
      webpay.returnUrl
    )

    token = response.token
    url = response.url

    if (typeof token !== "string" || typeof url !== "string" || !token || !url) {
      throw new Error("Webpay no retornó url o token")
    }
  } catch (error) {
    console.error("[webpay/create] Webpay create error:", error)
    return NextResponse.json(
      { error: "No se pudo crear la transacción en Webpay" },
      { status: 502 }
    )
  }

  return NextResponse.json({
    url,
    token,
    buyOrder,
    paymentId,
    sessionId,
    productName: values.productName.trim(),
  })
}
