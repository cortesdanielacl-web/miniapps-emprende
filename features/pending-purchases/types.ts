export type PendingPurchaseStatus = "pending" | "activated" | "cancelled"

export type PendingPurchase = {
  id: string
  userId: string | null
  email: string
  customerName: string | null
  product: string
  amount: number
  transactionToken: string | null
  buyOrder: string
  paymentDate: string
  status: PendingPurchaseStatus
  activatedAt: string | null
  createdAt: string
  updatedAt: string
}

export type WebpayIntent = {
  buyOrder: string
  userId: string
  email: string
  customerName: string | null
  product: string
  amount: number
  createdAt: string
}

export type CreatePendingPurchaseInput = {
  userId: string | null
  email: string
  customerName?: string | null
  product: string
  amount: number
  transactionToken?: string | null
  buyOrder: string
  paymentDate?: string
}

export type BackofficeDashboardStats = {
  pendingCount: number
  activatedCount: number
  salesTodayAmount: number
  salesMonthAmount: number
  recentPurchases: PendingPurchase[]
}
