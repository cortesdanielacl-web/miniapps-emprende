/**
 * Configuración comercial centralizada de MiniApps Emprende.
 *
 * Precio / pago / mensajes de licencia.
 * productId enlaza con el sistema de licencias (config/products.ts).
 */

import { PRODUCT_IDS } from "@/config/products"

export const COMMERCIAL = {
  productId: PRODUCT_IDS.COST_CALCULATOR,
  productName: "Calculadora Inteligente de Costos",
  price: 5990,
  compareAtPrice: 14990,
  currency: "CLP",
  paymentLink: "https://www.webpay.cl/form-pay/407579",
  paymentLabel: "Pago único. Sin suscripciones.",
  licenseLabel: "Licencia individual.",
  /** Único retorno postventa (Link de Pago / Webpay Plus). */
  confirmationPath: "/compra/confirmacion",
  licenseTypeLabel: "Individual",
  paymentTypeLabel: "Único",
  trustTitle: "Pago seguro",
  trustDescription:
    "Tu pago se procesa de forma segura mediante Transbank Webpay. Puedes pagar con tarjetas de débito, crédito y prepago compatibles.",
  /** Beneficios del modelo de licencia (no de un cálculo suelto). */
  licenseBenefits: [
    "Obtienes acceso permanente a esta MiniApp.",
    "Calcula todos los productos que necesites.",
    "Genera Informes Profesionales PDF ilimitados.",
    "Pago único.",
    "Sin suscripciones.",
    "Licencia individual.",
  ],
} as const

/**
 * URL de checkout actual (Link de Pago Transbank).
 * Sustituir esta función al integrar Webpay Plus.
 */
export function getCheckoutUrl(): string {
  return COMMERCIAL.paymentLink
}

/** Ruta de confirmación postventa (gracias / activación pendiente). */
export function getConfirmationPath(): string {
  return COMMERCIAL.confirmationPath
}

/** Formato de monto en CLP sin código de moneda (ej. $5.990). */
export function formatCommercialAmount(
  amount: number = COMMERCIAL.price
): string {
  const formatted = new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: 0,
  }).format(amount)

  return `$${formatted}`
}

/** Formato único del precio comercial para la UI (ej. $5.990 CLP). */
export function formatCommercialPrice(
  amount: number = COMMERCIAL.price
): string {
  return `${formatCommercialAmount(amount)} ${COMMERCIAL.currency}`
}
