import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Aottg2Theme, Toaster, type Aottg2ThemeMode } from "@aottg2/ui";
import { getInitialTheme, saveTheme } from "../../utils/theme";
import { AccountsThemeContext } from "./accounts-theme-context";

const wallpapers = [
  "/wallpapers/MainBackground4Texture.webp",
  "/wallpapers/MainBackground7Texture.webp",
  "/wallpapers/MainBackground8Texture.webp",
  "/wallpapers/MainBackground9Texture.webp",
  "/wallpapers/MainBackground11Texture.webp",
  "/wallpapers/MainBackground12Texture.webp",
  "/wallpapers/MainBackground52Texture.webp",
  "/wallpapers/MainBackground56Texture.webp",
];

interface AccountsThemeProps {
  children: ReactNode;
}

export function AccountsTheme({ children }: AccountsThemeProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [theme, setTheme] = useState<Aottg2ThemeMode>(getInitialTheme);

  useEffect(() => {
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || wallpapers.length < 2) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % wallpapers.length);
    }, 9000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const next = new Image();
    next.decoding = "async";
    next.src = wallpapers[(activeIndex + 1) % wallpapers.length];
  }, [activeIndex]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    }),
    [theme],
  );

  return (
    <AccountsThemeContext.Provider value={value}>
      <Aottg2Theme theme={theme} palette="website" className="accounts-theme relative min-h-screen overflow-hidden bg-background text-foreground">
        <div className="fixed inset-0 overflow-hidden">
          {wallpapers.map((wallpaper, index) => (
            <img
              key={wallpaper}
              src={wallpaper}
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1800ms] ease-in-out ${
                index === activeIndex ? "opacity-45" : "opacity-0"
              }`}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          ))}
        </div>
        <div className="pointer-events-none fixed inset-0 bg-black/65" />
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.32)_55%,rgba(0,0,0,0.78)_100%)]" />
        {children}
        <Toaster className={`aottg2-theme aottg2-palette-website ${theme}`} />
      </Aottg2Theme>
    </AccountsThemeContext.Provider>
  );
}
