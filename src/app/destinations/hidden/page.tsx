import type { Metadata } from "next";
import Link from "next/link";
import { DestinationCard } from "@/components/public/destination-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination, ResultsSummary } from "@/components/public/results-summary";
import { listDestinations } from "@/lib/destinations/repository";
import { isHiddenGem } from "@/lib/nepal";

export const metadata: Metadata = {
  title: "Hidden gems",
  description:
    "Remote, under-visited destinations across Nepal: the places worth the effort, with access levels, permits and the communities that host visitors.",
  alternates: { canonical: "/destinations/hidden" },
};

function buildHref(params: URLSearchParams, page: number) {
  const next = new URLSearchParams(params);
  if (page <= 1) next.delete("page");
  else next.set("page", String(page));
  const qs = next.toString();
  return qs ? `/destinations/hidden?${qs}` : "/destinations/hidden";
}

export default async function HiddenGemsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const page = Number.parseInt(String(raw.page ?? "1"), 10);
  const pageSize = 12;
  const result = listDestinations({ sort: "remoteness", page: Number.isFinite(page) ? page : 1, pageSize });

  const hidden = result.data.filter((destination) => isHiddenGem(destination.visitationLevel, destination.hiddenGem));
  const totalHidden = listDestinations({ sort: "name", page: 1, pageSize: 500 }).data.filter((destination) =>
    isHiddenGem(destination.visitationLevel, destination.hiddenGem),
  ).length;
  const totalPages = Math.max(1, Math.ceil(totalHidden / pageSize));

  const params = new URLSearchParams();

  return (
    <div className="space-y-lg">
      <header className="max-w-3xl">
        <p className="mb-xs text-sm font-medium uppercase tracking-wide text-accent">Mission focus</p>
        <h1 className="text-2xl font-semibold text-foreground">Hidden gems</h1>
        <p className="mt-md text-base text-muted-foreground">
          {totalHidden} destinations that most visitors to Nepal never reach. Each entry states how remote
          it is, how you get there, whether a permit is needed, and which community hosts you — because a
          hidden place only stays worth visiting if the visit benefits the people who live there.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-sm">
        <ResultsSummary total={hidden.length} page={result.page} pageSize={pageSize} />
        <Link href="/destinations?visitationLevel=hidden" className="btn-secondary">
          Filter all destinations
        </Link>
      </div>

      {hidden.length === 0 ? (
        <EmptyState
          title="No hidden gems on this page"
          description="Try the first page of the list."
          action={
            <Link href="/destinations/hidden" className="btn-secondary">
              First page
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
          {hidden.map((destination) => (
            <li key={destination.slug}>
              <DestinationCard destination={destination} href={`/destinations/${destination.slug}`} />
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={result.page}
        totalPages={totalPages}
        total={totalHidden}
        makeHref={(page) => buildHref(params, page)}
      />
    </div>
  );
}
