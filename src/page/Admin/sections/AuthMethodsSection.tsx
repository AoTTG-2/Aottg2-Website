import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, Spinner, Switch } from "@aottg2/ui";
import type { AuthMethodResponse } from "../../../auth/types";

export function AuthMethodsSection({
  canUpdate,
  draft,
  error,
  loading,
  saving,
  onRefresh,
  onSave,
  onSetEnabled,
}: {
  canUpdate: boolean;
  draft: AuthMethodResponse[];
  error: string;
  loading: boolean;
  saving: boolean;
  onRefresh: () => void;
  onSave: () => void;
  onSetEnabled: (key: string, enabled: boolean) => void;
}) {
  const allDisabled = draft.length > 0 && draft.every((method) => !method.enabled);

  return (
    <>
      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Auth methods</CardTitle>
              <CardDescription className="mt-2">Controls which sign-in methods are available.</CardDescription>
            </div>
            <Button type="button" variant="secondary" onClick={onRefresh}>Refresh</Button>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center p-6"><Spinner label="Loading auth methods" /></div>
      ) : error ? (
        <EmptyState title="Could not load auth methods" description={error} action={<Button type="button" onClick={onRefresh}>Try again</Button>} />
      ) : (
        <Card className="border-border bg-card text-card-foreground">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Available sign-in methods</CardTitle>
                <CardDescription className="mt-2">{canUpdate ? "Changes affect new auth attempts immediately." : "Read-only for this account."}</CardDescription>
              </div>
              <Badge variant={allDisabled ? "destructive" : "secondary"}>{allDisabled ? "All disabled" : "Active"}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {draft.map((method) => (
              <div key={method.key} className="flex items-center justify-between gap-4 rounded-md border border-border p-4">
                <div>
                  <div className="font-medium">{method.label}</div>
                  <div className="text-sm text-muted-foreground">{method.enabled ? "Visible and allowed" : "Hidden and blocked"}</div>
                </div>
                <Switch checked={method.enabled} disabled={!canUpdate || saving} onCheckedChange={(checked) => onSetEnabled(method.key, checked)} />
              </div>
            ))}
            {canUpdate ? <Button type="button" className="w-full" disabled={saving} onClick={onSave}>{saving ? "Saving..." : "Save auth methods"}</Button> : null}
          </CardContent>
        </Card>
      )}
    </>
  );
}
