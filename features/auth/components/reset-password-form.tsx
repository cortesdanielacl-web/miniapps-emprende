"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Form, FormField } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { authService } from "@/features/auth/auth-service"

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

type ResetValues = z.infer<typeof resetSchema>

/**
 * Define nueva contraseña tras el enlace de recovery de Supabase.
 * Requiere sesión de recuperación (exchangeCodeForSession en /auth/confirm).
 */
export function ResetPasswordForm() {
  const router = useRouter()
  const [sessionReady, setSessionReady] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    let cancelled = false

    async function resolveSession() {
      const authenticated = await authService.isAuthenticated()
      if (!cancelled) {
        setSessionReady(authenticated)
        setCheckingSession(false)
      }
    }

    void resolveSession()

    const subscription = authService.onAuthStateChange((event) => {
      if (cancelled) return
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setSessionReady(true)
        setCheckingSession(false)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  async function onSubmit(values: ResetValues) {
    setFormError(null)

    const result = await authService.updatePassword(values.password)
    if (!result.ok) {
      setFormError(result.error)
      return
    }

    await authService.logout()
    router.replace("/login?reset=success")
    router.refresh()
  }

  if (checkingSession) {
    return (
      <p className="text-center text-sm text-muted-foreground" aria-live="polite">
        Validando enlace de recuperación…
      </p>
    )
  }

  if (!sessionReady) {
    return (
      <div className="space-y-5 text-center">
        <p className="text-sm text-muted-foreground" role="alert">
          El enlace de recuperación no es válido o ya expiró. Solicita uno
          nuevo.
        </p>
        <Button asChild variant="primary" size="lg" className="w-full">
          <Link href="/forgot-password">Solicitar nuevo enlace</Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    )
  }

  return (
    <Form form={form} onSubmit={onSubmit} className="gap-5">
      <FormField
        name="password"
        label="Nueva contraseña"
        type="password"
        autoComplete="new-password"
        placeholder="Mínimo 8 caracteres"
        required
      />
      <FormField
        name="confirmPassword"
        label="Confirmar contraseña"
        type="password"
        autoComplete="new-password"
        placeholder="Repite tu contraseña"
        required
      />

      {formError ? (
        <p className="text-sm font-medium text-destructive" role="alert">
          {formError}
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
          ? "Guardando…"
          : "Guardar contraseña"}
      </Button>
    </Form>
  )
}
