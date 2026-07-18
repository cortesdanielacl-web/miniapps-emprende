import Image from "next/image"

import { cn } from "@/lib/utils"

type BrandLogoProps = {
  className?: string
  /** Visual size of the mark */
  size?: "sm" | "md" | "lg"
}

/** Display height in px — desktop target 56–64px; width follows intrinsic aspect ratio. */
const sizeConfig = {
  sm: { className: "h-14 w-auto", sizes: "63px" },
  md: { className: "h-14 w-auto sm:h-16", sizes: "(min-width: 640px) 72px, 63px" },
  lg: { className: "h-16 w-auto", sizes: "72px" },
} as const

const LOGO_SRC = "/logo-miniapps.png"
const LOGO_WIDTH = 972
const LOGO_HEIGHT = 864

/**
 * Logo oficial MiniApps Emprende — marca reutilizable en todo el ecosistema.
 */
function BrandLogo({ className, size = "md" }: BrandLogoProps) {
  const config = sizeConfig[size]

  return (
    <Image
      data-slot="brand-logo"
      src={LOGO_SRC}
      alt=""
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      sizes={config.sizes}
      priority
      className={cn(
        "shrink-0 object-contain",
        config.className,
        className
      )}
    />
  )
}

export { BrandLogo, type BrandLogoProps }
