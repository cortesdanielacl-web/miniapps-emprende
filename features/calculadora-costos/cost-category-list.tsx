"use client"

import { useEffect, useRef } from "react"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  formatClp,
  sumCategoryCosts,
} from "@/features/calculadora-costos/calculate"
import {
  emptyCostLine,
  type CostCalculatorValues,
} from "@/features/calculadora-costos/schema"
import {
  FieldLabel,
  TableField,
} from "@/features/calculadora-costos/table-fields"

type CostCategoryKey = "laborItems" | "indirectItems"

type CostCategoryListProps = {
  name: CostCategoryKey
  nameHeader: string
  namePlaceholder: string
  addLabel: string
  totalLabel: string
}

export function CostCategoryList({
  name,
  nameHeader,
  namePlaceholder,
  addLabel,
  totalLabel,
}: CostCategoryListProps) {
  const { control, setFocus, setValue } =
    useFormContext<CostCalculatorValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  })
  const items = useWatch({ control, name }) ?? []
  const total = sumCategoryCosts(items)
  const scrollRef = useRef<HTMLDivElement>(null)
  const previousCount = useRef(fields.length)

  useEffect(() => {
    if (fields.length === 0) {
      append({ ...emptyCostLine }, { shouldFocus: false })
    }
  }, [fields.length, append])

  useEffect(() => {
    if (fields.length > previousCount.current) {
      const container = scrollRef.current
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        })
      }
    }
    previousCount.current = fields.length
  }, [fields.length])

  function handleAdd() {
    const nextIndex = fields.length
    append({ ...emptyCostLine })
    requestAnimationFrame(() => {
      setFocus(`${name}.${nextIndex}.name`)
    })
  }

  function handleRemove(index: number) {
    if (fields.length <= 1) {
      if (name === "laborItems") {
        setValue("laborItems.0", { ...emptyCostLine }, {
          shouldDirty: true,
          shouldValidate: false,
        })
        setFocus("laborItems.0.name")
      } else {
        setValue("indirectItems.0", { ...emptyCostLine }, {
          shouldDirty: true,
          shouldValidate: false,
        })
        setFocus("indirectItems.0.name")
      }
      return
    }
    remove(index)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1"
      >
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-2xl border border-[#E8EEF5] bg-white p-4 sm:p-5"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {nameHeader} {index + 1}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemove(index)}
                aria-label={
                  fields.length <= 1
                    ? `Limpiar ${nameHeader.toLowerCase()} ${index + 1}`
                    : `Eliminar ${nameHeader.toLowerCase()} ${index + 1}`
                }
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>

            <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_7rem]">
              <div>
                <FieldLabel>{nameHeader}</FieldLabel>
                <TableField
                  name={`${name}.${index}.name`}
                  aria-label={`${nameHeader} ${index + 1}`}
                  placeholder={namePlaceholder}
                />
              </div>
              <div>
                <FieldLabel>Costo</FieldLabel>
                <TableField
                  name={`${name}.${index}.cost`}
                  aria-label={`Costo ${index + 1}`}
                  type="number"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex shrink-0 flex-col gap-4 border-t border-[#E8EEF5] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          className="w-full border-brand-turquoise bg-transparent text-brand-turquoise shadow-none hover:bg-brand-turquoise/12 hover:text-brand-turquoise sm:w-auto"
          onClick={handleAdd}
        >
          <PlusIcon className="size-4" aria-hidden="true" />
          {addLabel}
        </Button>
        <p className="text-sm font-medium tabular-nums sm:text-right">
          <span className="text-muted-foreground">{totalLabel} </span>
          <span className="font-heading text-base font-semibold text-heading">
            {formatClp(total)}
          </span>
        </p>
      </div>
    </div>
  )
}
