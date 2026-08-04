import { StyleSheet, Text, View } from "@react-pdf/renderer"

import { pdfColors, pdfSpacing } from "@/components/pdf/theme"

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    left: pdfSpacing.pageX,
    right: pdfSpacing.pageX,
    bottom: 28,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: pdfColors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  left: {
    flexDirection: "column",
    gap: 2,
    maxWidth: "70%",
  },
  brand: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.ink,
  },
  url: {
    fontSize: 7.5,
    color: pdfColors.muted,
  },
  date: {
    fontSize: 7.5,
    color: pdfColors.subtle,
  },
  pageNumber: {
    fontSize: 8,
    color: pdfColors.muted,
    textAlign: "right",
  },
})

export type PdfFooterProps = {
  brandName: string
  website: string
  dateLabel?: string
  showPageNumber?: boolean
}

export function PdfFooter({
  brandName,
  website,
  dateLabel,
  showPageNumber = true,
}: PdfFooterProps) {
  return (
    <View style={styles.footer} fixed>
      <View style={styles.left}>
        <Text style={styles.brand}>{brandName}</Text>
        <Text style={styles.url}>{website}</Text>
        {dateLabel ? <Text style={styles.date}>{dateLabel}</Text> : null}
        <Text style={styles.date}>Informe generado automáticamente.</Text>
      </View>
      {showPageNumber ? (
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      ) : null}
    </View>
  )
}
