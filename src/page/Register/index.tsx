import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../../auth/api";
import { Button, Input, Label } from "@aottg2/ui";
import { AuthShell, ErrorMessage, SuccessMessage } from "../Auth/AuthShell";
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
        <div className="mt-8">
          <SuccessMessage>
            Click the verification link to activate your account, then sign in. If you do not see it, check your spam folder.
          </SuccessMessage>
        </div>
        <div className="mt-6 flex flex-col gap-3 text-center text-sm font-medium">
          <Link className="text-foreground underline underline-offset-4" to="/resend-verification">
            Resend verification email
          </Link>
          <Link className="text-muted-foreground hover:text-foreground" to="/login">
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
        <div className="space-y-2">
          <Label htmlFor="register-email">Email address</Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="armin.arlert@scouts.example"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="display-name">Display name</Label>
          <Input
            id="display-name"
            type="text"
            autoComplete="username"
            placeholder="Sasha Blouse"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={25}
            required
          />
          <span className="block text-right text-xs text-muted-foreground">{displayName.length}/25</span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
        Already have an account?{" "}
        <Link className="text-foreground underline underline-offset-4" to="/login">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
