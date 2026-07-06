import { useMemo } from "react";
import { ADMIN_ACCESS_PERMISSIONS } from "../../../auth/adminPermissions";
import type { ProfileResponse } from "../../../auth/types";
import type { AdminPermissions } from "../types";

export function useAdminPermissions(profile: ProfileResponse | null): AdminPermissions {
  return useMemo(() => {
    const isAdmin = profile?.roles.includes("admin") ?? false;
    const permissionSet = new Set(profile?.permissions ?? []);
    const can = (permission: string) => isAdmin || permissionSet.has(permission);
    const canAny = (...permissions: string[]) => permissions.some(can);
    const canAssignUserRoles = can("users.roles.assign");
    const canRemoveUserRoles = can("users.roles.remove");

    return {
      isAdmin,
      canAccessAdmin: canAny(...ADMIN_ACCESS_PERMISSIONS),
      canReadUsers: can("users.read"),
      canUpdateUsers: can("users.update"),
      canDeleteUsers: can("users.delete"),
      canRestrictUsers: can("users.restrict"),
      canAssignUserRoles,
      canRemoveUserRoles,
      canManageUserRoles: can("users.roles.read") && (canAssignUserRoles || canRemoveUserRoles),
      canReadRoles: can("roles.read"),
      canCreateRoles: can("roles.create"),
      canUpdateRoles: can("roles.update"),
      canDeleteRoles: can("roles.delete"),
      canReadRolePermissions: can("roles.permissions.read"),
      canUpdateRolePermissions: can("roles.permissions.update"),
      canUpdateSystemRoles: can("roles.system.update"),
      canDeleteSystemRoles: can("roles.system.delete"),
      canReadPermissions: can("permissions.read"),
      canReadAudits: can("audits.read"),
      canReadAnalytics: can("analytics.read"),
      canReadEmails: can("emails.read"),
      canUpdateEmails: isAdmin && can("emails.update"),
      canReadAuthMethods: isAdmin && can("auth_methods.read"),
      canUpdateAuthMethods: isAdmin && can("auth_methods.update"),
      canReadCredits: can("credits.read"),
      canUpdateCredits: can("credits.update"),
      canReadPatreon: isAdmin && can("patreon.read"),
      canUpdatePatreon: isAdmin && can("patreon.update"),
      canReadChangelogs: can("changelogs.read"),
      canUpdateChangelogs: can("changelogs.update"),
    };
  }, [profile]);
}
