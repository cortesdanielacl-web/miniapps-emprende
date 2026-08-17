/** Formato moneda chilena sin decimales. Ej: $12.500. Nunca muestra NaN. */
export function formatClp(value: number): string {
  if (!Number.isFinite(value)) {
    return "—"
  }

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(value))
}

export function formatMarginPercent(margin: number): string {
  return `${margin}%`
}

/** Porcentaje de presentación (es-CL, 1 decimal). No altera el valor interno. */
export function formatPercentOneDecimal(value: number): string {
  if (!Number.isFinite(value)) {
    return "—"
  }

  return `${new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}%`
}

/** Formato de cantidad para informe (máx. 3 decimales útiles). */
export function formatQuantity(value: number | null): string {
  if (value == null || !Number.isFinite(value)) {
    return "—"
  }

  return new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: 3,
  }).format(value)
}
