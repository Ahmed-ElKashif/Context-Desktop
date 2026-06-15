import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "../hooks";
import { comparisonHistoryService, ComparisonHistoryItem, ComparisonRecord } from "../../features/comparison/api/comparisonHistoryService";
import { ComparisonResponse, comparisonService } from "../../features/comparison/api/comparisonService";
import { DocumentData } from "../library/librarySlice";
import { ChatMessage, chatService } from "../../features/comparison/api/chatService";
import { fetchSettings } from "../settings/settingsSlice";
import { updateProfile } from "../auth/authSlice";
import { reloadDocumentThunk, reanalyzeDocumentThunk } from "../library/thunks/documentThunks";

interface ComparisonState {
  history: ComparisonHistoryItem[];
  isFetchingHistory: boolean;
  activeComparisonId: string | null;
  error: string | null;
  searchQuery: string;

  // Active Session State
  baseDoc: DocumentData | null;
  compareDoc: DocumentData | null;
  comparisonData: ComparisonResponse | null;
  chatHistory: ChatMessage[];
  isComparing: boolean;
  isChatting: boolean;
}

const initialState: ComparisonState = {
  history: [],
  isFetchingHistory: false,
  activeComparisonId: null,
  error: null,
  searchQuery: "",

  baseDoc: null,
  compareDoc: null,
  comparisonData: null,
  chatHistory: [],
  isComparing: false,
  isChatting: false,
};

// Thunks
export const fetchComparisonHistory = createAppAsyncThunk(
  "comparison/fetchHistory",
  async () => {
    const data = await comparisonHistoryService.getHistory();
    return data;
  }
);

export const runComparison = createAppAsyncThunk(
  "comparison/run",
  async (_, { getState, dispatch }) => {
    const state = getState();
    const { baseDoc, compareDoc, history } = state.comparison;

    if (!baseDoc || !compareDoc) throw new Error("Missing documents");

    // Check for existing comparison in history
    const existing = history.find(
      (h: ComparisonHistoryItem) =>
    (h.docIdA === baseDoc._id && h.docIdB === compareDoc._id) ||
    (h.docIdA === compareDoc._id && h.docIdB === baseDoc._id)
    );

    if (existing) {
      throw new Error("You have already compared these two documents. Please check your comparison history.");
    }

    const result = await comparisonService.compareDocuments(baseDoc._id, compareDoc._id);
    dispatch(fetchSettings()); // Refresh AI budget

    // Try to save to history, but don't fail the whole action if saving fails
    const newRecord = await dispatch(
      saveComparisonRecord({
    docIdA: baseDoc._id,
    docIdB: compareDoc._id,
    titleA: baseDoc.title,
    titleB: compareDoc.title,
    comparison: result,
    user: state.auth.user?.id || "",
      })
    ).unwrap();
    dispatch(updateProfile({ lastActiveComparisonId: newRecord._id }));

    return result;
  }
);

export const loadComparisonRecord = createAppAsyncThunk(
  "comparison/loadRecord",
  async (id: string) => {
    const data = await comparisonHistoryService.getRecordById(id);
    return data;
  }
);

export const saveComparisonRecord = createAppAsyncThunk(
  "comparison/saveRecord",
  async (payload: Omit<ComparisonRecord, "_id" | "createdAt" | "updatedAt">) => {
    const data = await comparisonHistoryService.saveRecord(payload);
    return data;
  }
);

export const renameComparisonRecord = createAppAsyncThunk(
  "comparison/renameRecord",
  async (payload: { id: string; customTitle: string }) => {
    const data = await comparisonHistoryService.renameRecord(payload.id, payload.customTitle);
    return { id: payload.id, customTitle: payload.customTitle, data };
  }
);

export const deleteComparisonRecord = createAppAsyncThunk(
  "comparison/deleteRecord",
  async (id: string) => {
    await comparisonHistoryService.deleteRecord(id);
    return id;
  }
);

// Thunk to send chat message
export const sendComparisonMessage = createAppAsyncThunk(
  "comparison/sendMessage",
  async (text: string, { getState }) => {
    const state = getState();
    const { baseDoc, compareDoc } = state.comparison;

    if (!baseDoc || !compareDoc) throw new Error("Missing data");

    const aiResponse = await chatService.sendMessage(baseDoc._id, compareDoc._id, text);
    return aiResponse;
  }
);

// Thunk to fetch chat history
export const fetchComparisonChatHistory = createAppAsyncThunk(
  "comparison/fetchChatHistory",
  async (_, { getState }) => {
    const state = getState();
    const { baseDoc, compareDoc } = state.comparison;

    if (!baseDoc || !compareDoc) throw new Error("Missing data");

    const history = await chatService.getChatHistory(baseDoc._id, compareDoc._id);
    return history;
  }
);

const comparisonSlice = createSlice({
  name: "comparison",
  initialState,
  reducers: {
    setActiveComparisonId: (state, action: PayloadAction<string | null>) => {
      state.activeComparisonId = action.payload;
    },
    clearHistoryState: (state) => {
      state.history = [];
      state.activeComparisonId = null;
    },
    setBaseDoc: (state, action: PayloadAction<DocumentData | null>) => {
      state.baseDoc = action.payload;
    },
    setCompareDoc: (state, action: PayloadAction<DocumentData | null>) => {
      state.compareDoc = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearActiveSession: (state) => {
      state.baseDoc = null;
      state.compareDoc = null;
      state.comparisonData = null;
      state.chatHistory = [];
      state.activeComparisonId = null;
    },
    // Useful when hydrating from history
    hydrateSession: (state, action: PayloadAction<{ baseDoc: DocumentData; compareDoc: DocumentData; comparisonData: ComparisonResponse; }>) => {
      state.baseDoc = action.payload.baseDoc;
      state.compareDoc = action.payload.compareDoc;
      state.comparisonData = action.payload.comparisonData;
      state.chatHistory = []; // Cleared on hydration, then fetched
    },
    addUserMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.chatHistory.push(action.payload);
    },
    removeLastMessage: (state) => {
      state.chatHistory.pop();
    },
    appendChunkToLastMessage: (state, action: PayloadAction<string>) => {
      if (state.chatHistory.length > 0) {
    const lastIndex = state.chatHistory.length - 1;
    state.chatHistory[lastIndex].content += action.payload;
      }
    },
    setIsChatting: (state, action: PayloadAction<boolean>) => {
      state.isChatting = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch History
      .addCase(fetchComparisonHistory.pending, (state) => {
    state.isFetchingHistory = true;
    state.error = null;
      })
      .addCase(fetchComparisonHistory.fulfilled, (state, action) => {
    state.isFetchingHistory = false;
    state.history = action.payload;
      })
      .addCase(fetchComparisonHistory.rejected, (state, action) => {
    state.isFetchingHistory = false;
    state.error = (action.error.message || "An unexpected error occurred") as string;
      })
      // Save Record
      .addCase(saveComparisonRecord.fulfilled, (state, action) => {
    // Prepend new item
    state.history.unshift(action.payload);
    state.activeComparisonId = action.payload._id;
      })
      // Load Record
      .addCase(loadComparisonRecord.pending, (state) => {
    state.isComparing = true;
    state.error = null;
      })
      .addCase(loadComparisonRecord.fulfilled, (state, action) => {
    state.isComparing = false;
    state.activeComparisonId = action.payload._id;
      })
      .addCase(loadComparisonRecord.rejected, (state, action) => {
    state.isComparing = false;
    state.error = (action.error.message || "An unexpected error occurred") as string;
      })
      // Run Comparison
      .addCase(runComparison.pending, (state) => {
    state.isComparing = true;
    state.comparisonData = null;
      })
      .addCase(runComparison.fulfilled, (state, action) => {
    state.isComparing = false;
    state.comparisonData = action.payload;
      })
      .addCase(runComparison.rejected, (state) => {
    state.isComparing = false;
    state.comparisonData = null;
      })
      // Fetch Chat History
      .addCase(fetchComparisonChatHistory.fulfilled, (state, action) => {
    state.chatHistory = action.payload;
      })
      // Send Chat Message
      .addCase(sendComparisonMessage.pending, (state, action) => {
    state.isChatting = true;
    // Optimistically add the user's message
    state.chatHistory.push({ role: "user", content: action.meta.arg });
      })
      .addCase(sendComparisonMessage.fulfilled, (state, action) => {
    state.isChatting = false;
    // Append the AI's response
    state.chatHistory.push(action.payload);
      })
      .addCase(sendComparisonMessage.rejected, (state) => {
    state.isChatting = false;
    // Remove the user's message if the request failed
    state.chatHistory.pop();
      })
      // Rename Record
      .addCase(renameComparisonRecord.fulfilled, (state, action) => {
    const item = state.history.find(i => i._id === action.payload.id);
    if (item) {
      item.customTitle = action.payload.customTitle;
    }
      })
      // Delete Record
      .addCase(deleteComparisonRecord.fulfilled, (state, action) => {
        state.history = state.history.filter(i => i._id !== action.payload);
      })
      // Sync document updates from library (e.g. SSE status changes)
      .addCase(reloadDocumentThunk.fulfilled, (state, action) => {
        if (state.baseDoc?._id === action.payload._id) {
          state.baseDoc = action.payload;
        }
        if (state.compareDoc?._id === action.payload._id) {
          state.compareDoc = action.payload;
        }
      })
      .addCase(reanalyzeDocumentThunk.fulfilled, (state, action) => {
        if (state.baseDoc?._id === action.payload._id) {
          state.baseDoc = action.payload;
        }
        if (state.compareDoc?._id === action.payload._id) {
          state.compareDoc = action.payload;
        }
      });
  },
});

export const {
  setActiveComparisonId,
  clearHistoryState,
  setBaseDoc,
  setCompareDoc,
  setSearchQuery,
  clearActiveSession,
  hydrateSession,
  addUserMessage,
  removeLastMessage,
  appendChunkToLastMessage,
  setIsChatting,
} = comparisonSlice.actions;
export default comparisonSlice.reducer;
