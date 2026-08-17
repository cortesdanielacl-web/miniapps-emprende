/**
 * Precio, recargo y margen a partir del costo total ya calculado.
 *
 * Ganancia = precio neto − costo total
 * IVA (solo informe) = precio neto × 19%
 *
 * Recargo sobre costo:
 *   precio = costo × (1 + recargo/100)
 *   recargo % = ganancia / costo × 100
 *
 * Margen sobre venta:
 *   precio = costo / (1 − margen/100)
 *   margen % = ganancia / precio × 100
 */

export type PricingFromMarkup = {
  totalCost: number
  desiredMarkup: number
  suggestedNetPrice: number
  profit: number
  saleMargin: number
}

export type PricingFromMargin = {
  totalCost: number
  desiredMargin: number
  suggestedNetPrice: number
  profit: number
  costMarkup: number
}

export type PricingFromSalePrice = {
  totalCost: number
  salePrice: number
  profit: number
  obtainedMargin: number
  obtainedMarkup: number
}

export function profitFromNetPrice(totalCost: number, netPrice: number): number {
  return netPrice - totalCost
}

/** Precio neto a partir del recargo sobre el costo. */
export function netSalePriceFromMarkup(
  totalCost: number,
  markupPercent: number
): number | null {
  if (!Number.isFinite(totalCost) || !Number.isFinite(markupPercent)) {
    return null
  }
  if (totalCost < 0) {
    return null
  }

  const suggestedNetPrice = totalCost * (1 + markupPercent / 100)
  if (!Number.isFinite(suggestedNetPrice) || suggestedNetPrice < 0) {
    return null
  }

  return suggestedNetPrice
}

/** Precio neto a partir del margen sobre el precio de venta. */
export function netSalePriceFromMargin(
  totalCost: number,
  marginPercent: number
): number | null {
  if (!Number.isFinite(totalCost) || !Number.isFinite(marginPercent)) {
    return null
  }
  if (totalCost < 0 || marginPercent >= 100) {
    return null
  }

  const suggestedNetPrice = totalCost / (1 - marginPercent / 100)
  if (!Number.isFinite(suggestedNetPrice) || suggestedNetPrice < 0) {
    return null
  }

  return suggestedNetPrice
}

/** Recargo obtenido (%) sobre el costo. */
export function markupPercentFromNetPrice(
  totalCost: number,
  netPrice: number
): number | null {
  if (!Number.isFinite(totalCost) || !Number.isFinite(netPrice)) {
    return null
  }
  if (totalCost <= 0) {
    return null
  }

  const obtainedMarkup =
    (profitFromNetPrice(totalCost, netPrice) / totalCost) * 100
  if (!Number.isFinite(obtainedMarkup)) {
    return null
  }

  return obtainedMarkup
}

/** Margen obtenido (%) sobre el precio de venta. */
export function marginPercentFromNetPrice(
  totalCost: number,
  netPrice: number
): number | null {
  if (!Number.isFinite(totalCost) || !Number.isFinite(netPrice)) {
    return null
  }
  if (netPrice <= 0) {
    return null
  }

  const obtainedMargin =
    (profitFromNetPrice(totalCost, netPrice) / netPrice) * 100
  if (!Number.isFinite(obtainedMargin) || obtainedMargin >= 100) {
    return null
  }

  return obtainedMargin
}

export function calculatePricingFromMarkup(
  totalCost: number,
  markupPercent: number
): PricingFromMarkup | null {
  const suggestedNetPrice = netSalePriceFromMarkup(totalCost, markupPercent)
  if (suggestedNetPrice == null) {
    return null
  }

  const saleMargin = marginPercentFromNetPrice(totalCost, suggestedNetPrice)
  if (saleMargin == null) {
    return null
  }

  return {
    totalCost,
    desiredMarkup: markupPercent,
    suggestedNetPrice,
    profit: profitFromNetPrice(totalCost, suggestedNetPrice),
    saleMargin,
  }
}

export function calculatePricingFromMargin(
  totalCost: number,
  marginPercent: number
): PricingFromMargin | null {
  const suggestedNetPrice = netSalePriceFromMargin(totalCost, marginPercent)
  if (suggestedNetPrice == null) {
    return null
  }

  const costMarkup = markupPercentFromNetPrice(totalCost, suggestedNetPrice)
  if (costMarkup == null) {
    return null
  }

  return {
    totalCost,
    desiredMargin: marginPercent,
    suggestedNetPrice,
    profit: profitFromNetPrice(totalCost, suggestedNetPrice),
    costMarkup,
  }
}

export function calculatePricingFromSalePrice(
  totalCost: number,
  salePrice: number
): PricingFromSalePrice | null {
  const obtainedMargin = marginPercentFromNetPrice(totalCost, salePrice)
  const obtainedMarkup = markupPercentFromNetPrice(totalCost, salePrice)
  if (obtainedMargin == null || obtainedMarkup == null) {
    return null
  }

  return {
    totalCost,
    salePrice,
    profit: profitFromNetPrice(totalCost, salePrice),
    obtainedMargin,
    obtainedMarkup,
  }
}

/** Porcentaje para UI (es-CL): 37,5% · 122,22% · 150%. */
export function formatPricingPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return "—"
  }

  const rounded = Math.round(value * 100) / 100
  return `${new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(rounded)}%`
}
