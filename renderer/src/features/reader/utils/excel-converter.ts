import ExcelJS from "exceljs";
import type { ExcelPrettifyResult } from "../../../services/prettify.service";

const HEADER_FILL = "111827"; // Dark gray / almost black
const HEADER_FONT_COLOR = "FFFFFF";
const BORDER_COLOR = "E5E7EB"; // Soft light gray

export const convertToExcel = async (
  json: ExcelPrettifyResult,
): Promise<Blob> => {
  const workbook = new ExcelJS.Workbook();
  const isRtl = json.direction === "rtl";

  for (const sheet of json.sheets) {
    const ws = workbook.addWorksheet(sheet.name);

    // ── Set column widths based on content ──
    ws.columns = sheet.headers.map((header, ci) => {
      let maxLen = header.length;
      for (const row of sheet.rows) {
        const cellLen = (row[ci] || "").length;
        if (cellLen > maxLen) maxLen = cellLen;
      }
      return { width: Math.min(Math.max(maxLen + 6, 12), 50) };
    });

    // ── Header row ──
    const headerRow = ws.addRow(sheet.headers);
    headerRow.eachCell((cell: ExcelJS.Cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: HEADER_FILL },
      };
      cell.font = {
        bold: true,
        color: { argb: HEADER_FONT_COLOR },
        size: 12,
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      cell.border = {
        bottom: { style: "medium", color: { argb: "9CA3AF" } }, // Subtle dark border to separate header
        left: { style: "thin", color: { argb: BORDER_COLOR } },
        right: { style: "thin", color: { argb: BORDER_COLOR } },
      };
    });

    // ── Data rows ──
    sheet.rows.forEach((rowData, ri) => {
      const row = ws.addRow(rowData);
      const isEvenRow = ri % 2 === 0;

      row.eachCell({ includeEmpty: true }, (cell: ExcelJS.Cell) => {
        // Simple Zebra Striping
        const fillColor = isEvenRow ? "F9FAFB" : "FFFFFF";

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: fillColor },
        };

        cell.border = {
          top: { style: "thin", color: { argb: BORDER_COLOR } },
          bottom: { style: "thin", color: { argb: BORDER_COLOR } },
          left: { style: "thin", color: { argb: BORDER_COLOR } },
          right: { style: "thin", color: { argb: BORDER_COLOR } },
        };

        cell.font = { size: 11 };

        // Right-align numeric cells; RTL right, LTR left for text
        const value = String(cell.value ?? "");
        if (value !== "" && !isNaN(Number(value))) {
          cell.alignment = { horizontal: "right" };
        } else {
          cell.alignment = {
            vertical: "middle",
            horizontal: isRtl ? "right" : "left",
          };
        }
      });
    });

    // Freeze the header row + set RTL view
    ws.views = [
      {
        state: "frozen",
        ySplit: 1,
        rightToLeft: isRtl,
      },
    ];
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};
