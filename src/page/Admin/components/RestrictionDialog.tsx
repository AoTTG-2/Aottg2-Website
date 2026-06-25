import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from "@aottg2/ui";
import { ADMIN_DIALOG_SCROLL_CLASS, ADMIN_PORTAL_CONTENT_CLASS } from "../constants";
import type { AdminUserLike, RestrictionKindDraft } from "../types";

export function RestrictionDialog({
  actionLoading,
  expiresAt,
  kind,
  reason,
  user,
  onExpiresAt,
  onKind,
  onReason,
  onSave,
  onUser,
}: {
  actionLoading: boolean;
  expiresAt: string;
  kind: RestrictionKindDraft;
  reason: string;
  user: AdminUserLike | null;
  onExpiresAt: (value: string) => void;
  onKind: (value: RestrictionKindDraft) => void;
  onReason: (value: string) => void;
  onSave: () => void;
  onUser: (value: AdminUserLike | null) => void;
}) {
  return (
    <Dialog open={user !== null} onOpenChange={(open) => !open && onUser(null)}>
      <DialogContent className={ADMIN_DIALOG_SCROLL_CLASS}>
        <DialogHeader>
          <DialogTitle>{kind === "ban" ? "Ban user" : "Suspend user"}</DialogTitle>
          <DialogDescription>{user?.email}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="restriction-kind">Action</Label>
            <Select value={kind} onValueChange={(value) => onKind(value as RestrictionKindDraft)}>
              <SelectTrigger id="restriction-kind"><SelectValue /></SelectTrigger>
              <SelectContent className={ADMIN_PORTAL_CONTENT_CLASS}>
                <SelectItem value="suspension">Suspend with expiry</SelectItem>
                <SelectItem value="ban">Ban until lifted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {kind === "suspension" ? (
            <div className="space-y-2">
              <Label htmlFor="restriction-expires-at">Suspension ends</Label>
              <Input id="restriction-expires-at" type="datetime-local" value={expiresAt} onChange={(event) => onExpiresAt(event.target.value)} />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="restriction-reason">Reason</Label>
            <Textarea id="restriction-reason" value={reason} onChange={(event) => onReason(event.target.value)} placeholder="Reason shown to the user on login." rows={4} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onUser(null)}>Cancel</Button>
          <Button type="button" variant={kind === "ban" ? "destructive" : "default"} disabled={actionLoading || !reason.trim()} onClick={onSave}>
            {kind === "ban" ? "Ban user" : "Suspend user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
