import type { Metadata } from "next";
import Link from "next/link";
import { DestinationRail } from "@/components/public/destination-rail";
import { getCoverage, getHomeSections, getPriorityProvinces } from "@/lib/destinations/repository";
import { PROVINCES } from "@/lib/nepal";

export const metadata: Metadata = {
  // Do not set a page title here: the root layout template appends "| letxNepal",
  // so the site name stays visible in the tab and in search results.
  description:
    "A national platform for Nepal tourism. Iconic destinations and hidden, remote places across all seven provinces, with access, permit and community information.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const sections = getHomeSections();
  const coverage = getCoverage();
  const priority = getPriorityProvinces().filter((p) => p.destinations > 0).slice(0, 3);

  return (
    <div className="space-y-2xl">
      <section aria-labelledby="hero-heading" className="text-left">
        <p className="mb-xs text-sm font-medium uppercase tracking-wide text-primary">
          Nepal · all seven provinces
        </p>
        <h1 id="hero-heading" className="max-w-3xl text-3xl font-semibold leading-tight text-foreground">
          Find the places Nepal has not yet put on the postcards.
        </h1>
        <p className="mt-md max-w-2xl text-base text-muted-foreground">
          {coverage.totals.destinations} destinations across {coverage.totals.provincesCovered} of{" "}
          {coverage.totals.provincesTotal} provinces, including {coverage.totals.hiddenGems} hidden gems.
          Every listing carries access, permit and community information so you can go there responsibly.
        </p>
        <div className="mt-lg flex flex-wrap gap-sm">
          <Link href="/destinations/hidden" className="btn-accent">
            Explore hidden gems
          </Link>
          <Link href="/destinations" className="btn-secondary">
            All destinations
          </Link>
        </div>
      </section>

      {sections.map((section) => (
        <DestinationRail
          key={section.key}
          title={section.title}
          description={section.description}
          destinations={section.destinations}
          href={section.key === "hidden" ? "/destinations/hidden" : "/destinations"}
        />
      ))}

      <section aria-labelledby="coverage-heading">
        <div className="mb-md flex flex-wrap items-end justify-between gap-sm">
          <div>
            <h2 id="coverage-heading" className="text-xl font-semibold text-foreground">
              Coverage across Nepal
            </h2>
            <p className="mt-xs text-sm text-muted-foreground">
              {coverage.totals.districtsCovered} of {coverage.totals.districtsTotal} districts have a
              listed destination. The rest are the opportunity.
            </p>
          </div>
          <Link
            href="/coverage"
            className="min-h-[44px] text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            See the full gap list
          </Link>
        </div>

        <ol className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
          {priority.map((province) => (
            <li key={province.id} className="card">
              <p className="text-sm text-muted-foreground">
                Province {province.number} · {province.region}
              </p>
              <p className="text-base font-semibold text-card-foreground">
                {province.name} <span className="ml-xs font-normal">{province.nepaliName}</span>
              </p>
              <p className="mt-xs text-sm text-muted-foreground">
                {province.destinations} destinations · {province.hiddenGems} hidden ·{" "}
                {province.districtsCovered}/{province.districtsTotal} districts
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="provinces-heading">
        <h2 id="provinces-heading" className="mb-md text-xl font-semibold text-foreground">
          Browse by province
        </h2>
        <ul className="grid gap-sm sm:grid-cols-2 lg:grid-cols-4">
          {PROVINCES.map((province) => (
            <li key={province.id}>
              <Link
                href={`/destinations?province=${province.id}`}
                className="card block transition-colors hover:border-primary"
              >
                <span className="text-base font-medium text-card-foreground">
                  {province.number}. {province.name}
                </span>
                <span className="ml-xs text-sm text-muted-foreground">{province.nepaliName}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
