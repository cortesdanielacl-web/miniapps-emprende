/**
 * Checkout comercial (licencia de MiniApp).
 *
 * Flujo único:
 * 1) Guardar inputs del formulario (no resultados premium)
 * 2) Abrir Link de Pago Transbank
 * 3) Postventa → /compra/confirmacion (getConfirmationPath)
 *
 * El acceso premium solo lo decide premiumAccessService → hasProductAccess.
 */

import type { CostCalculatorValues } from "@/features/calculadora-costos/schema"
import { getCheckoutUrl } from "@/config/commercial"

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
}

/**
 * Inicia el checkout comercial (Link de Pago).
 * Postventa única: /compra/confirmacion (configurar retorno en Transbank).
 */
export async function startReportCheckout(
  options: StartReportCheckoutOptions
): Promise<void> {
  savePendingCheckoutContext({ values: options.values })

  const checkoutUrl = getCheckoutUrl()
  window.open(checkoutUrl, "_blank", "noopener,noreferrer")
}
