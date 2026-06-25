import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, EmptyState } from "@aottg2/ui";
import type { AdminAccountDetailResponse, ProfileResponse, RoleResponse } from "../../../auth/types";
import { ADMIN_DIALOG_SCROLL_CLASS } from "../constants";
import { RoleMultiSelect } from "./PillMultiSelect";

export function AssignRolesDialog({
  actionLoading,
  canAssignUserRoles,
  canRemoveUserRoles,
  roleDraft,
  roles,
  user,
  onRoleDraft,
  onSave,
  onUser,
}: {
  actionLoading: boolean;
  canAssignUserRoles: boolean;
  canRemoveUserRoles: boolean;
  roleDraft: string[];
  roles: RoleResponse[];
  user: ProfileResponse | AdminAccountDetailResponse | null;
  onRoleDraft: (roles: string[]) => void;
  onSave: () => void;
  onUser: (value: ProfileResponse | AdminAccountDetailResponse | null) => void;
}) {
  return (
    <Dialog open={user !== null} onOpenChange={(open) => !open && onUser(null)}>
      <DialogContent className={ADMIN_DIALOG_SCROLL_CLASS}>
        <DialogHeader>
          <DialogTitle>Manage roles</DialogTitle>
          <DialogDescription>{user?.email}</DialogDescription>
        </DialogHeader>
        {roles.length ? (
          <RoleMultiSelect
            roles={roles}
            value={roleDraft}
            onChange={(nextRoles) => {
              if (!user) return;
              onRoleDraft([
                ...user.roles.filter((role) => !canRemoveUserRoles || nextRoles.includes(role)),
                ...nextRoles.filter((role) => !user.roles.includes(role) && canAssignUserRoles),
              ].filter((role, index, list) => list.indexOf(role) === index));
            }}
          />
        ) : <EmptyState title="No roles available" description="Role catalog failed." />}
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onUser(null)}>Cancel</Button>
          <Button type="button" disabled={actionLoading} onClick={onSave}>Save roles</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
