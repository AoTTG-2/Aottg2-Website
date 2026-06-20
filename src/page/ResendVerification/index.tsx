import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../../auth/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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
          <Link className="text-neutral-950 underline underline-offset-4" to="/login">
            ← Back to sign in
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Resend verification" subtitle="Enter your email and we will send a new verification link if needed.">
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="resend-email">Email address</Label>
          <Input
            id="resend-email"
            type="email"
            autoComplete="email"
            placeholder="connie.springer@scouts.example"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Button type="submit" variant="brush" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Resend email"}
        </Button>
      </form>

      <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm font-medium text-neutral-600">
        <Link className="text-neutral-950 underline underline-offset-4" to="/login">
          ← Back to sign in
        </Link>
        <Link className="text-neutral-950 underline underline-offset-4" to="/register">
          Create account
        </Link>
      </div>
    </AuthShell>
  );
}
