/**
 * adminSlice.ts
 * Redux slice managing all admin dashboard state:
 * stats (KPIs), user list, pagination, search, sorting, and loading flags.
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  adminService,
  AdminStats,
  AdminUser,
} from "../features/admin/api/adminService";

// ─── State Shape ─────────────────────────────────────────────────────────────

interface AdminState {
  stats: AdminStats | null;
  users: AdminUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  statsStatus: "idle" | "loading" | "succeeded" | "failed";
  usersStatus: "idle" | "loading" | "succeeded" | "failed";
  suspendStatus: Record<string, "loading" | "done">;
  error: string | null;
}

const initialState: AdminState = {
  stats: null,
  users: [],
  pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
  search: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  statsStatus: "idle",
  usersStatus: "idle",
  suspendStatus: {},
  error: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchAdminStats = createAsyncThunk(
  "admin/fetchStats",
  async () => {
    return await adminService.getStats();
  },
);

export const fetchAdminUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (params: {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    return await adminService.getUsers(params);
  },
);

export const toggleSuspendUser = createAsyncThunk(
  "admin/toggleSuspend",
  async ({ userId, suspend }: { userId: string; suspend: boolean }) => {
    await adminService.toggleSuspend(userId, suspend);
    return { userId, suspend };
  },
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.pagination.page = 1; // reset to page 1 on new search
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setSort: (
      state,
      action: PayloadAction<{ sortBy: string; sortOrder: "asc" | "desc" }>,
    ) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
  },
  extraReducers: (builder) => {
    // Stats
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.statsStatus = "loading";
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.statsStatus = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state) => {
        state.statsStatus = "failed";
      });

    // Users
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.usersStatus = "loading";
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.usersStatus = "succeeded";
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAdminUsers.rejected, (state) => {
        state.usersStatus = "failed";
      });

    // Suspend toggle
    builder
      .addCase(toggleSuspendUser.pending, (state, action) => {
        state.suspendStatus[action.meta.arg.userId] = "loading";
      })
      .addCase(toggleSuspendUser.fulfilled, (state, action) => {
        const { userId, suspend } = action.payload;
        state.suspendStatus[userId] = "done";
        const user = state.users.find((u) => u._id === userId);
        if (user) user.isSuspended = suspend;
      });
  },
});

export const { setSearch, setPage, setSort } = adminSlice.actions;
export default adminSlice.reducer;
