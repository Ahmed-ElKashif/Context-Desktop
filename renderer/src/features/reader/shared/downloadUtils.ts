/**
 * Shared download utility for reader components.
 *
 * Strategy:
 *  • PDFs & Images  → Cloudinary fl_attachment transform (zero memory, instant)
 *  • Raw files (.docx / .doc / .xlsx / .xls / .csv) → blob fetch fallback
 *    (Cloudinary raw resources don't support fl_attachment)
 *  • TextSnippets → in-memory Blob, no network request needed
 */

/**
 * Downloads a plain-text string as a .txt file.
 * The snippet title is used as the filename, with OS-invalid characters replaced by underscores.
 */
export const downloadTextAsFile = (text: string, title: string): void => {
  // Sanitize title: replace characters that are invalid in Windows filenames
  const safeTitle = title.replace(/[/\\:*?"<>|]/g, "_").trim() || "snippet";
  const filename = `${safeTitle}.txt`;

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = window.document.createElement("a");
  link.href = url;
  link.download = filename;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);

  // Revoke the object URL after a short delay to allow the download to start
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

export const handleDownload = async (
  url: string | null,
  filename: string,
): Promise<void> => {
  if (!url) return;

  const hasSpecialChars = /[^\w\u0600-\u06FF\s.-]/.test(filename);
  const isRawFile =
    filename.toLowerCase().endsWith(".docx") ||
    filename.toLowerCase().endsWith(".doc") ||
    filename.toLowerCase().endsWith(".xlsx") ||
    filename.toLowerCase().endsWith(".xls") ||
    filename.toLowerCase().endsWith(".csv");

  // ── FAST PATH: PDFs & Images via Cloudinary fl_attachment ──
  if (
    url.includes("cloudinary.com") &&
    url.includes("/image/upload/") &&
    !hasSpecialChars &&
    !isRawFile
  ) {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    const safeName = encodeURIComponent(nameWithoutExt);
    const directUrl = url.replace("/upload/", `/upload/fl_attachment:${safeName}/`);
    window.location.href = directUrl;
    return;
  }

  // ── FALLBACK: Blob fetch for raw files or special characters ──
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
  } catch (error) {
    console.error("Download failed, falling back to new tab", error);
    window.open(url, "_blank");
  }
};
