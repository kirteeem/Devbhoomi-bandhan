import { AxiosError } from "axios";

// Turns any error thrown by an `api.*` call into a short, plain-language
// message that's safe to show directly in the UI — instead of a raw
// "Network Error" / stack trace, or the JSON-ish text an unexpected
// backend failure can produce.
export const getFriendlyErrorMessage = (error: unknown, fallback = "Something went wrong. Please try again."): string => {
  if (error instanceof AxiosError) {
    // Backend responded, but with an error status — prefer its message,
    // since errorHandler.js on the server already writes these in plain
    // English (e.g. "Enter a valid email address").
    const serverMessage = error.response?.data?.message;
    if (typeof serverMessage === "string" && serverMessage.trim()) {
      return serverMessage;
    }

    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return "That took too long to respond. Please check your connection and try again.";
    }

    if (!error.response) {
      return "We couldn't reach the server. Please check your internet connection and try again.";
    }

    const status = error.response.status;
    if (status === 401) return "Your session has expired. Please log in again.";
    if (status === 403) return "You don't have permission to do that.";
    if (status === 404) return "We couldn't find what you were looking for.";
    if (status === 429) return "Too many attempts. Please wait a little while and try again.";
    if (status >= 500) return "Our server ran into a problem. Please try again in a moment.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
