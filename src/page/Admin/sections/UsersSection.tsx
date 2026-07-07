import type { ChangeEvent, ReactNode } from "react";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, DataTable, EmptyState, FilterBar, Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, SearchInput, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Spinner } from "@aottg2/ui";
import type { AdminAccountFilters, AdminAccountSummaryResponse, AdminRestrictionStatusFilter, RoleResponse } from "../../../auth/types";
import { ADMIN_PORTAL_CONTENT_CLASS } from "../constants";
import { UserFilterSettings } from "../UserFilterSettings";

type UserColumn = {
  key: string;
  header: string;
  className?: string;
  cell: (user: AdminAccountSummaryResponse) => ReactNode;
};

export function UsersSection({
  mode,
  bannedStatusFilter,
  onBannedStatusFilter,
  onPage,
  onPageSize,
  onRefresh,
  onSearch,
  onSort,
  page,
  pageCount,
  pageSize,
  roles,
  search,
  sort,
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
  onSort: (value: string) => void;
  page: number;
  pageCount: number;
  pageSize: number;
  roles: RoleResponse[];
  search: string;
  sort: string;
  totalUsers: number;
  userColumns: UserColumn[];
  userFilters: AdminAccountFilters;
  users: AdminAccountSummaryResponse[];
  usersError: string;
  usersLoading: boolean;
  onApplyUserFilters: (filters: AdminAccountFilters) => void;
  onResetUserFilters: () => void;
}) {
  const banned = mode === "banned";

  return (
    <div className="admin-users-compact space-y-3">
      <Card className="admin-users-panel border-border bg-card text-card-foreground">
        <CardHeader className="admin-users-header">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>{banned ? "Banned users" : "Users"}</CardTitle>
              <CardDescription className="mt-1">{banned ? "Bans, suspensions, same-IP flags." : "Search account id, Photon id, email, IP, OAuth, character, guild."}</CardDescription>
            </div>
            <Badge variant="secondary">{totalUsers} {banned ? "restricted" : "total"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="admin-users-content space-y-2">
          {banned ? (
            <div className="flex flex-wrap gap-1.5">
              {(["restricted", "banned", "suspended"] as const).map((value) => (
                <Button key={value} type="button" size="sm" variant={bannedStatusFilter === value ? "default" : "secondary"} onClick={() => onBannedStatusFilter(value)}>
                  {value === "restricted" ? "All" : value === "banned" ? "Banned" : "Suspended"}
                </Button>
              ))}
            </div>
          ) : null}
          <FilterBar className="admin-users-toolbar grid grid-cols-1 gap-2 xl:grid-cols-[minmax(18rem,1fr)_auto]">
            <SearchInput value={search} onChange={(event: ChangeEvent<HTMLInputElement>) => onSearch(event.target.value)} onClear={() => onSearch("")} placeholder={banned ? "Search restricted users" : "Search account id, Photon id, email, IP, OAuth, character, guild"} className="max-w-none" />
            <div className="flex w-full flex-wrap items-center justify-end gap-2 xl:w-auto">
              <UserFilterSettings roles={roles} value={userFilters} onApply={onApplyUserFilters} onReset={onResetUserFilters} />
              <Select value={sort} onValueChange={(value) => { onSort(value); onPage(1); }}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent className={ADMIN_PORTAL_CONTENT_CLASS}>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
              <Select value={String(pageSize)} onValueChange={(value) => { onPageSize(Number(value)); onPage(1); }}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent className={ADMIN_PORTAL_CONTENT_CLASS}>
                  {[50, 100].map((size) => <SelectItem key={size} value={String(size)}>{size} rows</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="button" size="sm" variant="secondary" onClick={onRefresh}>Refresh</Button>
            </div>
          </FilterBar>

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
    </div>
  );
}
