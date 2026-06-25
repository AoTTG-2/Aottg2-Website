import type { ChangeEvent } from "react";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, DataTable, EmptyState, FilterBar, Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, SearchInput, Spinner } from "@aottg2/ui";
import type { AuditEventResponse, RoleResponse } from "../../../auth/types";
import { AuditFilterSettings } from "../AuditFilterSettings";
import type { AuditAccountLookup, AuditAccountSummary, AuditViewMode } from "../types";
import { formatAuditAccount, renderAuditActivity } from "../utils/audit";
import { formatAuditTimestamp, formatDate } from "../utils/format";

export function AuditsSection({
  accountFilter,
  accountLookup,
  auditViewMode,
  auditsError,
  auditsLoading,
  auditsPage,
  auditsPageCount,
  auditsPageSize,
  auditsTotal,
  eventType,
  events,
  loadingUserSearch,
  onApplyUserSearch,
  onEventType,
  onPage,
  onPageSize,
  onRefresh,
  onResetFilters,
  onViewMode,
  roles,
  userSearch,
}: {
  accountFilter: AuditAccountSummary | null;
  accountLookup: AuditAccountLookup;
  auditViewMode: AuditViewMode;
  auditsError: string;
  auditsLoading: boolean;
  auditsPage: number;
  auditsPageCount: number;
  auditsPageSize: number;
  auditsTotal: number;
  eventType: string;
  events: AuditEventResponse[];
  loadingUserSearch: boolean;
  onApplyUserSearch: (query: string) => Promise<boolean>;
  onEventType: (value: string) => void;
  onPage: (page: number | ((current: number) => number)) => void;
  onPageSize: (pageSize: number) => void;
  onRefresh: () => void;
  onResetFilters: () => void;
  onViewMode: (mode: AuditViewMode) => void;
  roles: RoleResponse[];
  userSearch: string;
}) {
  const readableAuditColumns = [
    { key: "timestamp", header: "Timestamp", cell: (event: AuditEventResponse) => <span className="whitespace-nowrap tabular-nums">{formatAuditTimestamp(event.createdAt)}</span> },
    { key: "activity", header: "Activity", cell: (event: AuditEventResponse) => <div className="text-sm text-foreground">{renderAuditActivity(event, roles, accountLookup)}</div> },
  ];
  const technicalAuditColumns = [
    { key: "created", header: "Created", cell: (event: AuditEventResponse) => formatDate(event.createdAt) },
    { key: "event", header: "Event", cell: (event: AuditEventResponse) => <Badge variant="outline">{event.eventType}</Badge> },
    { key: "actor", header: "Actor", cell: (event: AuditEventResponse) => <span className="font-mono text-xs">{event.actorAccountId ?? "system"}</span> },
    { key: "target", header: "Target", cell: (event: AuditEventResponse) => <span className="font-mono text-xs">{event.targetAccountId ?? "—"}</span> },
    { key: "metadata", header: "Metadata", cell: (event: AuditEventResponse) => <span className="break-all font-mono text-xs text-muted-foreground">{event.metadataJson ?? "—"}</span> },
  ];
  const auditColumns = auditViewMode === "readable" ? readableAuditColumns : technicalAuditColumns;

  return (
    <>
      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Audit logs</CardTitle>
              <CardDescription className="mt-2">All audit events. Requires backend <code>audits.read</code>.</CardDescription>
            </div>
            <Badge variant="secondary">{auditsTotal} total</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <FilterBar className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <SearchInput value={eventType} onChange={(event: ChangeEvent<HTMLInputElement>) => onEventType(event.target.value)} onClear={() => onEventType("")} placeholder="Filter event type" className="max-w-none" />
            <div className="flex w-full flex-wrap items-center justify-end gap-3 md:w-auto md:pr-2">
              <AuditFilterSettings accountLabel={accountFilter ? formatAuditAccount(accountFilter, accountFilter.accountId) : undefined} loading={loadingUserSearch} onApplyUserSearch={onApplyUserSearch} onPageSizeChange={(nextPageSize) => { onPageSize(nextPageSize); onPage(1); }} onReset={onResetFilters} onViewModeChange={onViewMode} pageSize={auditsPageSize} userSearch={userSearch} viewMode={auditViewMode} />
              <Button type="button" variant="secondary" onClick={onRefresh}>Refresh</Button>
            </div>
          </FilterBar>
        </CardContent>
      </Card>

      <Card className="border-border bg-card text-card-foreground">
        <CardContent className="p-0">
          {auditsLoading ? (
            <div className="flex min-h-48 items-center justify-center p-6"><Spinner label="Loading audit logs" /></div>
          ) : auditsError ? (
            <EmptyState title="Could not load audit logs" description={auditsError} action={<Button type="button" onClick={onRefresh}>Try again</Button>} />
          ) : (
            <DataTable className="admin-data-table" columns={auditColumns} data={events} getRowKey={(event) => event.id} emptyTitle="No audit events" emptyDescription="Try another event type filter." />
          )}
        </CardContent>
      </Card>

      <Pagination>
        <PaginationContent>
          <PaginationItem><PaginationPrevious href="#" onClick={(event) => { event.preventDefault(); onPage((current) => Math.max(1, current - 1)); }} /></PaginationItem>
          <PaginationItem><PaginationLink href="#" isActive>{auditsPage} / {auditsPageCount}</PaginationLink></PaginationItem>
          <PaginationItem><PaginationNext href="#" onClick={(event) => { event.preventDefault(); onPage((current) => Math.min(auditsPageCount, current + 1)); }} /></PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
}
