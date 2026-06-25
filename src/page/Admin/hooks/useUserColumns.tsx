import { Badge, StatusBadge } from "@aottg2/ui";
import type { AdminAccountDetailResponse, ProfileResponse, RoleResponse } from "../../../auth/types";
import { ActionMenu } from "../components/ActionMenu";
import { CappedBadgeList, DetailCellButton, TooltipBadge, TooltipText } from "../components/DetailComponents";
import type { ActionMenuItem } from "../types";
import { formatDate, patreonStatusText, restrictionBadgeVariant, restrictionLabel, shortRestrictionCountdown } from "../utils/format";
import { roleLabel, roleVariant, sortRolesForDisplay } from "../utils/roles";

type UseUserColumnsArgs = {
  canDeleteUsers: boolean;
  canManageUserRoles: boolean;
  canReadUsers: boolean;
  canRestrictUsers: boolean;
  canUpdatePatreon: boolean;
  canUpdateUsers: boolean;
  currentAccountId?: string;
  onAssign: (user: ProfileResponse | AdminAccountDetailResponse) => void;
  onClearFlag: (user: ProfileResponse | AdminAccountDetailResponse, flag: string) => void;
  onDelete: (user: ProfileResponse) => void;
  onEdit: (user: ProfileResponse) => void;
  onLiftRestriction: (user: ProfileResponse | AdminAccountDetailResponse) => void;
  onOpenPatreon: (user: ProfileResponse | AdminAccountDetailResponse) => void;
  onRefreshPatreon: (user: ProfileResponse | AdminAccountDetailResponse) => void;
  onRestrict: (user: ProfileResponse | AdminAccountDetailResponse, kind: "ban" | "suspension") => void;
  onViewDetails: (user: ProfileResponse) => void;
  roles: RoleResponse[];
};

export function useUserColumns({
  canDeleteUsers,
  canManageUserRoles,
  canReadUsers,
  canRestrictUsers,
  canUpdatePatreon,
  canUpdateUsers,
  currentAccountId,
  onAssign,
  onClearFlag,
  onDelete,
  onEdit,
  onLiftRestriction,
  onOpenPatreon,
  onRefreshPatreon,
  onRestrict,
  onViewDetails,
  roles,
}: UseUserColumnsArgs) {
  return [
    {
      key: "user",
      header: "User",
      className: "w-64",
      cell: (user: ProfileResponse) => (
        <DetailCellButton onClick={() => void onViewDetails(user)}>
          <div className="w-56 max-w-full">
            <TooltipText className="text-sm font-semibold text-foreground" value={user.displayName} />
            <TooltipText className="text-xs text-muted-foreground" value={user.email} />
          </div>
        </DetailCellButton>
      ),
    },
    {
      key: "roles",
      header: "Roles",
      className: "w-72",
      cell: (user: ProfileResponse) => (
        <CappedBadgeList items={sortRolesForDisplay(user.roles)} getLabel={(role) => roleLabel(role, roles)} getVariant={roleVariant} onClick={canManageUserRoles ? () => onAssign(user) : undefined} />
      ),
    },
    {
      key: "email",
      header: "Email",
      className: "w-32",
      cell: (user: ProfileResponse) => (
        <DetailCellButton onClick={() => void onViewDetails(user)}>
          <StatusBadge status={user.emailVerified ? "active" : "pending"}>{user.emailVerified ? "Verified" : "Unverified"}</StatusBadge>
        </DetailCellButton>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "w-40",
      cell: (user: ProfileResponse) => (
        <DetailCellButton onClick={() => void onViewDetails(user)}>
          <div className="flex flex-nowrap items-center gap-1.5">
            <Badge variant={restrictionBadgeVariant(user.restrictionStatus)}>{restrictionLabel(user.restrictionStatus)}</Badge>
            {user.restriction?.expiresAt ? <span className="whitespace-nowrap text-xs text-muted-foreground">{shortRestrictionCountdown(user.restriction.expiresAt)}</span> : null}
          </div>
        </DetailCellButton>
      ),
    },
    {
      key: "patreon",
      header: "Patreon",
      className: "w-44",
      cell: (user: ProfileResponse) => (
        <DetailCellButton onClick={() => void onViewDetails(user)}>
          <div className="flex flex-nowrap items-center gap-1.5">
            <StatusBadge status={user.patreon?.linked ? "active" : "draft"}>{patreonStatusText(user.patreon)}</StatusBadge>
            {user.patreon?.tierIds.length ? (
              <TooltipBadge tooltip={user.patreon.tierIds.join(", ")}>
                <Badge variant="outline" className="whitespace-nowrap text-[0.68rem]">+{user.patreon.tierIds.length} tiers</Badge>
              </TooltipBadge>
            ) : null}
          </div>
        </DetailCellButton>
      ),
    },
    {
      key: "created",
      header: "Created",
      className: "w-36",
      cell: (user: ProfileResponse) => (
        <DetailCellButton onClick={() => void onViewDetails(user)}>
          <span className="whitespace-nowrap text-sm">{formatDate(user.createdAt)}</span>
        </DetailCellButton>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-12",
      cell: (user: ProfileResponse) => {
        const items = [
          canReadUsers ? { label: "View details", onSelect: () => void onViewDetails(user) } : null,
          canUpdateUsers ? { label: "Edit profile", onSelect: () => onEdit(user) } : null,
          canManageUserRoles ? { label: "Manage roles", onSelect: () => onAssign(user) } : null,
          canUpdatePatreon ? { label: "Manage Patreon", onSelect: () => onOpenPatreon(user) } : null,
          canUpdatePatreon && user.patreon?.linked ? { label: "Refresh Patreon", onSelect: () => void onRefreshPatreon(user) } : null,
          canRestrictUsers && user.accountId !== currentAccountId ? { label: "Suspend", onSelect: () => onRestrict(user, "suspension") } : null,
          canRestrictUsers && user.accountId !== currentAccountId ? { label: "Ban", onSelect: () => onRestrict(user, "ban"), destructive: true } : null,
          canRestrictUsers && user.restrictionStatus && user.restrictionStatus !== "active" ? { label: "Lift restriction", onSelect: () => void onLiftRestriction(user) } : null,
          canRestrictUsers && user.roles.includes("suspicion-ip") ? { label: "Clear IP flag", onSelect: () => void onClearFlag(user, "suspicion-ip") } : null,
          canRestrictUsers && user.roles.includes("inquire") ? { label: "Clear shared-IP flag", onSelect: () => void onClearFlag(user, "inquire") } : null,
          canDeleteUsers && user.accountId !== currentAccountId ? { label: "Delete account", onSelect: () => onDelete(user), destructive: true } : null,
        ].filter((item): item is ActionMenuItem => item !== null);
        return <ActionMenu items={items} />;
      },
    },
  ];
}
