import { Image, StyleSheet, Text, View } from "@react-pdf/renderer"

import { pdfColors } from "@/components/pdf/theme"

const styles = StyleSheet.create({
  cover: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 36,
    paddingBottom: 24,
  },
  top: {
    gap: 48,
  },
  logo: {
    width: 88,
    height: 78,
    objectFit: "contain",
  },
  brandFallback: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.2,
  },
  titleBlock: {
    gap: 14,
    maxWidth: "88%",
  },
  subtitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.ink,
    lineHeight: 1.2,
    letterSpacing: -0.4,
  },
  product: {
    marginTop: 8,
    fontSize: 14,
    color: pdfColors.body,
    lineHeight: 1.4,
  },
  date: {
    marginTop: 6,
    fontSize: 10,
    color: pdfColors.muted,
  },
  divider: {
    marginTop: 28,
    width: 48,
    height: 2,
  },
  bottom: {
    gap: 6,
  },
  generatedBy: {
    fontSize: 9,
    color: pdfColors.muted,
  },
  brandName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.ink,
  },
  brandUrl: {
    fontSize: 9,
    color: pdfColors.muted,
  },
})

export type PdfCoverProps = {
  title: string
  subtitle?: string
  productName: string
  dateLabel: string
  logo?: string | null
  brandName: string
  brandColor: string
  brandWebsite: string
}

export function PdfCover({
  title,
  subtitle,
  productName,
  dateLabel,
  logo,
  brandName,
  brandColor,
  brandWebsite,
}: PdfCoverProps) {
  return (
    <View style={styles.cover}>
      <View style={styles.top}>
        {logo ? (
          // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf Image has no alt prop
          <Image src={logo} style={styles.logo} />
        ) : (
          <Text style={[styles.brandFallback, { color: brandColor }]}>
            {brandName}
          </Text>
        )}

        <View style={styles.titleBlock}>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: brandColor }]}>
              {subtitle}
            </Text>
          ) : null}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.product}>{productName}</Text>
          <Text style={styles.date}>{dateLabel}</Text>
          <View style={[styles.divider, { backgroundColor: brandColor }]} />
        </View>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.generatedBy}>Generado automáticamente por</Text>
        <Text style={styles.brandName}>{brandName}</Text>
        <Text style={styles.brandUrl}>{brandWebsite}</Text>
      </View>
    </View>
  )
}
