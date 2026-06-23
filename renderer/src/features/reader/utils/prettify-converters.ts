import ExcelJS from "exceljs";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
} from "docx";
import type {
  ExcelPrettifyResult,
  DocumentPrettifyResult,
} from "../../../services/prettify.service";

const HEADER_FILL = "111827"; // Dark gray / almost black
const HEADER_FONT_COLOR = "FFFFFF";
const BORDER_COLOR = "E5E7EB"; // Soft light gray

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Convert simple HTML tags (b, i, br) to Markdown syntax */
const htmlToMarkdown = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?b>/gi, "**")
    .replace(/<\/?strong>/gi, "**")
    .replace(/<\/?i>/gi, "*")
    .replace(/<\/?em>/gi, "*")
    .replace(/<\/?[^>]+(>|$)/g, "");
};

/** Strip all Markdown and HTML to return clean plain text */
export const stripMarkdown = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
};

/**
 * Convert a string containing Markdown syntax (and basic HTML) into an array of TextRun
 * segments for use in docx generation.
 */
const markdownToTextRuns = (text: string, size: number, boldBase: boolean = false): TextRun[] => {
  const normalised = htmlToMarkdown(text);
  const runs: TextRun[] = [];
  const regex = /\*\*(.*?)\*\*|\*(.*?)\*|([^*]+)/gs;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(normalised)) !== null) {
    if (match[1] !== undefined) {
      runs.push(new TextRun({ text: match[1], bold: true, size }));
    } else if (match[2] !== undefined) {
      runs.push(new TextRun({ text: match[2], italics: true, size }));
    } else if (match[3]) {
      runs.push(new TextRun({ text: match[3], size, bold: boldBase }));
    }
  }

  if (runs.length === 0) {
    runs.push(new TextRun({ text: stripMarkdown(text), size, bold: boldBase }));
  }

  return runs;
};

/**
 * Get resolved list items from a section, handling both new schema
 * (bulletItems / numberedItems) and legacy schema (items).
 */
export const getListItems = (
  section: DocumentPrettifyResult["sections"][number]
): { items: string[]; type: "bullet" | "numbered" } | null => {
  if (section.numberedItems && section.numberedItems.length > 0) {
    return { items: section.numberedItems, type: "numbered" };
  }
  if (section.bulletItems && section.bulletItems.length > 0) {
    return { items: section.bulletItems, type: "bullet" };
  }
  // Legacy fallback
  if (section.items && section.items.length > 0) {
    return { items: section.items, type: "bullet" };
  }
  return null;
};

// ── Shared download helper ───────────────────────────────────────────────────

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

// ── Excel Converter ──────────────────────────────────────────────────────────

export const convertToExcel = async (
  json: ExcelPrettifyResult
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

// ── Markdown Converter ───────────────────────────────────────────────────────

export const convertToMarkdown = (json: DocumentPrettifyResult): string => {
  const body = json.sections
    .map((section) => {
      const prefix = "#".repeat(section.level);
      let md = `${prefix} ${htmlToMarkdown(section.heading)}\n\n`;

      if (section.content) {
        md += `${htmlToMarkdown(section.content)}\n\n`;
      }

      const listData = getListItems(section);
      if (listData) {
        if (listData.type === "numbered") {
          md +=
            listData.items
              .map((item, i) => `${i + 1}. ${htmlToMarkdown(item)}`)
              .join("\n") + "\n\n";
        } else {
          md +=
            listData.items.map((item) => `- ${htmlToMarkdown(item)}`).join("\n") + "\n\n";
        }
      }

      return md;
    })
    .join("");

  return body;
};

// ── Plain Text Converter ─────────────────────────────────────────────────────

export const convertToPlainText = (json: DocumentPrettifyResult): string => {
  return json.sections
    .map((section) => {
      const headingPrefix = section.level <= 2 ? "\n" : "";
      let out = `${headingPrefix}${stripMarkdown(section.heading)}\n`;

      if (section.content) {
        out += `${stripMarkdown(section.content)}\n`;
      }

      const listData = getListItems(section);
      if (listData) {
        if (listData.type === "numbered") {
          out +=
            listData.items
              .map((item, i) => `  ${i + 1}. ${stripMarkdown(item)}`)
              .join("\n") + "\n";
        } else {
          out +=
            listData.items.map((item) => `  • ${stripMarkdown(item)}`).join("\n") + "\n";
        }
      }

      return out;
    })
    .join("\n");
};

// ── Docx Converter ───────────────────────────────────────────────────────────

// Font sizes for heading levels (in half-points, so 32 = 16pt)
const HEADING_SIZES: Record<number, number> = {
  1: 36, // 18pt
  2: 30, // 15pt
  3: 26, // 13pt
  4: 24, // 12pt
  5: 22, // 11pt
};

export const convertToDocx = async (
  json: DocumentPrettifyResult
): Promise<Blob> => {
  const children: Paragraph[] = [];
  const isRtl = json.direction === "rtl";
  const alignment = isRtl ? AlignmentType.RIGHT : AlignmentType.JUSTIFIED;

  for (const section of json.sections) {
    const headingSize = HEADING_SIZES[section.level] || HEADING_SIZES[3];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let headingBorder: any = undefined;
    if (section.level === 1) {
      headingBorder = { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC", space: 4 } };
    } else if (section.level === 2) {
      headingBorder = { top: { style: BorderStyle.SINGLE, size: 12, color: "CCCCCC", space: 12 } };
    } else if (section.level === 3) {
      headingBorder = { top: { style: BorderStyle.SINGLE, size: 4, color: "E5E5E5", space: 8 } };
    }

    // Heading — custom bold text, no built-in HeadingLevel (avoids blue theme color)
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: section.heading,
            bold: true,
            size: headingSize,
            color: "000000",
          }),
        ],
        spacing: { before: 360, after: 120 },
        alignment: isRtl ? AlignmentType.RIGHT : undefined,
        bidirectional: isRtl,
        keepNext: true,
        keepLines: true,
        border: headingBorder,
      })
    );

    // Content paragraph (with HTML emphasis parsing)
    if (section.content) {
      const contentSize = section.level === 3 ? 28 : 22; // 14pt vs 11pt
      const isContentBold = section.level === 3;
      
      children.push(
        new Paragraph({
          children: markdownToTextRuns(section.content, contentSize, isContentBold),
          spacing: { after: 200 },
          alignment,
          bidirectional: isRtl,
          keepLines: true,
          keepNext: !!getListItems(section), // Keep with following list if there is one
        })
      );
    }

    // List items (bullet or numbered)
    const listData = getListItems(section);
    if (listData) {
      for (let idx = 0; idx < listData.items.length; idx++) {
        const item = listData.items[idx];
        
        // Detect if the item is an MCQ choice (e.g., "<b>A)</b>" or "A)")
        // If it is, we don't want a default bullet or number next to it.
        const isMCQChoice = /^(?:<b>)?\s*[A-Z][.)]/i.test(item.trim());
        const useBullet = listData.type === "bullet" && !isMCQChoice;
        const useNumbering = listData.type === "numbered" && !isMCQChoice;

        children.push(
          new Paragraph({
            children: markdownToTextRuns(item, 22),
            bullet: useBullet ? { level: 0 } : undefined,
            numbering:
              useNumbering
                ? { reference: "default-numbering", level: 0 }
                : undefined,
            spacing: { after: 60 },
            alignment: isRtl ? AlignmentType.RIGHT : undefined,
            bidirectional: isRtl,
            keepLines: true,
            keepNext: idx < listData.items.length - 1, // Keep with next item (except the last one)
          })
        );
      }
    }
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: "decimal",
              text: "%1.",
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
    sections: [{ children }],
  });

  return Packer.toBlob(doc);
};
