export function formatBackofficeAmount(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatBackofficeDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-CL", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function statusLabel(
  status: "pending" | "activated" | "cancelled"
): string {
  if (status === "activated") return "Activada"
  if (status === "cancelled") return "Cancelada"
  return "Pendiente"
}

export function statusEmoji(
  status: "pending" | "activated" | "cancelled"
): string {
  if (status === "activated") return "🟢"
  if (status === "cancelled") return "🔴"
  return "🟡"
}
