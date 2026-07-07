import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, Input, Label, Spinner, StatCard, Textarea } from "@aottg2/ui";
import type { EmailLimitStatusResponse } from "../../../auth/types";
import { formatAuditTimestamp, formatCount, formatDate, usagePercent } from "../utils/format";

export function EmailSection({
  blockedDomains,
  blockedDomainsDraft,
  canUpdateEmails,
  dailyIpLimit,
  dailyRecipientLimit,
  dailyResetHourUtc,
  emailLimits,
  emailLimitsError,
  emailLimitsLoading,
  emailLimitsSaving,
  monthlyHardLimit,
  monthlyResetDay,
  onDailyIpLimit,
  onBlockedDomainsDraft,
  onDailyRecipientLimit,
  onDailyResetHourUtc,
  onMonthlyHardLimit,
  onMonthlyResetDay,
  onRefresh,
  onSave,
  onSaveBlockedDomains,
}: {
  blockedDomains: string[];
  blockedDomainsDraft: string;
  canUpdateEmails: boolean;
  dailyIpLimit: string;
  dailyRecipientLimit: string;
  dailyResetHourUtc: string;
  emailLimits: EmailLimitStatusResponse | null;
  emailLimitsError: string;
  emailLimitsLoading: boolean;
  emailLimitsSaving: boolean;
  monthlyHardLimit: string;
  monthlyResetDay: string;
  onBlockedDomainsDraft: (value: string) => void;
  onDailyIpLimit: (value: string) => void;
  onDailyRecipientLimit: (value: string) => void;
  onDailyResetHourUtc: (value: string) => void;
  onMonthlyHardLimit: (value: string) => void;
  onMonthlyResetDay: (value: string) => void;
  onRefresh: () => void;
  onSave: () => void;
  onSaveBlockedDomains: () => void;
}) {
  const emailMonthPercent = emailLimits ? usagePercent(emailLimits.month.sent, emailLimits.settings.monthlyHardLimit) : 0;
  const maxRecentEmailSends = Math.max(1, ...(emailLimits?.recentDays.map((day) => day.sent) ?? []));

  return (
    <>
      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Email Service</CardTitle>
              <CardDescription className="mt-2">SES quota usage and DB-backed hard limits.</CardDescription>
            </div>
            <Button type="button" variant="secondary" onClick={onRefresh}>Refresh</Button>
          </div>
        </CardHeader>
      </Card>

      {emailLimitsLoading ? (
        <div className="flex min-h-48 items-center justify-center p-6"><Spinner label="Loading email service" /></div>
      ) : emailLimitsError ? (
        <EmptyState title="Could not load email service" description={emailLimitsError} action={<Button type="button" onClick={onRefresh}>Try again</Button>} />
      ) : emailLimits ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Month sent" value={formatCount(emailLimits.month.sent)} hint={`${emailMonthPercent}% of ${formatCount(emailLimits.settings.monthlyHardLimit)}`} />
            <StatCard label="Remaining" value={formatCount(emailLimits.month.remaining)} hint={`Resets ${formatAuditTimestamp(emailLimits.month.resetAt)}`} />
            <StatCard label="Today" value={formatCount(emailLimits.today.sent)} hint={`Day starts ${String(emailLimits.settings.dailyResetHourUtc).padStart(2, "0")}:00 UTC`} />
          </div>

          <Card className="border-border bg-card text-card-foreground">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle>Monthly usage</CardTitle>
                  <CardDescription className="mt-2">{formatCount(emailLimits.month.sent)} sent, {formatCount(emailLimits.month.remaining)} left.</CardDescription>
                </div>
                <Badge variant={emailLimits.month.blocked ? "destructive" : "secondary"}>{emailLimits.month.blocked ? "Blocked" : "Active"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${emailLimits.month.blocked ? "bg-destructive" : "bg-primary"}`} style={{ width: `${emailMonthPercent}%` }} />
              </div>
              <div className="flex flex-wrap justify-between gap-2 text-sm text-muted-foreground">
                <span>Started {formatAuditTimestamp(emailLimits.month.periodStart)}</span>
                <span>{emailMonthPercent}% used</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
            <Card className="border-border bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>Recent daily usage</CardTitle>
                <CardDescription className="mt-2">Global email sends tracked by the auth service.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {emailLimits.recentDays.length ? emailLimits.recentDays.map((day) => {
                  const width = Math.max(4, Math.round((day.sent / maxRecentEmailSends) * 100));
                  return (
                    <div key={day.date} className="grid grid-cols-[6rem_minmax(0,1fr)_4rem] items-center gap-3 text-sm">
                      <span className="text-muted-foreground">{formatDate(day.date)}</span>
                      <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} /></div>
                      <span className="text-right tabular-nums">{formatCount(day.sent)}</span>
                    </div>
                  );
                }) : <EmptyState title="No daily usage yet" description="Usage appears here after email sends are recorded." />}
              </CardContent>
            </Card>

            <Card className="border-border bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription className="mt-2">{canUpdateEmails ? "Changes are audited." : "Read-only for this account."}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {canUpdateEmails ? (
                  <>
                    <div className="space-y-2"><Label htmlFor="monthlyHardLimit">Monthly hard limit</Label><Input id="monthlyHardLimit" type="number" min={1} value={monthlyHardLimit} onChange={(event) => onMonthlyHardLimit(event.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="dailyRecipientLimit">Daily per recipient</Label><Input id="dailyRecipientLimit" type="number" min={1} value={dailyRecipientLimit} onChange={(event) => onDailyRecipientLimit(event.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="dailyIpLimit">Daily per IP</Label><Input id="dailyIpLimit" type="number" min={1} value={dailyIpLimit} onChange={(event) => onDailyIpLimit(event.target.value)} /></div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2"><Label htmlFor="monthlyResetDay">Monthly reset day</Label><Input id="monthlyResetDay" type="number" min={1} max={28} value={monthlyResetDay} onChange={(event) => onMonthlyResetDay(event.target.value)} /></div>
                      <div className="space-y-2"><Label htmlFor="dailyResetHourUtc">Daily reset hour UTC</Label><Input id="dailyResetHourUtc" type="number" min={0} max={23} value={dailyResetHourUtc} onChange={(event) => onDailyResetHourUtc(event.target.value)} /></div>
                    </div>
                    <Button type="button" className="w-full" disabled={emailLimitsSaving} onClick={onSave}>{emailLimitsSaving ? "Saving..." : "Save email settings"}</Button>
                    <div className="border-t border-border pt-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <Label htmlFor="blockedEmailDomains">Blocked email domains</Label>
                        <Badge variant="secondary">{blockedDomains.length}</Badge>
                      </div>
                      <Textarea id="blockedEmailDomains" className="min-h-24 font-mono text-xs" value={blockedDomainsDraft} onChange={(event) => onBlockedDomainsDraft(event.target.value)} placeholder="web-library.net, mailinator.com" spellCheck={false} />
                      <Button type="button" className="mt-3 w-full" variant="destructive" disabled={emailLimitsSaving} onClick={onSaveBlockedDomains}>{emailLimitsSaving ? "Saving..." : "Save blocked domains"}</Button>
                    </div>
                  </>
                ) : (
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between gap-3"><span className="text-muted-foreground">Monthly hard limit</span><span className="font-medium tabular-nums">{formatCount(emailLimits.settings.monthlyHardLimit)}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-muted-foreground">Daily per recipient</span><span className="font-medium tabular-nums">{formatCount(emailLimits.settings.dailyRecipientLimit)}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-muted-foreground">Daily per IP</span><span className="font-medium tabular-nums">{formatCount(emailLimits.settings.dailyIpLimit)}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-muted-foreground">Monthly reset day</span><span className="font-medium tabular-nums">{emailLimits.settings.monthlyResetDay}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-muted-foreground">Daily reset hour</span><span className="font-medium tabular-nums">{String(emailLimits.settings.dailyResetHourUtc).padStart(2, "0")}:00 UTC</span></div>
                    <div className="border-t border-border pt-3">
                      <div className="mb-2 flex justify-between gap-3"><span className="text-muted-foreground">Blocked domains</span><span className="font-medium tabular-nums">{blockedDomains.length}</span></div>
                      <div className="max-h-32 overflow-y-auto break-words font-mono text-xs text-foreground">{blockedDomains.join(", ") || "None"}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </>
  );
}
