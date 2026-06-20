import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import BackgroundImage from "../../assets/images/bg-dark.webp";

interface AuthShellProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  maxWidthClass?: string;
}

export function AuthShell({
  eyebrow = "AoTTG 2",
  title,
  subtitle,
  children,
  maxWidthClass = "max-w-md",
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-28 text-white">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${BackgroundImage})`,
          filter: "brightness(0.25)",
        }}
      />
      <div className={`relative z-10 mx-auto flex min-h-[70vh] ${maxWidthClass} items-center justify-center`}>
        <section className="w-full rounded-lg border border-white/10 bg-black/70 p-8 shadow-2xl backdrop-blur-sm">
          {eyebrow && <p className="font-primary text-sm uppercase tracking-[0.35em] text-white/60">{eyebrow}</p>}
          {title && <h1 className="mt-3 font-primary text-4xl uppercase">{title}</h1>}
          {subtitle && <p className="mt-2 text-sm text-white/70">{subtitle}</p>}
          {children}
        </section>
      </div>
    </main>
  );
}

export function BackHomeLink() {
  return (
    <p className="mt-4 text-center text-sm">
      <Link className="text-white/80 hover:text-white" to="/">
        ← Back to website
      </Link>
    </p>
  );
}

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
      {children}
    </p>
  );
}

export function SuccessMessage({ children }: { children: ReactNode }) {
  return (
    <p className="rounded border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-200" role="status">
      {children}
    </p>
  );
}
