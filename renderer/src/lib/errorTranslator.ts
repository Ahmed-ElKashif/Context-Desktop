/**
 * Enterprise standard Error Translator
 * Maps raw backend/database error strings into user-friendly, localized responses.
 */
export const translateApiError = (status: number | undefined, rawMessage: string): string => {
  if (!rawMessage && !status) return "An unexpected error occurred. Please try again.";

  const lowerMessage = rawMessage ? rawMessage.toLowerCase() : "";

  // 1. Safety net: intercept raw AI provider errors that leaked through the backend
  const isLeakedProviderError = lowerMessage.includes("platform.openai.com") ||
    lowerMessage.includes("docs.langchain") ||
    lowerMessage.includes("exceeded your current quota") ||
    lowerMessage.includes("api.groq.com");

  if (isLeakedProviderError) {
    return "The AI service is temporarily at capacity. Please try again in a moment.";
  }

  // Intercept specific provider API key issues
  if (status === 409 && lowerMessage.includes("apikey")) {
    return "The AI provider rejected the request due to an invalid or missing API key. Please contact your system administrator.";
  }

  // 2. Check if the rawMessage is a generic Axios/Network error or generic Backend error
  const isGenericAxios = lowerMessage.includes("request failed with status code") || lowerMessage === "network error";
  const genericBackendMessages = ["unauthorized", "internal server error", "not found", "bad request", "forbidden", "too many requests", "too many requests, please try again later."];
  const isGenericBackend = genericBackendMessages.includes(lowerMessage);

  // 3. If the backend sent a specific, non-generic message, prioritize it!
  if (rawMessage && !isGenericAxios && !isGenericBackend && rawMessage !== String(status)) {
    return rawMessage;
  }

  // 4. Standard HTTP Status Code Translations (fallback when message is generic or missing)
  switch (status) {
    case 400:
      return "The request was invalid. Please check your input and try again.";
    case 401:
      return "Your session has expired or is invalid. Please log in again.";
    case 403:
      return "You do not have the required permissions to perform this action.";
    case 404:
      return "The requested resource could not be found. It may have been deleted.";
    case 409:
      return "This action conflicts with an existing resource (e.g., name already taken).";
    case 413:
      return "The uploaded file is too large. Please select a smaller file.";
    case 422:
      return "The provided data is invalid or cannot be processed.";
    case 429:
      return "You have reached your usage limit. Please try again later.";
    case 500:
      return "The server encountered an unexpected condition. Our team has been notified.";
    case 502:
    case 503:
    case 504:
      return "The service is temporarily unavailable. Please check your connection or try again later.";
  }

  // Fallback: return a generic error if everything else failed.
  return "An unexpected system error occurred.";
};
