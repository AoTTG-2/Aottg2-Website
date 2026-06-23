import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../auth/api";
import { buildWorkshopCallbackUrl, getLoginNext } from "../../auth/loginRedirect";
import { useAuth } from "../../auth/useAuth";
import { Button, Input, Label } from "@aottg2/ui";
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
  const loginNext = useMemo(() => getLoginNext(searchParams.get("next")), [searchParams]);

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
      <OAuthButtons disabled={isSubmitting || isLoading || isRedirecting} onError={setError} returnTo={loginNext} />
      <OAuthDivider />

      <form className="space-y-5" onSubmit={handleSubmit}>
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
      </form>

      <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm font-medium text-muted-foreground">
        <span>
          No account?{" "}
          <Button asChild variant="link" className="h-auto p-0 text-foreground normal-case tracking-normal">
            <Link to="/register">Register</Link>
          </Button>
        </span>
        <Button asChild variant="link" className="h-auto p-0 text-foreground normal-case tracking-normal">
          <Link to="/forgot-password">Forgot password?</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
