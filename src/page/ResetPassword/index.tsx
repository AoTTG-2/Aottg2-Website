import { FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authApi } from "../../auth/api";
import { AuthShell, ErrorMessage } from "../Auth/AuthShell";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
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
      const { ok, data } = await authApi.resetPassword(token, password);
      if (ok) {
        setSuccess(true);
      } else {
        setError(data.error ?? "Reset failed. The link may have expired.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthShell title="Invalid link" subtitle="No reset token was found. Request a new link below.">
        <p className="mt-8 text-center text-sm">
          <Link className="text-white underline" to="/forgot-password">
            ← Request a new link
          </Link>
        </p>
      </AuthShell>
    );
  }

  if (success) {
    return (
      <AuthShell title="Password updated" subtitle="Your password has been reset successfully.">
        <p className="mt-8 text-center text-sm">
          <Link className="text-white underline" to="/login">
            Sign in with your new password →
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset password" subtitle="Choose a new password for your account.">
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm text-white/80" htmlFor="new-password">
          New password
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            className="mt-2 w-full rounded border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-primary"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <label className="block text-sm text-white/80" htmlFor="confirm-new-password">
          Confirm password
          <input
            id="confirm-new-password"
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
          {isSubmitting ? "Saving…" : "Set new password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link className="text-white underline" to="/forgot-password">
          ← Request a new link
        </Link>
      </p>
    </AuthShell>
  );
}
