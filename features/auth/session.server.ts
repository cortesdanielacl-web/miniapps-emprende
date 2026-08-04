/**
 * Identidad Auth en servidor.
 * No importar desde Client Components.
 */

import "server-only"

import { authServiceServer } from "@/features/auth/auth-service.server"
import type { AuthUser } from "@/features/auth/types"

export type { AuthUser }

export async function getCurrentUser(): Promise<AuthUser | null> {
  return authServiceServer.getCurrentUser()
}

export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.id ?? null
}
