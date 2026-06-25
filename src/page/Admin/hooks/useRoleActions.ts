import { useState } from "react";
import { toast } from "@aottg2/ui";
import { authApi } from "../../../auth/api";
import type { RoleResponse } from "../../../auth/types";
import type { AdminRoleFormMode } from "../types";

export function useRoleActions(canUpdateRolePermissions: boolean, refetchRoles: () => void) {
  const [roleFormMode, setRoleFormMode] = useState<AdminRoleFormMode>(null);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDisplayName, setRoleDisplayName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [deleteRoleTarget, setDeleteRoleTarget] = useState<RoleResponse | null>(null);
  const [roleActionLoading, setRoleActionLoading] = useState(false);

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
    setRoleActionLoading(true);
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
      setRoleActionLoading(false);
    }
  }

  async function confirmDeleteRole() {
    if (!deleteRoleTarget) return;
    setRoleActionLoading(true);
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
      setRoleActionLoading(false);
    }
  }

  return {
    roleFormMode,
    setRoleFormMode,
    editingRole,
    roleName,
    setRoleName,
    roleDisplayName,
    setRoleDisplayName,
    roleDescription,
    setRoleDescription,
    rolePermissions,
    setRolePermissions,
    deleteRoleTarget,
    setDeleteRoleTarget,
    roleActionLoading,
    openCreateRole,
    openEditRole,
    saveRole,
    confirmDeleteRole,
  };
}
