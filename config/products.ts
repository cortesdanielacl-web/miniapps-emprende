/**
 * Catálogo de productos MiniApps Emprende.
 * Cada MiniApp tiene un productId estable usado por el sistema de licencias.
 */

export const PRODUCT_IDS = {
  COST_CALCULATOR: "cost-calculator",
  FUTURE_CASHFLOW: "future-cashflow",
  FUTURE_BREAK_EVEN: "future-break-even",
} as const

export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS]

export type ProductDefinition = {
  id: ProductId
  name: string
  description: string
  /** Activo para venta pública */
  active: boolean
}

export const PRODUCTS: Record<ProductId, ProductDefinition> = {
  [PRODUCT_IDS.COST_CALCULATOR]: {
    id: PRODUCT_IDS.COST_CALCULATOR,
    name: "Calculadora Inteligente de Costos",
    description:
      "Calcula el costo real de tus productos y genera Informes Profesionales PDF ilimitados.",
    active: true,
  },
  [PRODUCT_IDS.FUTURE_CASHFLOW]: {
    id: PRODUCT_IDS.FUTURE_CASHFLOW,
    name: "Flujo de Caja",
    description: "Próximamente.",
    active: false,
  },
  [PRODUCT_IDS.FUTURE_BREAK_EVEN]: {
    id: PRODUCT_IDS.FUTURE_BREAK_EVEN,
    name: "Punto de Equilibrio",
    description: "Próximamente.",
    active: false,
  },
}

export function getProduct(productId: ProductId): ProductDefinition {
  return PRODUCTS[productId]
}

export function listActiveProducts(): ProductDefinition[] {
  return Object.values(PRODUCTS).filter((product) => product.active)
}
