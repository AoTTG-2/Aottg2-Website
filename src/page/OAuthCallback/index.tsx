import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../auth/api";
import { useAuth } from "../../auth/useAuth";
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
      .then(({ ok, data }) => {
        if (!active) {
          return;
        }

        if (!ok || !data.accessToken || !data.refreshToken) {
          setError(data.error ?? "OAuth sign-in failed. Please try again.");
          return;
        }

        acceptSession(data);
        navigate("/accounts", { replace: true });
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
        <p className="mt-8 text-center text-sm">
          <Link className="text-white underline" to="/login">
            Back to sign in
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Signing you in…" subtitle="Completing OAuth sign-in.">
      <div className="mx-auto mt-8 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-primary" />
    </AuthShell>
  );
}
