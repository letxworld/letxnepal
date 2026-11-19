import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { DESTINATIONS } from "@/data/destinations";
import { getHiddenGems } from "@/lib/destinations/repository";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Place writing from around Nepal, including the hidden and remote destinations. Admin-authored and published as HTML.",
  alternates: { canonical: "/blogs" },
};

/**
 * Placeholder index. The CMS (Task 5) will publish admin-authored HTML posts here;
 * until then the page explains the plan and links the destinations that will be
 * covered first.
 */
export default function BlogsIndexPage() {
  const upcoming = getHiddenGems(4);

  return (
    <div className="space-y-lg">
      <header className="max-w-3xl">
        <h1 className="text-2xl font-semibold text-foreground">Journal</h1>
        <p className="mt-md text-base text-muted-foreground">
          Long-form writing about places in Nepal, authored by admins and guides and rendered as real
          article pages with a "book hotels nearby" section. Publishing is not live yet.
        </p>
      </header>

      <EmptyState
        title="No articles published yet"
        description="The publishing workflow is the next milestone. The first articles will cover these hidden destinations."
        action={
          <Link href="/destinations/hidden" className="btn-secondary">
            Browse hidden gems
          </Link>
        }
      />

      <section aria-labelledby="upcoming-heading">
        <h2 id="upcoming-heading" className="mb-md text-lg font-semibold text-foreground">
          First in the queue
        </h2>
        <ul className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          {upcoming.map((destination) => (
            <li key={destination.slug}>
              <Link
                href={`/destinations/${destination.slug}`}
                className="card block transition-colors hover:border-primary"
              >
                <p className="text-base font-medium text-card-foreground">{destination.name}</p>
                <p className="mt-xs text-sm text-muted-foreground line-clamp-2">{destination.whyHidden}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-md text-xs text-muted-foreground">
          {DESTINATIONS.length} destinations are documented and ready to be written about.
        </p>
      </section>
    </div>
  );
}
