"use client"

import { useEffect, useState, type ComponentType } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import {
  LightbulbIcon,
  PackageIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react"

import { Form, FormField } from "@/components/forms"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { COMMERCIAL } from "@/config/commercial"
import { CalculatorResultsReport } from "@/features/calculadora-costos/calculator-results-report"
import { CostCategoryList } from "@/features/calculadora-costos/cost-category-list"
import {
  calculateCostPreview,
  type CostPreview,
} from "@/features/calculadora-costos/cost-preview"
import type { ProfessionalReport } from "@/features/calculadora-costos/professional-report"
import {
  PricingDecision,
  type PricingResolution,
} from "@/features/calculadora-costos/pricing-decision"
import { RawMaterialsList } from "@/features/calculadora-costos/raw-materials-list"
import { ReportUnlockScreen } from "@/features/calculadora-costos/report-unlock-screen"
import {
  costCalculatorDefaultValues,
  costCalculatorSchema,
  type CostCalculatorValues,
} from "@/features/calculadora-costos/schema"
import { fetchProfessionalReport } from "@/features/calculadora-costos/services/fetch-professional-report"
import { savePendingCheckoutContext } from "@/features/calculadora-costos/services/report-checkout"
import { useProductAccess } from "@/features/licensing/use-product-access"
import { cn } from "@/lib/utils"

const workspaceCardClass =
  "min-w-0 overflow-hidden rounded-[18px] border border-[#E8EEF5] bg-[#F7FAFF] px-3 sm:px-8"

function SectionIcon({
  icon: Icon,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>
}) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-turquoise/12 text-brand-turquoise sm:size-12">
      <Icon className="size-5 sm:size-6" aria-hidden={true} />
    </span>
  )
}

function SectionCount({
  count,
  singular = "elemento",
  plural = "elementos",
}: {
  count: number
  singular?: string
  plural?: string
}) {
  return (
    <span className="inline-flex w-fit items-center rounded-full bg-brand-turquoise/12 px-2.5 py-0.5 text-xs font-semibold text-brand-turquoise tabular-nums">
      {count} {count === 1 ? singular : plural}
    </span>
  )
}

export function CostCalculatorForm() {
  const { hasAccess, isLoading: accessLoading } = useProductAccess(
    COMMERCIAL.productId
  )
  /** Solo existe tras respuesta autorizada de /api/professional-report. */
  const [professionalReport, setProfessionalReport] =
    useState<ProfessionalReport | null>(null)
  /** Vista previa pública — calculada en cliente, sin premium. */
  const [preview, setPreview] = useState<CostPreview | null>(null)
  const [calculatedValues, setCalculatedValues] =
    useState<CostCalculatorValues | null>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)
  const [openSection, setOpenSection] = useState("materia-prima")
  const [costRunId, setCostRunId] = useState(0)
  const [pricingResolution, setPricingResolution] =
    useState<PricingResolution | null>(null)

  const form = useForm<CostCalculatorValues>({
    resolver: zodResolver(costCalculatorSchema),
    defaultValues: costCalculatorDefaultValues,
  })

  const rawMaterials = useWatch({
    control: form.control,
    name: "rawMaterials",
  })
  const laborItems = useWatch({
    control: form.control,
    name: "laborItems",
  })
  const indirectItems = useWatch({
    control: form.control,
    name: "indirectItems",
  })

  const rawCount = rawMaterials?.length ?? 0
  const laborCount = laborItems?.length ?? 0
  const indirectCount = indirectItems?.length ?? 0

  async function onSubmit(values: CostCalculatorValues) {
    setCalculatedValues(values)
    setPricingResolution(null)
    setProfessionalReport(null)
    setReportError(null)
    setCostRunId((runId) => runId + 1)
    // Solo inputs — nunca ProfessionalReport en sessionStorage.
    savePendingCheckoutContext({ values })

    // Nivel 1: siempre CostPreview en cliente (sin pricing premium).
    const nextPreview = calculateCostPreview(values)
    setPreview(nextPreview)
    requestAnimationFrame(() => {
      document
        .getElementById("precio-margen")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  function withPricing(
    values: CostCalculatorValues
  ): CostCalculatorValues {
    return {
      ...values,
      desiredMargin: pricingResolution?.desiredMargin ?? "",
      pricingPath: pricingResolution?.pricingPath,
      appliedMarkup: pricingResolution?.appliedMarkup ?? "",
    }
  }

  useEffect(() => {
    if (!hasAccess || !calculatedValues || !pricingResolution) {
      return
    }

    const values = withPricing(calculatedValues)
    savePendingCheckoutContext({ values })

    let cancelled = false
    const timeoutId = window.setTimeout(() => {
      setReportError(null)
      setReportLoading(true)
      void fetchProfessionalReport(values)
        .then((report) => {
          if (cancelled) return
          setProfessionalReport(report)
        })
        .catch(() => {
          if (cancelled) return
          setProfessionalReport(null)
          setReportError(
            "No se pudo obtener el Informe Profesional. Verifica tu licencia e inténtalo de nuevo."
          )
        })
        .finally(() => {
          if (!cancelled) setReportLoading(false)
        })
    }, 400)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [calculatedValues, hasAccess, pricingResolution])

  function handlePricingResolved(resolution: PricingResolution | null) {
    setPricingResolution(resolution)
    if (!resolution) {
      setProfessionalReport(null)
    }
    if (calculatedValues) {
      savePendingCheckoutContext({
        values: {
          ...calculatedValues,
          desiredMargin: resolution?.desiredMargin ?? "",
          pricingPath: resolution?.pricingPath,
          appliedMarkup: resolution?.appliedMarkup ?? "",
        },
      })
    }
  }

  function handleNewCalculation() {
    form.reset(costCalculatorDefaultValues)
    setCalculatedValues(null)
    setProfessionalReport(null)
    setPreview(null)
    setPricingResolution(null)
    setReportError(null)
    setOpenSection("materia-prima")
    form.setFocus("productName")
  }

  const showUnlockGate =
    preview !== null && calculatedValues !== null && !hasAccess
  const showFullReport =
    professionalReport !== null && calculatedValues !== null && hasAccess

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-8 sm:gap-20 lg:gap-24">
      {/* Hero */}
      <header className="min-w-0 overflow-hidden rounded-[18px] bg-gradient-to-br from-[#2563EB] to-[#14B8A6] px-4 py-6 sm:px-12 sm:py-8 lg:px-14 lg:py-9">
        <div className="max-w-2xl space-y-2.5 sm:space-y-4">
          <h1 className="font-heading text-[1.5rem] font-bold leading-tight tracking-tight text-white break-words sm:text-4xl sm:leading-normal lg:text-[2.5rem] lg:leading-[1.15]">
            Calcula el precio correcto de tus productos.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-white/90 sm:text-lg">
            Costo real, IVA y precio sugerido en minutos.
          </p>
        </div>
      </header>

      <Form form={form} onSubmit={onSubmit} className="gap-8 sm:gap-16">
        {/* Producto */}
        <section className={cn(workspaceCardClass, "space-y-5 py-5 sm:space-y-6 sm:py-8")}>
          <div className="flex items-start gap-3 sm:gap-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-turquoise/12 text-brand-turquoise sm:size-12">
              <TagIcon className="size-5 sm:size-6" aria-hidden={true} />
            </span>
            <div className="min-w-0 space-y-1.5">
              <h2 className="font-heading text-base font-semibold text-heading sm:text-xl">
                Tu producto
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Define qué vas a vender.
              </p>
            </div>
          </div>
          <div className="grid max-w-md gap-5">
            <FormField
              name="productName"
              label="Nombre del producto"
              placeholder="Ej. Vela artesanal"
              required
            />
          </div>
        </section>

        {/* Workspace */}
        <section className="space-y-5 sm:space-y-9">
          <div className="space-y-1.5">
            <h2 className="font-heading text-base font-semibold text-heading sm:text-xl">
              Construye tus costos
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Agrega cada pieza de tu producto, paso a paso.
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            value={openSection}
            onValueChange={setOpenSection}
            className="gap-4 sm:gap-7"
          >
            <AccordionItem
              value="materia-prima"
              className={cn(
                workspaceCardClass,
                "border-t-[3px] border-t-brand-turquoise"
              )}
            >
              <AccordionTrigger className="gap-2 py-4 sm:gap-4 sm:py-7">
                <span className="flex min-w-0 flex-1 items-center gap-2.5 pr-1 sm:gap-4 sm:pr-3">
                  <SectionIcon icon={PackageIcon} />
                  <span className="flex min-w-0 flex-col gap-1 text-left sm:gap-1.5">
                    <span className="font-heading text-[0.95rem] font-semibold text-heading break-words sm:text-lg">
                      Materiales e Insumos
                    </span>
                    <SectionCount
                      count={rawCount}
                      singular="insumo"
                      plural="insumos"
                    />
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="h-auto pb-5 sm:pb-9">
                <div className="flex min-h-0 flex-col overflow-hidden border-t border-[#E8EEF5] pt-5 sm:pt-7">
                  <p className="mb-4 shrink-0 text-sm leading-relaxed text-muted-foreground sm:mb-6">
                    Ejemplos: harina, madera, tela, filamento 3D, tinta, papel,
                    cera, resina, envases, pegamento, pintura, licencias
                    digitales.
                  </p>
                  <div className="min-h-0 min-w-0">
                    <RawMaterialsList />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="mano-obra"
              className={cn(
                workspaceCardClass,
                "border-t-[3px] border-t-brand-turquoise"
              )}
            >
              <AccordionTrigger className="gap-2 py-4 sm:gap-4 sm:py-7">
                <span className="flex min-w-0 flex-1 items-center gap-2.5 pr-1 sm:gap-4 sm:pr-3">
                  <SectionIcon icon={UsersIcon} />
                  <span className="flex min-w-0 flex-col gap-1 text-left sm:gap-1.5">
                    <span className="font-heading text-[0.95rem] font-semibold text-heading break-words sm:text-lg">
                      Mano de Obra
                    </span>
                    <SectionCount count={laborCount} />
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="h-auto pb-5 sm:pb-9">
                <div className="flex min-h-0 flex-col overflow-hidden border-t border-[#E8EEF5] pt-5 sm:pt-7">
                  <p className="mb-4 shrink-0 text-sm leading-relaxed text-muted-foreground sm:mb-6">
                    Ejemplos: preparación, fabricación, armado, decoración,
                    envasado, despacho.
                  </p>
                  <div className="min-h-0 min-w-0">
                    <CostCategoryList
                      name="laborItems"
                      nameHeader="Tarea"
                      namePlaceholder="Ej. Preparación"
                      addLabel="Agregar tarea"
                      totalLabel="Total Mano de Obra"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="costos-indirectos"
              className={cn(
                workspaceCardClass,
                "border-t-[3px] border-t-brand-turquoise"
              )}
            >
              <AccordionTrigger className="gap-2 py-4 sm:gap-4 sm:py-7">
                <span className="flex min-w-0 flex-1 items-center gap-2.5 pr-1 sm:gap-4 sm:pr-3">
                  <SectionIcon icon={LightbulbIcon} />
                  <span className="flex min-w-0 flex-col gap-1 text-left sm:gap-1.5">
                    <span className="font-heading text-[0.95rem] font-semibold text-heading break-words sm:text-lg">
                      Costos Indirectos
                    </span>
                    <SectionCount count={indirectCount} />
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="h-auto pb-5 sm:pb-9">
                <div className="flex min-h-0 flex-col overflow-hidden border-t border-[#E8EEF5] pt-5 sm:pt-7">
                  <p className="mb-4 shrink-0 text-sm leading-relaxed text-muted-foreground sm:mb-6">
                    Ejemplos: luz, agua, gas, arriendo, internet, etiquetas,
                    bolsas, transporte, comisiones.
                  </p>
                  <div className="min-h-0 min-w-0">
                    <CostCategoryList
                      name="indirectItems"
                      nameHeader="Concepto"
                      namePlaceholder="Ej. Electricidad"
                      addLabel="Agregar costo"
                      totalLabel="Total Costos Indirectos"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={accessLoading}
            className="h-12 min-h-11 w-full bg-[#2563EB] px-6 text-base font-semibold shadow-[0_2px_10px_rgb(37_99_235/0.18)] hover:bg-[#1d4ed8] sm:h-14 sm:min-w-[13rem] sm:w-auto sm:px-10"
          >
            Calcular
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 min-h-11 w-full border-[#2563EB] bg-transparent text-[#2563EB] shadow-none hover:bg-[#2563EB]/5 hover:text-[#2563EB] sm:h-14 sm:w-auto"
            onClick={handleNewCalculation}
          >
            Nuevo cálculo
          </Button>
        </div>
      </Form>

      {preview && calculatedValues ? (
        <PricingDecision
          key={costRunId}
          totalCost={preview.totalCost}
          onResolved={handlePricingResolved}
        />
      ) : null}

      {hasAccess && pricingResolution && reportLoading ? (
        <p className="text-center text-sm text-muted-foreground" aria-live="polite">
          Generando informe…
        </p>
      ) : null}

      {reportError ? (
        <p className="text-center text-sm text-destructive" role="alert">
          {reportError}
        </p>
      ) : null}

      {/* Sin licencia: solo CostPreview + pantalla comercial. */}
      {showUnlockGate && preview && calculatedValues ? (
        <ReportUnlockScreen
          preview={preview}
          values={withPricing(calculatedValues)}
        />
      ) : null}

      {/* Con licencia: solo ProfessionalReport de la API. */}
      {showFullReport && professionalReport && calculatedValues ? (
        <CalculatorResultsReport
          report={professionalReport}
          values={withPricing(calculatedValues)}
        />
      ) : null}
    </div>
  )
}
