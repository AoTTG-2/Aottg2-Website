import { type Dispatch, type SetStateAction, useState } from "react";
import { toast } from "@aottg2/ui";
import { authApi } from "../../../auth/api";
import type { AdminAccountDetailResponse, ProfileResponse } from "../../../auth/types";

type UseUserPatreonActionsArgs = {
  canReadAudits: boolean;
  detail: AdminAccountDetailResponse | null;
  loadPatreonCatalog: () => Promise<void>;
  patreonCatalogLoaded: boolean;
  patreonTiersError: string;
  patreonTiersLoading: boolean;
  refetchAudits: () => void;
  refetchUsers: () => void;
  setDetail: Dispatch<SetStateAction<AdminAccountDetailResponse | null>>;
};

export function useUserPatreonActions({
  canReadAudits,
  detail,
  loadPatreonCatalog,
  patreonCatalogLoaded,
  patreonTiersError,
  patreonTiersLoading,
  refetchAudits,
  refetchUsers,
  setDetail,
}: UseUserPatreonActionsArgs) {
  const [patreonUser, setPatreonUser] = useState<ProfileResponse | AdminAccountDetailResponse | null>(null);
  const [patreonTierDraft, setPatreonTierDraft] = useState<string[]>([]);
  const [patreonStatusDraft, setPatreonStatusDraft] = useState("");
  const [patreonAmountDraft, setPatreonAmountDraft] = useState("");
  const [patreonCustomTier, setPatreonCustomTier] = useState("");
  const [clearPatreonOverrideUser, setClearPatreonOverrideUser] = useState<ProfileResponse | AdminAccountDetailResponse | null>(null);
  const [patreonActionLoading, setPatreonActionLoading] = useState(false);

  function openPatreon(user: ProfileResponse | AdminAccountDetailResponse) {
    setPatreonUser(user);
    setPatreonTierDraft(user.patreon?.tierIds ?? []);
    setPatreonStatusDraft(user.patreon?.patronStatus ?? "active_patron");
    setPatreonAmountDraft(user.patreon?.entitledAmountCents == null ? "" : String(user.patreon.entitledAmountCents));
    setPatreonCustomTier("");
    if ((!patreonCatalogLoaded || patreonTiersError) && !patreonTiersLoading) void loadPatreonCatalog();
  }

  function addCustomPatreonTier() {
    const tier = patreonCustomTier.trim();
    if (!tier) return;
    setPatreonTierDraft((current) => current.includes(tier) ? current : [...current, tier]);
    setPatreonCustomTier("");
  }

  async function savePatreonTiers() {
    if (!patreonUser) return;
    const amount = patreonAmountDraft.trim() ? Number(patreonAmountDraft) : null;
    if (amount !== null && (!Number.isInteger(amount) || amount < 0)) {
      toast.error("Invalid Patreon amount", { description: "Amount must be cents, like 500." });
      return;
    }

    setPatreonActionLoading(true);
    try {
      const { ok, data } = await authApi.updateAdminPatreon(patreonUser.accountId, {
        tierIds: patreonTierDraft,
        patronStatus: patreonStatusDraft.trim() || undefined,
        entitledAmountCents: amount,
      });
      if (!ok) {
        toast.error("Patreon save failed", { description: data.error });
        return;
      }
      toast.success("Patreon tiers saved");
      if (detail?.accountId === patreonUser.accountId) setDetail({ ...detail, patreon: data });
      setPatreonUser(null);
      refetchUsers();
      if (canReadAudits) refetchAudits();
    } catch {
      toast.error("Patreon save failed", { description: "Network error." });
    } finally {
      setPatreonActionLoading(false);
    }
  }

  async function refreshUserPatreon(user: ProfileResponse | AdminAccountDetailResponse) {
    setPatreonActionLoading(true);
    try {
      const { ok, data } = await authApi.refreshAdminPatreon(user.accountId);
      if (!ok) {
        toast.error("Patreon refresh failed", { description: data.error });
        return;
      }
      toast.success("Patreon tiers refreshed");
      if (detail?.accountId === user.accountId) setDetail({ ...detail, patreon: data });
      refetchUsers();
      if (canReadAudits) refetchAudits();
    } catch {
      toast.error("Patreon refresh failed", { description: "Network error." });
    } finally {
      setPatreonActionLoading(false);
    }
  }

  async function clearPatreonOverride() {
    if (!clearPatreonOverrideUser) return;
    setPatreonActionLoading(true);
    try {
      const { ok, data } = await authApi.clearAdminPatreonOverride(clearPatreonOverrideUser.accountId);
      if (!ok) {
        toast.error("Clear override failed", { description: data.error });
        return;
      }
      toast.success("Patreon override cleared");
      if (detail?.accountId === clearPatreonOverrideUser.accountId) setDetail({ ...detail, patreon: data });
      if (patreonUser?.accountId === clearPatreonOverrideUser.accountId) setPatreonUser(null);
      setClearPatreonOverrideUser(null);
      refetchUsers();
      if (canReadAudits) refetchAudits();
    } catch {
      toast.error("Clear override failed", { description: "Network error." });
    } finally {
      setPatreonActionLoading(false);
    }
  }

  return {
    patreonUser,
    setPatreonUser,
    patreonTierDraft,
    setPatreonTierDraft,
    patreonStatusDraft,
    setPatreonStatusDraft,
    patreonAmountDraft,
    setPatreonAmountDraft,
    patreonCustomTier,
    setPatreonCustomTier,
    clearPatreonOverrideUser,
    setClearPatreonOverrideUser,
    patreonActionLoading,
    openPatreon,
    addCustomPatreonTier,
    savePatreonTiers,
    refreshUserPatreon,
    clearPatreonOverride,
  };
}
