import axios from "axios";
import { STORAGE_KEYS } from "@/constants";
import { setupResponseInterceptor } from "./interceptors";

export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

setupResponseInterceptor(apiClient);
