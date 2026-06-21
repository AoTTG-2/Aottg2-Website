import type { Aottg2ThemeMode } from "@aottg2/ui";

export const THEME_STORAGE_KEY = "aottg2_accounts_theme";

export function getInitialTheme(): Aottg2ThemeMode {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;

  const theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  return theme;
}

export function saveTheme(theme: Aottg2ThemeMode) {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}
