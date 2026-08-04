/**
 * Persistencia de compras pendientes e intents Webpay (service role).
 * Solo servidor — Backoffice / Webpay.
 */

import "server-only"

import { createServiceRoleClient } from "@/lib/supabase/admin"
import type {
  CreatePendingPurchaseInput,
  PendingPurchase,
  PendingPurchaseStatus,
  WebpayIntent,
} from "@/features/pending-purchases/types"

type PendingPurchaseRow = {
  id: string
  user_id: string | null
  email: string
  customer_name: string | null
  product: string
  amount: number | string
  transaction_token: string | null
  buy_order: string
  payment_date: string
  status: PendingPurchaseStatus
  activated_at: string | null
  created_at: string
  updated_at: string
}

type WebpayIntentRow = {
  buy_order: string
  user_id: string
  email: string
  customer_name: string | null
  product: string
  amount: number | string
  created_at: string
}

function mapPendingPurchase(row: PendingPurchaseRow): PendingPurchase {
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    customerName: row.customer_name,
    product: row.product,
    amount: Number(row.amount),
    transactionToken: row.transaction_token,
    buyOrder: row.buy_order,
    paymentDate: row.payment_date,
    status: row.status,
    activatedAt: row.activated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapWebpayIntent(row: WebpayIntentRow): WebpayIntent {
  return {
    buyOrder: row.buy_order,
    userId: row.user_id,
    email: row.email,
    customerName: row.customer_name,
    product: row.product,
    amount: Number(row.amount),
    createdAt: row.created_at,
  }
}

export const pendingPurchaseRepository = {
  async createWebpayIntent(input: {
    buyOrder: string
    userId: string
    email: string
    customerName?: string | null
    product: string
    amount: number
  }): Promise<WebpayIntent> {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from("webpay_intents")
      .upsert(
        {
          buy_order: input.buyOrder,
          user_id: input.userId,
          email: input.email,
          customer_name: input.customerName ?? null,
          product: input.product,
          amount: input.amount,
        },
        { onConflict: "buy_order" }
      )
      .select("*")
      .single()

    if (error) {
      throw new Error(`createWebpayIntent: ${error.message}`)
    }
    return mapWebpayIntent(data as WebpayIntentRow)
  },

  async getWebpayIntent(buyOrder: string): Promise<WebpayIntent | null> {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from("webpay_intents")
      .select("*")
      .eq("buy_order", buyOrder)
      .maybeSingle()

    if (error) {
      throw new Error(`getWebpayIntent: ${error.message}`)
    }
    if (!data) return null
    return mapWebpayIntent(data as WebpayIntentRow)
  },

  async createPendingPurchase(
    input: CreatePendingPurchaseInput
  ): Promise<PendingPurchase> {
    const supabase = createServiceRoleClient()
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from("pending_purchases")
      .insert({
        user_id: input.userId,
        email: input.email,
        customer_name: input.customerName ?? null,
        product: input.product,
        amount: input.amount,
        transaction_token: input.transactionToken ?? null,
        buy_order: input.buyOrder,
        payment_date: input.paymentDate ?? now,
        status: "pending",
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single()

    if (error) {
      throw new Error(`createPendingPurchase: ${error.message}`)
    }
    return mapPendingPurchase(data as PendingPurchaseRow)
  },

  async getByBuyOrder(buyOrder: string): Promise<PendingPurchase | null> {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from("pending_purchases")
      .select("*")
      .eq("buy_order", buyOrder)
      .maybeSingle()

    if (error) {
      throw new Error(`getByBuyOrder: ${error.message}`)
    }
    if (!data) return null
    return mapPendingPurchase(data as PendingPurchaseRow)
  },

  async getById(id: string): Promise<PendingPurchase | null> {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from("pending_purchases")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw new Error(`getById: ${error.message}`)
    }
    if (!data) return null
    return mapPendingPurchase(data as PendingPurchaseRow)
  },

  async listAll(): Promise<PendingPurchase[]> {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from("pending_purchases")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`listAll: ${error.message}`)
    }
    return ((data ?? []) as PendingPurchaseRow[]).map(mapPendingPurchase)
  },

  async markActivated(id: string): Promise<PendingPurchase> {
    const supabase = createServiceRoleClient()
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from("pending_purchases")
      .update({
        status: "activated",
        activated_at: now,
        updated_at: now,
      })
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      throw new Error(`markActivated: ${error.message}`)
    }
    return mapPendingPurchase(data as PendingPurchaseRow)
  },

  async markCancelled(id: string): Promise<PendingPurchase> {
    const supabase = createServiceRoleClient()
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from("pending_purchases")
      .update({
        status: "cancelled",
        updated_at: now,
      })
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      throw new Error(`markCancelled: ${error.message}`)
    }
    return mapPendingPurchase(data as PendingPurchaseRow)
  },
}
