import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
});

export function withSession(sessionId, config = {}) {
  return {
    ...config,
    headers: { ...(config.headers || {}), "X-Session-Id": sessionId },
  };
}
