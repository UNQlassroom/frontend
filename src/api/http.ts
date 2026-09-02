import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { apiClient } from "./client";
import type { ApiResponse, ApiErrorResponse } from "@/types";

export const handleResolvedResponse = <T,>(
  response: AxiosResponse<T>
): ApiResponse<T> => {
  return {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
    data: response.data,
  };
};

export const handleErrorResponse = (error: unknown): ApiErrorResponse => {
  if (axios.isAxiosError(error)) {
    return {
      code: error.code,
      message: error.message,
      response: error.response,
    };
  }
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }
  return {
    message: "Error desconocido al procesar la solicitud",
  };
};

export const get = <T = unknown>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<ApiResponse<T>> =>
  apiClient
    .get<T>(url, config)
    .then((res) => handleResolvedResponse(res))
    .catch((err) => {
      throw handleErrorResponse(err);
    });

export const post = <T = unknown, D = unknown>(
  url: string,
  data?: D,
  config: AxiosRequestConfig = {}
): Promise<ApiResponse<T>> =>
  apiClient
    .post<T>(url, data, config)
    .then((res) => handleResolvedResponse(res))
    .catch((err) => {
      throw handleErrorResponse(err);
    });

export const put = <T = unknown, D = unknown>(
  url: string,
  data?: D,
  config: AxiosRequestConfig = {}
): Promise<ApiResponse<T>> =>
  apiClient
    .put<T>(url, data, config)
    .then((res) => handleResolvedResponse(res))
    .catch((err) => {
      throw handleErrorResponse(err);
    });

export const deleteRequest = <T = unknown>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<ApiResponse<T>> =>
  apiClient
    .delete<T>(url, config)
    .then((res) => handleResolvedResponse(res))
    .catch((err) => {
      throw handleErrorResponse(err);
    });
