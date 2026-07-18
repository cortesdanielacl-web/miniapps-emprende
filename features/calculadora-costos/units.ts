export const UNITS = ["g", "kg", "ml", "l", "unidad"] as const

export type Unit = (typeof UNITS)[number]

export type UnitFamily = "mass" | "volume" | "count"

export function getUnitFamily(unit: Unit): UnitFamily {
  if (unit === "g" || unit === "kg") return "mass"
  if (unit === "ml" || unit === "l") return "volume"
  return "count"
}

export function areUnitsCompatible(a: Unit, b: Unit): boolean {
  return getUnitFamily(a) === getUnitFamily(b)
}

/** Convierte a unidad base: g, ml o unidad. */
export function toBaseUnit(quantity: number, unit: Unit): number {
  switch (unit) {
    case "kg":
      return quantity * 1000
    case "l":
      return quantity * 1000
    case "g":
    case "ml":
    case "unidad":
      return quantity
  }
}

export type UsedCostInput = {
  purchasePrice: string
  purchaseQuantity: string
  purchaseUnit: Unit
  usedQuantity: string
  usedUnit: Unit
}

/**
 * Costo utilizado = Precio de compra × (Cantidad utilizada / Cantidad comprada)
 * con conversión a la misma unidad base cuando corresponde.
 */
export function calculateUsedCost(line: UsedCostInput): number | null {
  if (!areUnitsCompatible(line.purchaseUnit, line.usedUnit)) {
    return null
  }

  const purchasePrice = Number(line.purchasePrice)
  const purchaseQuantity = Number(line.purchaseQuantity)
  const usedQuantity = Number(line.usedQuantity)

  if (
    Number.isNaN(purchasePrice) ||
    Number.isNaN(purchaseQuantity) ||
    Number.isNaN(usedQuantity) ||
    purchasePrice < 0 ||
    purchaseQuantity <= 0 ||
    usedQuantity < 0
  ) {
    return null
  }

  const purchasedBase = toBaseUnit(purchaseQuantity, line.purchaseUnit)
  const usedBase = toBaseUnit(usedQuantity, line.usedUnit)
  const usedCost = purchasePrice * (usedBase / purchasedBase)

  if (!Number.isFinite(usedCost)) {
    return null
  }

  return usedCost
}
