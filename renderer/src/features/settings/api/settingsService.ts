import { api } from "../../../lib/axios";

export interface UserSettings {
  theme: "light" | "dark" | "system";
  notificationsEnabled: boolean;
  language: string;
  aiUsage?: {
    tokensUsed: number;
    dailyLimit: number;
    remaining: number;
    monthlyUsed?: number;
    monthlyLimit?: number;
  } | null;
}

export interface UpdateSettingsPayload {
  theme?: "light" | "dark" | "system";
  notificationsEnabled?: boolean;
  language?: string;
}

export interface TokenBudgetData {
  dailyUsage: {
    tokensUsed: number;
    dailyLimit: number;
    remaining: number;
    resetAt: string;
  };
  monthlyUsage: {
    tokensUsed: number;
    requestCount: number;
  };
}

export const settingsService = {
  // Fetch the current user's settings
  getSettings: async (): Promise<UserSettings> => {
    const response = await api.get("/settings");
    return response.data.data; 
  },

  // Update specific fields in the user's settings
  updateSettings: async (payload: UpdateSettingsPayload): Promise<UserSettings> => {
    const response = await api.patch("/settings", payload);
    return response.data.data;
  },

  // Reset all settings back to default values
  resetSettings: async (): Promise<UserSettings> => {
    const response = await api.post("/settings/reset");
    return response.data.data;
  },

  // Fetch user's AI token budget (daily + monthly)
  getTokenBudget: async (): Promise<TokenBudgetData> => {
    const response = await api.get("/settings/token-budget");
    return response.data.data;
  }
};