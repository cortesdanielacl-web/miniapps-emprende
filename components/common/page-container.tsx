import { cn } from "@/lib/utils"

type PageContainerProps = React.ComponentProps<"div"> & {
  /** Max width of the content area. Defaults to `lg`. */
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

const sizeClasses = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
  full: "max-w-none",
} as const

/**
 * Centers page content and constrains width. Mobile-first padding.
 */
function PageContainer({
  className,
  size = "lg",
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      data-slot="page-container"
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { PageContainer, type PageContainerProps }
