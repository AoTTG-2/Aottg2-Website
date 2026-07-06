import type { ReactNode } from "react";
import type { AdminAccountDetailResponse, AuditEventResponse, PermissionResponse, ProfileResponse, RoleResponse } from "../../auth/types";

export type AdminSection = "overview" | "analytics" | "users" | "banned" | "roles" | "permissions" | "audits" | "emails" | "auth-methods" | "credits" | "patreon" | "changelog";
export type RestrictionKindDraft = "ban" | "suspension";
export type AuditViewMode = "readable" | "technical";
export type AuditAccountSummary = NonNullable<AuditEventResponse["actor"]>;
export type AuditAccountLookup = Record<string, AuditAccountSummary>;
export type AuditMetadata = Record<string, unknown>;
export type BadgeVariant = "default" | "destructive" | "textured" | "secondary" | "outline";
export type AdminUserLike = ProfileResponse | AdminAccountDetailResponse;

export type ActionMenuItem = {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
};

export type MultiSelectItem = {
  key: string;
  label: string;
  search?: string;
  variant?: BadgeVariant;
  help?: ReactNode;
};

export type AdminPermissions = {
  isAdmin: boolean;
  canAccessAdmin: boolean;
  canReadUsers: boolean;
  canUpdateUsers: boolean;
  canDeleteUsers: boolean;
  canRestrictUsers: boolean;
  canAssignUserRoles: boolean;
  canRemoveUserRoles: boolean;
  canManageUserRoles: boolean;
  canReadRoles: boolean;
  canCreateRoles: boolean;
  canUpdateRoles: boolean;
  canDeleteRoles: boolean;
  canReadRolePermissions: boolean;
  canUpdateRolePermissions: boolean;
  canUpdateSystemRoles: boolean;
  canDeleteSystemRoles: boolean;
  canReadPermissions: boolean;
  canReadAudits: boolean;
  canReadAnalytics: boolean;
  canReadEmails: boolean;
  canUpdateEmails: boolean;
  canReadAuthMethods: boolean;
  canUpdateAuthMethods: boolean;
  canReadCredits: boolean;
  canUpdateCredits: boolean;
  canReadPatreon: boolean;
  canUpdatePatreon: boolean;
  canReadChangelogs: boolean;
  canUpdateChangelogs: boolean;
};

export type AdminSectionItem = {
  id: AdminSection;
  label: string;
  icon: ReactNode;
  visible: boolean;
};

export type AdminRoleFormMode = "create" | "edit" | null;

export type RoleDialogState = {
  roleFormMode: AdminRoleFormMode;
  editingRole: RoleResponse | null;
  roleName: string;
  roleDisplayName: string;
  roleDescription: string;
  rolePermissions: string[];
  deleteRoleTarget: RoleResponse | null;
  permissions: PermissionResponse[];
};
