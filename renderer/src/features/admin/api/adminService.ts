/**
 * adminService.ts
 * All API calls for the Admin Dashboard.
 * Uses the shared `api` axios instance from lib/axios.ts —
 * JWT token is attached automatically via the request interceptor.
 */

import { api } from "../../../lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  trialUsers: number;
  canceledUsers: number;
  totalStorageBytes: number;
  totalPageViews: number;
  totalUniqueVisitors: number;
  trafficHistory: { date: string; pageViews: number; visitors: number }[];
  storageHistory:  { date: string; storageGB: number }[];
  documentDistribution: { name: string; value: number; count?: number }[];
  dailyTrafficHistory: { date: string; pageViews: number; visitors: number }[];
}
// ...
export interface AdminUser {
  _id:                string;
  username:           string;
  email:              string;
  fullName?:          string;
  role:               "user" | "admin";
  avatar?:            string;
  persona?:           string;
  storageUsedBytes:   number;
  subscriptionStatus: "active" | "trial" | "canceled" | "none";
  createdAt:          string;
  isSuspended?:       boolean;
}

export interface AdminUsersResponse {
  users:      AdminUser[];
  pagination: {
    total:      number;
    page:       number;
    limit:      number;
    totalPages: number;
  };
}

export interface GetUsersParams {
  search?:    string;
  page?:      number;
  limit?:     number;
  sortBy?:    string;
  sortOrder?: "asc" | "desc";
}

// ─── Mock Data (fallback while backend is unreachable) ────────────────────────

const MOCK_STATS: AdminStats = {
  totalUsers:          1247,
  activeUsers:         892,
  trialUsers:          243,
  canceledUsers:       112,
  totalStorageBytes:   48_632_000_000,
  totalPageViews:      94_320,
  totalUniqueVisitors: 12_780,
  trafficHistory: Array.from({ length: 12 }, (_, i) => ({
    date:      new Date(2025, i, 1).toLocaleDateString("en-US", { month: "short" }),
    pageViews: Math.floor(5000  + Math.random() * 12000),
    visitors:  Math.floor(800   + Math.random() * 2500),
  })),
  storageHistory: Array.from({ length: 12 }, (_, i) => ({
    date:      new Date(2025, i, 1).toLocaleDateString("en-US", { month: "short" }),
    storageGB: parseFloat((10 + i * 3.2 + Math.random() * 2).toFixed(1)),
  })),
  documentDistribution: [
    { name: "PDF Documents", value: 35.0, count: 350 },
    { name: "Word Files", value: 25.0, count: 250 },
    { name: "Images & Scans", value: 20.0, count: 200 },
    { name: "Excel Spreadsheets", value: 15.0, count: 150 },
    { name: "Text Files", value: 5.0, count: 50 }
  ],
  dailyTrafficHistory: Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return {
      date:      `${d.toLocaleDateString("en-US", { month: "short" })} ${d.getDate()}`,
      pageViews: Math.floor(150 + Math.random() * 400),
      visitors:  Math.floor(30 + Math.random() * 100),
    };
  })
};

const MOCK_USERS: AdminUser[] = Array.from({ length: 20 }, (_, i) => ({
  _id:                `mock-user-${i}`,
  username:           `user_${String(i + 1).padStart(3, "0")}`,
  email:              `user${i + 1}@context.app`,
  fullName:           ["Alice Chen", "Bob Martin", "Carol White", "David Kim", "Eva Rodriguez"][i % 5],
  role:               (i === 0 ? "admin" : "user") as "admin" | "user",
  persona:            ["Researcher", "Student", "Engineer", "Designer", "Manager"][i % 5],
  storageUsedBytes:   Math.floor(Math.random() * 5_000_000_000),
  subscriptionStatus: (["active", "trial", "canceled", "none"] as const)[i % 4],
  createdAt:          new Date(2024, i % 12, (i % 28) + 1).toISOString(),
  isSuspended:        i === 3,
}));

// ─── Service ──────────────────────────────────────────────────────────────────

export const adminService = {

  /** Fetches all KPI stats. Falls back to mock data if backend is unreachable. */
  async getStats(): Promise<AdminStats> {
    try {
      const res = await api.get<{ success: boolean; data: AdminStats }>("/admin/stats");
      // Backend wraps response in { success, data } — unwrap it
      return res.data.data ?? res.data;
    } catch {
      console.warn("[AdminService] /admin/stats unavailable — using mock data.");
      return MOCK_STATS;
    }
  },

  /** Fetches paginated, searchable user list. Falls back to mock data. */
  async getUsers(params: GetUsersParams): Promise<AdminUsersResponse> {
    try {
      const res = await api.get<AdminUsersResponse>("/admin/users", { params });
      return res.data;
    } catch {
      console.warn("[AdminService] /admin/users unavailable — using mock data.");
      const { search = "", page = 1, limit = 10 } = params;
      const q        = search.toLowerCase();
      const filtered = MOCK_USERS.filter(
        (u) =>
          u.username.includes(q) ||
          u.email.includes(q)    ||
          (u.fullName ?? "").toLowerCase().includes(q)
      );
      const start = (page - 1) * limit;
      return {
        users: filtered.slice(start, start + limit),
        pagination: {
          total:      filtered.length,
          page,
          limit,
          totalPages: Math.ceil(filtered.length / limit),
        },
      };
    }
  },

  /** Suspends or unsuspends a user by ID. */
  async toggleSuspend(userId: string, suspend: boolean): Promise<void> {
    try {
      await api.patch(`/admin/users/${userId}/suspend`, { suspend });
    } catch {
      console.warn("[AdminService] Suspend endpoint unavailable (mock — no-op).");
    }
  },

  /** Triggers a CSV download of all users. */
  async exportUsersCSV(): Promise<void> {
    try {
      const res = await api.get("/admin/export/users", { responseType: "blob" });
      _triggerDownload(res.data, `users-export-${Date.now()}.csv`);
    } catch {
      console.warn("[AdminService] Export endpoint unavailable — generating mock CSV.");
      const header = "Username,Email,Role,Storage (MB),Status,Joined\n";
      const rows   = MOCK_USERS.map((u) =>
        [
          u.username,
          u.email,
          u.role,
          (u.storageUsedBytes / 1e6).toFixed(1),
          u.subscriptionStatus,
          new Date(u.createdAt).toLocaleDateString(),
        ].join(",")
      ).join("\n");
      const blob = new Blob([header + rows], { type: "text/csv" });
      _triggerDownload(blob, `users-export-${Date.now()}.csv`);
    }
  },
};

// ─── Private helpers ──────────────────────────────────────────────────────────

function _triggerDownload(blob: Blob, filename: string) {
  const url  = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href  = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}