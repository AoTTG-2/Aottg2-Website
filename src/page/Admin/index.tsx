import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiGrid, FiHeart, FiHome, FiKey, FiMail, FiMoreHorizontal, FiSettings, FiShield, FiUsers } from "react-icons/fi";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  ConfirmDialog,
  DataTable,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  FilterBar,
  Input,
  Label,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SearchInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
  SidebarToggle,
  Spinner,
  StatCard,
  StatusBadge,
  Textarea,
  toast,
} from "@aottg2/ui";
import { authApi } from "../../auth/api";
import { ADMIN_ACCESS_PERMISSIONS } from "../../auth/adminPermissions";
import { useAuth } from "../../auth/useAuth";
import type { AdminAccountDetailResponse, AdminAccountFilters, AuditEventResponse, EmailLimitStatusResponse, PatreonTierResponse, PermissionResponse, ProfileResponse, RoleResponse } from "../../auth/types";
import { AuditFilterSettings } from "./AuditFilterSettings";
import { UserFilterSettings } from "./UserFilterSettings";
import { EMPTY_USER_FILTERS } from "./userFilters";

type AdminSection = "overview" | "users" | "roles" | "permissions" | "audits" | "emails" | "patreon";
const ADMIN_DIALOG_SCROLL_CLASS = "max-h-[calc(100dvh-2rem)] overflow-y-auto";

type ActionMenuItem = {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
};

function ActionMenu({ items }: { items: ActionMenuItem[] }) {
  if (!items.length) return null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon">
          <FiMoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open row actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item, index) => (
          <DropdownMenuItem key={index} onSelect={item.onSelect} className={item.destructive ? "text-destructive" : undefined}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type AuditViewMode = "readable" | "technical";
type AuditAccountSummary = NonNullable<AuditEventResponse["actor"]>;
type AuditAccountLookup = Record<string, AuditAccountSummary>;
type AuditMetadata = Record<string, unknown>;

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function formatAuditTimestamp(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatCount(value?: number) {
  return new Intl.NumberFormat().format(value ?? 0);
}

function formatMoneyCents(value?: number | null) {
  return value == null ? "—" : `$${(value / 100).toFixed(2)}`;
}

function patreonStatusText(patreon?: ProfileResponse["patreon"]) {
  if (!patreon?.linked) return "Unlinked";
  if (patreon.manualOverride) return "Manual";
  return patreon.patronStatus === "active_patron" ? "Linked" : patreon.patronStatus ?? "Linked";
}

function usagePercent(sent: number, limit: number) {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((sent / limit) * 100));
}

function readPositiveInt(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function readBoundedInt(value: string, min: number, max: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseAuditMetadata(metadataJson?: string | null): AuditMetadata {
  if (!metadataJson) return {};

  try {
    const parsed: unknown = JSON.parse(metadataJson);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function getMetadataString(metadata: AuditMetadata, key: string) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function formatAuditAccount(account?: AuditAccountSummary | null, fallbackName = "Unknown user") {
  if (!account) return fallbackName;
  const displayName = account.displayName?.trim();
  const email = account.email?.trim();

  if (displayName && email) return `${displayName} (${email})`;
  return email || displayName || fallbackName;
}

function getAuditMetadataDisplayName(metadata: AuditMetadata) {
  const after = isRecord(metadata.after) ? metadata.after : null;
  const before = isRecord(metadata.before) ? metadata.before : null;
  const afterName = after ? getMetadataString(after, "DisplayName") ?? getMetadataString(after, "displayName") : undefined;
  const beforeName = before ? getMetadataString(before, "DisplayName") ?? getMetadataString(before, "displayName") : undefined;
  return afterName ?? beforeName;
}

function getAuditLookupAccount(accountId: string | null | undefined, accountLookup: AuditAccountLookup) {
  return accountId && accountId !== "system" ? accountLookup[accountId] : undefined;
}

function formatAuditActor(event: AuditEventResponse, accountLookup: AuditAccountLookup) {
  if (event.actor) return formatAuditAccount(event.actor);
  const lookupAccount = getAuditLookupAccount(event.actorAccountId, accountLookup);
  if (lookupAccount) return formatAuditAccount(lookupAccount);
  return !event.actorAccountId || event.actorAccountId === "system" ? "System" : "Unknown user";
}

function formatAuditTarget(event: AuditEventResponse, metadata: AuditMetadata, accountLookup: AuditAccountLookup) {
  if (event.target) return formatAuditAccount(event.target);
  const lookupAccount = getAuditLookupAccount(event.targetAccountId, accountLookup);
  if (lookupAccount) return formatAuditAccount(lookupAccount);
  if (event.targetAccountId === "system") return "System";
  return getAuditMetadataDisplayName(metadata) ?? "Unknown user";
}

function formatAuditFieldName(key: string) {
  const labels: Record<string, string> = {
    DisplayName: "display name",
    displayName: "display name",
    EmailVerified: "email status",
    emailVerified: "email status",
  };

  return labels[key] ?? key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").toLowerCase();
}

function formatAuditValue(key: string, value: unknown) {
  if ((key === "EmailVerified" || key === "emailVerified") && typeof value === "boolean") {
    return value ? "verified" : "unverified";
  }

  if (typeof value === "string") return value || "empty";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null || value === undefined) return "empty";
  return JSON.stringify(value) ?? String(value);
}

function AuditName({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}

function AuditAction({ children, tone = "neutral" }: { children: ReactNode; tone?: "added" | "removed" | "neutral" }) {
  const className = tone === "removed"
    ? "font-semibold text-destructive"
    : tone === "added"
      ? "font-semibold text-emerald-500 dark:text-emerald-400"
      : "font-semibold text-primary";

  return <span className={className}>{children}</span>;
}

function AuditValue({ children, tone = "neutral" }: { children: ReactNode; tone?: "before" | "after" | "neutral" }) {
  const className = tone === "before"
    ? "rounded-md bg-muted px-1.5 py-0.5 font-medium text-muted-foreground"
    : tone === "after"
      ? "rounded-md bg-primary/10 px-1.5 py-0.5 font-semibold text-primary"
      : "font-semibold text-foreground";

  return <span className={className}>{children}</span>;
}

function AuditRolePill({ role, roles, tone = "added" }: { role: string; roles: RoleResponse[]; tone?: "added" | "removed" }) {
  return <Badge variant={tone === "removed" ? "destructive" : roleVariant(role)} className="align-middle">{roleLabel(role, roles)}</Badge>;
}

function renderAuditChanges(metadata: AuditMetadata) {
  const before = isRecord(metadata.before) ? metadata.before : null;
  const after = isRecord(metadata.after) ? metadata.after : null;
  if (!before || !after) return null;

  const changes = Object.keys(after).filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]));
  if (!changes.length) return null;

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className="text-muted-foreground">:</span>
      {changes.map((key, index) => (
        <span key={key} className="inline-flex flex-wrap items-center gap-1.5">
          {index > 0 ? <span className="text-muted-foreground">,</span> : null}
          <AuditValue>{formatAuditFieldName(key)}</AuditValue>
          <span>changed from</span>
          <AuditValue tone="before">{formatAuditValue(key, before[key])}</AuditValue>
          <span>to</span>
          <AuditValue tone="after">{formatAuditValue(key, after[key])}</AuditValue>
        </span>
      ))}
    </span>
  );
}

function renderAuditActivity(event: AuditEventResponse, roles: RoleResponse[], accountLookup: AuditAccountLookup = {}) {
  const metadata = parseAuditMetadata(event.metadataJson);
  const actor = formatAuditActor(event, accountLookup);
  const target = formatAuditTarget(event, metadata, accountLookup);
  const contentClassName = "inline-flex flex-wrap items-center gap-1.5 leading-7";

  switch (event.eventType) {
    case "admin.user_role_assigned": {
      const role = getMetadataString(metadata, "role");
      return (
        <span className={contentClassName}>
          <AuditName>{actor}</AuditName>
          <AuditAction tone="added">added</AuditAction>
          {role ? <AuditRolePill role={role} roles={roles} /> : <AuditValue>a role</AuditValue>}
          <span>to</span>
          <AuditName>{target}</AuditName>
        </span>
      );
    }
    case "admin.user_role_removed": {
      const role = getMetadataString(metadata, "role");
      return (
        <span className={contentClassName}>
          <AuditName>{actor}</AuditName>
          <AuditAction tone="removed">removed</AuditAction>
          {role ? <AuditRolePill role={role} roles={roles} tone="removed" /> : <AuditValue>a role</AuditValue>}
          <span>from</span>
          <AuditName>{target}</AuditName>
        </span>
      );
    }
    case "admin.user_updated":
      return (
        <span className={contentClassName}>
          <AuditName>{actor}</AuditName>
          <AuditAction>updated</AuditAction>
          <AuditName>{target}</AuditName>
          {renderAuditChanges(metadata)}
        </span>
      );
    case "admin.email_limits_updated":
      return (
        <span className={contentClassName}>
          <AuditName>{actor}</AuditName>
          <AuditAction>updated</AuditAction>
          <AuditValue>email service limits</AuditValue>
        </span>
      );
    case "admin.patreon_tiers_updated":
      return (
        <span className={contentClassName}>
          <AuditName>{actor}</AuditName>
          <AuditAction>updated</AuditAction>
          <AuditValue>Patreon tiers</AuditValue>
          <span>for</span>
          <AuditName>{target}</AuditName>
        </span>
      );
    case "admin.patreon_tiers_refreshed":
      return (
        <span className={contentClassName}>
          <AuditName>{actor}</AuditName>
          <AuditAction>refreshed</AuditAction>
          <AuditValue>Patreon tiers</AuditValue>
          <span>for</span>
          <AuditName>{target}</AuditName>
        </span>
      );
    case "admin.patreon_tier_labels_updated":
      return (
        <span className={contentClassName}>
          <AuditName>{actor}</AuditName>
          <AuditAction>updated</AuditAction>
          <AuditValue>Patreon tier labels</AuditValue>
        </span>
      );
    case "account.registered":
      return (
        <span className={contentClassName}>
          <AuditName>{target}</AuditName>
          <AuditAction tone="added">registered</AuditAction>
          <span>an account</span>
        </span>
      );
    case "account.email_verified":
      return (
        <span className={contentClassName}>
          <AuditName>{target}</AuditName>
          <AuditAction tone="added">verified</AuditAction>
          <span>their email</span>
        </span>
      );
    case "account.admin_bootstrapped":
      return (
        <span className={contentClassName}>
          <AuditName>System</AuditName>
          <AuditAction tone="added">bootstrapped</AuditAction>
          <span>admin account</span>
          <AuditName>{target}</AuditName>
        </span>
      );
    default:
      return (
        <span className={contentClassName}>
          <AuditName>{actor}</AuditName>
          <span>performed</span>
          <Badge variant="outline">{event.eventType}</Badge>
          <span>on</span>
          <AuditName>{target}</AuditName>
        </span>
      );
  }
}

function roleVariant(role: string): BadgeVariant {
  if (role === "admin") return "destructive";
  if (role === "moderator" || role === "trusted") return "textured";
  return "secondary";
}

function roleLabel(role: string, roles: RoleResponse[]) {
  return roles.find((item) => item.name === role)?.displayName ?? role;
}

type BadgeVariant = "default" | "destructive" | "textured" | "secondary" | "outline";

type MultiSelectItem = {
  key: string;
  label: string;
  search?: string;
  variant?: BadgeVariant;
  help?: ReactNode;
};

function PillMultiSelect({
  ariaLabel,
  emptyText,
  items,
  searchPlaceholder,
  value,
  onChange,
}: {
  ariaLabel: string;
  emptyText: string;
  items: MultiSelectItem[];
  searchPlaceholder: string;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const itemMap = new Map(items.map((item) => [item.key, item]));

  function toggle(key: string) {
    onChange(value.includes(key) ? value.filter((item) => item !== key) : [...value, key]);
  }

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          tabIndex={0}
          aria-label={ariaLabel}
          className="flex min-h-11 w-full cursor-pointer flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-left text-sm shadow-sm transition-colors hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpen((current) => !current);
            }
          }}
        >
          {value.length ? value.map((key) => {
            const item = itemMap.get(key) ?? { key, label: key, variant: "secondary" as BadgeVariant };
            return (
              <Badge key={key} variant={item.variant ?? "secondary"} className="gap-1 pr-1">
                {item.label}
                <button
                  type="button"
                  className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggle(key);
                  }}
                  onKeyDown={(event) => event.stopPropagation()}
                  aria-label={`Remove ${item.label}`}
                >
                  ×
                </button>
              </Badge>
            );
          }) : <span className="text-muted-foreground">{emptyText}</span>}
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-80 p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>No matches found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => {
                const selected = value.includes(item.key);
                return (
                  <CommandItem key={item.key} value={item.search ?? item.label} onSelect={() => toggle(item.key)}>
                    <span className="mr-2 w-4 text-center">{selected ? "✓" : ""}</span>
                    <div className="flex min-w-0 flex-col gap-1">
                      <Badge variant={item.variant ?? "secondary"} className="w-fit">{item.label}</Badge>
                      {item.help ? <span className="text-xs text-muted-foreground">{item.help}</span> : null}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function RoleMultiSelect({ roles, value, onChange }: { roles: RoleResponse[]; value: string[]; onChange: (roles: string[]) => void }) {
  return (
    <PillMultiSelect
      ariaLabel="Manage roles"
      emptyText="No roles selected"
      items={roles.map((role) => ({ key: role.name, label: roleLabel(role.name, roles), variant: roleVariant(role.name) }))}
      searchPlaceholder="Search roles"
      value={value}
      onChange={onChange}
    />
  );
}

function PermissionMultiSelect({ permissions, value, onChange }: { permissions: PermissionResponse[]; value: string[]; onChange: (permissions: string[]) => void }) {
  return (
    <PillMultiSelect
      ariaLabel="Manage permissions"
      emptyText="No permissions selected"
      items={permissions.map((permission) => ({
        key: permission.key,
        label: permission.key,
        search: `${permission.key} ${permission.description}`,
        variant: "outline",
        help: permission.description,
      }))}
      searchPlaceholder="Search permissions"
      value={value}
      onChange={onChange}
    />
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const { profile, isAuthenticated, isLoading } = useAuth();
  const isAdmin = profile?.roles.includes("admin") ?? false;
  const permissionSet = new Set(profile?.permissions ?? []);
  const can = (permission: string) => isAdmin || permissionSet.has(permission);
  const canAny = (...permissions: string[]) => permissions.some(can);
  const canAccessAdmin = canAny(...ADMIN_ACCESS_PERMISSIONS);
  const canReadUsers = can("users.read");
  const canUpdateUsers = can("users.update");
  const canDeleteUsers = can("users.delete");
  const canAssignUserRoles = can("users.roles.assign");
  const canRemoveUserRoles = can("users.roles.remove");
  const canManageUserRoles = can("users.roles.read") && (canAssignUserRoles || canRemoveUserRoles);
  const canReadRoles = can("roles.read");
  const canCreateRoles = can("roles.create");
  const canUpdateRoles = can("roles.update");
  const canDeleteRoles = can("roles.delete");
  const canReadRolePermissions = can("roles.permissions.read");
  const canUpdateRolePermissions = can("roles.permissions.update");
  const canUpdateSystemRoles = can("roles.system.update");
  const canDeleteSystemRoles = can("roles.system.delete");
  const canReadPermissions = can("permissions.read");
  const canReadAudits = can("audits.read");
  const canReadEmails = can("emails.read");
  const canUpdateEmails = isAdmin && can("emails.update");
  const canReadPatreon = isAdmin && can("patreon.read");
  const canUpdatePatreon = isAdmin && can("patreon.update");
  const [section, setSection] = useState<AdminSection>("overview");
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState("");
  const [rolesRefreshKey, setRolesRefreshKey] = useState(0);
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsError, setPermissionsError] = useState("");
  const [permissionsRefreshKey, setPermissionsRefreshKey] = useState(0);
  const [emailLimits, setEmailLimits] = useState<EmailLimitStatusResponse | null>(null);
  const [emailLimitsLoading, setEmailLimitsLoading] = useState(false);
  const [emailLimitsError, setEmailLimitsError] = useState("");
  const [emailLimitsRefreshKey, setEmailLimitsRefreshKey] = useState(0);
  const [monthlyHardLimit, setMonthlyHardLimit] = useState("");
  const [dailyRecipientLimit, setDailyRecipientLimit] = useState("");
  const [dailyIpLimit, setDailyIpLimit] = useState("");
  const [monthlyResetDay, setMonthlyResetDay] = useState("");
  const [dailyResetHourUtc, setDailyResetHourUtc] = useState("");
  const [emailLimitsSaving, setEmailLimitsSaving] = useState(false);
  const [patreonTiers, setPatreonTiers] = useState<PatreonTierResponse[]>([]);
  const [patreonTiersLoading, setPatreonTiersLoading] = useState(false);
  const [patreonTiersError, setPatreonTiersError] = useState("");
  const [patreonTierLabelsJson, setPatreonTierLabelsJson] = useState("[]");
  const [patreonTierLabelsSaving, setPatreonTierLabelsSaving] = useState(false);
  const [patreonRefreshKey, setPatreonRefreshKey] = useState(0);
  const [auditEvents, setAuditEvents] = useState<AuditEventResponse[]>([]);
  const [auditsTotal, setAuditsTotal] = useState(0);
  const [auditsLoading, setAuditsLoading] = useState(false);
  const [auditsError, setAuditsError] = useState("");
  const [auditEventType, setAuditEventType] = useState("");
  const [debouncedAuditEventType, setDebouncedAuditEventType] = useState("");
  const [auditUserSearch, setAuditUserSearch] = useState("");
  const [auditAccountFilter, setAuditAccountFilter] = useState<AuditAccountSummary | null>(null);
  const [auditUserSearchLoading, setAuditUserSearchLoading] = useState(false);
  const [auditsPage, setAuditsPage] = useState(1);
  const [auditsPageSize, setAuditsPageSize] = useState(50);
  const [auditsRefreshKey, setAuditsRefreshKey] = useState(0);
  const [auditViewMode, setAuditViewMode] = useState<AuditViewMode>("readable");
  const [auditAccountLookup, setAuditAccountLookup] = useState<AuditAccountLookup>({});
  const [users, setUsers] = useState<ProfileResponse[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [userFilters, setUserFilters] = useState<AdminAccountFilters>(EMPTY_USER_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [refreshKey, setRefreshKey] = useState(0);
  const [detail, setDetail] = useState<AdminAccountDetailResponse | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editUser, setEditUser] = useState<ProfileResponse | null>(null);
  const [editName, setEditName] = useState("");
  const [editVerified, setEditVerified] = useState(false);
  const [assignUser, setAssignUser] = useState<ProfileResponse | null>(null);
  const [roleDraft, setRoleDraft] = useState<string[]>([]);
  const [patreonUser, setPatreonUser] = useState<ProfileResponse | AdminAccountDetailResponse | null>(null);
  const [patreonTierDraft, setPatreonTierDraft] = useState<string[]>([]);
  const [patreonStatusDraft, setPatreonStatusDraft] = useState("");
  const [patreonAmountDraft, setPatreonAmountDraft] = useState("");
  const [patreonCustomTier, setPatreonCustomTier] = useState("");
  const [clearPatreonOverrideUser, setClearPatreonOverrideUser] = useState<ProfileResponse | AdminAccountDetailResponse | null>(null);
  const [deleteUser, setDeleteUser] = useState<ProfileResponse | null>(null);
  const [roleFormMode, setRoleFormMode] = useState<"create" | "edit" | null>(null);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDisplayName, setRoleDisplayName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [deleteRoleTarget, setDeleteRoleTarget] = useState<RoleResponse | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const pageCount = Math.max(1, Math.ceil(totalUsers / pageSize));
  const auditsPageCount = Math.max(1, Math.ceil(auditsTotal / auditsPageSize));
  const sectionItems: Array<{ id: AdminSection; label: string; icon: ReactNode; visible: boolean }> = [
    { id: "overview", label: "Overview", icon: <FiGrid />, visible: canAccessAdmin },
    { id: "users", label: "Users", icon: <FiUsers />, visible: canReadUsers },
    { id: "roles", label: "Roles", icon: <FiShield />, visible: canReadRoles },
    { id: "permissions", label: "Permissions", icon: <FiKey />, visible: canReadPermissions },
    { id: "audits", label: "Audit logs", icon: <FiFileText />, visible: canReadAudits },
    { id: "emails", label: "Email Service", icon: <FiMail />, visible: canReadEmails },
    { id: "patreon", label: "Patreon", icon: <FiHeart />, visible: canReadPatreon },
  ];
  const visibleSectionItems = sectionItems.filter((item) => item.visible);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!canAccessAdmin || visibleSectionItems.some((item) => item.id === section)) return;
    setSection(visibleSectionItems[0]?.id ?? "overview");
  }, [canAccessAdmin, section, visibleSectionItems]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedAuditEventType(auditEventType);
      setAuditsPage(1);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [auditEventType]);

  useEffect(() => {
    if (!canReadRoles) return;

    setRolesLoading(true);
    setRolesError("");
    authApi.listRoles().then(({ ok, data }) => {
      if (ok && Array.isArray(data)) {
        setRoles(data);
      } else {
        setRolesError(data.error ?? "Could not load roles.");
        toast.error("Could not load roles", { description: data.error ?? "Role actions are limited." });
      }
    }).catch(() => {
      setRolesError("Could not load roles.");
      toast.error("Could not load roles");
    }).finally(() => setRolesLoading(false));
  }, [canReadRoles, rolesRefreshKey]);

  useEffect(() => {
    if (!canReadPermissions) return;

    setPermissionsLoading(true);
    setPermissionsError("");
    authApi.listPermissions().then(({ ok, data }) => {
      if (ok && Array.isArray(data)) {
        setPermissions(data);
      } else {
        setPermissionsError(data.error ?? "Could not load permissions.");
        toast.error("Could not load permissions", { description: data.error ?? "Permission catalog unavailable." });
      }
    }).catch(() => {
      setPermissionsError("Could not load permissions.");
      toast.error("Could not load permissions");
    }).finally(() => setPermissionsLoading(false));
  }, [canReadPermissions, permissionsRefreshKey]);

  useEffect(() => {
    if (!canReadEmails || section !== "emails") return;

    const controller = new AbortController();
    setEmailLimitsLoading(true);
    setEmailLimitsError("");

    authApi.getEmailLimits(controller.signal)
      .then(({ ok, data }) => {
        if (controller.signal.aborted) return;
        if (ok) {
          setEmailLimits(data);
          setMonthlyHardLimit(String(data.settings.monthlyHardLimit));
          setDailyRecipientLimit(String(data.settings.dailyRecipientLimit));
          setDailyIpLimit(String(data.settings.dailyIpLimit));
          setMonthlyResetDay(String(data.settings.monthlyResetDay));
          setDailyResetHourUtc(String(data.settings.dailyResetHourUtc));
        } else {
          setEmailLimitsError(data.error ?? "Could not load email service limits.");
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setEmailLimitsError(error instanceof Error ? error.message : "Could not load email service limits.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setEmailLimitsLoading(false);
      });

    return () => controller.abort();
  }, [canReadEmails, emailLimitsRefreshKey, section]);

  useEffect(() => {
    if (!canReadPatreon || section !== "patreon") return;

    setPatreonTiersLoading(true);
    setPatreonTiersError("");

    Promise.all([authApi.listPatreonTiers(), authApi.getPatreonTierLabels()])
      .then(([tiersResult, labelsResult]) => {
        if (tiersResult.ok) {
          setPatreonTiers(Array.isArray(tiersResult.data) ? tiersResult.data : []);
        } else {
          setPatreonTiersError(tiersResult.data.error ?? "Could not load Patreon tiers.");
        }

        if (labelsResult.ok) {
          setPatreonTierLabelsJson(JSON.stringify(labelsResult.data.tiers ?? [], null, 2));
        }
      })
      .catch((error: unknown) => {
        setPatreonTiersError(error instanceof Error ? error.message : "Could not load Patreon tiers.");
      })
      .finally(() => setPatreonTiersLoading(false));
  }, [canReadPatreon, patreonRefreshKey, section]);

  useEffect(() => {
    if (!canReadUsers || section !== "users") return;

    const controller = new AbortController();
    setUsersLoading(true);
    setUsersError("");

    authApi.listAdminAccounts(debouncedSearch, page, pageSize, userFilters, controller.signal)
      .then(({ ok, data }) => {
        if (controller.signal.aborted) return;
        if (ok) {
          setUsers(data.accounts ?? []);
          setTotalUsers(data.total ?? 0);
        } else {
          setUsersError(data.error ?? "Could not load users.");
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setUsersError(error instanceof Error ? error.message : "Could not load users.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setUsersLoading(false);
      });

    return () => controller.abort();
  }, [canReadUsers, debouncedSearch, page, pageSize, refreshKey, section, userFilters]);

  useEffect(() => {
    if (!canReadAudits || section !== "audits") return;

    const controller = new AbortController();
    setAuditsLoading(true);
    setAuditsError("");

    authApi.listAuditEvents(debouncedAuditEventType, auditsPage, auditsPageSize, auditAccountFilter?.accountId, controller.signal)
      .then(({ ok, data }) => {
        if (controller.signal.aborted) return;
        if (ok) {
          setAuditEvents(data.events ?? []);
          setAuditsTotal(data.total ?? 0);
        } else {
          setAuditsError(data.error ?? "Could not load audit logs.");
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setAuditsError(error instanceof Error ? error.message : "Could not load audit logs.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setAuditsLoading(false);
      });

    return () => controller.abort();
  }, [auditAccountFilter?.accountId, auditsPage, auditsPageSize, auditsRefreshKey, canReadAudits, debouncedAuditEventType, section]);

  useEffect(() => {
    if (!canReadUsers || !canReadAudits || section !== "audits" || !auditEvents.length) return;

    const accountIds = new Set<string>();
    for (const event of auditEvents) {
      if (!event.actor && event.actorAccountId && event.actorAccountId !== "system" && !auditAccountLookup[event.actorAccountId]) {
        accountIds.add(event.actorAccountId);
      }
      if (!event.target && event.targetAccountId && event.targetAccountId !== "system" && !auditAccountLookup[event.targetAccountId]) {
        accountIds.add(event.targetAccountId);
      }
    }

    if (!accountIds.size) return;

    let cancelled = false;
    Promise.allSettled(Array.from(accountIds).map(async (accountId) => {
      const { ok, data } = await authApi.getAdminAccount(accountId);
      if (!ok) return null;
      return { accountId: data.accountId, displayName: data.displayName, email: data.email } satisfies AuditAccountSummary;
    })).then((results) => {
      if (cancelled) return;
      const nextLookup: AuditAccountLookup = {};
      for (const result of results) {
        if (result.status === "fulfilled" && result.value) {
          nextLookup[result.value.accountId] = result.value;
        }
      }
      if (Object.keys(nextLookup).length) {
        setAuditAccountLookup((current) => ({ ...current, ...nextLookup }));
      }
    });

    return () => { cancelled = true; };
  }, [auditAccountLookup, auditEvents, canReadAudits, canReadUsers, section]);

  function applyUserFilters(filters: AdminAccountFilters) {
    setUserFilters(filters);
    setPage(1);
  }

  function resetUserFilters() {
    setUserFilters(EMPTY_USER_FILTERS);
    setPage(1);
  }

  function refetchUsers() {
    setRefreshKey((current) => current + 1);
  }

  function refetchRoles() {
    setRolesRefreshKey((current) => current + 1);
  }

  function refetchPermissions() {
    setPermissionsRefreshKey((current) => current + 1);
  }

  function refetchEmailLimits() {
    setEmailLimitsRefreshKey((current) => current + 1);
  }

  function refetchPatreon() {
    setPatreonRefreshKey((current) => current + 1);
  }

  function refetchAudits() {
    setAuditsRefreshKey((current) => current + 1);
  }

  function clearAuditAccountFilter() {
    setAuditUserSearch("");
    setAuditAccountFilter(null);
    setAuditsPage(1);
  }

  function resetAuditFilters() {
    clearAuditAccountFilter();
    setAuditViewMode("readable");
    setAuditsPageSize(50);
  }

  async function applyAuditAccountSearch(value: string) {
    const query = value.trim();
    setAuditsPage(1);
    if (!query) {
      setAuditAccountFilter(null);
      setAuditUserSearch("");
      return true;
    }

    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(query)) {
      setAuditAccountFilter({ accountId: query });
      setAuditUserSearch(query);
      return true;
    }

    if (!canReadUsers) {
      toast.error("Could not filter user", { description: "User search requires users.read." });
      return false;
    }

    setAuditUserSearchLoading(true);
    try {
      const { ok, data } = await authApi.listAdminAccounts(query, 1, 1, EMPTY_USER_FILTERS);
      const user = ok ? data.accounts?.[0] : null;
      if (!user) {
        toast.error("No matching user");
        return false;
      }

      setAuditAccountFilter({ accountId: user.accountId, displayName: user.displayName, email: user.email });
      setAuditUserSearch(user.email || user.displayName || user.accountId);
      return true;
    } catch (error) {
      toast.error("Could not filter user", { description: error instanceof Error ? error.message : undefined });
      return false;
    } finally {
      setAuditUserSearchLoading(false);
    }
  }

  function openFullAuditForDetail() {
    if (!detail) return;

    setAuditAccountFilter({ accountId: detail.accountId, displayName: detail.displayName, email: detail.email });
    setAuditUserSearch(detail.email || detail.displayName || detail.accountId);
    setAuditEventType("");
    setDebouncedAuditEventType("");
    setAuditsPage(1);
    setDetailOpen(false);
    setSection("audits");
  }

  function openCreateRole() {
    setEditingRole(null);
    setRoleFormMode("create");
    setRoleName("");
    setRoleDisplayName("");
    setRoleDescription("");
    setRolePermissions([]);
  }

  function openEditRole(role: RoleResponse) {
    setEditingRole(role);
    setRoleFormMode("edit");
    setRoleName(role.name);
    setRoleDisplayName(role.displayName);
    setRoleDescription(role.description ?? "");
    setRolePermissions(role.permissions);
  }

  async function saveRole() {
    if (!roleFormMode) return;
    setActionLoading(true);
    try {
      const body = {
        displayName: roleDisplayName.trim() || undefined,
        description: roleDescription.trim() || undefined,
        ...(canUpdateRolePermissions ? { permissions: rolePermissions } : {}),
      };
      const result = roleFormMode === "create"
        ? await authApi.createRole({ name: roleName.trim(), ...body })
        : await authApi.updateRole(roleName, body);

      if (!result.ok) {
        toast.error("Role save failed", { description: result.data.error });
        return;
      }

      toast.success(roleFormMode === "create" ? "Role created" : "Role updated");
      setRoleFormMode(null);
      refetchRoles();
    } catch {
      toast.error("Role save failed", { description: "Network error." });
    } finally {
      setActionLoading(false);
    }
  }

  async function confirmDeleteRole() {
    if (!deleteRoleTarget) return;
    setActionLoading(true);
    try {
      const { ok, data } = await authApi.deleteRole(deleteRoleTarget.name);
      if (!ok) {
        toast.error("Role delete failed", { description: data.error });
        return;
      }

      toast.success("Role deleted");
      setDeleteRoleTarget(null);
      refetchRoles();
    } catch {
      toast.error("Role delete failed", { description: "Network error." });
    } finally {
      setActionLoading(false);
    }
  }

  async function saveEmailLimits() {
    const monthlyHardLimitValue = readPositiveInt(monthlyHardLimit);
    const dailyRecipientLimitValue = readPositiveInt(dailyRecipientLimit);
    const dailyIpLimitValue = readPositiveInt(dailyIpLimit);
    const monthlyResetDayValue = readBoundedInt(monthlyResetDay, 1, 28);
    const dailyResetHourUtcValue = readBoundedInt(dailyResetHourUtc, 0, 23);

    if (
      monthlyHardLimitValue === null ||
      dailyRecipientLimitValue === null ||
      dailyIpLimitValue === null ||
      monthlyResetDayValue === null ||
      dailyResetHourUtcValue === null
    ) {
      toast.error("Invalid email limits", { description: "Limits must be positive. Reset day is 1-28; reset hour is 0-23 UTC." });
      return;
    }

    setEmailLimitsSaving(true);
    try {
      const { ok, data } = await authApi.updateEmailLimits({
        monthlyHardLimit: monthlyHardLimitValue,
        dailyRecipientLimit: dailyRecipientLimitValue,
        dailyIpLimit: dailyIpLimitValue,
        monthlyResetDay: monthlyResetDayValue,
        dailyResetHourUtc: dailyResetHourUtcValue,
      });

      if (!ok) {
        toast.error("Email limits save failed", { description: data.error });
        return;
      }

      setEmailLimits(data);
      setMonthlyHardLimit(String(data.settings.monthlyHardLimit));
      setDailyRecipientLimit(String(data.settings.dailyRecipientLimit));
      setDailyIpLimit(String(data.settings.dailyIpLimit));
      setMonthlyResetDay(String(data.settings.monthlyResetDay));
      setDailyResetHourUtc(String(data.settings.dailyResetHourUtc));
      toast.success("Email limits saved");
      if (canReadAudits) refetchAudits();
    } catch {
      toast.error("Email limits save failed", { description: "Network error." });
    } finally {
      setEmailLimitsSaving(false);
    }
  }

  async function viewDetails(user: ProfileResponse) {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    const { ok, data } = await authApi.getAdminAccount(user.accountId);
    if (ok) {
      setDetail(data);
    } else {
      toast.error("Could not load user", { description: data.error });
    }
    setDetailLoading(false);
  }

  function openEdit(user: ProfileResponse) {
    setEditUser(user);
    setEditName(user.displayName);
    setEditVerified(user.emailVerified);
  }

  function openAssign(user: ProfileResponse) {
    setAssignUser(user);
    setRoleDraft(user.roles);
  }

  function openPatreon(user: ProfileResponse | AdminAccountDetailResponse) {
    setPatreonUser(user);
    setPatreonTierDraft(user.patreon?.tierIds ?? []);
    setPatreonStatusDraft(user.patreon?.patronStatus ?? "active_patron");
    setPatreonAmountDraft(user.patreon?.entitledAmountCents == null ? "" : String(user.patreon.entitledAmountCents));
    setPatreonCustomTier("");
    if (!patreonTiers.length) refetchPatreon();
  }

  function addCustomPatreonTier() {
    const tier = patreonCustomTier.trim();
    if (!tier) return;
    setPatreonTierDraft((current) => current.includes(tier) ? current : [...current, tier]);
    setPatreonCustomTier("");
  }

  async function runAction(label: string, action: () => Promise<{ ok: boolean; data: { error?: string } }>) {
    setActionLoading(true);
    try {
      const { ok, data } = await action();
      if (ok) {
        toast.success(label);
        refetchUsers();
        return true;
      }

      toast.error("Action failed", { description: data.error });
      return false;
    } catch {
      toast.error("Action failed", { description: "Network error." });
      return false;
    } finally {
      setActionLoading(false);
    }
  }

  async function saveEdit() {
    if (!editUser) return;
    const saved = await runAction("User updated", () => authApi.updateAdminAccount(editUser.accountId, {
      displayName: editName.trim(),
      emailVerified: editVerified,
    }));
    if (saved) setEditUser(null);
  }

  async function saveRoles() {
    if (!assignUser) return;
    if (assignUser.accountId === profile?.accountId && !roleDraft.includes("admin")) {
      toast.error("Cannot remove your own admin role.");
      return;
    }

    setActionLoading(true);
    try {
      const toAdd = canAssignUserRoles ? roleDraft.filter((role) => !assignUser.roles.includes(role)) : [];
      const toRemove = canRemoveUserRoles ? assignUser.roles.filter((role) => !roleDraft.includes(role)) : [];

      for (const role of toRemove) {
        const { ok, data } = await authApi.removeRole(assignUser.accountId, role);
        if (!ok) throw new Error(data.error ?? `Could not remove ${role}.`);
      }

      for (const role of toAdd) {
        const { ok, data } = await authApi.assignRole(assignUser.accountId, role);
        if (!ok) throw new Error(data.error ?? `Could not assign ${role}.`);
      }

      toast.success("Roles updated");
      setAssignUser(null);
      refetchUsers();
    } catch (error) {
      toast.error("Role update failed", { description: error instanceof Error ? error.message : "Network error." });
    } finally {
      setActionLoading(false);
    }
  }

  async function savePatreonTiers() {
    if (!patreonUser) return;
    const amount = patreonAmountDraft.trim() ? Number(patreonAmountDraft) : null;
    if (amount !== null && (!Number.isInteger(amount) || amount < 0)) {
      toast.error("Invalid Patreon amount", { description: "Amount must be cents, like 500." });
      return;
    }

    setActionLoading(true);
    try {
      const { ok, data } = await authApi.updateAdminPatreon(patreonUser.accountId, {
        tierIds: patreonTierDraft,
        patronStatus: patreonStatusDraft.trim() || undefined,
        entitledAmountCents: amount,
      });

      if (!ok) {
        toast.error("Patreon save failed", { description: data.error });
        return;
      }

      toast.success("Patreon tiers saved");
      if (detail?.accountId === patreonUser.accountId) setDetail({ ...detail, patreon: data });
      setPatreonUser(null);
      refetchUsers();
      if (canReadAudits) refetchAudits();
    } catch {
      toast.error("Patreon save failed", { description: "Network error." });
    } finally {
      setActionLoading(false);
    }
  }

  async function refreshUserPatreon(user: ProfileResponse | AdminAccountDetailResponse) {
    setActionLoading(true);
    try {
      const { ok, data } = await authApi.refreshAdminPatreon(user.accountId);
      if (!ok) {
        toast.error("Patreon refresh failed", { description: data.error });
        return;
      }

      toast.success("Patreon tiers refreshed");
      if (detail?.accountId === user.accountId) setDetail({ ...detail, patreon: data });
      refetchUsers();
      if (canReadAudits) refetchAudits();
    } catch {
      toast.error("Patreon refresh failed", { description: "Network error." });
    } finally {
      setActionLoading(false);
    }
  }

  async function clearPatreonOverride() {
    if (!clearPatreonOverrideUser) return;

    setActionLoading(true);
    try {
      const { ok, data } = await authApi.clearAdminPatreonOverride(clearPatreonOverrideUser.accountId);
      if (!ok) {
        toast.error("Clear override failed", { description: data.error });
        return;
      }

      toast.success("Patreon override cleared");
      if (detail?.accountId === clearPatreonOverrideUser.accountId) setDetail({ ...detail, patreon: data });
      if (patreonUser?.accountId === clearPatreonOverrideUser.accountId) setPatreonUser(null);
      setClearPatreonOverrideUser(null);
      refetchUsers();
      if (canReadAudits) refetchAudits();
    } catch {
      toast.error("Clear override failed", { description: "Network error." });
    } finally {
      setActionLoading(false);
    }
  }

  async function savePatreonTierLabels() {
    let tiers: PatreonTierResponse[];
    try {
      const parsed = JSON.parse(patreonTierLabelsJson) as PatreonTierResponse[];
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array.");
      tiers = parsed;
    } catch (error) {
      toast.error("Invalid JSON", { description: error instanceof Error ? error.message : "Use an array of tier objects." });
      return;
    }

    setPatreonTierLabelsSaving(true);
    try {
      const { ok, data } = await authApi.updatePatreonTierLabels(tiers);
      if (!ok) {
        toast.error("Patreon labels save failed", { description: data.error });
        return;
      }

      setPatreonTierLabelsJson(JSON.stringify(data.tiers ?? [], null, 2));
      toast.success("Patreon tier labels saved");
      refetchPatreon();
      if (canReadAudits) refetchAudits();
    } catch {
      toast.error("Patreon labels save failed", { description: "Network error." });
    } finally {
      setPatreonTierLabelsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteUser) return;
    const deleted = await runAction("User deleted", () => authApi.deleteAdminAccount(deleteUser.accountId));
    if (deleted) setDeleteUser(null);
  }

  const userColumns = [
    {
      key: "user",
      header: "User",
      cell: (user: ProfileResponse) => (
        <button type="button" className="text-left" onClick={() => void viewDetails(user)}>
          <div className="font-semibold text-foreground">{user.displayName}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </button>
      ),
    },
    {
      key: "roles",
      header: "Roles",
      cell: (user: ProfileResponse) => (
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role) => <Badge key={role} variant={roleVariant(role)}>{roleLabel(role, roles)}</Badge>)}
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      cell: (user: ProfileResponse) => <StatusBadge status={user.emailVerified ? "active" : "pending"}>{user.emailVerified ? "Verified" : "Unverified"}</StatusBadge>,
    },
    {
      key: "patreon",
      header: "Patreon",
      cell: (user: ProfileResponse) => (
        <div className="space-y-1.5">
          <StatusBadge status={user.patreon?.linked ? "active" : "draft"}>{patreonStatusText(user.patreon)}</StatusBadge>
          {user.patreon?.tierIds.length ? (
            <div className="flex flex-wrap gap-1">
              {user.patreon.tierIds.map((tierId) => <Badge key={tierId} variant="secondary">{tierId}</Badge>)}
            </div>
          ) : null}
        </div>
      ),
    },
    { key: "created", header: "Created", cell: (user: ProfileResponse) => formatDate(user.createdAt) },
    {
      key: "actions",
      header: "Actions",
      className: "w-12",
      cell: (user: ProfileResponse) => (
        <ActionMenu items={[
          canReadUsers ? { label: "View details", onSelect: () => void viewDetails(user) } : null,
          canUpdateUsers ? { label: "Edit profile", onSelect: () => openEdit(user) } : null,
          canManageUserRoles ? { label: "Manage roles", onSelect: () => openAssign(user) } : null,
          canUpdatePatreon ? { label: "Manage Patreon", onSelect: () => openPatreon(user) } : null,
          canUpdatePatreon && user.patreon?.linked ? { label: "Refresh Patreon", onSelect: () => void refreshUserPatreon(user) } : null,
          canDeleteUsers && user.accountId !== profile?.accountId ? { label: "Delete account", onSelect: () => setDeleteUser(user), destructive: true } : null,
        ].filter((item): item is ActionMenuItem => item !== null)} />
      ),
    },
  ];

  const patreonTierColumns = [
    { key: "title", header: "Tier", cell: (tier: PatreonTierResponse) => <div><div className="font-semibold text-foreground">{tier.title}</div><div className="font-mono text-xs text-muted-foreground">{tier.id}</div></div> },
    { key: "amount", header: "Amount", cell: (tier: PatreonTierResponse) => formatMoneyCents(tier.amountCents) },
    { key: "source", header: "Source", cell: (tier: PatreonTierResponse) => <Badge variant={tier.fromPatreon ? "textured" : "secondary"}>{tier.fromPatreon ? "Patreon" : "JSON"}</Badge> },
  ];

  const readableAuditColumns = [
    {
      key: "timestamp",
      header: "Timestamp",
      cell: (event: AuditEventResponse) => <span className="whitespace-nowrap tabular-nums">{formatAuditTimestamp(event.createdAt)}</span>,
    },
    {
      key: "activity",
      header: "Activity",
      cell: (event: AuditEventResponse) => <div className="text-sm text-foreground">{renderAuditActivity(event, roles, auditAccountLookup)}</div>,
    },
  ];

  const technicalAuditColumns = [
    { key: "created", header: "Created", cell: (event: AuditEventResponse) => formatDate(event.createdAt) },
    { key: "event", header: "Event", cell: (event: AuditEventResponse) => <Badge variant="outline">{event.eventType}</Badge> },
    { key: "actor", header: "Actor", cell: (event: AuditEventResponse) => <span className="font-mono text-xs">{event.actorAccountId ?? "system"}</span> },
    { key: "target", header: "Target", cell: (event: AuditEventResponse) => <span className="font-mono text-xs">{event.targetAccountId ?? "—"}</span> },
    { key: "metadata", header: "Metadata", cell: (event: AuditEventResponse) => <span className="break-all font-mono text-xs text-muted-foreground">{event.metadataJson ?? "—"}</span> },
  ];

  const auditColumns = auditViewMode === "readable" ? readableAuditColumns : technicalAuditColumns;

  const oauthLinks = detail?.oAuthLinks ?? (detail as unknown as { oauthLinks?: AdminAccountDetailResponse["oAuthLinks"] } | null)?.oauthLinks ?? [];
  const recentAuditEvents = detail?.recentAuditEvents.slice(0, 5) ?? [];
  const permissionGroups = permissions.reduce<Record<string, PermissionResponse[]>>((groups, permission) => {
    (groups[permission.category] ??= []).push(permission);
    return groups;
  }, {});
  const emailMonthPercent = emailLimits ? usagePercent(emailLimits.month.sent, emailLimits.settings.monthlyHardLimit) : 0;
  const maxRecentEmailSends = Math.max(1, ...(emailLimits?.recentDays.map((day) => day.sent) ?? []));
  const patreonTierIds = new Set(patreonTiers.map((tier) => tier.id));
  const patreonTierItems: MultiSelectItem[] = [
    ...patreonTiers.map((tier) => ({
      key: tier.id,
      label: tier.title,
      search: `${tier.id} ${tier.title}`,
      variant: tier.fromPatreon ? "textured" as BadgeVariant : "secondary" as BadgeVariant,
      help: `${tier.id} · ${formatMoneyCents(tier.amountCents)}`,
    })),
    ...patreonTierDraft
      .filter((tierId) => !patreonTierIds.has(tierId))
      .map((tierId) => ({ key: tierId, label: tierId, variant: "outline" as BadgeVariant, help: "Custom tier id" })),
  ];

  if (isLoading || !isAuthenticated) {
    return (
      <main className="relative z-10 flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-background p-6 lg:min-h-[calc(100vh-4rem)]">
        <Spinner label="Checking access" />
      </main>
    );
  }

  if (!canAccessAdmin) {
    return (
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-2xl items-center bg-background px-6 py-12 lg:min-h-[calc(100vh-4rem)]">
        <Card className="w-full border-border bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>Admin or moderator permissions required.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" onClick={() => navigate("/accounts")}>Back to account</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="relative z-10 min-h-[calc(100vh-3.5rem)] bg-background lg:min-h-[calc(100vh-4rem)]">
      <div className="flex min-h-[calc(100vh-3.5rem)] lg:min-h-[calc(100vh-4rem)]">
        <Sidebar className="fixed left-0 top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 bg-card pl-3 shadow-none lg:top-16 lg:flex lg:h-[calc(100vh-4rem)]">
          <SidebarHeader>
            <span className="truncate">Admin</span>
            <div className="ml-auto"><SidebarToggle /></div>
          </SidebarHeader>
          <SidebarSection title="Panel">
            {visibleSectionItems.map((item) => (
              <SidebarItem key={item.id} icon={item.icon} active={section === item.id} onClick={() => setSection(item.id)}>{item.label}</SidebarItem>
            ))}
          </SidebarSection>
          <SidebarFooter>
            <SidebarItem icon={<FiSettings />} href="/accounts">Account settings</SidebarItem>
            <SidebarItem icon={<FiHome />} href="/">Back home</SidebarItem>
          </SidebarFooter>
        </Sidebar>

        <section className="min-w-0 flex-1 space-y-6 px-6 py-8 lg:ml-64 lg:px-8">
          {section === "overview" ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="Access" value={isAdmin ? "Admin" : "Moderator"} hint={profile?.displayName ?? "Panel access"} />
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {[
                  { title: "Users", description: "Search, inspect, edit, roles, delete.", section: "users" as AdminSection, visible: canReadUsers },
                  { title: "Roles", description: "Create roles and set permissions.", section: "roles" as AdminSection, visible: canReadRoles },
                  { title: "Permissions", description: "Read backend permission catalog.", section: "permissions" as AdminSection, visible: canReadPermissions },
                  { title: "Audit logs", description: "Review account and admin audit events.", section: "audits" as AdminSection, visible: canReadAudits },
                  { title: "Email Service", description: "Monitor SES usage and quota settings.", section: "emails" as AdminSection, visible: canReadEmails },
                  { title: "Patreon", description: "Review live tiers and fallback labels.", section: "patreon" as AdminSection, visible: canReadPatreon },
                ].filter((item) => item.visible).map((item) => (
                  <Card key={item.title} className="border-border bg-card text-card-foreground">
                    <CardHeader>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button type="button" onClick={() => setSection(item.section)}>Open {item.title.toLowerCase()}</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : null}

          {section === "users" ? (
            <>
              <Card className="border-border bg-card text-card-foreground">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle>Users</CardTitle>
                      <CardDescription className="mt-2">Server-backed fzf-style search, pagination, and admin actions.</CardDescription>
                    </div>
                    <Badge variant="secondary">{totalUsers} total</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <FilterBar className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
                    <SearchInput value={search} onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} onClear={() => setSearch("")} placeholder="FZF search users" className="max-w-none" />
                    <div className="flex w-full flex-wrap items-center justify-end gap-3 md:w-auto md:pr-2">
                      <UserFilterSettings roles={roles} value={userFilters} onApply={applyUserFilters} onReset={resetUserFilters} />
                      <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setPage(1); }}>
                        <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[20, 50, 100].map((size) => <SelectItem key={size} value={String(size)}>{size} / page</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="secondary" onClick={refetchUsers}>Refresh</Button>
                    </div>
                  </FilterBar>
                </CardContent>
              </Card>

              <Card className="border-border bg-card text-card-foreground">
                <CardContent className="p-0">
                  {usersLoading ? (
                    <div className="flex min-h-48 items-center justify-center p-6"><Spinner label="Loading Users" /></div>
                  ) : usersError ? (
                    <EmptyState title="Could not load users" description={usersError} action={<Button type="button" onClick={refetchUsers}>Try again</Button>} />
                  ) : (
                    <DataTable className="admin-data-table" columns={userColumns} data={users} getRowKey={(user) => user.accountId} emptyTitle="No users found" emptyDescription="Try another search or filter." />
                  )}
                </CardContent>
              </Card>

              <Pagination>
                <PaginationContent>
                  <PaginationItem><PaginationPrevious href="#" onClick={(event) => { event.preventDefault(); setPage((current) => Math.max(1, current - 1)); }} /></PaginationItem>
                  <PaginationItem><PaginationLink href="#" isActive>{page} / {pageCount}</PaginationLink></PaginationItem>
                  <PaginationItem><PaginationNext href="#" onClick={(event) => { event.preventDefault(); setPage((current) => Math.min(pageCount, current + 1)); }} /></PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          ) : null}

          {section === "roles" ? (
            <>
              <Card className="border-border bg-card text-card-foreground">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle>Roles</CardTitle>
                      <CardDescription className="mt-2">Create roles and attach backend permissions.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" onClick={refetchRoles}>Refresh</Button>
                      {canCreateRoles ? <Button type="button" onClick={openCreateRole}>Create role</Button> : null}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {rolesLoading ? (
                <div className="flex min-h-48 items-center justify-center p-6"><Spinner label="Loading roles" /></div>
              ) : rolesError ? (
                <EmptyState title="Could not load roles" description={rolesError} action={<Button type="button" onClick={refetchRoles}>Try again</Button>} />
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {roles.map((role) => (
                    <Card key={role.name} className="border-border bg-card text-card-foreground">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <CardTitle className="truncate">{role.displayName}</CardTitle>
                            <CardDescription className="mt-1 font-mono text-xs">{role.name}</CardDescription>
                          </div>
                          <ActionMenu items={[
                            canUpdateRoles && (!role.isSystem || canUpdateSystemRoles) ? { label: "Edit role", onSelect: () => openEditRole(role) } : null,
                            canDeleteRoles && (!role.isSystem || canDeleteSystemRoles) ? { label: "Delete role", onSelect: () => setDeleteRoleTarget(role), destructive: true } : null,
                          ].filter((item): item is ActionMenuItem => item !== null)} />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {role.isSystem ? <Badge variant="outline">system</Badge> : <Badge variant="secondary">custom</Badge>}
                          {canReadRolePermissions ? <Badge variant="textured">{role.permissions.length} permissions</Badge> : null}
                        </div>
                        <p className="text-sm text-muted-foreground">{role.description || "No description."}</p>
                        {canReadRolePermissions ? (
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.length ? role.permissions.map((permission) => <Badge key={permission} variant="outline">{permission}</Badge>) : <span className="text-sm text-muted-foreground">No permissions.</span>}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Permission details hidden.</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : null}

          {section === "permissions" ? (
            <>
              <Card className="border-border bg-card text-card-foreground">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle>Permissions</CardTitle>
                      <CardDescription className="mt-2">Read-only backend permission catalog.</CardDescription>
                    </div>
                    <Button type="button" variant="secondary" onClick={refetchPermissions}>Refresh</Button>
                  </div>
                </CardHeader>
              </Card>

              {permissionsLoading ? (
                <div className="flex min-h-48 items-center justify-center p-6"><Spinner label="Loading permissions" /></div>
              ) : permissionsError ? (
                <EmptyState title="Could not load permissions" description={permissionsError} action={<Button type="button" onClick={refetchPermissions}>Try again</Button>} />
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {Object.entries(permissionGroups).map(([category, group]) => (
                    <Card key={category} className="border-border bg-card text-card-foreground">
                      <CardHeader>
                        <CardTitle className="capitalize">{category}</CardTitle>
                        <CardDescription>{group.length} permissions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {group.map((permission) => (
                          <div key={permission.key} className="space-y-1 rounded-md border border-border p-3">
                            <Badge variant="outline">{permission.key}</Badge>
                            <p className="text-sm text-muted-foreground">{permission.description}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : null}

          {section === "emails" ? (
            <>
              <Card className="border-border bg-card text-card-foreground">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle>Email Service</CardTitle>
                      <CardDescription className="mt-2">SES quota usage and DB-backed hard limits.</CardDescription>
                    </div>
                    <Button type="button" variant="secondary" onClick={refetchEmailLimits}>Refresh</Button>
                  </div>
                </CardHeader>
              </Card>

              {emailLimitsLoading ? (
                <div className="flex min-h-48 items-center justify-center p-6"><Spinner label="Loading email service" /></div>
              ) : emailLimitsError ? (
                <EmptyState title="Could not load email service" description={emailLimitsError} action={<Button type="button" onClick={refetchEmailLimits}>Try again</Button>} />
              ) : emailLimits ? (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <StatCard label="Month sent" value={formatCount(emailLimits.month.sent)} hint={`${emailMonthPercent}% of ${formatCount(emailLimits.settings.monthlyHardLimit)}`} />
                    <StatCard label="Remaining" value={formatCount(emailLimits.month.remaining)} hint={`Resets ${formatAuditTimestamp(emailLimits.month.resetAt)}`} />
                    <StatCard label="Today" value={formatCount(emailLimits.today.sent)} hint={`Day starts ${String(emailLimits.settings.dailyResetHourUtc).padStart(2, "0")}:00 UTC`} />
                  </div>

                  <Card className="border-border bg-card text-card-foreground">
                    <CardHeader>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <CardTitle>Monthly usage</CardTitle>
                          <CardDescription className="mt-2">
                            {formatCount(emailLimits.month.sent)} sent, {formatCount(emailLimits.month.remaining)} left.
                          </CardDescription>
                        </div>
                        <Badge variant={emailLimits.month.blocked ? "destructive" : "secondary"}>{emailLimits.month.blocked ? "Blocked" : "Active"}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="h-3 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${emailLimits.month.blocked ? "bg-destructive" : "bg-primary"}`}
                          style={{ width: `${emailMonthPercent}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap justify-between gap-2 text-sm text-muted-foreground">
                        <span>Started {formatAuditTimestamp(emailLimits.month.periodStart)}</span>
                        <span>{emailMonthPercent}% used</span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
                    <Card className="border-border bg-card text-card-foreground">
                      <CardHeader>
                        <CardTitle>Recent daily usage</CardTitle>
                        <CardDescription className="mt-2">Global email sends tracked by the auth service.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {emailLimits.recentDays.length ? emailLimits.recentDays.map((day) => {
                          const width = Math.max(4, Math.round((day.sent / maxRecentEmailSends) * 100));
                          return (
                            <div key={day.date} className="grid grid-cols-[6rem_minmax(0,1fr)_4rem] items-center gap-3 text-sm">
                              <span className="text-muted-foreground">{formatDate(day.date)}</span>
                              <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
                              </div>
                              <span className="text-right tabular-nums">{formatCount(day.sent)}</span>
                            </div>
                          );
                        }) : (
                          <EmptyState title="No daily usage yet" description="Usage appears here after email sends are recorded." />
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-border bg-card text-card-foreground">
                      <CardHeader>
                        <CardTitle>Settings</CardTitle>
                        <CardDescription className="mt-2">{canUpdateEmails ? "Changes are audited." : "Read-only for this account."}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {canUpdateEmails ? (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="monthlyHardLimit">Monthly hard limit</Label>
                              <Input id="monthlyHardLimit" type="number" min={1} value={monthlyHardLimit} onChange={(event) => setMonthlyHardLimit(event.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="dailyRecipientLimit">Daily per recipient</Label>
                              <Input id="dailyRecipientLimit" type="number" min={1} value={dailyRecipientLimit} onChange={(event) => setDailyRecipientLimit(event.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="dailyIpLimit">Daily per IP</Label>
                              <Input id="dailyIpLimit" type="number" min={1} value={dailyIpLimit} onChange={(event) => setDailyIpLimit(event.target.value)} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="monthlyResetDay">Monthly reset day</Label>
                                <Input id="monthlyResetDay" type="number" min={1} max={28} value={monthlyResetDay} onChange={(event) => setMonthlyResetDay(event.target.value)} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="dailyResetHourUtc">Daily reset hour UTC</Label>
                                <Input id="dailyResetHourUtc" type="number" min={0} max={23} value={dailyResetHourUtc} onChange={(event) => setDailyResetHourUtc(event.target.value)} />
                              </div>
                            </div>
                            <Button type="button" className="w-full" disabled={emailLimitsSaving} onClick={() => void saveEmailLimits()}>
                              {emailLimitsSaving ? "Saving..." : "Save email settings"}
                            </Button>
                          </>
                        ) : (
                          <div className="grid gap-3 text-sm">
                            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Monthly hard limit</span><span className="font-medium tabular-nums">{formatCount(emailLimits.settings.monthlyHardLimit)}</span></div>
                            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Daily per recipient</span><span className="font-medium tabular-nums">{formatCount(emailLimits.settings.dailyRecipientLimit)}</span></div>
                            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Daily per IP</span><span className="font-medium tabular-nums">{formatCount(emailLimits.settings.dailyIpLimit)}</span></div>
                            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Monthly reset day</span><span className="font-medium tabular-nums">{emailLimits.settings.monthlyResetDay}</span></div>
                            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Daily reset hour</span><span className="font-medium tabular-nums">{String(emailLimits.settings.dailyResetHourUtc).padStart(2, "0")}:00 UTC</span></div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : null}
            </>
          ) : null}

          {section === "patreon" ? (
            <>
              <Card className="border-border bg-card text-card-foreground">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle>Patreon</CardTitle>
                      <CardDescription className="mt-2">Live campaign tiers and admin fallback labels.</CardDescription>
                    </div>
                    <Button type="button" variant="secondary" onClick={refetchPatreon}>Refresh</Button>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_28rem]">
                <Card className="border-border bg-card text-card-foreground">
                  <CardHeader>
                    <CardTitle>Tier catalog</CardTitle>
                    <CardDescription className="mt-2">Fetched from Patreon, then merged with local label JSON.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {patreonTiersLoading ? (
                      <div className="flex min-h-48 items-center justify-center p-6"><Spinner label="Loading Patreon tiers" /></div>
                    ) : patreonTiersError ? (
                      <EmptyState title="Could not load Patreon tiers" description={patreonTiersError} action={<Button type="button" onClick={refetchPatreon}>Try again</Button>} />
                    ) : (
                      <DataTable className="admin-data-table" columns={patreonTierColumns} data={patreonTiers} getRowKey={(tier) => tier.id} emptyTitle="No Patreon tiers" emptyDescription="Add fallback labels or configure creator token env." />
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border bg-card text-card-foreground">
                  <CardHeader>
                    <CardTitle>Label JSON</CardTitle>
                    <CardDescription className="mt-2">Array of id, title, amountCents. Secrets stay in backend env.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={patreonTierLabelsJson}
                      onChange={(event) => setPatreonTierLabelsJson(event.target.value)}
                      className="min-h-72 font-mono text-xs"
                      spellCheck={false}
                    />
                    <Button type="button" className="w-full" disabled={patreonTierLabelsSaving || !canUpdatePatreon} onClick={() => void savePatreonTierLabels()}>
                      {patreonTierLabelsSaving ? "Saving..." : "Save label JSON"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}

          {section === "audits" ? (
            <>
              <Card className="border-border bg-card text-card-foreground">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle>Audit logs</CardTitle>
                      <CardDescription className="mt-2">All audit events. Requires backend <code>audits.read</code>.</CardDescription>
                    </div>
                    <Badge variant="secondary">{auditsTotal} total</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <FilterBar className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
                    <SearchInput value={auditEventType} onChange={(event: ChangeEvent<HTMLInputElement>) => setAuditEventType(event.target.value)} onClear={() => setAuditEventType("")} placeholder="Filter event type" className="max-w-none" />
                    <div className="flex w-full flex-wrap items-center justify-end gap-3 md:w-auto md:pr-2">
                      <AuditFilterSettings
                        accountLabel={auditAccountFilter ? formatAuditAccount(auditAccountFilter, auditAccountFilter.accountId) : undefined}
                        loading={auditUserSearchLoading}
                        onApplyUserSearch={applyAuditAccountSearch}
                        onPageSizeChange={(nextPageSize) => { setAuditsPageSize(nextPageSize); setAuditsPage(1); }}
                        onReset={resetAuditFilters}
                        onViewModeChange={setAuditViewMode}
                        pageSize={auditsPageSize}
                        userSearch={auditUserSearch}
                        viewMode={auditViewMode}
                      />
                      <Button type="button" variant="secondary" onClick={refetchAudits}>Refresh</Button>
                    </div>
                  </FilterBar>
                </CardContent>
              </Card>

              <Card className="border-border bg-card text-card-foreground">
                <CardContent className="p-0">
                  {auditsLoading ? (
                    <div className="flex min-h-48 items-center justify-center p-6"><Spinner label="Loading audit logs" /></div>
                  ) : auditsError ? (
                    <EmptyState title="Could not load audit logs" description={auditsError} action={<Button type="button" onClick={refetchAudits}>Try again</Button>} />
                  ) : (
                    <DataTable className="admin-data-table" columns={auditColumns} data={auditEvents} getRowKey={(event) => event.id} emptyTitle="No audit events" emptyDescription="Try another event type filter." />
                  )}
                </CardContent>
              </Card>

              <Pagination>
                <PaginationContent>
                  <PaginationItem><PaginationPrevious href="#" onClick={(event) => { event.preventDefault(); setAuditsPage((current) => Math.max(1, current - 1)); }} /></PaginationItem>
                  <PaginationItem><PaginationLink href="#" isActive>{auditsPage} / {auditsPageCount}</PaginationLink></PaginationItem>
                  <PaginationItem><PaginationNext href="#" onClick={(event) => { event.preventDefault(); setAuditsPage((current) => Math.min(auditsPageCount, current + 1)); }} /></PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          ) : null}
        </section>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className={`max-w-3xl ${ADMIN_DIALOG_SCROLL_CLASS}`}>
          <DialogHeader>
            <DialogTitle>{detail?.displayName ?? "User details"}</DialogTitle>
            <DialogDescription>{detail?.email ?? "Loading account detail."}</DialogDescription>
          </DialogHeader>
          {detailLoading ? <Spinner label="Loading user" /> : detail ? (
            <div className="grid gap-4 text-sm md:grid-cols-2">
              <Card><CardContent className="space-y-2 p-4"><div><b>Photon:</b> {detail.photonUserId}</div><div><b>Sessions:</b> {detail.activeSessionCount}</div><div><b>Created:</b> {formatDate(detail.createdAt)}</div><div><b>Updated:</b> {formatDate(detail.updatedAt)}</div></CardContent></Card>
              <Card>
                <CardContent className="space-y-3 p-4">
                  <div><b>Password:</b> {detail.hasPassword ? "Yes" : "No"}</div>
                  <div><b>IP:</b> {detail.creationIpAddress ?? "—"}</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <b>Patreon:</b>
                    <StatusBadge status={detail.patreon?.linked ? "active" : "draft"}>{patreonStatusText(detail.patreon)}</StatusBadge>
                    {detail.patreon?.manualOverride ? <Badge variant="secondary">DB-only testing override</Badge> : null}
                  </div>
                  {detail.patreon?.tierIds.length ? (
                    <div className="flex flex-wrap gap-1">{detail.patreon.tierIds.map((tierId) => <Badge key={tierId} variant="secondary">{tierId}</Badge>)}</div>
                  ) : null}
                  <div className="text-muted-foreground">Pledge: {formatMoneyCents(detail.patreon?.entitledAmountCents)}</div>
                  <div className="text-muted-foreground">Synced: {formatAuditTimestamp(detail.patreon?.lastSyncedAt ?? undefined)}</div>
                  {canUpdatePatreon ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button type="button" variant="secondary" onClick={() => openPatreon(detail)}>Edit tiers</Button>
                      <Button type="button" variant="secondary" disabled={actionLoading || !detail.patreon?.linked} onClick={() => void refreshUserPatreon(detail)}>Refresh tiers</Button>
                      {detail.patreon?.manualOverride ? <Button type="button" variant="destructive" disabled={actionLoading} onClick={() => setClearPatreonOverrideUser(detail)}>Clear override</Button> : null}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
              <Card className="md:col-span-2"><CardHeader><CardTitle>OAuth links</CardTitle></CardHeader><CardContent>{oauthLinks.length ? oauthLinks.map((link) => <div key={`${link.provider}-${link.providerUserId}`}>{link.provider}: {link.providerEmail ?? link.providerUserId}</div>) : "None"}</CardContent></Card>
              <Card className="md:col-span-2">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle>Recent audit</CardTitle>
                    {canReadAudits ? <Button type="button" variant="secondary" className="gap-2" onClick={openFullAuditForDetail}><FiFileText className="h-4 w-4" />View Full Audit</Button> : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">{recentAuditEvents.length ? recentAuditEvents.map((event) => <div key={event.id} className="flex flex-wrap items-center gap-2"><span className="tabular-nums text-muted-foreground">{formatAuditTimestamp(event.createdAt)}</span>{renderAuditActivity(event, roles, auditAccountLookup)}</div>) : "None"}</CardContent>
              </Card>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={editUser !== null} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className={ADMIN_DIALOG_SCROLL_CLASS}>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>{editUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label htmlFor="displayName">Display name</Label><Input id="displayName" value={editName} onChange={(event) => setEditName(event.target.value)} /></div>
            <div className="space-y-2"><Label>Email status</Label><Select value={String(editVerified)} onValueChange={(value) => setEditVerified(value === "true")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="true">Verified</SelectItem><SelectItem value="false">Unverified</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button type="button" variant="secondary" onClick={() => setEditUser(null)}>Cancel</Button><Button type="button" disabled={actionLoading || !editName.trim()} onClick={() => void saveEdit()}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignUser !== null} onOpenChange={(open) => !open && setAssignUser(null)}>
        <DialogContent className={ADMIN_DIALOG_SCROLL_CLASS}>
          <DialogHeader>
            <DialogTitle>Manage roles</DialogTitle>
            <DialogDescription>{assignUser?.email}</DialogDescription>
          </DialogHeader>
          {roles.length ? (
            <RoleMultiSelect
              roles={roles}
              value={roleDraft}
              onChange={(nextRoles) => {
                if (!assignUser) return;
                setRoleDraft([
                  ...assignUser.roles.filter((role) => !canRemoveUserRoles || nextRoles.includes(role)),
                  ...nextRoles.filter((role) => !assignUser.roles.includes(role) && canAssignUserRoles),
                ].filter((role, index, list) => list.indexOf(role) === index));
              }}
            />
          ) : <EmptyState title="No roles available" description="Role catalog failed." />}
          <DialogFooter><Button type="button" variant="secondary" onClick={() => setAssignUser(null)}>Cancel</Button><Button type="button" disabled={actionLoading} onClick={() => void saveRoles()}>Save roles</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={patreonUser !== null} onOpenChange={(open) => !open && setPatreonUser(null)}>
        <DialogContent className={ADMIN_DIALOG_SCROLL_CLASS}>
          <DialogHeader>
            <DialogTitle>Manage Patreon</DialogTitle>
            <DialogDescription>{patreonUser?.email} - Saving here creates a DB-only manual override for testing.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {patreonUser?.patreon?.manualOverride ? (
              <Badge variant="secondary">Current Patreon state is manually overridden</Badge>
            ) : null}
            <div className="space-y-2">
              <Label>Tiers</Label>
              <PillMultiSelect
                ariaLabel="Manage Patreon tiers"
                emptyText="No tiers selected"
                items={patreonTierItems}
                searchPlaceholder="Search Patreon tiers"
                value={patreonTierDraft}
                onChange={setPatreonTierDraft}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="space-y-2">
                <Label htmlFor="customPatreonTier">Custom tier ID</Label>
                <Input id="customPatreonTier" value={patreonCustomTier} onChange={(event) => setPatreonCustomTier(event.target.value)} />
              </div>
              <Button type="button" variant="secondary" className="self-end" onClick={addCustomPatreonTier}>Add tier</Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="patreonStatus">Status</Label>
                <Select value={patreonStatusDraft} onValueChange={setPatreonStatusDraft}>
                  <SelectTrigger id="patreonStatus"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active_patron">active_patron</SelectItem>
                    <SelectItem value="declined_patron">declined_patron</SelectItem>
                    <SelectItem value="former_patron">former_patron</SelectItem>
                    <SelectItem value="linked_pending_sync">linked_pending_sync</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="patreonAmount">Amount cents</Label>
                <Input id="patreonAmount" type="number" min={0} value={patreonAmountDraft} onChange={(event) => setPatreonAmountDraft(event.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setPatreonUser(null)}>Cancel</Button>
            {patreonUser?.patreon?.manualOverride ? <Button type="button" variant="destructive" disabled={actionLoading} onClick={() => setClearPatreonOverrideUser(patreonUser)}>Clear override</Button> : null}
            <Button type="button" disabled={actionLoading} onClick={() => void savePatreonTiers()}>Save manual override</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={roleFormMode !== null} onOpenChange={(open) => !open && setRoleFormMode(null)}>
        <DialogContent className={ADMIN_DIALOG_SCROLL_CLASS}>
          <DialogHeader>
            <DialogTitle>{roleFormMode === "create" ? "Create role" : "Edit role"}</DialogTitle>
            <DialogDescription>{editingRole?.name ?? "Add a role and choose permissions."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">Name</Label>
              <Input id="roleName" value={roleName} disabled={roleFormMode === "edit"} placeholder="event-mod" onChange={(event) => setRoleName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleDisplayName">Display name</Label>
              <Input id="roleDisplayName" value={roleDisplayName} placeholder="Event Mod" onChange={(event) => setRoleDisplayName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleDescription">Description</Label>
              <Textarea id="roleDescription" value={roleDescription} placeholder="What this role can do." onChange={(event) => setRoleDescription(event.target.value)} />
            </div>
            {canUpdateRolePermissions ? (
              <div className="space-y-2">
                <Label>Permissions</Label>
                {permissions.length ? <PermissionMultiSelect permissions={permissions} value={rolePermissions} onChange={setRolePermissions} /> : <EmptyState title="No permissions available" description="Permission catalog failed." />}
              </div>
            ) : canReadRolePermissions ? (
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="flex flex-wrap gap-1">
                  {rolePermissions.length ? rolePermissions.map((permission) => <Badge key={permission} variant="outline">{permission}</Badge>) : <span className="text-sm text-muted-foreground">No permissions.</span>}
                </div>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setRoleFormMode(null)}>Cancel</Button>
            <Button type="button" disabled={actionLoading || !roleName.trim()} onClick={() => void saveRole()}>{roleFormMode === "create" ? "Create role" : "Save role"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={deleteRoleTarget !== null} onOpenChange={(open) => !open && setDeleteRoleTarget(null)} title="Delete role?" description={`Delete ${deleteRoleTarget?.displayName ?? "this role"}. Assigned or protected roles may be blocked by the API.`} confirmLabel="Delete" destructive onConfirm={() => void confirmDeleteRole()} />

      <ConfirmDialog open={deleteUser !== null} onOpenChange={(open) => !open && setDeleteUser(null)} title="Delete user?" description={`This permanently deletes ${deleteUser?.email ?? "this user"}.`} confirmLabel="Delete" destructive onConfirm={() => void confirmDelete()} />

      <ConfirmDialog open={clearPatreonOverrideUser !== null} onOpenChange={(open) => !open && setClearPatreonOverrideUser(null)} title="Clear Patreon override?" description={`Remove DB-only Patreon testing state for ${clearPatreonOverrideUser?.email ?? "this user"}. Real Patreon data will be restored only if provider tokens still prove campaign membership.`} confirmLabel="Clear override" destructive onConfirm={() => void clearPatreonOverride()} />
    </main>
  );
}
