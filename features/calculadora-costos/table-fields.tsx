"use client"

import type { ReactNode } from "react"
import {
  Controller,
  useFormContext,
  type FieldPath,
  type PathValue,
} from "react-hook-form"

import { Input } from "@/components/ui/input"
import type { CostCalculatorValues } from "@/features/calculadora-costos/schema"
import { UNITS, type Unit } from "@/features/calculadora-costos/units"
import { cn } from "@/lib/utils"

const cellInputClass =
  "h-11 min-w-0 max-w-full rounded-2xl border border-[#E8EEF5] px-2.5 text-base sm:h-10 sm:text-sm"

const cellSelectClass = cn(
  "h-11 w-full min-w-[3.5rem] max-w-[5.5rem] shrink-0 rounded-2xl border border-[#E8EEF5] bg-card px-1.5 text-base outline-none transition-all duration-200 sm:h-10 sm:min-w-[3.5rem] sm:max-w-[5.5rem] sm:px-2 sm:text-sm",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
)

type StringFieldPath = {
  [K in FieldPath<CostCalculatorValues>]: PathValue<
    CostCalculatorValues,
    K
  > extends string
    ? K
    : never
}[FieldPath<CostCalculatorValues>]

type UnitFieldPath = {
  [K in FieldPath<CostCalculatorValues>]: PathValue<
    CostCalculatorValues,
    K
  > extends Unit
    ? K
    : never
}[FieldPath<CostCalculatorValues>]

type TableFieldProps = {
  name: StringFieldPath
  "aria-label": string
  type?: "text" | "number"
  placeholder?: string
  className?: string
}

export function TableField({
  name,
  "aria-label": ariaLabel,
  type = "text",
  placeholder,
  className,
}: TableFieldProps) {
  const { control } = useFormContext<CostCalculatorValues>()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Input
          {...field}
          value={field.value ?? ""}
          type={type}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-invalid={Boolean(fieldState.error) || undefined}
          title={fieldState.error?.message}
          className={cn(
            cellInputClass,
            fieldState.error && "border-destructive",
            className
          )}
        />
      )}
    />
  )
}

type TableUnitSelectProps = {
  name: UnitFieldPath
  "aria-label": string
}

export function TableUnitSelect({
  name,
  "aria-label": ariaLabel,
}: TableUnitSelectProps) {
  const { control } = useFormContext<CostCalculatorValues>()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <select
          aria-label={ariaLabel}
          aria-invalid={Boolean(fieldState.error) || undefined}
          title={fieldState.error?.message}
          className={cn(
            cellSelectClass,
            fieldState.error && "border-destructive"
          )}
          value={field.value}
          onChange={(event) => field.onChange(event.target.value as Unit)}
          onBlur={field.onBlur}
          ref={field.ref}
          name={field.name}
        >
          {UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      )}
    />
  )
}

type FieldLabelProps = {
  children: ReactNode
  className?: string
}

export function FieldLabel({ children, className }: FieldLabelProps) {
  return (
    <span
      className={cn(
        "mb-1.5 block text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase",
        className
      )}
    >
      {children}
    </span>
  )
}
