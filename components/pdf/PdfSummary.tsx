import { StyleSheet, Text, View } from "@react-pdf/renderer"

import { PdfKpiCard } from "@/components/pdf/PdfKpiCard"
import type { PdfKpiItem, PdfSummaryItem } from "@/components/pdf/types"
import { pdfColors } from "@/components/pdf/theme"

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  panel: {
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: pdfColors.ink,
  },
  title: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 14,
  },
  rows: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
    paddingTop: 4,
  },
  label: {
    fontSize: 9,
    color: "rgba(255,255,255,0.72)",
    maxWidth: "58%",
  },
  value: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.white,
    textAlign: "right",
  },
  valueEmphasize: {
    fontSize: 13,
  },
})

export type PdfSummaryProps = {
  title?: string
  items: Array<PdfKpiItem | PdfSummaryItem>
  variant?: "cards" | "panel"
  accentColor?: string
}

/**
 * Resumen reutilizable:
 * - cards → grilla de PdfKpiCard
 * - panel → bloque destacado (resumen final)
 */
export function PdfSummary({
  title,
  items,
  variant = "cards",
  accentColor,
}: PdfSummaryProps) {
  if (variant === "panel") {
    const accent = accentColor ?? pdfColors.soft
    return (
      <View style={styles.panel} wrap={false}>
        {title ? (
          <Text style={[styles.title, { color: accent }]}>{title}</Text>
        ) : null}
        <View style={styles.rows}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            const emphasize =
              "emphasize" in item ? Boolean(item.emphasize) : false
            const color =
              item.color ?? (emphasize || isLast ? accent : undefined)

            return (
              <View
                key={`${item.label}-${index}`}
                style={[styles.row, isLast ? styles.rowLast : {}]}
              >
                <Text style={styles.label}>{item.label}</Text>
                <Text
                  style={[
                    styles.value,
                    emphasize || isLast ? styles.valueEmphasize : {},
                    color ? { color } : {},
                  ]}
                >
                  {item.value}
                </Text>
              </View>
            )
          })}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.grid}>
      {items.map((item, index) => {
        const isLastOdd = items.length % 2 === 1 && index === items.length - 1
        return (
          <PdfKpiCard
            key={`${item.label}-${index}`}
            title={item.label}
            value={item.value}
            color={item.color}
            width={isLastOdd ? "100%" : "48.5%"}
          />
        )
      })}
    </View>
  )
}
