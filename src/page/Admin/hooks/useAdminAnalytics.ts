import { useEffect, useState } from "react";
import { authApi } from "../../../auth/api";
import type { AdminAnalyticsResponse } from "../../../auth/types";
import type { AdminSection } from "../types";

export function useAdminAnalytics(canReadAnalytics: boolean, section: AdminSection) {
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  const [analyticsDays, setAnalyticsDays] = useState(30);
  const [analyticsRefreshKey, setAnalyticsRefreshKey] = useState(0);

  useEffect(() => {
    if (!canReadAnalytics || section !== "analytics") return;

    const controller = new AbortController();
    setAnalyticsLoading(true);
    setAnalyticsError("");

    authApi.getAdminAnalytics(analyticsDays, controller.signal)
      .then(({ ok, data }) => {
        if (controller.signal.aborted) return;
        if (ok) {
          setAnalytics(data);
        } else {
          setAnalyticsError(data.error ?? "Could not load analytics.");
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setAnalyticsError(error instanceof Error ? error.message : "Could not load analytics.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setAnalyticsLoading(false);
      });

    return () => controller.abort();
  }, [analyticsDays, analyticsRefreshKey, canReadAnalytics, section]);

  return {
    analytics,
    analyticsDays,
    analyticsError,
    analyticsLoading,
    refetchAnalytics: () => setAnalyticsRefreshKey((current) => current + 1),
    setAnalyticsDays,
  };
}
