import React, { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Aottg2LogoLight, cn } from "@aottg2/ui";
import NavbarTexture from "../../assets/images/bg-light.webp";
import Logo from "../../assets/images/navbar-image.webp";
import { ADMIN_ACCESS_PERMISSIONS } from "../../auth/adminPermissions";
import { useAuth } from "../../auth/useAuth";
import { NAVBAR_HEIGHT_CLASS, NAVBAR_LOGO_HEIGHT_CLASS } from "../../data/layout";
import { getInitialTheme, saveTheme } from "../../utils/theme";
import useBreakpoint from "../../utils/useBreakpoint";

interface NavbarProps {
  refs: {
    [key: string]: React.RefObject<HTMLDivElement>;
  };
}

interface MenuItem {
  name: string;
  id?: string;
}

const SHOW_LOGIN_NAV = import.meta.env.SHOW_LOGIN_NAV?.toLowerCase() !== "false";

function Icon({ children }: { children: ReactNode }) {
  return <span className="mr-2 inline-flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden="true">{children}</span>;
}

function AccountMenuItem({ children, onClick }: { children: ReactNode; onClick: () => void | Promise<void> }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="relative flex w-full cursor-pointer select-none items-center rounded-none px-2 py-1.5 text-left text-sm outline-none transition-[background-color,color,opacity] duration-150 ease-out hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
    >
      {children}
    </button>
  );
}

function UserIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" /></svg>;
}

function SettingsIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z" /></svg>;
}

function LogoutIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>;
}

function SunMoonIcon({ theme }: { theme: "light" | "dark" }) {
  return theme === "dark" ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>;
}

const Navbar: React.FC<NavbarProps> = ({ refs }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);
  const isMobile = useBreakpoint(768);
  const { isAuthenticated, profile, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const nextTheme = theme === "dark" ? "light" : "dark";
  const isAdmin = profile?.roles.includes("admin") ?? false;
  const canAccessAdmin = isAdmin || ADMIN_ACCESS_PERMISSIONS.some((permission) => profile?.permissions?.includes(permission));
  const accountLabel = isAuthenticated ? profile?.displayName ?? "ACCOUNTS" : "ACCOUNTS";
  const menuItems: MenuItem[] = [
    { name: "DEVBLOG", id: "devblog" },
    { name: "COMMUNITY", id: "community" },
    { name: "SUPPORT", id: "support" },
    { name: "CREDITS", id: "credits" },
    { name: "PLAY", id: "home" },
  ];

  useEffect(() => {
    saveTheme(theme);
  }, [theme]);

  function closeFocusedMenu() {
    (document.activeElement as HTMLElement | null)?.blur();
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
    closeFocusedMenu();
    setIsMenuOpen(false);
  }

  function goSettings() {
    closeFocusedMenu();
    navigate(isAuthenticated ? "/accounts" : "/login");
    window.scrollTo(0, 0);
  }

  function goAdmin() {
    closeFocusedMenu();
    navigate("/admin");
    window.scrollTo(0, 0);
  }

  async function handleLogout() {
    closeFocusedMenu();
    await logout();
    navigate("/login");
  }

  const scrollToSection = (id: string) => {
    if (id === "credits") {
      navigate("/credits");
      window.scrollTo(0, 0);
    } else {
      if (location.pathname !== "/") {
        navigate("/");
      }
      setTimeout(() => refs[id]?.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
    setIsMenuOpen(false);
  };

  return (
    <motion.div className="fixed top-0 z-[1000] w-full">
      <div
        className={`w-full ${NAVBAR_HEIGHT_CLASS} px-4 md:px-8 z-50 flex justify-between items-center relative overflow-hidden shadow-lg ${theme === "dark" ? "bg-neutral-950 text-white" : "text-black"}`}
        style={{
          backgroundImage: theme === "light" ? `url(${NavbarTexture})` : "none",
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
          backgroundPosition: "center",
        }}
      >
        <img
          src={theme === "dark" ? Aottg2LogoLight : Logo}
          className={`${NAVBAR_LOGO_HEIGHT_CLASS} w-auto flex-shrink-0 object-contain cursor-pointer`}
          alt="AoTTG 2 home"
          width="453"
          height="155"
          decoding="async"
          onClick={() => scrollToSection("home")}
        />
        {isMobile ? (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-2xl focus:outline-none"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
          >
            ☰
          </button>
        ) : (
          <div className="flex flex-row items-center gap-6 font-primary">
            {menuItems.map((item) => (
              <button key={item.name} onClick={() => item.id && scrollToSection(item.id)} className="cursor-pointer transition-colors duration-300 hover:text-[#852837]">
                {item.name}
              </button>
            ))}
            {SHOW_LOGIN_NAV && (
              <div className="group relative z-[1001] flex h-full items-center">
                <button type="button" aria-haspopup="menu" className="inline-flex max-w-[12rem] cursor-pointer items-center gap-2 transition-colors duration-300 hover:text-[#852837] focus:text-[#852837] focus:outline-none">
                  <span className="h-4 w-4 shrink-0" aria-hidden="true"><UserIcon /></span>
                  <span className="truncate">{accountLabel}</span>
                </button>
                <div className="invisible fixed right-8 top-10 z-[1002] w-56 opacity-0 transition-[opacity,transform,visibility] duration-150 ease-out group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div role="menu" className={cn("aottg2-theme aottg2-palette-website aottg2-menu-content overflow-hidden rounded-none border border-border bg-popover p-1 text-popover-foreground shadow-md", theme)}>
                    <AccountMenuItem onClick={goSettings}><Icon>{isAuthenticated ? <SettingsIcon /> : <UserIcon />}</Icon>{isAuthenticated ? "Settings" : "Login"}</AccountMenuItem>
                    {canAccessAdmin && <AccountMenuItem onClick={goAdmin}><Icon><SettingsIcon /></Icon>Admin Panel</AccountMenuItem>}
                    {isAuthenticated && <AccountMenuItem onClick={handleLogout}><Icon><LogoutIcon /></Icon>Logout</AccountMenuItem>}
                    <div className="-mx-1 my-1 h-px bg-muted" role="separator" />
                    <div className="aottg2-texture aottg2-texture-primary -mx-1 -mt-1 mb-1 px-3 py-2 font-primary text-xs uppercase leading-none tracking-wide text-primary-foreground">Appearance</div>
                    <AccountMenuItem onClick={toggleTheme}><Icon><SunMoonIcon theme={nextTheme} /></Icon>Switch to {nextTheme === "dark" ? "Dark" : "Light"} Mode</AccountMenuItem>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isMobile && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: isMenuOpen ? "auto" : 0, opacity: isMenuOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className={`${theme === "dark" ? "bg-neutral-950" : "bg-[#111111]"} text-white overflow-hidden font-primary`}
        >
          {menuItems.map((item) => (
            <button key={item.name} onClick={() => item.id && scrollToSection(item.id)} className="w-full p-4 text-left transition-colors duration-300 hover:bg-gray-800">
              {item.name}
            </button>
          ))}
          {SHOW_LOGIN_NAV && <button onClick={goSettings} className="w-full p-4 text-left transition-colors duration-300 hover:bg-gray-800">⚙ Settings</button>}
          {canAccessAdmin && <button onClick={goAdmin} className="w-full p-4 text-left transition-colors duration-300 hover:bg-gray-800">⚙ Admin Panel</button>}
          {isAuthenticated && <button onClick={handleLogout} className="w-full p-4 text-left transition-colors duration-300 hover:bg-gray-800">↪ Logout</button>}
          <button onClick={toggleTheme} className="w-full p-4 text-left transition-colors duration-300 hover:bg-gray-800">Switch to {nextTheme === "dark" ? "Dark" : "Light"} Mode</button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Navbar;
