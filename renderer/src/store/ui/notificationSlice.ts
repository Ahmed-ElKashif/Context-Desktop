import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface AppNotification {
  id: string;
  message: string;
  type: string;
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
    await electronAPI.store.set("app_notifications", notifications);
  }
};

export const loadNotifications = createAsyncThunk(
  "notifications/load",
  async () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.store) {
      const stored = await electronAPI.store.get("app_notifications");
      return (stored || []) as AppNotification[];
    }
    return [];
  }
);

export const addNotification = createAsyncThunk(
  "notifications/add",
  async (
    payload: { message: string; type?: string; silent?: boolean } | string,
    { getState }
  ) => {
    const state = getState() as RootState;
    const isObj = typeof payload === "object" && payload !== null;
    const message = isObj ? (payload as any).message : payload;
    const type = isObj ? (payload as any).type || "info" : "info";
    const silent = isObj ? (payload as any).silent : false;

    const newNotification: AppNotification = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(),
      message,
      type,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    // Create new array with the new notification at the beginning
    const newNotifications = [
      newNotification,
      ...state.notifications.notifications,
    ];

    // Save to store
    await saveToStore(newNotifications);

    // Trigger OS Desktop Notification (unless silent)
    if (!silent) {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.app?.showNotification) {
        const notifEnabled = await electronAPI.store.get('notificationsEnabled');
        // Default to true if the preference has never been set
        if (notifEnabled !== false) {
          electronAPI.app.showNotification("Context", message, { id: newNotification.id });
        }
      }
      try {
        const { playNotificationSound } = await import("../../utils/audioUtils");
        playNotificationSound(type === "error" ? "error" : "success");
      } catch (err) {
        console.warn("Could not play notification sound", err);
      }
    }

    return newNotification;
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const newNotifications = state.notifications.notifications.map((n) => ({
      ...n,
      isRead: true,
    }));

    await saveToStore(newNotifications);

    return newNotifications;
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id: string, { getState }) => {
    const state = getState() as RootState;
    const newNotifications = state.notifications.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );

    await saveToStore(newNotifications);

    return newNotifications;
  }
);

export const removeNotification = createAsyncThunk(
  "notifications/remove",
  async (id: string, { getState }) => {
    const state = getState() as RootState;
    const newNotifications = state.notifications.notifications.filter(
      (n) => n.id !== id
    );

    await saveToStore(newNotifications);

    return id;
  }
);

export const clearAllNotifications = createAsyncThunk(
  "notifications/clearAll",
  async () => {
    const newNotifications: AppNotification[] = [];
    await saveToStore(newNotifications);
    return newNotifications;
  }
);

const notificationSlice = createSlice({
  name: "notifications",
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
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      .addCase(removeNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(
          (n) => n.id !== action.payload
        );
      })
      .addCase(clearAllNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      .addCase("auth/logout/fulfilled", (state) => {
        state.notifications = [];
        state.isLoaded = false;
      });
  },
});

export default notificationSlice.reducer;
