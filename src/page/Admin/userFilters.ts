import type { AdminAccountFilters } from "../../auth/types";

export const EMPTY_USER_FILTERS: AdminAccountFilters = {
  roles: [],
  emailVerified: "any",
  displayName: "",
};

export function countUserFilters(filters: AdminAccountFilters) {
  return filters.roles.length + (filters.emailVerified === "any" ? 0 : 1) + (filters.displayName.trim() ? 1 : 0);
}

export function normalizeUserFilters(filters: AdminAccountFilters): AdminAccountFilters {
  return {
    roles: [...new Set(filters.roles.map((role) => role.trim()).filter(Boolean))],
    emailVerified: filters.emailVerified,
    displayName: filters.displayName.trim(),
  };
}
