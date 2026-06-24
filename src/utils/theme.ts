export const THEME_STORAGE_KEY = "aottg2_accounts_theme";

export function saveTheme() {
  window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
  document.documentElement.dataset.theme = "dark";
  document.documentElement.classList.add("dark");
  document.documentElement.classList.remove("light");
}
