import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BackgroundImage from "../../assets/images/bg-dark.webp";
import { useAuth } from "../../auth/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/accounts", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.ok) {
        navigate("/accounts");
      } else {
        setError(result.error ?? "Login failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-28 text-white">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${BackgroundImage})`,
          filter: "brightness(0.25)",
        }}
      />
      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-md items-center justify-center">
        <section className="w-full rounded-lg border border-white/10 bg-black/70 p-8 shadow-2xl backdrop-blur-sm">
          <p className="font-primary text-sm uppercase tracking-[0.35em] text-white/60">AoTTG 2</p>
          <h1 className="mt-3 font-primary text-4xl uppercase">Sign in</h1>
          <p className="mt-2 text-sm text-white/70">Sign in to your AOTTG2 account.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm text-white/80" htmlFor="email">
              Email address
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="mt-2 w-full rounded border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-primary"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm text-white/80" htmlFor="password">
              Password
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="mt-2 w-full rounded border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-primary"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            {error && (
              <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded bg-primary px-4 py-3 font-primary text-xl uppercase text-white transition hover:bg-[#9f3344] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-white/50">
            Need an account or password help? Use the current accounts portal for now:{" "}
            <a className="text-white underline" href="https://accounts.aottg2.com">
              accounts.aottg2.com
            </a>
          </p>
          <p className="mt-4 text-center text-sm">
            <Link className="text-white/80 hover:text-white" to="/">
              ← Back to website
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
