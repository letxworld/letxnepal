import { ADVENTURES, DESTINATIONS, HOME_SECTIONS, TRAILS } from "@/data/destinations";
import {
  type AccessLevel,
  type Difficulty,
  DISTRICTS,
  PROVINCES,
  type ProvinceId,
  type Remoteness,
  type VisitationLevel,
  districtById,
  isHiddenGem,
  provincesByRemotenessPriority,
  provinceById,
} from "@/lib/nepal";
import {
  defaultFilter,
  emptyResult,
  type DestinationFilter,
  type DestinationListResult,
  type DestinationRecord,
  queryDestinations,
} from "./filter";

/**
 * Read-only destination repository.
 *
 * Today it serves the curated static dataset. The query, filter, facet and
 * pagination semantics are identical to what the Postgres implementation will do,
 * so the UI and the public API are built once and the storage layer is swapped
 * later without touching them. `docs/architecture.md` records that seam.
 */

export type { DestinationRecord, DestinationFilter, DestinationListResult };

function toRecord(destination: (typeof DESTINATIONS)[number]): DestinationRecord {
  return {
    slug: destination.slug,
    name: destination.name,
    nepaliName: destination.nepaliName,
    province: destination.province,
    district: destination.district,
    latitude: destination.latitude,
    longitude: destination.longitude,
    elevationM: destination.elevationM,
    remoteness: destination.remoteness,
    accessLevel: destination.accessLevel,
    visitationLevel: destination.visitationLevel,
    hiddenGem: destination.hiddenGem,
    permitRequired: destination.permitRequired,
    bestSeason: destination.bestSeason,
    nearestSettlement: destination.nearestSettlement,
    localCommunity: destination.localCommunity,
    localHouseholdsSupported: destination.localHouseholdsSupported,
    whyHidden: destination.whyHidden,
    summary: destination.summary,
    coordinatesVerified: destination.coordinatesVerified,
    hasBookableHotel: destination.localHouseholdsSupported > 0,
  };
}

const ALL: DestinationRecord[] = DESTINATIONS.map(toRecord);

export function listDestinations(filter: DestinationFilter = defaultFilter()): DestinationListResult {
  return queryDestinations(ALL, filter);
}

export function getDestination(slug: string): DestinationRecord | undefined {
  return ALL.find((destination) => destination.slug === slug);
}

export function getDestinationsByProvince(province: string): DestinationRecord[] {
  return ALL.filter((destination) => destination.province === province);
}

export function getHiddenGems(limit?: number): DestinationRecord[] {
  const hidden = ALL.filter((destination) => isHiddenGem(destination.visitationLevel, destination.hiddenGem));
  return typeof limit === "number" ? hidden.slice(0, limit) : hidden;
}

export type SectionKey = (typeof HOME_SECTIONS)[number]["key"];

export function getSection(key: SectionKey): {
  key: SectionKey;
  title: string;
  nepaliTitle: string;
  description: string;
  destinations: DestinationRecord[];
} {
  const section = HOME_SECTIONS.find((entry) => entry.key === key);
  if (!section) throw new Error(`unknown section: ${key}`);
  const filter: DestinationFilter = { ...defaultFilter(), pageSize: 50 };
  const result = queryDestinations(ALL, filter);
  const destinations = result.data.filter((destination) => {
    if (key === "popular") {
      return destination.visitationLevel === "iconic" || destination.visitationLevel === "established";
    }
    if (key === "hidden") {
      return isHiddenGem(destination.visitationLevel, destination.hiddenGem);
    }
    if (key === "adventures") {
      return destination.accessLevel === "trail" || destination.remoteness === "very_remote";
    }
    if (key === "trails") {
      return destination.remoteness === "very_remote" || destination.remoteness === "remote";
    }
    return true;
  });
  return {
    key,
    title: section.title,
    nepaliTitle: section.nepaliTitle,
    description: section.description,
    destinations: destinations.slice(0, 8),
  };
}

export function getHomeSections() {
  return HOME_SECTIONS.map((section) => getSection(section.key));
}

export type TrailRecord = {
  slug: string;
  name: string;
  district: string;
  province: string;
  difficulty: Difficulty;
  distanceKm: number;
  durationDays: number;
  highestPointM: number;
  remote: boolean;
  summary: string;
};

export function listTrails(filter?: { difficulty?: Difficulty[]; remote?: boolean }): TrailRecord[] {
  return TRAILS.filter((trail) => {
    if (filter?.difficulty?.length && !filter.difficulty.includes(trail.difficulty)) return false;
    if (filter?.remote !== undefined && trail.remote !== filter.remote) return false;
    return true;
  });
}

export type AdventureRecord = (typeof ADVENTURES)[number];

export function listAdventures(): AdventureRecord[] {
  return ADVENTURES;
}

export type ProvinceCoverage = {
  id: ProvinceId;
  number: number;
  name: string;
  nepaliName: string;
  region: string;
  destinations: number;
  hiddenGems: number;
  bookable: number;
  districtsTotal: number;
  districtsCovered: number;
  zeroCoverageDistricts: Array<{ id: string; name: string }>;
};

/**
 * Coverage report — the measurable form of mission goal #2 ("grow whole Nepal").
 * Every province is present even when its destination count is zero, and districts
 * with no destination are named explicitly so the gap list is actionable.
 */
export function getCoverage(): {
  provinces: ProvinceCoverage[];
  totals: {
    destinations: number;
    hiddenGems: number;
    bookable: number;
    provincesCovered: number;
    provincesTotal: number;
    districtsCovered: number;
    districtsTotal: number;
    zeroCoverageDistricts: number;
    householdsSupported: number;
  };
} {
  const provinces: ProvinceCoverage[] = PROVINCES.map((province) => {
    const destinations = ALL.filter((destination) => destination.province === province.id);
    const districts = DISTRICTS.filter((district) => district.province === province.id);
    const covered = new Set(destinations.map((destination) => destination.district));
    return {
      id: province.id,
      number: province.number,
      name: province.name,
      nepaliName: province.nepaliName,
      region: province.region,
      destinations: destinations.length,
      hiddenGems: destinations.filter((destination) =>
        isHiddenGem(destination.visitationLevel, destination.hiddenGem),
      ).length,
      bookable: destinations.filter((destination) => destination.hasBookableHotel === true).length,
      districtsTotal: districts.length,
      districtsCovered: covered.size,
      zeroCoverageDistricts: districts
        .filter((district) => !covered.has(district.id))
        .map((district) => ({ id: district.id, name: district.name })),
    };
  });

  const zeroCoverageDistricts = provinces.reduce(
    (sum, province) => sum + province.zeroCoverageDistricts.length,
    0,
  );

  return {
    provinces,
    totals: {
      destinations: ALL.length,
      hiddenGems: ALL.filter((destination) => isHiddenGem(destination.visitationLevel, destination.hiddenGem))
        .length,
      bookable: ALL.filter((destination) => destination.hasBookableHotel === true).length,
      provincesCovered: provinces.filter((province) => province.destinations > 0).length,
      provincesTotal: PROVINCES.length,
      districtsCovered: new Set(ALL.map((destination) => destination.district)).size,
      districtsTotal: DISTRICTS.length,
      zeroCoverageDistricts,
      householdsSupported: ALL.reduce((sum, destination) => sum + destination.localHouseholdsSupported, 0),
    },
  };
}

/** Provinces ordered far-west first, for prioritising promotion. */
export function getPriorityProvinces(): ProvinceCoverage[] {
  const order = new Map(provincesByRemotenessPriority().map((province, index) => [province.id, index]));
  return [...getCoverage().provinces].sort(
    (a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99),
  );
}

export function getFilterOptions() {
  return {
    provinces: PROVINCES.map((province) => ({
      id: province.id,
      name: province.name,
      nepaliName: province.nepaliName,
    })),
    districts: DISTRICTS.map((district) => ({
      id: district.id,
      name: district.name,
      province: district.province,
    })),
    remoteness: REMOTENESS_OPTIONS,
    accessLevels: ACCESS_OPTIONS,
    visitationLevels: VISITATION_OPTIONS,
  };
}

export const REMOTENESS_OPTIONS: Array<{ value: Remoteness; label: string; nepaliLabel: string }> = [
  { value: "easy", label: "Easy access", nepaliLabel: "सजिलो पहुँच" },
  { value: "moderate", label: "Moderate", nepaliLabel: "मध्यम" },
  { value: "remote", label: "Remote", nepaliLabel: "दुर्गम" },
  { value: "very_remote", label: "Very remote", nepaliLabel: "अत्यन्त दुर्गम" },
];

export const ACCESS_OPTIONS: Array<{ value: AccessLevel; label: string }> = [
  { value: "road", label: "Road" },
  { value: "jeep", label: "Jeep track" },
  { value: "trail", label: "Walking trail" },
  { value: "flight", label: "Flight" },
  { value: "boat", label: "Boat" },
];

export const VISITATION_OPTIONS: Array<{ value: VisitationLevel; label: string; nepaliLabel: string }> = [
  { value: "iconic", label: "Iconic", nepaliLabel: "प्रतिष्ठित" },
  { value: "established", label: "Established", nepaliLabel: "स्थापित" },
  { value: "emerging", label: "Emerging", nepaliLabel: "उदीयमान" },
  { value: "hidden", label: "Hidden gem", nepaliLabel: "लुकेको रत्न" },
];

export function provinceName(id: string): string {
  return provinceById(id)?.name ?? id;
}

export function districtName(id: string): string {
  return districtById(id)?.name ?? id;
}

export { emptyResult };
