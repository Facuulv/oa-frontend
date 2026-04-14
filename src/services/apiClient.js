import axios from "axios";
import { getToken } from "@/utils/auth/token";
import appConfig from "@/config/app.config";
import { logApiRequest } from "@/utils/api/requestLog";

const rawBase = (appConfig.api.baseUrl || "").trim();
const baseURL = rawBase ? rawBase.replace(/\/$/, "") : "";

const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: appConfig.api.timeout,
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const path = config.baseURL && config.url ? `${config.baseURL}${config.url}` : config.url || "";
  logApiRequest((config.method || "GET").toUpperCase(), path);
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV === "development") {
      const status = error.response?.status;
      const url = error.config?.baseURL && error.config?.url
        ? `${error.config.baseURL}${error.config.url}`
        : error.config?.url;
      console.warn("[API] error", status, url, error.response?.data);
    }
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
