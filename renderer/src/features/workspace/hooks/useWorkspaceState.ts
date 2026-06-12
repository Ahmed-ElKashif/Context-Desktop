import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  DocumentData,
  fetchFolderContents,
  fetchFolderTree,
} from "../../../store/library/librarySlice";
import { setActiveDocument } from "../../../store/workspace/workspaceSlice";
import { updateProfile, updateUserLocalState } from "../../../store/auth/authSlice";
import { documentService } from "../../library/api/documentService";

export function useWorkspaceState() {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  
  const [isRestoring, setIsRestoring] = useState(() => !!currentUser?.lastActiveDocumentId);
  const [hasCheckedLibrary, setHasCheckedLibrary] = useState(false);
  
  const { activeDocument } = useAppSelector((state) => state.workspace);
  const { 
    isUploading, 
    documentsList, 
    globalDocumentsList,
    pagination, 
    globalFolderTree, 
    foldersList 
  } = useAppSelector((state) => state.library);

  // 1. Lightweight check to see if they own ANY files or folders
  useEffect(() => {
    let isCancelled = false;

    if (!pagination) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasCheckedLibrary(false);
      Promise.all([
        dispatch(fetchFolderContents({ limit: 10 })),
        dispatch(fetchFolderTree()),
      ]).finally(() => {
        if (!isCancelled) setHasCheckedLibrary(true);
      });
    } else {
      setHasCheckedLibrary(true);
    }

    return () => {
      isCancelled = true;
    };
  }, [dispatch, pagination]);

  // 2. Remember the most recently opened document
  useEffect(() => {
    if (activeDocument?._id && activeDocument._id !== currentUser?.lastActiveDocumentId) {
      dispatch(updateUserLocalState({ lastActiveDocumentId: activeDocument._id }));
      dispatch(updateProfile({ lastActiveDocumentId: activeDocument._id }));
    }
  }, [activeDocument?._id, currentUser?.lastActiveDocumentId, dispatch]);

  // 3. Restore the last opened document when returning to the workspace
  useEffect(() => {
    if (activeDocument?._id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (isRestoring) setIsRestoring(false);
      return;
    }

    const lastId = currentUser?.lastActiveDocumentId;
    if (!lastId) {
      setIsRestoring(false);
      return;
    }

    const cachedDoc = documentsList.find((doc) => doc._id === lastId) || globalDocumentsList.find((doc) => doc._id === lastId);
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
        if (!isCancelled) dispatch(setActiveDocument(doc));
      })
      .catch(() => {
        if (!isCancelled) {
          dispatch(updateUserLocalState({ lastActiveDocumentId: null }));
          dispatch(updateProfile({ lastActiveDocumentId: null }));
        }
      })
      .finally(() => {
        if (!isCancelled) setIsRestoring(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [dispatch, activeDocument?._id, documentsList, globalDocumentsList, isRestoring, currentUser?.lastActiveDocumentId]);

  const totalDocs = pagination?.totalItems ?? documentsList.length;
  const hasFolders = globalFolderTree.length > 0 || foldersList.length > 0;
  
  const isBrandNewUser = hasCheckedLibrary && totalDocs === 0 && !hasFolders;

  const handleUploadSuccess = (docData: DocumentData) => {
    if (docData) {
      dispatch(setActiveDocument(docData));
    }
  };

  return {
    isBrandNewUser,
    isUploading,
    activeDocument,
    isRestoring: isRestoring || !hasCheckedLibrary,
    handleUploadSuccess,
  };
}
