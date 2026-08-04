import type { ReactNode } from "react"
import { StyleSheet, Text, View } from "@react-pdf/renderer"

import { pdfColors } from "@/components/pdf/theme"

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
    marginTop: 4,
    gap: 6,
  },
  title: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.ink,
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 9,
    color: pdfColors.muted,
    lineHeight: 1.4,
  },
  rule: {
    marginTop: 4,
    height: 1,
    backgroundColor: pdfColors.border,
  },
  content: {
    marginTop: 10,
    gap: 10,
  },
})

export type PdfSectionProps = {
  title: string
  description?: string
  children?: ReactNode
}

export function PdfSection({ title, description, children }: PdfSectionProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      <View style={styles.rule} />
      {children ? <View style={styles.content}>{children}</View> : null}
    </View>
  )
}
