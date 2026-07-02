import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, Input, Label, Spinner, Textarea } from "@aottg2/ui";
import type { ChangelogEntryResponse } from "../../../auth/changelogTypes";
import { formatAuditTimestamp } from "../utils/format";

export function ChangelogSection({
  canUpdate,
  contentMarkdown,
  entries,
  error,
  loading,
  saving,
  selected,
  version,
  onContentMarkdown,
  onDeleteDraft,
  onNewDraft,
  onPublish,
  onRefresh,
  onSave,
  onSelect,
  onUnpublish,
  onVersion,
}: {
  canUpdate: boolean;
  contentMarkdown: string;
  entries: ChangelogEntryResponse[];
  error: string;
  loading: boolean;
  saving: boolean;
  selected: ChangelogEntryResponse | null;
  version: string;
  onContentMarkdown: (value: string) => void;
  onDeleteDraft: () => void;
  onNewDraft: () => void;
  onPublish: () => void;
  onRefresh: () => void;
  onSave: () => void;
  onSelect: (entry: ChangelogEntryResponse) => void;
  onUnpublish: () => void;
  onVersion: (value: string) => void;
}) {
  const isPublished = selected?.publishedAt != null;

  return (
    <>
      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Changelog</CardTitle>
              <CardDescription className="mt-2">Game-facing release notes. Drafts stay private until published.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={onRefresh}>Refresh</Button>
              {canUpdate ? <Button type="button" onClick={onNewDraft}>New draft</Button> : null}
            </div>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center p-6"><Spinner label="Loading changelogs" /></div>
      ) : error ? (
        <EmptyState title="Could not load changelogs" description={error} action={<Button type="button" onClick={onRefresh}>Try again</Button>} />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[20rem_minmax(0,1fr)]">
          <Card className="border-border bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Entries</CardTitle>
              <CardDescription className="mt-2">{entries.length ? `${entries.length} saved` : "No saved changelogs."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {entries.length ? entries.map((entry) => (
                <Button
                  key={entry.id}
                  type="button"
                  variant={selected?.id === entry.id ? "default" : "secondary"}
                  className="h-auto w-full justify-start whitespace-normal text-left"
                  onClick={() => onSelect(entry)}
                >
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="font-semibold">{entry.version}</span>
                    <span className="text-xs opacity-80">{entry.publishedAt ? `Published ${formatAuditTimestamp(entry.publishedAt)}` : "Draft"}</span>
                  </span>
                </Button>
              )) : (
                <EmptyState title="No changelogs" description="Create a draft to start." />
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card text-card-foreground">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>{selected ? "Edit changelog" : "New draft"}</CardTitle>
                  <CardDescription className="mt-2">{selected ? `Updated ${formatAuditTimestamp(selected.updatedAt)}` : "Save creates a private draft."}</CardDescription>
                </div>
                <Badge variant={isPublished ? "textured" : "secondary"}>{isPublished ? "Published" : "Draft"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="changelog-version">Version</Label>
                <Input id="changelog-version" value={version} disabled={!canUpdate || saving} placeholder="1.0.0" onChange={(event) => onVersion(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="changelog-content">Content</Label>
                <Textarea
                  id="changelog-content"
                  className="min-h-80 font-mono text-sm"
                  value={contentMarkdown}
                  disabled={!canUpdate || saving}
                  placeholder={"## Highlights\n- Fixed login\n- Added new maps"}
                  spellCheck
                  onChange={(event) => onContentMarkdown(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {canUpdate ? <Button type="button" disabled={saving} onClick={onSave}>{saving ? "Saving..." : "Save draft"}</Button> : null}
                {canUpdate && selected && !isPublished ? <Button type="button" variant="secondary" disabled={saving} onClick={onPublish}>Publish</Button> : null}
                {canUpdate && selected && isPublished ? <Button type="button" variant="secondary" disabled={saving} onClick={onUnpublish}>Unpublish</Button> : null}
                {canUpdate && selected && !isPublished ? <Button type="button" variant="destructive" disabled={saving} onClick={onDeleteDraft}>Delete draft</Button> : null}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
