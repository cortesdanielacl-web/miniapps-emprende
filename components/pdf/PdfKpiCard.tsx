import { StyleSheet, Text, View } from "@react-pdf/renderer"

import { pdfColors } from "@/components/pdf/theme"

const styles = StyleSheet.create({
  card: {
    backgroundColor: pdfColors.soft,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pdfColors.border,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  label: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.ink,
    letterSpacing: -0.2,
  },
})

export type PdfKpiCardProps = {
  title: string
  value: string
  color?: string
  width?: string | number
}

export function PdfKpiCard({
  title,
  value,
  color,
  width = "48.5%",
}: PdfKpiCardProps) {
  return (
    <View style={[styles.card, { width }]} wrap={false}>
      <Text style={styles.label}>{title}</Text>
      <Text style={[styles.value, color ? { color, fontSize: 18 } : {}]}>
        {value}
      </Text>
    </View>
  )
}
