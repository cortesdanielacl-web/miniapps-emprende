import type { CostCalculatorResult } from "@/features/calculadora-costos/calculate"
import type { CostCalculatorValues } from "@/features/calculadora-costos/schema"

/** Clave de sessionStorage para recuperar el cálculo tras el retorno de Webpay. */
export const PENDING_REPORT_STORAGE_KEY = "miniapps:pending-professional-report"

export type PendingProfessionalReport = {
  values: CostCalculatorValues
  result: CostCalculatorResult
  buyOrder: string
  paymentId: string
  sessionId: string
  token: string
  createdAt: string
}

type CreateWebpayResponse = {
  url: string
  token: string
  buyOrder: string
  paymentId: string
  sessionId: string
  productName: string
}

function redirectToWebpay(url: string, token: string) {
  const form = document.createElement("form")
  form.method = "POST"
  form.action = url
  form.acceptCharset = "UTF-8"
  form.style.display = "none"

  const input = document.createElement("input")
  input.type = "hidden"
  input.name = "token_ws"
  input.value = token
  form.appendChild(input)

  document.body.appendChild(form)
  form.submit()
}

/**
 * Crea la transacción Webpay con el estado actual de la calculadora,
 * guarda el snapshot en sessionStorage y redirige al formulario de pago.
 */
export async function createWebpayPayment(data: {
  values: CostCalculatorValues
  result: CostCalculatorResult
}): Promise<void> {
  const response = await fetch("/api/webpay/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  let payload: (Partial<CreateWebpayResponse> & { error?: string }) | null =
    null

  try {
    payload = (await response.json()) as Partial<CreateWebpayResponse> & {
      error?: string
    }
  } catch {
    throw new Error("Respuesta inválida del servidor de pagos")
  }

  if (!response.ok) {
    throw new Error(payload?.error || "No se pudo iniciar el pago")
  }

  const { url, token, buyOrder, paymentId, sessionId } = payload ?? {}

  if (
    typeof url !== "string" ||
    typeof token !== "string" ||
    typeof buyOrder !== "string" ||
    typeof paymentId !== "string" ||
    typeof sessionId !== "string" ||
    !url ||
    !token
  ) {
    throw new Error("Webpay no retornó los datos necesarios para pagar")
  }

  const pending: PendingProfessionalReport = {
    values: data.values,
    result: data.result,
    buyOrder,
    paymentId,
    sessionId,
    token,
    createdAt: new Date().toISOString(),
  }

  sessionStorage.setItem(PENDING_REPORT_STORAGE_KEY, JSON.stringify(pending))
  redirectToWebpay(url, token)
}

/**
 * Recupera el snapshot guardado antes de ir a Webpay.
 * Devuelve null si no existe o está corrupto.
 */
export function getPendingProfessionalReport(): PendingProfessionalReport | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const raw = sessionStorage.getItem(PENDING_REPORT_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as PendingProfessionalReport

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.result ||
      !parsed.values ||
      typeof parsed.result.productName !== "string"
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

/** Elimina el snapshot pendiente tras mostrar el Informe Profesional. */
export function clearPendingProfessionalReport(): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    sessionStorage.removeItem(PENDING_REPORT_STORAGE_KEY)
  } catch {
    // sessionStorage no disponible: no bloquear la UI.
  }
}

/**
 * Cache en memoria del informe mostrado en esta carga de página.
 * Evita que React Strict Mode (doble mount) pierda el snapshot tras limpiarlo,
 * y se reinicia en un refresh real (F5).
 */
let displayedReportForPageLoad: PendingProfessionalReport | null | undefined

/**
 * Toma el snapshot pendiente para mostrarlo una sola vez.
 * Limpia sessionStorage al recuperar datos válidos.
 */
export function takePendingProfessionalReportForDisplay(): PendingProfessionalReport | null {
  if (typeof window === "undefined") {
    return null
  }

  if (displayedReportForPageLoad !== undefined) {
    return displayedReportForPageLoad
  }

  const snapshot = getPendingProfessionalReport()
  if (snapshot) {
    clearPendingProfessionalReport()
  }

  displayedReportForPageLoad = snapshot
  return snapshot
}
