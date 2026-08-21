import axios from "axios";
import { environment } from "../config/environment";

function createApiError(error) {
  const status = error.response?.status ?? null;
  const responseData = error.response?.data;

  const message =
    responseData?.detail ||
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
  if (!baseURL) {
    throw new Error("API client baseURL is required.");
  }

  const apiClient = axios.create({
    baseURL,
    timeout: environment.api.timeoutMs,
    headers: {
      Accept: "application/json",
    },
  });

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(createApiError(error)),
  );

  return apiClient;
}
