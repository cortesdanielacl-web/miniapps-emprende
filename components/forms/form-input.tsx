import * as React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FormInputProps = Omit<React.ComponentProps<"input">, "id"> & {
  label: string
  id: string
  error?: string
  hint?: string
  containerClassName?: string
}

/**
 * Accessible input with label, placeholder support, and error message.
 * Works standalone or with React Hook Form via FormField / register.
 */
const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  function FormInput(
    {
      id,
      label,
      error,
      hint,
      className,
      containerClassName,
      required,
      ...props
    },
    ref
  ) {
    const describedBy = error
      ? `${id}-error`
      : hint
        ? `${id}-hint`
        : undefined

    return (
      <div
        data-slot="form-input"
        className={cn("flex w-full flex-col gap-2", containerClassName)}
      >
        <Label htmlFor={id} className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
          {required ? (
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          ) : null}
        </Label>
        <Input
          ref={ref}
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={className}
          {...props}
        />
        {hint && !error ? (
          <p id={`${id}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p
            id={`${id}-error`}
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            {error}
          </p>
        ) : null}
      </div>
    )
  }
)

export { FormInput, type FormInputProps }
