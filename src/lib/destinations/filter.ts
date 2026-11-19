import { z } from "zod";
import {
  ACCESS_LEVELS,
  type AccessLevel,
  DIFFICULTIES,
  type Difficulty,
  REMOTENESS,
  type Remoteness,
  VISITATION_LEVELS,
  type VisitationLevel,
  districtById,
  provinceById,
} from "@/lib/nepal";
import { paginationSchema, parseListParam } from "@/lib/utils";

/**
 * Destination filter contract.
 *
 * One schema validates both the public website query string and the public API
 * query string, so the two cannot drift apart. Unknown values are dropped rather
 * than throwing, because a mistyped filter should return a filtered page, not a
 * 500 — except for the enumerated fields, where an invalid value is a client bug
 * and is reported as a 422 by the API layer.
 */

const oneOf = <T extends readonly string[]>(values: T, field: string) =>
  z
    .string()
    .optional()
    .transform((raw, ctx): T[number] | undefined => {
      if (raw === undefined || raw.trim() === "") return undefined;
      if ((values as readonly string[]).includes(raw)) return raw as T[number];
      ctx.addIssue({ code: "custom", message: `invalid ${field}: ${raw}` });
      return z.NEVER;
    });

export const destinationFilterSchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    // Province and district are free-text identifiers resolved against the
    // taxonomy by the repository. Deliberately not length-constrained here: the
    // known ids are long (e.g. SUDURPASHCHIM) and an exact-match enum would have
    // to be regenerated every time the taxonomy changes.
    province: z.string().trim().min(1).max(40).optional(),
    district: z.string().trim().min(1).max(40).optional(),
    remoteness: z.array(z.enum(REMOTENESS)).optional(),
    accessLevel: z.array(z.enum(ACCESS_LEVELS)).optional(),
    visitationLevel: z.array(z.enum(VISITATION_LEVELS)).optional(),
    hiddenGem: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => (value === undefined ? undefined : value === "true")),
    permitRequired: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => (value === undefined ? undefined : value === "true")),
    bookable: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => (value === undefined ? undefined : value === "true")),
    sort: z.enum(["name", "remoteness", "visitation", "province"]).default("name"),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(12),
  })
  .strict();

export type DestinationFilter = z.infer<typeof destinationFilterSchema>;

/** Strict variant for the public API, which rejects unknown params. */
export const apiDestinationFilterSchema = destinationFilterSchema;

/**
 * Build a filter from a plain record (searchParams).
 * Invalid enum values throw, so callers can map that to a 400/422.
 */
export function parseDestinationFilter(input: Record<string, unknown>): DestinationFilter {
  const raw: Record<string, unknown> = { ...input };
  for (const key of ["remoteness", "accessLevel", "visitationLevel"] as const) {
    const value = raw[key];
    if (typeof value === "string") raw[key] = parseListParam(value);
  }
  return destinationFilterSchema.parse(raw);
}

const REMOTENESS_RANK: Record<Remoteness, number> = {
  easy: 0,
  moderate: 1,
  remote: 2,
  very_remote: 3,
};

const VISITATION_RANK: Record<VisitationLevel, number> = {
  iconic: 0,
  established: 1,
  emerging: 2,
  hidden: 3,
};

export type DestinationRecord = {
  slug: string;
  name: string;
  nepaliName: string;
  province: string;
  district: string;
  latitude: number;
  longitude: number;
  elevationM: number;
  remoteness: Remoteness;
  accessLevel: AccessLevel;
  visitationLevel: VisitationLevel;
  hiddenGem: boolean;
  permitRequired: boolean;
  bestSeason: string[];
  nearestSettlement: string;
  localCommunity: string;
  localHouseholdsSupported: number;
  whyHidden: string;
  summary: string;
  coordinatesVerified: boolean;
  hasBookableHotel?: boolean;
};

export type DestinationListResult = {
  data: DestinationRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: {
    provinces: Array<{ id: string; name: string; count: number }>;
    remoteness: Array<{ value: Remoteness; count: number }>;
    visitationLevel: Array<{ value: VisitationLevel; count: number }>;
    hiddenGems: number;
    bookable: number;
  };
};

export function matchesFilter(
  destination: DestinationRecord,
  filter: DestinationFilter,
): boolean {
  if (filter.province) {
    if (!provinceById(filter.province)) return false;
    if (destination.province !== filter.province) return false;
  }
  if (filter.district) {
    if (!districtById(filter.district)) return false;
    if (destination.district !== filter.district) return false;
  }
  if (filter.remoteness?.length && !filter.remoteness.includes(destination.remoteness)) return false;
  if (filter.accessLevel?.length && !filter.accessLevel.includes(destination.accessLevel)) return false;
  if (
    filter.visitationLevel?.length &&
    !filter.visitationLevel.includes(destination.visitationLevel)
  ) {
    return false;
  }
  if (filter.hiddenGem !== undefined) {
    const isHidden = destination.hiddenGem || destination.visitationLevel === "hidden";
    if (isHidden !== filter.hiddenGem) return false;
  }
  if (filter.permitRequired !== undefined && destination.permitRequired !== filter.permitRequired) {
    return false;
  }
  if (filter.bookable !== undefined) {
    const bookable = destination.hasBookableHotel === true;
    if (bookable !== filter.bookable) return false;
  }
  if (filter.q) {
    const needle = filter.q.toLowerCase();
    const haystack = [
      destination.name,
      destination.nepaliName,
      destination.summary,
      destination.nearestSettlement,
      destination.whyHidden,
      destination.district,
      destination.province,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

export function sortDestinations(
  list: DestinationRecord[],
  sort: DestinationFilter["sort"],
): DestinationRecord[] {
  const sorted = [...list];
  switch (sort) {
    case "remoteness":
      sorted.sort(
        (a, b) => REMOTENESS_RANK[b.remoteness] - REMOTENESS_RANK[a.remoteness] || a.name.localeCompare(b.name),
      );
      break;
    case "visitation":
      sorted.sort(
        (a, b) => VISITATION_RANK[a.visitationLevel] - VISITATION_RANK[b.visitationLevel] || a.name.localeCompare(b.name),
      );
      break;
    case "province":
      sorted.sort((a, b) => a.province.localeCompare(b.province) || a.name.localeCompare(b.name));
      break;
    default:
      sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  return sorted;
}

/** Facet counts describe the whole set, not just the current page. */
export function computeFacets(list: DestinationRecord[]) {
  const byProvince = new Map<string, number>();
  const byRemoteness = new Map<string, number>();
  const byVisitation = new Map<string, number>();
  let hiddenGems = 0;
  let bookable = 0;

  for (const destination of list) {
    byProvince.set(destination.province, (byProvince.get(destination.province) ?? 0) + 1);
    byRemoteness.set(destination.remoteness, (byRemoteness.get(destination.remoteness) ?? 0) + 1);
    byVisitation.set(
      destination.visitationLevel,
      (byVisitation.get(destination.visitationLevel) ?? 0) + 1,
    );
    if (destination.hiddenGem || destination.visitationLevel === "hidden") hiddenGems += 1;
    if (destination.hasBookableHotel === true) bookable += 1;
  }

  return {
    provinces: [...byProvince.entries()]
      .map(([id, count]) => ({ id, name: id, count }))
      .sort((a, b) => b.count - a.count),
    remoteness: [...byRemoteness.entries()]
      .map(([value, count]) => ({ value: value as Remoteness, count }))
      .sort((a, b) => REMOTENESS_RANK[a.value] - REMOTENESS_RANK[b.value]),
    visitationLevel: [...byVisitation.entries()]
      .map(([value, count]) => ({ value: value as VisitationLevel, count }))
      .sort((a, b) => VISITATION_RANK[a.value] - VISITATION_RANK[b.value]),
    hiddenGems,
    bookable,
  };
}

export function queryDestinations(
  source: DestinationRecord[],
  filter: DestinationFilter,
): DestinationListResult {
  const filtered = source.filter((destination) => matchesFilter(destination, filter));
  const sorted = sortDestinations(filtered, filter.sort);
  const start = (filter.page - 1) * filter.pageSize;
  const page = sorted.slice(start, start + filter.pageSize);
  return {
    data: page,
    total: filtered.length,
    page: filter.page,
    pageSize: filter.pageSize,
    totalPages: Math.max(1, Math.ceil(filtered.length / filter.pageSize)),
    facets: computeFacets(filtered),
  };
}

/** Empty-state helper so pages never render an ambiguous blank screen. */
export function emptyResult(filter: DestinationFilter): DestinationListResult {
  return {
    data: [],
    total: 0,
    page: filter.page,
    pageSize: filter.pageSize,
    totalPages: 1,
    facets: { provinces: [], remoteness: [], visitationLevel: [], hiddenGems: 0, bookable: 0 },
  };
}

export function defaultFilter(): DestinationFilter {
  return destinationFilterSchema.parse({ sort: "name", page: 1, pageSize: 12 });
}

export const difficultyRank: Record<Difficulty, number> = {
  easy: 0,
  moderate: 1,
  hard: 2,
  expert: 3,
};

export const trailFilters = {
  difficulties: DIFFICULTIES,
} as const;
