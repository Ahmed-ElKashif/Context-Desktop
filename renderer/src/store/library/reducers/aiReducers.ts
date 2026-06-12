import { SemanticUpdate } from "../librarySlice";
import { ActionReducerMapBuilder } from "@reduxjs/toolkit";
import type { LibraryState } from "../librarySlice";
import {
  generateSemanticStructure,
  applySemanticFolders,
  proposeGlobalFolderStructureThunk,
  synthesizeDocumentsThunk,
} from "../thunks/aiThunks";

export const buildAIReducers = (builder: ActionReducerMapBuilder<LibraryState>) => {
  builder
    // ------------------------------------------------------------------------
    // generateSemanticStructure
    // ------------------------------------------------------------------------
    .addCase(generateSemanticStructure.pending, (state) => {
      state.isAnalyzingFolders = true;
      state.error = null;
    })
    .addCase(generateSemanticStructure.fulfilled, (state, action) => {
      state.isAnalyzingFolders = false;
      state.proposedFolderUpdates = action.payload;
    })
    .addCase(generateSemanticStructure.rejected, (state, action) => {
      state.isAnalyzingFolders = false;
      state.error = (action.error.message || "An unexpected error occurred") as string;
    })

    // ------------------------------------------------------------------------
    // applySemanticFolders
    // ------------------------------------------------------------------------
    .addCase(applySemanticFolders.pending, (state) => {
      state.isApplyingFolders = true;
      state.error = null;
    })
    .addCase(applySemanticFolders.fulfilled, (state) => {
      state.isApplyingFolders = false;
      state.proposedFolderUpdates = null;
    })
    .addCase(applySemanticFolders.rejected, (state, action) => {
      state.isApplyingFolders = false;
      state.error = (action.error.message || "An unexpected error occurred") as string;
    })

    // ------------------------------------------------------------------------
    // proposeGlobalFolderStructureThunk
    // ------------------------------------------------------------------------
    .addCase(proposeGlobalFolderStructureThunk.pending, (state) => {
      state.isUploading = true;
      state.error = null;
    })
    .addCase(proposeGlobalFolderStructureThunk.fulfilled, (state, action) => {
      state.isUploading = false;
      const tree = action.payload?.data?.tree;
      if (Array.isArray(tree) && tree.length > 0) {
        const updates: SemanticUpdate[] = []; // SemanticUpdate[]
        interface SemanticFolderNode {
          name?: string;
          documentIds?: string[];
          subfolders?: SemanticFolderNode[];
        }
        tree.forEach((topNode: SemanticFolderNode) => {
          if (Array.isArray(topNode.documentIds)) {
            topNode.documentIds.forEach((id: string) => {
              updates.push({ documentId: id, newPath: topNode.name || "Untitled" });
            });
          }
          if (Array.isArray(topNode.subfolders)) {
            topNode.subfolders.forEach((sub: SemanticFolderNode) => {
              if (Array.isArray(sub.documentIds)) {
                sub.documentIds.forEach((id: string) => {
                  updates.push({
                    documentId: id,
                    newPath: `${topNode.name || "Untitled"}/${sub.name || "Untitled"}`,
                  });
                });
              }
            });
          }
        });
        state.proposedFolderUpdates = updates;
      }
    })
    .addCase(proposeGlobalFolderStructureThunk.rejected, (state, action) => {
      state.isUploading = false;
      state.error = (action.error.message || "An unexpected error occurred") as string;
    })

    // ------------------------------------------------------------------------
    // synthesizeDocumentsThunk
    // ------------------------------------------------------------------------
    .addCase(synthesizeDocumentsThunk.pending, (state) => {
      state.isSynthesizing = true;
      state.synthesisResult = null;
      state.error = null;
    })
    .addCase(synthesizeDocumentsThunk.fulfilled, (state, action) => {
      state.isSynthesizing = false;
      state.synthesisResult = typeof action.payload === "string" ? action.payload : (action.payload as { summary?: string })?.summary || "";
    })
    .addCase(synthesizeDocumentsThunk.rejected, (state, action) => {
      state.isSynthesizing = false;
      state.error = (action.error.message || "An unexpected error occurred") as string;
    });
};
