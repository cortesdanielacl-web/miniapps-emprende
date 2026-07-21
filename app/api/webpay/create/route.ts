import { NextResponse } from "next/server"
import { WebpayPlus } from "transbank-sdk"

import type { CostCalculatorResult } from "@/features/calculadora-costos/calculate"
import type { CostCalculatorValues } from "@/features/calculadora-costos/schema"

/**
 * Webpay Plus — Create (SDK oficial Transbank v6).
 * Docs: https://www.transbankdevelopers.cl/documentacion/webpay-plus
 * Ref:  https://www.transbankdevelopers.cl/referencia/webpay
 *
 * Crea la transacción a partir del estado actual de la calculadora
 * (sin persistencia en Supabase).
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
  result?: unknown
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

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

/**
 * Valida que el body traiga el snapshot del cálculo listo para pagar.
 * No recalcula: solo exige la forma mínima del estado actual de la UI.
 */
function parseCalculatorSnapshot(body: CreateBody): {
  values: CostCalculatorValues
  result: CostCalculatorResult
} | null {
  if (!isRecord(body.values) || !isRecord(body.result)) {
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

  const result = body.result
  if (
    typeof result.productName !== "string" ||
    !result.productName.trim() ||
    !isFiniteNumber(result.rawMaterialsTotal) ||
    !isFiniteNumber(result.laborTotal) ||
    !isFiniteNumber(result.indirectTotal) ||
    !isFiniteNumber(result.totalCost) ||
    !isFiniteNumber(result.margin) ||
    !isFiniteNumber(result.netSalePrice) ||
    !isFiniteNumber(result.iva) ||
    !isFiniteNumber(result.finalSalePrice)
  ) {
    return null
  }

  return {
    values: body.values as CostCalculatorValues,
    result: result as CostCalculatorResult,
  }
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
  let body: CreateBody

  try {
    body = (await request.json()) as CreateBody
  } catch {
    return NextResponse.json(
      { error: "Cuerpo JSON inválido" },
      { status: 400 }
    )
  }

  const snapshot = parseCalculatorSnapshot(body)

  if (!snapshot) {
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

  // El snapshot viaja de vuelta al cliente para persistirlo en sessionStorage
  // antes del redirect (sin base de datos en este flujo).
  return NextResponse.json({
    url,
    token,
    buyOrder,
    paymentId,
    sessionId,
    productName: snapshot.result.productName,
  })
}
