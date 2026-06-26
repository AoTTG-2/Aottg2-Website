import { useEffect, useState } from "react";
import { toast } from "@aottg2/ui";
import { authMethodsApi } from "../../../auth/authMethodsApi";
import type { AuthMethodResponse } from "../../../auth/types";
import type { AdminSection } from "../types";

export function useAdminAuthMethods(canRead: boolean, canUpdate: boolean, canReadAudits: boolean, section: AdminSection, refetchAudits: () => void) {
  const [methods, setMethods] = useState<AuthMethodResponse[]>([]);
  const [draft, setDraft] = useState<AuthMethodResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!canRead || section !== "auth-methods") return;

    const controller = new AbortController();
    setLoading(true);
    setError("");

    authMethodsApi.getAdmin(controller.signal)
      .then(({ ok, data }) => {
        if (controller.signal.aborted) return;
        if (!ok) {
          setError(data.error ?? "Could not load auth methods.");
          return;
        }
        setMethods(data.methods);
        setDraft(data.methods);
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not load auth methods.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [canRead, refreshKey, section]);

  function setEnabled(key: string, enabled: boolean) {
    setDraft((current) => current.map((method) => method.key === key ? { ...method, enabled } : method));
  }

  async function save() {
    if (!canUpdate) return;
    setSaving(true);
    try {
      const { ok, data } = await authMethodsApi.updateAdmin({ methods: draft.map(({ key, enabled }) => ({ key, enabled })) });
      if (!ok) {
        toast.error("Auth methods save failed", { description: data.error });
        return;
      }
      setMethods(data.methods);
      setDraft(data.methods);
      toast.success("Auth methods saved");
      if (canReadAudits) refetchAudits();
    } catch {
      toast.error("Auth methods save failed", { description: "Network error." });
    } finally {
      setSaving(false);
    }
  }

  return {
    methods,
    draft,
    loading,
    saving,
    error,
    setEnabled,
    save,
    refresh: () => setRefreshKey((current) => current + 1),
  };
}
