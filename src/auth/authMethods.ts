import type { AuthMethodKey, AuthMethodsResponse, OAuthProvider } from "./types";

export const AUTH_METHOD_KEYS: AuthMethodKey[] = ["email_password", "discord", "google"];

export function isAuthMethodEnabled(methods: AuthMethodsResponse | null, key: AuthMethodKey) {
  return methods?.methods.find((method) => method.key === key)?.enabled ?? true;
}

export function enabledOAuthProviders(methods: AuthMethodsResponse | null): OAuthProvider[] {
  return (["discord", "google"] as OAuthProvider[]).filter((provider) => isAuthMethodEnabled(methods, provider));
}
