/**
 * Centralized Environment Configuration
 * 
 * All environment variables should be defined and exported from here.
 * This prevents hardcoded localhost strings from being scattered across the codebase
 * and ensures a single source of truth for deployment configurations.
 */

export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  APP_ENV: import.meta.env.MODE || "development",
};
