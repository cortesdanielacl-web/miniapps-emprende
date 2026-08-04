"use client"

import Link from "next/link"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Form, FormField } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { authService } from "@/features/auth/auth-service"

const forgotSchema = z.object({
  email: z.string().trim().email("Ingresa un correo válido"),
})

type ForgotValues = z.infer<typeof forgotSchema>

/** Solicita el email de recuperación de contraseña (Supabase Auth). */
export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  const form = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(values: ForgotValues) {
    setFormError(null)
    setInfoMessage(null)

    const result = await authService.requestPasswordReset(values.email)
    if (!result.ok) {
      setFormError(result.error)
      return
    }

    setInfoMessage(
      "Si el correo existe en MiniApps Emprende, recibirás instrucciones para restablecer tu contraseña."
    )
  }

  return (
    <Form form={form} onSubmit={onSubmit} className="gap-5">
      <FormField
        name="email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        placeholder="tu@correo.com"
        required
      />

      {formError ? (
        <p className="text-sm font-medium text-destructive" role="alert">
          {formError}
        </p>
      ) : null}

      {infoMessage ? (
        <p className="text-sm font-medium text-brand-turquoise" role="status">
          {infoMessage}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting
          ? "Enviando…"
          : "Enviar instrucciones"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Volver a iniciar sesión
        </Link>
      </p>
    </Form>
  )
}
