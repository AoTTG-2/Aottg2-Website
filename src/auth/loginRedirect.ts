export type LoginNext =
  | { kind: "internal"; path: string }
  | { kind: "workshop"; href: string };

const STORAGE_KEY = "aottg2_login_next";

function workshopOrigins(): Set<string> {
  const origins = new Set([
    "https://workshop.aottg2.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]);
  const configured = import.meta.env.VITE_WORKSHOP_URL;
  if (configured) origins.add(new URL(configured).origin);
  return origins;
}

export function getLoginNext(raw: string | null): LoginNext | null {
  if (!raw) return null;

  try {
    const target = new URL(raw, window.location.origin);
    if (target.origin === window.location.origin) {
      return { kind: "internal", path: `${target.pathname}${target.search}${target.hash}` };
    }

    if (workshopOrigins().has(target.origin)) {
      return { kind: "workshop", href: target.href };
    }
  } catch {
    return null;
  }

  return null;
}

export function rememberLoginNext(next: LoginNext | null): void {
  if (!next) {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function consumeLoginNext(): LoginNext | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const next = JSON.parse(raw) as LoginNext;
    if (next.kind === "internal") return getLoginNext(next.path);
    if (next.kind === "workshop") return getLoginNext(next.href);
  } catch {
    return null;
  }

  return null;
}

export function buildWorkshopCallbackUrl(next: Extract<LoginNext, { kind: "workshop" }>, code: string): string {
  const target = new URL(next.href);
  const callback = new URL("/auth/callback", target.origin);
  callback.searchParams.set("code", code);
  callback.searchParams.set("next", `${target.pathname}${target.search}${target.hash}`);
  return callback.href;
}
