import { useEffect, useState } from "react";
import { toast } from "@aottg2/ui";
import { authApi } from "../../../auth/api";
import type { AuditEventResponse } from "../../../auth/types";
import { EMPTY_USER_FILTERS } from "../userFilters";
import type { AdminSection, AuditAccountLookup, AuditAccountSummary, AuditViewMode } from "../types";

const accountIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function useAdminAudits(canReadAudits: boolean, canReadUsers: boolean, section: AdminSection) {
  const [auditEvents, setAuditEvents] = useState<AuditEventResponse[]>([]);
  const [auditsTotal, setAuditsTotal] = useState(0);
  const [auditsLoading, setAuditsLoading] = useState(false);
  const [auditsError, setAuditsError] = useState("");
  const [auditEventType, setAuditEventType] = useState("");
  const [debouncedAuditEventType, setDebouncedAuditEventType] = useState("");
  const [auditUserSearch, setAuditUserSearch] = useState("");
  const [auditAccountFilter, setAuditAccountFilter] = useState<AuditAccountSummary | null>(null);
  const [auditUserSearchLoading, setAuditUserSearchLoading] = useState(false);
  const [auditsPage, setAuditsPage] = useState(1);
  const [auditsPageSize, setAuditsPageSize] = useState(50);
  const [auditsRefreshKey, setAuditsRefreshKey] = useState(0);
  const [auditViewMode, setAuditViewMode] = useState<AuditViewMode>("readable");
  const [auditAccountLookup, setAuditAccountLookup] = useState<AuditAccountLookup>({});
  const auditsPageCount = Math.max(1, Math.ceil(auditsTotal / auditsPageSize));

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedAuditEventType(auditEventType);
      setAuditsPage(1);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [auditEventType]);

  useEffect(() => {
    if (!canReadAudits || section !== "audits") return;

    const controller = new AbortController();
    setAuditsLoading(true);
    setAuditsError("");

    authApi.listAuditEvents(debouncedAuditEventType, auditsPage, auditsPageSize, auditAccountFilter?.accountId, controller.signal)
      .then(({ ok, data }) => {
        if (controller.signal.aborted) return;
        if (ok) {
          setAuditEvents(data.events ?? []);
          setAuditsTotal(data.total ?? 0);
        } else {
          setAuditsError(data.error ?? "Could not load audit logs.");
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setAuditsError(error instanceof Error ? error.message : "Could not load audit logs.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setAuditsLoading(false);
      });

    return () => controller.abort();
  }, [auditAccountFilter?.accountId, auditsPage, auditsPageSize, auditsRefreshKey, canReadAudits, debouncedAuditEventType, section]);

  useEffect(() => {
    if (!canReadUsers || !canReadAudits || section !== "audits" || !auditEvents.length) return;

    const accountIds = new Set<string>();
    for (const event of auditEvents) {
      if (!event.actor && event.actorAccountId && event.actorAccountId !== "system" && !auditAccountLookup[event.actorAccountId]) accountIds.add(event.actorAccountId);
      if (!event.target && event.targetAccountId && event.targetAccountId !== "system" && !auditAccountLookup[event.targetAccountId]) accountIds.add(event.targetAccountId);
    }

    if (!accountIds.size) return;

    let cancelled = false;
    Promise.allSettled(Array.from(accountIds).map(async (accountId) => {
      const { ok, data } = await authApi.getAdminAccount(accountId);
      if (!ok) return null;
      return { accountId: data.accountId, displayName: data.displayName, email: data.email } satisfies AuditAccountSummary;
    })).then((results) => {
      if (cancelled) return;
      const nextLookup: AuditAccountLookup = {};
      for (const result of results) {
        if (result.status === "fulfilled" && result.value) nextLookup[result.value.accountId] = result.value;
      }
      if (Object.keys(nextLookup).length) setAuditAccountLookup((current) => ({ ...current, ...nextLookup }));
    });

    return () => { cancelled = true; };
  }, [auditAccountLookup, auditEvents, canReadAudits, canReadUsers, section]);

  function clearAuditAccountFilter() {
    setAuditUserSearch("");
    setAuditAccountFilter(null);
    setAuditsPage(1);
  }

  function resetAuditFilters() {
    clearAuditAccountFilter();
    setAuditViewMode("readable");
    setAuditsPageSize(50);
  }

  async function applyAuditAccountSearch(value: string) {
    const query = value.trim();
    setAuditsPage(1);
    if (!query) {
      setAuditAccountFilter(null);
      setAuditUserSearch("");
      return true;
    }

    if (accountIdPattern.test(query)) {
      setAuditAccountFilter({ accountId: query });
      setAuditUserSearch(query);
      return true;
    }

    if (!canReadUsers) {
      toast.error("Could not filter user", { description: "User search requires users.read." });
      return false;
    }

    setAuditUserSearchLoading(true);
    try {
      const { ok, data } = await authApi.listAdminAccounts(query, 1, 1, EMPTY_USER_FILTERS);
      const user = ok ? data.accounts?.[0] : null;
      if (!user) {
        toast.error("No matching user");
        return false;
      }

      setAuditAccountFilter({ accountId: user.accountId, displayName: user.displayName, email: user.email });
      setAuditUserSearch(user.email || user.displayName || user.accountId);
      return true;
    } catch (error) {
      toast.error("Could not filter user", { description: error instanceof Error ? error.message : undefined });
      return false;
    } finally {
      setAuditUserSearchLoading(false);
    }
  }

  return {
    auditEvents,
    auditsTotal,
    auditsLoading,
    auditsError,
    auditEventType,
    setAuditEventType,
    auditUserSearch,
    auditAccountFilter,
    setAuditAccountFilter,
    auditUserSearchLoading,
    auditsPage,
    setAuditsPage,
    auditsPageSize,
    setAuditsPageSize,
    auditViewMode,
    setAuditViewMode,
    auditAccountLookup,
    auditsPageCount,
    setDebouncedAuditEventType,
    resetAuditFilters,
    applyAuditAccountSearch,
    refetchAudits: () => setAuditsRefreshKey((current) => current + 1),
    setAuditUserSearch,
  };
}
