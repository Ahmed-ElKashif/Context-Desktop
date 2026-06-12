import { api } from "../../lib/axios";

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  persona: 'General' | 'Engineer' | 'Analyst' | 'Marketer';
  createdAt?: string;
}

export const settingsService = {
  // Fetch current user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get("/users/profile");
    return response.data.data;
  },

  // Update profile fields (including Persona)
  updateProfile: async (data: Partial<UserProfile> & { password?: string }): Promise<UserProfile> => {
    const response = await api.patch("/users/profile", data);
    return response.data.data;
  },

  // Utility to clear local storage cache
  clearLocalCache: async () => {
    const electronAPI = (window as any).electronAPI;
    const user = await electronAPI.store.get("context_user");
    await electronAPI.store.delete("context_analytics_session");
    await electronAPI.store.delete("app_notifications");
    localStorage.clear();
    if (user) await electronAPI.store.set("context_user", user); // Keep auth user
    return true;
  }
};