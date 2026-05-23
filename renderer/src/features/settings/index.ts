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
  clearLocalCache: () => {
    const token = localStorage.getItem("context_token");
    localStorage.clear();
    if (token) localStorage.setItem("context_token", token); // Keep auth token
    return true;
  }
};