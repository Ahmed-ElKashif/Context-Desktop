import axios from "axios";
import { translateApiError } from "./errorTranslator";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Client-Type": "native",
    "X-Requested-With": "XMLHttpRequest"
  }
});

// Existing auth interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await (window as any).electronAPI.store.get("context_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ADD THIS: Session ID interceptor for analytics
api.interceptors.request.use(
  async (config) => {
    const sessionData = await (window as any).electronAPI.store.get('context_analytics_session');
    if (sessionData) {
      const { sessionId } = JSON.parse(sessionData);
      config.headers['X-Session-Id'] = sessionId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global Response Interceptor for Server Errors and 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Extract backend message
    const rawMessage = error.response?.data?.message || error.response?.data?.error || error.message;
    const status = error.response?.status;
    const translatedMessage = translateApiError(status, rawMessage);

    if (status === 401) {
      // Token expired or invalid
      window.dispatchEvent(new CustomEvent("auth-expired"));
    } else if (
      error.message === "Network Error" || 
      (status >= 502 && status <= 504)
    ) {
      window.dispatchEvent(new CustomEvent("server-down"));
    } else if (
      status === 403 || status === 413 || status === 429 || status >= 500
    ) {
      // Dispatch globally so AppRouter.tsx can log it to the Notification Center if needed
      window.dispatchEvent(new CustomEvent("api-error", { detail: { message: translatedMessage } }));
    }
    
    // 2. Reject with the string so individual components don't toast "[object Object]"
    return Promise.reject(translatedMessage);
  }
);