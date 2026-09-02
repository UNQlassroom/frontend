import axios from "axios";

export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});
