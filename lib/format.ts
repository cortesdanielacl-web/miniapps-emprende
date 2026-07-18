/**
 * Generic utility helpers — keep pure and side-effect free.
 */

export function formatCurrency(
  value: number,
  locale = "es-DO",
  currency = "DOP"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value: number, locale = "es-DO"): string {
  return new Intl.NumberFormat(locale).format(value)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
