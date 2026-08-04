"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { authService } from "@/features/auth/auth-service"
import type {
  AuthCredentials,
  AuthResult,
  AuthUser,
  RegisterCredentials,
} from "@/features/auth/types"
import { licenseService } from "@/features/licensing/license-service"

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  login: (credentials: AuthCredentials) => Promise<AuthResult<AuthUser>>
  logout: () => Promise<AuthResult>
  register: (
    credentials: RegisterCredentials
  ) => Promise<
    AuthResult<{ user: AuthUser; needsEmailConfirmation: boolean }>
  >
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const current = await authService.getCurrentUser()
    setUser(current)
    if (current) {
      // Fuente de verdad: Supabase licenses (no asumir acceso).
      await licenseService.refreshLicensesAfterAuth().catch(() => [])
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const current = await authService.getCurrentUser()
        if (!cancelled) {
          setUser(current)
        }
        if (current && !cancelled) {
          await licenseService.refreshLicensesAfterAuth().catch(() => [])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void bootstrap()

    const subscription = authService.onAuthStateChange((_event, session) => {
      if (cancelled) return
      if (session?.user) {
        void authService.getCurrentUser().then(async (current) => {
          if (cancelled) return
          setUser(current)
          if (current) {
            await licenseService.refreshLicensesAfterAuth().catch(() => [])
          }
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(async (credentials: AuthCredentials) => {
    const result = await authService.login(credentials)
    if (result.ok) {
      setUser(result.data)
      await licenseService.refreshLicensesAfterAuth().catch(() => [])
    }
    return result
  }, [])

  const logout = useCallback(async () => {
    const result = await authService.logout()
    if (result.ok) {
      setUser(null)
    }
    return result
  }, [])

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const result = await authService.register(credentials)
    if (result.ok && !result.data.needsEmailConfirmation) {
      setUser(result.data.user)
      await licenseService.refreshLicensesAfterAuth().catch(() => [])
    }
    return result
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: user !== null,
      login,
      logout,
      register,
      refreshUser,
    }),
    [user, loading, login, logout, register, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }
  return context
}
