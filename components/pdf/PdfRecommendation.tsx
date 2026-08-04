import { StyleSheet, Text, View } from "@react-pdf/renderer"

import { pdfColors, withAlpha } from "@/components/pdf/theme"

const styles = StyleSheet.create({
  box: {
    marginTop: 4,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pdfColors.border,
  },
  label: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  text: {
    fontSize: 10,
    color: pdfColors.body,
    lineHeight: 1.45,
    marginBottom: 6,
  },
  textLast: {
    marginBottom: 0,
  },
})

export type PdfRecommendationProps = {
  title?: string
  text: string | string[]
  accentColor?: string
}

export function PdfRecommendation({
  title = "Recomendación",
  text,
  accentColor,
}: PdfRecommendationProps) {
  const lines = Array.isArray(text) ? text : [text]
  const accent = accentColor ?? pdfColors.ink

  return (
    <View
      style={[
        styles.box,
        { backgroundColor: accentColor ? withAlpha(accentColor, "10") : pdfColors.soft },
      ]}
      wrap={false}
    >
      <Text style={[styles.label, { color: accent }]}>{title}</Text>
      {lines.map((line, index) => (
        <Text
          key={`rec-${index}`}
          style={[
            styles.text,
            index === lines.length - 1 ? styles.textLast : {},
          ]}
        >
          {line}
        </Text>
      ))}
    </View>
  )
}
