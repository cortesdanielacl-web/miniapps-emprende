/**
 * Resultado de la operación Webpay recién procesada en /api/webpay/commit.
 * Solo presentación. No autoriza ni persiste compras.
 */

export const WEBPAY_RESULT_COOKIE = "me_webpay_result"
export const WEBPAY_RESULT_MAX_AGE_SEC = 30 * 60

export const WEBPAY_OPERATION_OUTCOMES = [
  "approved",
  "declined",
  "cancelled",
  "error_before_authorization",
  "authorized_persistence_error",
] as const

export type WebpayOperationOutcome = (typeof WEBPAY_OPERATION_OUTCOMES)[number]

export type WebpayConfirmationState = WebpayOperationOutcome | "none"

export type WebpayOperationResult = {
  outcome: WebpayOperationOutcome
  buyOrder?: string
  iat: number
}

export function isWebpayOperationOutcome(
  value: string
): value is WebpayOperationOutcome {
  return (WEBPAY_OPERATION_OUTCOMES as readonly string[]).includes(value)
}
