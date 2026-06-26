import { useEffect, useState } from "react";
import { authMethodsApi } from "./authMethodsApi";
import type { AuthMethodsResponse } from "./types";

export function usePublicAuthMethods() {
  const [methods, setMethods] = useState<AuthMethodsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    authMethodsApi.getPublic(controller.signal)
      .then(({ ok, data }) => {
        if (controller.signal.aborted) return;
        if (ok) setMethods(data);
        else setError(data.error ?? "Could not load auth methods.");
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not load auth methods.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { methods, loading, error };
}
