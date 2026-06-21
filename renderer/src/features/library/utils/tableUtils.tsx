import { notify } from "../../../components/ui/feedback/ToastEngine";

/**
 * Copies the Cloudinary URL directly to the clipboard.
 * Now that all uploaded files include the correct file extension in their
 * Cloudinary URL (e.g. .docx), sharing the raw URL is reliable and instant.
 */
export const handleShareClick = (cloudinaryUrl?: string) => {
  if (!cloudinaryUrl) {
    notify("This document has no shareable file link.", "error");
    return;
  }
  navigator.clipboard.writeText(cloudinaryUrl);
  notify("File link copied to clipboard!", "success");
};

export const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case "PDF":
      return (
        <span className="material-symbols-rounded text-red-600 dark:text-red-500 text-2xl">
          picture_as_pdf
        </span>
      );
    case "Word":
      return (
        <span className="material-symbols-rounded text-blue-600 dark:text-blue-500 text-2xl">
          description
        </span>
      );
    case "Image":
      return (
        <span className="material-symbols-rounded text-purple-600 dark:text-purple-500 text-2xl">
          image
        </span>
      );
    case "TextSnippet":
      return (
        <span className="material-symbols-rounded text-amber-600 dark:text-amber-500 text-2xl">
          text_snippet
        </span>
      );
    case "Excel":
      return (
        <span className="material-symbols-rounded text-emerald-600 dark:text-emerald-500 text-2xl">
          table_chart
        </span>
      );
    default:
      return (
        <span className="material-symbols-rounded text-gray-500 text-2xl">
          draft
        </span>
      );
  }
};

export const formatDate = (dateString?: string) => {
  // 🛠️ THE FIX 1: If there is no date yet (fresh upload), return a fallback
  if (!dateString) return "Just now";

  const date = new Date(dateString);

  // 🛠️ THE FIX 2: If the date failed to parse properly, return a fallback
  if (isNaN(date.getTime())) return "Just now";

  const isToday = new Date().toDateString() === date.toDateString();
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  if (isToday) return `Today, ${time}`;
  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${time}`;
}; 

export const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10240 ? 2 : 1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatItemCount = (count?: number): string => {
  if (count === undefined) return '--';
  return count === 1 ? "1 item" : `${count} items`;
};

// ─── Upload deduplication helpers (Windows-style rename) ─────────────────────

/**
 * Given a base name (no extension) and a set of already-taken names,
 * returns a unique name by appending (1), (2), … like Windows does.
 *
 * Examples:
 *   "report"    → "report(1)"  if "report" is taken
 *   "report(1)" → "report(2)"  if "report(1)" is taken
 */
export const resolveUniqueName = (
  name: string,
  takenNames: Set<string>
): string => {
  if (!takenNames.has(name.toLowerCase())) return name;

  // Strip any existing trailing (N) so we always increment from the base
  const baseMatch = name.match(/^(.*?)\((\d+)\)$/);
  const base = baseMatch ? baseMatch[1] : name;

  let index = 1;
  let candidate = `${base}(${index})`;
  while (takenNames.has(candidate.toLowerCase())) {
    index++;
    candidate = `${base}(${index})`;
  }
  return candidate;
};

/**
 * Splits a filename into [baseName, extension].
 *
 * Examples:
 *   "report.pdf"     → ["report", ".pdf"]
 *   "archive.tar.gz" → ["archive.tar", ".gz"]
 *   "README"         → ["README", ""]
 */
export const splitExt = (filename: string): [string, string] => {
  const dotIdx = filename.lastIndexOf(".");
  if (dotIdx <= 0) return [filename, ""];
  return [filename.slice(0, dotIdx), filename.slice(dotIdx)];
};

// ─────────────────────────────────────────────────────────────────────────────

export const renderCognitiveLoadBars = (load?: string) => {
  let activeBars = 1;
  let baseColor = "bg-blue-500";
  let textLabel = "Unknown";

  if (load === "Light") {
    activeBars = 2;
    baseColor = "bg-emerald-500";
    textLabel = "Light";
  } else if (load === "Medium") {
    activeBars = 3;
    baseColor = "bg-yellow-500";
    textLabel = "Medium";
  } else if (load === "Heavy") {
    activeBars = 4;
    baseColor = "bg-red-500";
    textLabel = "Severe";
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`w-1.5 h-3 rounded-sm ${bar <= activeBars ? baseColor : `${baseColor}/20`}`}
          ></div>
        ))}
      </div>
      <span className="text-xs font-mono font-bold text-light-text/80 dark:text-white/80">
        {textLabel}
      </span>
    </div>
  );
};

export const CircleCheckbox = ({ checked, onChange, visible }: {
  checked: boolean;
  onChange: () => void;
  visible: boolean;
}) => (
  <button
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        onChange();
      }
    }}
    onClick={(e) => { e.stopPropagation(); onChange(); }}
    className={`w-5 h-5 rounded-full flex items-center justify-center focus-ring-standard
      transition-all duration-150 shrink-0
      ${!visible && !checked ? 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100' : 'opacity-100'}
      ${checked
        ? 'bg-light-primary dark:bg-dark-primary text-white dark:text-black shadow-sm'
        : 'border-2 border-gray-400 dark:border-white/40 hover:border-light-primary dark:hover:border-dark-primary'
      }`}
    aria-label={checked ? "Deselect" : "Select"}
  >
    {checked && (
      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </button>
);
