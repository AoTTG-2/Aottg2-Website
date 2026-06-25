import type { ReactNode } from "react";
import { Badge } from "@aottg2/ui";
import type { RoleResponse } from "../../../auth/types";
import { roleLabel, roleVariant } from "../utils/roles";

export function AuditName({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}

export function AuditAction({ children, tone = "neutral" }: { children: ReactNode; tone?: "added" | "removed" | "neutral" }) {
  const className = tone === "removed"
    ? "font-semibold text-destructive"
    : tone === "added"
      ? "font-semibold text-emerald-500 dark:text-emerald-400"
      : "font-semibold text-primary";

  return <span className={className}>{children}</span>;
}

export function AuditValue({ children, tone = "neutral" }: { children: ReactNode; tone?: "before" | "after" | "neutral" }) {
  const className = tone === "before"
    ? "rounded-md bg-muted px-1.5 py-0.5 font-medium text-muted-foreground"
    : tone === "after"
      ? "rounded-md bg-primary/10 px-1.5 py-0.5 font-semibold text-primary"
      : "font-semibold text-foreground";

  return <span className={className}>{children}</span>;
}

export function AuditRolePill({ role, roles, tone = "added" }: { role: string; roles: RoleResponse[]; tone?: "added" | "removed" }) {
  return <Badge variant={tone === "removed" ? "destructive" : roleVariant(role)} className="align-middle">{roleLabel(role, roles)}</Badge>;
}
