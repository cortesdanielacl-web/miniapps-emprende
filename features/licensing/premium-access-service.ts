/**
 * Único punto de autorización de funciones premium.
 * Estrategia Fail Closed: cualquier error → denegar acceso.
 */

import { COMMERCIAL } from "@/config/commercial"
import type { ProductId } from "@/config/products"
import { hasProductAccess } from "@/features/licensing/license-service"
import {
  ACCESS_VALIDATION_FAILED_MESSAGE,
  logSecurityError,
} from "@/lib/security-log"
import { isSupabaseConfigured } from "@/lib/supabase/env"

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

/**
 * Fail closed: excepciones, env ausente o licencia inválida → false.
 * Nunca true ante incertidumbre.
 */
async function checkAccess(productId?: ProductId): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) {
      return false
    }
    return await hasProductAccess(resolveProductId(productId))
  } catch (error) {
    logSecurityError("premiumAccessService", error, "checkAccess denied")
    return false
  }
}

export const premiumAccessService = {
  /**
   * Autoriza o lanza PremiumAccessDeniedError.
   * Fail closed ante cualquier fallo.
   */
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
        "premiumAccessService",
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
