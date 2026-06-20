import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./storage";
import type { ApiResult, AuthResponse, ErrorResponse, ProfileResponse } from "./types";

const API_BASE_URL = `${(import.meta.env.VITE_AUTH_API_BASE_URL ?? "").replace(/\/$/, "")}/v1`;

async function parseJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

async function refreshSession(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearTokens();
    return false;
  }

  const data = await parseJson<AuthResponse>(response);
  setTokens(data.accessToken, data.refreshToken);
  return true;
}

async function request<T = unknown>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<ApiResult<T>> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (response.status === 401 && retry && await refreshSession()) {
    return request<T>(path, init, false);
  }

  if (response.status === 401) {
    clearTokens();
  }

  const data = await parseJson<T>(response);
  return { ok: response.ok, data, status: response.status };
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse & ErrorResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, false),

  logout: (refreshToken: string) =>
    request<ErrorResponse>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }, false),

  getProfile: () =>
    request<ProfileResponse & ErrorResponse>("/me"),
};
