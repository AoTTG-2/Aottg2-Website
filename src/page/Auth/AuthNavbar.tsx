import { type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@aottg2/ui";
import { ADMIN_ACCESS_PERMISSIONS } from "../../auth/adminPermissions";
import { useAuth } from "../../auth/useAuth";
import { useAccountsTheme } from "./accounts-theme-context";

function Icon({ children }: { children: ReactNode }) {
  return <span className="mr-2 inline-flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden="true">{children}</span>;
}

function MenuItem({ children, onClick }: { children: ReactNode; onClick: () => void | Promise<void> }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="relative flex w-full cursor-pointer select-none items-center rounded-none px-2 py-1.5 text-left font-primary text-sm outline-none transition-[background-color,color,opacity] duration-150 ease-out hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
    >
      {children}
    </button>
  );
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
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, profile, logout } = useAuth();
  const { theme, toggleTheme } = useAccountsTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";
  const isAdmin = profile?.roles.includes("admin") ?? false;
  const canAccessAdmin = isAdmin || ADMIN_ACCESS_PERMISSIONS.some((permission) => profile?.permissions?.includes(permission));
  const accountsActive = location.pathname === "/accounts" || location.pathname === "/login" || location.pathname === "/admin";
  const accountLabel = isAuthenticated && profile?.displayName ? profile.displayName : "ACCOUNTS";
  const logoText = location.pathname.startsWith("/admin") ? "ADMIN" : location.pathname.startsWith("/account") ? "SETTINGS" : "LOGIN";

  function goHome() {
    navigate("/");
    window.scrollTo(0, 0);
  }

  function closeFocusedMenu() {
    (document.activeElement as HTMLElement | null)?.blur();
  }

  function goSettings() {
    closeFocusedMenu();
    navigate(isAuthenticated ? "/accounts" : "/login");
  }

  function goAdmin() {
    closeFocusedMenu();
    navigate("/admin");
  }

  async function handleLogout() {
    closeFocusedMenu();
    await logout();
    navigate("/login");
  }

  function switchTheme() {
    toggleTheme();
    closeFocusedMenu();
  }

  return (
    <nav className="fixed top-0 z-[1000] w-full overflow-visible">
      <div className="aottg2-texture relative z-[1000] flex h-14 w-full items-center justify-between px-4 shadow-lg lg:h-16 lg:px-8">
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
          <div className="group relative z-[1101] flex h-full items-center">
            <button
              type="button"
              aria-haspopup="menu"
              className={cn("inline-flex max-w-[12rem] cursor-pointer items-center gap-2 transition-colors duration-150 ease-out hover:text-primary focus:text-primary focus:outline-none", accountsActive && "text-primary")}
            >
              <span className="h-4 w-4 shrink-0" aria-hidden="true"><UserIcon /></span>
              <span className="truncate">{accountLabel}</span>
            </button>
            <div className="invisible fixed right-4 top-10 z-[1100] w-56 pt-1 opacity-0 transition-[opacity,visibility] duration-150 ease-out group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 lg:right-8 lg:top-11">
              <div role="menu" className={cn("aottg2-theme aottg2-palette-website aottg2-menu-content min-w-32 overflow-hidden rounded-none bg-popover p-1 text-popover-foreground shadow-md", theme)}>
                <div className="aottg2-emboss-bg aottg2-cta-primary -mx-1 -mt-1 mb-1 px-3 py-2 font-primary text-xs uppercase leading-none tracking-wider text-primary-foreground">Account</div>
                <MenuItem onClick={goSettings}>
                  <Icon>{isAuthenticated ? <SettingsIcon /> : <UserIcon />}</Icon>
                  {isAuthenticated ? "Settings" : "Login"}
                </MenuItem>
                {canAccessAdmin && (
                  <MenuItem onClick={goAdmin}>
                    <Icon><SettingsIcon /></Icon>
                    Admin Panel
                  </MenuItem>
                )}
                {isAuthenticated && (
                  <MenuItem onClick={handleLogout}>
                    <Icon><LogoutIcon /></Icon>
                    Logout
                  </MenuItem>
                )}
                <div className="-mx-1 my-1 h-px bg-muted" role="separator" />
                <div className="aottg2-emboss-bg aottg2-cta-primary -mx-1 mb-1 px-3 py-2 font-primary text-xs uppercase leading-none tracking-wider text-primary-foreground">Appearance</div>
                <MenuItem onClick={switchTheme}>
                  <Icon><SunMoonIcon theme={nextTheme} /></Icon>
                  Switch to {nextTheme === "dark" ? "Dark" : "Light"} Mode
                </MenuItem>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
