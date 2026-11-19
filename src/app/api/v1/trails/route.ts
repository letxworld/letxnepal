import { NextResponse } from "next/server";
import { listTrails } from "@/lib/destinations/repository";

export const dynamic = "force-dynamic";

/** GET /api/v1/trails */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get("difficulty");
  const remoteParam = searchParams.get("remote");

  const list = listTrails({
    difficulty: difficulty ? (difficulty.split(",").filter(Boolean) as never[]) : undefined,
    remote: remoteParam === null ? undefined : remoteParam === "true",
  });

  return NextResponse.json({ data: list, total: list.length });
}
