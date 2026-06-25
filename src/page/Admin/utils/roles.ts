import { ROLE_PRIORITY } from "../constants";
import type { RoleResponse } from "../../../auth/types";
import type { BadgeVariant } from "../types";

export function roleVariant(role: string): BadgeVariant {
  if (role === "admin") return "destructive";
  if (role === "moderator" || role === "trusted") return "textured";
  return "secondary";
}

export function roleLabel(role: string, roles: RoleResponse[]) {
  return roles.find((item) => item.name === role)?.displayName ?? role;
}

export function sortRolesForDisplay(roles: string[]) {
  return [...roles].sort((a, b) => {
    const aRank = ROLE_PRIORITY.indexOf(a);
    const bRank = ROLE_PRIORITY.indexOf(b);
    return (aRank === -1 ? 99 : aRank) - (bRank === -1 ? 99 : bRank);
  });
}
