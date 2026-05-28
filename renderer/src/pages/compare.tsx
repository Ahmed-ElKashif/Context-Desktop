import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/ui/Icons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchLibraryDocuments, DocumentData } from "../store/documentSlice";
import { notify } from "../components/ui/ToastEngine";

// Components
import { FileSelectorCard } from "../features/comparison/components/FileSelectorCard";
import { DocumentSelectorModal } from "../features/comparison/components/DocumentSelectorModal";
import { AiSynthesisCard } from "../features/comparison/components/AiSynthesisCard";
import { DeltaBoard } from "../features/comparison/components/DeltaBoard";
import { ComparisonResultSkeleton } from "../components/ui/skeletons/ComparisonResultSkeleton";
import { ComparisonHistorySidebar } from "../features/comparison/components/ComparisonHistorySidebar";
import { ComparisonChat } from "../features/comparison/components/ComparisonChat";

// State and Utils
import {
  loadComparisonRecord,
  runComparison,
  sendComparisonMessage,
  fetchComparisonChatHistory,
  setBaseDoc,
  setCompareDoc,
  clearActiveSession,
  hydrateSession,
} from "../store/comparisonSlice";
import { updateProfile } from "../store/authSlice";
import { exportComparisonReport } from "../features/comparison/utils/comparisonUtils";

export default function Compare() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { documentsList, isFetchingLibrary } = useAppSelector((state) => state.document);
  const currentUser = useAppSelector((state) => state.auth.user);

  // Redux state
  const {
    baseDoc,
    compareDoc,
    comparisonData,
    chatHistory,
    isComparing,
    isChatting,
  } = useAppSelector((state) => state.comparison);

  // Local UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectingFor, setSelectingFor] = useState<"base" | "compare">("base");

  // Track whether initial hydration has been attempted
  const hasHydrated = useRef(false);

  // ─── Effect 1: Hydrate from user profile on mount ───────────────────────────
  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;

    // If we already have a session active in Redux, no need to hydrate
    if (baseDoc && compareDoc) return;

    if (currentUser?.lastActiveComparisonId) {
      const loadHistory = async () => {
        try {
          const record = await dispatch(
            loadComparisonRecord(currentUser.lastActiveComparisonId!)
          ).unwrap();

          const mockBaseDoc = { _id: record.docIdA, title: record.titleA } as DocumentData;
          const mockCompareDoc = { _id: record.docIdB, title: record.titleB } as DocumentData;

          dispatch(
            hydrateSession({
              baseDoc: mockBaseDoc,
              compareDoc: mockCompareDoc,
              comparisonData: record.comparison,
            })
          );
        } catch (error) {
          console.error("Failed to load cached comparison history", error);
        }
      };
      loadHistory();
    }
  }, [currentUser?.lastActiveComparisonId, dispatch, baseDoc, compareDoc]);

  const hasRequestedChat = useRef(false);

  // ─── Effect 2: Fetch chat history when documents are set ────────────────────
  useEffect(() => {
    if (baseDoc && compareDoc && chatHistory.length === 0 && !isChatting && !hasRequestedChat.current) {
      hasRequestedChat.current = true;
      dispatch(fetchComparisonChatHistory());
    }

    // Reset when documents change
    if (!baseDoc || !compareDoc) {
      hasRequestedChat.current = false;
    }
  }, [baseDoc, compareDoc, chatHistory.length, isChatting, dispatch]);

  const hasRequestedLibrary = useRef(false);

  // ─── Effect 3: Fetch library documents if cache is empty ────────────────────
  useEffect(() => {
    if (documentsList.length === 0 && !isFetchingLibrary && !hasRequestedLibrary.current) {
      hasRequestedLibrary.current = true;
      dispatch(fetchLibraryDocuments());
    }
  }, [dispatch, documentsList.length, isFetchingLibrary]);

  const lastAttemptedPair = useRef<string | null>(null);

  // ─── Effect 4: Comparison engine — fires when doc pair changes ──────────────
  useEffect(() => {
    const run = async () => {
      if (baseDoc && compareDoc) {
        const pairId = `${baseDoc._id}-${compareDoc._id}`;

        // Prevent infinite loop if the comparison consistently rejects
        if (lastAttemptedPair.current === pairId) return;

        // Prevent re-running if we already have the exact data for this pair
        const alreadyCompared =
          comparisonData?.doc1?._id?.toString() === baseDoc._id &&
          comparisonData?.doc2?._id?.toString() === compareDoc._id;

        if (alreadyCompared || isComparing) return;

        // Mark this pair as attempted
        lastAttemptedPair.current = pairId;

        try {
          const result = await dispatch(runComparison()).unwrap();

          if (result.comparison._warning) {
            notify(result.comparison._warning, "warning");
          }
        } catch (error: any) {
          notify(error || "Failed to compare documents", "error");
        }
      } else {
        lastAttemptedPair.current = null;
      }
    };
    run();
  }, [baseDoc, compareDoc, comparisonData, isComparing, dispatch]);

  const openSelector = (type: "base" | "compare") => {
    setSelectingFor(type);
    setIsModalOpen(true);
  };

  const handleSelectDoc = (doc: DocumentData) => {
    if (selectingFor === "base") {
      if (compareDoc?._id === doc._id) {
        notify("This document is already selected for comparison.", "error");
        return;
      }
      dispatch(setBaseDoc(doc));
    } else {
      if (baseDoc?._id === doc._id) {
        notify("This document is already selected as the base file.", "error");
        return;
      }
      dispatch(setCompareDoc(doc));
    }
    setIsModalOpen(false);
  };

  const handleSelectHistory = async (historyId: string) => {
    try {
      const record = await dispatch(loadComparisonRecord(historyId)).unwrap();
      const mockBaseDoc = { _id: record.docIdA, title: record.titleA } as DocumentData;
      const mockCompareDoc = { _id: record.docIdB, title: record.titleB } as DocumentData;

      dispatch(
        hydrateSession({
          baseDoc: mockBaseDoc,
          compareDoc: mockCompareDoc,
          comparisonData: record.comparison,
        })
      );
      dispatch(updateProfile({ lastActiveComparisonId: historyId }));
    } catch (error) {
      notify("Failed to load history record", "error");
    }
  };

  const handleNewComparison = () => {
    dispatch(clearActiveSession());
  };

  const handleSendMessage = async (text: string) => {
    try {
      await dispatch(sendComparisonMessage(text)).unwrap();
    } catch (error: any) {
      notify(error || "Failed to send message", "error");
    }
  };

  const showChat = isComparing || !!comparisonData;

  return (
    <div className="h-full flex flex-row overflow-hidden relative bg-light-bg dark:bg-[#0A0A0C]">
      {/* ── NEW: Comparison History Sidebar ── */}
      <ComparisonHistorySidebar
        onSelectHistory={handleSelectHistory}
        onNewComparison={handleNewComparison}
      />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(16,55,102,0.04),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.04),transparent_70%)] pointer-events-none z-0"></div>

        {/* Header */}
        <header className="h-16 border-b border-light-border dark:border-white/5 bg-light-surface dark:bg-dark-surface flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-light-primary dark:text-dark-text/50 uppercase tracking-widest hidden sm:flex">
              <button
                onClick={() => navigate("/library")}
                className="hover:text-light-text dark:hover:text-white flex items-center gap-1 transition-colors"
              >
                Library
              </button>
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="text-light-text dark:text-white">Comparison Engine</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              id="tour-compare-export"
              onClick={() => exportComparisonReport(baseDoc, compareDoc, comparisonData)}
              className="flex items-center gap-2 px-3 py-1.5 bg-light-bg dark:bg-white/5 border border-light-border dark:border-white/10 rounded-lg text-xs font-bold text-light-text/80 dark:text-white/80 hover:text-light-primary dark:hover:text-white transition-colors shadow-sm"
            >
              <Icon name="download" className="text-[16px]" />
              Export Report
            </button>
          </div>
        </header>

        {/* Main Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 scroll-smooth">
          <div className="max-w-6xl mx-auto pb-48">
            {/* File Selection */}
            <div id="tour-compare-selectors" className="relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 mb-10 w-full pt-4">
              <div className="absolute top-1/2 left-0 w-full h-px bg-light-border dark:bg-white/10 -z-10 hidden md:block"></div>
              <FileSelectorCard type="base" document={baseDoc} onClick={() => openSelector("base")} />
              <div className="flex items-center justify-center bg-light-bg dark:bg-[#0A0A0C] p-2 rounded-full z-10 shrink-0 shadow-[0_0_0_8px_#F8F9FA] dark:shadow-[0_0_0_8px_#0A0A0C]">
                <div className="w-10 h-10 rounded-full border border-light-border dark:border-white/10 bg-white dark:bg-dark-surface shadow-sm flex items-center justify-center text-xs font-black text-light-text/50 dark:text-white/50 font-mono tracking-tighter">
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
                  <AiSynthesisCard isLoading={false} hasData={true} data={comparisonData.comparison} />
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

        {/* ─── Sticky Bottom Chat Bar ─── */}
        <ComparisonChat
          isVisible={showChat}
          chatHistory={chatHistory}
          isChatting={isChatting}
          onSendMessage={handleSendMessage}
        />

        {/* Document Selector Modal */}
        <DocumentSelectorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          documents={documentsList}
          onSelect={handleSelectDoc}
          title={selectingFor === "base" ? "Select Base File" : "Select Comparison File"}
        />
      </div>
    </div>
  );
}
