import { InboxIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type EmptyStateProps = React.ComponentProps<"div"> & {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

/**
 * Reusable empty state for lists, results, and placeholders.
 */
function EmptyState({
  className,
  title,
  description,
  icon,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center",
        className
      )}
      {...props}
    >
      <div
        className="flex size-12 items-center justify-center rounded-full bg-background text-muted-foreground ring-1 ring-border"
        aria-hidden="true"
      >
        {icon ?? <InboxIcon className="size-5" />}
      </div>
      <div className="space-y-1">
        <h3 className="font-heading text-base font-semibold text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}

export { EmptyState, type EmptyStateProps }
