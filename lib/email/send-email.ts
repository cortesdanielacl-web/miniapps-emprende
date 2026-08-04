/**
 * Envío de correo transaccional (servidor).
 * Usa Resend REST API cuando RESEND_API_KEY está definida.
 * Sin key: registra en log y no falla el flujo de negocio.
 */

import "server-only"

import { logSecurityError } from "@/lib/security-log"

export type SendEmailInput = {
  to: string | string[]
  subject: string
  text: string
  /** Remitente opcional. Por defecto EMAIL_FROM o onboarding Resend. */
  from?: string
}

function getFromAddress(): string {
  return (
    process.env.EMAIL_FROM?.trim() ||
    "MiniApps Emprende <onboarding@resend.dev>"
  )
}

/**
 * Envía un correo. Nunca lanza: el caller decide el impacto de negocio.
 * @returns true si se envió (o se aceptó la API); false si se omitió/falló.
 */
export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const to = Array.isArray(input.to) ? input.to : [input.to]
  const from = input.from?.trim() || getFromAddress()

  if (!apiKey) {
    console.info("[email] RESEND_API_KEY ausente — correo no enviado:", {
      to,
      subject: input.subject,
    })
    return false
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: input.subject,
        text: input.text,
      }),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => "")
      logSecurityError(
        "sendEmail",
        new Error(`resend_${response.status}`),
        body.slice(0, 200)
      )
      return false
    }

    return true
  } catch (error) {
    logSecurityError("sendEmail", error, "send failed")
    return false
  }
}
