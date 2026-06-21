import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authApi } from "../../auth/api";
import { Button, Spinner } from "@aottg2/ui";
import { AuthShell } from "../Auth/AuthShell";

type VerifyState = "loading" | "success" | "error" | "missing-token";

export default function Verify() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState<VerifyState>(token ? "loading" : "missing-token");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;
    authApi.verifyEmail(token)
      .then(({ ok, data }) => {
        if (!active) {
          return;
        }

        if (ok) {
          setState("success");
        } else {
          setError(data.error ?? "Verification failed.");
          setState("error");
        }
      })
      .catch(() => {
        if (active) {
          setError("Network error. Please try again.");
          setState("error");
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  if (state === "loading") {
    return (
      <AuthShell title="Verifying…" subtitle="Please wait while we verify your email.">
        <Spinner className="mx-auto mt-8" label="Verifying email" />
      </AuthShell>
    );
  }

  if (state === "success") {
    return (
      <AuthShell title="Email verified" subtitle="Your account is active. You can sign in now.">
        <Button asChild size="lg" className="mt-8 w-full">
          <Link to="/login">Sign in</Link>
        </Button>
      </AuthShell>
    );
  }

  if (state === "missing-token") {
    return (
      <AuthShell title="Invalid link" subtitle="No verification token was found in this link.">
        <Button asChild size="account" className="mt-8">
          <Link to="/resend-verification">Request a new verification email</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Verification failed" subtitle={error}>
      <Button asChild size="account" className="mt-8">
        <Link to="/resend-verification">Request a new verification email</Link>
      </Button>
    </AuthShell>
  );
}
