import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@aottg2/ui";
import type { ProfileResponse } from "../../../auth/types";
import { ADMIN_DIALOG_SCROLL_CLASS } from "../constants";

export function EditUserDialog({
  actionLoading,
  name,
  user,
  verified,
  onName,
  onSave,
  onUser,
  onVerified,
}: {
  actionLoading: boolean;
  name: string;
  user: ProfileResponse | null;
  verified: boolean;
  onName: (value: string) => void;
  onSave: () => void;
  onUser: (value: ProfileResponse | null) => void;
  onVerified: (value: boolean) => void;
}) {
  return (
    <Dialog open={user !== null} onOpenChange={(open) => !open && onUser(null)}>
      <DialogContent className={ADMIN_DIALOG_SCROLL_CLASS}>
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>{user?.email}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label htmlFor="displayName">Display name</Label><Input id="displayName" value={name} onChange={(event) => onName(event.target.value)} /></div>
          <div className="space-y-2"><Label>Email status</Label><Select value={String(verified)} onValueChange={(value) => onVerified(value === "true")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="true">Verified</SelectItem><SelectItem value="false">Unverified</SelectItem></SelectContent></Select></div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onUser(null)}>Cancel</Button>
          <Button type="button" disabled={actionLoading || !name.trim()} onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
