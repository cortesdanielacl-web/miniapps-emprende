/**
 * Correo de soporte operativo (notificaciones internas).
 * Única fuente: SUPPORT_EMAIL.
 * Fallback actual: soporteminiapps@gmail.com
 * Producción futura: soporte@miniappsemprende.cl
 */

const DEFAULT_SUPPORT_EMAIL = "soporteminiapps@gmail.com"

/** Destino de notificaciones internas (compras pendientes, etc.). */
export function getSupportEmail(): string {
  const fromEnv = process.env.SUPPORT_EMAIL?.trim()
  return fromEnv || DEFAULT_SUPPORT_EMAIL
}
