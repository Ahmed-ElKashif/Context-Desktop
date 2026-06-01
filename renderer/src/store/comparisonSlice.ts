import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { comparisonHistoryService, ComparisonHistoryItem } from "../features/comparison/api/comparisonHistoryService";
import { ComparisonResponse, comparisonService } from "../features/comparison/api/comparisonService";
import { DocumentData } from "./documentSlice";
import { ChatMessage, chatService } from "../features/comparison/api/chatService";
import { fetchSettings } from "./settingsSlice";
import { updateProfile } from "./authSlice";

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
export const fetchComparisonHistory = createAsyncThunk(
  "comparison/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const data = await comparisonHistoryService.getHistory();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch comparison history");
    }
  }
);

export const saveComparisonRecord = createAsyncThunk(
  "comparison/saveRecord",
  async (payload: { docIdA: string; docIdB: string; titleA: string; titleB: string; comparison: ComparisonResponse }, { rejectWithValue }) => {
    try {
      const data = await comparisonHistoryService.saveRecord(payload);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to save comparison record");
    }
  }
);

// We don't store the full record in Redux to save memory, just return it so components can use it
export const loadComparisonRecord = createAsyncThunk(
  "comparison/loadRecord",
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await comparisonHistoryService.getRecordById(id);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to load comparison record");
    }
  }
);

// Thunk to rename record
export const renameComparisonRecord = createAsyncThunk(
  "comparison/renameRecord",
  async ({ id, customTitle }: { id: string; customTitle: string }, { rejectWithValue }) => {
    try {
      await comparisonHistoryService.renameRecord(id, customTitle);
      return { id, customTitle };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to rename comparison record");
    }
  }
);

// Thunk to delete record
export const deleteComparisonRecord = createAsyncThunk(
  "comparison/deleteRecord",
  async (id: string, { getState, dispatch, rejectWithValue }) => {
    try {
      await comparisonHistoryService.deleteRecord(id);
      
      const state = getState() as any;
      if (state.comparison.activeComparisonId === id) {
        dispatch(clearActiveSession());
      }
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete comparison record");
    }
  }
);

// Thunk to run comparison engine
export const runComparison = createAsyncThunk(
  "comparison/runComparison",
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as any;
    const { baseDoc, compareDoc, history } = state.comparison;

    if (!baseDoc || !compareDoc) return rejectWithValue("Missing documents");

    // Prevent comparing the same exact file against itself
    if (baseDoc._id === compareDoc._id) {
      return rejectWithValue("Cannot compare a document with itself.");
    }

    // Check for existing comparison in history
    const existing = history.find(
      (h: any) =>
        (h.docIdA === baseDoc._id && h.docIdB === compareDoc._id) ||
        (h.docIdA === compareDoc._id && h.docIdB === baseDoc._id)
    );

    if (existing) {
      return rejectWithValue("You have already compared these two documents. Please check your comparison history.");
    }

    try {
      const result = await comparisonService.compareDocuments(baseDoc._id, compareDoc._id);
      dispatch(fetchSettings()); // Refresh AI budget

      // Try to save to history, but don't fail the whole action if saving fails
      try {
        const newRecord = await dispatch(
          saveComparisonRecord({
            docIdA: baseDoc._id,
            docIdB: compareDoc._id,
            titleA: baseDoc.title,
            titleB: compareDoc.title,
            comparison: result,
          })
        ).unwrap();
        dispatch(updateProfile({ lastActiveComparisonId: newRecord._id }));
      } catch (err) {
        console.error("Failed to save comparison to history", err);
      }

      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to compare documents");
    }
  }
);

// Thunk to send chat message
export const sendComparisonMessage = createAsyncThunk(
  "comparison/sendMessage",
  async (text: string, { getState, rejectWithValue }) => {
    const state = getState() as any;
    const { baseDoc, compareDoc } = state.comparison;
    const token = state.auth.token;

    if (!baseDoc || !compareDoc || !token) return rejectWithValue("Missing data");

    try {
      const aiResponse = await chatService.sendMessage(baseDoc._id, compareDoc._id, text);
      return aiResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to send message");
    }
  }
);

// Thunk to fetch chat history
export const fetchComparisonChatHistory = createAsyncThunk(
  "comparison/fetchChatHistory",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as any;
    const { baseDoc, compareDoc } = state.comparison;
    const token = state.auth.token;

    if (!baseDoc || !compareDoc || !token) return rejectWithValue("Missing data");

    try {
      const history = await chatService.getChatHistory(baseDoc._id, compareDoc._id);
      return history;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch chat history");
    }
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
        state.error = action.payload as string;
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
        state.error = action.payload as string;
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
} = comparisonSlice.actions;
export default comparisonSlice.reducer;
