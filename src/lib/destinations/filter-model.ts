import { ACCESS_LEVELS, REMOTENESS, VISITATION_LEVELS } from "@/lib/nepal";

/**
 * Pure filter types and serialisation.
 *
 * This module has no React and no "use client" directive, so both the server page and the
 * client components can import it. Keep it free of hooks.
 */

export type Filters = {
  q: string;
  province: string;
  district: string;
  remoteness: string[];
  accessLevel: string[];
  visitationLevel: string[];
  hiddenGem: boolean;
  permitRequired: boolean;
  bookable: boolean;
  sort: "name" | "remoteness" | "visitation" | "province";
};

export function emptyFilters(): Filters {
  return {
    q: "",
    province: "",
    district: "",
    remoteness: [],
    accessLevel: [],
    visitationLevel: [],
    hiddenGem: false,
    permitRequired: false,
    bookable: false,
    sort: "remoteness",
  };
}

export function filtersFromSearchParams(params: URLSearchParams): Filters {
  const list = (key: string) =>
    params
      .get(key)
      ?.split(",")
      .map((value) => value.trim())
      .filter(Boolean) ?? [];
  const bool = (key: string) => params.get(key) === "true";
  const sortParam = params.get("sort");

  return {
    q: params.get("q") ?? "",
    province: params.get("province") ?? "",
    district: params.get("district") ?? "",
    remoteness: list("remoteness").filter((v): v is (typeof REMOTENESS)[number] =>
      (REMOTENESS as readonly string[]).includes(v),
    ),
    accessLevel: list("accessLevel").filter((v): v is (typeof ACCESS_LEVELS)[number] =>
      (ACCESS_LEVELS as readonly string[]).includes(v),
    ),
    visitationLevel: list("visitationLevel").filter((v): v is (typeof VISITATION_LEVELS)[number] =>
      (VISITATION_LEVELS as readonly string[]).includes(v),
    ),
    hiddenGem: bool("hiddenGem"),
    permitRequired: bool("permitRequired"),
    bookable: bool("bookable"),
    sort:
      sortParam === "name" || sortParam === "visitation" || sortParam === "province"
        ? sortParam
        : "remoteness",
  };
}

export function filtersToSearchParams(filters: Filters, page?: number): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.province) params.set("province", filters.province);
  if (filters.district) params.set("district", filters.district);
  if (filters.remoteness.length) params.set("remoteness", filters.remoteness.join(","));
  if (filters.accessLevel.length) params.set("accessLevel", filters.accessLevel.join(","));
  if (filters.visitationLevel.length) params.set("visitationLevel", filters.visitationLevel.join(","));
  if (filters.hiddenGem) params.set("hiddenGem", "true");
  if (filters.permitRequired) params.set("permitRequired", "true");
  if (filters.bookable) params.set("bookable", "true");
  if (filters.sort !== "remoteness") params.set("sort", filters.sort);
  if (page && page > 1) params.set("page", String(page));
  return params;
}

export function describeFilters(filters: Filters): string[] {
  const out: string[] = [];
  if (filters.q) out.push(`“${filters.q}”`);
  if (filters.province) out.push(filters.province);
  if (filters.district) out.push(filters.district);
  for (const value of filters.remoteness) out.push(`Remoteness: ${value.replace("_", " ")}`);
  for (const value of filters.accessLevel) out.push(`Access: ${value}`);
  for (const value of filters.visitationLevel) out.push(`Known: ${value}`);
  if (filters.hiddenGem) out.push("Hidden gems");
  if (filters.permitRequired) out.push("Permit required");
  if (filters.bookable) out.push("Bookable stay");
  return out;
}

export function activeFilterCount(filters: Filters): number {
  return describeFilters(filters).length + (filters.sort !== "remoteness" ? 1 : 0);
}

export function isDefaultFilters(filters: Filters): boolean {
  return activeFilterCount(filters) === 0;
}
