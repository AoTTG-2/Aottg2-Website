import { EmptyState } from "@aottg2/ui";
import type { AdminCreditCategory } from "../../../auth/creditsTypes";

export function CreditPreviewTree({ categories }: { categories: AdminCreditCategory[] }) {
  if (!categories.length) {
    return <EmptyState title="No credits yet" description="Add categories and contributors to preview the tree." />;
  }

  return (
    <div className="space-y-5">
      {categories.map((category) => (
        <section key={category.id} className="border border-border bg-background/40 p-4">
          <h3 className="text-base font-semibold text-foreground">{category.name || "Untitled category"}</h3>
          {category.description ? <p className="mt-1 text-sm text-muted-foreground">{category.description}</p> : null}
          {category.contributors.length ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-foreground">
              {category.contributors.map((contributor) => <li key={contributor.id}>{contributor.name}</li>)}
            </ul>
          ) : null}
          {category.groups.length ? (
            <div className="mt-4 space-y-3 border-l border-border pl-4">
              {category.groups.map((group) => (
                <section key={group.id}>
                  <h4 className="text-sm font-semibold text-foreground">{group.title || "Untitled subcategory"}</h4>
                  {group.description ? <p className="mt-1 text-xs text-muted-foreground">{group.description}</p> : null}
                  {group.contributors.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                      {group.contributors.map((contributor) => <li key={contributor.id}>{contributor.name}</li>)}
                    </ul>
                  ) : <p className="mt-2 text-xs text-muted-foreground">No contributors assigned.</p>}
                </section>
              ))}
            </div>
          ) : null}
          {!category.contributors.length && !category.groups.length ? <p className="mt-3 text-xs text-muted-foreground">No contributors assigned.</p> : null}
        </section>
      ))}
    </div>
  );
}
