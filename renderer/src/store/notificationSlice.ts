import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface AppNotification {
  id: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  isLoaded: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  isLoaded: false,
};

// Helper to save to electron store
const saveToStore = async (notifications: AppNotification[]) => {
  const electronAPI = (window as any).electronAPI;
  if (electronAPI?.store) {
    await electronAPI.store.set('app_notifications', notifications);
  }
};

export const loadNotifications = createAsyncThunk(
  'notifications/load',
  async () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.store) {
      const stored = await electronAPI.store.get('app_notifications');
      return (stored || []) as AppNotification[];
    }
    return [];
  }
);

export const addNotification = createAsyncThunk(
  'notifications/add',
  async (message: string, { getState }) => {
    const state = getState() as RootState;
    const newNotification: AppNotification = {
      id: crypto.randomUUID(),
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    
    // Create new array with the new notification at the beginning
    const newNotifications = [newNotification, ...state.notifications.notifications];
    
    // Save to store
    await saveToStore(newNotifications);
    
    return newNotification;
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const newNotifications = state.notifications.notifications.map(n => ({ ...n, isRead: true }));
    
    await saveToStore(newNotifications);
    
    return newNotifications;
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.isLoaded = true;
      })
      .addCase(addNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload);
      })
      .addCase(markAllAsRead.fulfilled, (state, action) => {
        state.notifications = action.payload;
      });
  },
});

export default notificationSlice.reducer;
