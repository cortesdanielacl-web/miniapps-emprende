/**
 * Servicio de licencias — única fachada para la UI.
 * Fail closed: cualquier error → sin acceso.
 *
 * Escrituras (activate/deactivate) → license-service.server.ts
 */

import type { ProductId } from "@/config/products"
import { getCurrentUserId } from "@/features/auth/session"
import type { License, UserLicenseSummary } from "@/features/licensing/types"
import { logSecurityError } from "@/lib/security-log"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { licenseRepository } from "@/repositories/licenseRepository"

function isLicenseCurrentlyValid(license: License, now = new Date()): boolean {
  if (!license || typeof license !== "object") {
    return false
  }

  if (license.status !== "active") {
    return false
  }

  if (!license.userId || !license.productId) {
    return false
  }

  if (license.expiresAt) {
    const expires = new Date(license.expiresAt)
    if (Number.isNaN(expires.getTime()) || expires.getTime() <= now.getTime()) {
      return false
    }
  }

  return true
}

async function requireAuthUserId(): Promise<string> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error("Debes iniciar sesión para gestionar licencias")
  }
  return userId
}

export const licenseService = {
  /**
   * ¿El usuario autenticado tiene acceso activo al producto?
   * Fail closed: excepción / timeout / error Supabase / JWT inválido → false.
   */
  async hasProductAccess(productId: ProductId): Promise<boolean> {
    try {
      if (!isSupabaseConfigured()) {
        return false
      }

      const userId = await getCurrentUserId()
      if (!userId) {
        return false
      }

      const license = await licenseRepository.getProductLicense(
        userId,
        productId
      )
      if (!license) {
        return false
      }

      return isLicenseCurrentlyValid(license)
    } catch (error) {
      logSecurityError("hasProductAccess", error, "denying access")
      return false
    }
  },

  /** Licencia activa o null. Fail closed → null. */
  async getActiveLicense(productId: ProductId): Promise<License | null> {
    try {
      if (!isSupabaseConfigured()) {
        return null
      }

      const userId = await getCurrentUserId()
      if (!userId) {
        return null
      }

      const license = await licenseRepository.getProductLicense(
        userId,
        productId
      )
      if (!license || !isLicenseCurrentlyValid(license)) {
        return null
      }

      return license
    } catch (error) {
      logSecurityError("getActiveLicense", error, "returning null")
      return null
    }
  },

  async getUserLicenses(): Promise<License[]> {
    try {
      const userId = await requireAuthUserId()
      return await licenseRepository.getUserLicenses(userId)
    } catch (error) {
      logSecurityError("getUserLicenses", error, "returning empty list")
      return []
    }
  },

  async getProductLicense(productId: ProductId): Promise<License | null> {
    try {
      const userId = await requireAuthUserId()
      return await licenseRepository.getProductLicense(userId, productId)
    } catch (error) {
      logSecurityError("getProductLicense", error, "returning null")
      return null
    }
  },

  async getSummary(): Promise<UserLicenseSummary> {
    try {
      const userId = await requireAuthUserId()
      const licenses = await licenseRepository.getUserLicenses(userId)
      return {
        userId,
        licenses,
        productIds: licenses.map((license) => license.productId),
      }
    } catch (error) {
      logSecurityError("getSummary", error, "returning empty summary")
      const userId = (await getCurrentUserId()) ?? "unknown"
      return { userId, licenses: [], productIds: [] }
    }
  },

  /**
   * Tras login: carga licencias desde Supabase.
   * Fail closed → lista vacía (nunca asume acceso).
   */
  async refreshLicensesAfterAuth(): Promise<License[]> {
    try {
      if (!isSupabaseConfigured()) {
        return []
      }
      const userId = await getCurrentUserId()
      if (!userId) return []
      return await licenseRepository.getUserLicenses(userId)
    } catch (error) {
      logSecurityError("refreshLicensesAfterAuth", error, "returning empty")
      return []
    }
  },
}

/** Fail closed: cualquier error → false. */
export async function hasProductAccess(productId: ProductId): Promise<boolean> {
  return licenseService.hasProductAccess(productId)
}

export async function getActiveLicense(
  productId: ProductId
): Promise<License | null> {
  return licenseService.getActiveLicense(productId)
}
