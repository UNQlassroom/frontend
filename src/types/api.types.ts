import type { AxiosResponse } from "axios";

export interface ApiResponse<T = unknown> {
  headers: AxiosResponse["headers"];
  status: number;
  statusText: string;
  data: T;
}

export interface ApiErrorResponse {
  code?: string;
  message: string;
  response?: AxiosResponse;
}
