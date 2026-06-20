import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import BackgroundImage from "../../assets/images/bg-dark.webp";
import { useAuth } from "../../auth/useAuth";

export default function Accounts() {
  const navigate = useNavigate();
  const { profile, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  if (isLoading || !profile) {
    return (
      <main className="relative min-h-screen overflow-hidden px-4 py-28 text-white">
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${BackgroundImage})`, filter: "brightness(0.25)" }}
        />
        <div className="relative z-10 flex min-h-[70vh] items-center justify-center">
          <div className="rounded-lg border border-white/10 bg-black/70 p-8 text-center shadow-2xl">
            <p className="font-primary text-2xl uppercase">Loading account…</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-28 text-white">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BackgroundImage})`, filter: "brightness(0.25)" }}
      />
      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
        <section className="w-full rounded-lg border border-white/10 bg-black/70 p-8 shadow-2xl backdrop-blur-sm">
          <p className="font-primary text-sm uppercase tracking-[0.35em] text-white/60">Account</p>
          <h1 className="mt-3 font-primary text-4xl uppercase">Welcome, {profile.displayName}</h1>
          <p className="mt-2 text-sm text-white/70">This is a barebones account page for the website login integration.</p>

          <dl className="mt-8 space-y-5 rounded border border-white/10 bg-white/5 p-5">
            <div>
              <dt className="text-xs uppercase tracking-wide text-white/50">Display name</dt>
              <dd className="mt-1 text-lg">{profile.displayName}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-white/50">Email</dt>
              <dd className="mt-1 text-lg">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-white/50">Email verified</dt>
              <dd className="mt-1 text-lg">{profile.emailVerified ? "Yes" : "No"}</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
        </section>
      </div>
    </main>
  );
}
