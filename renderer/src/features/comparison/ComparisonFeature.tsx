import { useState } from "react";

// Hooks
import { useComparisonEngine } from "./hooks/useComparisonEngine";
import { useComparisonChat } from "./hooks/useComparisonChat";

// Components
import { FileSelectorCard } from "./components/FileSelectorCard";
import { DocumentSelectorModal } from "./components/DocumentSelectorModal";
import { AiSynthesisCard } from "./components/AiSynthesisCard";
import { DeltaBoard } from "./components/DeltaBoard";
import { ComparisonResultSkeleton } from "../../components/ui/skeletons/ComparisonResultSkeleton";
import { ComparisonHistorySidebar } from "./components/ComparisonHistorySidebar";
import { ComparisonChat } from "./components/ComparisonChat";
import { ComparisonHeader } from "./components/ComparisonHeader";

export function ComparisonFeature() {
  // ─── 1. Engine & Lifecycle (Redux Wrapper) ──────────────────────────────────
  const {
    baseDoc,
    compareDoc,
    comparisonData,
    isComparing,
    documentsList,
    handleSelectDoc,
    handleSelectHistory,
    handleNewComparison,
  } = useComparisonEngine();

  // ─── 2. Chat & Streaming (Redux Wrapper) ────────────────────────────────────
  const { chatHistory, isChatting, handleSendMessage } = useComparisonChat();

  // ─── 3. Local UI State ──────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectingFor, setSelectingFor] = useState<"base" | "compare">("base");

  const openSelector = (type: "base" | "compare") => {
    setSelectingFor(type);
    setIsModalOpen(true);
  };

  const showChat = isComparing || !!comparisonData;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-row overflow-hidden relative bg-light-bg dark:bg-[#0A0A0C]">
      <ComparisonHistorySidebar
        onSelectHistory={handleSelectHistory}
        onNewComparison={handleNewComparison}
      />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(16,55,102,0.04),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.04),transparent_70%)] pointer-events-none z-0"></div>

        <ComparisonHeader
          baseDoc={baseDoc}
          compareDoc={compareDoc}
          comparisonData={comparisonData}
        />

        {/* Main Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 scroll-smooth">
          <div className="max-w-6xl mx-auto pb-48">
            {/* File Selection */}
            <div
              id="tour-compare-selectors"
              className="relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 mb-10 w-full pt-4"
            >
              <div className="absolute top-1/2 left-0 w-full h-px bg-light-border dark:bg-white/10 -z-10 hidden md:block"></div>
              <FileSelectorCard
                type="base"
                document={baseDoc}
                onClick={() => openSelector("base")}
              />
              <div className="flex items-center justify-center bg-light-bg dark:bg-[#0A0A0C] p-2 rounded-full z-10 shrink-0 shadow-[0_0_0_8px_#F8F9FA] dark:shadow-[0_0_0_8px_#0A0A0C]">
                <div className="w-10 h-10 rounded-full border border-light-border dark:border-white/10 bg-white dark:bg-dark-surface shadow-sm flex items-center justify-center text-xs font-black text-light-text/70 dark:text-white/70 font-mono tracking-tighter">
                  VS
                </div>
              </div>
              <FileSelectorCard
                type="compare"
                document={compareDoc}
                onClick={() => openSelector("compare")}
              />
            </div>

            {/* AI Synthesis & Delta Board */}
            <div>
              {isComparing ? (
                <ComparisonResultSkeleton />
              ) : comparisonData ? (
                <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                  <AiSynthesisCard
                    isLoading={false}
                    hasData={true}
                    data={comparisonData.comparison}
                  />
                  <DeltaBoard
                    uniqueToBase={comparisonData.comparison.uniqueToA}
                    sharedConcepts={comparisonData.comparison.similarities}
                    uniqueToCompare={comparisonData.comparison.uniqueToB}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Sticky Bottom Chat Bar */}
        <ComparisonChat
          isVisible={showChat}
          chatHistory={chatHistory}
          isChatting={isChatting}
          onSendMessage={handleSendMessage}
        />

        <DocumentSelectorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          documents={documentsList}
          onSelect={(doc) =>
            handleSelectDoc(doc, selectingFor, () => setIsModalOpen(false))
          }
          title={
            selectingFor === "base"
              ? "Select Base File"
              : "Select Comparison File"
          }
        />
      </div>
    </div>
  );
}
