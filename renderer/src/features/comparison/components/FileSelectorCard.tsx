import { Icon } from "../../../components/ui/core/Icons";
import { DocumentData } from "../../../store/library/librarySlice";
import { cn } from "../../../lib/utils";

interface FileSelectorCardProps {
  type: "base" | "compare";
  document: DocumentData | null;
  onClick: () => void;
}

export const FileSelectorCard = ({ type, document, onClick }: FileSelectorCardProps) => {
  const isBase = type === "base";
  
  // Theme variants based on type
  const activeColor = isBase ? "bg-light-primary dark:bg-dark-secondary" : "bg-light-accent dark:bg-dark-primary";
  const hoverBorderColor = isBase ? "hover:border-light-primary/30 dark:hover:border-dark-secondary/30" : "hover:border-light-accent/30 dark:hover:border-dark-primary/30";
  const iconBg = isBase ? "text-light-primary dark:text-dark-secondary" : "text-light-accent dark:text-dark-primary";
  const badgeBorder = isBase ? "border-light-primary/20 dark:border-dark-secondary/30 text-light-primary dark:text-dark-secondary bg-light-primary/5 dark:bg-dark-secondary/10" : "border-light-accent/20 dark:border-dark-primary/30 text-light-accent dark:text-dark-primary bg-light-accent/5 dark:bg-dark-primary/10";
  const overlayBg = isBase ? "bg-light-primary/5 dark:bg-dark-secondary/10" : "bg-light-accent/5 dark:bg-dark-primary/10";

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex-1 w-full bg-white dark:bg-dark-surface p-5 rounded-2xl border border-light-border dark:border-white/5 shadow-sm relative overflow-hidden group transition-colors cursor-pointer min-h-[120px] flex flex-col justify-center",
        hoverBorderColor
      )}
    >
      <div className={cn("absolute top-0 w-1 h-full", isBase ? "left-0" : "right-0", activeColor)}></div>
      
      {/* Hover Overlay */}
      <div className={cn("absolute inset-0 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10", overlayBg)}>
        <span className="bg-white dark:bg-dark-surface px-3 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 text-light-text dark:text-white">
          <Icon name={document ? "swap_horiz" : "add"} className="text-[16px]" />
          {document ? "Change File" : "Select File"}
        </span>
      </div>

      {document ? (
        <>
          <div className="flex items-start justify-between mb-3">
            <div className={cn("w-10 h-10 rounded-xl bg-light-bg dark:bg-black/20 flex items-center justify-center border border-light-border dark:border-white/5", iconBg)}>
              <Icon name="description" className="text-[20px]" />
            </div>
            <span className={cn("text-[10px] font-bold font-mono border px-2 py-1 rounded-md", badgeBorder)}>
              {isBase ? "Base File" : "Comparison File"}
            </span>
          </div>
          <h2 className="text-base font-bold text-light-text dark:text-white truncate" title={document.title}>
            {document.title}
          </h2>
          <p className="text-xs font-medium text-light-text/70 dark:text-dark-text/70 mt-1 truncate">
            {document.semanticPath || "From Library"}
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center opacity-60">
           <div className="w-12 h-12 rounded-full border-2 border-dashed border-light-border dark:border-white/20 flex items-center justify-center mb-2">
              <Icon name="add" className="text-[24px] text-light-text/60 dark:text-white/60" />
           </div>
           <span className="text-sm font-bold text-light-text/70 dark:text-white/70">
             {isBase ? "Select Base Document" : "Select Document to Compare"}
           </span>
        </div>
      )}
    </div>
  );
};