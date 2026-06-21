import { useEffect, useState } from "react";
import { FiFilter, FiX } from "react-icons/fi";
import {
  Badge,
  Button,
  Checkbox,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from "@aottg2/ui";
import type { AdminAccountFilters, AdminEmailVerifiedFilter, RoleResponse } from "../../auth/types";
import { countUserFilters, EMPTY_USER_FILTERS, normalizeUserFilters } from "./userFilters";

type UserFilterSettingsProps = {
  roles: RoleResponse[];
  value: AdminAccountFilters;
  onApply: (filters: AdminAccountFilters) => void;
  onReset: () => void;
};

function roleVariant(role: string) {
  if (role === "admin") return "destructive";
  if (role === "moderator" || role === "trusted") return "textured";
  return "secondary";
}

export function UserFilterSettings({ roles, value, onApply, onReset }: UserFilterSettingsProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AdminAccountFilters>(value);
  const activeCount = countUserFilters(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  function toggleRole(role: string, checked: boolean) {
    setDraft((current) => ({
      ...current,
      roles: checked
        ? [...current.roles, role].filter((item, index, list) => list.indexOf(item) === index)
        : current.roles.filter((item) => item !== role),
    }));
  }

  function reset() {
    setDraft(EMPTY_USER_FILTERS);
    onReset();
    setOpen(false);
  }

  function apply() {
    onApply(normalizeUserFilters(draft));
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="secondary" className="gap-2">
          <FiFilter className="h-4 w-4" aria-hidden="true" />
          Filter settings
          {activeCount ? <Badge variant="textured" className="ml-1 tabular-nums">{activeCount}</Badge> : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(24rem,calc(100vw-2rem))] border-border bg-card p-0 text-card-foreground shadow-xl">
        <div className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Advanced search</h3>
              <p className="text-xs text-muted-foreground">Role filters match users with every selected role.</p>
            </div>
            {activeCount ? (
              <Button type="button" variant="ghost" size="icon" onClick={reset} aria-label="Clear user filters">
                <FiX className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-filter-display-name">Display name</Label>
            <Input
              id="admin-filter-display-name"
              value={draft.displayName}
              onChange={(event) => setDraft((current) => ({ ...current, displayName: event.target.value }))}
              placeholder="Search display name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-filter-email-status">Email status</Label>
            <Select
              value={draft.emailVerified}
              onValueChange={(nextValue) => setDraft((current) => ({
                ...current,
                emailVerified: nextValue as AdminEmailVerifiedFilter,
              }))}
            >
              <SelectTrigger id="admin-filter-email-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Roles</Label>
              <p className="text-xs text-muted-foreground">Select multiple roles to require all of them.</p>
            </div>
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg bg-background/60 p-2 shadow-inner">
              {roles.length ? roles.map((role) => {
                const checkboxId = `admin-filter-role-${role.name}`;
                const checked = draft.roles.includes(role.name);
                return (
                  <div key={role.name} className="flex min-h-10 items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-accent/50">
                    <Checkbox id={checkboxId} checked={checked} onCheckedChange={(nextChecked) => toggleRole(role.name, nextChecked === true)} />
                    <Label htmlFor={checkboxId} className="flex flex-1 cursor-pointer items-center justify-between gap-3 text-sm font-normal">
                      <span className="truncate">{role.displayName}</span>
                      <Badge variant={roleVariant(role.name)}>{role.name}</Badge>
                    </Label>
                  </div>
                );
              }) : <p className="px-2 py-4 text-sm text-muted-foreground">Role catalog unavailable.</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 p-3">
          <Button type="button" variant="ghost" onClick={reset}>Reset</Button>
          <Button type="button" onClick={apply}>Apply filters</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
