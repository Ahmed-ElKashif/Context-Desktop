import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { settingsService, UpdateSettingsPayload, UserSettings } from '../../features/settings/api/settingsService';
export interface SettingsState extends UserSettings {
  aiUsage: {
    tokensUsed: number;
    dailyLimit: number;
    remaining: number;
    monthlyUsed?: number;
    monthlyLimit?: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  theme: 'system',
  notificationsEnabled: true,
  language: 'en',
  aiUsage: null,
  isLoading: false,
  error: null,
};

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async () => {
    return await settingsService.getSettings();
  }
);

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (payload: UpdateSettingsPayload) => {
    return await settingsService.updateSettings(payload);
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLocalTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
    state.isLoading = true;
    state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
    state.isLoading = false;
    state.theme = action.payload.theme;
    state.notificationsEnabled = action.payload.notificationsEnabled;
    state.language = action.payload.language;
    state.aiUsage = action.payload.aiUsage || null; 
      })
      .addCase(fetchSettings.rejected, (state, action) => {
    state.isLoading = false;
    state.error = (action.error.message || "An unexpected error occurred") as string;
      })
      .addCase(updateSettings.pending, (state) => {
    state.isLoading = true;
    state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
    state.isLoading = false;
    state.theme = action.payload.theme;
    state.notificationsEnabled = action.payload.notificationsEnabled;
    state.language = action.payload.language;
    state.aiUsage = action.payload.aiUsage || null;
      })
      .addCase(updateSettings.rejected, (state, action) => {
    state.isLoading = false;
    state.error = (action.error.message || "An unexpected error occurred") as string;
      });
  },
});

export const { setLocalTheme } = settingsSlice.actions;
export default settingsSlice.reducer;
