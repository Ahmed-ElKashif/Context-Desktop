import { useAppSelector } from "../../../store/hooks";
import { DocumentHeader } from "./populated/DocumentHeader";
import { ExecutiveSummary } from "./populated/ExecutiveSummary";
import { AIChatSidebar } from "./populated/AIChatSidebar";
import { Icon } from "../../../components/ui/core/Icons"; // Assuming you have your Icon component
import { PopulatedWorkspaceSkeleton } from "./populated/PopulatedWorkspaceSkeleton";

export const PopulatedWorkspace = ({
  isRestoring = false,
}: {
  isRestoring?: boolean;
}) => {
  // Pull the active document directly from Redux! No need for messy props.
  const { activeDocument } = useAppSelector((state) => state.workspace);

  // 🛠️ THE FIX: Render a beautiful prompt instead of a blank screen!
  if (!activeDocument) {
    if (isRestoring) {
      return <PopulatedWorkspaceSkeleton />;
    }
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full text-light-text/60 dark:text-white/60 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-light-bg dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner border border-light-border dark:border-white/10">
          <Icon
            name="quick_reference_all"
            className="text-4xl text-light-primary/50 dark:text-dark-primary/50"
          />
        </div>
        <h2 className="text-2xl font-black text-light-text dark:text-white mb-2 tracking-tight">
          Select a Document
        </h2>
        <p className="text-sm font-medium max-w-sm text-center">
          Open a file from your Library to view its AI summary, extracted
          metadata, and chat with the context engine.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 relative z-10 flex flex-col h-full animate-enter w-full overflow-y-auto lg:overflow-hidden">
      {/* 1. The Header (Title, Breadcrumbs, Status) */}
      <DocumentHeader activeDocument={activeDocument} />

      {/* 2. The Main Content Split */}
      <div className="flex flex-col lg:flex-row gap-6 mt-2 items-stretch flex-1 min-h-0 overflow-y-auto lg:overflow-hidden w-full">
        {/* Left Column: full-height on desktop, natural on mobile */}
        <div className="flex-1 flex flex-col lg:h-full">
          <ExecutiveSummary activeDocument={activeDocument} />
        </div>

        {/* Right Column: AI chat — scrolls independently */}
        <div className="w-full lg:w-96 shrink-0 lg:h-full flex flex-col">
          <AIChatSidebar activeDocument={activeDocument} />
        </div>
      </div>
    </div>
  );
};
