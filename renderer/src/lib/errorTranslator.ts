/**
 * Enterprise standard Error Translator
 * Maps raw backend/database error strings into user-friendly, localized responses.
 */
export const translateApiError = (status: number | undefined, rawMessage: string): string => {
  if (!rawMessage && !status) return "An unexpected error occurred. Please try again.";

  const lowerMessage = rawMessage ? rawMessage.toLowerCase() : "";

  // 1. Check if the rawMessage is a generic Axios/Network error or generic Backend error
  const isGenericAxios = lowerMessage.includes("request failed with status code") || lowerMessage === "network error";
  const genericBackendMessages = ["unauthorized", "internal server error", "not found"];
  const isGenericBackend = genericBackendMessages.includes(lowerMessage);

  // 2. If the backend sent a specific, non-generic message, prioritize it!
  if (rawMessage && !isGenericAxios && !isGenericBackend) {
    return rawMessage;
  }

  // 3. Specific Business Logic Errors (fallback if generic)
  if (status === 409 && lowerMessage.includes("apikey")) {
    return "The AI provider rejected the request due to an invalid or missing API key. Please contact your system administrator.";
  }
  
  if (status === 409) {
    return "This action conflicts with an existing resource (e.g., name already taken).";
  }

  // 4. Standard HTTP Status Code Translations
  switch (status) {
    case 401:
      return "Your session has expired or is invalid. Please log in again.";
    case 403:
      return "You do not have the required permissions to perform this action.";
    case 404:
      return "The requested resource could not be found. It may have been deleted.";
    case 413:
      return "The uploaded file is too large. Please select a smaller file.";
    case 429:
      return "You have exceeded your rate limit. Please wait a moment before trying again.";
    case 500:
      return "The server encountered an unexpected condition. Our team has been notified.";
    case 502:
    case 503:
    case 504:
      return "The service is temporarily unavailable. Please check your connection or try again later.";
  }

  // Fallback: return the original backend message if it's already user-friendly, 
  // or a generic error if it's completely missing.
  return rawMessage || "An unexpected system error occurred.";
};
