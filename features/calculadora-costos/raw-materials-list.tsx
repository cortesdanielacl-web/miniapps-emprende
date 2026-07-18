"use client"

import { useEffect, useRef } from "react"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  formatClp,
  sumRawMaterialsUsedCosts,
} from "@/features/calculadora-costos/calculate"
import {
  emptyRawMaterialLine,
  type CostCalculatorValues,
} from "@/features/calculadora-costos/schema"
import {
  FieldLabel,
  TableField,
  TableUnitSelect,
} from "@/features/calculadora-costos/table-fields"
import { calculateUsedCost } from "@/features/calculadora-costos/units"

function UsedCostCell({ index }: { index: number }) {
  const { control } = useFormContext<CostCalculatorValues>()
  const line = useWatch({ control, name: `rawMaterials.${index}` })
  const usedCost = line ? calculateUsedCost(line) : null
  const display =
    usedCost == null || !Number.isFinite(usedCost) ? "—" : formatClp(usedCost)

  return (
    <span
      className="block font-heading text-base font-semibold text-heading tabular-nums"
      aria-live="polite"
      title="Calculado automáticamente"
    >
      {display}
    </span>
  )
}

export function RawMaterialsList() {
  const { control, setFocus, setValue } =
    useFormContext<CostCalculatorValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rawMaterials",
  })
  const items = useWatch({ control, name: "rawMaterials" }) ?? []
  const total = sumRawMaterialsUsedCosts(items)
  const scrollRef = useRef<HTMLDivElement>(null)
  const previousCount = useRef(fields.length)

  useEffect(() => {
    if (fields.length === 0) {
      append({ ...emptyRawMaterialLine }, { shouldFocus: false })
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

  function handleAddIngredient() {
    const nextIndex = fields.length
    append({ ...emptyRawMaterialLine })
    requestAnimationFrame(() => {
      setFocus(`rawMaterials.${nextIndex}.name`)
    })
  }

  function handleRemoveIngredient(index: number) {
    if (fields.length <= 1) {
      setValue("rawMaterials.0", { ...emptyRawMaterialLine }, {
        shouldDirty: true,
        shouldValidate: false,
      })
      setFocus("rawMaterials.0.name")
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
                Insumo {index + 1}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveIngredient(index)}
                aria-label={
                  fields.length <= 1
                    ? `Limpiar insumo ${index + 1}`
                    : `Eliminar insumo ${index + 1}`
                }
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-4">
              <div className="sm:col-span-2 lg:col-span-4">
                <FieldLabel>Nombre del insumo</FieldLabel>
                <TableField
                  name={`rawMaterials.${index}.name`}
                  aria-label={`Insumo ${index + 1}`}
                  placeholder="Ej. Harina, Tela, Filamento PLA, Madera, Papel, Tinta..."
                />
              </div>

              <div className="lg:col-span-3">
                <FieldLabel>Precio compra</FieldLabel>
                <TableField
                  name={`rawMaterials.${index}.purchasePrice`}
                  aria-label={`Precio de compra ${index + 1}`}
                  type="number"
                  placeholder="0"
                />
              </div>

              <div className="lg:col-span-5">
                <FieldLabel>Cantidad compra</FieldLabel>
                <div className="flex items-center gap-1.5">
                  <TableField
                    name={`rawMaterials.${index}.purchaseQuantity`}
                    aria-label={`Cantidad comprada ${index + 1}`}
                    type="number"
                    placeholder="0"
                    className="min-w-0 flex-1"
                  />
                  <TableUnitSelect
                    name={`rawMaterials.${index}.purchaseUnit`}
                    aria-label={`Unidad de compra ${index + 1}`}
                  />
                </div>
              </div>

              <div className="lg:col-span-5">
                <FieldLabel>Cantidad usada</FieldLabel>
                <div className="flex items-center gap-1.5">
                  <TableField
                    name={`rawMaterials.${index}.usedQuantity`}
                    aria-label={`Cantidad usada ${index + 1}`}
                    type="number"
                    placeholder="0"
                    className="min-w-0 flex-1"
                  />
                  <TableUnitSelect
                    name={`rawMaterials.${index}.usedUnit`}
                    aria-label={`Unidad usada ${index + 1}`}
                  />
                </div>
              </div>

              <div className="flex flex-col justify-end lg:col-span-3">
                <FieldLabel>Costo utilizado</FieldLabel>
                <div className="flex h-10 items-center">
                  <UsedCostCell index={index} />
                </div>
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
          onClick={handleAddIngredient}
        >
          <PlusIcon className="size-4" aria-hidden="true" />
          Agregar insumo
        </Button>
        <p className="text-sm font-medium tabular-nums sm:text-right">
          <span className="text-muted-foreground">Total Materiales e Insumos </span>
          <span className="font-heading text-base font-semibold text-heading">
            {formatClp(total)}
          </span>
        </p>
      </div>
    </div>
  )
}
