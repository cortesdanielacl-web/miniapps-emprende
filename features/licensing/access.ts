/**
 * Consulta de acceso a productos.
 * Delega en licenseService → Supabase. Sin memoria ni storage local.
 */

import type { ProductId } from "@/config/products"
import {
  getActiveLicense as getActiveLicenseFromService,
  hasProductAccess as hasProductAccessFromService,
  licenseService,
} from "@/features/licensing/license-service"
import type { License } from "@/features/licensing/types"

/**
 * Único punto de consulta de permisos de producto.
 * userId se obtiene desde Supabase Auth dentro del servicio — no aceptar params.
 */
export async function hasProductAccess(
  productId: ProductId
): Promise<boolean> {
  return hasProductAccessFromService(productId)
}

/** Licencia activa del usuario autenticado para un producto. */
export async function getActiveLicense(
  productId: ProductId
): Promise<License | null> {
  return getActiveLicenseFromService(productId)
}

export { licenseService }
