import { NextResponse } from "next/server"

export const runtime = "nodejs"

function summarizedError(body: string, fallback: string): string {
  try {
    const parsed = JSON.parse(body) as { message?: unknown }
    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return parsed.message.trim().slice(0, 200)
    }
  } catch {
    /* body no es JSON */
  }
  const trimmed = body.trim()
  return (trimmed || fallback).slice(0, 200)
}

/**
 * Diagnóstico temporal: un envío de prueba a SUPPORT_EMAIL.
 * Eliminar tras verificar producción.
 */
export async function GET() {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.EMAIL_FROM?.trim()
  const to = process.env.SUPPORT_EMAIL?.trim()

  if (!apiKey || !from || !to) {
    return NextResponse.json({
      success: false,
      status: 500,
      error: "Configuración incompleta",
    })
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
        to: [to],
        subject: "Prueba técnica Resend - MiniApps Emprende",
        text: "Esta es una prueba técnica temporal del envío de correo.",
      }),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => "")
      return NextResponse.json({
        success: false,
        status: response.status,
        error: summarizedError(body, `resend_${response.status}`),
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({
      success: false,
      status: 500,
      error: "Error de red al contactar Resend",
    })
  }
}
