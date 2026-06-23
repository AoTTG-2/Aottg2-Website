import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Spinner } from "@aottg2/ui";
import { authApi } from "../../auth/api";
import { useAuth } from "../../auth/useAuth";
import { AuthShell } from "../Auth/AuthShell";

type CallbackState = "loading" | "success" | "error";

function normalizeError(value: string | null) {
  if (!value) {
    return "Patreon link failed. Please try again.";
  }

  return value
    .replace(/[_-]+/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

export default function PatreonCallback() {
  const { refreshProfile } = useAuth();
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const [state, setState] = useState<CallbackState>("loading");
  const [message, setMessage] = useState("Completing Patreon link.");

  useEffect(() => {
    const providerError = params.get("error");
    if (providerError) {
      setState("error");
      setMessage(normalizeError(providerError));
      return;
    }

    const code = params.get("code");
    const oauthState = params.get("state");
    if (!code || !oauthState) {
      setState("error");
      setMessage("Patreon did not return a valid link code. Please try again.");
      return;
    }

    let active = true;
    authApi.patreonCallback(code, oauthState)
      .then(async ({ ok, data }) => {
        if (!active) {
          return;
        }

        if (!ok || !data.linked) {
          setState("error");
          setMessage(data.error ?? "Patreon link failed. Please try again.");
          return;
        }

        await refreshProfile().catch(() => undefined);
        if (active) {
          setState("success");
          setMessage("Patreon linked. Your supporter status will show in account settings.");
        }
      })
      .catch(() => {
        if (active) {
          setState("error");
          setMessage("Network error while linking Patreon. Please try again.");
        }
      });

    return () => {
      active = false;
    };
  }, [params, refreshProfile]);

  if (state === "loading") {
    return (
      <AuthShell title="Linking Patreon…" subtitle={message}>
        <Spinner className="mx-auto mt-8" label="Linking Patreon" />
      </AuthShell>
    );
  }

  const success = state === "success";

  return (
    <AuthShell title={success ? "Patreon linked" : "Patreon link failed"} subtitle={message}>
      <div className="space-y-3">
        <Button asChild size="lg" className="w-full">
          <Link to="/accounts#connections">Go to account settings</Link>
        </Button>
        {!success && (
          <Button asChild variant="secondary" size="lg" className="w-full">
            <Link to="/accounts#connections">Try again from accounts</Link>
          </Button>
        )}
      </div>
    </AuthShell>
  );
}
