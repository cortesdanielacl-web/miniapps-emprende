import type { ProductId } from "@/config/products"

/** Estado operativo de una licencia. */
export type LicenseStatus = "pending" | "active" | "inactive" | "expired"

/** Tipo comercial de licencia. */
export type LicenseType = "individual" | "lifetime"

/** Origen de activación (manual hoy; Transbank mañana). */
export type LicenseSource = "manual" | "admin" | "transbank"

/**
 * Entidad License — agnóstica al producto.
 * Una licencia = acceso permanente de un usuario a una MiniApp.
 * Fuente de verdad: tabla public.licenses en Supabase.
 */
export type License = {
  id: string
  userId: string
  productId: ProductId
  status: LicenseStatus
  type: LicenseType
  source: LicenseSource
  createdAt: string
  activatedAt: string | null
  expiresAt: string | null
  /** Referencia de pago (buyOrder / paymentId Transbank) cuando exista. */
  paymentReference: string | null
}

export type UserLicenseSummary = {
  userId: string
  licenses: License[]
  productIds: ProductId[]
}
