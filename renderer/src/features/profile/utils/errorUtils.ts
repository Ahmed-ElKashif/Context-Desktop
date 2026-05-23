export const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    if ("message" in error && typeof (error as { message?: unknown }).message === "string") {
      return (error as { message: string }).message;
    }
    if ("payload" in error && typeof (error as { payload?: unknown }).payload === "string") {
      return (error as { payload: string }).payload;
    }
  }
  return fallback;
};
