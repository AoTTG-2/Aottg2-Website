import { Badge, Button, EmptyState, cn } from "@aottg2/ui";
import type { AdminCreditCategory } from "../../../auth/creditsTypes";

export type CreditEditorSelection =
  | { type: "category"; categoryId: string }
  | { type: "group"; categoryId: string; groupId: string };

export function CreditStructureOutline({
  canUpdate,
  categories,
  saving,
  selection,
  onAddCategory,
  onSelect,
}: {
  canUpdate: boolean;
  categories: AdminCreditCategory[];
  saving: boolean;
  selection: CreditEditorSelection | null;
  onAddCategory: () => void;
  onSelect: (selection: CreditEditorSelection) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Structure</h3>
          <p className="text-xs text-muted-foreground">{categories.length} categories</p>
        </div>
        {canUpdate ? <Button type="button" variant="secondary" disabled={saving} onClick={onAddCategory}>Add category</Button> : null}
      </div>

      {categories.length ? (
        <div className="space-y-2">
          {categories.map((category) => {
            const categorySelected = selection?.type === "category" && selection.categoryId === category.id;

            return (
              <div key={category.id} className="space-y-1">
                <button
                  type="button"
                  className={cn(
                    "w-full border border-border bg-background/40 p-3 text-left transition-colors hover:border-primary/70 hover:bg-background/70",
                    categorySelected && "border-primary bg-primary/10"
                  )}
                  onClick={() => onSelect({ type: "category", categoryId: category.id })}
                >
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-foreground">{category.name || "Untitled category"}</span>
                    <Badge variant="outline">{category.contributors.length}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="textured">{category.groups.length} groups</Badge>
                    {category.description ? <Badge variant="outline">description</Badge> : null}
                  </div>
                </button>

                {category.groups.length ? (
                  <div className="space-y-1 pl-4">
                    {category.groups.map((group) => {
                      const groupSelected = selection?.type === "group" && selection.groupId === group.id;
                      return (
                        <button
                          key={group.id}
                          type="button"
                          className={cn(
                            "w-full border border-border bg-background/30 px-3 py-2 text-left transition-colors hover:border-primary/70 hover:bg-background/70",
                            groupSelected && "border-primary bg-primary/10"
                          )}
                          onClick={() => onSelect({ type: "group", categoryId: category.id, groupId: group.id })}
                        >
                          <div className="flex min-w-0 items-center justify-between gap-3">
                            <span className="truncate text-sm text-foreground">{group.title || "Untitled group"}</span>
                            <Badge variant="outline">{group.contributors.length}</Badge>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No credits yet" description="Add a category to start." action={canUpdate ? <Button type="button" onClick={onAddCategory}>Add category</Button> : undefined} />
      )}
    </div>
  );
}
