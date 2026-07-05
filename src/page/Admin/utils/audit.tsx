import { Badge } from "@aottg2/ui";
import type { AuditEventResponse, RoleResponse } from "../../../auth/types";
import type { AuditAccountLookup, AuditAccountSummary, AuditMetadata } from "../types";
import { AuditAction, AuditName, AuditRolePill, AuditValue } from "../components/AuditParts";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function parseAuditMetadata(metadataJson?: string | null): AuditMetadata {
  if (!metadataJson) return {};

  try {
    const parsed: unknown = JSON.parse(metadataJson);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function getMetadataString(metadata: AuditMetadata, key: string) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function formatAuditAccount(account?: AuditAccountSummary | null, fallbackName = "Unknown user") {
  if (!account) return fallbackName;
  const displayName = account.displayName?.trim();
  const email = account.email?.trim();

  if (displayName && email) return `${displayName} (${email})`;
  return email || displayName || fallbackName;
}

function getAuditMetadataDisplayName(metadata: AuditMetadata) {
  const after = isRecord(metadata.after) ? metadata.after : null;
  const before = isRecord(metadata.before) ? metadata.before : null;
  const afterName = after ? getMetadataString(after, "DisplayName") ?? getMetadataString(after, "displayName") : undefined;
  const beforeName = before ? getMetadataString(before, "DisplayName") ?? getMetadataString(before, "displayName") : undefined;
  return afterName ?? beforeName;
}

function getAuditLookupAccount(accountId: string | null | undefined, accountLookup: AuditAccountLookup) {
  return accountId && accountId !== "system" ? accountLookup[accountId] : undefined;
}

function formatAuditActor(event: AuditEventResponse, accountLookup: AuditAccountLookup) {
  if (event.actor) return formatAuditAccount(event.actor);
  const lookupAccount = getAuditLookupAccount(event.actorAccountId, accountLookup);
  if (lookupAccount) return formatAuditAccount(lookupAccount);
  return !event.actorAccountId || event.actorAccountId === "system" ? "System" : "Unknown user";
}

function formatAuditTarget(event: AuditEventResponse, metadata: AuditMetadata, accountLookup: AuditAccountLookup) {
  if (event.target) return formatAuditAccount(event.target);
  const lookupAccount = getAuditLookupAccount(event.targetAccountId, accountLookup);
  if (lookupAccount) return formatAuditAccount(lookupAccount);
  if (event.targetAccountId === "system") return "System";
  return getAuditMetadataDisplayName(metadata) ?? "Unknown user";
}

function formatAuditFieldName(key: string) {
  const labels: Record<string, string> = {
    DisplayName: "account name",
    displayName: "account name",
    EmailVerified: "email status",
    emailVerified: "email status",
  };

  return labels[key] ?? key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").toLowerCase();
}

function formatAuditValue(key: string, value: unknown) {
  if ((key === "EmailVerified" || key === "emailVerified") && typeof value === "boolean") {
    return value ? "verified" : "unverified";
  }

  if (typeof value === "string") return value || "empty";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null || value === undefined) return "empty";
  return JSON.stringify(value) ?? String(value);
}

function renderAuditChanges(metadata: AuditMetadata) {
  const before = isRecord(metadata.before) ? metadata.before : null;
  const after = isRecord(metadata.after) ? metadata.after : null;
  if (!before || !after) return null;

  const changes = Object.keys(after).filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]));
  if (!changes.length) return null;

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className="text-muted-foreground">:</span>
      {changes.map((key, index) => (
        <span key={key} className="inline-flex flex-wrap items-center gap-1.5">
          {index > 0 ? <span className="text-muted-foreground">,</span> : null}
          <AuditValue>{formatAuditFieldName(key)}</AuditValue>
          <span>changed from</span>
          <AuditValue tone="before">{formatAuditValue(key, before[key])}</AuditValue>
          <span>to</span>
          <AuditValue tone="after">{formatAuditValue(key, after[key])}</AuditValue>
        </span>
      ))}
    </span>
  );
}

export function renderAuditActivity(event: AuditEventResponse, roles: RoleResponse[], accountLookup: AuditAccountLookup = {}) {
  const metadata = parseAuditMetadata(event.metadataJson);
  const actor = formatAuditActor(event, accountLookup);
  const target = formatAuditTarget(event, metadata, accountLookup);
  const contentClassName = "inline-flex flex-wrap items-center gap-1.5 leading-7";

  switch (event.eventType) {
    case "admin.user_role_assigned": {
      const role = getMetadataString(metadata, "role");
      return (
        <span className={contentClassName}>
          <AuditName>{actor}</AuditName>
          <AuditAction tone="added">added</AuditAction>
          {role ? <AuditRolePill role={role} roles={roles} /> : <AuditValue>a role</AuditValue>}
          <span>to</span>
          <AuditName>{target}</AuditName>
        </span>
      );
    }
    case "admin.user_role_removed": {
      const role = getMetadataString(metadata, "role");
      return (
        <span className={contentClassName}>
          <AuditName>{actor}</AuditName>
          <AuditAction tone="removed">removed</AuditAction>
          {role ? <AuditRolePill role={role} roles={roles} tone="removed" /> : <AuditValue>a role</AuditValue>}
          <span>from</span>
          <AuditName>{target}</AuditName>
        </span>
      );
    }
    case "admin.user_updated":
      return (
        <span className={contentClassName}>
          <AuditName>{actor}</AuditName>
          <AuditAction>updated</AuditAction>
          <AuditName>{target}</AuditName>
          {renderAuditChanges(metadata)}
        </span>
      );
    case "admin.account_restricted": {
      const kind = getMetadataString(metadata, "kind");
      return (
        <span className={contentClassName}>
          <AuditName>{actor}</AuditName>
          <AuditAction tone="removed">{kind === "ban" ? "banned" : "suspended"}</AuditAction>
          <AuditName>{target}</AuditName>
        </span>
      );
    }
    case "admin.account_restriction_lifted":
      return (
        <span className={contentClassName}>
          <AuditName>{actor}</AuditName>
          <AuditAction tone="added">lifted restriction</AuditAction>
          <span>for</span>
          <AuditName>{target}</AuditName>
        </span>
      );
    case "admin.account_flag_cleared": {
      const flag = getMetadataString(metadata, "flag");
      return (
        <span className={contentClassName}>
          <AuditName>{actor}</AuditName>
          <AuditAction>cleared</AuditAction>
          <AuditValue>{flag ?? "a flag"}</AuditValue>
          <span>from</span>
          <AuditName>{target}</AuditName>
        </span>
      );
    }
    case "admin.email_limits_updated":
      return <span className={contentClassName}><AuditName>{actor}</AuditName><AuditAction>updated</AuditAction><AuditValue>email service limits</AuditValue></span>;
    case "admin.patreon_tiers_updated":
      return <span className={contentClassName}><AuditName>{actor}</AuditName><AuditAction>updated</AuditAction><AuditValue>Patreon tiers</AuditValue><span>for</span><AuditName>{target}</AuditName></span>;
    case "admin.patreon_tiers_refreshed":
      return <span className={contentClassName}><AuditName>{actor}</AuditName><AuditAction>refreshed</AuditAction><AuditValue>Patreon tiers</AuditValue><span>for</span><AuditName>{target}</AuditName></span>;
    case "admin.patreon_tier_labels_updated":
      return <span className={contentClassName}><AuditName>{actor}</AuditName><AuditAction>updated</AuditAction><AuditValue>Patreon tier labels</AuditValue></span>;
    case "account.registered":
      return <span className={contentClassName}><AuditName>{target}</AuditName><AuditAction tone="added">registered</AuditAction><span>an account</span></span>;
    case "account.email_verified":
      return <span className={contentClassName}><AuditName>{target}</AuditName><AuditAction tone="added">verified</AuditAction><span>their email</span></span>;
    case "account.admin_bootstrapped":
      return <span className={contentClassName}><AuditName>System</AuditName><AuditAction tone="added">bootstrapped</AuditAction><span>admin account</span><AuditName>{target}</AuditName></span>;
    default:
      return <span className={contentClassName}><AuditName>{actor}</AuditName><span>performed</span><Badge variant="outline">{event.eventType}</Badge><span>on</span><AuditName>{target}</AuditName></span>;
  }
}
