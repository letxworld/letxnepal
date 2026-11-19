import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { HiddenGemBadge } from "@/components/public/hidden-gem-badge";
import {
  districtName,
  getDestination,
  getDestinationsByProvince,
  provinceName,
} from "@/lib/destinations/repository";
import { isHiddenGem } from "@/lib/nepal";

const REMOTENESS_LABEL: Record<string, string> = {
  easy: "Easy access",
  moderate: "Moderate",
  remote: "Remote",
  very_remote: "Very remote",
};

const ACCESS_LABEL: Record<string, string> = {
  road: "Motorable road",
  jeep: "Jeep track",
  trail: "Walking trail only",
  flight: "Domestic flight",
  boat: "Boat",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = getDestination(slug);
  if (!destination) return { title: "Destination not found" };
  return {
    title: destination.name,
    description: destination.summary,
    alternates: { canonical: `/destinations/${destination.slug}` },
    openGraph: { title: destination.name, description: destination.summary },
  };
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = getDestination(slug);
  if (!destination) notFound();

  const hidden = isHiddenGem(destination.visitationLevel, destination.hiddenGem);
  const nearby = getDestinationsByProvince(destination.province).filter(
    (entry) => entry.slug !== destination.slug,
  );

  const facts = [
    { label: "Province", value: `${provinceName(destination.province)} (Province ${destination.province === "KOSHI" ? 1 : destination.province === "MADHESH" ? 2 : destination.province === "BAGMATI" ? 3 : destination.province === "GANDAKI" ? 4 : destination.province === "LUMBINI" ? 5 : destination.province === "KARNALI" ? 6 : 7})` },
    { label: "District", value: districtName(destination.district) },
    { label: "Elevation", value: `${destination.elevationM.toLocaleString()} m` },
    { label: "Remoteness", value: REMOTENESS_LABEL[destination.remoteness] ?? destination.remoteness },
    { label: "Access", value: ACCESS_LABEL[destination.accessLevel] ?? destination.accessLevel },
    { label: "Nearest settlement", value: destination.nearestSettlement },
    { label: "Permit required", value: destination.permitRequired ? "Yes" : "No" },
    {
      label: "Best season",
      value: destination.bestSeason.length ? destination.bestSeason.join(", ") : "Year round",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: destination.name,
    alternateName: destination.nepaliName,
    description: destination.summary,
    containedInPlace: { "@type": "AdministrativeArea", name: provinceName(destination.province) },
    geo: {
      "@type": "GeoCoordinates",
      latitude: destination.latitude,
      longitude: destination.longitude,
      elevation: destination.elevationM,
    },
    publicAccess: true,
  };

  return (
    <article className="space-y-2xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/destinations" className="hover:underline">
          Destinations
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">{destination.name}</span>
      </nav>

      <header className="max-w-3xl">
        <div className="mb-sm flex flex-wrap items-center gap-xs">
          {hidden ? <HiddenGemBadge /> : null}
          <Badge tone={destination.visitationLevel === "iconic" ? "primary" : "muted"}>
            {destination.visitationLevel.replace("_", " ")}
          </Badge>
          {destination.permitRequired ? <Badge tone="outline">Permit required</Badge> : null}
        </div>
        <h1 className="text-3xl font-semibold text-foreground">
          {destination.name}
          <span className="ml-sm text-xl font-normal text-muted-foreground">
            {destination.nepaliName}
          </span>
        </h1>
        <p className="mt-md text-base text-muted-foreground">{destination.summary}</p>
      </header>

      <section aria-labelledby="facts-heading">
        <h2 id="facts-heading" className="mb-md text-lg font-semibold text-foreground">
          Practical information
        </h2>
        <dl className="card grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs text-muted-foreground">{fact.label}</dt>
              <dd className="mt-xs text-sm font-medium text-card-foreground">{fact.value}</dd>
            </div>
          ))}
        </dl>
        {!destination.coordinatesVerified ? (
          <p className="mt-sm text-xs text-muted-foreground">
            Map coordinates are approximate and not yet verified.
          </p>
        ) : null}
      </section>

      <section aria-labelledby="why-heading">
        <h2 id="why-heading" className="mb-md text-lg font-semibold text-foreground">
          Why it is hidden
        </h2>
        <p className="max-w-3xl text-base text-muted-foreground">{destination.whyHidden}</p>
      </section>

      <section aria-labelledby="community-heading">
        <h2 id="community-heading" className="mb-md text-lg font-semibold text-foreground">
          Local community
        </h2>
        <div className="card max-w-3xl">
          <p className="text-base text-card-foreground">{destination.localCommunity}</p>
          {destination.localHouseholdsSupported > 0 ? (
            <p className="mt-sm text-sm text-muted-foreground">
              Staying here is estimated to support {destination.localHouseholdsSupported.toLocaleString()}{" "}
              local households through homestays, guides and suppliers.
            </p>
          ) : null}
        </div>
      </section>

      {nearby.length > 0 ? (
        <section aria-labelledby="nearby-heading">
          <h2 id="nearby-heading" className="mb-md text-lg font-semibold text-foreground">
            Also in {provinceName(destination.province)}
          </h2>
          <ul className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
            {nearby.slice(0, 3).map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/destinations/${entry.slug}`}
                  className="card block transition-colors hover:border-primary"
                >
                  <p className="text-base font-medium text-card-foreground">{entry.name}</p>
                  <p className="mt-xs text-sm text-muted-foreground line-clamp-2">{entry.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <EmptyState
          title="No other destinations listed in this province yet"
          description="This is the first entry. Coverage like this is the gap the platform exists to close."
          action={
            <Link href="/coverage" className="btn-secondary">
              See coverage gaps
            </Link>
          }
        />
      )}
    </article>
  );
}
