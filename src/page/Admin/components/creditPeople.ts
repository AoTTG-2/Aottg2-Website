import type { AdminCreditCategory } from "../../../auth/creditsTypes";

type CreditContributor = AdminCreditCategory["contributors"][number];

export type PendingCreditPerson = {
  key: string;
  name: string;
  accountId: string | null;
  accountDisplayName?: string | null;
};

export type CreditLocation = {
  id: string;
  label: string;
  categoryIndex: number;
  groupIndex?: number;
};

export type CreditPerson = PendingCreditPerson & {
  assignments: CreditLocation[];
  persisted: boolean;
};

export function getPersonKey(accountId: string | null | undefined, name: string) {
  return accountId ? `account:${accountId}` : `name:${name.trim().toLocaleLowerCase()}`;
}

function contributorKey(contributor: CreditContributor) {
  return getPersonKey(contributor.accountId, contributor.name);
}

function matchesPerson(contributor: CreditContributor, person: CreditPerson) {
  return contributorKey(contributor) === person.key;
}

export function getCreditLocations(categories: AdminCreditCategory[]): CreditLocation[] {
  return categories.flatMap((category, categoryIndex) => [
    {
      id: `category:${category.id}`,
      label: category.name || "Untitled category",
      categoryIndex,
    },
    ...category.groups.map((group, groupIndex) => ({
      id: `group:${group.id}`,
      label: `${category.name || "Untitled category"} / ${group.title || "Untitled group"}`,
      categoryIndex,
      groupIndex,
    })),
  ]);
}

export function getCreditPeople(categories: AdminCreditCategory[], pendingPeople: PendingCreditPerson[]): CreditPerson[] {
  const locations = getCreditLocations(categories);
  const people = new Map<string, CreditPerson>();

  for (const pending of pendingPeople) {
    people.set(pending.key, { ...pending, assignments: [], persisted: false });
  }

  for (const location of locations) {
    const contributors = location.groupIndex === undefined
      ? categories[location.categoryIndex]?.contributors ?? []
      : categories[location.categoryIndex]?.groups[location.groupIndex]?.contributors ?? [];

    for (const contributor of contributors) {
      const key = contributorKey(contributor);
      const person = people.get(key) ?? {
        key,
        name: contributor.name,
        accountId: contributor.accountId,
        accountDisplayName: contributor.accountDisplayName,
        assignments: [],
        persisted: true,
      };

      person.name = contributor.name;
      person.accountId = contributor.accountId;
      person.accountDisplayName = contributor.accountDisplayName;
      person.persisted = true;
      person.assignments.push(location);
      people.set(key, person);
    }
  }

  return [...people.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function updatePersonInDraft(categories: AdminCreditCategory[], personKey: string, patch: Partial<Pick<CreditContributor, "name" | "accountId" | "accountDisplayName">>) {
  return categories.map((category) => ({
    ...category,
    contributors: category.contributors.map((contributor) => contributorKey(contributor) === personKey ? { ...contributor, ...patch } : contributor),
    groups: category.groups.map((group) => ({
      ...group,
      contributors: group.contributors.map((contributor) => contributorKey(contributor) === personKey ? { ...contributor, ...patch } : contributor),
    })),
  }));
}

export function setPersonAssignment(categories: AdminCreditCategory[], person: CreditPerson, location: CreditLocation, enabled: boolean) {
  return categories.map((category, categoryIndex) => {
    if (categoryIndex !== location.categoryIndex) return category;

    if (location.groupIndex === undefined) {
      const exists = category.contributors.some((contributor) => matchesPerson(contributor, person));
      if (enabled && !exists) {
        return { ...category, contributors: [...category.contributors, toContributor(person, category.contributors.length)] };
      }
      if (!enabled && exists) {
        return { ...category, contributors: category.contributors.filter((contributor) => !matchesPerson(contributor, person)) };
      }
      return category;
    }

    return {
      ...category,
      groups: category.groups.map((group, groupIndex) => {
        if (groupIndex !== location.groupIndex) return group;
        const exists = group.contributors.some((contributor) => matchesPerson(contributor, person));
        if (enabled && !exists) {
          return { ...group, contributors: [...group.contributors, toContributor(person, group.contributors.length)] };
        }
        if (!enabled && exists) {
          return { ...group, contributors: group.contributors.filter((contributor) => !matchesPerson(contributor, person)) };
        }
        return group;
      }),
    };
  });
}

function toContributor(person: CreditPerson, sortOrder: number): CreditContributor {
  return {
    id: crypto.randomUUID(),
    name: person.name,
    accountId: person.accountId,
    accountDisplayName: person.accountDisplayName,
    sortOrder,
  };
}
