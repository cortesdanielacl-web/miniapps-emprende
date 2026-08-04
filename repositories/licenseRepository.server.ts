/**
 * Escrituras / lecturas admin de licencias (Supabase service role).
 * Solo servidor — no importar desde Client Components.
 *
 * API de datos: getLicense, getUserLicenses, getProductLicense,
 * createLicense, activateLicense, deactivateLicense (+ listAll admin).
 */

import "server-only"

import type { ProductId } from "@/config/products"
import type {
  License,
  LicenseSource,
  LicenseStatus,
  LicenseType,
} from "@/features/licensing/types"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import {
  mapLicenseRow,
  type LicenseRow,
  licenseRepository as licenseReadRepository,
} from "@/repositories/licenseRepository"

export type CreateLicenseData = {
  userId: string
  productId: ProductId
  status?: LicenseStatus
  type?: LicenseType
  source?: LicenseSource
  activatedAt?: string | null
  expiresAt?: string | null
  paymentReference?: string | null
}

export type ActivateLicenseData = {
  userId: string
  productId: ProductId
  status: "active"
  activatedAt: string
  paymentReference: string | null
  source: LicenseSource
  type?: LicenseType
  expiresAt?: string | null
}

async function getLicenseAdmin(id: string): Promise<License | null> {
  const supabase = createServiceRoleClient()
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
}

async function getUserLicensesAdmin(userId: string): Promise<License[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("licenses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`getUserLicenses: ${error.message}`)
  }
  return ((data ?? []) as LicenseRow[]).map(mapLicenseRow)
}

async function getProductLicenseAdmin(
  userId: string,
  productId: ProductId
): Promise<License | null> {
  const supabase = createServiceRoleClient()
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
}

export const licenseRepository = {
  /** Lectura con sesión (RLS) — delegada al repo cliente-seguro. */
  getLicense: licenseReadRepository.getLicense,
  getUserLicenses: licenseReadRepository.getUserLicenses,
  getProductLicense: licenseReadRepository.getProductLicense,

  /** Lecturas admin (service role). */
  getLicenseAdmin,
  getUserLicensesAdmin,
  getProductLicenseAdmin,

  /** Inserta una licencia (service role). */
  async createLicense(input: CreateLicenseData): Promise<License> {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from("licenses")
      .insert({
        user_id: input.userId,
        product_id: input.productId,
        status: input.status ?? "pending",
        type: input.type ?? "individual",
        source: input.source ?? "manual",
        activated_at: input.activatedAt ?? null,
        expires_at: input.expiresAt ?? null,
        payment_reference: input.paymentReference ?? null,
      })
      .select("*")
      .single()

    if (error) {
      throw new Error(`createLicense: ${error.message}`)
    }
    return mapLicenseRow(data as LicenseRow)
  },

  /**
   * Activa o reactiva una licencia en DB (service role).
   * Upsert por (user_id, product_id).
   */
  async activateLicense(input: ActivateLicenseData): Promise<License> {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from("licenses")
      .upsert(
        {
          user_id: input.userId,
          product_id: input.productId,
          status: input.status,
          activated_at: input.activatedAt,
          payment_reference: input.paymentReference,
          source: input.source,
          type: input.type ?? "individual",
          expires_at: input.expiresAt ?? null,
        },
        { onConflict: "user_id,product_id" }
      )
      .select("*")
      .single()

    if (error) {
      throw new Error(`activateLicense: ${error.message}`)
    }
    return mapLicenseRow(data as LicenseRow)
  },

  /** Marca licencia como inactive (no elimina). Service role. */
  async deactivateLicense(id: string): Promise<License> {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from("licenses")
      .update({ status: "inactive" })
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      throw new Error(`deactivateLicense: ${error.message}`)
    }
    return mapLicenseRow(data as LicenseRow)
  },

  /** Lectura admin de listado (service role). */
  async listAll(status?: LicenseStatus): Promise<License[]> {
    const supabase = createServiceRoleClient()
    let query = supabase
      .from("licenses")
      .select("*")
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query
    if (error) {
      throw new Error(`listAll: ${error.message}`)
    }
    return ((data ?? []) as LicenseRow[]).map(mapLicenseRow)
  },
}
