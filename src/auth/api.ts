import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./storage";
import type {
  AccountRolesResponse,
  AdminAccountDetailResponse,
  AdminAccountFilters,
  AdminAccountListResponse,
  BatchBanSameIpResponse,
  BlockedEmailDomainsResponse,
  AdminAnalyticsResponse,
  ApiResult,
  AuditEventListResponse,
  AuthResponse,
  CreateRoleRequest,
  EmailLimitStatusResponse,
  ErrorResponse,
  OAuthProvider,
  OAuthStartResponse,
  PatreonTierLabelsResponse,
  PatreonTierResponse,
  PermissionResponse,
  ProfilePresetCatalog,
  ProfileResponse,
  RegisterResponse,
  RestrictAccountRequest,
  RoleResponse,
  SessionCodeResponse,
  UpdateEmailLimitSettingsRequest,
  UpdateProfileRequest,
  UpdateRoleRequest,
} from "./types";

const AUTH_API_ORIGIN = (import.meta.env.VITE_AUTH_API_BASE_URL ?? "").replace(/\/$/, "");
const API_BASE_URL = `${AUTH_API_ORIGIN}/v1`;

export function authAssetUrl(path: string) {
  return path.startsWith("http") ? path : `${AUTH_API_ORIGIN}${path}`;
}

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

export async function request<T = unknown>(
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

  oauthLinkStart: (provider: OAuthProvider) =>
    request<OAuthStartResponse & ErrorResponse>(`/auth/oauth/${provider}/link/start`, { method: "POST" }),

  oauthUnlink: (provider: OAuthProvider) =>
    request<ProfileResponse & ErrorResponse>(`/auth/oauth/${provider}/link`, { method: "DELETE" }),

  oauthSession: (code: string) =>
    request<AuthResponse & ErrorResponse>(`/auth/oauth/session?code=${encodeURIComponent(code)}`, {}, false),

  createSessionCode: () =>
    request<SessionCodeResponse & ErrorResponse>("/auth/session-code", { method: "POST" }),

  getProfile: () =>
    request<ProfileResponse & ErrorResponse>("/me"),

  getProfilePresets: () =>
    request<ProfilePresetCatalog & ErrorResponse>("/profile-presets"),

  updateProfile: (body: UpdateProfileRequest) =>
    request<ProfileResponse & ErrorResponse>("/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  setPassword: (newPassword: string) =>
    request<ProfileResponse & ErrorResponse>("/me/password", {
      method: "POST",
      body: JSON.stringify({ newPassword }),
    }),

  deleteAccount: () =>
    request<{ deleted?: boolean } & ErrorResponse>("/me", { method: "DELETE" }),

  patreonStart: () =>
    request<{ authorizationUrl: string; state: string } & ErrorResponse>("/patreon/oauth/start"),

  patreonCallback: (code: string, state: string) =>
    request<{ linked?: boolean; status?: string } & ErrorResponse>(
      `/patreon/oauth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
      {},
      false,
    ),

  patreonUnlink: () =>
    request<ErrorResponse>("/patreon/link", { method: "DELETE" }),

  listAdminAccounts: (search: string, page: number, pageSize: number, filters?: AdminAccountFilters, sort?: string, signal?: AbortSignal) => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search.trim()) params.set("search", search.trim());
    if (sort?.trim()) params.set("sort", sort.trim());
    if (filters?.displayName.trim()) params.set("displayName", filters.displayName.trim());
    if (filters?.emailVerified === "verified") params.set("emailVerified", "true");
    if (filters?.emailVerified === "unverified") params.set("emailVerified", "false");
    if (filters?.restrictionStatus && filters.restrictionStatus !== "any") params.set("restrictionStatus", filters.restrictionStatus);
    filters?.roles.forEach((role) => {
      if (role.trim()) params.append("roles", role.trim());
    });
    return request<AdminAccountListResponse & ErrorResponse>(`/admin/accounts?${params}`, { signal });
  },

  getAdminAccount: (id: string) =>
    request<AdminAccountDetailResponse & ErrorResponse>(`/admin/accounts/${id}`),

  listAuditEvents: (eventType: string, page: number, pageSize: number, accountId?: string, signal?: AbortSignal) => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (eventType.trim()) params.set("eventType", eventType.trim());
    if (accountId?.trim()) params.set("accountId", accountId.trim());
    return request<AuditEventListResponse & ErrorResponse>(`/admin/audit-events?${params}`, { signal });
  },

  getAdminAnalytics: (days: number, signal?: AbortSignal) => {
    const params = new URLSearchParams({ days: String(days) });
    return request<AdminAnalyticsResponse & ErrorResponse>(`/admin/analytics?${params}`, { signal });
  },

  getEmailLimits: (signal?: AbortSignal) =>
    request<EmailLimitStatusResponse & ErrorResponse>("/admin/email-limits", { signal }),

  updateEmailLimits: (body: UpdateEmailLimitSettingsRequest) =>
    request<EmailLimitStatusResponse & ErrorResponse>("/admin/email-limits", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  getBlockedEmailDomains: (signal?: AbortSignal) =>
    request<BlockedEmailDomainsResponse & ErrorResponse>("/admin/blocked-email-domains", { signal }),

  updateBlockedEmailDomains: (domains: string[]) =>
    request<BlockedEmailDomainsResponse & ErrorResponse>("/admin/blocked-email-domains", {
      method: "PUT",
      body: JSON.stringify({ domains }),
    }),

  listPatreonTiers: () =>
    request<PatreonTierResponse[] & ErrorResponse>("/admin/patreon/tiers"),

  getPatreonTierLabels: () =>
    request<PatreonTierLabelsResponse & ErrorResponse>("/admin/patreon/tier-labels"),

  updatePatreonTierLabels: (tiers: PatreonTierResponse[]) =>
    request<PatreonTierLabelsResponse & ErrorResponse>("/admin/patreon/tier-labels", {
      method: "PUT",
      body: JSON.stringify({ tiers }),
    }),

  updateAdminPatreon: (id: string, body: { tierIds: string[]; patronStatus?: string; entitledAmountCents?: number | null }) =>
    request<ProfileResponse["patreon"] & ErrorResponse>(`/admin/accounts/${id}/patreon`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  refreshAdminPatreon: (id: string) =>
    request<ProfileResponse["patreon"] & ErrorResponse>(`/admin/accounts/${id}/patreon/refresh`, { method: "POST" }),

  clearAdminPatreonOverride: (id: string) =>
    request<ProfileResponse["patreon"] & ErrorResponse>(`/admin/accounts/${id}/patreon/clear-override`, { method: "POST" }),

  listPermissions: () =>
    request<PermissionResponse[] & ErrorResponse>("/admin/permissions"),

  listRoles: () =>
    request<RoleResponse[] & ErrorResponse>("/admin/roles"),

  createRole: (body: CreateRoleRequest) =>
    request<RoleResponse & ErrorResponse>("/admin/roles", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateRole: (roleName: string, body: UpdateRoleRequest) =>
    request<RoleResponse & ErrorResponse>(`/admin/roles/${encodeURIComponent(roleName)}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  setRolePermissions: (roleName: string, permissions: string[]) =>
    request<RoleResponse & ErrorResponse>(`/admin/roles/${encodeURIComponent(roleName)}/permissions`, {
      method: "PATCH",
      body: JSON.stringify({ permissions }),
    }),

  deleteRole: (roleName: string) =>
    request<{ deleted?: boolean } & ErrorResponse>(`/admin/roles/${encodeURIComponent(roleName)}`, { method: "DELETE" }),

  updateAdminAccount: (id: string, body: { displayName?: string; emailVerified?: boolean }) =>
    request<ProfileResponse & ErrorResponse>(`/admin/accounts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  restrictAdminAccount: (id: string, body: RestrictAccountRequest) =>
    request<AdminAccountDetailResponse & ErrorResponse>(`/admin/accounts/${id}/restriction`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  liftAdminRestriction: (id: string) =>
    request<AdminAccountDetailResponse & ErrorResponse>(`/admin/accounts/${id}/restriction`, { method: "DELETE" }),

  clearAdminAccountFlag: (id: string, flag: string) =>
    request<AdminAccountDetailResponse & ErrorResponse>(`/admin/accounts/${id}/flags/${encodeURIComponent(flag)}`, { method: "DELETE" }),

  batchBanSameIpAccounts: (id: string, reason: string) =>
    request<BatchBanSameIpResponse & ErrorResponse>(`/admin/accounts/${id}/same-ip/batch-ban`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  assignRole: (id: string, roleName: string) =>
    request<AccountRolesResponse & ErrorResponse>(`/admin/accounts/${id}/roles/${encodeURIComponent(roleName)}`, { method: "PUT" }),
  removeRole: (id: string, roleName: string) =>
    request<AccountRolesResponse & ErrorResponse>(`/admin/accounts/${id}/roles/${encodeURIComponent(roleName)}`, { method: "DELETE" }),

  grantTrusted: (id: string) =>
    request<AccountRolesResponse & ErrorResponse>(`/admin/accounts/${id}/trusted`, { method: "PUT" }),
  revokeTrusted: (id: string) =>
    request<AccountRolesResponse & ErrorResponse>(`/admin/accounts/${id}/trusted`, { method: "DELETE" }),
  deleteAdminAccount: (id: string) =>
    request<{ deleted?: string } & ErrorResponse>(`/admin/accounts/${id}`, { method: "DELETE" }),
};
