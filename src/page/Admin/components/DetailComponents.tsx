import type { ReactNode } from "react";
import { Badge, Card, CardContent, Tooltip, TooltipContent, TooltipTrigger } from "@aottg2/ui";
import { ADMIN_PORTAL_CONTENT_CLASS } from "../constants";
import type { BadgeVariant } from "../types";

export function CappedBadgeList({
  emptyText,
  getLabel,
  getVariant,
  items,
  limit = 2,
  onClick,
}: {
  emptyText?: string;
  getLabel: (item: string) => string;
  getVariant?: (item: string) => BadgeVariant;
  items: string[];
  limit?: number;
  onClick?: () => void;
}) {
  if (!items.length) return emptyText ? <span className="text-xs text-muted-foreground">{emptyText}</span> : null;

  const visible = items.slice(0, limit);
  const hidden = items.slice(limit);
  const renderPill = (key: string, label: string, variant: BadgeVariant, tooltip: string) => {
    const badge = <Badge variant={variant} className="shrink-0 whitespace-nowrap text-[0.68rem]">{label}</Badge>;
    return (
      <Tooltip key={key}>
        <TooltipTrigger asChild>
          {onClick ? (
            <button type="button" className="shrink-0" onClick={onClick}>
              {badge}
            </button>
          ) : (
            <span className="shrink-0">{badge}</span>
          )}
        </TooltipTrigger>
        <TooltipContent className={ADMIN_PORTAL_CONTENT_CLASS}>{tooltip}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="inline-flex max-w-full flex-wrap items-center gap-1">
      {visible.map((item) => renderPill(item, getLabel(item), getVariant?.(item) ?? "secondary", getLabel(item)))}
      {hidden.length ? renderPill("overflow", `+${hidden.length}`, "outline", hidden.map(getLabel).join(", ")) : null}
    </div>
  );
}

export function TooltipText({ className = "", value }: { className?: string; value: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`block truncate ${className}`}>{value}</span>
      </TooltipTrigger>
      <TooltipContent className={ADMIN_PORTAL_CONTENT_CLASS}>{value}</TooltipContent>
    </Tooltip>
  );
}

export function TooltipBadge({ children, tooltip }: { children: ReactNode; tooltip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{children}</span>
      </TooltipTrigger>
      <TooltipContent className={ADMIN_PORTAL_CONTENT_CLASS}>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function DetailCellButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="block w-full min-w-0 text-left" onClick={onClick}>
      {children}
    </button>
  );
}

export function DetailRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-3 text-xs leading-6 sm:grid-cols-[7rem_minmax(0,1fr)] sm:text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words font-medium text-foreground">{children}</dd>
    </div>
  );
}

export function DetailSection({ actions, children, description, title }: { actions?: ReactNode; children: ReactNode; description?: ReactNode; title: string }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-3 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display text-base font-semibold leading-tight text-foreground">{title}</h3>
            {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
          </div>
          {actions}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
