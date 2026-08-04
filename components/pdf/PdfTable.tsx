import { StyleSheet, Text, View } from "@react-pdf/renderer"

import type { PdfTableData } from "@/components/pdf/types"
import { pdfColors, withAlpha } from "@/components/pdf/theme"

const styles = StyleSheet.create({
  table: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pdfColors.border,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: pdfColors.soft,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  footerRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: pdfColors.border,
  },
  cell: {
    fontSize: 8.5,
    color: pdfColors.body,
  },
  headerCell: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  footerLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.ink,
  },
  footerValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.ink,
    textAlign: "right",
  },
  left: { textAlign: "left" },
  right: { textAlign: "right" },
  center: { textAlign: "center" },
})

export type PdfTableProps = {
  columns: PdfTableData["columns"]
  rows: PdfTableData["rows"]
  totals?: PdfTableData["totals"]
  /** Color de marca para el fondo del total */
  accentColor?: string
}

export function PdfTable({
  columns,
  rows,
  totals,
  accentColor,
}: PdfTableProps) {
  return (
    <View style={styles.table}>
      <View style={styles.headerRow}>
        {columns.map((column) => (
          <Text
            key={column.key}
            style={[
              styles.headerCell,
              styles[column.align ?? "left"],
              { width: column.width ?? `${100 / columns.length}%` },
            ]}
          >
            {column.label}
          </Text>
        ))}
      </View>

      {rows.map((row, rowIndex) => (
        <View
          key={`row-${rowIndex}`}
          style={[
            styles.row,
            rowIndex === rows.length - 1 && !totals ? styles.rowLast : {},
          ]}
          wrap={false}
        >
          {columns.map((column) => (
            <Text
              key={`${rowIndex}-${column.key}`}
              style={[
                styles.cell,
                styles[column.align ?? "left"],
                { width: column.width ?? `${100 / columns.length}%` },
              ]}
            >
              {row[column.key] ?? "—"}
            </Text>
          ))}
        </View>
      ))}

      {totals ? (
        <View
          style={[
            styles.footerRow,
            {
              backgroundColor: accentColor
                ? withAlpha(accentColor, "18")
                : pdfColors.soft,
            },
          ]}
          wrap={false}
        >
          <Text style={[styles.footerLabel, { width: "70%" }]}>
            {totals.label}
          </Text>
          <Text style={[styles.footerValue, { width: "30%" }]}>
            {totals.value}
          </Text>
        </View>
      ) : null}
    </View>
  )
}
