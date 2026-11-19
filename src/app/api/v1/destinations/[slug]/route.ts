import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { getDestination } from "@/lib/destinations/repository";

export const dynamic = "force-dynamic";

/** GET /api/v1/destinations/{slug} */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const destination = getDestination(slug);
  if (!destination) {
    return NextResponse.json({ error: "not_found", message: `No destination named ${slug}` }, { status: 404 });
  }
  return NextResponse.json(destination, {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=1800" },
  });
}
