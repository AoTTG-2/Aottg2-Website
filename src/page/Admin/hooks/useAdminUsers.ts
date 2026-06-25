import { useEffect, useState } from "react";
import { authApi } from "../../../auth/api";
import type { AdminAccountFilters, AdminRestrictionStatusFilter, ProfileResponse } from "../../../auth/types";
import { EMPTY_USER_FILTERS } from "../userFilters";
import type { AdminSection } from "../types";

export function useAdminUsers(canReadUsers: boolean, section: AdminSection) {
  const [users, setUsers] = useState<ProfileResponse[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [userFilters, setUserFilters] = useState<AdminAccountFilters>(EMPTY_USER_FILTERS);
  const [bannedStatusFilter, setBannedStatusFilter] = useState<AdminRestrictionStatusFilter>("restricted");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [refreshKey, setRefreshKey] = useState(0);
  const pageCount = Math.max(1, Math.ceil(totalUsers / pageSize));

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [bannedStatusFilter, section]);

  useEffect(() => {
    if (!canReadUsers || (section !== "users" && section !== "banned")) return;

    const controller = new AbortController();
    setUsersLoading(true);
    setUsersError("");
    const effectiveFilters: AdminAccountFilters = section === "banned"
      ? { ...userFilters, restrictionStatus: bannedStatusFilter }
      : userFilters;

    authApi.listAdminAccounts(debouncedSearch, page, pageSize, effectiveFilters, controller.signal)
      .then(({ ok, data }) => {
        if (controller.signal.aborted) return;
        if (ok) {
          setUsers(data.accounts ?? []);
          setTotalUsers(data.total ?? 0);
        } else {
          setUsersError(data.error ?? "Could not load users.");
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setUsersError(error instanceof Error ? error.message : "Could not load users.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setUsersLoading(false);
      });

    return () => controller.abort();
  }, [bannedStatusFilter, canReadUsers, debouncedSearch, page, pageSize, refreshKey, section, userFilters]);

  function applyUserFilters(filters: AdminAccountFilters) {
    setUserFilters(filters);
    setPage(1);
  }

  function resetUserFilters() {
    setUserFilters(EMPTY_USER_FILTERS);
    setPage(1);
  }

  return {
    users,
    totalUsers,
    usersLoading,
    usersError,
    search,
    setSearch,
    userFilters,
    bannedStatusFilter,
    setBannedStatusFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    pageCount,
    applyUserFilters,
    resetUserFilters,
    refetchUsers: () => setRefreshKey((current) => current + 1),
  };
}
