import { useState } from "react";
import { toast } from "@aottg2/ui";
import { authApi } from "../../../auth/api";
import type { AdminAccountDetailResponse, ProfileResponse } from "../../../auth/types";
import type { AdminSection, AuditAccountSummary, RestrictionKindDraft } from "../types";
import { formatDateTimeLocal } from "../utils/format";

type AuditNav = {
  setAuditAccountFilter: (account: AuditAccountSummary | null) => void;
  setAuditUserSearch: (value: string) => void;
  setAuditEventType: (value: string) => void;
  setDebouncedAuditEventType: (value: string) => void;
  setAuditsPage: (page: number) => void;
  setSection: (section: AdminSection) => void;
};

type UseAccountActionsArgs = {
  canAssignUserRoles: boolean;
  canReadAudits: boolean;
  canRemoveUserRoles: boolean;
  profile: ProfileResponse | null;
  refetchAudits: () => void;
  refetchUsers: () => void;
  auditNav: AuditNav;
};

export function useAccountActions({
  canAssignUserRoles,
  canReadAudits,
  canRemoveUserRoles,
  profile,
  refetchAudits,
  refetchUsers,
  auditNav,
}: UseAccountActionsArgs) {
  const [detail, setDetail] = useState<AdminAccountDetailResponse | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editUser, setEditUser] = useState<ProfileResponse | null>(null);
  const [editName, setEditName] = useState("");
  const [editVerified, setEditVerified] = useState(false);
  const [assignUser, setAssignUser] = useState<ProfileResponse | AdminAccountDetailResponse | null>(null);
  const [roleDraft, setRoleDraft] = useState<string[]>([]);
  const [restrictUser, setRestrictUser] = useState<ProfileResponse | AdminAccountDetailResponse | null>(null);
  const [restrictionKind, setRestrictionKind] = useState<RestrictionKindDraft>("suspension");
  const [restrictionReason, setRestrictionReason] = useState("");
  const [restrictionExpiresAt, setRestrictionExpiresAt] = useState("");
  const [deleteUser, setDeleteUser] = useState<ProfileResponse | null>(null);
  const [userActionLoading, setUserActionLoading] = useState(false);

  async function viewDetails(user: ProfileResponse) {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    const { ok, data } = await authApi.getAdminAccount(user.accountId);
    if (ok) setDetail(data);
    else toast.error("Could not load user", { description: data.error });
    setDetailLoading(false);
  }

  function openFullAuditForDetail() {
    if (!detail) return;
    auditNav.setAuditAccountFilter({ accountId: detail.accountId, displayName: detail.displayName, email: detail.email });
    auditNav.setAuditUserSearch(detail.email || detail.displayName || detail.accountId);
    auditNav.setAuditEventType("");
    auditNav.setDebouncedAuditEventType("");
    auditNav.setAuditsPage(1);
    setDetailOpen(false);
    auditNav.setSection("audits");
  }

  function openEdit(user: ProfileResponse) {
    setEditUser(user);
    setEditName(user.displayName);
    setEditVerified(user.emailVerified);
  }

  function openAssign(user: ProfileResponse | AdminAccountDetailResponse) {
    setAssignUser(user);
    setRoleDraft(user.roles);
  }

  function openRestriction(user: ProfileResponse | AdminAccountDetailResponse, kind: RestrictionKindDraft) {
    setRestrictUser(user);
    setRestrictionKind(kind);
    setRestrictionReason(user.restriction?.reason ?? "");
    const defaultExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    setRestrictionExpiresAt(formatDateTimeLocal(user.restriction?.expiresAt ? new Date(user.restriction.expiresAt) : defaultExpiry));
  }

  async function runAction(label: string, action: () => Promise<{ ok: boolean; data: { error?: string } }>) {
    setUserActionLoading(true);
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
      setUserActionLoading(false);
    }
  }

  async function saveRestriction() {
    if (!restrictUser) return;
    const reason = restrictionReason.trim();
    if (!reason) {
      toast.error("Reason required");
      return;
    }

    const expiresAt = restrictionKind === "suspension" ? new Date(restrictionExpiresAt) : null;
    if (restrictionKind === "suspension" && (!expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date())) {
      toast.error("Invalid suspension end time", { description: "Choose a future date and time." });
      return;
    }

    setUserActionLoading(true);
    try {
      const { ok, data } = await authApi.restrictAdminAccount(restrictUser.accountId, { kind: restrictionKind, reason, expiresAt: expiresAt?.toISOString() ?? null });
      if (!ok) {
        toast.error("Restriction failed", { description: data.error });
        return;
      }

      toast.success(restrictionKind === "ban" ? "User banned" : "User suspended");
      if (detail?.accountId === data.accountId) setDetail(data);
      setRestrictUser(null);
      refetchUsers();
      if (canReadAudits) refetchAudits();
    } catch {
      toast.error("Restriction failed", { description: "Network error." });
    } finally {
      setUserActionLoading(false);
    }
  }

  async function liftRestriction(user: ProfileResponse | AdminAccountDetailResponse) {
    setUserActionLoading(true);
    try {
      const { ok, data } = await authApi.liftAdminRestriction(user.accountId);
      if (!ok) {
        toast.error("Lift restriction failed", { description: data.error });
        return;
      }
      toast.success("Restriction lifted");
      if (detail?.accountId === data.accountId) setDetail(data);
      refetchUsers();
      if (canReadAudits) refetchAudits();
    } catch {
      toast.error("Lift restriction failed", { description: "Network error." });
    } finally {
      setUserActionLoading(false);
    }
  }

  async function clearAccountFlag(user: ProfileResponse | AdminAccountDetailResponse, flag: string) {
    setUserActionLoading(true);
    try {
      const { ok, data } = await authApi.clearAdminAccountFlag(user.accountId, flag);
      if (!ok) {
        toast.error("Clear flag failed", { description: data.error });
        return;
      }
      toast.success("Flag cleared");
      if (detail?.accountId === data.accountId) setDetail(data);
      refetchUsers();
      if (canReadAudits) refetchAudits();
    } catch {
      toast.error("Clear flag failed", { description: "Network error." });
    } finally {
      setUserActionLoading(false);
    }
  }

  async function saveEdit() {
    if (!editUser) return;
    const saved = await runAction("User updated", () => authApi.updateAdminAccount(editUser.accountId, { displayName: editName.trim(), emailVerified: editVerified }));
    if (saved) setEditUser(null);
  }

  async function saveRoles() {
    if (!assignUser) return;
    if (assignUser.accountId === profile?.accountId && !roleDraft.includes("admin")) {
      toast.error("Cannot remove your own admin role.");
      return;
    }

    setUserActionLoading(true);
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
      setUserActionLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteUser) return;
    const deleted = await runAction("User deleted", () => authApi.deleteAdminAccount(deleteUser.accountId));
    if (deleted) setDeleteUser(null);
  }

  return {
    detail, setDetail, detailOpen, setDetailOpen, detailLoading, editUser, setEditUser, editName, setEditName, editVerified, setEditVerified,
    assignUser, setAssignUser, roleDraft, setRoleDraft, restrictUser, setRestrictUser, restrictionKind, setRestrictionKind, restrictionReason, setRestrictionReason, restrictionExpiresAt, setRestrictionExpiresAt,
    deleteUser, setDeleteUser, userActionLoading, viewDetails, openFullAuditForDetail, openEdit, openAssign, openRestriction,
    saveRestriction, liftRestriction, clearAccountFlag, saveEdit, saveRoles, confirmDelete,
  };
}
