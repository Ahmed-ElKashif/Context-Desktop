import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../features/auth/api/authService";
import type {
  LoginFormValues,
  RegisterFormValues,
  AuthResponse,
} from "../../features/auth/schemas/auth.schema";

// 1. Define the state shape
interface AuthState {
  user: AuthResponse["user"] | null;
  token: string | null;
  isAuthenticated: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const maybeResponse = error as { response?: { data?: { message?: string; error?: string } } };
    return maybeResponse.response?.data?.message || maybeResponse.response?.data?.error || fallback;
  }
  return fallback;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  status: "loading", // Wait for IPC
  error: null,
};

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      const token = await (window as any).electronAPI.store.get("context_token");
      const userStr = await (window as any).electronAPI.store.get("context_user");
      let user = null;
      if (userStr) {
        try { user = JSON.parse(userStr); } catch { }
      }
      return { token, user };
    } catch (error) {
      return rejectWithValue("Init failed");
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await (window as any).electronAPI.store.delete("context_token");
  await (window as any).electronAPI.store.delete("context_user");
  if ((window as any).electronAPI.store) {
    await (window as any).electronAPI.store.delete("app_notifications");
  }
});

// 2. Create the Thunks
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginFormValues, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      await (window as any).electronAPI.store.set("context_token", data.token);
      await (window as any).electronAPI.store.set("context_user", JSON.stringify(data.user));
      return data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, "Login failed"));
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: RegisterFormValues, { rejectWithValue }) => {
    try {
      const data = await authService.register(userData);
      // Don't store user or token — they must verify email first
      return data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, "Registration failed"));
    }
  },
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token: string, { rejectWithValue }) => {
    try {
      const data = await authService.verifyEmail(token);
      await (window as any).electronAPI.store.set("context_token", data.token);
      await (window as any).electronAPI.store.set("context_user", JSON.stringify(data.user));
      return data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, "Email verification failed"));
    }
  },
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData: { persona?: string; fullName?: string; username?: string; email?: string; password?: string; currentPassword?: string; lastActiveDocumentId?: string | null; lastActiveComparisonId?: string | null; hasCompletedTour?: boolean; hasCompletedPopulatedTour?: boolean; hasCompletedLibraryTour?: boolean; hasCompletedComparisonTour?: boolean }, { rejectWithValue }) => {
    try {
      // 1. Hit the service which now safely includes the token!
      const data = await authService.updateProfile(userData);

      // 2. The backend wraps the updated user inside a 'data' property
      const updatedUser = data.data;

      // 3. Keep store perfectly synced
      await (window as any).electronAPI.store.set("context_user", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error: unknown) {
      // Do NOT reject — we still have a valid local state. Silently fail the backend sync.
      console.error("[updateProfile] Failed to sync to backend:", getErrorMessage(error, "Profile update failed"));
      return rejectWithValue(getErrorMessage(error, "Failed to update profile"));
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  "auth/uploadAvatar",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const data = await authService.uploadAvatar(formData);
      const updatedUser = data.data;
      await (window as any).electronAPI.store.set("context_user", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, "Failed to upload avatar"));
    }
  },
);

// 3. Create the Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateUserLocalState: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        (window as any).electronAPI.store.set("context_user", JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle Login
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token || null;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Handle Register
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        // Registration succeeded — user must now verify their email.
        // Do NOT set isAuthenticated. Show a "check your email" screen.
        state.status = "succeeded";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Handle verifyEmail
      .addCase(verifyEmail.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token || null;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Email verification failed";
      })
      // Handle Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (state.user && action.payload) {
          const incoming = action.payload;
          state.user = {
            ...state.user,
            ...incoming,
            lastActiveComparisonId: incoming.lastActiveComparisonId !== undefined ? incoming.lastActiveComparisonId : state.user.lastActiveComparisonId,
            lastActiveDocumentId: incoming.lastActiveDocumentId !== undefined ? incoming.lastActiveDocumentId : state.user.lastActiveDocumentId,
          };
          (window as any).electronAPI.store.set("context_user", JSON.stringify(state.user));
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Handle Upload Avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (state.user && action.payload) {
          const incoming = action.payload;
          state.user = {
            ...state.user,
            ...incoming,
            lastActiveComparisonId: incoming.lastActiveComparisonId !== undefined ? incoming.lastActiveComparisonId : state.user.lastActiveComparisonId,
            lastActiveDocumentId: incoming.lastActiveDocumentId !== undefined ? incoming.lastActiveDocumentId : state.user.lastActiveDocumentId,
          };
          (window as any).electronAPI.store.set("context_user", JSON.stringify(state.user));
        }
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Handle Initialize
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload.token) {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.status = "succeeded";
        } else {
          state.status = "idle";
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.status = "idle";
      })
      // Handle Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.status = "idle";
      });
  },
});

export const { updateUserLocalState } = authSlice.actions;
export default authSlice.reducer;