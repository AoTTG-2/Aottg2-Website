import { ConfirmDialog } from "@aottg2/ui";
import type { AdminAccountDetailResponse, ProfileResponse, RoleResponse } from "../../../auth/types";

export function AdminConfirmDialogs({
  clearPatreonOverrideUser,
  deleteRoleTarget,
  deleteUser,
  onClearPatreonOverride,
  onClearPatreonOverrideUser,
  onDeleteRole,
  onDeleteRoleTarget,
  onDeleteUser,
  onDeleteUserTarget,
}: {
  clearPatreonOverrideUser: ProfileResponse | AdminAccountDetailResponse | null;
  deleteRoleTarget: RoleResponse | null;
  deleteUser: ProfileResponse | null;
  onClearPatreonOverride: () => void;
  onClearPatreonOverrideUser: (user: ProfileResponse | AdminAccountDetailResponse | null) => void;
  onDeleteRole: () => void;
  onDeleteRoleTarget: (role: RoleResponse | null) => void;
  onDeleteUser: () => void;
  onDeleteUserTarget: (user: ProfileResponse | null) => void;
}) {
  return (
    <>
      <ConfirmDialog open={deleteRoleTarget !== null} onOpenChange={(open) => !open && onDeleteRoleTarget(null)} title="Delete role?" description={`Delete ${deleteRoleTarget?.displayName ?? "this role"}. Assigned or protected roles may be blocked by the API.`} confirmLabel="Delete" destructive onConfirm={onDeleteRole} />
      <ConfirmDialog open={deleteUser !== null} onOpenChange={(open) => !open && onDeleteUserTarget(null)} title="Delete user?" description={`This permanently deletes ${deleteUser?.email ?? "this user"}.`} confirmLabel="Delete" destructive onConfirm={onDeleteUser} />
      <ConfirmDialog open={clearPatreonOverrideUser !== null} onOpenChange={(open) => !open && onClearPatreonOverrideUser(null)} title="Clear Patreon override?" description={`Remove DB-only Patreon testing state for ${clearPatreonOverrideUser?.email ?? "this user"}. Real Patreon data will be restored only if provider tokens still prove campaign membership.`} confirmLabel="Clear override" destructive onConfirm={onClearPatreonOverride} />
    </>
  );
}
