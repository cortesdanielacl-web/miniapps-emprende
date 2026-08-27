import { NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * Diagnóstico temporal: presencia de env (boolean), sin valores.
 * Eliminar tras verificar producción.
 */
export async function GET() {
  return NextResponse.json({
    RESEND_TEST: Boolean(process.env.RESEND_TEST?.trim()),
    RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY?.trim()),
    SUPPORT_EMAIL: Boolean(process.env.SUPPORT_EMAIL?.trim()),
    EMAIL_FROM: Boolean(process.env.EMAIL_FROM?.trim()),
    WEBPAY_API_KEY: Boolean(process.env.WEBPAY_API_KEY?.trim()),
    APP_URL: Boolean(process.env.APP_URL?.trim()),
  })
}
