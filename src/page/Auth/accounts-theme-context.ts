import { createContext, useContext } from "react";
import type { Aottg2ThemeMode } from "@aottg2/ui";

export type AccountsThemeContextValue = {
  theme: Aottg2ThemeMode;
};

export const AccountsThemeContext = createContext<AccountsThemeContextValue | null>(null);

export function useAccountsTheme() {
  const context = useContext(AccountsThemeContext);
  if (!context) {
    throw new Error("useAccountsTheme must be used inside AccountsTheme");
  }
  return context;
}
