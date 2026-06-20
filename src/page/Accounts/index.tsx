import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../auth/api";
import { useAuth } from "../../auth/useAuth";
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
        <div className="mx-auto mt-8 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-primary" />
      </AuthShell>
    );
  }

  const patreon = profile.patreon;

  return (
    <AuthShell eyebrow="Account" title={`Welcome, ${profile.displayName}`} subtitle="Manage your AOTTG2 account." maxWidthClass="max-w-3xl">
      <div className="mt-8 grid gap-5">
        <section className="rounded border border-white/10 bg-white/5 p-5">
          <h2 className="font-primary text-2xl uppercase">Profile</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-white/50">Display name</dt>
              <dd className="mt-1 text-lg">{profile.displayName}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-white/50">Email</dt>
              <dd className="mt-1 text-lg break-all">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-white/50">Email verified</dt>
              <dd className="mt-1 text-lg">{profile.emailVerified ? "Yes" : "No"}</dd>
            </div>
            {profile.photonUserId && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-white/50">Photon user id</dt>
                <dd className="mt-1 text-lg break-all">{profile.photonUserId}</dd>
              </div>
            )}
          </dl>
          {!profile.emailVerified && (
            <p className="mt-5 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              Email not verified. <Link className="underline" to="/resend-verification">Resend verification →</Link>
            </p>
          )}
        </section>

        <section className="rounded border border-white/10 bg-white/5 p-5">
          <h2 className="font-primary text-2xl uppercase">Change display name</h2>
          <form className="mt-5 space-y-4" onSubmit={handleUpdateName}>
            <label className="block text-sm text-white/80" htmlFor="new-display-name">
              New display name
              <input
                id="new-display-name"
                type="text"
                autoComplete="username"
                className="mt-2 w-full rounded border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-primary"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                maxLength={25}
                required
              />
              <span className="mt-1 block text-right text-xs text-white/40">{newName.length}/25</span>
            </label>
            {nameMessage && (nameOk ? <SuccessMessage>{nameMessage}</SuccessMessage> : <ErrorMessage>{nameMessage}</ErrorMessage>)}
            <button
              type="submit"
              className="rounded bg-primary px-5 py-3 font-primary text-xl uppercase text-white transition hover:bg-[#9f3344] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={nameLoading}
            >
              {nameLoading ? "Saving…" : "Save"}
            </button>
          </form>
        </section>

        <section className="rounded border border-white/10 bg-white/5 p-5">
          <h2 className="font-primary text-2xl uppercase">Patreon</h2>
          {patreon?.linked ? (
            <div className="mt-5 space-y-4 text-sm text-white/80">
              <p>Status: <span className="text-white">{patreon.patronStatus ?? "Linked"}</span></p>
              {patreon.tierIds.length > 0 && <p>Tiers: <span className="text-white">{patreon.tierIds.join(", ")}</span></p>}
              {patreon.entitledAmountCents != null && (
                <p>Pledge: <span className="text-white">${(patreon.entitledAmountCents / 100).toFixed(2)}/month</span></p>
              )}
              {patreonError && <ErrorMessage>{patreonError}</ErrorMessage>}
              <button
                type="button"
                className="rounded border border-white/20 px-5 py-3 font-primary text-xl uppercase text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handlePatreonUnlink}
                disabled={patreonLoading}
              >
                {patreonLoading ? "Unlinking…" : "Unlink Patreon"}
              </button>
            </div>
          ) : (
            <div className="mt-5 space-y-4 text-sm text-white/70">
              <p>Link your Patreon account to sync supporter tiers.</p>
              {patreonError && <ErrorMessage>{patreonError}</ErrorMessage>}
              <button
                type="button"
                className="rounded bg-primary px-5 py-3 font-primary text-xl uppercase text-white transition hover:bg-[#9f3344] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handlePatreonLink}
                disabled={patreonLoading}
              >
                {patreonLoading ? "Redirecting…" : "Link Patreon"}
              </button>
            </div>
          )}
        </section>

        <section className="rounded border border-red-500/40 bg-red-950/20 p-5">
          <h2 className="font-primary text-2xl uppercase text-red-100">Delete account</h2>
          <p className="mt-3 text-sm leading-6 text-red-100/80">
            This permanently deletes your account and associated data. This action cannot be undone.
          </p>
          <form className="mt-5 space-y-4" onSubmit={handleDeleteAccount}>
            <label className="block text-sm text-white/80" htmlFor="delete-confirm">
              Type <strong>DELETE</strong> to confirm
              <input
                id="delete-confirm"
                type="text"
                autoComplete="off"
                className="mt-2 w-full rounded border border-red-500/30 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-red-400"
                placeholder="DELETE"
                value={deleteConfirm}
                onChange={(event) => setDeleteConfirm(event.target.value)}
              />
            </label>
            {deleteError && <ErrorMessage>{deleteError}</ErrorMessage>}
            <button
              type="submit"
              className="rounded bg-red-700 px-5 py-3 font-primary text-xl uppercase text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting…" : "Delete my account"}
            </button>
          </form>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="rounded bg-primary px-5 py-3 font-primary text-xl uppercase text-white transition hover:bg-[#9f3344]"
            onClick={handleLogout}
          >
            Logout
          </button>
          <Link
            className="rounded border border-white/20 px-5 py-3 text-center font-primary text-xl uppercase text-white transition hover:bg-white/10"
            to="/"
          >
            Back home
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
