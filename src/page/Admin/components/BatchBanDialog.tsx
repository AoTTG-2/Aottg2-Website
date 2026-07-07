import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Label, Textarea } from "@aottg2/ui";
import type { AdminAccountDetailResponse } from "../../../auth/types";
import { ADMIN_DIALOG_SCROLL_CLASS } from "../constants";

export function BatchBanDialog({
  actionLoading,
  reason,
  user,
  onReason,
  onSave,
  onUser,
}: {
  actionLoading: boolean;
  reason: string;
  user: AdminAccountDetailResponse | null;
  onReason: (value: string) => void;
  onSave: () => void;
  onUser: (value: AdminAccountDetailResponse | null) => void;
}) {
  const sameIpCount = user?.sameIpAccounts?.length ?? 0;

  return (
    <Dialog open={user !== null} onOpenChange={(open) => !open && onUser(null)}>
      <DialogContent className={ADMIN_DIALOG_SCROLL_CLASS}>
        <DialogHeader>
          <DialogTitle>Ban shared IP accounts</DialogTitle>
          <DialogDescription>{user ? `${user.email} plus ${sameIpCount} visible same-IP account${sameIpCount === 1 ? "" : "s"}. Staff and already banned accounts are skipped.` : ""}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="batch-ban-reason">Reason</Label>
          <Textarea id="batch-ban-reason" rows={4} value={reason} onChange={(event) => onReason(event.target.value)} placeholder="Reason shown to banned users on login." />
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onUser(null)}>Cancel</Button>
          <Button type="button" variant="destructive" disabled={actionLoading || !reason.trim()} onClick={onSave}>Batch ban</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
