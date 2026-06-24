import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authApi } from "./api";
import { AuthContext } from "./AuthContext";
import type { AuthContextValue } from "./AuthContext";
import { clearTokens, getRefreshToken, hasTokens, setTokens } from "./storage";
import type { AuthResponse, ProfileResponse } from "./types";

interface AuthProviderProps {
  children: ReactNode;
}

function formatRestrictedLoginError(data: { code?: string; error?: string; restriction?: { status?: string; reason?: string; expiresAt?: string | null } }) {
  if (data.code !== "account_restricted" || !data.restriction) {
    return data.error ?? "Login failed. Please try again.";
  }

  const label = data.restriction.status === "suspended" ? "SUSPENSION" : "BAN";
  const until = data.restriction.expiresAt ? ` Until: ${new Date(data.restriction.expiresAt).toLocaleString()}.` : "";
  return `REASON FOR ${label}: ${data.restriction.reason || "No reason provided."}${until}`;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(hasTokens);

  const refreshProfile = useCallback(async () => {
    if (!hasTokens()) {
      setProfile(null);
      return;
    }

    const { ok, data } = await authApi.getProfile();
    if (ok) {
      setProfile(data);
      return;
    }

    clearTokens();
    setProfile(null);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!hasTokens()) {
        setIsLoading(false);
        return;
      }

      const { ok, data } = await authApi.getProfile();
      if (!active) {
        return;
      }

      if (ok) {
        setProfile(data);
      } else {
        clearTokens();
        setProfile(null);
      }

      setIsLoading(false);
    }

    loadProfile().catch(() => {
      if (active) {
        clearTokens();
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { ok, data } = await authApi.login(email, password);
    if (!ok || !data.accessToken || !data.refreshToken) {
      return { ok: false, error: formatRestrictedLoginError(data) };
    }

    setTokens(data.accessToken, data.refreshToken);
    setProfile(data.profile);
    return { ok: true };
  }, []);

  const acceptSession = useCallback((auth: AuthResponse) => {
    setTokens(auth.accessToken, auth.refreshToken);
    setProfile(auth.profile);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Logout should still clear local credentials if the network fails.
      }
    }

    clearTokens();
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    profile,
    isAuthenticated: profile !== null,
    isLoading,
    login,
    acceptSession,
    logout,
    refreshProfile,
  }), [profile, isLoading, login, acceptSession, logout, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
