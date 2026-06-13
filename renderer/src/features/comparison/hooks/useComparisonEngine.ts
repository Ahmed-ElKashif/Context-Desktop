import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchLibraryDocuments, DocumentData } from "../../../store/library/librarySlice";
import { notify } from "../../../components/ui/feedback/ToastEngine";
import { updateProfile } from "../../../store/auth/authSlice";

import {
  loadComparisonRecord,
  runComparison,
  setBaseDoc,
  setCompareDoc,
  clearActiveSession,
  hydrateSession,
} from "../../../store/comparison/comparisonSlice";

export function useComparisonEngine() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { isFetchingLibrary, globalDocumentsList } = useAppSelector((state) => state.library);
  
  const comparisonState = useAppSelector((state) => state.comparison);
  const { baseDoc, compareDoc, comparisonData, isComparing } = comparisonState;

  // Trackers
  const hasHydrated = useRef(false);
  const hasRequestedLibrary = useRef(false);
  const lastAttemptedPair = useRef<string | null>(null);

  // ─── Effect 1: Hydrate from user profile on mount ───────────────────────────
  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;

    if (baseDoc && compareDoc) return; // already active

    if (currentUser?.lastActiveComparisonId) {
      const loadHistory = async () => {
        try {
          const record = await dispatch(loadComparisonRecord(currentUser.lastActiveComparisonId!)).unwrap();
          dispatch(
            hydrateSession({
              baseDoc: { _id: record.docIdA, title: record.titleA } as DocumentData,
              compareDoc: { _id: record.docIdB, title: record.titleB } as DocumentData,
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

  // ─── Effect 2: Fetch library documents if cache is empty ────────────────────
  useEffect(() => {
    if (globalDocumentsList.length === 0 && !isFetchingLibrary && !hasRequestedLibrary.current) {
      hasRequestedLibrary.current = true;
      dispatch(fetchLibraryDocuments());
    }
  }, [dispatch, globalDocumentsList.length, isFetchingLibrary]);

  // ─── Effect 3: Comparison engine — fires when doc pair changes ──────────────
  useEffect(() => {
    const run = async () => {
      if (baseDoc && compareDoc) {
        const pairId = `${baseDoc._id}-${compareDoc._id}`;
        if (lastAttemptedPair.current === pairId) return;

        const alreadyCompared =
          comparisonData?.doc1?._id?.toString() === baseDoc._id &&
          comparisonData?.doc2?._id?.toString() === compareDoc._id;

        if (alreadyCompared || isComparing) return;

        lastAttemptedPair.current = pairId;

        try {
          const result = await dispatch(runComparison()).unwrap();
          if (result.comparison._warning) {
            notify(result.comparison._warning, "warning");
          }
        } catch (error: any) {
          let errMsg = "Failed to compare documents";
          if (typeof error === 'string') errMsg = error;
          else if (error?.response?.data?.message) errMsg = error.response.data.message;
          else if (error?.data?.message) errMsg = error.data.message;
          else if (error?.message) errMsg = error.message;

          if (errMsg.includes("8-hour") || errMsg.includes("token budget")) {
            notify("Insufficient tokens to run this comparison. Please wait for your budget to reset.", "error");
          } else {
            notify(errMsg, "error");
          }
        }
      } else {
        lastAttemptedPair.current = null;
      }
    };
    run();
  }, [baseDoc, compareDoc, comparisonData, isComparing, dispatch]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleSelectDoc = (doc: DocumentData, selectingFor: "base" | "compare", onCloseModal: () => void) => {
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
    onCloseModal();
  };

  const handleSelectHistory = async (historyId: string) => {
    try {
      const record = await dispatch(loadComparisonRecord(historyId)).unwrap();
      dispatch(
        hydrateSession({
          baseDoc: { _id: record.docIdA, title: record.titleA } as DocumentData,
          compareDoc: { _id: record.docIdB, title: record.titleB } as DocumentData,
          comparisonData: record.comparison,
        })
      );
      dispatch(updateProfile({ lastActiveComparisonId: historyId }));
    } catch (error: unknown) {
      notify("Failed to load history record", "error");
    }
  };

  const handleNewComparison = () => {
    dispatch(clearActiveSession());
  };

  return {
    baseDoc,
    compareDoc,
    comparisonData,
    isComparing,
    documentsList: globalDocumentsList,
    handleSelectDoc,
    handleSelectHistory,
    handleNewComparison,
  };
}
