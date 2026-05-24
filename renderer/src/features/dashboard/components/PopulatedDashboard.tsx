import { useAppSelector } from "../../../store/hooks";
import { DocumentHeader } from "./populated/DocumentHeader";
import { ExecutiveSummary } from "./populated/ExecutiveSummary";
import { AIChatSidebar } from "./populated/AIChatSidebar";
import { PopulatedDashboardSkeleton } from "./populated/PopulatedDashboardSkeleton";
import { DesktopHomeView } from "./populated/DesktopHomeView";

export const PopulatedDashboard = ({
  isRestoring = false,
}: {
  isRestoring?: boolean;
}) => {
  // Pull the active document directly from Redux! No need for messy props.
  const { activeDocument } = useAppSelector((state) => state.document);

  // 🛠️ THE FIX: Render a beautiful prompt instead of a blank screen!
  if (!activeDocument) {
    if (isRestoring) {
      return <PopulatedDashboardSkeleton />;
    }
    return <DesktopHomeView />;
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
