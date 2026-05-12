import axios, { type AxiosError, type AxiosRequestConfig } from "axios";

const FALLBACK_BASE_URL = "http://127.0.0.1:8000/api";
export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL?.trim() || FALLBACK_BASE_URL;

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("auth_token");
};

const formatAxiosError = (error: AxiosError) => {
  if (error.response) {
    const payload = error.response.data as any;
    const detail = payload?.detail || payload?.message || payload?.errors;
    return String(detail ?? error.response.statusText ?? "Unexpected API error");
  }

  if (error.request) {
    return "The API is unreachable. Check that the backend is running and CORS is configured.";
  }

  return error.message || "Unknown API error";
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

export function getListData<T>(data: T[] | { results: T[] }): T[] {
  return Array.isArray(data) ? data : data?.results ?? [];
}

api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = getAuthToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = formatAxiosError(error);
    return Promise.reject(new Error(message));
  }
);
