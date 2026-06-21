import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../auth/api";
import { useAuth } from "../../auth/useAuth";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { AuthShell, ErrorMessage, SuccessMessage } from "../Auth/AuthShell";

export default function Accounts() {
  const navigate = useNavigate();
  const { profile, isAuthenticated, isLoading, logout, refreshProfile } = useAuth();
  const [newName, setNewName] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMessage, setNameMessage] = useState("");
  const [nameOk, setNameOk] = useState(false);
  const [patreonLoading, setPatreonLoading] = useState(false);
  const [patreonError, setPatreonError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setNewName(profile.displayName);
    }
  }, [profile]);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  async function handleUpdateName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNameMessage("");
    setNameOk(false);

    const trimmed = newName.trim();
    if (!trimmed) {
      setNameMessage("Display name cannot be empty.");
      return;
    }

    setNameLoading(true);
    try {
      const { ok, data } = await authApi.updateProfile(trimmed);
      if (ok) {
        setNameMessage("Display name updated.");
        setNameOk(true);
        await refreshProfile();
      } else {
        setNameMessage(data.error ?? "Update failed.");
      }
    } catch {
      setNameMessage("Network error. Please try again.");
    } finally {
      setNameLoading(false);
    }
  }

  async function handlePatreonLink() {
    setPatreonError("");
    setPatreonLoading(true);
    try {
      const { ok, data } = await authApi.patreonStart();
      if (ok && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }

      setPatreonError(data.error ?? "Failed to start Patreon link.");
    } catch {
      setPatreonError("Network error. Please try again.");
    } finally {
      setPatreonLoading(false);
    }
  }

  async function handlePatreonUnlink() {
    setPatreonError("");
    setPatreonLoading(true);
    try {
      const { ok, data } = await authApi.patreonUnlink();
      if (ok) {
        await refreshProfile();
      } else {
        setPatreonError(data.error ?? "Failed to unlink Patreon.");
      }
    } catch {
      setPatreonError("Network error. Please try again.");
    } finally {
      setPatreonLoading(false);
    }
  }

  async function handleDeleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeleteError("");

    if (deleteConfirm !== "DELETE") {
      setDeleteError("Type DELETE to confirm.");
      return;
    }

    setDeleteLoading(true);
    try {
      const { ok, data } = await authApi.deleteAccount();
      if (ok) {
        await logout();
        navigate("/login", { replace: true });
      } else {
        setDeleteError(data.error ?? "Deletion failed.");
      }
    } catch {
      setDeleteError("Network error. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  }

  if (isLoading || !profile) {
    return (
      <AuthShell eyebrow="Account" title="Loading account…" maxWidthClass="max-w-md">
        <div className="mx-auto mt-8 h-10 w-10 animate-spin border-4 border-neutral-950/20 border-t-primary" />
      </AuthShell>
    );
  }

  const patreon = profile.patreon;

  return (
    <AuthShell
      eyebrow="Account"
      title={`Welcome, ${profile.displayName}`}
      subtitle="Manage your AOTTG2 account."
      maxWidthClass="max-w-3xl"
    >
      <div className="grid gap-5">
        <Card className="border-neutral-950/10 bg-neutral-950/[0.04]">
          <CardHeader>
            <CardTitle className="text-2xl">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-600">Display name</dt>
                <dd className="mt-1 text-lg">{profile.displayName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-600">Email</dt>
                <dd className="mt-1 break-all text-lg">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-600">Email verified</dt>
                <dd className="mt-1 text-lg">{profile.emailVerified ? "Yes" : "No"}</dd>
              </div>
              {profile.photonUserId && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-neutral-600">Photon user id</dt>
                  <dd className="mt-1 break-all text-lg">{profile.photonUserId}</dd>
                </div>
              )}
            </dl>
            {!profile.emailVerified && (
              <Alert variant="destructive" className="mt-5">
                <AlertDescription>
                  Email not verified. <Link className="underline underline-offset-4" to="/resend-verification">Resend verification →</Link>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="border-neutral-950/10 bg-neutral-950/[0.04]">
          <CardHeader>
            <CardTitle className="text-2xl">Change display name</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleUpdateName}>
              <div className="space-y-2">
                <Label htmlFor="new-display-name">New display name</Label>
                <Input
                  id="new-display-name"
                  type="text"
                  autoComplete="username"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  maxLength={25}
                  required
                />
                <span className="block text-right text-xs text-neutral-500">{newName.length}/25</span>
              </div>
              {nameMessage && (nameOk ? <SuccessMessage>{nameMessage}</SuccessMessage> : <ErrorMessage>{nameMessage}</ErrorMessage>)}
              <Button type="submit" variant="brush" size="lg" disabled={nameLoading}>
                {nameLoading ? "Saving…" : "Save"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-neutral-950/10 bg-neutral-950/[0.04]">
          <CardHeader>
            <CardTitle className="text-2xl">Patreon</CardTitle>
          </CardHeader>
          <CardContent>
            {patreon?.linked ? (
              <div className="space-y-4 text-sm text-neutral-700">
                <p>Status: <span className="font-semibold text-neutral-950">{patreon.patronStatus ?? "Linked"}</span></p>
                {patreon.tierIds.length > 0 && <p>Tiers: <span className="font-semibold text-neutral-950">{patreon.tierIds.join(", ")}</span></p>}
                {patreon.entitledAmountCents != null && (
                  <p>Pledge: <span className="font-semibold text-neutral-950">${(patreon.entitledAmountCents / 100).toFixed(2)}/month</span></p>
                )}
                {patreonError && <ErrorMessage>{patreonError}</ErrorMessage>}
                <Button type="button" variant="account" onClick={handlePatreonUnlink} disabled={patreonLoading}>
                  {patreonLoading ? "Unlinking…" : "Unlink Patreon"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 text-sm text-neutral-700">
                <p>Link your Patreon account to sync supporter tiers.</p>
                {patreonError && <ErrorMessage>{patreonError}</ErrorMessage>}
                <Button type="button" variant="brush" size="lg" onClick={handlePatreonLink} disabled={patreonLoading}>
                  {patreonLoading ? "Redirecting…" : "Link Patreon"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-500/40 bg-red-50/80">
          <CardHeader>
            <CardTitle className="text-2xl text-red-950">Delete account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-red-900">
              This permanently deletes your account and associated data. This action cannot be undone.
            </p>
            <form className="mt-5 space-y-4" onSubmit={handleDeleteAccount}>
              <div className="space-y-2">
                <Label htmlFor="delete-confirm">Type <strong>DELETE</strong> to confirm</Label>
                <Input
                  id="delete-confirm"
                  type="text"
                  autoComplete="off"
                  placeholder="DELETE"
                  value={deleteConfirm}
                  onChange={(event) => setDeleteConfirm(event.target.value)}
                  className="border-red-500/30 focus-visible:ring-red-400"
                />
              </div>
              {deleteError && <ErrorMessage>{deleteError}</ErrorMessage>}
              <Button type="submit" variant="destructive" size="lg" className="font-primary text-xl" disabled={deleteLoading}>
                {deleteLoading ? "Deleting…" : "Delete my account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator className="bg-neutral-950/10" />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="brush" size="lg" onClick={handleLogout}>
            Logout
          </Button>
          <Button asChild variant="account" size="lg">
            <Link to="/">Back home</Link>
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}
