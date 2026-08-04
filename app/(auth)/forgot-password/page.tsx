import type { Metadata } from "next"

import { AuthShell } from "@/features/auth/components/auth-shell"
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form"

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  description: "Restablece el acceso a tu cuenta de MiniApps Emprende.",
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="¿Olvidaste tu contraseña?"
      description="Te enviaremos instrucciones a tu correo si la cuenta existe."
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
