/**
 * Checkout comercial (licencia de MiniApp).
 *
 * Flujo Webpay Plus:
 * 1) Guardar inputs del formulario (si existen)
 * 2) Crear transacción en /api/webpay/create
 * 3) Enviar token_ws al formulario de Webpay Plus
 * 4) Webpay retorna a /api/webpay/commit
 *
 * El acceso premium solo lo decide premiumAccessService → hasProductAccess.
 */

import { COMMERCIAL } from "@/config/commercial"
import { COMMERCIAL_CHECKOUT_HREF } from "@/config/routes"
import type { CostCalculatorValues } from "@/features/calculadora-costos/schema"
import { sanitizeNext } from "@/lib/navigation/safe-next"

export const PENDING_CHECKOUT_CONTEXT_KEY = "miniapps:pending-checkout-context"

/**
 * Snapshot no privilegiado: solo valores de entrada para retomar el flujo.
 * Jamás incluye precio recomendado, margen, utilidad ni rentabilidad.
 */
export type PendingCheckoutContext = {
  values: CostCalculatorValues
  createdAt: string
}

export function savePendingCheckoutContext(data: {
  values: CostCalculatorValues
}): void {
  if (typeof window === "undefined") return

  const payload: PendingCheckoutContext = {
    values: data.values,
    createdAt: new Date().toISOString(),
  }

  try {
    sessionStorage.setItem(
      PENDING_CHECKOUT_CONTEXT_KEY,
      JSON.stringify(payload)
    )
  } catch {
    // sessionStorage no disponible: no bloquear el flujo de compra.
  }
}

export function getPendingCheckoutContext(): PendingCheckoutContext | null {
  if (typeof window === "undefined") return null

  try {
    const raw = sessionStorage.getItem(PENDING_CHECKOUT_CONTEXT_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as PendingCheckoutContext
    if (!parsed?.values || typeof parsed.values.productName !== "string") {
      return null
    }

    return {
      values: parsed.values,
      createdAt:
        typeof parsed.createdAt === "string"
          ? parsed.createdAt
          : new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function clearPendingCheckoutContext(): void {
  if (typeof window === "undefined") return

  try {
    sessionStorage.removeItem(PENDING_CHECKOUT_CONTEXT_KEY)
  } catch {
    // ignore
  }
}

export type StartReportCheckoutOptions = {
  values: CostCalculatorValues
  /** Destino interno tras login si /api/webpay/create responde 401. */
  loginNext?: string
}

/**
 * Payload mínimo que /api/webpay/create acepta (el monto sale de REPORT_PRICE).
 */
export function getCommercialCheckoutValues(): CostCalculatorValues {
  return {
    productName: COMMERCIAL.productName,
    rawMaterials: [],
    laborItems: [],
    indirectItems: [],
    desiredMargin: "",
  }
}

function redirectToLogin(loginNext?: string): void {
  if (typeof window === "undefined") return
  const next = sanitizeNext(
    loginNext ?? `${window.location.pathname}${window.location.search}`
  )
  window.location.assign(`/login?next=${encodeURIComponent(next)}`)
}

/**
 * Inicia el checkout mediante Webpay Plus.
 */
export async function startReportCheckout(
  options: StartReportCheckoutOptions
): Promise<void> {
  savePendingCheckoutContext({ values: options.values })

  const response = await fetch("/api/webpay/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: options.values,
    }),
  })

  if (!response.ok) {
    if (response.status === 401) {
      redirectToLogin(options.loginNext)
      return
    }

    throw new Error("No fue posible iniciar el pago.")
  }

  const data = (await response.json()) as {
    url?: string
    token?: string
  }

  if (!data.url || !data.token) {
    throw new Error("Webpay no devolvió los datos necesarios para continuar.")
  }

  const form = document.createElement("form")
  form.method = "POST"
  form.action = data.url
  form.style.display = "none"

  const tokenInput = document.createElement("input")
  tokenInput.type = "hidden"
  tokenInput.name = "token_ws"
  tokenInput.value = data.token

  form.appendChild(tokenInput)
  document.body.appendChild(form)

  form.submit()
}

/** Checkout comercial desde landing u otras entradas sin formulario de costos. */
export async function startCommercialCheckout(): Promise<void> {
  await startReportCheckout({
    values: getCommercialCheckoutValues(),
    loginNext: COMMERCIAL_CHECKOUT_HREF,
  })
}
