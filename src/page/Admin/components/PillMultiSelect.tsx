import { useState } from "react";
import { Badge, Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, Popover, PopoverContent, PopoverTrigger } from "@aottg2/ui";
import type { PermissionResponse, RoleResponse } from "../../../auth/types";
import type { BadgeVariant, MultiSelectItem } from "../types";
import { roleLabel, roleVariant } from "../utils/roles";

export function PillMultiSelect({
  ariaLabel,
  emptyText,
  items,
  searchPlaceholder,
  value,
  onChange,
}: {
  ariaLabel: string;
  emptyText: string;
  items: MultiSelectItem[];
  searchPlaceholder: string;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const itemMap = new Map(items.map((item) => [item.key, item]));

  function toggle(key: string) {
    onChange(value.includes(key) ? value.filter((item) => item !== key) : [...value, key]);
  }

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          tabIndex={0}
          aria-label={ariaLabel}
          className="flex min-h-11 w-full cursor-pointer flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-left text-sm shadow-sm transition-colors hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpen((current) => !current);
            }
          }}
        >
          {value.length ? value.map((key) => {
            const item = itemMap.get(key) ?? { key, label: key, variant: "secondary" as BadgeVariant };
            return (
              <Badge key={key} variant={item.variant ?? "secondary"} className="gap-1 pr-1">
                {item.label}
                <button
                  type="button"
                  className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggle(key);
                  }}
                  onKeyDown={(event) => event.stopPropagation()}
                  aria-label={`Remove ${item.label}`}
                >
                  ×
                </button>
              </Badge>
            );
          }) : <span className="text-muted-foreground">{emptyText}</span>}
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-80 p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>No matches found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => {
                const selected = value.includes(item.key);
                return (
                  <CommandItem key={item.key} value={item.search ?? item.label} onSelect={() => toggle(item.key)}>
                    <span className="mr-2 w-4 text-center">{selected ? "✓" : ""}</span>
                    <div className="flex min-w-0 flex-col gap-1">
                      <Badge variant={item.variant ?? "secondary"} className="w-fit">{item.label}</Badge>
                      {item.help ? <span className="text-xs text-muted-foreground">{item.help}</span> : null}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function RoleMultiSelect({ roles, value, onChange }: { roles: RoleResponse[]; value: string[]; onChange: (roles: string[]) => void }) {
  return (
    <PillMultiSelect
      ariaLabel="Manage roles"
      emptyText="No roles selected"
      items={roles.map((role) => ({ key: role.name, label: roleLabel(role.name, roles), variant: roleVariant(role.name) }))}
      searchPlaceholder="Search roles"
      value={value}
      onChange={onChange}
    />
  );
}

export function PermissionMultiSelect({ permissions, value, onChange }: { permissions: PermissionResponse[]; value: string[]; onChange: (permissions: string[]) => void }) {
  return (
    <PillMultiSelect
      ariaLabel="Manage permissions"
      emptyText="No permissions selected"
      items={permissions.map((permission) => ({
        key: permission.key,
        label: permission.key,
        search: `${permission.key} ${permission.description}`,
        variant: "outline",
        help: permission.description,
      }))}
      searchPlaceholder="Search permissions"
      value={value}
      onChange={onChange}
    />
  );
}
