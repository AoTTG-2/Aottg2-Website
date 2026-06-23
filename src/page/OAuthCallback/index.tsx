import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../auth/api";
import { buildWorkshopCallbackUrl, consumeLoginNext } from "../../auth/loginRedirect";
import { useAuth } from "../../auth/useAuth";
import { Button, Spinner } from "@aottg2/ui";
import { AuthShell } from "../Auth/AuthShell";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { acceptSession } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorMessage = params.get("error");
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    const code = params.get("code");
    if (!code) {
      setError("OAuth sign-in failed. Please try again.");
      return;
    }

    let active = true;
    authApi.oauthSession(code)
      .then(async ({ ok, data }) => {
        if (!active) {
          return;
        }

        if (!ok || !data.accessToken || !data.refreshToken) {
          setError(data.error ?? "OAuth sign-in failed. Please try again.");
          return;
        }

        acceptSession(data);
        const loginNext = consumeLoginNext();
        if (loginNext?.kind === "workshop") {
          const sessionCode = await authApi.createSessionCode();
          if (!active) return;

          if (!sessionCode.ok || !sessionCode.data.code) {
            setError(sessionCode.data.error ?? "Could not open Workshop. Please try again.");
            return;
          }

          window.location.href = buildWorkshopCallbackUrl(loginNext, sessionCode.data.code);
          return;
        }

        navigate(loginNext?.path ?? "/accounts", { replace: true });
      })
      .catch(() => {
        if (active) {
          setError("OAuth sign-in failed. Please try again.");
        }
      });

    return () => {
      active = false;
    };
  }, [acceptSession, navigate]);

  if (error) {
    return (
      <AuthShell title="Sign-in failed" subtitle={error}>
        <Button asChild size="lg" className="mt-8 w-full">
          <Link to="/login">Back to sign in</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Signing you in…" subtitle="Completing OAuth sign-in.">
      <Spinner className="mx-auto mt-8" label="Signing in" />
    </AuthShell>
  );
}
