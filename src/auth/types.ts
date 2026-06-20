export interface PatreonStatus {
  linked: boolean;
  patronStatus: string | null;
  tierIds: string[];
  entitledAmountCents: number | null;
  lastSyncedAt: string | null;
}

export interface ProfileResponse {
  accountId: string;
  email: string;
  displayName: string;
  photonUserId?: string;
  emailVerified: boolean;
  roles: string[];
  patreon: PatreonStatus;
  description?: string | null;
  avatarKey?: string | null;
  socials?: Record<string, string>;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  photonToken?: string;
  accessTokenExpiresAt?: string;
  photonTokenExpiresAt?: string;
  profile: ProfileResponse;
}

export interface ErrorResponse {
  error?: string;
}

export interface ApiResult<T = unknown> {
  ok: boolean;
  data: T;
  status: number;
}
