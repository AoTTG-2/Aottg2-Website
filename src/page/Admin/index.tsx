import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiGrid, FiHome, FiKey, FiMoreHorizontal, FiSettings, FiShield, FiUsers } from "react-icons/fi";
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
import { useAuth } from "../../auth/useAuth";
import type { AdminAccountDetailResponse, AuditEventResponse, PermissionResponse, ProfileResponse, RoleResponse } from "../../auth/types";

type AdminSection = "overview" | "users" | "roles" | "permissions" | "audits";

type ActionMenuItem = {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
};

function ActionMenu({ items }: { items: ActionMenuItem[] }) {
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

function formatDate(value?: string) {
  return value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value)) : "—";
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
    <Popover open={open} onOpenChange={setOpen}>
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
  const [section, setSection] = useState<AdminSection>("overview");
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState("");
  const [rolesRefreshKey, setRolesRefreshKey] = useState(0);
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsError, setPermissionsError] = useState("");
  const [permissionsRefreshKey, setPermissionsRefreshKey] = useState(0);
  const [auditEvents, setAuditEvents] = useState<AuditEventResponse[]>([]);
  const [auditsTotal, setAuditsTotal] = useState(0);
  const [auditsLoading, setAuditsLoading] = useState(false);
  const [auditsError, setAuditsError] = useState("");
  const [auditEventType, setAuditEventType] = useState("");
  const [debouncedAuditEventType, setDebouncedAuditEventType] = useState("");
  const [auditsPage, setAuditsPage] = useState(1);
  const [auditsPageSize, setAuditsPageSize] = useState(50);
  const [auditsRefreshKey, setAuditsRefreshKey] = useState(0);
  const [users, setUsers] = useState<ProfileResponse[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

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
    if (!isAdmin) return;

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
  }, [isAdmin, rolesRefreshKey]);

  useEffect(() => {
    if (!isAdmin) return;

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
  }, [isAdmin, permissionsRefreshKey]);

  useEffect(() => {
    if (!isAdmin || section !== "users") return;

    const controller = new AbortController();
    setUsersLoading(true);
    setUsersError("");

    authApi.listAdminAccounts(debouncedSearch, page, pageSize, controller.signal)
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
  }, [debouncedSearch, isAdmin, page, pageSize, refreshKey, section]);

  useEffect(() => {
    if (!isAdmin || section !== "audits") return;

    const controller = new AbortController();
    setAuditsLoading(true);
    setAuditsError("");

    authApi.listAuditEvents(debouncedAuditEventType, auditsPage, auditsPageSize, controller.signal)
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
  }, [auditsPage, auditsPageSize, auditsRefreshKey, debouncedAuditEventType, isAdmin, section]);

  function refetchUsers() {
    setRefreshKey((current) => current + 1);
  }

  function refetchRoles() {
    setRolesRefreshKey((current) => current + 1);
  }

  function refetchPermissions() {
    setPermissionsRefreshKey((current) => current + 1);
  }

  function refetchAudits() {
    setAuditsRefreshKey((current) => current + 1);
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
        permissions: rolePermissions,
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
      const toAdd = roleDraft.filter((role) => !assignUser.roles.includes(role));
      const toRemove = assignUser.roles.filter((role) => !roleDraft.includes(role));

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
      cell: (user: ProfileResponse) => <StatusBadge status={user.patreon?.linked ? "active" : "draft"}>{user.patreon?.linked ? "Linked" : "Unlinked"}</StatusBadge>,
    },
    { key: "created", header: "Created", cell: (user: ProfileResponse) => formatDate(user.createdAt) },
    {
      key: "actions",
      header: "Actions",
      className: "w-12",
      cell: (user: ProfileResponse) => (
        <ActionMenu items={[
          { label: "View details", onSelect: () => void viewDetails(user) },
          { label: "Edit profile", onSelect: () => openEdit(user) },
          { label: "Manage roles", onSelect: () => openAssign(user) },
          { label: "Delete account", onSelect: () => setDeleteUser(user), destructive: true },
        ].filter((item) => item.label !== "Delete account" || user.accountId !== profile?.accountId)} />
      ),
    },
  ];

  const auditColumns = [
    { key: "created", header: "Created", cell: (event: AuditEventResponse) => formatDate(event.createdAt) },
    { key: "event", header: "Event", cell: (event: AuditEventResponse) => <Badge variant="outline">{event.eventType}</Badge> },
    { key: "actor", header: "Actor", cell: (event: AuditEventResponse) => <span className="font-mono text-xs">{event.actorAccountId ?? "system"}</span> },
    { key: "target", header: "Target", cell: (event: AuditEventResponse) => <span className="font-mono text-xs">{event.targetAccountId ?? "—"}</span> },
    { key: "metadata", header: "Metadata", cell: (event: AuditEventResponse) => <span className="break-all font-mono text-xs text-muted-foreground">{event.metadataJson ?? "—"}</span> },
  ];

  const oauthLinks = detail?.oAuthLinks ?? (detail as unknown as { oauthLinks?: AdminAccountDetailResponse["oAuthLinks"] } | null)?.oauthLinks ?? [];
  const permissionGroups = permissions.reduce<Record<string, PermissionResponse[]>>((groups, permission) => {
    (groups[permission.category] ??= []).push(permission);
    return groups;
  }, {});

  if (isLoading || !isAuthenticated) {
    return (
      <main className="relative z-10 flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-background p-6 lg:min-h-[calc(100vh-4rem)]">
        <Spinner label="Checking access" />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-2xl items-center bg-background px-6 py-12 lg:min-h-[calc(100vh-4rem)]">
        <Card className="w-full border-border bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>Admin role required.</CardDescription>
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
            <SidebarItem icon={<FiGrid />} active={section === "overview"} onClick={() => setSection("overview")}>Overview</SidebarItem>
            <SidebarItem icon={<FiUsers />} active={section === "users"} onClick={() => setSection("users")}>Users</SidebarItem>
            <SidebarItem icon={<FiShield />} active={section === "roles"} onClick={() => setSection("roles")}>Roles</SidebarItem>
            <SidebarItem icon={<FiKey />} active={section === "permissions"} onClick={() => setSection("permissions")}>Permissions</SidebarItem>
            <SidebarItem icon={<FiFileText />} active={section === "audits"} onClick={() => setSection("audits")}>Audit logs</SidebarItem>
          </SidebarSection>
          <SidebarFooter>
            <SidebarItem icon={<FiSettings />} href="/accounts">Account settings</SidebarItem>
            <SidebarItem icon={<FiHome />} href="/">Back home</SidebarItem>
          </SidebarFooter>
        </Sidebar>

        <section className="min-w-0 flex-1 space-y-6 px-6 py-8 lg:ml-64 lg:px-8">
          {section === "overview" ? (
            <>
              <Card className="border-border bg-card text-card-foreground">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle>Admin Panel</CardTitle>
                      <CardDescription className="mt-2">Minimal shell. API tools come next.</CardDescription>
                    </div>
                    <Badge variant="textured">admin</Badge>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="Access" value="Admin" hint={profile?.displayName ?? "Admin"} />
                <StatCard label="API" value="Ready" hint="Endpoints mapped" />
                <StatCard label="Users" value="Ready" hint="Server search + pagination" />
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {[
                  { title: "Users", description: "Search, inspect, edit, roles, delete.", section: "users" as AdminSection },
                  { title: "Roles", description: "Create roles and set permissions.", section: "roles" as AdminSection },
                  { title: "Permissions", description: "Read backend permission catalog.", section: "permissions" as AdminSection },
                  { title: "Audit logs", description: "Review account and admin audit events.", section: "audits" as AdminSection },
                ].map((item) => (
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
                  <FilterBar>
                    <SearchInput value={search} onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} onClear={() => setSearch("")} placeholder="FZF search users" className="min-w-72" />
                    <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setPage(1); }}>
                      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[20, 50, 100].map((size) => <SelectItem key={size} value={String(size)}>{size} / page</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="secondary" onClick={refetchUsers}>Refresh</Button>
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
                    <DataTable columns={userColumns} data={users} getRowKey={(user) => user.accountId} emptyTitle="No users found" emptyDescription="Try another search." />
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
                      <Button type="button" onClick={openCreateRole}>Create role</Button>
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
                            { label: "Edit role", onSelect: () => openEditRole(role) },
                            ...(!role.isSystem ? [{ label: "Delete role", onSelect: () => setDeleteRoleTarget(role), destructive: true }] : []),
                          ]} />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {role.isSystem ? <Badge variant="outline">system</Badge> : <Badge variant="secondary">custom</Badge>}
                          <Badge variant="textured">{role.permissions.length} permissions</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{role.description || "No description."}</p>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.length ? role.permissions.map((permission) => <Badge key={permission} variant="outline">{permission}</Badge>) : <span className="text-sm text-muted-foreground">No permissions.</span>}
                        </div>
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
                  <FilterBar>
                    <SearchInput value={auditEventType} onChange={(event: ChangeEvent<HTMLInputElement>) => setAuditEventType(event.target.value)} onClear={() => setAuditEventType("")} placeholder="Filter event type" className="min-w-72" />
                    <Select value={String(auditsPageSize)} onValueChange={(value) => { setAuditsPageSize(Number(value)); setAuditsPage(1); }}>
                      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[20, 50, 100].map((size) => <SelectItem key={size} value={String(size)}>{size} / page</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="secondary" onClick={refetchAudits}>Refresh</Button>
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
                    <DataTable columns={auditColumns} data={auditEvents} getRowKey={(event) => event.id} emptyTitle="No audit events" emptyDescription="Try another event type filter." />
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{detail?.displayName ?? "User details"}</DialogTitle>
            <DialogDescription>{detail?.email ?? "Loading account detail."}</DialogDescription>
          </DialogHeader>
          {detailLoading ? <Spinner label="Loading user" /> : detail ? (
            <div className="grid gap-4 text-sm md:grid-cols-2">
              <Card><CardContent className="space-y-2 p-4"><div><b>Photon:</b> {detail.photonUserId}</div><div><b>Sessions:</b> {detail.activeSessionCount}</div><div><b>Created:</b> {formatDate(detail.createdAt)}</div><div><b>Updated:</b> {formatDate(detail.updatedAt)}</div></CardContent></Card>
              <Card><CardContent className="space-y-2 p-4"><div><b>Password:</b> {detail.hasPassword ? "Yes" : "No"}</div><div><b>IP:</b> {detail.creationIpAddress ?? "—"}</div><div><b>Patreon:</b> {detail.patreon?.linked ? "Linked" : "Unlinked"}</div></CardContent></Card>
              <Card className="md:col-span-2"><CardHeader><CardTitle>OAuth links</CardTitle></CardHeader><CardContent>{oauthLinks.length ? oauthLinks.map((link) => <div key={`${link.provider}-${link.providerUserId}`}>{link.provider}: {link.providerEmail ?? link.providerUserId}</div>) : "None"}</CardContent></Card>
              <Card className="md:col-span-2"><CardHeader><CardTitle>Recent audit</CardTitle></CardHeader><CardContent>{detail.recentAuditEvents.length ? detail.recentAuditEvents.map((event) => <div key={event.id}>{formatDate(event.createdAt)} — {event.eventType}</div>) : "None"}</CardContent></Card>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={editUser !== null} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage roles</DialogTitle>
            <DialogDescription>{assignUser?.email}</DialogDescription>
          </DialogHeader>
          {roles.length ? <RoleMultiSelect roles={roles} value={roleDraft} onChange={setRoleDraft} /> : <EmptyState title="No roles available" description="Role catalog failed." />}
          <DialogFooter><Button type="button" variant="secondary" onClick={() => setAssignUser(null)}>Cancel</Button><Button type="button" disabled={actionLoading} onClick={() => void saveRoles()}>Save roles</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={roleFormMode !== null} onOpenChange={(open) => !open && setRoleFormMode(null)}>
        <DialogContent>
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
            <div className="space-y-2">
              <Label>Permissions</Label>
              {permissions.length ? <PermissionMultiSelect permissions={permissions} value={rolePermissions} onChange={setRolePermissions} /> : <EmptyState title="No permissions available" description="Permission catalog failed." />}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setRoleFormMode(null)}>Cancel</Button>
            <Button type="button" disabled={actionLoading || !roleName.trim()} onClick={() => void saveRole()}>{roleFormMode === "create" ? "Create role" : "Save role"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={deleteRoleTarget !== null} onOpenChange={(open) => !open && setDeleteRoleTarget(null)} title="Delete role?" description={`Delete ${deleteRoleTarget?.displayName ?? "this role"}. Assigned or protected roles may be blocked by the API.`} confirmLabel="Delete" destructive onConfirm={() => void confirmDeleteRole()} />

      <ConfirmDialog open={deleteUser !== null} onOpenChange={(open) => !open && setDeleteUser(null)} title="Delete user?" description={`This permanently deletes ${deleteUser?.email ?? "this user"}.`} confirmLabel="Delete" destructive onConfirm={() => void confirmDelete()} />
    </main>
  );
}
