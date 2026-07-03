import React, { useState, useEffect } from "react";
import { FiInfo, FiUser } from "react-icons/fi";
import { creditsApi } from "../../auth/creditsApi";
import type { PublicCreditCategory, PublicCreditContributor, PublicCreditGroup } from "../../auth/creditsTypes";
import { creditJson } from "../../data/links";
import BackgroundImage from "../../assets/images/bg-dark.webp";

interface LegacyCreditItem {
  Category: string;
  Names: string[];
}

const normalizeCredit = (credit: PublicCreditCategory): PublicCreditCategory => ({
  ...credit,
  description: credit.description ?? null,
  contributors: (credit.contributors ?? []).map((contributor) => ({
    ...contributor,
    accountId: contributor.accountId ?? null,
  })),
  groups: (credit.groups ?? []).map((group) => ({
    ...group,
    description: group.description ?? null,
    contributors: (group.contributors ?? []).map((contributor) => ({
      ...contributor,
      accountId: contributor.accountId ?? null,
    })),
  })),
});

const DescriptionTooltip: React.FC<{ description: string }> = ({ description }) => (
  <span className="group relative inline-flex">
    <button
      type="button"
      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white outline-none transition hover:text-[rgba(255,255,255,0.82)] focus-visible:ring-2 focus-visible:ring-white"
      aria-label={description}
    >
      <FiInfo aria-hidden className="h-4 w-4" />
    </button>
    <span
      role="tooltip"
      className="pointer-events-none absolute left-0 top-7 z-20 w-80 max-w-[80vw] border border-[rgba(255,255,255,0.18)] bg-[rgba(10,10,10,0.98)] px-3 py-2 text-left font-sans text-sm normal-case leading-5 tracking-normal text-[rgba(255,255,255,0.9)] opacity-0 shadow-xl transition group-hover:opacity-100 group-focus-within:opacity-100"
    >
      {description}
    </span>
  </span>
);

const ContributorGrid: React.FC<{ contributors: PublicCreditContributor[] }> = ({ contributors }) => {
  if (!contributors.length) return null;

  return (
    <ul className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {contributors.map((contributor, index) => (
        <li
          key={`${contributor.name}-${contributor.accountId ?? "unlinked"}-${index}`}
          title={contributor.name}
          className="flex min-h-11 min-w-0 items-center gap-3 bg-[rgba(255,255,255,0.075)] px-4 text-lg leading-none text-[rgba(255,255,255,0.66)] ring-1 ring-[rgba(255,255,255,0.04)] sm:text-xl"
        >
          {contributor.accountId ? <FiUser aria-hidden className="h-4 w-4 shrink-0 text-white" /> : null}
          <span className="min-w-0 truncate">{contributor.name}</span>
        </li>
      ))}
    </ul>
  );
};

const CreditGroupBlock: React.FC<{ group: PublicCreditGroup }> = ({ group }) => (
  <section className="space-y-3">
    <div className="flex items-center gap-2">
      <h3 className="font-primary text-2xl leading-none text-white sm:text-3xl">{group.title}</h3>
      {group.description ? <DescriptionTooltip description={group.description} /> : null}
    </div>
    <ContributorGrid contributors={group.contributors} />
  </section>
);

const CreditCategorySection: React.FC<{ credit: PublicCreditCategory }> = ({ credit }) => (
  <section className="w-full space-y-9 border-t border-[rgba(255,255,255,0.04)] bg-[rgba(0,0,0,0.04)] py-8 first:border-t-0 sm:py-10">
    <div className="space-y-6">
      <div className="space-y-5">
        <h2 className="font-primary text-4xl leading-none text-white sm:text-5xl lg:text-6xl">{credit.name}</h2>
        {credit.description ? <p className="max-w-5xl text-xl leading-8 text-[rgba(255,255,255,0.58)] sm:text-2xl">{credit.description}</p> : null}
      </div>

      {credit.contributors.length && credit.groups.length ? (
        <CreditGroupBlock group={{ title: "Contributors", description: null, contributors: credit.contributors }} />
      ) : null}

      {credit.contributors.length && !credit.groups.length ? <ContributorGrid contributors={credit.contributors} /> : null}

      {credit.groups.map((group, index) => (
        <CreditGroupBlock key={`${group.title}-${index}`} group={group} />
      ))}
    </div>
  </section>
);

const Credits: React.FC = () => {
  const [credits, setCredits] = useState<PublicCreditCategory[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCredits() {
      const fallback = async () => {
        const response = await fetch(creditJson);
        const data = await response.json() as LegacyCreditItem[];
        setCredits(data.map((credit) => ({
          name: credit.Category,
          description: null,
          contributors: credit.Names.map((name) => ({ name, accountId: null })),
          groups: [],
        })));
      };

      let useFallback = true;
      try {
        const { ok, data } = await creditsApi.getPublic(controller.signal);
        if (controller.signal.aborted) return;
        if (ok && data.categories?.length) {
          setCredits(data.categories.map(normalizeCredit));
          useFallback = false;
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error fetching credits:", error);
        }
      }

      if (useFallback && !controller.signal.aborted) await fallback();
    }

    void loadCredits();
    return () => controller.abort();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${BackgroundImage})`,
          aspectRatio: "16 / 9",
          minHeight: "100vh",
          margin: "auto",
          filter: "brightness(0.2)",
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.06),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.25),transparent_45%,rgba(0,0,0,0.28))]" />
      <main className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col px-[clamp(1.5rem,7vw,7rem)] py-[clamp(3rem,5vw,4rem)]">
        {credits.map((credit, index) => (
          <CreditCategorySection key={`${credit.name}-${index}`} credit={credit} />
        ))}
      </main>
    </div>
  );
};

export default Credits;
