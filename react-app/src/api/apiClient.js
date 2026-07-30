import axios from "axios";
import { environment } from "../config/environment";

const SESSION_STORAGE_KEY = "boutique-session-id";

function getSessionId() {
  return localStorage.getItem(SESSION_STORAGE_KEY);
}

function createApiError(error) {
  const status = error.response?.status || null;

  const responseData = error.response?.data;

  const message =
    responseData?.message ||
    responseData?.error ||
    error.message ||
    "An unexpected API error occurred.";

  const apiError = new Error(message);

  apiError.name = "ApiError";
  apiError.status = status;
  apiError.data = responseData;
  apiError.originalError = error;

  return apiError;
}

export function createApiClient(baseURL) {
  const apiClient = axios.create({
    baseURL,
    timeout: environment.api.timeoutMs,

    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  });

  apiClient.interceptors.request.use(
    (config) => {
      const sessionId = getSessionId();

      if (sessionId) {
        config.headers["X-Session-Id"] = sessionId;
      }

      return config;
    },

    (error) => Promise.reject(createApiError(error))
  );

  apiClient.interceptors.response.use(
    (response) => response,

    (error) => Promise.reject(createApiError(error))
  );

  return apiClient;
}