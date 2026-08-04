/**
 * Acceso de lectura a licencias (Supabase).
 * Sin lógica de negocio. Seguro para cliente (RLS).
 *
 * Escrituras → repositories/licenseRepository.server.ts
 */

import type { ProductId } from "@/config/products"
import type {
  License,
  LicenseSource,
  LicenseStatus,
  LicenseType,
} from "@/features/licensing/types"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import { createClient as createServerClient } from "@/lib/supabase/server"

export type LicenseRow = {
  id: string
  user_id: string
  product_id: string
  status: LicenseStatus
  type: LicenseType
  source: LicenseSource
  created_at: string
  activated_at: string | null
  expires_at: string | null
  payment_reference: string | null
}

export function mapLicenseRow(row: LicenseRow): License {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id as ProductId,
    status: row.status,
    type: row.type,
    source: row.source,
    createdAt: row.created_at,
    activatedAt: row.activated_at,
    expiresAt: row.expires_at,
    paymentReference: row.payment_reference,
  }
}

async function getUserScopedClient() {
  if (typeof window === "undefined") {
    return createServerClient()
  }
  return createBrowserClient()
}

export const licenseRepository = {
  /** Obtiene una licencia por id (RLS: solo propia). */
  async getLicense(id: string): Promise<License | null> {
    const supabase = await getUserScopedClient()
    const { data, error } = await supabase
      .from("licenses")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw new Error(`getLicense: ${error.message}`)
    }
    if (!data) return null
    return mapLicenseRow(data as LicenseRow)
  },

  /** Lista licencias de un usuario (RLS: solo propias con cliente de sesión). */
  async getUserLicenses(userId: string): Promise<License[]> {
    const supabase = await getUserScopedClient()
    const { data, error } = await supabase
      .from("licenses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`getUserLicenses: ${error.message}`)
    }
    return ((data ?? []) as LicenseRow[]).map(mapLicenseRow)
  },

  /** Licencia de un usuario para un productId concreto. */
  async getProductLicense(
    userId: string,
    productId: ProductId
  ): Promise<License | null> {
    const supabase = await getUserScopedClient()
    const { data, error } = await supabase
      .from("licenses")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle()

    if (error) {
      throw new Error(`getProductLicense: ${error.message}`)
    }
    if (!data) return null
    return mapLicenseRow(data as LicenseRow)
  },
}
