import { cn } from "@/lib/utils"

type SectionProps = React.ComponentProps<"section"> & {
  title?: string
  description?: string
  /** Vertical spacing. Defaults to `md`. */
  spacing?: "sm" | "md" | "lg"
}

const spacingClasses = {
  sm: "py-6 sm:py-8",
  md: "py-10 sm:py-14",
  lg: "py-14 sm:py-20",
} as const

/**
 * Reusable section wrapper with optional title and description.
 */
function Section({
  className,
  title,
  description,
  spacing = "md",
  children,
  ...props
}: SectionProps) {
  return (
    <section
      data-slot="section"
      className={cn(spacingClasses[spacing], className)}
      {...props}
    >
      {(title || description) && (
        <header className="mb-6 sm:mb-8">
          {title ? (
            <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </header>
      )}
      {children}
    </section>
  )
}

export { Section, type SectionProps }
