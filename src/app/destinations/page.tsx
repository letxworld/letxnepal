import type { Metadata } from "next";
import Link from "next/link";
import { DestinationCard } from "@/components/public/destination-card";
import { DestinationFilter } from "@/components/public/filters/destination-filter";
import { ActiveFilterChips } from "@/components/public/filters/active-filter-chips";
import { FilterProvider } from "@/components/public/filters/filter-state";
import { filtersFromSearchParams } from "@/lib/destinations/filter-model";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination, ResultsSummary } from "@/components/public/results-summary";
import { PageBackdrop } from "@/components/public/page-backdrop";
import { listDestinations } from "@/lib/destinations/repository";
import { parseDestinationFilter } from "@/lib/destinations/filter";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Browse destinations across all seven provinces of Nepal. Filter by remoteness, access, permits and how well known a place is.",
  alternates: { canonical: "/destinations" },
};

function buildHref(params: URLSearchParams, page: number) {
  const next = new URLSearchParams(params);
  if (page <= 1) next.delete("page");
  else next.set("page", String(page));
  const qs = next.toString();
  return qs ? `/destinations?${qs}` : "/destinations";
}

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") flat[key] = value;
    else if (Array.isArray(value) && value.length) flat[key] = value[0]!;
  }

  let filter;
  try {
    filter = parseDestinationFilter(flat);
  } catch {
    filter = parseDestinationFilter({});
  }

  const result = listDestinations(filter);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(flat)) params.set(key, value);

  return (
    <div className="space-y-lg">
      <PageBackdrop />

      <header className="max-w-3xl">
        <p className="mb-xs text-sm font-medium uppercase tracking-wide text-primary">
          All seven provinces
        </p>
        <h1 className="text-2xl font-semibold text-foreground">Destinations</h1>
        <p className="mt-md text-base text-muted-foreground">
          Start from the famous places, or filter down to the ones most visitors never reach.
        </p>
      </header>

      <FilterProvider initial={filtersFromSearchParams(params)}>
        <div className="space-y-sm">
          <DestinationFilter resultCount={result.total} />
          <ActiveFilterChips resultCount={result.total} />
        </div>
      </FilterProvider>

      <div className="flex flex-wrap items-center gap-sm border-b border-border pb-sm">
        <ResultsSummary total={result.total} page={result.page} pageSize={result.pageSize} />
      </div>

      {result.data.length === 0 ? (
        <EmptyState
          title="No destinations match those filters"
          description="Try removing a filter, or look at the hidden gems list instead."
          action={
            <Link href="/destinations/hidden" className="btn-secondary">
              See hidden gems
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
          {result.data.map((destination) => (
            <li key={destination.slug}>
              <DestinationCard destination={destination} href={`/destinations/${destination.slug}`} />
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        makeHref={(page) => buildHref(params, page)}
      />
    </div>
  );
}
