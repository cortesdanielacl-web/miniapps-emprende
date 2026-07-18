import { CircleDollarSignIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ResultCardProps = React.ComponentProps<"div"> & {
  title: string
  description?: string
  /** Main result value or content */
  result?: React.ReactNode
  footer?: React.ReactNode
  /** Visual tone for the result highlight */
  tone?: "default" | "success" | "warning" | "info"
}

const toneTextClasses = {
  default: "text-heading",
  success: "text-success",
  warning: "text-foreground",
  info: "text-primary",
} as const

const toneSurfaceClasses = {
  default: "",
  success: "",
  warning: "rounded-2xl border border-warning/40 bg-warning/10 px-3 py-2",
  info: "",
} as const

/**
 * Card premium para resultados — protagonista visual de cada miniapp.
 */
function ResultCard({
  className,
  title,
  description,
  result,
  footer,
  tone = "default",
  children,
  ...props
}: ResultCardProps) {
  return (
    <Card
      data-slot="result-card"
      className={cn(
        "w-full border-border/70 shadow-[var(--shadow-result)] ring-0",
        className
      )}
      {...props}
    >
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl">
          <CircleDollarSignIcon
            className="size-5 shrink-0 text-brand-navy sm:size-6"
            aria-hidden="true"
          />
          {title}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-6 sm:space-y-8">
        {result != null ? (
          <div
            className={cn(
              "font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl",
              toneTextClasses[tone],
              toneSurfaceClasses[tone]
            )}
          >
            {result}
          </div>
        ) : null}
        {children}
      </CardContent>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  )
}

export { ResultCard, type ResultCardProps }
