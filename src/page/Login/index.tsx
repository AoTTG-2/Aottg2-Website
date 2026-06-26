import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../auth/api";
import { enabledOAuthProviders, isAuthMethodEnabled } from "../../auth/authMethods";
import { buildWorkshopCallbackUrl, getLoginNext } from "../../auth/loginRedirect";
import { usePublicAuthMethods } from "../../auth/usePublicAuthMethods";
import { useAuth } from "../../auth/useAuth";
import { Button, EmptyState, Input, Label, Spinner } from "@aottg2/ui";
import { AuthShell, ErrorMessage } from "../Auth/AuthShell";
import { OAuthButtons, OAuthDivider } from "../Auth/OAuthButtons";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState(searchParams.get("error") ?? "");
  const authMethods = usePublicAuthMethods();
  const loginNext = useMemo(() => getLoginNext(searchParams.get("next")), [searchParams]);
  const emailEnabled = isAuthMethodEnabled(authMethods.methods, "email_password");
  const oauthProviders = enabledOAuthProviders(authMethods.methods);
  const hasOAuth = oauthProviders.length > 0;

  const finishLogin = useCallback(async (replace = false) => {
    if (loginNext?.kind === "workshop") {
      setIsRedirecting(true);
      const { ok, data } = await authApi.createSessionCode();
      if (!ok || !data.code) {
        setIsRedirecting(false);
        setError(data.error ?? "Could not open Workshop. Please try again.");
        return;
      }

      window.location.href = buildWorkshopCallbackUrl(loginNext, data.code);
      return;
    }

    navigate(loginNext?.path ?? "/accounts", { replace });
  }, [loginNext, navigate]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isRedirecting) {
      void finishLogin(true);
    }
  }, [finishLogin, isAuthenticated, isLoading, isRedirecting]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.ok) {
        await finishLogin();
      } else {
        setError(result.error ?? "Login failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell title="Sign in" subtitle="Sign in to your AOTTG2 account.">
      {authMethods.loading ? (
        <div className="py-10"><Spinner label="Loading sign-in options" /></div>
      ) : !emailEnabled && !hasOAuth ? (
        <EmptyState title="Sign-in unavailable" description={authMethods.error || "All sign-in methods are currently disabled."} />
      ) : (
        <>
          {hasOAuth ? <OAuthButtons disabled={isSubmitting || isLoading || isRedirecting} enabledProviders={oauthProviders} onError={setError} returnTo={loginNext} /> : null}
          {hasOAuth && emailEnabled ? <OAuthDivider /> : null}
        </>
      )}

      {emailEnabled && !authMethods.loading ? <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="mikasa.ackerman@scouts.example"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting || isLoading || isRedirecting}
        >
          {isRedirecting ? "Opening Workshop…" : isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form> : null}

      {emailEnabled ? <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm font-medium text-muted-foreground">
        <span>
          No account?{" "}
          <Button asChild variant="link" className="h-auto p-0 text-foreground normal-case tracking-normal">
            <Link to="/register">Register</Link>
          </Button>
        </span>
        <Button asChild variant="link" className="h-auto p-0 text-foreground normal-case tracking-normal">
          <Link to="/forgot-password">Forgot password?</Link>
        </Button>
      </div> : null}
    </AuthShell>
  );
}
