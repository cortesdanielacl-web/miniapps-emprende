/**
 * Modelos de autenticación y perfil.
 * Profile queda preparado; la edición de perfil no se implementa aún.
 */

export type AuthUser = {
  id: string
  email: string | null
  name: string | null
}

export type Profile = {
  id: string
  name: string
  email: string
  createdAt: string
}

export type AuthCredentials = {
  email: string
  password: string
}

export type RegisterCredentials = AuthCredentials & {
  name: string
}

export type AuthResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string }

/** Proveedores OAuth futuros (Google, Microsoft, Magic Link). */
export type FutureAuthProvider = "google" | "azure" | "magic-link"
