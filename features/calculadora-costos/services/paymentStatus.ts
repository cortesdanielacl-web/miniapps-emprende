/** Estados de resultado del flujo de pago Webpay. */
export const PAYMENT_STATUS = {
  SUCCESS: "success",
  REJECTED: "rejected",
  ERROR: "error",
} as const

export type PaymentResultStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

export function isPaymentResultStatus(
  value: string | null
): value is PaymentResultStatus {
  return (
    value === PAYMENT_STATUS.SUCCESS ||
    value === PAYMENT_STATUS.REJECTED ||
    value === PAYMENT_STATUS.ERROR
  )
}
