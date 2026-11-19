import { DestinationCard } from "./destination-card";
import { SectionHeading } from "./section-heading";
import type { DestinationRecord } from "@/lib/destinations/repository";

/**
 * One homepage rail. Rendered server-side from the curated dataset; the four rails
 * (Popular, Hidden, Adventures, Trails) are the mission made visible.
 */
export function DestinationRail({
  title,
  description,
  destinations,
  href,
  hrefLabel,
}: {
  title: string;
  description?: string;
  destinations: DestinationRecord[];
  href?: string;
  hrefLabel?: string;
}) {
  if (destinations.length === 0) return null;
  return (
    <section className="mb-2xl" aria-labelledby={`rail-${title.replace(/\s+/g, "-").toLowerCase()}`}>
      <SectionHeading title={title} description={description} href={href} hrefLabel={hrefLabel} />
      <ul className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
        {destinations.map((destination) => (
          <li key={destination.slug}>
            <DestinationCard destination={destination} href={`/destinations/${destination.slug}`} />
          </li>
        ))}
      </ul>
    </section>
  );
}
