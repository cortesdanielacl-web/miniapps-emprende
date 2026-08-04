/**
 * Sistema de licencias MiniApps Emprende.
 *
 * Capas:
 * - Modelos      → types.ts
 * - Autorización premium → premiumAccessService (único gate de funciones premium)
 * - Acceso datos → licenseService → licenseRepository → Supabase
 * - Mutaciones   → license-service.server.ts
 */

export type {
  License,
  LicenseSource,
  LicenseStatus,
  LicenseType,
  UserLicenseSummary,
} from "./types"

export {
  hasProductAccess,
  getActiveLicense,
  licenseService,
} from "./license-service"

export {
  premiumAccessService,
  PremiumAccessDeniedError,
} from "./premium-access-service"

export { useProductAccess } from "./use-product-access"
