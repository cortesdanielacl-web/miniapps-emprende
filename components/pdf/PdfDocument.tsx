import { Document, Page, StyleSheet, View } from "@react-pdf/renderer"

import { PdfCover } from "@/components/pdf/PdfCover"
import { PdfFooter } from "@/components/pdf/PdfFooter"
import { PdfRecommendation } from "@/components/pdf/PdfRecommendation"
import { PdfSection } from "@/components/pdf/PdfSection"
import { PdfSummary } from "@/components/pdf/PdfSummary"
import { PdfTable } from "@/components/pdf/PdfTable"
import { PdfKpiCard } from "@/components/pdf/PdfKpiCard"
import type { PdfReportDefinition } from "@/components/pdf/types"
import { pdfColors, pdfSpacing } from "@/components/pdf/theme"

const styles = StyleSheet.create({
  page: {
    paddingTop: pdfSpacing.pageTop,
    paddingBottom: pdfSpacing.pageBottom,
    paddingHorizontal: pdfSpacing.pageX,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: pdfColors.body,
    backgroundColor: pdfColors.white,
  },
  stack: {
    gap: 18,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
})

export type PdfDocumentProps = {
  definition: PdfReportDefinition
}

/**
 * Motor de documento PDF.
 * Solo conoce la forma de PdfReportDefinition — nunca el producto de origen.
 */
export function PdfDocument({ definition }: PdfDocumentProps) {
  const {
    brand,
    title,
    subtitle,
    productName,
    generatedAtLabel,
    documentTitle,
    kpis = [],
    accentKpiIndexes = [],
    sections = [],
    summary,
    recommendations,
    recommendationsTitle,
  } = definition

  const accent = brand.color
  const metaTitle = documentTitle ?? `${title} — ${productName}`

  return (
    <Document
      title={metaTitle}
      author={brand.name}
      subject={title}
      creator={brand.name}
    >
      <Page size="A4" style={styles.page}>
        <PdfCover
          title={title}
          subtitle={subtitle}
          productName={productName}
          dateLabel={generatedAtLabel}
          logo={brand.logoSrc}
          brandName={brand.name}
          brandColor={accent}
          brandWebsite={brand.website}
        />
        <PdfFooter
          brandName={brand.name}
          website={brand.website}
          dateLabel={generatedAtLabel}
        />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.stack}>
          {kpis.length > 0 ? (
            <PdfSection title="Resumen ejecutivo">
              <View style={styles.kpiGrid}>
                {kpis.map((kpi, index) => {
                  const isLastOdd =
                    kpis.length % 2 === 1 && index === kpis.length - 1
                  const color =
                    kpi.color ??
                    (accentKpiIndexes.includes(index) ? accent : undefined)

                  return (
                    <PdfKpiCard
                      key={`${kpi.label}-${index}`}
                      title={kpi.label}
                      value={kpi.value}
                      color={color}
                      width={isLastOdd ? "100%" : "48.5%"}
                    />
                  )
                })}
              </View>
            </PdfSection>
          ) : null}

          {sections.map((section) => (
            <PdfSection
              key={section.id}
              title={section.title}
              description={section.description}
            >
              {section.kpis && section.kpis.length > 0 ? (
                <View style={styles.kpiGrid}>
                  {section.kpis.map((kpi, index) => (
                    <PdfKpiCard
                      key={`${section.id}-${kpi.label}-${index}`}
                      title={kpi.label}
                      value={kpi.value}
                      color={kpi.color}
                      width={
                        section.kpis!.length % 2 === 1 &&
                        index === section.kpis!.length - 1
                          ? "100%"
                          : "48.5%"
                      }
                    />
                  ))}
                </View>
              ) : null}
              {section.table ? (
                <PdfTable
                  columns={section.table.columns}
                  rows={section.table.rows}
                  totals={section.table.totals}
                  accentColor={accent}
                />
              ) : null}
            </PdfSection>
          ))}

          {summary && summary.items.length > 0 ? (
            <PdfSection title={summary.title ?? "Resumen"}>
              <PdfSummary
                items={summary.items}
                variant={summary.variant ?? "panel"}
                accentColor={accent}
              />
            </PdfSection>
          ) : null}

          {recommendations ? (
            <PdfRecommendation
              title={recommendationsTitle}
              text={recommendations}
              accentColor={accent}
            />
          ) : null}
        </View>

        <PdfFooter
          brandName={brand.name}
          website={brand.website}
          dateLabel={generatedAtLabel}
        />
      </Page>
    </Document>
  )
}
