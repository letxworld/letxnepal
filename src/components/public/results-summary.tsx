import { Badge } from "@/components/ui/badge";

/** Human-readable page status for screen readers and sighted users alike. */
export function ResultsSummary({
  total,
  page,
  pageSize,
  label = "destinations",
}: {
  total: number;
  page: number;
  pageSize: number;
  label?: string;
}) {
  if (total === 0) return <p className="text-muted-foreground">No {label} match these filters.</p>;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <p className="text-muted-foreground" aria-live="polite">
      Showing {from}–{to} of {total} {label}
    </p>
  );
}

export function Pagination({
  page,
  totalPages,
  total,
  makeHref,
}: {
  page: number;
  totalPages: number;
  total: number;
  makeHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav className="mt-lg flex items-center gap-sm" aria-label="Pagination">
      {prev ? (
        <a href={makeHref(prev)} className="btn-secondary" rel="prev">
          Previous
        </a>
      ) : (
        <span className="btn-secondary opacity-50" aria-disabled="true">
          Previous
        </span>
      )}
      <span className="text-sm text-muted-foreground" aria-live="polite">
        Page {page} of {totalPages}
      </span>
      {next ? (
        <a href={makeHref(next)} className="btn-secondary" rel="next">
          Next
        </a>
      ) : (
        <span className="btn-secondary opacity-50" aria-disabled="true">
          Next
        </span>
      )}
    </nav>
  );
}

export function FacetSummary({ facets }: { facets: { hiddenGems: number; bookable: number } }) {
  return (
    <div className="flex flex-wrap gap-xs">
      <Badge tone="accent">{facets.hiddenGems} hidden gems</Badge>
      <Badge tone="muted">{facets.bookable} with a bookable stay</Badge>
    </div>
  );
}
