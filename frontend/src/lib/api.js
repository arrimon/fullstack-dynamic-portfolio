import axios from "axios";
import { mediaUrl } from "./utils";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const publicApi = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export function normalizeError(error) {
  if (error?.response) {
    const detail = error.response.data?.detail;
    if (typeof detail === "string" && detail.trim()) return detail;
    if (Array.isArray(detail) && detail.length) {
      return "Some information is invalid. Please check the form and try again.";
    }
    switch (error.response.status) {
      case 401:
        return "Your session has expired or your credentials are invalid.";
      case 403:
        return "You don't have permission to access this resource.";
      case 404:
        return "The requested resource could not be found.";
      case 405:
        return "The requested operation is not supported by the server.";
      case 422:
        return "Some information is invalid. Please check the form and try again.";
      case 429:
        return "Too many requests. Please try again later.";
      default:
        if (error.response.status >= 500) {
          return "Something went wrong on the server. Please try again later.";
        }
    }
  }
  if (error?.code === "ECONNABORTED") return "The request timed out. Please try again.";
  if (error?.message === "Network Error") return "Could not reach the server. Is the API running?";
  return error?.message || "Something went wrong. Please try again.";
}

export async function publicGet(path, params) {
  try {
    const { data } = await publicApi.get(path, { params });
    return { data, error: null };
  } catch (err) {
    return { data: null, error: normalizeError(err) };
  }
}

export async function publicPost(path, payload) {
  try {
    const { data } = await publicApi.post(path, payload);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: normalizeError(err) };
  }
}

export { publicApi, mediaUrl };