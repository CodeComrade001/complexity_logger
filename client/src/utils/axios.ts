/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_LOCAL_BACKEND_URL || "";
console.log("Turbo Log  ~ baseURL:", baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true,
  // timeout: 5000, // optional
});

// --------------------
// AUTH / SIGNUP
// --------------------
export const signupForSMS = (data: { phone: string; name?: string }, config?: AxiosRequestConfig) => {
  return api.post("file/repos/analyze", data, config);
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
