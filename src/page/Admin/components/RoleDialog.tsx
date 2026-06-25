import { Badge, Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, EmptyState, Input, Label, Textarea } from "@aottg2/ui";
import type { PermissionResponse } from "../../../auth/types";
import { ADMIN_DIALOG_SCROLL_CLASS } from "../constants";
import type { AdminRoleFormMode } from "../types";
import { PermissionMultiSelect } from "./PillMultiSelect";

export function RoleDialog({
  actionLoading,
  canReadRolePermissions,
  canUpdateRolePermissions,
  description,
  displayName,
  editingRoleName,
  mode,
  name,
  permissions,
  rolePermissions,
  onDescription,
  onDisplayName,
  onMode,
  onName,
  onRolePermissions,
  onSave,
}: {
  actionLoading: boolean;
  canReadRolePermissions: boolean;
  canUpdateRolePermissions: boolean;
  description: string;
  displayName: string;
  editingRoleName?: string;
  mode: AdminRoleFormMode;
  name: string;
  permissions: PermissionResponse[];
  rolePermissions: string[];
  onDescription: (value: string) => void;
  onDisplayName: (value: string) => void;
  onMode: (mode: AdminRoleFormMode) => void;
  onName: (value: string) => void;
  onRolePermissions: (value: string[]) => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={mode !== null} onOpenChange={(open) => !open && onMode(null)}>
      <DialogContent className={ADMIN_DIALOG_SCROLL_CLASS}>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create role" : "Edit role"}</DialogTitle>
          <DialogDescription>{editingRoleName ?? "Add a role and choose permissions."}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roleName">Name</Label>
            <Input id="roleName" value={name} disabled={mode === "edit"} placeholder="event-mod" onChange={(event) => onName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roleDisplayName">Display name</Label>
            <Input id="roleDisplayName" value={displayName} placeholder="Event Mod" onChange={(event) => onDisplayName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roleDescription">Description</Label>
            <Textarea id="roleDescription" value={description} placeholder="What this role can do." onChange={(event) => onDescription(event.target.value)} />
          </div>
          {canUpdateRolePermissions ? (
            <div className="space-y-2">
              <Label>Permissions</Label>
              {permissions.length ? <PermissionMultiSelect permissions={permissions} value={rolePermissions} onChange={onRolePermissions} /> : <EmptyState title="No permissions available" description="Permission catalog failed." />}
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
          <Button type="button" variant="secondary" onClick={() => onMode(null)}>Cancel</Button>
          <Button type="button" disabled={actionLoading || !name.trim()} onClick={onSave}>{mode === "create" ? "Create role" : "Save role"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
