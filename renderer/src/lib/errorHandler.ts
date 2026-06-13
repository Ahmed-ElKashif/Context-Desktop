import { isAxiosError } from "axios";

/**
 * Safely extracts a user-friendly error message from an unknown thrown error.
 * Integrates directly with our Axios interceptor which translates backend status codes.
 *
 * @param error - The caught error object (should be typed as unknown).
 * @param fallbackMessage - The default message to return if the error isn't recognized.
 */
export const getApiError = (
  error: unknown,
  fallbackMessage: string = "An unexpected error occurred."
): string => {
  if (isAxiosError(error)) {
    // If setupAxios.ts already mutated error.message, use it. 
    // Otherwise fallback to the raw data message, or the default fallback.
    return error.response?.data?.message || error.message || fallbackMessage;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return fallbackMessage;
};
