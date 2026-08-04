/**
 * Tokens visuales neutros del motor PDF.
 * El color de marca (accent) siempre llega por props / PdfBrand.
 */

export const pdfColors = {
  ink: "#0F2C4C",
  body: "#334155",
  muted: "#64748B",
  subtle: "#94A3B8",
  border: "#E8EEF5",
  soft: "#F8FAFC",
  white: "#FFFFFF",
} as const

export const pdfSpacing = {
  pageX: 48,
  pageTop: 48,
  pageBottom: 56,
} as const

/** Tinte suave a partir del color de marca (para fondos de totales / KPIs). */
export function withAlpha(hexColor: string, alphaHex = "14"): string {
  const hex = hexColor.replace("#", "")
  if (hex.length !== 6) return pdfColors.soft
  return `#${hex}${alphaHex}`
}
