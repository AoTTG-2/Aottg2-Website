import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../../auth/api";
import { AuthShell, ErrorMessage } from "../Auth/AuthShell";

export default function ResendVerification() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await authApi.resendVerification(email);
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sent) {
    return (
      <AuthShell title="Email sent" subtitle={`If ${email} has an unverified account, a new verification link was sent.`}>
        <p className="mt-8 text-center text-sm">
          <Link className="text-white underline" to="/login">
            ← Back to sign in
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Resend verification" subtitle="Enter your email and we will send a new verification link if needed.">
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm text-white/80" htmlFor="resend-email">
          Email address
          <input
            id="resend-email"
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
          {isSubmitting ? "Sending…" : "Resend email"}
        </button>
      </form>

      <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm text-white/60">
        <Link className="text-white underline" to="/login">
          ← Back to sign in
        </Link>
        <Link className="text-white underline" to="/register">
          Create account
        </Link>
      </div>
    </AuthShell>
  );
}
