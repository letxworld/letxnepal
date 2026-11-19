import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AvailabilityCalendar } from "@/components/org/availability-calendar";
import { Card } from "@/components/ui/card";
import { PageBackdrop } from "@/components/public/page-backdrop";
import { listDestinations } from "@/lib/destinations/repository";
import { DISTRICTS, PROVINCES, provinceById } from "@/lib/nepal";
import {
  buildSampleCalendar,
  SAMPLE_PROPERTIES,
} from "@/lib/hotels/sample-data";

export const metadata: Metadata = {
  title: "Owner dashboard",
  robots: { index: false, follow: false },
};

/**
 * Hotel owner dashboard.
 *
 * Shows the properties the owner controls, and for the selected room a per-date calendar of
 * rooms and prices. Writes go to the authenticated partner API under /api/v1/org — the
 * public /api/v1 surface is read-only.
 */
export default async function OwnerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const propertyId = typeof raw.property === "string" ? raw.property : SAMPLE_PROPERTIES[0]!.id;
  const roomId = typeof raw.room === "string" ? raw.room : SAMPLE_PROPERTIES[0]!.roomTypes[0]!.id;

  const property = SAMPLE_PROPERTIES.find((entry) => entry.id === propertyId) ?? SAMPLE_PROPERTIES[0]!;
  const room = property.roomTypes.find((entry) => entry.id === roomId) ?? property.roomTypes[0]!;

  const province = provinceById(property.province);
  const district = DISTRICTS.find((entry) => entry.id === property.district);
  const nearbyDestinations = listDestinations({ sort: "name", page: 1, pageSize: 50 }).data.filter(
    (destination) => destination.province === property.province,
  );

  return (
    <div className="space-y-lg">
      <PageBackdrop />

      <header className="max-w-3xl">
        <p className="mb-xs text-sm font-medium uppercase tracking-wide text-primary">
          Hotel owner
        </p>
        <h1 className="text-2xl font-semibold text-foreground">Your properties</h1>
        <p className="mt-md text-base text-muted-foreground">
          Set per-date room availability and prices. These feed the public availability search
          and the partner API that other platforms read from.
        </p>
      </header>

      <div className="grid gap-lg lg:grid-cols-[16rem_1fr]">
        <nav aria-label="Properties" className="space-y-sm">
          {SAMPLE_PROPERTIES.map((entry) => (
            <a
              key={entry.id}
              href={`/org/hotels?property=${entry.id}&room=${entry.roomTypes[0]!.id}`}
              className={`card block py-sm transition-colors hover:border-primary ${
                entry.id === property.id ? "border-primary" : ""
              }`}
              aria-current={entry.id === property.id ? "page" : undefined}
            >
              <p className="text-sm font-medium text-card-foreground">{entry.name}</p>
              <p className="mt-xs text-xs text-muted-foreground">
                {province?.name ?? entry.province} · {district?.name ?? entry.district}
              </p>
            </a>
          ))}
        </nav>

        <div className="space-y-lg">
          <AvailabilityCalendar
            property={property}
            room={room}
            initialDays={buildSampleCalendar(new Date().toISOString().slice(0, 10), room)}
          />

          <Card>
            <h2 className="text-lg font-semibold text-card-foreground">Where this appears</h2>
            <p className="mt-xs text-sm text-muted-foreground">
              Your availability is published to the read-only public API and shown on these
              destination pages:
            </p>
            <ul className="mt-md flex flex-wrap gap-xs">
              {nearbyDestinations.length > 0 ? (
                nearbyDestinations.map((destination) => (
                  <li key={destination.slug}>
                    <a
                      href={`/destinations/${destination.slug}`}
                      className="inline-flex min-h-[44px] items-center rounded-md border border-border bg-card px-sm text-sm text-card-foreground hover:border-primary"
                    >
                      {destination.name}
                    </a>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">
                  No destinations are listed in {province?.name ?? property.province} yet.
                </li>
              )}
            </ul>
            <p className="mt-md text-xs text-muted-foreground">
              Provinces available: {PROVINCES.length}. Districts: {DISTRICTS.length}.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
