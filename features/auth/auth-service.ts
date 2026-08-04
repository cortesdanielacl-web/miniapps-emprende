/**
 * Servicio oficial de autenticación MiniApps Emprende.
 * Único punto de acceso a Supabase Auth desde la aplicación.
 * Los componentes NO deben importar clientes Supabase directamente.
 *
 * Identidad / protección de rutas: getClaims() (recomendado oficialmente).
 * Registro de usuario fresco desde Auth: getUser().
 */

import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js"

import { CALCULATOR_ENTRY_HREF, RESET_PASSWORD_HREF } from "@/config/routes"
import {
  mapSupabaseUser,
  mapUserToProfile,
} from "@/features/auth/profile"
import type {
  AuthCredentials,
  AuthResult,
  AuthUser,
  FutureAuthProvider,
  Profile,
  RegisterCredentials,
} from "@/features/auth/types"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import { getSupabaseEnv } from "@/lib/supabase/env"
import { logSecurityError } from "@/lib/security-log"

function supabaseConfigError(): { ok: false; error: string } {
  return {
    ok: false,
    error:
      "Autenticación no configurada. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
  }
}

function mapAuthError(error: { message?: string } | null): string {
  const message = error?.message?.toLowerCase() ?? ""

  if (message.includes("invalid login credentials")) {
    return "Correo o contraseña incorrectos."
  }
  if (message.includes("user already registered")) {
    return "Ya existe una cuenta con este correo."
  }
  if (message.includes("email not confirmed")) {
    return "Debes confirmar tu correo antes de iniciar sesión."
  }
  if (message.includes("password")) {
    return "La contraseña no cumple los requisitos mínimos."
  }

  return error?.message || "No se pudo completar la operación. Intenta nuevamente."
}

async function getBrowserUser(): Promise<User | null> {
  try {
    if (!getSupabaseEnv()) return null
    const supabase = createBrowserClient()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return null
    return data.user
  } catch (error) {
    logSecurityError("authService", error, "getBrowserUser fail-closed")
    return null
  }
}

export const authService = {
  /** Inicia sesión con correo y contraseña. */
  async login(credentials: AuthCredentials): Promise<AuthResult<AuthUser>> {
    if (!getSupabaseEnv()) return supabaseConfigError()

    const supabase = createBrowserClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email.trim(),
      password: credentials.password,
    })

    if (error || !data.user) {
      return { ok: false, error: mapAuthError(error) }
    }

    return { ok: true, data: mapSupabaseUser(data.user) }
  },

  /** Cierra la sesión actual. */
  async logout(): Promise<AuthResult> {
    if (!getSupabaseEnv()) return supabaseConfigError()

    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { ok: false, error: mapAuthError(error) }
    }

    return { ok: true, data: undefined }
  },

  /**
   * Registra una cuenta con nombre, correo y contraseña.
   * Si Supabase exige confirmación por email, la sesión puede no quedar activa.
   */
  async register(
    credentials: RegisterCredentials
  ): Promise<AuthResult<{ user: AuthUser; needsEmailConfirmation: boolean }>> {
    if (!getSupabaseEnv()) return supabaseConfigError()

    const supabase = createBrowserClient()
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email.trim(),
      password: credentials.password,
      options: {
        data: {
          name: credentials.name.trim(),
          full_name: credentials.name.trim(),
        },
      },
    })

    if (error || !data.user) {
      return { ok: false, error: mapAuthError(error) }
    }

    return {
      ok: true,
      data: {
        user: mapSupabaseUser(data.user),
        needsEmailConfirmation: !data.session,
      },
    }
  },

  /**
   * Usuario autenticado (cliente).
   * getUser() consulta Auth cuando se necesita el registro completo.
   * Servidor → auth-service.server.ts
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const user = await getBrowserUser()
    return user ? mapSupabaseUser(user) : null
  },

  /** Verifica identidad en cliente vía JWT (getClaims). Fail closed → false. */
  async isAuthenticated(): Promise<boolean> {
    try {
      if (!getSupabaseEnv()) return false
      const supabase = createBrowserClient()
      const { data, error } = await supabase.auth.getClaims()
      if (error || !data?.claims) return false
      return true
    } catch (error) {
      logSecurityError("authService", error, "isAuthenticated fail-closed")
      return false
    }
  },

  /** Profile derivado del usuario Auth (sin edición todavía). */
  async getProfile(): Promise<Profile | null> {
    const user = await getBrowserUser()
    return user ? mapUserToProfile(user) : null
  },

  /**
   * Suscripción a cambios de sesión (solo vía authService).
   * Evita que UI importe clientes Supabase directamente.
   */
  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ): { unsubscribe: () => void } {
    if (!getSupabaseEnv()) {
      return { unsubscribe: () => undefined }
    }

    const supabase = createBrowserClient()
    const { data } = supabase.auth.onAuthStateChange(callback)
    return data.subscription
  },

  /**
   * Solicita email de recuperación (Supabase Auth).
   * El enlace redirige a /auth/confirm → /reset-password.
   * Requiere URL de redirección permitida en el panel de Supabase.
   */
  async requestPasswordReset(email: string): Promise<AuthResult> {
    if (!getSupabaseEnv()) return supabaseConfigError()

    const supabase = createBrowserClient()
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/confirm?next=${encodeURIComponent(RESET_PASSWORD_HREF)}`
        : undefined

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    })

    if (error) {
      return { ok: false, error: mapAuthError(error) }
    }

    return { ok: true, data: undefined }
  },

  /**
   * Actualiza la contraseña del usuario con sesión de recovery activa.
   */
  async updatePassword(password: string): Promise<AuthResult> {
    if (!getSupabaseEnv()) return supabaseConfigError()

    const supabase = createBrowserClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      return { ok: false, error: mapAuthError(error) }
    }

    return { ok: true, data: undefined }
  },

  /**
   * Extensión futura: OAuth / Magic Link.
   * No modificar la lógica principal de email/password.
   */
  async signInWithProvider(
    provider: FutureAuthProvider
  ): Promise<AuthResult> {
    void provider
    return {
      ok: false,
      error: "Este método de acceso estará disponible próximamente.",
    }
  },

  /** Destino post-login oficial. */
  getPostLoginRedirect(): string {
    return CALCULATOR_ENTRY_HREF
  },
}
