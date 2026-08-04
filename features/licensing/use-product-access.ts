"use client"

import { useEffect, useState } from "react"

import type { ProductId } from "@/config/products"
import { useAuth } from "@/features/auth/use-auth"
import { premiumAccessService } from "@/features/licensing/premium-access-service"

/**
 * Hook de UI para acceso premium.
 * Delega en premiumAccessService → hasProductAccess() → Supabase.
 */
export function useProductAccess(productId: ProductId) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function checkAccess() {
      if (authLoading) {
        setIsLoading(true)
        return
      }

      if (!isAuthenticated) {
        if (!cancelled) {
          setHasAccess(false)
          setIsLoading(false)
        }
        return
      }

      setIsLoading(true)
      try {
        const access =
          await premiumAccessService.hasPremiumAccess(productId)
        if (!cancelled) {
          setHasAccess(access)
        }
      } catch {
        if (!cancelled) {
          setHasAccess(false)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void checkAccess()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, authLoading, productId])

  return { hasAccess, isLoading: authLoading || isLoading }
}
