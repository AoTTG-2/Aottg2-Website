import { useState } from "react";
import { FiArrowDown, FiArrowUp, FiTrash2 } from "react-icons/fi";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, ConfirmDialog, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, EmptyState, Input, Label, Spinner } from "@aottg2/ui";
import type { AdminCreditCategory } from "../../../auth/creditsTypes";
import type { ProfileResponse } from "../../../auth/types";
import { CreditContributorTable } from "../components/CreditContributorTable";
import type { CreditContributorTarget } from "../hooks/useAdminCredits";

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
  onAddGroup,
  onDeleteCategory,
  onDeleteContributor,
  onDeleteGroup,
  onLinkContributor,
  onMoveCategory,
  onMoveContributor,
  onMoveGroup,
  onRefresh,
  onSave,
  onSearchUsers,
  onSetCategoryDescription,
  onSetCategoryName,
  onSetContributorName,
  onSetGroupTitle,
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
  onAddContributor: (categoryIndex: number, groupIndex?: number) => void;
  onAddGroup: (categoryIndex: number) => void;
  onDeleteCategory: (categoryIndex: number) => void;
  onDeleteContributor: (target: CreditContributorTarget) => void;
  onDeleteGroup: (categoryIndex: number, groupIndex: number) => void;
  onLinkContributor: (target: CreditContributorTarget, user: ProfileResponse) => void;
  onMoveCategory: (categoryIndex: number, direction: -1 | 1) => void;
  onMoveContributor: (target: CreditContributorTarget, direction: -1 | 1) => void;
  onMoveGroup: (categoryIndex: number, groupIndex: number, direction: -1 | 1) => void;
  onRefresh: () => void;
  onSave: () => void;
  onSearchUsers: () => void;
  onSetCategoryDescription: (categoryIndex: number, description: string) => void;
  onSetCategoryName: (categoryIndex: number, name: string) => void;
  onSetContributorName: (target: CreditContributorTarget, name: string) => void;
  onSetGroupTitle: (categoryIndex: number, groupIndex: number, title: string) => void;
  onSetUserSearch: (value: string) => void;
  onUnlinkContributor: (target: CreditContributorTarget) => void;
}) {
  const [linkTarget, setLinkTarget] = useState<CreditContributorTarget | null>(null);
  const [unlinkTarget, setUnlinkTarget] = useState<CreditContributorTarget | null>(null);

  return (
    <>
      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Credits</CardTitle>
              <CardDescription className="mt-2">Public credits grouped by category, role, and contributor display name.</CardDescription>
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
              <CardHeader className="space-y-4 p-4">
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
                <div className="grid gap-2 lg:grid-cols-[7rem_minmax(0,1fr)] lg:items-center">
                  <Label className="text-sm font-semibold" htmlFor={`credit-description-${category.id}`}>Description</Label>
                  <Input id={`credit-description-${category.id}`} className="h-10" value={category.description ?? ""} disabled={!canUpdate || saving} onChange={(event) => onSetCategoryDescription(categoryIndex, event.target.value)} />
                </div>
              </CardHeader>
              <CardContent className="space-y-5 px-4 pb-4">
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Category contributors</h3>
                  <CreditContributorTable
                    canReadUsers={canReadUsers}
                    canUpdate={canUpdate}
                    contributors={category.contributors}
                    saving={saving}
                    target={{ categoryIndex }}
                    onAddContributor={onAddContributor}
                    onDeleteContributor={onDeleteContributor}
                    onLinkTarget={setLinkTarget}
                    onMoveContributor={onMoveContributor}
                    onSetContributorName={onSetContributorName}
                    onUnlinkTarget={setUnlinkTarget}
                  />
                </section>

                <section className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Groups</h3>
                    {canUpdate ? <Button type="button" variant="secondary" disabled={saving} onClick={() => onAddGroup(categoryIndex)}>Add group</Button> : null}
                  </div>
                  {category.groups.length ? category.groups.map((group, groupIndex) => (
                    <div key={group.id} className="space-y-3 border border-border bg-background/40 p-3">
                      <div className="grid gap-2 lg:grid-cols-[5rem_minmax(0,1fr)_auto] lg:items-center">
                        <Label className="text-sm font-semibold" htmlFor={`credit-group-${group.id}`}>Role</Label>
                        <Input id={`credit-group-${group.id}`} className="h-10" value={group.title} disabled={!canUpdate || saving} onChange={(event) => onSetGroupTitle(categoryIndex, groupIndex, event.target.value)} />
                        {canUpdate ? (
                          <div className="flex flex-wrap gap-2">
                            <Button type="button" variant="secondary" size="icon" disabled={groupIndex === 0 || saving} onClick={() => onMoveGroup(categoryIndex, groupIndex, -1)} aria-label="Move group up"><FiArrowUp /></Button>
                            <Button type="button" variant="secondary" size="icon" disabled={groupIndex === category.groups.length - 1 || saving} onClick={() => onMoveGroup(categoryIndex, groupIndex, 1)} aria-label="Move group down"><FiArrowDown /></Button>
                            <Button type="button" variant="destructive" size="icon" disabled={saving} onClick={() => onDeleteGroup(categoryIndex, groupIndex)} aria-label="Delete group"><FiTrash2 /></Button>
                          </div>
                        ) : null}
                      </div>
                      <CreditContributorTable
                        canReadUsers={canReadUsers}
                        canUpdate={canUpdate}
                        contributors={group.contributors}
                        saving={saving}
                        target={{ categoryIndex, groupIndex }}
                        onAddContributor={onAddContributor}
                        onDeleteContributor={onDeleteContributor}
                        onLinkTarget={setLinkTarget}
                        onMoveContributor={onMoveContributor}
                        onSetContributorName={onSetContributorName}
                        onUnlinkTarget={setUnlinkTarget}
                      />
                    </div>
                  )) : <EmptyState title="No groups" description="Add role groups when a category has sub-sections." />}
                </section>
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
                        onLinkContributor(linkTarget, user);
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
              onUnlinkContributor(unlinkTarget);
              setUnlinkTarget(null);
            }}
          />
        </>
      )}
    </>
  );
}
