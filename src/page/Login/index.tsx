import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { AuthShell, BackHomeLink, ErrorMessage } from "../Auth/AuthShell";
import { OAuthButtons, OAuthDivider } from "../Auth/OAuthButtons";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(searchParams.get("error") ?? "");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/accounts", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.ok) {
        navigate("/accounts");
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
      <OAuthButtons disabled={isSubmitting || isLoading} onError={setError} />
      <OAuthDivider />

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm text-white/80" htmlFor="email">
          Email address
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-2 w-full rounded border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-primary"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="block text-sm text-white/80" htmlFor="password">
          Password
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="mt-2 w-full rounded border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-primary"
            placeholder="Your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <button
          type="submit"
          className="w-full rounded bg-primary px-4 py-3 font-primary text-xl uppercase text-white transition hover:bg-[#9f3344] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm text-white/60">
        <span>
          No account?{" "}
          <Link className="text-white underline" to="/register">
            Register
          </Link>
        </span>
        <Link className="text-white underline" to="/forgot-password">
          Forgot password?
        </Link>
      </div>
      <BackHomeLink />
    </AuthShell>
  );
}
