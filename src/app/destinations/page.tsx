import type { Metadata } from "next";
import Link from "next/link";
import { DestinationCard } from "@/components/public/destination-card";
import { DestinationFilters, activeFilterBadges } from "@/components/public/destination-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Pagination, ResultsSummary } from "@/components/public/results-summary";
import { listDestinations, getFilterOptions } from "@/lib/destinations/repository";
import { parseDestinationFilter } from "@/lib/destinations/filter";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Browse destinations across all seven provinces of Nepal, filtered by remoteness, access, permit requirement and how well known the place is.",
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
    const fallback = parseDestinationFilter({});
    return (
      <div className="space-y-lg">
        <h1 className="text-2xl font-semibold text-foreground">Destinations</h1>
        <EmptyState
          title="Those filter values are not recognised"
          description="The filters were ignored and the full list is shown instead."
          action={
            <Link href="/destinations" className="btn-secondary">
              Reset filters
            </Link>
          }
        />
        <DestinationGrid result={listDestinations(fallback)} />
      </div>
    );
  }

  const result = listDestinations(filter);
  const options = getFilterOptions();
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(flat)) params.set(key, value);

  return (
    <div className="space-y-lg">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Destinations</h1>
        <p className="mt-xs text-muted-foreground">
          {result.total} places across Nepal. Filter by province, remoteness, access and how well known
          the destination is.
        </p>
      </header>

      <DestinationFilters filter={filter} resultCount={result.total} districts={options.districts} />

      <div className="flex flex-wrap items-center gap-sm">
        <ResultsSummary
          total={result.total}
          page={result.page}
          pageSize={result.pageSize}
        />
        {activeFilterBadges(filter).map((badge) => (
          <Badge key={badge} tone="primary">
            {badge}
          </Badge>
        ))}
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
        <DestinationGrid result={result} />
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

function DestinationGrid({
  result,
}: {
  result: ReturnType<typeof listDestinations>;
}) {
  return (
    <ul className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
      {result.data.map((destination) => (
        <li key={destination.slug}>
          <DestinationCard destination={destination} href={`/destinations/${destination.slug}`} />
        </li>
      ))}
    </ul>
  );
}
