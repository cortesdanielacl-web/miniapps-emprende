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

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Ingresa tu nombre"),
    email: z.string().trim().email("Ingresa un correo válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

type RegisterValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: RegisterValues) {
    setFormError(null)
    setInfoMessage(null)

    const result = await register({
      name: values.name,
      email: values.email,
      password: values.password,
    })

    if (!result.ok) {
      setFormError(result.error)
      return
    }

    if (result.data.needsEmailConfirmation) {
      setInfoMessage(
        "Cuenta creada. Revisa tu correo para confirmar el registro y luego inicia sesión."
      )
      return
    }

    router.replace(sanitizeNext(searchParams.get("next")))
    router.refresh()
  }

  return (
    <Form form={form} onSubmit={onSubmit} className="gap-5">
      <FormField
        name="name"
        label="Nombre"
        autoComplete="name"
        placeholder="Tu nombre"
        required
      />
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
        {form.formState.isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>
    </Form>
  )
}
