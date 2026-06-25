import { useEffect, useState } from "react";
import { toast } from "@aottg2/ui";
import { authApi } from "../../../auth/api";
import type { PermissionResponse, RoleResponse } from "../../../auth/types";

export function useAdminCatalogs(canReadRoles: boolean, canReadPermissions: boolean) {
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState("");
  const [rolesRefreshKey, setRolesRefreshKey] = useState(0);
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsError, setPermissionsError] = useState("");
  const [permissionsRefreshKey, setPermissionsRefreshKey] = useState(0);

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

  return {
    roles,
    rolesLoading,
    rolesError,
    permissions,
    permissionsLoading,
    permissionsError,
    refetchRoles: () => setRolesRefreshKey((current) => current + 1),
    refetchPermissions: () => setPermissionsRefreshKey((current) => current + 1),
  };
}
