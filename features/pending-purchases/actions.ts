"use server"

import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/features/admin/require-admin.server"
import { getCurrentUser } from "@/features/auth/session.server"
import { pendingPurchaseService } from "@/features/pending-purchases/pending-purchase-service.server"
import type { PendingPurchase } from "@/features/pending-purchases/types"

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string }

/** Activa licencia definitiva desde una compra pendiente. */
export async function activatePendingPurchaseAction(
  purchaseId: string
): Promise<ActionResult<PendingPurchase>> {
  const admin = await requireAdmin()
  if (!admin.ok) {
    return { ok: false, error: "No autorizado." }
  }

  if (!purchaseId?.trim()) {
    return { ok: false, error: "Identificador inválido." }
  }

  try {
    const updated = await pendingPurchaseService.activatePurchase(
      purchaseId.trim()
    )
    revalidatePath("/backoffice")
    revalidatePath("/backoffice/licenses")
    revalidatePath(`/backoffice/licenses/${purchaseId}`)
    return { ok: true, data: updated }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo activar la licencia."
    return { ok: false, error: message }
  }
}

export type CommercialPurchaseConfirmationState = {
  hasPendingPurchase: boolean
  hasActivatedPurchase: boolean
}

/**
 * Solo lectura para /compra/confirmacion.
 * No crea pending_purchases ni envía correos.
 */
export async function getMyCommercialPurchaseStateAction(): Promise<
  ActionResult<CommercialPurchaseConfirmationState>
> {
  const user = await getCurrentUser()
  if (!user?.id) {
    return {
      ok: true,
      data: { hasPendingPurchase: false, hasActivatedPurchase: false },
    }
  }

  try {
    const data = await pendingPurchaseService.getConfirmationStateForUser(
      user.id
    )
    return { ok: true, data }
  } catch {
    return { ok: false, error: "No se pudo consultar el estado de la compra." }
  }
}
