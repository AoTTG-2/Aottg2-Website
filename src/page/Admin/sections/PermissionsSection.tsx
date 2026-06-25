import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, Spinner } from "@aottg2/ui";
import type { PermissionResponse } from "../../../auth/types";

export function PermissionsSection({
  permissions,
  permissionsError,
  permissionsLoading,
  onRefresh,
}: {
  permissions: PermissionResponse[];
  permissionsError: string;
  permissionsLoading: boolean;
  onRefresh: () => void;
}) {
  const permissionGroups = permissions.reduce<Record<string, PermissionResponse[]>>((groups, permission) => {
    (groups[permission.category] ??= []).push(permission);
    return groups;
  }, {});

  return (
    <>
      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Permissions</CardTitle>
              <CardDescription className="mt-2">Read-only backend permission catalog.</CardDescription>
            </div>
            <Button type="button" variant="secondary" onClick={onRefresh}>Refresh</Button>
          </div>
        </CardHeader>
      </Card>

      {permissionsLoading ? (
        <div className="flex min-h-48 items-center justify-center p-6"><Spinner label="Loading permissions" /></div>
      ) : permissionsError ? (
        <EmptyState title="Could not load permissions" description={permissionsError} action={<Button type="button" onClick={onRefresh}>Try again</Button>} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {Object.entries(permissionGroups).map(([category, group]) => (
            <Card key={category} className="border-border bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="capitalize">{category}</CardTitle>
                <CardDescription>{group.length} permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.map((permission) => (
                  <div key={permission.key} className="space-y-1 rounded-md border border-border p-3">
                    <Badge variant="outline">{permission.key}</Badge>
                    <p className="text-sm text-muted-foreground">{permission.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
