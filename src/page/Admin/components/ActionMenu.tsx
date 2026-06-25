import { FiMoreHorizontal } from "react-icons/fi";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@aottg2/ui";
import { ADMIN_PORTAL_CONTENT_CLASS } from "../constants";
import type { ActionMenuItem } from "../types";

export function ActionMenu({ items }: { items: ActionMenuItem[] }) {
  if (!items.length) return null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon">
          <FiMoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open row actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={ADMIN_PORTAL_CONTENT_CLASS}>
        {items.map((item, index) => (
          <DropdownMenuItem key={index} onSelect={item.onSelect} className={item.destructive ? "text-destructive" : undefined}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
