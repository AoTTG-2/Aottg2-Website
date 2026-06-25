import { Badge, Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@aottg2/ui";
import type { AdminAccountDetailResponse, PatreonTierResponse, ProfileResponse } from "../../../auth/types";
import { ADMIN_DIALOG_SCROLL_CLASS, ADMIN_PORTAL_CONTENT_CLASS } from "../constants";
import type { BadgeVariant, MultiSelectItem } from "../types";
import { formatMoneyCents } from "../utils/format";
import { PillMultiSelect } from "./PillMultiSelect";

export function PatreonUserDialog({
  actionLoading,
  amountDraft,
  customTier,
  onAddCustomTier,
  onAmountDraft,
  onClearOverrideUser,
  onCustomTier,
  onSave,
  onStatusDraft,
  onTierDraft,
  onUser,
  patreonTiers,
  statusDraft,
  tierDraft,
  tiersError,
  tiersLoading,
  user,
  onLoadCatalog,
}: {
  actionLoading: boolean;
  amountDraft: string;
  customTier: string;
  onAddCustomTier: () => void;
  onAmountDraft: (value: string) => void;
  onClearOverrideUser: (user: ProfileResponse | AdminAccountDetailResponse) => void;
  onCustomTier: (value: string) => void;
  onSave: () => void;
  onStatusDraft: (value: string) => void;
  onTierDraft: (value: string[]) => void;
  onUser: (value: ProfileResponse | AdminAccountDetailResponse | null) => void;
  patreonTiers: PatreonTierResponse[];
  statusDraft: string;
  tierDraft: string[];
  tiersError: string;
  tiersLoading: boolean;
  user: ProfileResponse | AdminAccountDetailResponse | null;
  onLoadCatalog: () => void;
}) {
  const patreonTierIds = new Set(patreonTiers.map((tier) => tier.id));
  const patreonTierItems: MultiSelectItem[] = [
    ...patreonTiers.map((tier) => ({
      key: tier.id,
      label: tier.title,
      search: `${tier.id} ${tier.title}`,
      variant: tier.fromPatreon ? "textured" as BadgeVariant : "secondary" as BadgeVariant,
      help: `${tier.id} · ${formatMoneyCents(tier.amountCents)}`,
    })),
    ...tierDraft.filter((tierId) => !patreonTierIds.has(tierId)).map((tierId) => ({ key: tierId, label: tierId, variant: "outline" as BadgeVariant, help: "Custom tier id" })),
  ];

  return (
    <Dialog open={user !== null} onOpenChange={(open) => !open && onUser(null)}>
      <DialogContent className={ADMIN_DIALOG_SCROLL_CLASS}>
        <DialogHeader>
          <DialogTitle>Manage Patreon</DialogTitle>
          <DialogDescription>{user?.email} - Saving here creates a DB-only manual override for testing.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {user?.patreon?.manualOverride ? <Badge variant="secondary">Current Patreon state is manually overridden</Badge> : null}
          <div className="space-y-2">
            <Label>Tiers</Label>
            <PillMultiSelect ariaLabel="Manage Patreon tiers" emptyText="No tiers selected" items={patreonTierItems} searchPlaceholder="Search Patreon tiers" value={tierDraft} onChange={onTierDraft} />
            {tiersLoading ? <p className="text-xs text-muted-foreground">Loading Patreon tiers...</p> : null}
            {tiersError ? (
              <div className="flex flex-wrap items-center gap-2 text-xs text-destructive">
                <span>{tiersError}</span>
                <Button type="button" size="sm" variant="secondary" onClick={onLoadCatalog}>Retry</Button>
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="space-y-2">
              <Label htmlFor="customPatreonTier">Custom tier ID</Label>
              <Input id="customPatreonTier" value={customTier} onChange={(event) => onCustomTier(event.target.value)} />
            </div>
            <Button type="button" variant="secondary" className="self-end" onClick={onAddCustomTier}>Add tier</Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="patreonStatus">Status</Label>
              <Select value={statusDraft} onValueChange={onStatusDraft}>
                <SelectTrigger id="patreonStatus"><SelectValue /></SelectTrigger>
                <SelectContent className={ADMIN_PORTAL_CONTENT_CLASS}>
                  <SelectItem value="active_patron">active_patron</SelectItem>
                  <SelectItem value="declined_patron">declined_patron</SelectItem>
                  <SelectItem value="former_patron">former_patron</SelectItem>
                  <SelectItem value="linked_pending_sync">linked_pending_sync</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="patreonAmount">Amount cents</Label>
              <Input id="patreonAmount" type="number" min={0} value={amountDraft} onChange={(event) => onAmountDraft(event.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onUser(null)}>Cancel</Button>
          {user?.patreon?.manualOverride ? <Button type="button" variant="destructive" disabled={actionLoading} onClick={() => onClearOverrideUser(user)}>Clear override</Button> : null}
          <Button type="button" disabled={actionLoading} onClick={onSave}>Save manual override</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
