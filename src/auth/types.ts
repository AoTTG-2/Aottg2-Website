export type OAuthProvider = "discord" | "google";

export interface PatreonStatus {
  linked: boolean;
  patronStatus: string | null;
  tierIds: string[];
  entitledAmountCents: number | null;
  manualOverride: boolean;
  lastSyncedAt: string | null;
}

export interface PatreonTierResponse {
  id: string;
  title: string;
  amountCents: number | null;
  fromPatreon: boolean;
}

export interface PatreonTierLabelsResponse {
  tiers: PatreonTierResponse[];
}

export interface ProfileResponse {
  accountId: string;
  email: string;
  displayName: string;
  photonUserId?: string;
  emailVerified: boolean;
  hasPassword: boolean;
  roles: string[];
  permissions?: string[];
  patreon: PatreonStatus;
  oAuthLinks?: OAuthLinkResponse[];
  description?: string | null;
  avatarKey?: string | null;
  socials?: Record<string, string>;
  createdAt?: string;
}

export type AdminEmailVerifiedFilter = "any" | "verified" | "unverified";

export interface AdminAccountFilters {
  roles: string[];
  emailVerified: AdminEmailVerifiedFilter;
  displayName: string;
}

export interface AdminAccountListResponse {
  total: number;
  page: number;
  pageSize: number;
  accounts: ProfileResponse[];
}

export interface PermissionResponse {
  key: string;
  category: string;
  description: string;
}

export interface RoleResponse {
  name: string;
  displayName: string;
  description?: string | null;
  isSystem: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  displayName?: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRoleRequest {
  displayName?: string;
  description?: string;
  permissions?: string[];
}

export interface EmailLimitSettingsResponse {
  monthlyHardLimit: number;
  dailyRecipientLimit: number;
  dailyIpLimit: number;
  monthlyResetDay: number;
  dailyResetHourUtc: number;
}

export interface UpdateEmailLimitSettingsRequest {
  monthlyHardLimit: number;
  dailyRecipientLimit: number;
  dailyIpLimit: number;
  monthlyResetDay: number;
  dailyResetHourUtc: number;
}

export interface EmailLimitPeriodResponse {
  periodStart: string;
  resetAt: string;
  sent: number;
  remaining: number;
  blocked: boolean;
}

export interface EmailLimitTodayResponse {
  date: string;
  sent: number;
}

export interface EmailLimitDailyUsageResponse {
  date: string;
  sent: number;
}

export interface EmailLimitStatusResponse {
  settings: EmailLimitSettingsResponse;
  month: EmailLimitPeriodResponse;
  today: EmailLimitTodayResponse;
  recentDays: EmailLimitDailyUsageResponse[];
}

export interface OAuthLinkResponse {
  provider: string;
  providerUserId: string;
  providerEmail?: string | null;
  linkedAt: string;
}

export interface AuditAccountSummaryResponse {
  accountId: string;
  displayName?: string | null;
  email?: string | null;
}

export interface AuditEventResponse {
  id: string;
  eventType: string;
  actorAccountId?: string | null;
  targetAccountId?: string | null;
  actor?: AuditAccountSummaryResponse | null;
  target?: AuditAccountSummaryResponse | null;
  metadataJson?: string | null;
  createdAt: string;
}

export interface AuditEventListResponse {
  total: number;
  page: number;
  pageSize: number;
  events: AuditEventResponse[];
}

export interface AdminAccountDetailResponse extends ProfileResponse {
  hasPassword: boolean;
  creationIpAddress?: string | null;
  oAuthLinks: OAuthLinkResponse[];
  activeSessionCount: number;
  updatedAt: string;
  recentAuditEvents: AuditEventResponse[];
}

export interface AccountRolesResponse {
  accountId: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  photonToken?: string;
  accessTokenExpiresAt?: string;
  photonTokenExpiresAt?: string;
  profile: ProfileResponse;
}

export interface RegisterResponse {
  accountId: string;
  email: string;
  verificationToken?: string | null;
}

export interface OAuthStartResponse {
  authorizationUrl: string;
  state: string;
}

export interface SessionCodeResponse {
  code: string;
}

export interface ErrorResponse {
  error?: string;
}

export interface ApiResult<T = unknown> {
  ok: boolean;
  data: T;
  status: number;
}
