import { type ReactNode } from "react";
import { FiFilter, FiX } from "react-icons/fi";
import {
  Badge,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@aottg2/ui";
import { ADMIN_PORTAL_CONTENT_CLASS } from "./constants";

type FilterSettingsPopoverProps = {
  activeCount: number;
  children: ReactNode;
  description: string;
  footer: ReactNode;
  onReset: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
};

export function FilterSettingsPopover({
  activeCount,
  children,
  description,
  footer,
  onReset,
  open,
  setOpen,
  title = "Advanced search",
}: FilterSettingsPopoverProps) {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="secondary" className="gap-2">
          <FiFilter className="h-4 w-4" aria-hidden="true" />
          Filter settings
          {activeCount ? <Badge variant="textured" className="ml-1 tabular-nums">{activeCount}</Badge> : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={`${ADMIN_PORTAL_CONTENT_CLASS} w-[min(24rem,calc(100vw-2rem))] border-border bg-card p-0 text-card-foreground shadow-xl`}>
        <div className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            {activeCount ? (
              <Button type="button" variant="ghost" size="icon" onClick={onReset} aria-label="Clear filters">
                <FiX className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          {children}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 p-3">
          {footer}
        </div>
      </PopoverContent>
    </Popover>
  );
}
