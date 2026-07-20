import { PageContainer } from "@/components/common"
import { cn } from "@/lib/utils"

type LandingSectionProps = {
  id: string
  title: string
  description?: string
  className?: string
  children?: React.ReactNode
}

/**
 * Contenedor de sección de landing — estructura reutilizable.
 */
export function LandingSection({
  id,
  title,
  description,
  className,
  children,
}: LandingSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("py-10 sm:py-16 lg:py-20", className)}
    >
      <PageContainer size="xl">
        <header className={cn("max-w-2xl", children ? "mb-6 sm:mb-10" : null)}>
          <h2
            id={`${id}-title`}
            className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:mt-3 sm:text-base">
              {description}
            </p>
          ) : null}
        </header>
        {children}
      </PageContainer>
    </section>
  )
}
