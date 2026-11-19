import { NextResponse } from "next/server";
import { getCoverage, getPriorityProvinces } from "@/lib/destinations/repository";

export const dynamic = "force-dynamic";

/** GET /api/v1/regions/coverage — the measurable form of mission goal #2. */
export async function GET() {
  const coverage = getCoverage();
  return NextResponse.json(
    {
      ...coverage,
      priorityProvinces: getPriorityProvinces().map((province) => ({
        id: province.id,
        name: province.name,
        region: province.region,
        destinations: province.destinations,
        zeroCoverageDistricts: province.zeroCoverageDistricts.length,
      })),
    },
    { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=1800" } },
  );
}
