import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./storage";
import type {
  ApiResult,
  AuthResponse,
  ErrorResponse,
  OAuthProvider,
  OAuthStartResponse,
  ProfileResponse,
  RegisterResponse,
} from "./types";

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
  register: (email: string, displayName: string, password: string) =>
    request<RegisterResponse & ErrorResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, displayName, password }),
    }, false),

  login: (email: string, password: string) =>
    request<AuthResponse & ErrorResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, false),

  verifyEmail: (token: string) =>
    request<{ verified?: boolean } & ErrorResponse>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    }, false),

  resendVerification: (email: string) =>
    request<{ sent?: boolean } & ErrorResponse>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }, false),

  forgotPassword: (email: string) =>
    request<{ sent?: boolean } & ErrorResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }, false),

  resetPassword: (token: string, newPassword: string) =>
    request<{ reset?: boolean } & ErrorResponse>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    }, false),

  logout: (refreshToken: string) =>
    request<ErrorResponse>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }, false),

  oauthStart: (provider: OAuthProvider) =>
    request<OAuthStartResponse & ErrorResponse>(`/auth/oauth/${provider}/start`),

  oauthSession: (code: string) =>
    request<AuthResponse & ErrorResponse>(`/auth/oauth/session?code=${encodeURIComponent(code)}`, {}, false),

  getProfile: () =>
    request<ProfileResponse & ErrorResponse>("/me"),

  updateProfile: (displayName: string) =>
    request<ProfileResponse & ErrorResponse>("/me", {
      method: "PATCH",
      body: JSON.stringify({ displayName }),
    }),

  deleteAccount: () =>
    request<{ deleted?: boolean } & ErrorResponse>("/me", { method: "DELETE" }),

  patreonStart: () =>
    request<{ authorizationUrl: string; state: string } & ErrorResponse>("/patreon/oauth/start"),

  patreonUnlink: () =>
    request<ErrorResponse>("/patreon/link", { method: "DELETE" }),
};
