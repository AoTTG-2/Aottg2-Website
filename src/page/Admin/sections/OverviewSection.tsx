import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, StatCard } from "@aottg2/ui";
import type { ProfileResponse } from "../../../auth/types";
import type { AdminPermissions, AdminSection } from "../types";

export function OverviewSection({ permissions, profile, onSection }: { permissions: AdminPermissions; profile: ProfileResponse | null; onSection: (section: AdminSection) => void }) {
  const items = [
    { title: "Users", description: "Search, inspect, edit, roles, delete.", section: "users" as AdminSection, visible: permissions.canReadUsers },
    { title: "Banned users", description: "Review bans, suspensions, and IP flags.", section: "banned" as AdminSection, visible: permissions.canReadUsers },
    { title: "Roles", description: "Create roles and set permissions.", section: "roles" as AdminSection, visible: permissions.canReadRoles },
    { title: "Permissions", description: "Read backend permission catalog.", section: "permissions" as AdminSection, visible: permissions.canReadPermissions },
    { title: "Audit logs", description: "Review account and admin audit events.", section: "audits" as AdminSection, visible: permissions.canReadAudits },
    { title: "Email Service", description: "Monitor SES usage and quota settings.", section: "emails" as AdminSection, visible: permissions.canReadEmails },
    { title: "Credits", description: "Manage public credits categories.", section: "credits" as AdminSection, visible: permissions.canReadCredits },
    { title: "Patreon", description: "Review live tiers and fallback labels.", section: "patreon" as AdminSection, visible: permissions.canReadPatreon },
    { title: "Changelog", description: "Create and publish game-facing release notes.", section: "changelog" as AdminSection, visible: permissions.canReadChangelogs },
  ].filter((item) => item.visible);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Access" value={permissions.isAdmin ? "Admin" : "Moderator"} hint={profile?.displayName ?? "Panel access"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.title} className="border-border bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" onClick={() => onSection(item.section)}>Open {item.title.toLowerCase()}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
