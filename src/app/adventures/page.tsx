import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { districtName, listAdventures, provinceName } from "@/lib/destinations/repository";

export const metadata: Metadata = {
  title: "Adventures",
  description:
    "Ways to move through Nepal: air, water, wildlife, climbing and cycling, with the district and province for each.",
  alternates: { canonical: "/adventures" },
};

export default function AdventuresPage() {
  const adventures = listAdventures();

  return (
    <div className="space-y-lg">
      <header className="max-w-3xl">
        <h1 className="text-2xl font-semibold text-foreground">Adventures</h1>
        <p className="mt-md text-base text-muted-foreground">
          {adventures.length} activities. Each is listed with its district so you can combine it with a
          destination visit rather than treating it as a separate trip.
        </p>
      </header>

      <ul className="grid gap-md lg:grid-cols-2">
        {adventures.map((adventure) => (
          <li key={adventure.slug}>
            <Card className="h-full">
              <div className="mb-sm">
                <Badge tone="outline">{adventure.type}</Badge>
              </div>
              <h2 className="text-lg font-semibold text-card-foreground">{adventure.name}</h2>
              <p className="mt-xs text-sm text-muted-foreground">{adventure.summary}</p>
              <p className="mt-md text-sm text-muted-foreground">
                {provinceName(adventure.province)} · {districtName(adventure.district)}{" "}
                <Link
                  href={`/destinations?district=${adventure.district}`}
                  className="ml-xs text-primary underline-offset-4 hover:underline"
                >
                  See destinations
                </Link>
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
