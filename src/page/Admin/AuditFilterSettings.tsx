import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aottg2/ui";
import { ADMIN_PORTAL_CONTENT_CLASS } from "./constants";
import { FilterSettingsPopover } from "./FilterSettingsPopover";

type AuditViewMode = "readable" | "technical";

type AuditFilterSettingsProps = {
  accountLabel?: string;
  loading: boolean;
  onApplyUserSearch: (query: string) => Promise<boolean>;
  onPageSizeChange: (pageSize: number) => void;
  onReset: () => void;
  onViewModeChange: (mode: AuditViewMode) => void;
  pageSize: number;
  userSearch: string;
  viewMode: AuditViewMode;
};

export function AuditFilterSettings({
  accountLabel,
  loading,
  onApplyUserSearch,
  onPageSizeChange,
  onReset,
  onViewModeChange,
  pageSize,
  userSearch,
  viewMode,
}: AuditFilterSettingsProps) {
  const [open, setOpen] = useState(false);
  const [draftUserSearch, setDraftUserSearch] = useState(userSearch);
  const activeCount = (accountLabel ? 1 : 0) + (viewMode === "technical" ? 1 : 0) + (pageSize !== 50 ? 1 : 0);

  useEffect(() => {
    if (open) setDraftUserSearch(userSearch);
  }, [open, userSearch]);

  async function apply() {
    if (await onApplyUserSearch(draftUserSearch)) setOpen(false);
  }

  function reset() {
    onReset();
    setDraftUserSearch("");
    setOpen(false);
  }

  return (
    <FilterSettingsPopover
      activeCount={activeCount}
      description="User filter matches audit actor or target."
      footer={(
        <>
          <Button type="button" variant="ghost" onClick={reset}>Reset</Button>
          <Button type="button" disabled={loading} onClick={() => void apply()}>{loading ? "Finding" : "Apply filters"}</Button>
        </>
      )}
      onReset={reset}
      open={open}
      setOpen={setOpen}
    >
      <div className="space-y-2">
        <Label htmlFor="admin-audit-filter-user">User</Label>
        <Input
          id="admin-audit-filter-user"
          value={draftUserSearch}
          onChange={(event) => setDraftUserSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void apply();
            }
          }}
          placeholder="Email, account name, or account id"
        />
        {accountLabel ? <Badge variant="secondary">Current: {accountLabel}</Badge> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-audit-filter-view">View</Label>
        <Select value={viewMode} onValueChange={(value) => onViewModeChange(value === "technical" ? "technical" : "readable")}>
          <SelectTrigger id="admin-audit-filter-view"><SelectValue /></SelectTrigger>
          <SelectContent className={ADMIN_PORTAL_CONTENT_CLASS}>
            <SelectItem value="readable">Readable</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-audit-filter-page-size">Rows per page</Label>
        <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger id="admin-audit-filter-page-size"><SelectValue /></SelectTrigger>
          <SelectContent className={ADMIN_PORTAL_CONTENT_CLASS}>
            {[20, 50, 100].map((size) => <SelectItem key={size} value={String(size)}>{size} / page</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </FilterSettingsPopover>
  );
}
