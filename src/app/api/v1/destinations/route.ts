import { NextResponse } from "next/server";
import { listDestinations } from "@/lib/destinations/repository";
import { parseDestinationFilter } from "@/lib/destinations/filter";

export const dynamic = "force-dynamic";

/** GET /api/v1/destinations — filtered, paginated destination list. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) raw[key] = value;

  let filter;
  try {
    filter = parseDestinationFilter(raw);
  } catch (error) {
    return NextResponse.json(
      {
        error: "invalid_filter",
        message: error instanceof Error ? error.message : "Could not parse filter parameters.",
      },
      { status: 422 },
    );
  }

  const result = listDestinations(filter);
  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
