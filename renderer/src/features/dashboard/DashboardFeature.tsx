import { useEffect, useState } from "react";
import {
  DocumentData,
  setActiveDocument,
  fetchFolderContents, // 🛠️ THE FIX: New action to check folder contents
  fetchFolderTree // 🛠️ THE FIX: New action to check the entire folder structure
} from "../../store/documentSlice";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { OnboardingDashboard } from "./components/OnboardingDashboard";
import { EngineRouterSkeleton } from "../../components/ui/EngineRouterSkeleton";
import { PopulatedDashboard } from "./components/PopulatedDashboard";
import { documentService } from "./api/documentService";
import { updateProfile, updateUserLocalState } from "../../store/authSlice";

export const DashboardFeature = () => {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [isRestoring, setIsRestoring] = useState(
    () => !!currentUser?.lastActiveDocumentId,
  );
  const [hasCheckedLibrary, setHasCheckedLibrary] = useState(false);
  const { 
    activeDocument, 
    isUploading, 
    documentsList, 
    pagination, 
    globalFolderTree, 
    foldersList 
  } = useAppSelector((state) => state.document);

  // 1. Lightweight check to see if they own ANY files or folders
  useEffect(() => {
    let isCancelled = false;

    if (!pagination) {
      setHasCheckedLibrary(false);
      // 🛠️ THE FIX: Check the actual folder structure, not just the legacy flat list!
      Promise.all([
        dispatch(fetchFolderContents({ limit: 1 })),
        dispatch(fetchFolderTree()),
      ]).finally(() => {
        if (!isCancelled) {
          setHasCheckedLibrary(true);
        }
      });
    } else {
      setHasCheckedLibrary(true);
    }

    return () => {
      isCancelled = true;
    };
  }, [dispatch, pagination]);

  // Remember the most recently opened document
  useEffect(() => {
    if (activeDocument?._id && activeDocument._id !== currentUser?.lastActiveDocumentId) {
      dispatch(updateUserLocalState({ lastActiveDocumentId: activeDocument._id }));
      dispatch(updateProfile({ lastActiveDocumentId: activeDocument._id }));
    }
  }, [activeDocument?._id, currentUser?.lastActiveDocumentId, dispatch]);

  // Restore the last opened document when returning to the dashboard
  useEffect(() => {
    if (activeDocument?._id) {
      if (isRestoring) setIsRestoring(false);
      return;
    }

    const lastId = currentUser?.lastActiveDocumentId;
    if (!lastId) {
      setIsRestoring(false);
      return;
    }

    const cachedDoc = documentsList.find((doc) => doc._id === lastId);
    if (cachedDoc) {
      dispatch(setActiveDocument(cachedDoc));
      setIsRestoring(false);
      return;
    }

    let isCancelled = false;
    setIsRestoring(true);

    documentService
      .getDocument(lastId)
      .then((doc) => {
        if (!isCancelled) {
          dispatch(setActiveDocument(doc));
        }
      })
      .catch(() => {
        if (!isCancelled) {
          dispatch(updateUserLocalState({ lastActiveDocumentId: null }));
          dispatch(updateProfile({ lastActiveDocumentId: null }));
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsRestoring(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [dispatch, activeDocument?._id, documentsList, isRestoring]);

  const totalDocs = pagination?.totalItems ?? documentsList.length;
  const hasFolders = globalFolderTree.length > 0 || foldersList.length > 0;
  
  // 🛠️ THE FIX: They are NOT a new user if they have ANY documents OR ANY folders.
  const isBrandNewUser = hasCheckedLibrary && totalDocs === 0 && !hasFolders;

  // State 1: The TRUE Onboarding (Zero files/folders in their entire account)
  if (isBrandNewUser && !isUploading && !activeDocument) {
    return (
      <OnboardingDashboard
        onUploadSuccess={(docData: DocumentData) => {
          // Safety check in case the batch response doesn't return a single active document
          if (docData) {
            dispatch(setActiveDocument(docData));
          }
        }}
      />
    );
  }

  // State 2: Uploading only (AI can continue in background)
  if (isUploading) {
    return <EngineRouterSkeleton />;
  }

  // State 3: Done! (Or waiting for them to select a file from the Library)
  return (
    <PopulatedDashboard isRestoring={isRestoring || !hasCheckedLibrary} />
  );
};