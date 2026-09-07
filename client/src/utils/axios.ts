/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiCompilerJob, CompilerJob } from "@/pages/dashboard/reports";
import { AnalyzeFileUpload, FileComplexityData } from "@/types/apiDataInterface";
import axios, { type AxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_LOCAL_BACKEND_URL || "";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = "/login";
    }

    if (err.response?.status === 403) {
      console.warn("Forbidden action");
    }

    return Promise.reject(err);
  }
);

// --------------------
// SUPPORTED LANGUAGES
// --------------------

export type SupportedLanguage =
  | "csharp"
  | "go"
  | "java"
  | "python"
  | "rust"
  | "javascript";

export const SUPPORTED_LANGUAGE_EXTENSIONS: Record<
  SupportedLanguage,
  string[]
> = {
  csharp: [".cs"],
  go: [".go"],
  java: [".java"],
  python: [".py"],
  rust: [".rs"],
  javascript: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"],
};

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  csharp: "C#",
  go: "Go",
  java: "Java",
  python: "Python",
  rust: "Rust",
  javascript: "JavaScript / TypeScript",
};

const ANALYZE_ENDPOINTS: Record<SupportedLanguage, string> = {
  csharp: "/file/repos/csharp/analyze",
  go: "/file/repos/go/analyze",
  java: "/file/repos/java/analyze",
  python: "/file/repos/python/analyze",
  rust: "/file/repos/rust/analyze",
  javascript: "/file/repos/js/analyze",
};

// --------------------
// AUTH / SIGNUP
// --------------------

export const CreateNewAccount = (
  data: { phone: string; name?: string },
  config?: AxiosRequestConfig
) => {
  return api.post("user/signin", data, config);
};

export const LOgInExistingAccount = (
  data: { phone: string; name?: string },
  config?: AxiosRequestConfig
) => {
  return api.post("user/signup", data, config);
};

// --------------------
// USER
// --------------------

export const getCurrentUser = (config?: AxiosRequestConfig) => {
  return api.get("/user/me", config);
};

// --------------------
// FILE
// --------------------

export const getAllJobs = async (
  config?: AxiosRequestConfig
): Promise<{ allJobs: apiCompilerJob[], pagination: { page: number, limit: number, total: number, totalPages: number, hasNextPage: boolean, hasPreviousPage: boolean } }> => {

  const response = await api.get("/file/repos/all-jobs", config);
  return response.data
};

export const getJobsById = async (
  id: string,
  config?: AxiosRequestConfig
): Promise<{ data: FileComplexityData[] }> => {
  const response = await api.get(`/file/repos/all-jobs/${id}`, config);

  return response.data;
};

export const applyFilePatch = (
  data: { fileId: string; patch: any },
  config?: AxiosRequestConfig
) => {
  return api.patch("/patches/apply", data, config);
};

// --------------------
// LANGUAGE ANALYZERS
// --------------------

export const uploadAndAnalyzeCsharpFiles = (
  formData: FormData,
  config?: AxiosRequestConfig
) => {
  return api.post("/file/repos/csharp/analyze", formData, config);
};

export const uploadAndAnalyzeGoFiles = (
  formData: FormData,
  config?: AxiosRequestConfig
) => {
  return api.post("/file/repos/go/analyze", formData, config);
};

export const uploadAndAnalyzeJavaFiles = (
  formData: FormData,
  config?: AxiosRequestConfig
) => {
  return api.post("/file/repos/java/analyze", formData, config);
};

export const uploadAndAnalyzePythonFiles = (
  formData: FormData,
  config?: AxiosRequestConfig
) => {
  return api.post("/file/repos/python/analyze", formData, config);
};

export const uploadAndAnalyzeRustFiles = (
  formData: FormData,
  config?: AxiosRequestConfig
) => {
  return api.post("/file/repos/rust/analyze", formData, config);
};

export const uploadAndAnalyzeJavaScriptFiles = (
  formData: FormData,
  config?: AxiosRequestConfig
) => {
  return api.post("/file/repos/js/analyze", formData, config);
};

// --------------------
// GENERIC LANGUAGE ANALYZER
// --------------------

export const uploadAndAnalyzeFiles = (
  language: SupportedLanguage,
  formData: FormData,
  config?: AxiosRequestConfig
): Promise<{ language: SupportedLanguage; response: { data: { success: boolean, jobId: string } } }> => {
  const endpoint = ANALYZE_ENDPOINTS[language];

  return api.post(endpoint, formData, config);
};



// --------------------
// WEBSOCKET CONNECTION
// --------------------
export const fetchCompilerResult = async (jobId: string, config?: AxiosRequestConfig): Promise<FileComplexityData> => {
  return api.get(`/file/ws/jobs/${jobId}`, config);
};

// --------------------
// HELPERS
// --------------------

export const getLanguageFromFileName = (
  fileName: string
): SupportedLanguage | null => {
  const extension = fileName
    .slice(fileName.lastIndexOf("."))
    .toLowerCase();

  for (const [language, extensions] of Object.entries(
    SUPPORTED_LANGUAGE_EXTENSIONS
  )) {
    if (extensions.includes(extension)) {
      return language as SupportedLanguage;
    }
  }

  return null;
};

export const isSupportedFile = (fileName: string): boolean => {
  return getLanguageFromFileName(fileName) !== null;
};

// --------------------
// GENERIC REQUEST
// --------------------

export default api;