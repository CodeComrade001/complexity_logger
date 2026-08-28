// compiler.api.ts

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

export function createApi(baseURL: string): AxiosInstance {
  if (!baseURL.trim()) {
    throw new Error("Base URL for compiler is not set");
  }

  return axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function createApiPostRequest<TPayload, TResponse>(
  api: AxiosInstance,
  payload: TPayload,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  const response = await api.post<TResponse>(
    "/compiler/analyze",
    payload,
    config
  );

  return response.data;
}

export async function createApiGetRequest<TResponse>(
  api: AxiosInstance,
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  const response = await api.get<TResponse>(
    endpoint,
    config
  );

  return response.data;
}

export interface CompilerAnalyzeResponse {
  success: boolean;
  message: string;
  jobId?: string;
}

export interface CompilerResultResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  jobId?: string;
}