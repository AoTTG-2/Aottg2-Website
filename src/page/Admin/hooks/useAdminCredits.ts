import { useEffect, useState } from "react";
import { toast } from "@aottg2/ui";
import { creditsApi } from "../../../auth/creditsApi";
import { authApi } from "../../../auth/api";
import type { AdminCreditCategory } from "../../../auth/creditsTypes";
import type { ProfileResponse } from "../../../auth/types";
import type { AdminSection } from "../types";

const emptyContributor = () => ({ id: crypto.randomUUID(), name: "", accountId: null, sortOrder: 0 });
const emptyCategory = (sortOrder: number): AdminCreditCategory => ({
  id: crypto.randomUUID(),
  name: "",
  sortOrder,
  contributors: [],
});

export function useAdminCredits(canRead: boolean, canUpdate: boolean, canReadUsers: boolean, canReadAudits: boolean, section: AdminSection, refetchAudits: () => void) {
  const [draft, setDraft] = useState<AdminCreditCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<ProfileResponse[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  useEffect(() => {
    if (!canRead || section !== "credits") return;

    const controller = new AbortController();
    setLoading(true);
    setError("");

    creditsApi.getAdmin(controller.signal)
      .then(({ ok, data }) => {
        if (controller.signal.aborted) return;
        if (!ok) {
          setError(data.error ?? "Could not load credits.");
          return;
        }
        setDraft(data.categories ?? []);
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not load credits.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [canRead, refreshKey, section]);

  function updateCategory(index: number, patch: Partial<AdminCreditCategory>) {
    setDraft((current) => current.map((category, i) => i === index ? { ...category, ...patch } : category));
  }

  function updateContributor(categoryIndex: number, contributorIndex: number, patch: Partial<AdminCreditCategory["contributors"][number]>) {
    setDraft((current) => current.map((category, i) => i === categoryIndex
      ? { ...category, contributors: category.contributors.map((contributor, j) => j === contributorIndex ? { ...contributor, ...patch } : contributor) }
      : category));
  }

  function moveCategory(index: number, direction: -1 | 1) {
    setDraft((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function moveContributor(categoryIndex: number, contributorIndex: number, direction: -1 | 1) {
    setDraft((current) => current.map((category, i) => {
      if (i !== categoryIndex) return category;
      const next = [...category.contributors];
      const target = contributorIndex + direction;
      if (target < 0 || target >= next.length) return category;
      [next[contributorIndex], next[target]] = [next[target], next[contributorIndex]];
      return { ...category, contributors: next };
    }));
  }

  async function searchUsers() {
    if (!canReadUsers || !userSearch.trim()) return;
    setUserSearchLoading(true);
    try {
      const { ok, data } = await authApi.listAdminAccounts(userSearch, 1, 8);
      if (!ok) {
        toast.error("User search failed", { description: data.error });
        return;
      }
      setUserResults(data.accounts ?? []);
    } catch {
      toast.error("User search failed", { description: "Network error." });
    } finally {
      setUserSearchLoading(false);
    }
  }

  async function save() {
    if (!canUpdate) return;
    if (draft.some((category) => !category.name.trim() || category.contributors.some((contributor) => !contributor.name.trim()))) {
      toast.error("Credits save failed", { description: "Category and contributor names are required." });
      return;
    }

    setSaving(true);
    try {
      const { ok, data } = await creditsApi.updateAdmin({
        categories: draft.map((category) => ({
          id: category.id,
          name: category.name,
          contributors: category.contributors.map((contributor) => ({
            id: contributor.id,
            name: contributor.name,
            accountId: contributor.accountId,
          })),
        })),
      });
      if (!ok) {
        toast.error("Credits save failed", { description: data.error });
        return;
      }
      setDraft(data.categories ?? []);
      toast.success("Credits saved");
      if (canReadAudits) refetchAudits();
    } catch {
      toast.error("Credits save failed", { description: "Network error." });
    } finally {
      setSaving(false);
    }
  }

  return {
    draft,
    loading,
    saving,
    error,
    userSearch,
    userResults,
    userSearchLoading,
    setUserSearch,
    searchUsers,
    addCategory: () => setDraft((current) => [...current, emptyCategory(current.length)]),
    removeCategory: (index: number) => setDraft((current) => current.filter((_, i) => i !== index)),
    moveCategory,
    setCategoryName: (index: number, name: string) => updateCategory(index, { name }),
    addContributor: (categoryIndex: number) => setDraft((current) => current.map((category, i) => i === categoryIndex ? { ...category, contributors: [...category.contributors, emptyContributor()] } : category)),
    deleteContributor: (categoryIndex: number, contributorIndex: number) => setDraft((current) => current.map((category, i) => i === categoryIndex ? { ...category, contributors: category.contributors.filter((_, j) => j !== contributorIndex) } : category)),
    moveContributor,
    setContributorName: (categoryIndex: number, contributorIndex: number, name: string) => updateContributor(categoryIndex, contributorIndex, { name }),
    linkContributor: (categoryIndex: number, contributorIndex: number, user: ProfileResponse) => setDraft((current) => current.map((category, i) => i === categoryIndex
      ? { ...category, contributors: category.contributors.map((contributor, j) => j === contributorIndex ? { ...contributor, accountId: user.accountId, accountDisplayName: user.displayName, name: contributor.name || user.displayName } : contributor) }
      : category)),
    unlinkContributor: (categoryIndex: number, contributorIndex: number) => updateContributor(categoryIndex, contributorIndex, { accountId: null, accountDisplayName: null }),
    save,
    refresh: () => setRefreshKey((current) => current + 1),
  };
}
