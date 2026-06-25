import type { ProfileResponse } from "../../../auth/types";
import type { BadgeVariant } from "../types";

export function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export function formatDateTimeLocal(value: Date) {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function formatAuditTimestamp(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function restrictionLabel(status?: string) {
  if (status === "banned") return "Banned";
  if (status === "suspended") return "Suspended";
  return "Active";
}

export function restrictionBadgeVariant(status?: string): BadgeVariant {
  if (status === "banned") return "destructive";
  if (status === "suspended") return "textured";
  return "secondary";
}

export function restrictionCountdown(expiresAt?: string | null) {
  if (!expiresAt) return "";
  const expiry = new Date(expiresAt).getTime();
  if (Number.isNaN(expiry)) return "";
  const remaining = expiry - Date.now();
  if (remaining <= 0) return "expired";
  const minutes = Math.ceil(remaining / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${mins}m remaining`;
  return `${mins}m remaining`;
}

export function shortRestrictionCountdown(expiresAt?: string | null) {
  return restrictionCountdown(expiresAt).replace(" remaining", "");
}

export function formatCount(value?: number) {
  return new Intl.NumberFormat().format(value ?? 0);
}

export function formatMoneyCents(value?: number | null) {
  return value == null ? "—" : `$${(value / 100).toFixed(2)}`;
}

export function patreonStatusText(patreon?: ProfileResponse["patreon"]) {
  if (!patreon?.linked) return "Unlinked";
  if (patreon.manualOverride) return "Manual";
  return patreon.patronStatus === "active_patron" ? "Linked" : patreon.patronStatus ?? "Linked";
}

export function usagePercent(sent: number, limit: number) {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((sent / limit) * 100));
}

export function readPositiveInt(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function readBoundedInt(value: string, min: number, max: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : null;
}
