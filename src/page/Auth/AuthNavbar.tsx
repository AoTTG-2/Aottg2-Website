import { useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  cn,
} from "@aottg2/ui";
import { useAuth } from "../../auth/useAuth";
import { useAccountsTheme } from "./accounts-theme-context";

function Icon({ children }: { children: ReactNode }) {
  return <span className="mr-2 inline-flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden="true">{children}</span>;
}

function UserIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" /></svg>;
}

function SettingsIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6V20a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.2.36.4.7.6 1h.1a2 2 0 1 1 0 4H20a1.7 1.7 0 0 0-.6 1Z" /></svg>;
}

function LogoutIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>;
}

function SunMoonIcon({ theme }: { theme: "light" | "dark" }) {
  return theme === "dark" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
  );
}

export function AuthNavbar() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, profile, logout } = useAuth();
  const { theme, toggleTheme } = useAccountsTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";
  const accountsActive = location.pathname === "/accounts" || location.pathname === "/login";
  const accountLabel = isAuthenticated && profile?.displayName ? profile.displayName : "ACCOUNTS";
  const logoText = location.pathname.startsWith("/account") ? "SETTINGS" : "LOGIN";

  function goHome() {
    navigate("/");
    window.scrollTo(0, 0);
  }

  function openMenu() {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function closeMenu() {
    window.clearTimeout(closeTimer.current);
    setOpen(false);
  }

  function closeMenuSoon() {
    closeTimer.current = window.setTimeout(() => setOpen(false), 250);
  }

  function goSettings() {
    closeMenu();
    navigate(isAuthenticated ? "/accounts" : "/login");
  }

  async function handleLogout() {
    closeMenu();
    await logout();
    navigate("/login");
  }

  function switchTheme() {
    toggleTheme();
    closeMenu();
  }

  return (
    <nav className="fixed top-0 z-50 w-full">
      <div className="aottg2-texture flex h-14 w-full items-center justify-between px-4 shadow-lg lg:h-16 lg:px-8">
        <button type="button" onClick={goHome} className="flex min-h-10 min-w-10 shrink-0 items-center transition-transform duration-150 ease-out active:scale-[0.96]" aria-label="AoTTG 2 home">
          <span className="aottg2-text-logo font-primary text-lg leading-none tracking-wide sm:text-xl lg:text-2xl">
            <span className="aottg2-text-logo-part text-foreground" data-text="AoTTG">AoTTG</span>
            <span className="aottg2-text-logo-part aottg2-textured-text text-primary" data-text={logoText}>{logoText}</span>
          </span>
        </button>

        <div className="flex flex-row items-center gap-6 font-primary text-foreground">
          <button type="button" onClick={goHome} className="transition-colors duration-150 ease-out hover:text-primary">
            HOME
          </button>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <div onPointerEnter={openMenu}>
              <DropdownMenuTrigger asChild>
                <button type="button" className={cn("inline-flex max-w-[12rem] cursor-pointer items-center gap-2 transition-colors duration-150 ease-out hover:text-primary", accountsActive && "text-primary")}>
                  <span className="h-4 w-4 shrink-0" aria-hidden="true"><UserIcon /></span>
                  <span className="truncate">{accountLabel}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={cn("aottg2-theme aottg2-palette-website w-56", theme)} onPointerEnter={openMenu} onPointerLeave={closeMenuSoon} onCloseAutoFocus={(event) => event.preventDefault()}>
                <DropdownMenuItem onSelect={goSettings}>
                  <Icon>{isAuthenticated ? <SettingsIcon /> : <UserIcon />}</Icon>
                  {isAuthenticated ? "Settings" : "Login"}
                </DropdownMenuItem>
                {isAuthenticated && (
                  <DropdownMenuItem onSelect={handleLogout}>
                    <Icon><LogoutIcon /></Icon>
                    Logout
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                <DropdownMenuItem onSelect={switchTheme}>
                  <Icon><SunMoonIcon theme={nextTheme} /></Icon>
                  Switch to {nextTheme === "dark" ? "Dark" : "Light"} Mode
                </DropdownMenuItem>
              </DropdownMenuContent>
            </div>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
