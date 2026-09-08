import "server-only"

import { createHmac, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"
import type { NextResponse } from "next/server"

import {
  isWebpayOperationOutcome,
  WEBPAY_RESULT_COOKIE,
  WEBPAY_RESULT_MAX_AGE_SEC,
  type WebpayConfirmationState,
  type WebpayOperationOutcome,
  type WebpayOperationResult,
} from "@/features/compra/webpay-operation-result"

function getSigningKey(): string | null {
  const key = process.env.WEBPAY_API_KEY?.trim()
  return key || null
}

function signPayload(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url")
}

function signaturesMatch(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) {
    return false
  }
  return timingSafeEqual(left, right)
}

export function serializeWebpayOperationResult(input: {
  outcome: WebpayOperationOutcome
  buyOrder?: string
}): string | null {
  const key = getSigningKey()
  if (!key) {
    return null
  }

  const result: WebpayOperationResult = {
    outcome: input.outcome,
    buyOrder: input.buyOrder?.trim() || undefined,
    iat: Date.now(),
  }

  const payload = Buffer.from(JSON.stringify(result), "utf8").toString(
    "base64url"
  )
  return `${payload}.${signPayload(payload, key)}`
}

export function parseWebpayOperationResult(
  value: string | undefined | null
): WebpayOperationResult | null {
  if (!value) {
    return null
  }

  const key = getSigningKey()
  if (!key) {
    return null
  }

  const separator = value.lastIndexOf(".")
  if (separator <= 0) {
    return null
  }

  const payload = value.slice(0, separator)
  const signature = value.slice(separator + 1)
  if (!payload || !signature) {
    return null
  }

  const expected = signPayload(payload, key)
  if (!signaturesMatch(signature, expected)) {
    return null
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as Partial<WebpayOperationResult>

    if (
      typeof parsed.outcome !== "string" ||
      !isWebpayOperationOutcome(parsed.outcome) ||
      typeof parsed.iat !== "number" ||
      !Number.isFinite(parsed.iat)
    ) {
      return null
    }

    const ageMs = Date.now() - parsed.iat
    if (ageMs < 0 || ageMs > WEBPAY_RESULT_MAX_AGE_SEC * 1000) {
      return null
    }

    const buyOrder =
      typeof parsed.buyOrder === "string" && parsed.buyOrder.trim()
        ? parsed.buyOrder.trim()
        : undefined

    return {
      outcome: parsed.outcome,
      buyOrder,
      iat: parsed.iat,
    }
  } catch {
    return null
  }
}

export function applyWebpayResultCookie(
  response: NextResponse,
  input: { outcome: WebpayOperationOutcome; buyOrder?: string }
): void {
  const serialized = serializeWebpayOperationResult(input)
  if (!serialized) {
    return
  }

  response.cookies.set(WEBPAY_RESULT_COOKIE, serialized, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: WEBPAY_RESULT_MAX_AGE_SEC,
  })
}

export async function readWebpayConfirmationState(): Promise<WebpayConfirmationState> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(WEBPAY_RESULT_COOKIE)?.value
  const parsed = parseWebpayOperationResult(raw)
  return parsed?.outcome ?? "none"
}
