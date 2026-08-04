import type { Metadata } from "next"

import { AuthShell } from "@/features/auth/components/auth-shell"
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form"

export const metadata: Metadata = {
  title: "Nueva contraseña",
  description: "Define una nueva contraseña para tu cuenta de MiniApps Emprende.",
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Nueva contraseña"
      description="Elige una contraseña segura para volver a acceder a tu cuenta."
    >
      <ResetPasswordForm />
    </AuthShell>
  )
}
