import { Image, StyleSheet, Text, View } from "@react-pdf/renderer"

import { pdfColors } from "@/components/pdf/theme"

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 44,
    height: 40,
    objectFit: "contain",
  },
  textCol: {
    flexDirection: "column",
    gap: 2,
    maxWidth: "80%",
  },
  brandName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.2,
  },
  slogan: {
    fontSize: 8,
    color: pdfColors.muted,
  },
})

export type PdfBrandHeaderProps = {
  logo?: string | null
  brandName: string
  brandColor: string
  slogan?: string
}

export function PdfBrandHeader({
  logo,
  brandName,
  brandColor,
  slogan,
}: PdfBrandHeaderProps) {
  return (
    <View style={styles.row}>
      {logo ? (
        // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf Image has no alt prop
        <Image src={logo} style={styles.logo} />
      ) : null}
      <View style={styles.textCol}>
        <Text style={[styles.brandName, { color: brandColor || pdfColors.ink }]}>
          {brandName}
        </Text>
        {slogan ? <Text style={styles.slogan}>{slogan}</Text> : null}
      </View>
    </View>
  )
}
