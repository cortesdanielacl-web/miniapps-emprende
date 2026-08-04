"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Form, FormField } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/use-auth"
import { sanitizeNext } from "@/lib/navigation/safe-next"

const loginSchema = z.object({
  email: z.string().trim().email("Ingresa un correo válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
})

type LoginValues = z.infer<typeof loginSchema>

function loginInfoMessage(
  reset: string | null,
  error: string | null
): string | null {
  if (reset === "success") {
    return "Contraseña actualizada. Ya puedes iniciar sesión."
  }
  if (error === "recovery_link_invalid") {
    return "El enlace de recuperación no es válido o expiró. Solicita uno nuevo."
  }
  return null
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)

  const infoMessage = loginInfoMessage(
    searchParams.get("reset"),
    searchParams.get("error")
  )

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginValues) {
    setFormError(null)
    const result = await login(values)

    if (!result.ok) {
      setFormError(result.error)
      return
    }

    const destination = sanitizeNext(searchParams.get("next"))

    router.replace(destination)
    router.refresh()
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
      <FormField
        name="password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        placeholder="Tu contraseña"
        required
      />

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-primary hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {infoMessage ? (
        <p
          className={
            searchParams.get("error")
              ? "text-sm font-medium text-destructive"
              : "text-sm font-medium text-brand-turquoise"
          }
          role={searchParams.get("error") ? "alert" : "status"}
        >
          {infoMessage}
        </p>
      ) : null}

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
        {form.formState.isSubmitting ? "Ingresando…" : "Iniciar sesión"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Crear cuenta
        </Link>
      </p>
    </Form>
  )
}
