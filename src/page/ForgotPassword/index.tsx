import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../../auth/api";
import { AuthShell, ErrorMessage } from "../Auth/AuthShell";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sent) {
    return (
      <AuthShell title="Check your email" subtitle={`If an account exists for ${email}, a password reset link was sent.`}>
        <p className="mt-8 text-center text-sm">
          <Link className="text-white underline" to="/login">
            ← Back to sign in
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Forgot password" subtitle="Enter your email and we will send a reset link if an account exists.">
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm text-white/80" htmlFor="forgot-email">
          Email address
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            className="mt-2 w-full rounded border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-primary"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <button
          type="submit"
          className="w-full rounded bg-primary px-4 py-3 font-primary text-xl uppercase text-white transition hover:bg-[#9f3344] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link className="text-white underline" to="/login">
          ← Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
