import axios, { type AxiosError } from "axios";
import { clearToken, getToken } from "@/lib/token";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const authSessionExpiredEvent = "auth:unauthorized";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const RETRIED = "__retried";

const isAuthEndpointUrl = (url?: string): boolean => {
  return Boolean(url) && (url!.includes("/login") || url!.includes("/register"));
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const config = error.config;

    if (error.response?.status === 401 && config) {
      const url = config.url ?? "";
      const isAuthEndpoint = isAuthEndpointUrl(url);
      if (!isAuthEndpoint) {
        clearToken();
        window.dispatchEvent(new Event(authSessionExpiredEvent));
      }
    }

    // Idempotent reads may be retried once on a pure network failure (no
    // response at all). Mutations are never retried to avoid double-charging
    // or duplicate records; cancelled requests are never retried.
    if (
      config &&
      config.method?.toUpperCase() === "GET" &&
      !(config as unknown as Record<string, unknown>)[RETRIED] &&
      !axios.isCancel(error) &&
      !error.response
    ) {
      (config as unknown as Record<string, unknown>)[RETRIED] = true;
      return api(config);
    }

    return Promise.reject(error);
  },
);

export interface ApiErrorShape {
  message?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status = 0, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

const NETWORK_MESSAGE =
  "Unable to connect to the server. Please check your connection and try again.";

const TIMEOUT_MESSAGE =
  "The server took too long to respond. Please try again.";

const STATUS_MESSAGES: Record<number, string> = {
  401: "Your session has expired. Please log in again.",
  403: "You are not authorized to perform this action.",
  404: "The requested resource was not found.",
  422: "Please check the information you entered.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on the server. Please try again.",
  502: "The server received an invalid response. Please try again.",
  503: "The server is temporarily unavailable. Please try again in a moment.",
  504: "The server took too long to respond. Please try again.",
};

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const url = error.config?.url ?? "";
    const data = error.response?.data as ApiErrorShape | undefined;

    if (!error.response) {
      if (axios.isCancel(error)) {
        return new ApiError("Request cancelled.", 0);
      }
      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        return new ApiError(TIMEOUT_MESSAGE, status);
      }
      return new ApiError(NETWORK_MESSAGE, status);
    }

    // Auth endpoints (login/register) surface the server's own message, e.g.
    // "Invalid credentials.", instead of generic status text.
    if (isAuthEndpointUrl(url) && data?.message && status < 500) {
      return new ApiError(data.message, status, data.errors);
    }

    const message =
      STATUS_MESSAGES[status] ||
      data?.message ||
      (status >= 500
        ? "Something went wrong on the server. Please try again."
        : NETWORK_MESSAGE);

    return new ApiError(message, status, data?.errors);
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError(NETWORK_MESSAGE);
}