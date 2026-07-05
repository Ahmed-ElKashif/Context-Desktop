import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
import type { DocumentPrettifyResult } from "../../../services/prettify.service";
import { htmlToMarkdown, stripMarkdown } from "./converter-helpers";

// Font sizes for heading levels (in half-points, so 32 = 16pt)
const HEADING_SIZES: Record<number, number> = {
  1: 36, // 18pt
  2: 30, // 15pt
  3: 26, // 13pt
  4: 24, // 12pt
  5: 22, // 11pt
};

/**
 * Convert a string containing Markdown syntax (and basic HTML) into an array of TextRun
 * segments for use in docx generation.
 */
const markdownToTextRuns = (
  text: string,
  size: number,
  boldBase: boolean = false,
): TextRun[] => {
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

export const convertToDocx = async (
  json: DocumentPrettifyResult,
): Promise<Blob> => {
  const children: (Paragraph | Table)[] = [];
  const isRtl = json.direction === "rtl";
  const alignment = isRtl ? AlignmentType.RIGHT : AlignmentType.JUSTIFIED;

  // Track numbering for numbered lists
  const numberingConfigs: Array<{
    reference: string;
    levels: Array<{
      level: number;
      format: "decimal";
      text: string;
      alignment: typeof AlignmentType.START;
    }>;
  }> = [];

  let currentListRef = "";
  let listCounter = 0;

  for (let i = 0; i < json.blocks.length; i++) {
    const block = json.blocks[i];
    const nextBlock = json.blocks[i + 1];
    // Smart Pagination Logic (How big tech handles page breaks)
    // We only tie blocks together if they logically MUST stay on the same page.
    let shouldKeepNext = false;
    
    if (nextBlock) {
      if (block.type === "heading") {
        // Rule 1: Headings ALWAYS stick to the content immediately below them
        shouldKeepNext = true;
      } else if ("text" in block && typeof block.text === "string") {
        const text = block.text.trim();
        
        // Rule 2: Semantic Introducers
        // If a block ends with a colon (:), question mark (?), or ellipsis (...), 
        // it is semantically introducing or asking for the next block. 
        // This generically handles 170+ use cases (e.g., paragraphs introducing tables, questions introducing bullets).
        if (text.endsWith(":") || text.endsWith("?") || text.endsWith("...")) {
          shouldKeepNext = true;
        } 
        // Rule 3: Parent-Child Nesting
        // If a list item is immediately followed by a code block, quote, table, or MCQ option, 
        // that block is almost certainly a nested child of the list item.
        else if (
          (block.type === "numbered_list_item" || block.type === "bullet_list_item") &&
          (nextBlock.type === "code" || nextBlock.type === "quote" || nextBlock.type === "table" || nextBlock.type === "mcq_option")
        ) {
          shouldKeepNext = true;
        }
        // Rule 4: Tightly Grouped Sets
        // Consecutive MCQ options are inherently a single logical unit.
        else if (block.type === "mcq_option" && nextBlock.type === "mcq_option") {
          shouldKeepNext = true;
        }
      }
    }

    // Reset numbering ref if we hit a structural block
    if (block.type === "heading" || block.type === "divider" || block.type === "table") {
      currentListRef = "";
    }

    if (block.type === "heading") {
      const headingSize = HEADING_SIZES[block.level] || HEADING_SIZES[3];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let headingBorder: any = undefined;
      if (block.level === 1) {
        headingBorder = {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 6,
            color: "CCCCCC",
            space: 4,
          },
        };
      } else if (block.level === 2) {
        headingBorder = {
          top: {
            style: BorderStyle.SINGLE,
            size: 12,
            color: "CCCCCC",
            space: 12,
          },
        };
      } else if (block.level === 3) {
        headingBorder = {
          top: {
            style: BorderStyle.SINGLE,
            size: 4,
            color: "E5E5E5",
            space: 8,
          },
        };
      }

      // Smart Page Break Logic (Like Notion & Word Styles)
      // We start major sections (H1, H2) on a new page, UNLESS:
      // 1. It is the very first block in the document (prevents a blank first page).
      // 2. It immediately follows another heading (e.g., an H1 Title followed by an H2 Subtitle shouldn't be separated).
      const prevBlock = i > 0 ? json.blocks[i - 1] : null;
      const isMajorHeading = block.level === 1 || block.level === 2;
      const shouldPageBreak = isMajorHeading && prevBlock !== null && prevBlock.type !== "heading";

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: block.text,
              bold: true,
              size: headingSize,
              color: "000000",
            }),
          ],
          spacing: { before: 360, after: 120 },
          alignment: isRtl ? AlignmentType.RIGHT : undefined,
          bidirectional: isRtl,
          // Headings should ALWAYS stay with the content below them
          keepNext: true,
          keepLines: true,
          pageBreakBefore: shouldPageBreak,
          border: headingBorder,
        }),
      );
    } else if (block.type === "table") {
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
            left: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
            right: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
            insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
          },
          rows: [
            new TableRow({
              cantSplit: true,
              children: block.headers.map(
                (header) =>
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: markdownToTextRuns(header, 22, true),
                        alignment,
                      }),
                    ],
                    shading: { fill: "F3F4F6" },
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                  }),
              ),
            }),
            ...block.rows.map(
              (row) =>
                new TableRow({
                  cantSplit: true,
                  children: row.map(
                    (cell) =>
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: markdownToTextRuns(cell, 22),
                            alignment,
                          }),
                        ],
                        margins: {
                          top: 100,
                          bottom: 100,
                          left: 100,
                          right: 100,
                        },
                      }),
                  ),
                }),
            ),
          ],
        }),
      );
      children.push(new Paragraph({ spacing: { after: 200 }, keepNext: shouldKeepNext })); // Spacer after table
    } else if (block.type === "divider") {
      children.push(
        new Paragraph({
          border: {
            bottom: {
              style: BorderStyle.SINGLE,
              size: 6,
              color: "E5E5E5",
              space: 4,
            },
          },
          spacing: { before: 200, after: 200 },
          keepNext: shouldKeepNext,
        }),
      );
    } else {
      // Paragraph, Code, Quote, Lists, MCQ Options
      const isBullet = block.type === "bullet_list_item";
      const isNumbered = block.type === "numbered_list_item";
      const isMCQ = block.type === "mcq_option";
      const isQuote = block.type === "quote";
      const isCode = block.type === "code";

      let textToRender = block.text;
      if (isMCQ) {
        textToRender = `${(block as any).letter}) ${block.text}`;
      }
      
      if (isNumbered) {
        if (!currentListRef) {
          listCounter++;
          currentListRef = `list-${listCounter}`;
          numberingConfigs.push({
            reference: currentListRef,
            levels: [
              {
                level: 0,
                format: "decimal",
                text: "%1.",
                alignment: AlignmentType.START,
              },
            ],
          });
        }
      }

      // We split text by newlines just in case there are multiple paragraphs inside a single block
      const paragraphs = textToRender.split(/\n+/).filter(Boolean);

      for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
        const isFirst = pIdx === 0;
        const isLastParagraph = pIdx === paragraphs.length - 1;

        children.push(
          new Paragraph({
            children: markdownToTextRuns(paragraphs[pIdx], 22),
            bullet: isFirst && isBullet ? { level: 0 } : undefined,
            numbering:
              isFirst && isNumbered && currentListRef
                ? { reference: currentListRef, level: 0 }
                : undefined,
            indent: {
              left:
                isBullet || isNumbered || isMCQ
                  ? 720
                  : isQuote || isCode
                    ? 1440
                    : 0,
            },
            shading: isCode ? { fill: "F3F4F6" } : undefined,
            border: isQuote
              ? {
                  left: {
                    style: BorderStyle.SINGLE,
                    size: 12,
                    color: "E5E7EB",
                    space: 8,
                  },
                }
              : undefined,
            spacing: { after: isLastParagraph ? 120 : 0 },
            alignment,
            bidirectional: isRtl,
            keepLines: true,
            // If it's the last paragraph in the block, use the section's keepNext value.
            // Otherwise, it must definitely keep next with the subsequent paragraph of the same block.
            keepNext: isLastParagraph ? shouldKeepNext : true,
          }),
        );
      }
    }
  }

  const doc = new Document({
    numbering: { config: numberingConfigs },
    sections: [{ children }],
  });

  return Packer.toBlob(doc);
};
