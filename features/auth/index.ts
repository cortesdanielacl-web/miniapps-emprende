export { authService } from "./auth-service"
export { AuthProvider, useAuth } from "./auth-provider"
/** Identidad en cliente. Servidor → session.server.ts */
export { getCurrentUser, getCurrentUserId } from "./session"
export { mapUserToProfile, mapSupabaseUser } from "./profile"
export type {
  AuthCredentials,
  AuthResult,
  AuthUser,
  FutureAuthProvider,
  Profile,
  RegisterCredentials,
} from "./types"
