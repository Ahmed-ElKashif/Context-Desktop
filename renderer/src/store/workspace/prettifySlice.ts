
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  prettifyService,
  PrettifyLimitError,
} from "../../services/prettify.service";
import { updateDocumentPrettifyResult } from "../library/librarySlice";
import { fetchSettings } from "../settings/settingsSlice";
import { notify } from "../../components/ui/feedback/ToastEngine";
import { addNotification } from "../ui/notificationSlice";

interface PrettifyState {
  isPrettifying: boolean;
  error: string | null;
  limitError: PrettifyLimitError | null;
  activeDocumentId: string | null;
}

const initialState: PrettifyState = {
  isPrettifying: false,
  error: null,
  limitError: null,
  activeDocumentId: null,
};

export const prettifyDocumentThunk = createAsyncThunk(
  "prettify/run",
  async (
    payload: { documentId: string; force?: boolean },
    { dispatch, rejectWithValue, signal },
  ) => {
    try {
      const result = await prettifyService.prettifyDocument(
        payload.documentId,
        payload.force,
        signal,
      );

      // Immediately sync with the global document slice so the active document gets the new JSON!
      dispatch(
        updateDocumentPrettifyResult({
          documentId: payload.documentId,
          prettifiedJson: result,
        }),
      );

      // Update tokens/budget in UI
      dispatch(fetchSettings());

      // Notify the user via global toast & system notification
      notify("Document Prettified Successfully!", "success", "prettify-success");
      dispatch(
        addNotification({
          message: "Your document has been successfully structured.",
          type: "success",
        }),
      );

      return { documentId: payload.documentId, result };
    } catch (error: unknown) {
      // Check if it's a structural limit error (e.g. max cells, max chars)
      const err = error as unknown as PrettifyLimitError;
      if (err?.limit && err?.fileType) {
        return rejectWithValue(err as PrettifyLimitError);
      }
      throw error; // Let the Axios interceptor message bubble up via action.error.message
    }
  },
);

const prettifySlice = createSlice({
  name: "prettify",
  initialState,
  reducers: {
    clearPrettifyError: (state) => {
      state.error = null;
      state.limitError = null;
    },
    resetPrettifyState: (state) => {
      state.isPrettifying = false;
      state.error = null;
      state.limitError = null;
      state.activeDocumentId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(prettifyDocumentThunk.pending, (state, action) => {
        state.isPrettifying = true;
        state.error = null;
        state.limitError = null;
        state.activeDocumentId = action.meta.arg.documentId;
      })
      .addCase(prettifyDocumentThunk.fulfilled, (state) => {
        state.isPrettifying = false;
        state.error = null;
        state.limitError = null;
        state.activeDocumentId = null;
      })
      .addCase(prettifyDocumentThunk.rejected, (state, action) => {
        state.isPrettifying = false;
        state.activeDocumentId = null;
        const msg = action.error.message || "An unexpected error occurred";
        if (msg.toLowerCase().includes("limit") || msg.toLowerCase().includes("upgrade")) {
          state.limitError = { 
            error: "PRETTIFY_LIMIT_EXCEEDED", 
            message: msg, 
            limit: { "pages": 5 }, 
            actual: { "pages": 10 }, 
            fileType: "document", 
            suggestion: "Upgrade your plan" 
          };
          state.error = msg;
        } else {
          state.error = msg;
        }
      });
  },
});

export const { clearPrettifyError, resetPrettifyState } = prettifySlice.actions;

export default prettifySlice.reducer;
