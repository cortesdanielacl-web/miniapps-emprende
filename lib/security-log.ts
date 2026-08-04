/**
 * Logs de seguridad / auth — solo servidor o consola controlada.
 * No exponer detalles internos al usuario final.
 */

export const ACCESS_VALIDATION_FAILED_MESSAGE =
  "No fue posible validar tu acceso. Inténtalo nuevamente."

export function logSecurityError(
  scope: string,
  error: unknown,
  detail?: string
): void {
  const message =
    error instanceof Error ? error.message : String(error ?? "unknown")
  if (detail) {
    console.error(`[security:${scope}] ${detail} — ${message}`)
    return
  }
  console.error(`[security:${scope}] ${message}`)
}
