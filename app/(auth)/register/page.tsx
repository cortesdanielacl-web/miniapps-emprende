import type { Metadata } from "next"
import { Suspense } from "react"

import { AuthShell } from "@/features/auth/components/auth-shell"
import { RegisterForm } from "@/features/auth/components/register-form"

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta personal en MiniApps Emprende.",
}

export default function RegisterPage() {
  return (
    <AuthShell
      title="Crear cuenta"
      description="Tu cuenta será la identidad oficial para tus licencias."
    >
      <Suspense
        fallback={
          <p className="text-center text-sm text-muted-foreground">
            Cargando…
          </p>
        }
      >
        <RegisterForm />
      </Suspense>
    </AuthShell>
  )
}
