import type { Metadata } from "next"
import { Suspense } from "react"

import { AuthShell } from "@/features/auth/components/auth-shell"
import { LoginForm } from "@/features/auth/components/login-form"

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta de MiniApps Emprende.",
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Iniciar sesión"
      description="Accede a tu cuenta para usar tus MiniApps y licencias."
    >
      <Suspense
        fallback={
          <p className="text-center text-sm text-muted-foreground">
            Cargando…
          </p>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
