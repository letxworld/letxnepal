import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { districtName, listTrails, provinceName } from "@/lib/destinations/repository";

export const metadata: Metadata = {
  title: "Trails",
  description:
    "Multi-day walking routes across Nepal, with difficulty, distance, duration and how remote each one is.",
  alternates: { canonical: "/trails" },
};

const DIFFICULTY_TONE: Record<string, "primary" | "accent" | "destructive" | "muted"> = {
  easy: "primary",
  moderate: "muted",
  hard: "accent",
  expert: "destructive",
};

export default function TrailsPage() {
  const trails = listTrails();

  return (
    <div className="space-y-lg">
      <header className="max-w-3xl">
        <h1 className="text-2xl font-semibold text-foreground">Trails</h1>
        <p className="mt-md text-base text-muted-foreground">
          {trails.length} routes, from the classic Annapurna Base Camp walk to two-week commitments that
          almost nobody completes. Remote routes are marked, because remoteness is the point of this
          platform.
        </p>
      </header>

      <ul className="grid gap-md lg:grid-cols-2">
        {trails.map((trail) => (
          <li key={trail.slug}>
            <Card className="h-full">
              <div className="mb-sm flex flex-wrap items-center gap-xs">
                <Badge tone={DIFFICULTY_TONE[trail.difficulty] ?? "muted"}>
                  {trail.difficulty}
                </Badge>
                {trail.remote ? <Badge tone="accent">Remote route</Badge> : null}
              </div>
              <h2 className="text-lg font-semibold text-card-foreground">{trail.name}</h2>
              <p className="mt-xs text-sm text-muted-foreground">{trail.summary}</p>
              <dl className="mt-md grid grid-cols-2 gap-sm text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Distance</dt>
                  <dd>{trail.distanceKm} km</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Duration</dt>
                  <dd>{trail.durationDays} days</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Highest point</dt>
                  <dd>{trail.highestPointM.toLocaleString()} m</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Region</dt>
                  <dd>
                    {provinceName(trail.province)} · {districtName(trail.district)}
                  </dd>
                </div>
              </dl>
              <p className="mt-md text-sm text-muted-foreground">
                <Link
                  href={`/destinations?district=${trail.district}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Destinations in {districtName(trail.district)}
                </Link>
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
