import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../../auth/api";
import { AuthShell, BackHomeLink, ErrorMessage } from "../Auth/AuthShell";
import { OAuthButtons, OAuthDivider } from "../Auth/OAuthButtons";

export default function Register() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { ok, data } = await authApi.register(email, displayName, password);
      if (ok) {
        setSuccess(true);
      } else {
        setError(data.error ?? "Registration failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <AuthShell title="Check your email" subtitle={`We sent a verification link to ${email}.`}>
        <div className="mt-8 rounded border border-green-500/30 bg-green-500/10 p-5 text-sm leading-6 text-green-100">
          Click the verification link to activate your account, then sign in. If you do not see it, check your spam folder.
        </div>
        <div className="mt-6 flex flex-col gap-3 text-center text-sm">
          <Link className="text-white underline" to="/resend-verification">
            Resend verification email
          </Link>
          <Link className="text-white/80 hover:text-white" to="/login">
            ← Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create account" subtitle="Create an AOTTG2 account or continue with OAuth.">
      <OAuthButtons disabled={isSubmitting} onError={setError} />
      <OAuthDivider />

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm text-white/80" htmlFor="register-email">
          Email address
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            className="mt-2 w-full rounded border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-primary"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="block text-sm text-white/80" htmlFor="display-name">
          Display name
          <input
            id="display-name"
            type="text"
            autoComplete="username"
            className="mt-2 w-full rounded border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-primary"
            placeholder="Your in-game name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={25}
            required
          />
          <span className="mt-1 block text-right text-xs text-white/40">{displayName.length}/25</span>
        </label>

        <label className="block text-sm text-white/80" htmlFor="register-password">
          Password
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            className="mt-2 w-full rounded border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-primary"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <label className="block text-sm text-white/80" htmlFor="confirm-password">
          Confirm password
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            className="mt-2 w-full rounded border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-primary"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </label>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <button
          type="submit"
          className="w-full rounded bg-primary px-4 py-3 font-primary text-xl uppercase text-white transition hover:bg-[#9f3344] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/60">
        Already have an account?{" "}
        <Link className="text-white underline" to="/login">
          Sign in
        </Link>
      </p>
      <BackHomeLink />
    </AuthShell>
  );
}
