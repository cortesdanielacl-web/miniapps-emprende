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

/**
 * Tras retorno de Link de Pago / confirmación:
 * registra compra pending si el usuario está autenticado.
 */
export async function registerPendingPurchaseFromCheckoutAction(): Promise<
  ActionResult<PendingPurchase | null>
> {
  const user = await getCurrentUser()
  if (!user?.id || !user.email) {
    return { ok: false, error: "Debes iniciar sesión." }
  }

  try {
    const purchase = await pendingPurchaseService.registerFromCheckoutReturn({
      userId: user.id,
      email: user.email,
      customerName: user.name,
    })
    return { ok: true, data: purchase }
  } catch {
    return { ok: false, error: "No se pudo registrar la compra pendiente." }
  }
}
