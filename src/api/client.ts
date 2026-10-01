import axios from "axios";

export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

const DEFAULT_TIMEOUT: number =
  Number(import.meta.env.VITE_API_TIMEOUT) || 120000; // 120 segundos por defecto para operaciones de GitHub

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: DEFAULT_TIMEOUT,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
