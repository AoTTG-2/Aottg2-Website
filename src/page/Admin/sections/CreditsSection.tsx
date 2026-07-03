import { useEffect, useState } from "react";
import { FiArrowDown, FiArrowLeft, FiArrowUp, FiTrash2 } from "react-icons/fi";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, Input, Label, Spinner, Textarea, cn } from "@aottg2/ui";
import type { AdminCreditCategory } from "../../../auth/creditsTypes";
import type { ProfileResponse } from "../../../auth/types";
import { CreditContributorAssignments } from "../components/CreditContributorAssignments";
import { CreditPreviewTree } from "../components/CreditPreviewTree";
import { CreditStructureOutline, type CreditEditorSelection } from "../components/CreditStructureOutline";

type CreditsTab = "structure" | "contributors" | "preview";

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
  onAddGroup,
  onDeleteCategory,
  onDeleteGroup,
  onDraft,
  onMoveCategory,
  onMoveGroup,
  onRefresh,
  onReorderCategory,
  onReorderGroup,
  onSave,
  onSearchUsers,
  onSetCategoryDescription,
  onSetCategoryName,
  onSetGroupTitle,
  onSetUserSearch,
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
  onAddCategory: () => string;
  onAddGroup: (categoryIndex: number) => string;
  onDeleteCategory: (categoryIndex: number) => void;
  onDeleteGroup: (categoryIndex: number, groupIndex: number) => void;
  onDraft: (categories: AdminCreditCategory[]) => void;
  onMoveCategory: (categoryIndex: number, direction: -1 | 1) => void;
  onMoveGroup: (categoryIndex: number, groupIndex: number, direction: -1 | 1) => void;
  onRefresh: () => void;
  onReorderCategory: (activeCategoryId: string, overCategoryId: string) => void;
  onReorderGroup: (categoryId: string, activeGroupId: string, overGroupId: string) => void;
  onSave: () => void;
  onSearchUsers: () => void;
  onSetCategoryDescription: (categoryIndex: number, description: string) => void;
  onSetCategoryName: (categoryIndex: number, name: string) => void;
  onSetGroupTitle: (categoryIndex: number, groupIndex: number, title: string) => void;
  onSetUserSearch: (value: string) => void;
}) {
  const [tab, setTab] = useState<CreditsTab>("structure");
  const [selection, setSelection] = useState<CreditEditorSelection | null>(null);

  useEffect(() => {
    if (!draft.length) {
      if (selection) setSelection(null);
      return;
    }

    if (!selection) {
      setSelection({ type: "category", categoryId: draft[0].id });
      return;
    }

    const category = draft.find((item) => item.id === selection.categoryId);
    if (!category) {
      setSelection({ type: "category", categoryId: draft[0].id });
      return;
    }

    if (selection.type === "group" && !category.groups.some((group) => group.id === selection.groupId)) {
      setSelection({ type: "category", categoryId: category.id });
    }
  }, [draft, selection]);

  const selectedCategoryIndex = selection ? draft.findIndex((category) => category.id === selection.categoryId) : -1;
  const selectedCategory = selectedCategoryIndex >= 0 ? draft[selectedCategoryIndex] : null;
  const selectedGroupIndex = selection?.type === "group" && selectedCategory
    ? selectedCategory.groups.findIndex((group) => group.id === selection.groupId)
    : -1;
  const selectedGroup = selectedGroupIndex >= 0 ? selectedCategory?.groups[selectedGroupIndex] ?? null : null;
  const editingGroup = selection?.type === "group" && selectedGroup !== null;

  function addCategoryAndSelect() {
    const categoryId = onAddCategory();
    setSelection({ type: "category", categoryId });
    setTab("structure");
  }

  function addGroupAndSelect() {
    if (!selectedCategory || selectedCategoryIndex < 0) return;
    const groupId = onAddGroup(selectedCategoryIndex);
    setSelection({ type: "group", categoryId: selectedCategory.id, groupId });
  }

  function deleteSelection() {
    if (!selectedCategory || selectedCategoryIndex < 0 || !selection) return;
    if (editingGroup && selectedGroupIndex >= 0) {
      onDeleteGroup(selectedCategoryIndex, selectedGroupIndex);
      setSelection({ type: "category", categoryId: selectedCategory.id });
      return;
    }
    onDeleteCategory(selectedCategoryIndex);
  }

  function moveSelection(direction: -1 | 1) {
    if (!selectedCategory || selectedCategoryIndex < 0) return;
    if (editingGroup && selectedGroupIndex >= 0) {
      onMoveGroup(selectedCategoryIndex, selectedGroupIndex, direction);
      return;
    }
    onMoveCategory(selectedCategoryIndex, direction);
  }

  const moveUpDisabled = editingGroup ? selectedGroupIndex <= 0 : selectedCategoryIndex <= 0;
  const moveDownDisabled = editingGroup
    ? !selectedCategory || selectedGroupIndex >= selectedCategory.groups.length - 1
    : selectedCategoryIndex >= draft.length - 1;

  return (
    <>
      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Credits</CardTitle>
              <CardDescription className="mt-2">Build the tree first, then assign people to one or more places.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={onRefresh}>Refresh</Button>
              {canUpdate ? <Button type="button" onClick={addCategoryAndSelect}>Add category</Button> : null}
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
          <div className="flex flex-wrap gap-2">
            <CreditTabButton active={tab === "structure"} onClick={() => setTab("structure")}>Structure</CreditTabButton>
            <CreditTabButton active={tab === "contributors"} onClick={() => setTab("contributors")}>Contributors</CreditTabButton>
            <CreditTabButton active={tab === "preview"} onClick={() => setTab("preview")}>Preview</CreditTabButton>
          </div>

          {tab === "structure" ? (
            <div className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
              <Card className="border-border bg-card text-card-foreground">
                <CardContent className="p-4">
                  <CreditStructureOutline
                    canUpdate={canUpdate}
                    categories={draft}
                    saving={saving}
                    selection={selection}
                    onAddCategory={addCategoryAndSelect}
                    onReorderCategory={onReorderCategory}
                    onReorderGroup={onReorderGroup}
                    onSelect={setSelection}
                  />
                </CardContent>
              </Card>

              <Card className="min-w-0 border-border bg-card text-card-foreground">
                <CardHeader className="space-y-4 p-4">
                  {selectedCategory ? (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle>{editingGroup ? "Edit subcategory" : "Edit category"}</CardTitle>
                            <Badge variant="outline">{editingGroup ? selectedGroup?.contributors.length ?? 0 : selectedCategory.groups.length} {editingGroup ? "contributors" : "subcats"}</Badge>
                          </div>
                          <CardDescription className="mt-2">
                            {editingGroup ? `Inside ${selectedCategory.name || "Untitled category"}` : "Categories hold descriptions and optional subcategories."}
                          </CardDescription>
                        </div>
                        {canUpdate ? (
                          <div className="flex flex-wrap gap-2">
                            {editingGroup ? <Button type="button" variant="secondary" size="icon" title="Back to category" onClick={() => setSelection({ type: "category", categoryId: selectedCategory.id })}><FiArrowLeft /></Button> : null}
                            <Button type="button" variant="secondary" size="icon" disabled={moveUpDisabled || saving} title="Move up" onClick={() => moveSelection(-1)}><FiArrowUp /></Button>
                            <Button type="button" variant="secondary" size="icon" disabled={moveDownDisabled || saving} title="Move down" onClick={() => moveSelection(1)}><FiArrowDown /></Button>
                            <Button type="button" variant="destructive" size="icon" disabled={saving} title={editingGroup ? "Delete subcategory" : "Delete category"} onClick={deleteSelection}><FiTrash2 /></Button>
                          </div>
                        ) : null}
                      </div>

                      {editingGroup && selectedGroup ? (
                        <div className="space-y-2">
                          <Label htmlFor={`credit-group-${selectedGroup.id}`}>Subcategory</Label>
                          <Input id={`credit-group-${selectedGroup.id}`} value={selectedGroup.title} disabled={!canUpdate || saving} onChange={(event) => onSetGroupTitle(selectedCategoryIndex, selectedGroupIndex, event.target.value)} />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                            <div className="space-y-2">
                              <Label htmlFor={`credit-category-${selectedCategory.id}`}>Category</Label>
                              <Input id={`credit-category-${selectedCategory.id}`} value={selectedCategory.name} disabled={!canUpdate || saving} onChange={(event) => onSetCategoryName(selectedCategoryIndex, event.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`credit-description-${selectedCategory.id}`}>Description</Label>
                              <Textarea id={`credit-description-${selectedCategory.id}`} className="min-h-20" value={selectedCategory.description ?? ""} disabled={!canUpdate || saving} onChange={(event) => onSetCategoryDescription(selectedCategoryIndex, event.target.value)} />
                            </div>
                          </div>
                          {canUpdate ? <Button type="button" variant="secondary" disabled={saving} onClick={addGroupAndSelect}>Add subcategory</Button> : null}
                        </div>
                      )}
                    </>
                  ) : (
                    <EmptyState title="Select a category" description="Add or choose a category from the structure panel." />
                  )}
                </CardHeader>
              </Card>
            </div>
          ) : tab === "contributors" ? (
            <Card className="border-border bg-card text-card-foreground">
              <CardContent className="p-4">
                <CreditContributorAssignments
                  canReadUsers={canReadUsers}
                  canUpdate={canUpdate}
                  categories={draft}
                  saving={saving}
                  userResults={userResults}
                  userSearch={userSearch}
                  userSearchLoading={userSearchLoading}
                  onDraft={onDraft}
                  onSearchUsers={onSearchUsers}
                  onSetUserSearch={onSetUserSearch}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription className="mt-2">Simple tree view of the public credits order.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <CreditPreviewTree categories={draft} />
              </CardContent>
            </Card>
          )}

          {canUpdate ? (
            <div className="sticky bottom-4 z-10 flex justify-end border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
              <Button type="button" disabled={saving} onClick={onSave}>{saving ? "Saving..." : "Save credits"}</Button>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}

function CreditTabButton({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "secondary"}
      className={cn("min-w-36", active && "pointer-events-none")}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
