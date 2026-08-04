/**
 * Utilidades de descarga del motor PDF (agnósticas al producto).
 */

export function downloadPdfBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export async function resolvePublicImageAsDataUrl(
  path: string
): Promise<string | null> {
  if (typeof window === "undefined") return null

  try {
    const response = await fetch(`${window.location.origin}${path}`)
    if (!response.ok) return null
    const blob = await response.blob()

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result)
        } else {
          reject(new Error("No se pudo leer la imagen"))
        }
      }
      reader.onerror = () =>
        reject(reader.error ?? new Error("Error de lectura"))
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}
