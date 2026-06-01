import axios from "axios";

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
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      window.dispatchEvent(new CustomEvent("auth-expired"));
    } else if (
      error.message === "Network Error" || 
      (error.response && error.response.status >= 502 && error.response.status <= 504)
    ) {
      window.dispatchEvent(new CustomEvent("server-down"));
    }
    return Promise.reject(error);
  }
);