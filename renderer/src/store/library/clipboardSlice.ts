import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ClipboardState {
  action: "copy" | null;
  documentIds: string[];
  folderIds: string[];
}

const initialState: ClipboardState = {
  action: null,
  documentIds: [],
  folderIds: [],
};

const clipboardSlice = createSlice({
  name: "clipboard",
  initialState,
  reducers: {
    setClipboard: (
      state,
      action: PayloadAction<{
        action: "copy";
        documentIds: string[];
        folderIds: string[];
      }>
    ) => {
      state.action = action.payload.action;
      state.documentIds = action.payload.documentIds;
      state.folderIds = action.payload.folderIds;
    },
    clearClipboard: (state) => {
      state.action = null;
      state.documentIds = [];
      state.folderIds = [];
    },
  },
});

export const { setClipboard, clearClipboard } = clipboardSlice.actions;
export default clipboardSlice.reducer;
