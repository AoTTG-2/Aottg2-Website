import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../../auth/api";
import { enabledOAuthProviders, isAuthMethodEnabled } from "../../auth/authMethods";
import { usePublicAuthMethods } from "../../auth/usePublicAuthMethods";
import { Button, EmptyState, Input, Label, Spinner } from "@aottg2/ui";
import { PasswordInput } from "../../components/PasswordInput";
import { AuthShell, ErrorMessage, SuccessMessage } from "../Auth/AuthShell";
import { OAuthButtons, OAuthDivider } from "../Auth/OAuthButtons";

export default function Register() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(true);
  const [error, setError] = useState("");
  const authMethods = usePublicAuthMethods();
  const emailEnabled = isAuthMethodEnabled(authMethods.methods, "email_password");
  const oauthProviders = enabledOAuthProviders(authMethods.methods);
  const hasOAuth = oauthProviders.length > 0;

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
        setVerificationEmailSent(data.verificationEmailSent !== false);
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
    const title = verificationEmailSent ? "Check your email" : "Account created";
    const subtitle = verificationEmailSent
      ? `We sent a verification link to ${email}.`
      : `We could not send a verification link to ${email}.`;

    return (
      <AuthShell title={title} subtitle={subtitle}>
        <div className="mt-8">
          {verificationEmailSent ? (
            <>
              <SuccessMessage>
                Click the verification link to activate your account, then sign in.
              </SuccessMessage>
              <div className="mt-4 rounded-none border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Can't find it?</span> Check your spam or promotions folder. If it is still missing, use Resend verification email below.
              </div>
            </>
          ) : (
            <ErrorMessage>
              Your account was created, but the verification email could not be sent. Try resending it in a moment.
            </ErrorMessage>
          )}
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
      {authMethods.loading ? (
        <div className="py-10"><Spinner label="Loading account options" /></div>
      ) : !emailEnabled && !hasOAuth ? (
        <EmptyState title="Account creation unavailable" description={authMethods.error || "All sign-in methods are currently disabled."} />
      ) : (
        <>
          {hasOAuth ? <OAuthButtons disabled={isSubmitting} enabledProviders={oauthProviders} onError={setError} /> : null}
          {hasOAuth && emailEnabled ? <OAuthDivider /> : null}
        </>
      )}

      {emailEnabled && !authMethods.loading ? <form className="space-y-5" onSubmit={handleSubmit}>
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
          <PasswordInput
            id="register-password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <PasswordInput
            id="confirm-password"
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
      </form> : null}

      <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
        Already have an account?{" "}
        <Link className="text-foreground underline underline-offset-4" to="/login">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
