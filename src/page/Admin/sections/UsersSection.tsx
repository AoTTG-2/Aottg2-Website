import type { ChangeEvent, ReactNode } from "react";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, DataTable, EmptyState, FilterBar, Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, SearchInput, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Spinner } from "@aottg2/ui";
import type { AdminAccountFilters, AdminRestrictionStatusFilter, ProfileResponse, RoleResponse } from "../../../auth/types";
import { ADMIN_PORTAL_CONTENT_CLASS } from "../constants";
import { UserFilterSettings } from "../UserFilterSettings";

type UserColumn = {
  key: string;
  header: string;
  className?: string;
  cell: (user: ProfileResponse) => ReactNode;
};

export function UsersSection({
  mode,
  bannedStatusFilter,
  onBannedStatusFilter,
  onPage,
  onPageSize,
  onRefresh,
  onSearch,
  page,
  pageCount,
  pageSize,
  roles,
  search,
  totalUsers,
  userColumns,
  userFilters,
  users,
  usersError,
  usersLoading,
  onApplyUserFilters,
  onResetUserFilters,
}: {
  mode: "users" | "banned";
  bannedStatusFilter: AdminRestrictionStatusFilter;
  onBannedStatusFilter: (value: AdminRestrictionStatusFilter) => void;
  onPage: (value: number | ((current: number) => number)) => void;
  onPageSize: (value: number) => void;
  onRefresh: () => void;
  onSearch: (value: string) => void;
  page: number;
  pageCount: number;
  pageSize: number;
  roles: RoleResponse[];
  search: string;
  totalUsers: number;
  userColumns: UserColumn[];
  userFilters: AdminAccountFilters;
  users: ProfileResponse[];
  usersError: string;
  usersLoading: boolean;
  onApplyUserFilters: (filters: AdminAccountFilters) => void;
  onResetUserFilters: () => void;
}) {
  const banned = mode === "banned";

  return (
    <>
      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>{banned ? "Banned users" : "Users"}</CardTitle>
              <CardDescription className="mt-2">{banned ? "Bans, active suspensions, same-IP suspicion flags, and lift actions." : "Server-backed fzf-style search, pagination, and admin actions."}</CardDescription>
            </div>
            <Badge variant="secondary">{totalUsers} {banned ? "restricted" : "total"}</Badge>
          </div>
        </CardHeader>
        <CardContent className={banned ? "space-y-4" : undefined}>
          {banned ? (
            <div className="flex flex-wrap gap-2">
              {(["restricted", "banned", "suspended"] as const).map((value) => (
                <Button key={value} type="button" variant={bannedStatusFilter === value ? "default" : "secondary"} onClick={() => onBannedStatusFilter(value)}>
                  {value === "restricted" ? "All" : value === "banned" ? "Banned" : "Suspended"}
                </Button>
              ))}
            </div>
          ) : null}
          <FilterBar className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <SearchInput value={search} onChange={(event: ChangeEvent<HTMLInputElement>) => onSearch(event.target.value)} onClear={() => onSearch("")} placeholder={banned ? "Search restricted users" : "FZF search users"} className="max-w-none" />
            <div className="flex w-full flex-wrap items-center justify-end gap-3 md:w-auto md:pr-2">
              <UserFilterSettings roles={roles} value={userFilters} onApply={onApplyUserFilters} onReset={onResetUserFilters} />
              <Select value={String(pageSize)} onValueChange={(value) => { onPageSize(Number(value)); onPage(1); }}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent className={ADMIN_PORTAL_CONTENT_CLASS}>
                  {[20, 50, 100].map((size) => <SelectItem key={size} value={String(size)}>{size} / page</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="button" variant="secondary" onClick={onRefresh}>Refresh</Button>
            </div>
          </FilterBar>
        </CardContent>
      </Card>

      <Card className="border-border bg-card text-card-foreground">
        <CardContent className="p-0">
          {usersLoading ? (
            <div className="flex min-h-48 items-center justify-center p-6"><Spinner label={banned ? "Loading banned users" : "Loading Users"} /></div>
          ) : usersError ? (
            <EmptyState title={banned ? "Could not load banned users" : "Could not load users"} description={usersError} action={<Button type="button" onClick={onRefresh}>Try again</Button>} />
          ) : (
            <DataTable className="admin-data-table admin-users-table" columns={userColumns} data={users} getRowKey={(user) => user.accountId} emptyTitle={banned ? "No banned or suspended users" : "No users found"} emptyDescription={banned ? "Restricted accounts will appear here." : "Try another search or filter."} />
          )}
        </CardContent>
      </Card>

      <Pagination>
        <PaginationContent>
          <PaginationItem><PaginationPrevious href="#" onClick={(event) => { event.preventDefault(); onPage((current) => Math.max(1, current - 1)); }} /></PaginationItem>
          <PaginationItem><PaginationLink href="#" isActive>{page} / {pageCount}</PaginationLink></PaginationItem>
          <PaginationItem><PaginationNext href="#" onClick={(event) => { event.preventDefault(); onPage((current) => Math.min(pageCount, current + 1)); }} /></PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
}
