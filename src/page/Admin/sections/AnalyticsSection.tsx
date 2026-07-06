import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Spinner, StatCard } from "@aottg2/ui";
import type { AdminAnalyticsResponse } from "../../../auth/types";
import { formatCount, usagePercent } from "../utils/format";

const chartColors = {
  primary: "hsl(var(--primary))",
  textured: "hsl(var(--ring))",
  muted: "hsl(var(--muted-foreground))",
  border: "hsl(var(--border))",
  card: "hsl(var(--card))",
  foreground: "hsl(var(--foreground))",
  destructive: "hsl(var(--destructive))",
};

const tooltipStyle = {
  backgroundColor: chartColors.card,
  border: `1px solid ${chartColors.border}`,
  color: chartColors.foreground,
};

const dayOptions = [7, 30, 60, 90];

export function AnalyticsSection({
  analytics,
  analyticsDays,
  analyticsError,
  analyticsLoading,
  onDays,
  onRefresh,
}: {
  analytics: AdminAnalyticsResponse | null;
  analyticsDays: number;
  analyticsError: string;
  analyticsLoading: boolean;
  onDays: (days: number) => void;
  onRefresh: () => void;
}) {
  const verifiedPercent = analytics ? usagePercent(analytics.totals.verifiedAccounts, analytics.totals.totalAccounts) : 0;
  const verificationData = analytics ? [
    { key: "Verified", count: analytics.totals.verifiedAccounts },
    { key: "Unverified", count: analytics.totals.unverifiedAccounts },
  ] : [];
  const loginMethods = analytics?.loginMethodDistribution.map((item) => ({
    ...item,
    label: loginMethodLabel(item.key),
  })) ?? [];

  return (
    <>
      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Analytics</CardTitle>
              <CardDescription className="mt-2">Read-only account, signup, role, login-method, and audit aggregates.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={String(analyticsDays)} onValueChange={(value) => onDays(Number(value))}>
                <SelectTrigger className="w-32"><SelectValue aria-label={`${analyticsDays} days`} /></SelectTrigger>
                <SelectContent>
                  {dayOptions.map((days) => <SelectItem key={days} value={String(days)}>{days} days</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="button" variant="secondary" onClick={onRefresh}>Refresh</Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {analyticsLoading ? (
        <div className="flex min-h-48 items-center justify-center p-6"><Spinner label="Loading analytics" /></div>
      ) : analyticsError ? (
        <EmptyState title="Could not load analytics" description={analyticsError} action={<Button type="button" onClick={onRefresh}>Try again</Button>} />
      ) : analytics ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Accounts" value={formatCount(analytics.totals.totalAccounts)} hint={`${formatCount(analytics.totals.activeAccounts)} active`} />
            <StatCard label="Verified" value={`${verifiedPercent}%`} hint={`${formatCount(analytics.totals.verifiedAccounts)} verified, ${formatCount(analytics.totals.unverifiedAccounts)} unverified`} />
            <StatCard label="Restricted" value={formatCount(analytics.totals.bannedAccounts + analytics.totals.suspendedAccounts)} hint={`${formatCount(analytics.totals.bannedAccounts)} banned, ${formatCount(analytics.totals.suspendedAccounts)} suspended`} />
            <StatCard label="Signup IPs" value={formatCount(analytics.totals.uniqueSignupIps)} hint={`${formatCount(analytics.totals.sharedSignupIpAccounts)} accounts share signup IPs`} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Account growth" description={`${analytics.days} day cumulative account count.`}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={analytics.registrationsByDay} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} stroke={chartColors.muted} tickLine={false} />
                  <YAxis stroke={chartColors.muted} tickLine={false} allowDecimals={false} tickFormatter={formatCount} width={44} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={formatLongDate} formatter={formatTooltipCount} />
                  <Area type="monotone" dataKey="cumulativeAccounts" name="Accounts" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.18} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Daily registrations" description="New accounts, verified new accounts, and unique signup IPs per day.">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analytics.registrationsByDay} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} stroke={chartColors.muted} tickLine={false} />
                  <YAxis stroke={chartColors.muted} tickLine={false} allowDecimals={false} tickFormatter={formatCount} width={44} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={formatLongDate} formatter={formatTooltipCount} />
                  <Legend />
                  <Bar dataKey="newAccounts" name="New accounts" fill={chartColors.primary} />
                  <Bar dataKey="verifiedNewAccounts" name="Verified" fill={chartColors.textured} />
                  <Bar dataKey="uniqueSignupIps" name="Signup IPs" fill={chartColors.muted} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Verification split" description="Current verified and unverified account counts.">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={verificationData} dataKey="count" nameKey="key" innerRadius={58} outerRadius={92} paddingAngle={3}>
                    {verificationData.map((item) => (
                      <Cell key={item.key} fill={item.key === "Verified" ? chartColors.primary : chartColors.destructive} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={formatTooltipCount} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Role distribution" description="Current accounts per role.">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={analytics.roleDistribution} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" />
                  <XAxis dataKey="key" tickFormatter={truncateLabel} stroke={chartColors.muted} tickLine={false} />
                  <YAxis stroke={chartColors.muted} tickLine={false} allowDecimals={false} tickFormatter={formatCount} width={44} />
                  <Tooltip contentStyle={tooltipStyle} formatter={formatTooltipCount} />
                  <Bar dataKey="count" name="Accounts" fill={chartColors.primary} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Login methods" description="Accounts linked to each auth provider.">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={loginMethods} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke={chartColors.muted} tickLine={false} />
                  <YAxis stroke={chartColors.muted} tickLine={false} allowDecimals={false} tickFormatter={formatCount} width={44} />
                  <Tooltip contentStyle={tooltipStyle} formatter={formatTooltipCount} />
                  <Bar dataKey="count" name="Accounts" fill={chartColors.textured} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Audit activity" description="Audit event volume over selected period.">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={analytics.auditActivityByDay} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} stroke={chartColors.muted} tickLine={false} />
                  <YAxis stroke={chartColors.muted} tickLine={false} allowDecimals={false} tickFormatter={formatCount} width={44} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={formatLongDate} formatter={formatTooltipCount} />
                  <Line type="monotone" dataKey="count" name="Events" stroke={chartColors.primary} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Top audit events" description="Most common event types across all saved audit history.">
            {analytics.topAuditEvents.length ? (
              <ResponsiveContainer width="100%" height={Math.max(260, analytics.topAuditEvents.length * 42)}>
                <BarChart layout="vertical" data={analytics.topAuditEvents} margin={{ left: 128, right: 16, top: 8, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" />
                  <XAxis type="number" stroke={chartColors.muted} tickLine={false} allowDecimals={false} tickFormatter={formatCount} />
                  <YAxis type="category" dataKey="key" stroke={chartColors.muted} tickLine={false} width={150} tickFormatter={truncateEventLabel} />
                  <Tooltip contentStyle={tooltipStyle} formatter={formatTooltipCount} />
                  <Bar dataKey="count" name="Events" fill={chartColors.primary} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No audit events yet" description="Audit activity appears here after account or admin events are recorded." />
            )}
          </ChartCard>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">No email metrics</Badge>
            <Badge variant="outline">No Patreon metrics</Badge>
            <Badge variant="outline">Signup IPs only</Badge>
          </div>
        </>
      ) : null}
    </>
  );
}

function ChartCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card className="min-w-0 border-border bg-card text-card-foreground">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function loginMethodLabel(key: string) {
  if (key === "local") return "Email";
  if (key === "discord") return "Discord";
  if (key === "google") return "Google";
  return key;
}

function formatShortDate(value: string) {
  return formatDateValue(value, { month: "short", day: "numeric" });
}

function formatLongDate(value: unknown) {
  return formatDateValue(String(value ?? ""), { dateStyle: "medium" });
}

function formatDateValue(value: string, options: Intl.DateTimeFormatOptions) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, options).format(date);
}

function formatTooltipCount(value: unknown) {
  return typeof value === "number" ? formatCount(value) : String(value ?? "");
}

function truncateLabel(value: string) {
  return value.length > 14 ? `${value.slice(0, 13)}...` : value;
}

function truncateEventLabel(value: string) {
  return value.length > 24 ? `${value.slice(0, 23)}...` : value;
}
