import { useEffect, useState } from "react";
import { toast } from "@aottg2/ui";
import { creditsApi } from "../../../auth/creditsApi";
import { authApi } from "../../../auth/api";
import type { AdminCreditCategory } from "../../../auth/creditsTypes";
import type { ProfileResponse } from "../../../auth/types";
import type { AdminSection } from "../types";

const emptyContributor = () => ({ id: crypto.randomUUID(), name: "", accountId: null, sortOrder: 0 });
const emptyGroup = (sortOrder: number) => ({ id: crypto.randomUUID(), title: "", sortOrder, contributors: [] });
const emptyCategory = (sortOrder: number): AdminCreditCategory => ({
  id: crypto.randomUUID(),
  name: "",
  description: "",
  sortOrder,
  contributors: [],
  groups: [],
});

export type CreditContributorTarget = {
  categoryIndex: number;
  groupIndex?: number;
  contributorIndex: number;
};

const categoryHasInvalidFields = (category: AdminCreditCategory) =>
  !category.name.trim()
  || category.contributors.some((contributor) => !contributor.name.trim())
  || category.groups.some((group) => !group.title.trim() || group.contributors.some((contributor) => !contributor.name.trim()));

const normalizeCategory = (category: AdminCreditCategory): AdminCreditCategory => ({
  ...category,
  description: category.description ?? "",
  contributors: category.contributors ?? [],
  groups: category.groups ?? [],
});

function reorderById<T extends { id: string }>(items: T[], activeId: string, overId: string) {
  const activeIndex = items.findIndex((item) => item.id === activeId);
  const overIndex = items.findIndex((item) => item.id === overId);
  if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) return items;

  const next = [...items];
  const [item] = next.splice(activeIndex, 1);
  next.splice(overIndex, 0, item);
  return next;
}

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
        setDraft((data.categories ?? []).map(normalizeCategory));
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

  function updateGroup(categoryIndex: number, groupIndex: number, patch: Partial<AdminCreditCategory["groups"][number]>) {
    setDraft((current) => current.map((category, i) => i === categoryIndex
      ? { ...category, groups: category.groups.map((group, j) => j === groupIndex ? { ...group, ...patch } : group) }
      : category));
  }

  function updateContributor(target: CreditContributorTarget, patch: Partial<AdminCreditCategory["contributors"][number]>) {
    setDraft((current) => current.map((category, i) => {
      if (i !== target.categoryIndex) return category;
      if (target.groupIndex === undefined) {
        return {
          ...category,
          contributors: category.contributors.map((contributor, j) => j === target.contributorIndex ? { ...contributor, ...patch } : contributor),
        };
      }

      return {
        ...category,
        groups: category.groups.map((group, j) => j === target.groupIndex
          ? { ...group, contributors: group.contributors.map((contributor, k) => k === target.contributorIndex ? { ...contributor, ...patch } : contributor) }
          : group),
      };
    }));
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

  function moveGroup(categoryIndex: number, groupIndex: number, direction: -1 | 1) {
    setDraft((current) => current.map((category, i) => {
      if (i !== categoryIndex) return category;
      const next = [...category.groups];
      const target = groupIndex + direction;
      if (target < 0 || target >= next.length) return category;
      [next[groupIndex], next[target]] = [next[target], next[groupIndex]];
      return { ...category, groups: next };
    }));
  }

  function reorderCategory(activeCategoryId: string, overCategoryId: string) {
    setDraft((current) => reorderById(current, activeCategoryId, overCategoryId));
  }

  function reorderGroup(categoryId: string, activeGroupId: string, overGroupId: string) {
    setDraft((current) => current.map((category) => category.id === categoryId
      ? { ...category, groups: reorderById(category.groups, activeGroupId, overGroupId) }
      : category));
  }

  function moveContributor(target: CreditContributorTarget, direction: -1 | 1) {
    setDraft((current) => current.map((category, i) => {
      if (i !== target.categoryIndex) return category;
      if (target.groupIndex === undefined) {
        const next = [...category.contributors];
        const nextIndex = target.contributorIndex + direction;
        if (nextIndex < 0 || nextIndex >= next.length) return category;
        [next[target.contributorIndex], next[nextIndex]] = [next[nextIndex], next[target.contributorIndex]];
        return { ...category, contributors: next };
      }

      return {
        ...category,
        groups: category.groups.map((group, j) => {
          if (j !== target.groupIndex) return group;
          const next = [...group.contributors];
          const nextIndex = target.contributorIndex + direction;
          if (nextIndex < 0 || nextIndex >= next.length) return group;
          [next[target.contributorIndex], next[nextIndex]] = [next[nextIndex], next[target.contributorIndex]];
          return { ...group, contributors: next };
        }),
      };
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
    if (draft.some(categoryHasInvalidFields)) {
      toast.error("Credits save failed", { description: "Category, group, and contributor names are required." });
      return;
    }

    setSaving(true);
    try {
      const { ok, data } = await creditsApi.updateAdmin({
        categories: draft.map((category) => ({
          id: category.id,
          name: category.name,
          description: category.description,
          contributors: category.contributors.map((contributor) => ({
            id: contributor.id,
            name: contributor.name,
            accountId: contributor.accountId,
          })),
          groups: category.groups.map((group) => ({
            id: group.id,
            title: group.title,
            contributors: group.contributors.map((contributor) => ({
              id: contributor.id,
              name: contributor.name,
              accountId: contributor.accountId,
            })),
          })),
        })),
      });
      if (!ok) {
        toast.error("Credits save failed", { description: data.error });
        return;
      }
      setDraft((data.categories ?? []).map(normalizeCategory));
      toast.success("Credits saved");
      if (canReadAudits) refetchAudits();
    } catch {
      toast.error("Credits save failed", { description: "Network error." });
    } finally {
      setSaving(false);
    }
  }

  function addContributor(categoryIndex: number, groupIndex?: number) {
    setDraft((current) => current.map((category, i) => {
      if (i !== categoryIndex) return category;
      if (groupIndex === undefined) return { ...category, contributors: [...category.contributors, emptyContributor()] };
      return {
        ...category,
        groups: category.groups.map((group, j) => j === groupIndex ? { ...group, contributors: [...group.contributors, emptyContributor()] } : group),
      };
    }));
  }

  function deleteContributor(target: CreditContributorTarget) {
    setDraft((current) => current.map((category, i) => {
      if (i !== target.categoryIndex) return category;
      if (target.groupIndex === undefined) {
        return { ...category, contributors: category.contributors.filter((_, j) => j !== target.contributorIndex) };
      }
      return {
        ...category,
        groups: category.groups.map((group, j) => j === target.groupIndex
          ? { ...group, contributors: group.contributors.filter((_, k) => k !== target.contributorIndex) }
          : group),
      };
    }));
  }

  function linkContributor(target: CreditContributorTarget, user: ProfileResponse) {
    const category = draft[target.categoryIndex];
    const contributors = target.groupIndex === undefined ? category?.contributors : category?.groups[target.groupIndex]?.contributors;
    const currentName = contributors?.[target.contributorIndex]?.name;
    updateContributor(target, { accountId: user.accountId, accountDisplayName: user.displayName, name: currentName || user.displayName });
  }

  function addCategory() {
    const category = emptyCategory(draft.length);
    setDraft((current) => [...current, category]);
    return category.id;
  }

  function addGroup(categoryIndex: number) {
    const category = draft[categoryIndex];
    const group = emptyGroup(category?.groups.length ?? 0);
    setDraft((current) => current.map((item, i) => i === categoryIndex ? { ...item, groups: [...item.groups, group] } : item));
    return group.id;
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
    setDraft,
    addCategory,
    removeCategory: (index: number) => setDraft((current) => current.filter((_, i) => i !== index)),
    moveCategory,
    reorderCategory,
    setCategoryName: (index: number, name: string) => updateCategory(index, { name }),
    setCategoryDescription: (index: number, description: string) => updateCategory(index, { description }),
    addGroup,
    deleteGroup: (categoryIndex: number, groupIndex: number) => setDraft((current) => current.map((category, i) => i === categoryIndex ? { ...category, groups: category.groups.filter((_, j) => j !== groupIndex) } : category)),
    moveGroup,
    reorderGroup,
    setGroupTitle: (categoryIndex: number, groupIndex: number, title: string) => updateGroup(categoryIndex, groupIndex, { title }),
    addContributor,
    deleteContributor,
    moveContributor,
    setContributorName: (target: CreditContributorTarget, name: string) => updateContributor(target, { name }),
    linkContributor,
    unlinkContributor: (target: CreditContributorTarget) => updateContributor(target, { accountId: null, accountDisplayName: null }),
    save,
    refresh: () => setRefreshKey((current) => current + 1),
  };
}
