import { useEffect, useState } from "react";
import { toast } from "@aottg2/ui";
import { authApi } from "../../../auth/api";
import type { EmailLimitStatusResponse } from "../../../auth/types";
import { readBoundedInt, readPositiveInt } from "../utils/format";
import type { AdminSection } from "../types";

export function useEmailLimits(canReadEmails: boolean, canUpdateEmails: boolean, canReadAudits: boolean, section: AdminSection, refetchAudits: () => void) {
  const [emailLimits, setEmailLimits] = useState<EmailLimitStatusResponse | null>(null);
  const [emailLimitsLoading, setEmailLimitsLoading] = useState(false);
  const [emailLimitsError, setEmailLimitsError] = useState("");
  const [emailLimitsRefreshKey, setEmailLimitsRefreshKey] = useState(0);
  const [monthlyHardLimit, setMonthlyHardLimit] = useState("");
  const [dailyRecipientLimit, setDailyRecipientLimit] = useState("");
  const [dailyIpLimit, setDailyIpLimit] = useState("");
  const [monthlyResetDay, setMonthlyResetDay] = useState("");
  const [dailyResetHourUtc, setDailyResetHourUtc] = useState("");
  const [blockedDomains, setBlockedDomains] = useState<string[]>([]);
  const [blockedDomainsDraft, setBlockedDomainsDraft] = useState("");
  const [emailLimitsSaving, setEmailLimitsSaving] = useState(false);

  useEffect(() => {
    if (!canReadEmails || section !== "emails") return;

    const controller = new AbortController();
    setEmailLimitsLoading(true);
    setEmailLimitsError("");

    Promise.all([
      authApi.getEmailLimits(controller.signal),
      authApi.getBlockedEmailDomains(controller.signal),
    ])
      .then(([limitsResult, domainsResult]) => {
        if (controller.signal.aborted) return;
        const { ok, data } = limitsResult;
        if (ok) {
          setEmailLimits(data);
          setMonthlyHardLimit(String(data.settings.monthlyHardLimit));
          setDailyRecipientLimit(String(data.settings.dailyRecipientLimit));
          setDailyIpLimit(String(data.settings.dailyIpLimit));
          setMonthlyResetDay(String(data.settings.monthlyResetDay));
          setDailyResetHourUtc(String(data.settings.dailyResetHourUtc));
        } else {
          setEmailLimitsError(data.error ?? "Could not load email service limits.");
        }

        if (domainsResult.ok) {
          const domains = domainsResult.data.domains ?? [];
          setBlockedDomains(domains);
          setBlockedDomainsDraft(domains.join(", "));
        } else if (ok) {
          setEmailLimitsError(domainsResult.data.error ?? "Could not load blocked email domains.");
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setEmailLimitsError(error instanceof Error ? error.message : "Could not load email service limits.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setEmailLimitsLoading(false);
      });

    return () => controller.abort();
  }, [canReadEmails, emailLimitsRefreshKey, section]);

  async function saveEmailLimits() {
    if (!canUpdateEmails) return;
    const monthlyHardLimitValue = readPositiveInt(monthlyHardLimit);
    const dailyRecipientLimitValue = readPositiveInt(dailyRecipientLimit);
    const dailyIpLimitValue = readPositiveInt(dailyIpLimit);
    const monthlyResetDayValue = readBoundedInt(monthlyResetDay, 1, 28);
    const dailyResetHourUtcValue = readBoundedInt(dailyResetHourUtc, 0, 23);

    if (monthlyHardLimitValue === null || dailyRecipientLimitValue === null || dailyIpLimitValue === null || monthlyResetDayValue === null || dailyResetHourUtcValue === null) {
      toast.error("Invalid email limits", { description: "Limits must be positive. Reset day is 1-28; reset hour is 0-23 UTC." });
      return;
    }

    setEmailLimitsSaving(true);
    try {
      const { ok, data } = await authApi.updateEmailLimits({
        monthlyHardLimit: monthlyHardLimitValue,
        dailyRecipientLimit: dailyRecipientLimitValue,
        dailyIpLimit: dailyIpLimitValue,
        monthlyResetDay: monthlyResetDayValue,
        dailyResetHourUtc: dailyResetHourUtcValue,
      });

      if (!ok) {
        toast.error("Email limits save failed", { description: data.error });
        return;
      }

      setEmailLimits(data);
      setMonthlyHardLimit(String(data.settings.monthlyHardLimit));
      setDailyRecipientLimit(String(data.settings.dailyRecipientLimit));
      setDailyIpLimit(String(data.settings.dailyIpLimit));
      setMonthlyResetDay(String(data.settings.monthlyResetDay));
      setDailyResetHourUtc(String(data.settings.dailyResetHourUtc));
      toast.success("Email limits saved");
      if (canReadAudits) refetchAudits();
    } catch {
      toast.error("Email limits save failed", { description: "Network error." });
    } finally {
      setEmailLimitsSaving(false);
    }
  }

  async function saveBlockedDomains() {
    if (!canUpdateEmails) return;
    const domains = blockedDomainsDraft
      .split(",")
      .map((domain) => domain.trim())
      .filter(Boolean);

    setEmailLimitsSaving(true);
    try {
      const { ok, data } = await authApi.updateBlockedEmailDomains(domains);
      if (!ok) {
        toast.error("Blocked domains save failed", { description: data.error });
        return;
      }

      setBlockedDomains(data.domains ?? []);
      setBlockedDomainsDraft((data.domains ?? []).join(", "));
      toast.success("Blocked email domains saved");
      if (canReadAudits) refetchAudits();
    } catch {
      toast.error("Blocked domains save failed", { description: "Network error." });
    } finally {
      setEmailLimitsSaving(false);
    }
  }

  return {
    emailLimits,
    emailLimitsLoading,
    emailLimitsError,
    monthlyHardLimit,
    setMonthlyHardLimit,
    dailyRecipientLimit,
    setDailyRecipientLimit,
    dailyIpLimit,
    setDailyIpLimit,
    monthlyResetDay,
    setMonthlyResetDay,
    dailyResetHourUtc,
    setDailyResetHourUtc,
    blockedDomains,
    blockedDomainsDraft,
    setBlockedDomainsDraft,
    emailLimitsSaving,
    saveEmailLimits,
    saveBlockedDomains,
    refetchEmailLimits: () => setEmailLimitsRefreshKey((current) => current + 1),
  };
}
