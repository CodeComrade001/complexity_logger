/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnalyzeFileUpload } from "@/types/apiDataInterface";
import axios, { type AxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_LOCAL_BACKEND_URL || "";

const api = axios.create({
  baseURL,
  withCredentials: true,
  // timeout: 5000, // optional
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // session expired or invalid
      window.location.href = "/login";
    }

    if (err.response?.status === 403) {
      console.warn("Forbidden action");
    }

    return Promise.reject(err);
  }
);

// --------------------
// AUTH / SIGNUP
// --------------------
export const CreateNewAccount = (data: { phone: string; name?: string }, config?: AxiosRequestConfig) => {
  return api.post("user/signin", data, config);
};

export const LOgInExistingAccount = (data: { phone: string; name?: string }, config?: AxiosRequestConfig) => {
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
export const getFileById = (id: string, config?: AxiosRequestConfig) => {
  return api.get(`/file/${id}`, config);
};

export const applyFilePatch = (data: { fileId: string; patch: any }, config?: AxiosRequestConfig) => {
  return api.patch("/patches/apply", data, config);
};

export const uploadAndAnalyzeFiles = (formData: FormData, config?: AxiosRequestConfig) => {
  return api.post("file/repos/analyze", formData, config);
  ;
}

// --------------------
// GENERIC REQUEST
// --------------------
export default api;
