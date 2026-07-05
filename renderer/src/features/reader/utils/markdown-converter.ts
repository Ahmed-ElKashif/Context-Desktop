import type { DocumentPrettifyResult } from "../../../services/prettify.service";

export const convertToMarkdown = (json: DocumentPrettifyResult): string => {
  let md = "";

  for (const block of json.blocks) {
    switch (block.type) {
      case "heading":
        md += `${"#".repeat(block.level)} ${block.text}\n\n`;
        break;
      case "paragraph":
        md += `${block.text}\n\n`;
        break;
      case "code":
        md += `\`\`\`${block.language || ""}\n${block.text}\n\`\`\`\n\n`;
        break;
      case "quote":
        md += `> ${block.text.split("\n").join("\n> ")}\n\n`;
        break;
      case "bullet_list_item":
        md += `- ${block.text}\n\n`;
        break;
      case "numbered_list_item":
        md += `1. ${block.text}\n\n`; // ReactMarkdown auto-increments
        break;
      case "mcq_option":
        md += `${block.letter}) ${block.text}\n\n`;
        break;
      case "table":
        md += `| ${block.headers.join(" | ")} |\n`;
        md += `| ${block.headers.map(() => "---").join(" | ")} |\n`;
        for (const row of block.rows) {
          md += `| ${row.join(" | ")} |\n`;
        }
        md += `\n`;
        break;
      case "divider":
        md += `---\n\n`;
        break;
    }
  }

  return md;
};
