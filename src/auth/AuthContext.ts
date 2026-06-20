import { createContext } from "react";
import type { AuthResponse, ProfileResponse } from "./types";

export interface AuthContextValue {
  profile: ProfileResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  acceptSession: (auth: AuthResponse) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
