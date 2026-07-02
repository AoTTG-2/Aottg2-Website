import { useEffect, useMemo, useState } from "react";
import { toast } from "@aottg2/ui";
import { changelogApi } from "../../../auth/changelogApi";
import type { ChangelogEntryResponse } from "../../../auth/changelogTypes";
import type { AdminSection } from "../types";

export function useAdminChangelogs(canRead: boolean, canUpdate: boolean, canReadAudits: boolean, section: AdminSection, refetchAudits: () => void) {
  const [entries, setEntries] = useState<ChangelogEntryResponse[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [version, setVersion] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const selected = useMemo(
    () => entries.find((entry) => entry.id === selectedId) ?? null,
    [entries, selectedId],
  );

  useEffect(() => {
    if (!canRead || section !== "changelog") return;

    const controller = new AbortController();
    setLoading(true);
    setError("");

    changelogApi.listAdmin(controller.signal)
      .then(({ ok, data }) => {
        if (controller.signal.aborted) return;
        if (!ok) {
          setError(data.error ?? "Could not load changelogs.");
          return;
        }
        setEntries(data.entries ?? []);
        const next = data.entries?.[0];
        if (next) {
          setSelectedId(next.id);
          setVersion(next.version);
          setContentMarkdown(next.contentMarkdown);
        } else {
          setSelectedId(null);
          setVersion("");
          setContentMarkdown("");
        }
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not load changelogs.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [canRead, refreshKey, section]);

  function selectEntry(entry: ChangelogEntryResponse) {
    setSelectedId(entry.id);
    setVersion(entry.version);
    setContentMarkdown(entry.contentMarkdown);
  }

  function newDraft() {
    setSelectedId(null);
    setVersion("");
    setContentMarkdown("");
  }

  function replaceEntry(entry: ChangelogEntryResponse) {
    setEntries((current) => {
      const exists = current.some((item) => item.id === entry.id);
      return exists
        ? current.map((item) => item.id === entry.id ? entry : item)
        : [entry, ...current];
    });
    selectEntry(entry);
  }

  async function save() {
    if (!canUpdate) return;
    if (!version.trim() || !contentMarkdown.trim()) {
      toast.error("Changelog save failed", { description: "Version and content are required." });
      return;
    }

    setSaving(true);
    try {
      const payload = { version: version.trim(), contentMarkdown: contentMarkdown.trim() };
      const { ok, data } = selectedId
        ? await changelogApi.updateAdmin(selectedId, payload)
        : await changelogApi.createAdmin(payload);
      if (!ok) {
        toast.error("Changelog save failed", { description: data.error });
        return;
      }
      replaceEntry(data);
      toast.success("Changelog saved");
      if (canReadAudits) refetchAudits();
    } catch {
      toast.error("Changelog save failed", { description: "Network error." });
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    if (!canUpdate || !selectedId) return;
    await mutateSelected(() => changelogApi.publishAdmin(selectedId), "Changelog published", "Publish failed");
  }

  async function unpublish() {
    if (!canUpdate || !selectedId) return;
    await mutateSelected(() => changelogApi.unpublishAdmin(selectedId), "Changelog unpublished", "Unpublish failed");
  }

  async function deleteDraft() {
    if (!canUpdate || !selectedId) return;
    setSaving(true);
    try {
      const { ok, data } = await changelogApi.deleteAdmin(selectedId);
      if (!ok) {
        toast.error("Delete failed", { description: data.error });
        return;
      }
      setEntries((current) => current.filter((entry) => entry.id !== selectedId));
      newDraft();
      toast.success("Changelog deleted");
      if (canReadAudits) refetchAudits();
    } catch {
      toast.error("Delete failed", { description: "Network error." });
    } finally {
      setSaving(false);
    }
  }

  async function mutateSelected(
    action: () => ReturnType<typeof changelogApi.publishAdmin>,
    success: string,
    failure: string,
  ) {
    setSaving(true);
    try {
      const { ok, data } = await action();
      if (!ok) {
        toast.error(failure, { description: data.error });
        return;
      }
      replaceEntry(data);
      toast.success(success);
      if (canReadAudits) refetchAudits();
    } catch {
      toast.error(failure, { description: "Network error." });
    } finally {
      setSaving(false);
    }
  }

  return {
    entries,
    selected,
    version,
    contentMarkdown,
    loading,
    saving,
    error,
    setVersion,
    setContentMarkdown,
    selectEntry,
    newDraft,
    save,
    publish,
    unpublish,
    deleteDraft,
    refresh: () => setRefreshKey((current) => current + 1),
  };
}
