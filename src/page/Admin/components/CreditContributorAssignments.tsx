import { useMemo, useState } from "react";
import { FiLink, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { Badge, Button, CardDescription, Checkbox, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, EmptyState, Input, Label, cn } from "@aottg2/ui";
import type { AdminCreditCategory } from "../../../auth/creditsTypes";
import type { ProfileResponse } from "../../../auth/types";
import { getCreditLocations, getCreditPeople, getPersonKey, setPersonAssignment, updatePersonInDraft, type CreditPerson, type PendingCreditPerson } from "./creditPeople";

export function CreditContributorAssignments({
  canReadUsers,
  canUpdate,
  categories,
  saving,
  userResults,
  userSearch,
  userSearchLoading,
  onDraft,
  onSearchUsers,
  onSetUserSearch,
}: {
  canReadUsers: boolean;
  canUpdate: boolean;
  categories: AdminCreditCategory[];
  saving: boolean;
  userResults: ProfileResponse[];
  userSearch: string;
  userSearchLoading: boolean;
  onDraft: (categories: AdminCreditCategory[]) => void;
  onSearchUsers: () => void;
  onSetUserSearch: (value: string) => void;
}) {
  const [pendingPeople, setPendingPeople] = useState<PendingCreditPerson[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [linkingKey, setLinkingKey] = useState<string | null>(null);
  const locations = useMemo(() => getCreditLocations(categories), [categories]);
  const people = useMemo(() => getCreditPeople(categories, pendingPeople), [categories, pendingPeople]);
  const selectedPerson = people.find((person) => person.key === selectedKey) ?? people[0] ?? null;

  function addPerson() {
    const key = `pending:${crypto.randomUUID()}`;
    const person = { key, name: nextContributorName(people), accountId: null, accountDisplayName: null };
    setPendingPeople((current) => [...current, person]);
    setSelectedKey(key);
  }

  function updateSelectedPerson(patch: Partial<Pick<CreditPerson, "name" | "accountId" | "accountDisplayName">>) {
    if (!selectedPerson) return;
    if (!selectedPerson.persisted) {
      setPendingPeople((current) => current.map((person) => person.key === selectedPerson.key ? { ...person, ...patch } : person));
      return;
    }

    const nextName = patch.name ?? selectedPerson.name;
    const nextAccountId = patch.accountId !== undefined ? patch.accountId : selectedPerson.accountId;
    onDraft(updatePersonInDraft(categories, selectedPerson.key, patch));
    setSelectedKey(getPersonKey(nextAccountId, nextName));
  }

  function toggleAssignment(person: CreditPerson, locationId: string, checked: boolean) {
    const location = locations.find((item) => item.id === locationId);
    if (!location) return;
    onDraft(setPersonAssignment(categories, person, location, checked));
    if (!person.persisted && checked) {
      setPendingPeople((current) => current.filter((item) => item.key !== person.key));
      setSelectedKey(getPersonKey(person.accountId, person.name));
    }
  }

  function deletePerson(person: CreditPerson) {
    if (!person.persisted) {
      setPendingPeople((current) => current.filter((item) => item.key !== person.key));
      setSelectedKey(null);
      return;
    }

    let next = categories;
    for (const assignment of person.assignments) {
      next = setPersonAssignment(next, person, assignment, false);
    }
    onDraft(next);
    setSelectedKey(null);
  }

  function linkPerson(user: ProfileResponse) {
    if (!selectedPerson) return;
    updateSelectedPerson({ accountId: user.accountId, accountDisplayName: user.displayName, name: selectedPerson.name || user.displayName });
    setLinkingKey(null);
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Contributors</h3>
              <p className="text-xs text-muted-foreground">{people.length} people</p>
            </div>
            {canUpdate ? <Button type="button" variant="secondary" disabled={saving} onClick={addPerson}><FiPlus className="mr-2" /> Add</Button> : null}
          </div>
          {people.length ? (
            <div className="space-y-2">
              {people.map((person) => (
                <button
                  key={person.key}
                  type="button"
                  className={cn(
                    "w-full border border-border bg-background/40 p-3 text-left transition-colors hover:border-primary/70 hover:bg-background/70",
                    selectedPerson?.key === person.key && "border-primary bg-primary/10"
                  )}
                  onClick={() => setSelectedKey(person.key)}
                >
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-foreground">{person.name || "Unnamed contributor"}</span>
                    <Badge variant="outline">{person.assignments.length}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {person.accountId ? <Badge variant="textured">{person.accountDisplayName ?? "Linked"}</Badge> : <Badge variant="outline">String only</Badge>}
                    {!person.persisted ? <Badge variant="secondary">new</Badge> : null}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState title="No contributors" description="Add a contributor, then assign categories or groups." />
          )}
        </div>

        <div className="min-w-0 space-y-5">
          {selectedPerson ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Edit contributor</h3>
                  <CardDescription className="mt-1">Assign this person to every category or group they should appear in.</CardDescription>
                </div>
                {canUpdate ? <Button type="button" variant="destructive" disabled={saving} onClick={() => deletePerson(selectedPerson)}><FiTrash2 className="mr-2" /> Delete</Button> : null}
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div className="space-y-2">
                  <Label htmlFor="credit-person-name">Contributor name</Label>
                  <Input id="credit-person-name" value={selectedPerson.name} disabled={!canUpdate || saving} onChange={(event) => updateSelectedPerson({ name: event.target.value })} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedPerson.accountId ? (
                    <>
                      <Badge variant="textured" className="min-h-10 px-3 py-2">{selectedPerson.accountDisplayName ?? selectedPerson.name}</Badge>
                      {canUpdate ? <Button type="button" variant="secondary" disabled={saving} onClick={() => updateSelectedPerson({ accountId: null, accountDisplayName: null })}><FiX className="mr-2" /> Unlink</Button> : null}
                    </>
                  ) : canUpdate && canReadUsers ? (
                    <Button type="button" variant="secondary" disabled={saving} onClick={() => setLinkingKey(selectedPerson.key)}><FiLink className="mr-2" /> Link account</Button>
                  ) : (
                    <Badge variant="outline" className="min-h-10 px-3 py-2">String only</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Assignments</h4>
                {locations.length ? (
                  <div className="grid gap-2 lg:grid-cols-2">
                    {locations.map((location) => {
                      const checked = selectedPerson.assignments.some((assignment) => assignment.id === location.id);
                      const checkboxId = `credit-assignment-${selectedPerson.key}-${location.id}`;
                      return (
                        <label key={location.id} htmlFor={checkboxId} className="flex cursor-pointer items-start gap-3 border border-border bg-background/40 p-3">
                          <Checkbox id={checkboxId} checked={checked} disabled={!canUpdate || saving || !selectedPerson.name.trim()} onCheckedChange={(value) => toggleAssignment(selectedPerson, location.id, value === true)} />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-foreground">{location.label}</span>
                            <span className="text-xs text-muted-foreground">{location.groupIndex === undefined ? "Category" : "Group"}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState title="No structure yet" description="Add categories or groups before assigning contributors." />
                )}
              </div>
            </>
          ) : (
            <EmptyState title="Select a contributor" description="Choose a person or add a new contributor." />
          )}
        </div>
      </div>

      <Dialog open={linkingKey !== null} onOpenChange={(open) => !open && setLinkingKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link account</DialogTitle>
            <DialogDescription>Search accounts and link one to this contributor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input value={userSearch} placeholder="Search users" onChange={(event) => onSetUserSearch(event.target.value)} />
              <Button type="button" variant="secondary" disabled={userSearchLoading || !userSearch.trim()} onClick={onSearchUsers}>{userSearchLoading ? "Searching..." : "Search"}</Button>
            </div>
            <div className="space-y-2">
              {userResults.length ? userResults.map((user) => (
                <Button key={user.accountId} type="button" variant="secondary" className="w-full justify-start" disabled={saving || linkingKey === null} onClick={() => linkPerson(user)}>
                  {user.displayName}
                </Button>
              )) : <EmptyState title="No users selected" description="Search to find an account." />}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function nextContributorName(people: CreditPerson[]) {
  const base = "New contributor";
  if (!people.some((person) => person.name === base)) return base;
  let index = 2;
  while (people.some((person) => person.name === `${base} ${index}`)) index += 1;
  return `${base} ${index}`;
}
