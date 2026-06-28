import { useState } from "react";
import { FiArrowDown, FiArrowUp, FiTrash2 } from "react-icons/fi";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, ConfirmDialog, DataTable, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, EmptyState, Input, Label, Spinner } from "@aottg2/ui";
import type { AdminCreditCategory } from "../../../auth/creditsTypes";
import type { ProfileResponse } from "../../../auth/types";

type ContributorRow = AdminCreditCategory["contributors"][number] & { contributorIndex: number };

export function CreditsSection({
  canReadUsers,
  canUpdate,
  draft,
  error,
  loading,
  saving,
  userResults,
  userSearch,
  userSearchLoading,
  onAddCategory,
  onAddContributor,
  onDeleteCategory,
  onDeleteContributor,
  onLinkContributor,
  onMoveCategory,
  onMoveContributor,
  onRefresh,
  onSave,
  onSearchUsers,
  onSetCategoryName,
  onSetContributorName,
  onSetUserSearch,
  onUnlinkContributor,
}: {
  canReadUsers: boolean;
  canUpdate: boolean;
  draft: AdminCreditCategory[];
  error: string;
  loading: boolean;
  saving: boolean;
  userResults: ProfileResponse[];
  userSearch: string;
  userSearchLoading: boolean;
  onAddCategory: () => void;
  onAddContributor: (categoryIndex: number) => void;
  onDeleteCategory: (categoryIndex: number) => void;
  onDeleteContributor: (categoryIndex: number, contributorIndex: number) => void;
  onLinkContributor: (categoryIndex: number, contributorIndex: number, user: ProfileResponse) => void;
  onMoveCategory: (categoryIndex: number, direction: -1 | 1) => void;
  onMoveContributor: (categoryIndex: number, contributorIndex: number, direction: -1 | 1) => void;
  onRefresh: () => void;
  onSave: () => void;
  onSearchUsers: () => void;
  onSetCategoryName: (categoryIndex: number, name: string) => void;
  onSetContributorName: (categoryIndex: number, contributorIndex: number, name: string) => void;
  onSetUserSearch: (value: string) => void;
  onUnlinkContributor: (categoryIndex: number, contributorIndex: number) => void;
}) {
  const [linkTarget, setLinkTarget] = useState<{ categoryIndex: number; contributorIndex: number } | null>(null);
  const [unlinkTarget, setUnlinkTarget] = useState<{ categoryIndex: number; contributorIndex: number } | null>(null);

  return (
    <>
      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Credits</CardTitle>
              <CardDescription className="mt-2">Categories and contributor display names for the public credits page.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={onRefresh}>Refresh</Button>
              {canUpdate ? <Button type="button" onClick={onAddCategory}>Add category</Button> : null}
            </div>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center p-6"><Spinner label="Loading credits" /></div>
      ) : error ? (
        <EmptyState title="Could not load credits" description={error} action={<Button type="button" onClick={onRefresh}>Try again</Button>} />
      ) : (
        <>
          {draft.length ? draft.map((category, categoryIndex) => (
            <Card key={category.id} className="border-border bg-card text-card-foreground">
              <CardHeader className="p-4">
                <div className="grid gap-2 lg:grid-cols-[7rem_minmax(0,1fr)_auto] lg:items-center">
                  <Label className="text-sm font-semibold" htmlFor={`credit-category-${category.id}`}>Category</Label>
                  <Input id={`credit-category-${category.id}`} className="h-10" value={category.name} disabled={!canUpdate || saving} onChange={(event) => onSetCategoryName(categoryIndex, event.target.value)} />
                  {canUpdate ? (
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="secondary" size="icon" disabled={categoryIndex === 0 || saving} onClick={() => onMoveCategory(categoryIndex, -1)} aria-label="Move category up"><FiArrowUp /></Button>
                      <Button type="button" variant="secondary" size="icon" disabled={categoryIndex === draft.length - 1 || saving} onClick={() => onMoveCategory(categoryIndex, 1)} aria-label="Move category down"><FiArrowDown /></Button>
                      <Button type="button" variant="destructive" size="icon" disabled={saving} onClick={() => onDeleteCategory(categoryIndex)} aria-label="Delete category"><FiTrash2 /></Button>
                    </div>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4">
                <DataTable
                  className="admin-data-table"
                  data={category.contributors.map((contributor, contributorIndex) => ({ ...contributor, contributorIndex }))}
                  getRowKey={(contributor) => contributor.id}
                  emptyTitle="No contributors"
                  emptyDescription="Add a contributor to this category."
                  columns={[
                    {
                      key: "name",
                      header: "Contributor",
                      cell: (contributor: ContributorRow) => (
                        <Input
                          className="h-9 min-w-56"
                          value={contributor.name}
                          disabled={!canUpdate || saving}
                          onChange={(event) => onSetContributorName(categoryIndex, contributor.contributorIndex, event.target.value)}
                        />
                      ),
                    },
                    {
                      key: "link",
                      header: "Link",
                      cell: (contributor: ContributorRow) => contributor.accountId
                        ? <Badge variant="textured">{contributor.accountDisplayName ?? contributor.name}</Badge>
                        : <Badge variant="outline">String only</Badge>,
                    },
                    {
                      key: "actions",
                      header: "",
                      className: "w-0",
                      cell: (contributor: ContributorRow) => canUpdate ? (
                        <div className="flex flex-nowrap justify-end gap-2">
                          <Button type="button" variant="secondary" size="icon" disabled={contributor.contributorIndex === 0 || saving} onClick={() => onMoveContributor(categoryIndex, contributor.contributorIndex, -1)} aria-label="Move contributor up"><FiArrowUp /></Button>
                          <Button type="button" variant="secondary" size="icon" disabled={contributor.contributorIndex === category.contributors.length - 1 || saving} onClick={() => onMoveContributor(categoryIndex, contributor.contributorIndex, 1)} aria-label="Move contributor down"><FiArrowDown /></Button>
                          {contributor.accountId ? (
                            <Button type="button" variant="destructive" disabled={saving} onClick={() => setUnlinkTarget({ categoryIndex, contributorIndex: contributor.contributorIndex })}>Unlink</Button>
                          ) : canReadUsers ? (
                            <Button type="button" variant="secondary" disabled={saving} onClick={() => setLinkTarget({ categoryIndex, contributorIndex: contributor.contributorIndex })}>Link</Button>
                          ) : null}
                          <Button type="button" variant="destructive" size="icon" disabled={saving} onClick={() => onDeleteContributor(categoryIndex, contributor.contributorIndex)} aria-label="Delete contributor"><FiTrash2 /></Button>
                        </div>
                      ) : null,
                    },
                  ]}
                />
                {canUpdate ? <Button type="button" variant="secondary" disabled={saving} onClick={() => onAddContributor(categoryIndex)}>Add contributor</Button> : null}
              </CardContent>
            </Card>
          )) : (
            <EmptyState title="No credits yet" description="Add a category to start." action={canUpdate ? <Button type="button" onClick={onAddCategory}>Add category</Button> : undefined} />
          )}

          {canUpdate ? <Button type="button" className="w-full" disabled={saving} onClick={onSave}>{saving ? "Saving..." : "Save credits"}</Button> : null}

          <Dialog open={linkTarget !== null} onOpenChange={(open) => !open && setLinkTarget(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Link user</DialogTitle>
                <DialogDescription>Search accounts and link one to this contributor.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input value={userSearch} placeholder="Search users" onChange={(event) => onSetUserSearch(event.target.value)} />
                  <Button type="button" variant="secondary" disabled={userSearchLoading || !userSearch.trim()} onClick={onSearchUsers}>{userSearchLoading ? "Searching..." : "Search"}</Button>
                </div>
                <div className="space-y-2">
                  {userResults.length ? userResults.map((user) => (
                    <Button
                      key={user.accountId}
                      type="button"
                      variant="secondary"
                      className="w-full justify-start"
                      disabled={saving || linkTarget === null}
                      onClick={() => {
                        if (!linkTarget) return;
                        onLinkContributor(linkTarget.categoryIndex, linkTarget.contributorIndex, user);
                        setLinkTarget(null);
                      }}
                    >
                      {user.displayName}
                    </Button>
                  )) : <EmptyState title="No users selected" description="Search to find an account." />}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <ConfirmDialog
            open={unlinkTarget !== null}
            onOpenChange={(open) => !open && setUnlinkTarget(null)}
            title="Unlink user?"
            description="This removes the account link from this contributor. The contributor text stays saved."
            confirmLabel="Unlink"
            destructive
            onConfirm={() => {
              if (!unlinkTarget) return;
              onUnlinkContributor(unlinkTarget.categoryIndex, unlinkTarget.contributorIndex);
              setUnlinkTarget(null);
            }}
          />
        </>
      )}
    </>
  );
}
