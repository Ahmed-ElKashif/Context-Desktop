import { DocumentData } from "../../../../store/library/librarySlice";
import { Icon } from "../../../../components/ui/core/Icons";
import { notify } from "../../../../components/ui/feedback/ToastEngine";

export const ExecutiveSummary = ({
  activeDocument,
}: {
  activeDocument: DocumentData | null;
}) => {
  if (!activeDocument) return null;

  return (
    <section id="tour-exec-summary" className="bg-white dark:bg-dark-surface rounded-2xl p-6 md:p-8 border border-light-border dark:border-white/5 shadow-sm lg:h-full lg:flex lg:flex-col lg:overflow-hidden">
      <div className="flex justify-between items-start mb-6 flex-shrink-0">
        <h3 className="text-xl font-black flex items-center gap-3 text-light-text dark:text-white tracking-tight">
          <div className="p-2 bg-light-primary/5 dark:bg-dark-primary/10 rounded-lg text-light-primary dark:text-dark-primary border border-light-primary/10 dark:border-dark-primary/20">
            <Icon name="description" className="text-[20px]" />
          </div>
          Executive Summary
        </h3>

        {/* Copy Summary (mocked now, ready for real AI response) */}
        <button
          type="button"
          onClick={() => {
            const textToCopy =
              activeDocument.summary ||
              "The Context AI engine has successfully parsed this document, but no summary was generated.";
            navigator.clipboard
              .writeText(textToCopy)
              .then(() => notify("Summary copied to clipboard.", "success"))
              .catch(() => notify("Failed to copy summary.", "error"));
          }}
          className="flex items-center gap-1.5 bg-light-bg dark:bg-white/5 border border-light-border dark:border-white/10 text-light-text/70 dark:text-white/60 px-3 py-1 rounded-full shrink-0 hover:text-light-primary dark:hover:text-dark-primary hover:border-light-primary/30 dark:hover:border-dark-primary/30 transition-colors"
          title="Copy summary"
        >
          <Icon name="content_copy" className="text-[14px]" />
          <span className="text-xs font-bold">Copy Summary</span>
        </button>
      </div>

      {/* Dynamic Summary from the Database */}
      <div className="lg:flex-1 lg:overflow-y-auto no-scrollbar">
        <p className="text-lg text-light-text dark:text-white border-l-2 border-light-primary dark:border-dark-primary pl-4 bg-light-bg/50 dark:bg-transparent py-1 font-medium mb-6">
          {activeDocument.summary ||
            "The Context AI engine has successfully parsed this document, but no summary was generated."}
        </p>
      </div>
    </section>
  );
};
