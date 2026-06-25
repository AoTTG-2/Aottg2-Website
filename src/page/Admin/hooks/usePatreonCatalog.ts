import { useCallback, useEffect, useState } from "react";
import { toast } from "@aottg2/ui";
import { authApi } from "../../../auth/api";
import type { PatreonTierResponse } from "../../../auth/types";
import type { AdminSection } from "../types";

export function usePatreonCatalog(canReadPatreon: boolean, canUpdatePatreon: boolean, canReadAudits: boolean, section: AdminSection, refetchAudits: () => void) {
  const [patreonTiers, setPatreonTiers] = useState<PatreonTierResponse[]>([]);
  const [patreonTiersLoading, setPatreonTiersLoading] = useState(false);
  const [patreonTiersError, setPatreonTiersError] = useState("");
  const [patreonCatalogLoaded, setPatreonCatalogLoaded] = useState(false);
  const [patreonTierLabelsJson, setPatreonTierLabelsJson] = useState("[]");
  const [patreonTierLabelsSaving, setPatreonTierLabelsSaving] = useState(false);
  const [patreonRefreshKey, setPatreonRefreshKey] = useState(0);

  const loadPatreonCatalog = useCallback(async () => {
    if (!canReadPatreon) return;
    setPatreonTiersLoading(true);
    setPatreonTiersError("");

    try {
      const [tiersResult, labelsResult] = await Promise.all([authApi.listPatreonTiers(), authApi.getPatreonTierLabels()]);
      if (tiersResult.ok) {
        setPatreonTiers(Array.isArray(tiersResult.data) ? tiersResult.data : []);
        setPatreonCatalogLoaded(true);
      } else {
        setPatreonTiersError(tiersResult.data.error ?? "Could not load Patreon tiers.");
      }

      if (labelsResult.ok) {
        setPatreonTierLabelsJson(JSON.stringify(labelsResult.data.tiers ?? [], null, 2));
      }
    } catch (error: unknown) {
      setPatreonTiersError(error instanceof Error ? error.message : "Could not load Patreon tiers.");
    } finally {
      setPatreonTiersLoading(false);
    }
  }, [canReadPatreon]);

  useEffect(() => {
    if (section !== "patreon") return;
    void loadPatreonCatalog();
  }, [loadPatreonCatalog, patreonRefreshKey, section]);

  async function savePatreonTierLabels() {
    if (!canUpdatePatreon) return;
    let tiers: PatreonTierResponse[];
    try {
      const parsed = JSON.parse(patreonTierLabelsJson) as PatreonTierResponse[];
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array.");
      tiers = parsed;
    } catch (error) {
      toast.error("Invalid JSON", { description: error instanceof Error ? error.message : "Use an array of tier objects." });
      return;
    }

    setPatreonTierLabelsSaving(true);
    try {
      const { ok, data } = await authApi.updatePatreonTierLabels(tiers);
      if (!ok) {
        toast.error("Patreon labels save failed", { description: data.error });
        return;
      }

      setPatreonTierLabelsJson(JSON.stringify(data.tiers ?? [], null, 2));
      toast.success("Patreon tier labels saved");
      setPatreonRefreshKey((current) => current + 1);
      if (canReadAudits) refetchAudits();
    } catch {
      toast.error("Patreon labels save failed", { description: "Network error." });
    } finally {
      setPatreonTierLabelsSaving(false);
    }
  }

  return {
    patreonTiers,
    patreonTiersLoading,
    patreonTiersError,
    patreonCatalogLoaded,
    patreonTierLabelsJson,
    setPatreonTierLabelsJson,
    patreonTierLabelsSaving,
    loadPatreonCatalog,
    savePatreonTierLabels,
    refetchPatreon: () => setPatreonRefreshKey((current) => current + 1),
  };
}
