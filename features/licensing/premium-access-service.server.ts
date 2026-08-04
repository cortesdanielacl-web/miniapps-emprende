/**
 * Autorización premium en servidor (Route Handlers / RSC).
 * Fail closed. No importar desde Client Components.
 */

import "server-only"

import { COMMERCIAL } from "@/config/commercial"
import type { ProductId } from "@/config/products"
import { getCurrentUserId } from "@/features/auth/session.server"
import type { License } from "@/features/licensing/types"
import {
  ACCESS_VALIDATION_FAILED_MESSAGE,
  logSecurityError,
} from "@/lib/security-log"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { licenseRepository } from "@/repositories/licenseRepository.server"

export class PremiumAccessDeniedError extends Error {
  readonly code = "PREMIUM_ACCESS_DENIED" as const

  constructor(message = ACCESS_VALIDATION_FAILED_MESSAGE) {
    super(message)
    this.name = "PremiumAccessDeniedError"
  }
}

function resolveProductId(productId?: ProductId): ProductId {
  return productId ?? COMMERCIAL.productId
}

function isLicenseCurrentlyValid(license: License, now = new Date()): boolean {
  if (!license || typeof license !== "object") return false
  if (license.status !== "active") return false
  if (!license.userId || !license.productId) return false
  if (license.expiresAt) {
    const expires = new Date(license.expiresAt)
    if (Number.isNaN(expires.getTime()) || expires.getTime() <= now.getTime()) {
      return false
    }
  }
  return true
}

async function checkAccess(productId?: ProductId): Promise<boolean> {
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
      resolveProductId(productId)
    )
    if (!license) {
      return false
    }

    return isLicenseCurrentlyValid(license)
  } catch (error) {
    logSecurityError(
      "premiumAccessService.server",
      error,
      "checkAccess denied"
    )
    return false
  }
}

export const premiumAccessService = {
  async requirePremiumAccess(productId?: ProductId): Promise<void> {
    try {
      const allowed = await checkAccess(productId)
      if (!allowed) {
        throw new PremiumAccessDeniedError()
      }
    } catch (error) {
      if (error instanceof PremiumAccessDeniedError) {
        throw error
      }
      logSecurityError(
        "premiumAccessService.server",
        error,
        "requirePremiumAccess denied"
      )
      throw new PremiumAccessDeniedError()
    }
  },

  async canGeneratePdf(productId?: ProductId): Promise<boolean> {
    return checkAccess(productId)
  },

  async canViewPremiumResults(productId?: ProductId): Promise<boolean> {
    return checkAccess(productId)
  },

  async canDownloadReport(productId?: ProductId): Promise<boolean> {
    return checkAccess(productId)
  },

  async hasPremiumAccess(productId?: ProductId): Promise<boolean> {
    return checkAccess(productId)
  },
}
