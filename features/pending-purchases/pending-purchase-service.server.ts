/**
 * Compras pendientes — Backoffice / Webpay (sin auto-activar).
 * Solo servidor. Zero Trust / Premium sin cambios.
 */

import "server-only"

import { getAppUrl, getBackofficeUrl } from "@/config/app-url"
import { COMMERCIAL } from "@/config/commercial"
import { getProduct, PRODUCT_IDS, type ProductId } from "@/config/products"
import { getSupportEmail } from "@/config/support"
import { activateLicenseFromPayment } from "@/features/licensing/license-service.server"
import type {
  BackofficeDashboardStats,
  CreatePendingPurchaseInput,
  PendingPurchase,
} from "@/features/pending-purchases/types"
import { sendEmail } from "@/lib/email/send-email"
import { logSecurityError } from "@/lib/security-log"
import { pendingPurchaseRepository } from "@/repositories/pendingPurchaseRepository.server"

function formatAmountClp(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDateEs(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-CL", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function resolveProductId(product: string): ProductId {
  if (product === PRODUCT_IDS.COST_CALCULATOR) {
    return PRODUCT_IDS.COST_CALCULATOR
  }
  if (product === COMMERCIAL.productName) {
    return COMMERCIAL.productId
  }
  const match = Object.values(PRODUCT_IDS).find((id) => id === product)
  return (match as ProductId | undefined) ?? COMMERCIAL.productId
}

function startOfLocalDay(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function startOfLocalMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

async function notifySupportPending(purchase: PendingPurchase): Promise<void> {
  const customer = purchase.customerName?.trim() || "—"
  const backofficeUrl = getBackofficeUrl(
    `/backoffice/licenses/${purchase.id}`
  )

  const text = [
    "Nueva compra pendiente de activación",
    "",
    `Cliente: ${customer}`,
    `Correo: ${purchase.email}`,
    `Producto: ${purchase.product}`,
    `Monto: ${formatAmountClp(purchase.amount)}`,
    `Fecha: ${formatDateEs(purchase.paymentDate)}`,
    "",
    "Abrir Backoffice:",
    backofficeUrl,
    "",
    `Sitio: ${getAppUrl()}`,
  ].join("\n")

  await sendEmail({
    to: getSupportEmail(),
    subject: "Nueva compra pendiente de activación",
    text,
  })
}

async function notifyClientActivated(purchase: PendingPurchase): Promise<void> {
  const name = purchase.customerName?.trim() || "cliente"

  const text = [
    "Tu licencia ya está activa",
    "",
    `Hola ${name}.`,
    "",
    "Tu licencia de MiniApps Emprende ha sido activada correctamente.",
    "",
    "Ya puedes iniciar sesión y utilizar la aplicación sin restricciones.",
    "",
    "Equipo MiniApps Emprende",
  ].join("\n")

  await sendEmail({
    to: purchase.email,
    subject: "Tu licencia ya está activa",
    text,
  })
}

export const pendingPurchaseService = {
  async saveWebpayIntent(input: {
    buyOrder: string
    userId: string
    email: string
    customerName?: string | null
    product?: string
    amount: number
  }) {
    return pendingPurchaseRepository.createWebpayIntent({
      buyOrder: input.buyOrder,
      userId: input.userId,
      email: input.email,
      customerName: input.customerName ?? null,
      product: input.product ?? COMMERCIAL.productName,
      amount: input.amount,
    })
  },

  async registerApprovedWebpayPayment(input: {
    buyOrder: string
    transactionToken: string
    amount: number
    paymentDate?: string
  }): Promise<PendingPurchase | null> {
    try {
      const existing = await pendingPurchaseRepository.getByBuyOrder(
        input.buyOrder
      )
      if (existing) {
        return existing
      }

      const intent = await pendingPurchaseRepository.getWebpayIntent(
        input.buyOrder
      )

      const payload: CreatePendingPurchaseInput = {
        userId: intent?.userId ?? null,
        email: intent?.email ?? "sin-correo@miniappsemprende.cl",
        customerName: intent?.customerName ?? null,
        product: intent?.product ?? COMMERCIAL.productName,
        amount: intent?.amount ?? input.amount,
        transactionToken: input.transactionToken,
        buyOrder: input.buyOrder,
        paymentDate: input.paymentDate ?? new Date().toISOString(),
      }

      if (!intent) {
        logSecurityError(
          "pendingPurchaseService",
          new Error("webpay_intent_missing"),
          `buy_order=${input.buyOrder}`
        )
      }

      const purchase =
        await pendingPurchaseRepository.createPendingPurchase(payload)

      void notifySupportPending(purchase)
      return purchase
    } catch (error) {
      logSecurityError(
        "pendingPurchaseService",
        error,
        "registerApprovedWebpayPayment failed"
      )
      return null
    }
  },

  async registerFromCheckoutReturn(input: {
    userId: string
    email: string
    customerName?: string | null
  }): Promise<PendingPurchase | null> {
    try {
      const all = await pendingPurchaseRepository.listAll()
      const open = all.find(
        (row) =>
          row.userId === input.userId &&
          row.status === "pending" &&
          (row.product === COMMERCIAL.productName ||
            row.product === COMMERCIAL.productId)
      )
      if (open) {
        return open
      }

      const buyOrder = `LP-${Date.now().toString(36).toUpperCase()}`
      const purchase = await pendingPurchaseRepository.createPendingPurchase({
        userId: input.userId,
        email: input.email,
        customerName: input.customerName ?? null,
        product: COMMERCIAL.productName,
        amount: COMMERCIAL.price,
        transactionToken: null,
        buyOrder,
        paymentDate: new Date().toISOString(),
      })

      void notifySupportPending(purchase)
      return purchase
    } catch (error) {
      logSecurityError(
        "pendingPurchaseService",
        error,
        "registerFromCheckoutReturn failed"
      )
      return null
    }
  },

  async listForAdmin(): Promise<PendingPurchase[]> {
    return pendingPurchaseRepository.listAll()
  },

  async getById(id: string): Promise<PendingPurchase | null> {
    return pendingPurchaseRepository.getById(id)
  },

  async getDashboardStats(): Promise<BackofficeDashboardStats> {
    const rows = await pendingPurchaseRepository.listAll()
    const dayStart = startOfLocalDay().getTime()
    const monthStart = startOfLocalMonth().getTime()

    let pendingCount = 0
    let activatedCount = 0
    let salesTodayAmount = 0
    let salesMonthAmount = 0

    for (const row of rows) {
      if (row.status === "pending") pendingCount += 1
      if (row.status === "activated") activatedCount += 1

      const paidAt = new Date(row.paymentDate).getTime()
      if (!Number.isFinite(paidAt)) continue

      if (row.status !== "cancelled") {
        if (paidAt >= monthStart) {
          salesMonthAmount += row.amount
        }
        if (paidAt >= dayStart) {
          salesTodayAmount += row.amount
        }
      }
    }

    return {
      pendingCount,
      activatedCount,
      salesTodayAmount,
      salesMonthAmount,
      recentPurchases: rows.slice(0, 8),
    }
  },

  async activatePurchase(purchaseId: string): Promise<PendingPurchase> {
    const purchase = await pendingPurchaseRepository.getById(purchaseId)
    if (!purchase) {
      throw new Error("Compra pendiente no encontrada")
    }
    if (purchase.status === "activated") {
      return purchase
    }
    if (purchase.status === "cancelled") {
      throw new Error("No se puede activar una compra cancelada.")
    }
    if (!purchase.userId) {
      throw new Error(
        "Esta compra no tiene usuario asociado. Asocia el user_id antes de activar."
      )
    }

    const productId = resolveProductId(purchase.product)

    await activateLicenseFromPayment({
      targetUserId: purchase.userId,
      productId,
      paymentReference: purchase.buyOrder,
    })

    const updated = await pendingPurchaseRepository.markActivated(purchaseId)
    void notifyClientActivated(updated)
    return updated
  },
}
