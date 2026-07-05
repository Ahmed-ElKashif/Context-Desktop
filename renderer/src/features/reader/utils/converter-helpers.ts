/** Convert simple HTML tags (b, i, br) to Markdown syntax */
export const htmlToMarkdown = (text: string): string => {
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
    .replace(/^#+\s/gm, "")
    .trim();
};

// ── Shared download helper ───────────────────────────────────────────────────

/** Convert Markdown structure into clean, readable plain text (Notion style) */
export const formatMarkdownAsPlainText = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)") // Links
    .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
    .replace(/__(.*?)__/g, "$1") // Bold
    .replace(/\*(.*?)\*/g, "$1") // Italic
    .replace(/_(.*?)_/g, "$1") // Italic
    .replace(/~~(.*?)~~/g, "$1") // Strikethrough
    .replace(/`([^`]+)`/g, "$1") // Inline code
    .replace(/```[a-z]*\n/gi, "") // Code block start
    .replace(/```/g, "") // Code block end
    .replace(/^#+\s+(.*)$/gm, (_, p1) => p1.toUpperCase()) // Headings to uppercase
    .replace(/^(\s*)-\s+/gm, "$1• ") // Bullets
    .replace(/^(\s*)\*\s+/gm, "$1• ") // Bullets
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .trim();
};

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
