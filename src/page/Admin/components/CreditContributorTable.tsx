import { FiArrowDown, FiArrowUp, FiTrash2 } from "react-icons/fi";
import { Badge, Button, DataTable, Input } from "@aottg2/ui";
import type { AdminCreditCategory } from "../../../auth/creditsTypes";
import type { CreditContributorTarget } from "../hooks/useAdminCredits";

type Contributor = AdminCreditCategory["contributors"][number];
type ContributorRow = Contributor & { contributorIndex: number };

export function CreditContributorTable({
  canReadUsers,
  canUpdate,
  contributors,
  saving,
  target,
  onAddContributor,
  onDeleteContributor,
  onLinkTarget,
  onMoveContributor,
  onSetContributorName,
  onUnlinkTarget,
}: {
  canReadUsers: boolean;
  canUpdate: boolean;
  contributors: Contributor[];
  saving: boolean;
  target: Omit<CreditContributorTarget, "contributorIndex">;
  onAddContributor: (categoryIndex: number, groupIndex?: number) => void;
  onDeleteContributor: (target: CreditContributorTarget) => void;
  onLinkTarget: (target: CreditContributorTarget) => void;
  onMoveContributor: (target: CreditContributorTarget, direction: -1 | 1) => void;
  onSetContributorName: (target: CreditContributorTarget, name: string) => void;
  onUnlinkTarget: (target: CreditContributorTarget) => void;
}) {
  const makeTarget = (contributorIndex: number) => ({ ...target, contributorIndex });

  return (
    <div className="space-y-3">
      <DataTable
        className="admin-data-table"
        data={contributors.map((contributor, contributorIndex) => ({ ...contributor, contributorIndex }))}
        getRowKey={(contributor) => contributor.id}
        emptyTitle="No contributors"
        emptyDescription="Add a contributor here."
        columns={[
          {
            key: "name",
            header: "Contributor",
            cell: (contributor: ContributorRow) => (
              <Input
                className="h-9 min-w-56"
                value={contributor.name}
                disabled={!canUpdate || saving}
                onChange={(event) => onSetContributorName(makeTarget(contributor.contributorIndex), event.target.value)}
              />
            ),
          },
          {
            key: "link",
            header: "Link",
            cell: (contributor: ContributorRow) => contributor.accountId
              ? <Badge variant="textured">{contributor.accountDisplayName ?? contributor.name}</Badge>
              : <Badge variant="outline">String only</Badge>,
          },
          {
            key: "actions",
            header: "",
            className: "w-0",
            cell: (contributor: ContributorRow) => canUpdate ? (
              <div className="flex flex-nowrap justify-end gap-2">
                <Button type="button" variant="secondary" size="icon" disabled={contributor.contributorIndex === 0 || saving} onClick={() => onMoveContributor(makeTarget(contributor.contributorIndex), -1)} aria-label="Move contributor up"><FiArrowUp /></Button>
                <Button type="button" variant="secondary" size="icon" disabled={contributor.contributorIndex === contributors.length - 1 || saving} onClick={() => onMoveContributor(makeTarget(contributor.contributorIndex), 1)} aria-label="Move contributor down"><FiArrowDown /></Button>
                {contributor.accountId ? (
                  <Button type="button" variant="destructive" disabled={saving} onClick={() => onUnlinkTarget(makeTarget(contributor.contributorIndex))}>Unlink</Button>
                ) : canReadUsers ? (
                  <Button type="button" variant="secondary" disabled={saving} onClick={() => onLinkTarget(makeTarget(contributor.contributorIndex))}>Link</Button>
                ) : null}
                <Button type="button" variant="destructive" size="icon" disabled={saving} onClick={() => onDeleteContributor(makeTarget(contributor.contributorIndex))} aria-label="Delete contributor"><FiTrash2 /></Button>
              </div>
            ) : null,
          },
        ]}
      />
      {canUpdate ? (
        <Button type="button" variant="secondary" disabled={saving} onClick={() => onAddContributor(target.categoryIndex, target.groupIndex)}>Add contributor</Button>
      ) : null}
    </div>
  );
}
