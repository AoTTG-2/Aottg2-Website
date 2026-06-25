import { FiFileText } from "react-icons/fi";
import { Badge, Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Spinner, StatusBadge } from "@aottg2/ui";
import type { AdminAccountDetailResponse, ProfileResponse, RoleResponse } from "../../../auth/types";
import { ADMIN_DETAIL_DIALOG_CLASS } from "../constants";
import type { AuditAccountLookup, RestrictionKindDraft } from "../types";
import { CappedBadgeList, DetailRow, DetailSection } from "./DetailComponents";
import { renderAuditActivity } from "../utils/audit";
import { formatAuditTimestamp, formatCount, formatDate, formatMoneyCents, patreonStatusText, restrictionBadgeVariant, restrictionLabel, shortRestrictionCountdown } from "../utils/format";
import { roleLabel, roleVariant, sortRolesForDisplay } from "../utils/roles";

export function UserDetailDialog({
  actionLoading,
  auditAccountLookup,
  canManageUserRoles,
  canReadAudits,
  canRestrictUsers,
  canUpdatePatreon,
  detail,
  loading,
  open,
  profileAccountId,
  roles,
  onAssign,
  onClearFlag,
  onClearPatreonOverrideUser,
  onFullAudit,
  onLiftRestriction,
  onOpenChange,
  onPatreon,
  onRefreshPatreon,
  onRestrict,
  onViewDetails,
}: {
  actionLoading: boolean;
  auditAccountLookup: AuditAccountLookup;
  canManageUserRoles: boolean;
  canReadAudits: boolean;
  canRestrictUsers: boolean;
  canUpdatePatreon: boolean;
  detail: AdminAccountDetailResponse | null;
  loading: boolean;
  open: boolean;
  profileAccountId?: string;
  roles: RoleResponse[];
  onAssign: (user: AdminAccountDetailResponse) => void;
  onClearFlag: (user: ProfileResponse | AdminAccountDetailResponse, flag: string) => void;
  onClearPatreonOverrideUser: (user: AdminAccountDetailResponse) => void;
  onFullAudit: () => void;
  onLiftRestriction: (user: AdminAccountDetailResponse) => void;
  onOpenChange: (open: boolean) => void;
  onPatreon: (user: AdminAccountDetailResponse) => void;
  onRefreshPatreon: (user: AdminAccountDetailResponse) => void;
  onRestrict: (user: AdminAccountDetailResponse, kind: RestrictionKindDraft) => void;
  onViewDetails: (user: ProfileResponse) => void;
}) {
  const oauthLinks = detail?.oAuthLinks ?? (detail as unknown as { oauthLinks?: AdminAccountDetailResponse["oAuthLinks"] } | null)?.oauthLinks ?? [];
  const recentAuditEvents = detail?.recentAuditEvents.slice(0, 5) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-4xl ${ADMIN_DETAIL_DIALOG_CLASS}`}>
        <DialogHeader>
          <DialogTitle>{detail?.displayName ?? "User details"}</DialogTitle>
          <DialogDescription>{detail?.email ?? "Loading account detail."}</DialogDescription>
        </DialogHeader>
        {loading ? <Spinner label="Loading user" /> : detail ? (
          <div className="min-h-0 space-y-3 overflow-y-auto pr-1 text-sm">
            <div className="flex flex-wrap items-center gap-1.5 border-y border-border py-2">
              <Badge variant={restrictionBadgeVariant(detail.restrictionStatus)}>{restrictionLabel(detail.restrictionStatus)}</Badge>
              <StatusBadge status={detail.emailVerified ? "active" : "pending"}>{detail.emailVerified ? "Verified" : "Unverified"}</StatusBadge>
              <StatusBadge status={detail.patreon?.linked ? "active" : "draft"}>{patreonStatusText(detail.patreon)}</StatusBadge>
              <Badge variant="outline" className="font-mono text-[0.68rem]">{detail.creationIpAddress ?? "No IP"}</Badge>
              <Badge variant="secondary" className="text-[0.68rem]">{formatCount(detail.activeSessionCount)} sessions</Badge>
            </div>

            {(canRestrictUsers || canUpdatePatreon) ? (
              <div className="flex flex-wrap gap-2">
                {canRestrictUsers ? (
                  <>
                    <Button type="button" size="sm" variant="secondary" disabled={actionLoading || detail.accountId === profileAccountId} onClick={() => onRestrict(detail, "suspension")}>Suspend</Button>
                    <Button type="button" size="sm" variant="destructive" disabled={actionLoading || detail.accountId === profileAccountId} onClick={() => onRestrict(detail, "ban")}>Ban</Button>
                    {detail.restrictionStatus !== "active" ? <Button type="button" size="sm" variant="secondary" disabled={actionLoading} onClick={() => onLiftRestriction(detail)}>Lift</Button> : null}
                  </>
                ) : null}
                {canUpdatePatreon ? (
                  <>
                    <Button type="button" size="sm" variant="secondary" onClick={() => onPatreon(detail)}>Edit tiers</Button>
                    <Button type="button" size="sm" variant="secondary" disabled={actionLoading || !detail.patreon?.linked} onClick={() => onRefreshPatreon(detail)}>Refresh tiers</Button>
                    {detail.patreon?.manualOverride ? <Button type="button" size="sm" variant="destructive" disabled={actionLoading} onClick={() => onClearPatreonOverrideUser(detail)}>Clear override</Button> : null}
                  </>
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-3 lg:grid-cols-2">
              <DetailSection title="Account">
                <dl className="space-y-1">
                  <DetailRow label="Photon">{detail.photonUserId ?? "—"}</DetailRow>
                  <DetailRow label="Password">{detail.hasPassword ? "Yes" : "No"}</DetailRow>
                  <DetailRow label="IP">{detail.creationIpAddress ?? "—"}</DetailRow>
                  <DetailRow label="Roles">
                    <CappedBadgeList items={sortRolesForDisplay(detail.roles)} getLabel={(role) => roleLabel(role, roles)} getVariant={roleVariant} limit={4} onClick={canManageUserRoles ? () => onAssign(detail) : undefined} />
                  </DetailRow>
                  <DetailRow label="Created">{formatDate(detail.createdAt)}</DetailRow>
                  <DetailRow label="Updated">{formatDate(detail.updatedAt)}</DetailRow>
                </dl>
              </DetailSection>

              <DetailSection title="Patreon">
                <dl className="space-y-1">
                  <DetailRow label="Status"><div className="flex flex-wrap items-center gap-1.5"><StatusBadge status={detail.patreon?.linked ? "active" : "draft"}>{patreonStatusText(detail.patreon)}</StatusBadge>{detail.patreon?.manualOverride ? <Badge variant="secondary" className="text-[0.68rem]">DB override</Badge> : null}</div></DetailRow>
                  <DetailRow label="Tiers">{detail.patreon?.tierIds.length ? <div className="flex flex-wrap gap-1">{detail.patreon.tierIds.map((tierId) => <Badge key={tierId} variant="secondary" className="text-[0.68rem]">{tierId}</Badge>)}</div> : "—"}</DetailRow>
                  <DetailRow label="Pledge">{formatMoneyCents(detail.patreon?.entitledAmountCents)}</DetailRow>
                  <DetailRow label="Synced">{formatAuditTimestamp(detail.patreon?.lastSyncedAt ?? undefined)}</DetailRow>
                </dl>
              </DetailSection>
            </div>

            <DetailSection title="Restriction" description={detail.restriction ? detail.restriction.reason : "No active restriction."}>
              {detail.restriction ? (
                <dl className="grid gap-x-4 gap-y-1 md:grid-cols-3">
                  <DetailRow label="Type">{detail.restriction.kind}</DetailRow>
                  <DetailRow label="Restricted">{formatAuditTimestamp(detail.restriction.restrictedAt)}</DetailRow>
                  <DetailRow label="Expires">{detail.restriction.expiresAt ? `${formatAuditTimestamp(detail.restriction.expiresAt)} (${shortRestrictionCountdown(detail.restriction.expiresAt)})` : "Never"}</DetailRow>
                </dl>
              ) : <p className="text-xs text-muted-foreground">Account can log in and use normal account actions.</p>}
            </DetailSection>

            <DetailSection title="Same IP accounts" description={detail.canViewRawIp ? "Raw IP visible to admins." : "Raw IP hidden for this viewer."}>
              <div className="space-y-2">
                {detail.sameIpAccounts?.length ? detail.sameIpAccounts.map((account) => (
                  <div key={account.accountId} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                    <button type="button" className="min-w-0 text-left" onClick={() => void onViewDetails(account as ProfileResponse)}>
                      <div className="truncate text-sm font-semibold text-foreground">{account.displayName}</div>
                      <div className="truncate text-xs text-muted-foreground">{account.email}</div>
                    </button>
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <Badge variant={restrictionBadgeVariant(account.restrictionStatus)} className="text-[0.68rem]">{restrictionLabel(account.restrictionStatus)}</Badge>
                      {account.roles.includes("suspicion-ip") ? <Badge variant="outline" className="text-[0.68rem]">IP flag</Badge> : null}
                      {account.roles.includes("inquire") ? <Badge variant="secondary" className="text-[0.68rem]">shared IP</Badge> : null}
                      {canRestrictUsers && account.roles.includes("suspicion-ip") ? <Button type="button" size="sm" variant="secondary" disabled={actionLoading} onClick={() => onClearFlag(account as ProfileResponse, "suspicion-ip")}>Clear IP flag</Button> : null}
                    </div>
                  </div>
                )) : <p className="text-xs text-muted-foreground">No other accounts share this creation IP.</p>}
              </div>
            </DetailSection>

            <DetailSection title="OAuth links">
              <div className="space-y-1 text-xs sm:text-sm">
                {oauthLinks.length ? oauthLinks.map((link) => (
                  <div key={`${link.provider}-${link.providerUserId}`} className="grid grid-cols-[6rem_minmax(0,1fr)] gap-3">
                    <span className="text-muted-foreground">{link.provider}</span>
                    <span className="min-w-0 break-words font-medium text-foreground">{link.providerEmail ?? link.providerUserId}</span>
                  </div>
                )) : <span className="text-muted-foreground">None</span>}
              </div>
            </DetailSection>

            <DetailSection title="Recent audit" actions={canReadAudits ? <Button type="button" size="sm" variant="secondary" className="gap-2" onClick={onFullAudit}><FiFileText className="h-4 w-4" />View Full Audit</Button> : null}>
              <div className="space-y-2 text-xs sm:text-sm">
                {recentAuditEvents.length ? recentAuditEvents.map((event) => (
                  <div key={event.id} className="flex flex-wrap items-center gap-2">
                    <span className="tabular-nums text-muted-foreground">{formatAuditTimestamp(event.createdAt)}</span>
                    {renderAuditActivity(event, roles, auditAccountLookup)}
                  </div>
                )) : <span className="text-muted-foreground">None</span>}
              </div>
            </DetailSection>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
