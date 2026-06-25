import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, DataTable, EmptyState, Spinner, Textarea } from "@aottg2/ui";
import type { PatreonTierResponse } from "../../../auth/types";
import { formatMoneyCents } from "../utils/format";

export function PatreonSection({
  canUpdatePatreon,
  labelsJson,
  labelsSaving,
  onLabelsJson,
  onRefresh,
  onSaveLabels,
  tiers,
  tiersError,
  tiersLoading,
}: {
  canUpdatePatreon: boolean;
  labelsJson: string;
  labelsSaving: boolean;
  onLabelsJson: (value: string) => void;
  onRefresh: () => void;
  onSaveLabels: () => void;
  tiers: PatreonTierResponse[];
  tiersError: string;
  tiersLoading: boolean;
}) {
  const patreonTierColumns = [
    { key: "title", header: "Tier", cell: (tier: PatreonTierResponse) => <div><div className="font-semibold text-foreground">{tier.title}</div><div className="font-mono text-xs text-muted-foreground">{tier.id}</div></div> },
    { key: "amount", header: "Amount", cell: (tier: PatreonTierResponse) => formatMoneyCents(tier.amountCents) },
    { key: "source", header: "Source", cell: (tier: PatreonTierResponse) => <Badge variant={tier.fromPatreon ? "textured" : "secondary"}>{tier.fromPatreon ? "Patreon" : "JSON"}</Badge> },
  ];

  return (
    <>
      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Patreon</CardTitle>
              <CardDescription className="mt-2">Live campaign tiers and admin fallback labels.</CardDescription>
            </div>
            <Button type="button" variant="secondary" onClick={onRefresh}>Refresh</Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <Card className="border-border bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Tier catalog</CardTitle>
            <CardDescription className="mt-2">Fetched from Patreon, then merged with local label JSON.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {tiersLoading ? (
              <div className="flex min-h-48 items-center justify-center p-6"><Spinner label="Loading Patreon tiers" /></div>
            ) : tiersError ? (
              <EmptyState title="Could not load Patreon tiers" description={tiersError} action={<Button type="button" onClick={onRefresh}>Try again</Button>} />
            ) : (
              <DataTable className="admin-data-table" columns={patreonTierColumns} data={tiers} getRowKey={(tier) => tier.id} emptyTitle="No Patreon tiers" emptyDescription="Add fallback labels or configure creator token env." />
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Label JSON</CardTitle>
            <CardDescription className="mt-2">Array of id, title, amountCents. Secrets stay in backend env.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea value={labelsJson} onChange={(event) => onLabelsJson(event.target.value)} className="min-h-72 font-mono text-xs" spellCheck={false} />
            <Button type="button" className="w-full" disabled={labelsSaving || !canUpdatePatreon} onClick={onSaveLabels}>{labelsSaving ? "Saving..." : "Save label JSON"}</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
