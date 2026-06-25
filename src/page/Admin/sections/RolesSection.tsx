import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, Spinner } from "@aottg2/ui";
import type { RoleResponse } from "../../../auth/types";
import { ActionMenu } from "../components/ActionMenu";
import type { ActionMenuItem } from "../types";

export function RolesSection({
  canCreateRoles,
  canDeleteRoles,
  canDeleteSystemRoles,
  canReadRolePermissions,
  canUpdateRoles,
  canUpdateSystemRoles,
  onCreateRole,
  onDeleteRole,
  onEditRole,
  onRefresh,
  roles,
  rolesError,
  rolesLoading,
}: {
  canCreateRoles: boolean;
  canDeleteRoles: boolean;
  canDeleteSystemRoles: boolean;
  canReadRolePermissions: boolean;
  canUpdateRoles: boolean;
  canUpdateSystemRoles: boolean;
  onCreateRole: () => void;
  onDeleteRole: (role: RoleResponse) => void;
  onEditRole: (role: RoleResponse) => void;
  onRefresh: () => void;
  roles: RoleResponse[];
  rolesError: string;
  rolesLoading: boolean;
}) {
  return (
    <>
      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Roles</CardTitle>
              <CardDescription className="mt-2">Create roles and attach backend permissions.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={onRefresh}>Refresh</Button>
              {canCreateRoles ? <Button type="button" onClick={onCreateRole}>Create role</Button> : null}
            </div>
          </div>
        </CardHeader>
      </Card>

      {rolesLoading ? (
        <div className="flex min-h-48 items-center justify-center p-6"><Spinner label="Loading roles" /></div>
      ) : rolesError ? (
        <EmptyState title="Could not load roles" description={rolesError} action={<Button type="button" onClick={onRefresh}>Try again</Button>} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {roles.map((role) => {
            const items = [
              canUpdateRoles && (!role.isSystem || canUpdateSystemRoles) ? { label: "Edit role", onSelect: () => onEditRole(role) } : null,
              canDeleteRoles && (!role.isSystem || canDeleteSystemRoles) ? { label: "Delete role", onSelect: () => onDeleteRole(role), destructive: true } : null,
            ].filter((item): item is ActionMenuItem => item !== null);
            return (
              <Card key={role.name} className="border-border bg-card text-card-foreground">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <CardTitle className="truncate">{role.displayName}</CardTitle>
                      <CardDescription className="mt-1 font-mono text-xs">{role.name}</CardDescription>
                    </div>
                    <ActionMenu items={items} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {role.isSystem ? <Badge variant="outline">system</Badge> : <Badge variant="secondary">custom</Badge>}
                    {canReadRolePermissions ? <Badge variant="textured">{role.permissions.length} permissions</Badge> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{role.description || "No description."}</p>
                  {canReadRolePermissions ? (
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.length ? role.permissions.map((permission) => <Badge key={permission} variant="outline">{permission}</Badge>) : <span className="text-sm text-muted-foreground">No permissions.</span>}
                    </div>
                  ) : <p className="text-sm text-muted-foreground">Permission details hidden.</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
