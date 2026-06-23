import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../../auth/api";
import type { OAuthProvider } from "../../auth/types";
import { useAuth } from "../../auth/useAuth";
import {
  Button,
  Card,
  CardContent,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
  SidebarToggle,
  Skeleton,
  cn,
} from "@aottg2/ui";
import { ErrorMessage, SuccessMessage } from "../Auth/AuthShell";
import { useAccountsTheme } from "../Auth/accounts-theme-context";

type AccountCardProps = {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
};

function AccountCard({ id, title, description, children }: AccountCardProps) {
  return (
    <Card id={id} className="grid scroll-mt-24 overflow-hidden border-border bg-card/90 text-card-foreground md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div className="border-b border-border bg-background/35 p-6 md:border-b-0 md:border-r md:p-8">
        <CardTitle>{title}</CardTitle>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <CardContent className="space-y-4 p-6 md:p-8">{children}</CardContent>
    </Card>
  );
}

function AccountSkeletonCard() {
  return (
    <Card className="grid overflow-hidden border-border bg-card/90 text-card-foreground md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div className="border-b border-border bg-background/35 p-6 md:border-b-0 md:border-r md:p-8">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-5 h-4 w-4/5" />
        <Skeleton className="mt-2 h-4 w-3/5" />
      </div>
      <CardContent className="space-y-4 p-6 md:p-8">
        <Skeleton variant="card" className="h-24" />
        <Skeleton variant="card" className="h-24" />
      </CardContent>
    </Card>
  );
}

function maskMiddle(value?: string) {
  if (!value) return "Not linked";
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}***${value.slice(-4)}`;
}

function CopyValue({ label, value }: { label: string; value?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="rounded-none border border-border bg-background/60 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-2 flex min-w-0 items-center gap-3">
        <span className="min-w-0 flex-1 truncate font-semibold text-foreground" title={value}>{maskMiddle(value)}</span>
        {value ? <Button type="button" variant="secondary" size="sm" onClick={copy}>{copied ? "Copied" : "Copy"}</Button> : null}
      </div>
    </div>
  );
}

function ConnectionStatus({ label, connected, detail, action }: { label: string; connected: boolean; detail?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-none border border-border bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="font-primary text-xl uppercase">{label}</div>
        <div className={cn("text-sm", connected ? "text-primary" : "text-muted-foreground")}>{connected ? `Connected${detail ? `: ${detail}` : ""}` : "Not connected"}</div>
      </div>
      {action}
    </div>
  );
}

function oauthLinkDetail(link?: { providerEmail?: string | null; providerUserId: string }) {
  return link?.providerEmail?.trim() || link?.providerUserId;
}

type AccountSectionId = "profile" | "display-name" | "email" | "connections" | "delete-account";

function SectionIcon({ type }: { type: AccountSectionId }) {
  const paths: Record<AccountSectionId, ReactNode> = {
    profile: <><circle cx="12" cy="7" r="4" /><path d="M20 21a8 8 0 0 0-16 0" /></>,
    "display-name": <><path d="M4 7h16" /><path d="M4 12h10" /><path d="M4 17h7" /></>,
    email: <><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></>,
    connections: <><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" /></>,
    "delete-account": <><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></>,
  };

  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">{paths[type]}</svg>;
}

const accountSections: Array<{ id: AccountSectionId; label: string }> = [
  { id: "profile", label: "Profile" },
  { id: "display-name", label: "Display name" },
  { id: "email", label: "Email" },
  { id: "connections", label: "Connections" },
  { id: "delete-account", label: "Delete account" },
];

function AccountSidebar({ activeSection, onSelect, onLogout }: { activeSection: AccountSectionId; onSelect: (id: AccountSectionId) => void; onLogout?: () => void }) {
  return (
    <Sidebar className="fixed left-0 top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 bg-card/90 pl-3 shadow-none md:top-16 md:h-[calc(100vh-4rem)] lg:flex">
      <SidebarHeader>
        <span className="truncate">Settings</span>
        <div className="ml-auto"><SidebarToggle /></div>
      </SidebarHeader>
      <SidebarSection title="Account">
        {accountSections.map((section) => (
          <SidebarItem key={section.id} icon={<SectionIcon type={section.id} />} active={activeSection === section.id} onClick={() => onSelect(section.id)}>
            {section.label}
          </SidebarItem>
        ))}
      </SidebarSection>
      <SidebarFooter>
        {onLogout ? <SidebarItem icon={<SectionIcon type="profile" />} onClick={onLogout}>Logout</SidebarItem> : null}
        <SidebarItem href="/">Back home</SidebarItem>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function Accounts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useAccountsTheme();
  const { profile, isAuthenticated, isLoading, logout, refreshProfile } = useAuth();
  const [newName, setNewName] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMessage, setNameMessage] = useState("");
  const [nameOk, setNameOk] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const [oauthError, setOauthError] = useState("");
  const [patreonLoading, setPatreonLoading] = useState(false);
  const [patreonError, setPatreonError] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordOk, setPasswordOk] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [activeSection, setActiveSection] = useState<AccountSectionId>("profile");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setNewName(profile.displayName);
    }
  }, [profile]);

  useEffect(() => {
    if (!profile || location.hash !== "#connections") {
      return;
    }

    window.setTimeout(() => {
      document.getElementById("connections")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection("connections");
    }, 0);
  }, [location.hash, profile]);

  useEffect(() => {
    function updateActiveSection() {
      const offset = 120;
      const current = accountSections.reduce<AccountSectionId>((active, section) => {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= offset) {
          return section.id;
        }
        return active;
      }, "profile");
      setActiveSection(current);
    }

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveSection);
  }, []);

  function scrollToSection(id: AccountSectionId) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  async function handleUpdateName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNameMessage("");
    setNameOk(false);

    const trimmed = newName.trim();
    if (!trimmed) {
      setNameMessage("Display name cannot be empty.");
      return;
    }

    setNameLoading(true);
    try {
      const { ok, data } = await authApi.updateProfile(trimmed);
      if (ok) {
        setNameMessage("Display name updated.");
        setNameOk(true);
        await refreshProfile();
      } else {
        setNameMessage(data.error ?? "Update failed.");
      }
    } catch {
      setNameMessage("Network error. Please try again.");
    } finally {
      setNameLoading(false);
    }
  }

  async function handlePatreonLink() {
    setPatreonError("");
    setPatreonLoading(true);
    try {
      const { ok, data } = await authApi.patreonStart();
      if (ok && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }

      setPatreonError(data.error ?? "Failed to start Patreon link.");
    } catch {
      setPatreonError("Network error. Please try again.");
    } finally {
      setPatreonLoading(false);
    }
  }

  async function handleOAuthLink(provider: OAuthProvider) {
    setOauthError("");
    setOauthLoading(provider);
    try {
      const { ok, data } = await authApi.oauthLinkStart(provider);
      if (ok && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }

      setOauthError(data.error ?? `Failed to start ${provider} link.`);
    } catch {
      setOauthError("Network error. Please try again.");
    } finally {
      setOauthLoading(null);
    }
  }

  async function handleOAuthUnlink(provider: OAuthProvider) {
    setOauthError("");
    setOauthLoading(provider);
    try {
      const { ok, data } = await authApi.oauthUnlink(provider);
      if (ok) {
        await refreshProfile();
      } else {
        setOauthError(data.error ?? `Failed to unlink ${provider}.`);
      }
    } catch {
      setOauthError("Network error. Please try again.");
    } finally {
      setOauthLoading(null);
    }
  }

  async function handleSetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setPasswordOk("");

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const { ok, data } = await authApi.setPassword(password);
      if (ok) {
        setPassword("");
        setConfirmPassword("");
        setPasswordOk("Password login is ready.");
        await refreshProfile();
        window.setTimeout(() => setPasswordOpen(false), 700);
      } else {
        setPasswordError(data.error ?? "Failed to set password.");
      }
    } catch {
      setPasswordError("Network error. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handlePatreonUnlink() {
    setPatreonError("");
    setPatreonLoading(true);
    try {
      const { ok, data } = await authApi.patreonUnlink();
      if (ok) {
        await refreshProfile();
      } else {
        setPatreonError(data.error ?? "Failed to unlink Patreon.");
      }
    } catch {
      setPatreonError("Network error. Please try again.");
    } finally {
      setPatreonLoading(false);
    }
  }

  async function handleDeleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeleteError("");

    if (deleteConfirm !== "DELETE") {
      setDeleteError("Type DELETE to confirm.");
      return;
    }

    setDeleteLoading(true);
    try {
      const { ok, data } = await authApi.deleteAccount();
      if (ok) {
        await logout();
        navigate("/login", { replace: true });
      } else {
        setDeleteError(data.error ?? "Deletion failed.");
      }
    } catch {
      setDeleteError("Network error. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  }

  if (isLoading || !profile) {
    return (
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-7xl items-start gap-6 px-4 py-6 text-foreground md:min-h-[calc(100vh-4rem)] md:px-6 lg:px-8">
        <AccountSidebar activeSection={activeSection} onSelect={scrollToSection} />
        <div className="grid min-w-0 flex-1 gap-6 lg:ml-64">
          <AccountSkeletonCard />
          <AccountSkeletonCard />
          <AccountSkeletonCard />
        </div>
      </main>
    );
  }

  const patreon = profile.patreon;
  const oauthLinks = profile.oAuthLinks ?? (profile as unknown as { oauthLinks?: typeof profile.oAuthLinks }).oauthLinks ?? [];
  const localLink = oauthLinks.find((link) => link.provider === "local");
  const discord = oauthLinks.find((link) => link.provider === "discord");
  const google = oauthLinks.find((link) => link.provider === "google");
  const hasPasswordLogin = profile.hasPassword || Boolean(localLink);
  const canSetPassword = !hasPasswordLogin && profile.emailVerified && !profile.email.toLowerCase().endsWith("@oauth.local");
  const dialogThemeClass = cn("aottg2-theme aottg2-palette-website", theme);

  return (
    <main className="relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-7xl items-start gap-6 px-4 py-6 text-foreground md:min-h-[calc(100vh-4rem)] md:px-6 lg:px-8">
      <AccountSidebar activeSection={activeSection} onSelect={scrollToSection} onLogout={handleLogout} />

      <div className="grid min-w-0 flex-1 gap-6 lg:ml-64">
        <AccountCard id="profile" title="Profile" description="Public account identifiers used by AOTTG2 services and game systems.">
          <CopyValue label="Display name" value={profile.displayName} />
          <CopyValue label="Photon user id" value={profile.photonUserId} />
          <CopyValue label="Account id" value={profile.accountId} />
        </AccountCard>

        <AccountCard id="display-name" title="Display name" description="Change the name shown on your AOTTG2 account. Max 25 characters.">
          <form className="space-y-4" onSubmit={handleUpdateName}>
            <div className="space-y-2">
              <Label htmlFor="new-display-name">Display name</Label>
              <Input id="new-display-name" type="text" autoComplete="username" value={newName} onChange={(event) => setNewName(event.target.value)} maxLength={25} required />
              <span className="block text-right text-xs text-muted-foreground">{newName.length}/25</span>
            </div>
            {nameMessage && (nameOk ? <SuccessMessage>{nameMessage}</SuccessMessage> : <ErrorMessage>{nameMessage}</ErrorMessage>)}
            <Button type="submit" size="lg" disabled={nameLoading}>{nameLoading ? "Saving…" : "Save changes"}</Button>
          </form>
        </AccountCard>

        <AccountCard id="email" title="Email" description="Email is used for verification, login recovery, and account security.">
          <CopyValue label="Email address" value={profile.email} />
          <div className="rounded-none border border-border bg-background/60 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Verification</div>
            <div className={cn("mt-2 font-primary text-xl uppercase", profile.emailVerified ? "text-primary" : "text-destructive")}>{profile.emailVerified ? "Verified" : "Not verified"}</div>
            {!profile.emailVerified && <p className="mt-2 text-sm text-muted-foreground">Check your inbox or request a new verification email from the login flow.</p>}
          </div>
          <div className="rounded-none border border-border bg-background/60 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Password login</div>
            <div className={cn("mt-2 font-primary text-xl uppercase", hasPasswordLogin ? "text-primary" : "text-muted-foreground")}>{hasPasswordLogin ? "Ready" : "Not set"}</div>
            {canSetPassword ? (
              <Dialog open={passwordOpen} onOpenChange={(open) => { setPasswordOpen(open); if (!open) { setPassword(""); setConfirmPassword(""); setPasswordError(""); setPasswordOk(""); } }}>
                <Button type="button" className="mt-4" onClick={() => setPasswordOpen(true)}>Set password</Button>
                <DialogContent className={dialogThemeClass}>
                  <DialogHeader>
                    <DialogTitle>Set password</DialogTitle>
                    <DialogDescription>Add email and password as a login method for this account.</DialogDescription>
                  </DialogHeader>
                  <form className="space-y-4" onSubmit={handleSetPassword}>
                    <div className="space-y-2">
                      <Label htmlFor="set-password">New password</Label>
                      <Input id="set-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-set-password">Confirm password</Label>
                      <Input id="confirm-set-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} />
                    </div>
                    {passwordError && <ErrorMessage>{passwordError}</ErrorMessage>}
                    {passwordOk && <SuccessMessage>{passwordOk}</SuccessMessage>}
                    <DialogFooter>
                      <Button type="button" variant="secondary" onClick={() => setPasswordOpen(false)} disabled={passwordLoading}>Cancel</Button>
                      <Button type="submit" disabled={passwordLoading}>{passwordLoading ? "Saving…" : "Set password"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            ) : !hasPasswordLogin ? (
              <p className="mt-2 text-sm text-muted-foreground">Use a verified provider login for this account.</p>
            ) : null}
          </div>
        </AccountCard>

        <AccountCard id="connections" title="Connections" description="Connected services can unlock sign-in options and supporter status.">
          <ConnectionStatus
            label="Discord"
            connected={Boolean(discord)}
            detail={oauthLinkDetail(discord)}
            action={discord ? (
              <Button type="button" variant="secondary" onClick={() => handleOAuthUnlink("discord")} disabled={oauthLoading !== null}>{oauthLoading === "discord" ? "Unlinking…" : "Unlink Discord"}</Button>
            ) : (
              <Button type="button" onClick={() => handleOAuthLink("discord")} disabled={oauthLoading !== null}>{oauthLoading === "discord" ? "Redirecting…" : "Link Discord"}</Button>
            )}
          />
          <ConnectionStatus
            label="Google"
            connected={Boolean(google)}
            detail={oauthLinkDetail(google)}
            action={google ? (
              <Button type="button" variant="secondary" onClick={() => handleOAuthUnlink("google")} disabled={oauthLoading !== null}>{oauthLoading === "google" ? "Unlinking…" : "Unlink Google"}</Button>
            ) : (
              <Button type="button" onClick={() => handleOAuthLink("google")} disabled={oauthLoading !== null}>{oauthLoading === "google" ? "Redirecting…" : "Link Google"}</Button>
            )}
          />
          <ConnectionStatus
            label="Patreon"
            connected={Boolean(patreon?.linked)}
            detail={patreon?.patronStatus ?? undefined}
            action={patreon?.linked ? (
              <Button type="button" variant="secondary" onClick={handlePatreonUnlink} disabled={patreonLoading}>{patreonLoading ? "Unlinking…" : "Unlink Patreon"}</Button>
            ) : (
              <Button type="button" onClick={handlePatreonLink} disabled={patreonLoading}>{patreonLoading ? "Redirecting…" : "Link Patreon"}</Button>
            )}
          />
          {patreon?.linked && patreon.tierIds.length > 0 && <p className="text-sm text-muted-foreground">Tiers: <span className="font-semibold text-foreground">{patreon.tierIds.join(", ")}</span></p>}
          {patreon?.linked && patreon.entitledAmountCents != null && <p className="text-sm text-muted-foreground">Pledge: <span className="font-semibold text-foreground">${(patreon.entitledAmountCents / 100).toFixed(2)}/month</span></p>}
          {oauthError && <ErrorMessage>{oauthError}</ErrorMessage>}
          {patreonError && <ErrorMessage>{patreonError}</ErrorMessage>}
        </AccountCard>

        <AccountCard id="delete-account" title="Delete account" description="Permanently delete this account and associated data. This cannot be undone.">
          <p className="text-sm leading-6 text-muted-foreground">Use this only if you want to permanently remove your AOTTG2 account.</p>
          <Dialog open={deleteOpen} onOpenChange={(open) => { setDeleteOpen(open); if (!open) setDeleteConfirm(""); }}>
            <Button type="button" variant="destructive" size="lg" onClick={() => setDeleteOpen(true)}>Delete account</Button>
            <DialogContent variant="destructive" className={dialogThemeClass}>
              <DialogHeader>
                <DialogTitle>Danger: delete account</DialogTitle>
                <DialogDescription>This permanently deletes your account and associated data. This action cannot be undone.</DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleDeleteAccount}>
                <div className="space-y-2">
                  <Label htmlFor="delete-confirm">Type <strong>DELETE</strong> to confirm</Label>
                  <Input id="delete-confirm" type="text" autoComplete="off" placeholder="DELETE" value={deleteConfirm} onChange={(event) => setDeleteConfirm(event.target.value)} className="border-red-500/40 focus-visible:ring-red-400" />
                </div>
                {deleteError && <ErrorMessage>{deleteError}</ErrorMessage>}
                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>Cancel</Button>
                  <Button type="submit" variant="destructive" disabled={deleteLoading}>{deleteLoading ? "Deleting…" : "Delete forever"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </AccountCard>
      </div>
    </main>
  );
}
