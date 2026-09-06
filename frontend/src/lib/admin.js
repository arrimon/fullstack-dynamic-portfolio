import axios from "axios";
import { normalizeError } from "./api";

const client = axios.create({
  baseURL: "",
  timeout: 30000,
});

export async function adminRequest(method, path, bodyOrForm, { params } = {}) {
  try {
    const isForm = typeof FormData !== "undefined" && bodyOrForm instanceof FormData;
    const { data } = await client.request({
      method,
      url: `/api/admin${path}`,
      data: bodyOrForm,
      params,
      ...(isForm ? { headers: { "Content-Type": "multipart/form-data" } } : {}),
    });
    return { data, error: null, status: 200 };
  } catch (err) {
    if (err?.response?.status === 401) {
      return { data: null, error: "UNAUTHORIZED", status: 401 };
    }
    return {
      data: null,
      error: normalizeError(err),
      status: err?.response?.status || 0,
    };
  }
}

export const adminGet = (path, params) => adminRequest("GET", path, undefined, { params });
export const adminPost = (path, body) => adminRequest("POST", path, body);
export const adminPut = (path, body) => adminRequest("PUT", path, body);
export const adminPatch = (path, body) => adminRequest("PATCH", path, body);
export const adminDelete = (path) => adminRequest("DELETE", path);