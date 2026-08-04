/**
 * Datos de empresa y soporte de MiniApps Emprende.
 * Única fuente para contacto en UI (no hardcodear en componentes).
 * Soporte: únicamente correo electrónico.
 */

export const COMPANY = {
  companyName: "MiniApps Emprende",
  website: "https://www.miniappsemprende.cl",
  supportEmail: "soporte@miniappsemprende.cl",
} as const

/** Href mailto para soporte. */
export function getSupportEmailHref(): string {
  return `mailto:${COMPANY.supportEmail}`
}
