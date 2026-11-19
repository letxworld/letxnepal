import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getCoverage, getPriorityProvinces } from "@/lib/destinations/repository";
import { DISTRICTS } from "@/lib/nepal";

export const metadata: Metadata = {
  title: "Coverage",
  description:
    "Destination coverage across all seven provinces and 77 districts of Nepal, including the districts that have no listed destination yet.",
  alternates: { canonical: "/coverage" },
};

/**
 * The measurable form of mission goal #2: grow tourism across all of Nepal.
 * Every province is shown even at zero, and every uncovered district is named.
 */
export default function CoveragePage() {
  const coverage = getCoverage();
  const priority = getPriorityProvinces();

  return (
    <div className="space-y-2xl">
      <header className="max-w-3xl">
        <p className="mb-xs text-sm font-medium uppercase tracking-wide text-primary">Mission goal 2</p>
        <h1 className="text-2xl font-semibold text-foreground">Coverage across Nepal</h1>
        <p className="mt-md text-base text-muted-foreground">
          {coverage.totals.destinations} destinations, {coverage.totals.hiddenGems} of them hidden gems,
          covering {coverage.totals.districtsCovered} of {coverage.totals.districtsTotal} districts in{" "}
          {coverage.totals.provincesCovered} of {coverage.totals.provincesTotal} provinces. The remaining{" "}
          {coverage.totals.zeroCoverageDistricts} districts are the gap this platform exists to close.
        </p>
      </header>

      <section aria-labelledby="totals-heading">
        <h2 id="totals-heading" className="sr-only">
          Totals
        </h2>
        <dl className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Provinces covered", value: `${coverage.totals.provincesCovered} / ${coverage.totals.provincesTotal}` },
            { label: "Districts covered", value: `${coverage.totals.districtsCovered} / ${coverage.totals.districtsTotal}` },
            { label: "Hidden gems", value: String(coverage.totals.hiddenGems) },
            {
              label: "Households supported",
              value: coverage.totals.householdsSupported.toLocaleString(),
            },
          ].map((stat) => (
            <div key={stat.label} className="card">
              <dt className="text-xs text-muted-foreground">{stat.label}</dt>
              <dd className="mt-xs text-2xl font-semibold text-card-foreground">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="gaps-heading">
        <h2 id="gaps-heading" className="mb-md text-lg font-semibold text-foreground">
          Priority provinces
        </h2>
        <p className="mb-md text-sm text-muted-foreground">
          Ordered far-west first. The remote provinces are where a national platform can change the most,
          because they have the least existing tourism infrastructure.
        </p>
        <ol className="space-y-md">
          {priority.map((province) => (
            <li key={province.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-sm">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Province {province.number} · {province.region}
                  </p>
                  <p className="text-lg font-semibold text-card-foreground">
                    {province.name} <span className="ml-xs font-normal">{province.nepaliName}</span>
                  </p>
                </div>
                <Badge tone={province.destinations === 0 ? "destructive" : "primary"}>
                  {province.destinations} destinations
                </Badge>
              </div>

              <dl className="mt-md grid gap-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Hidden gems</dt>
                  <dd className="text-sm font-medium text-card-foreground">{province.hiddenGems}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Districts covered</dt>
                  <dd className="text-sm font-medium text-card-foreground">
                    {province.districtsCovered} / {province.districtsTotal}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Bookable stays</dt>
                  <dd className="text-sm font-medium text-card-foreground">{province.bookable}</dd>
                </div>
              </dl>

              {province.zeroCoverageDistricts.length > 0 ? (
                <details className="mt-md">
                  <summary className="min-h-[44px] cursor-pointer text-sm font-medium text-foreground">
                    {province.zeroCoverageDistricts.length} districts with no destination listed
                  </summary>
                  <ul className="mt-sm flex flex-wrap gap-xs">
                    {province.zeroCoverageDistricts.map((district) => (
                      <li key={district.id}>
                        <Badge tone="outline">{district.name}</Badge>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <p className="mt-md text-sm text-muted-foreground">
                  Every district in this province has at least one listed destination.
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="all-districts-heading">
        <h2 id="all-districts-heading" className="mb-md text-lg font-semibold text-foreground">
          All districts
        </h2>
        <p className="mb-md text-sm text-muted-foreground">
          {DISTRICTS.length} districts. Districts marked as gaps have no destination listed.
        </p>
        <ul className="grid gap-sm sm:grid-cols-2 lg:grid-cols-3">
          {DISTRICTS.map((district) => {
            const covered = priority
              .find((province) => province.id === district.province)
              ?.zeroCoverageDistricts.every((gap) => gap.id !== district.id);
            return (
              <li key={district.id}>
                <Link
                  href={`/destinations?district=${district.id}`}
                  className="card flex items-center justify-between gap-sm py-sm transition-colors hover:border-primary"
                >
                  <span className="text-sm text-card-foreground">{district.name}</span>
                  <Badge tone={covered ? "primary" : "muted"}>
                    {covered ? "Listed" : "Gap"}
                  </Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {coverage.totals.zeroCoverageDistricts === 0 ? (
        <EmptyState
          title="Full coverage"
          description="Every district in Nepal now has a listed destination."
        />
      ) : null}
    </div>
  );
}
