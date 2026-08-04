/**
 * Mutaciones de licencias (servidor).
 * Persiste en Supabase con service role.
 * No importar desde Client Components.
 */

import "server-only"

import { getProduct, type ProductId } from "@/config/products"
import { getCurrentUserId } from "@/features/auth/session.server"
import { licenseService as licenseReadService } from "@/features/licensing/license-service"
import type {
  License,
  LicenseSource,
  LicenseStatus,
  LicenseType,
} from "@/features/licensing/types"
import { licenseRepository } from "@/repositories/licenseRepository.server"

export type ActivateLicenseInput = {
  productId: ProductId
  type?: LicenseType
  source?: LicenseSource
  paymentReference?: string | null
  expiresAt?: string | null
  /**
   * Solo flujos de confianza en servidor (admin / Webpay commit).
   * Si se omite, se usa el userId de Supabase Auth de la sesión actual.
   */
  targetUserId?: string
}

export type DeactivateLicenseInput = {
  licenseId?: string
  productId?: ProductId
  /** Solo admin/servidor de confianza. */
  targetUserId?: string
  reason?: string
}

async function resolveMutationUserId(targetUserId?: string): Promise<string> {
  if (targetUserId) {
    return targetUserId
  }
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error("Debes iniciar sesión para gestionar licencias")
  }
  return userId
}

export const licenseServiceServer = {
  ...licenseReadService,

  /**
   * Activa (o reactiva) licencia en Supabase.
   * Registra status, activatedAt, paymentReference, source.
   */
  async activateLicense(input: ActivateLicenseInput): Promise<License> {
    getProduct(input.productId)
    const userId = await resolveMutationUserId(input.targetUserId)
    const now = new Date().toISOString()

    return licenseRepository.activateLicense({
      userId,
      productId: input.productId,
      status: "active",
      activatedAt: now,
      paymentReference: input.paymentReference ?? null,
      source: input.source ?? "manual",
      type: input.type ?? "individual",
      expiresAt: input.expiresAt ?? null,
    })
  },

  /** Activación tras pago verificado en servidor (Webpay futuro). */
  async activateLicenseFromPayment(input: {
    targetUserId: string
    productId: ProductId
    paymentReference: string
  }): Promise<License> {
    return this.activateLicense({
      targetUserId: input.targetUserId,
      productId: input.productId,
      type: "individual",
      source: "transbank",
      paymentReference: input.paymentReference,
      expiresAt: null,
    })
  },

  /** Desactiva licencia en DB (status inactive). No elimina el registro. */
  async deactivateLicense(input: DeactivateLicenseInput): Promise<License> {
    let license: License | null = null

    if (input.licenseId) {
      license = await licenseRepository.getLicenseAdmin(input.licenseId)
    } else if (input.productId) {
      const userId = await resolveMutationUserId(input.targetUserId)
      license = await licenseRepository.getProductLicenseAdmin(
        userId,
        input.productId
      )
    }

    if (!license) {
      throw new Error("Licencia no encontrada para desactivar")
    }

    void input.reason
    return licenseRepository.deactivateLicense(license.id)
  },

  async adminActivateLicense(input: {
    userId: string
    productId: ProductId
    paymentReference?: string | null
  }): Promise<License> {
    return this.activateLicense({
      targetUserId: input.userId,
      productId: input.productId,
      type: "individual",
      source: "admin",
      paymentReference: input.paymentReference ?? null,
      expiresAt: null,
    })
  },

  async adminDeactivateLicense(input: {
    licenseId?: string
    userId?: string
    productId?: ProductId
    reason?: string
  }): Promise<License> {
    return this.deactivateLicense({
      licenseId: input.licenseId,
      productId: input.productId,
      targetUserId: input.userId,
      reason: input.reason,
    })
  },

  async adminGetUser(userId: string) {
    const licenses = await licenseRepository.getUserLicensesAdmin(userId)
    return {
      userId,
      licenses,
      productIds: licenses.map((item) => item.productId),
    }
  },

  async adminListLicenses(status?: LicenseStatus) {
    return licenseRepository.listAll(status)
  },

  async adminGetPurchasedProducts(userId: string) {
    const summary = await this.adminGetUser(userId)
    return summary.licenses.filter((license) => license.status === "active")
  },

  async createLicense(input: {
    targetUserId: string
    productId: ProductId
    status?: LicenseStatus
    type?: LicenseType
    source?: LicenseSource
    paymentReference?: string | null
  }): Promise<License> {
    getProduct(input.productId)
    return licenseRepository.createLicense({
      userId: input.targetUserId,
      productId: input.productId,
      status: input.status ?? "pending",
      type: input.type ?? "individual",
      source: input.source ?? "manual",
      paymentReference: input.paymentReference ?? null,
    })
  },
}

/** Alias de aplicación para código servidor. */
export const licenseService = licenseServiceServer

export async function activateLicense(
  input: ActivateLicenseInput
): Promise<License> {
  return licenseServiceServer.activateLicense(input)
}

export async function activateLicenseFromPayment(input: {
  targetUserId: string
  productId: ProductId
  paymentReference: string
}): Promise<License> {
  return licenseServiceServer.activateLicenseFromPayment(input)
}

export async function deactivateLicense(
  input: DeactivateLicenseInput
): Promise<License> {
  return licenseServiceServer.deactivateLicense(input)
}
