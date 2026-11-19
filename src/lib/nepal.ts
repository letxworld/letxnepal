/**
 * Nepal administrative and discovery taxonomy.
 *
 * This is the domain data the whole product runs on. It is deliberately a static,
 * versioned module rather than a database table: the seven provinces and their
 * districts are fixed facts, and having them in code lets the coverage KPI and the
 * destination filters work before the database is wired up.
 *
 * District counts: 77 districts across 7 provinces (Federal Democratic Republic of
 * Nepal, Constitution 2015). Province numbers 1-7 are the official designations;
 * Koshi and Madhesh are also officially numbered 1 and 2.
 */

export const PROVINCES = [
  { id: "KOSHI", number: 1, name: "Koshi", nepaliName: "कोशी", region: "eastern" },
  { id: "MADHESH", number: 2, name: "Madhesh", nepaliName: "मधेश", region: "southern" },
  { id: "BAGMATI", number: 3, name: "Bagmati", nepaliName: "बागमती", region: "central" },
  { id: "GANDAKI", number: 4, name: "Gandaki", nepaliName: "गण्डकी", region: "western" },
  { id: "LUMBINI", number: 5, name: "Lumbini", nepaliName: "लुम्बिनी", region: "western" },
  { id: "KARNALI", number: 6, name: "Karnali", nepaliName: "कर्णाली", region: "mid-western" },
  { id: "SUDURPASHCHIM", number: 7, name: "Sudurpashchim", nepaliName: "सुदूरपश्चिम", region: "far-western" },
] as const;

export type ProvinceId = (typeof PROVINCES)[number]["id"];

/** Districts per province. Ordered west -> east within each province. */
export const DISTRICTS: ReadonlyArray<{
  id: string;
  name: string;
  province: ProvinceId;
}> = [
  // Koshi (14)
  { id: "BHOJPUR", name: "Bhojpur", province: "KOSHI" },
  { id: "DHANKUTA", name: "Dhankuta", province: "KOSHI" },
  { id: "ILAM", name: "Ilam", province: "KOSHI" },
  { id: "JHAPA", name: "Jhapa", province: "KOSHI" },
  { id: "KHOTANG", name: "Khotang", province: "KOSHI" },
  { id: "MORANG", name: "Morang", province: "KOSHI" },
  { id: "OKHLDHUNGA", name: "Okhaldhunga", province: "KOSHI" },
  { id: "PANCHTHAR", name: "Panchthar", province: "KOSHI" },
  { id: "SANKHUWASABHA", name: "Sankhuwasabha", province: "KOSHI" },
  { id: "SOLUKHUMBU", name: "Solukhumbu", province: "KOSHI" },
  { id: "SUNSARI", name: "Sunsari", province: "KOSHI" },
  { id: "TAPLEJUNG", name: "Taplejung", province: "KOSHI" },
  { id: "TERHATHUM", name: "Terhathum", province: "KOSHI" },
  { id: "UDAYAPUR", name: "Udayapur", province: "KOSHI" },
  // Madhesh (8)
  { id: "BARA", name: "Bara", province: "MADHESH" },
  { id: "DHANUSA", name: "Dhanusa", province: "MADHESH" },
  { id: "MAHOTTARI", name: "Mahottari", province: "MADHESH" },
  { id: "PARSA", name: "Parsa", province: "MADHESH" },
  { id: "RAUTAHAT", name: "Rautahat", province: "MADHESH" },
  { id: "SAPTARI", name: "Saptari", province: "MADHESH" },
  { id: "SARLAHI", name: "Sarlahi", province: "MADHESH" },
  { id: "SIRHA", name: "Siraha", province: "MADHESH" },
  // Bagmati (13)
  { id: "BHAKTAPUR", name: "Bhaktapur", province: "BAGMATI" },
  { id: "CHITWAN", name: "Chitwan", province: "BAGMATI" },
  { id: "DHADING", name: "Dhading", province: "BAGMATI" },
  { id: "DOLAKHA", name: "Dolakha", province: "BAGMATI" },
  { id: "KATHMANDU", name: "Kathmandu", province: "BAGMATI" },
  { id: "KAVREPALANCHOK", name: "Kavrepalanchok", province: "BAGMATI" },
  { id: "LALITPUR", name: "Lalitpur", province: "BAGMATI" },
  { id: "MAKWANPUR", name: "Makwanpur", province: "BAGMATI" },
  { id: "NUWAKOT", name: "Nuwakot", province: "BAGMATI" },
  { id: "RAMECHHAP", name: "Ramechhap", province: "BAGMATI" },
  { id: "RASUWA", name: "Rasuwa", province: "BAGMATI" },
  { id: "SINDHULI", name: "Sindhuli", province: "BAGMATI" },
  { id: "SINDHUPALCHOK", name: "Sindhupalchok", province: "BAGMATI" },
  // Gandaki (11)
  { id: "BAGLUNG", name: "Baglung", province: "GANDAKI" },
  { id: "GISSING", name: "Gorkha", province: "GANDAKI" },
  { id: "KASKI", name: "Kaski", province: "GANDAKI" },
  { id: "LAMJUNG", name: "Lamjung", province: "GANDAKI" },
  { id: "MANANG", name: "Manang", province: "GANDAKI" },
  { id: "MUSTANG", name: "Mustang", province: "GANDAKI" },
  { id: "MYAGDI", name: "Myagdi", province: "GANDAKI" },
  { id: "NAWALPARASI_E", name: "Nawalparasi (East)", province: "GANDAKI" },
  { id: "PARBAT", name: "Parbat", province: "GANDAKI" },
  { id: "SYANJA", name: "Syangja", province: "GANDAKI" },
  { id: "TANAHU", name: "Tanahu", province: "GANDAKI" },
  // Lumbini (12)
  { id: "ARGHAKHANCHI", name: "Arghakhanchi", province: "LUMBINI" },
  { id: "BANKE", name: "Banke", province: "LUMBINI" },
  { id: "BARDIYA", name: "Bardiya", province: "LUMBINI" },
  { id: "DANG", name: "Dang", province: "LUMBINI" },
  { id: "GULMI", name: "Gulmi", province: "LUMBINI" },
  { id: "KAPILVASTU", name: "Kapilvastu", province: "LUMBINI" },
  { id: "NAWALPARASI_W", name: "Nawalparasi (West)", province: "LUMBINI" },
  { id: "PALPA", name: "Palpa", province: "LUMBINI" },
  { id: "PYUTHAN", name: "Pyuthan", province: "LUMBINI" },
  { id: "ROLPA", name: "Rolpa", province: "LUMBINI" },
  { id: "RUKUM_E", name: "Rukum (East)", province: "LUMBINI" },
  { id: "RUPANDEHI", name: "Rupandehi", province: "LUMBINI" },
  // Karnali (10)
  { id: "DAILEKH", name: "Dailekh", province: "KARNALI" },
  { id: "DOLPA", name: "Dolpa", province: "KARNALI" },
  { id: "HUMLA", name: "Humla", province: "KARNALI" },
  { id: "JAJARKOT", name: "Jajarkot", province: "KARNALI" },
  { id: "JUMLA", name: "Jumla", province: "KARNALI" },
  { id: "KALIKOT", name: "Kalikot", province: "KARNALI" },
  { id: "MUGU", name: "Mugu", province: "KARNALI" },
  { id: "RUKUM_W", name: "Rukum (West)", province: "KARNALI" },
  { id: "SALYAN", name: "Salyan", province: "KARNALI" },
  { id: "SURKHET", name: "Surkhet", province: "KARNALI" },
  // Sudurpashchim (9)
  { id: "ACHHAM", name: "Achham", province: "SUDURPASHCHIM" },
  { id: "BAITADI", name: "Baitadi", province: "SUDURPASHCHIM" },
  { id: "BAJHANG", name: "Bajhang", province: "SUDURPASHCHIM" },
  { id: "BAJURA", name: "Bajura", province: "SUDURPASHCHIM" },
  { id: "DADELDHURA", name: "Dadeldhura", province: "SUDURPASHCHIM" },
  { id: "DARCHULA", name: "Darchula", province: "SUDURPASHCHIM" },
  { id: "DOTI", name: "Doti", province: "SUDURPASHCHIM" },
  { id: "KAILALI", name: "Kailali", province: "SUDURPASHCHIM" },
  { id: "KANCHANPUR", name: "Kanchanpur", province: "SUDURPASHCHIM" },
] as const;

export type DistrictId = (typeof DISTRICTS)[number]["id"];

export const PROVINCE_COUNT = PROVINCES.length;
export const DISTRICT_COUNT = DISTRICTS.length;

export function provinceById(id: string) {
  return PROVINCES.find((province) => province.id === id);
}

export function districtsByProvince(provinceId: string) {
  return DISTRICTS.filter((district) => district.province === provinceId);
}

export function districtById(id: string) {
  return DISTRICTS.find((district) => district.id === id);
}

/** Provinces ordered far-west first — used to prioritise hidden-gem promotion. */
export function provincesByRemotenessPriority() {
  const weight: Record<string, number> = {
    farwestern: 0,
    midwestern: 1,
    western: 2,
    central: 3,
    eastern: 4,
    southern: 5,
  };
  return [...PROVINCES].sort(
    (a, b) => (weight[a.region] ?? 9) - (weight[b.region] ?? 9),
  );
}

/**
 * Discovery taxonomy. These are the fields that make "hidden" a first-class,
 * filterable concept rather than a marketing label.
 */
export const REMOTENESS = [
  "easy",
  "moderate",
  "remote",
  "very_remote",
] as const;
export type Remoteness = (typeof REMOTENESS)[number];

export const ACCESS_LEVELS = [
  "road",
  "jeep",
  "trail",
  "flight",
  "boat",
] as const;
export type AccessLevel = (typeof ACCESS_LEVELS)[number];

export const VISITATION_LEVELS = [
  "iconic",
  "established",
  "emerging",
  "hidden",
] as const;
export type VisitationLevel = (typeof VISITATION_LEVELS)[number];

export const DIFFICULTIES = ["easy", "moderate", "hard", "expert"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const BOOKING_TYPES = ["hotel", "package", "bus", "ride", "cruise"] as const;
export type BookingType = (typeof BOOKING_TYPES)[number];

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
  "refunded",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const ORGANIZATION_TYPES = ["hotel", "lodge", "guesthouse", "agency", "cruise"] as const;
export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

export const ROLES = ["super_admin", "admin", "org_admin", "guide", "customer"] as const;
export type Role = (typeof ROLES)[number];

export const LOCALES = ["en", "ne"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** A destination counts as a hidden gem when either flag is set. */
export function isHiddenGem(visitationLevel: VisitationLevel, hiddenGem: boolean): boolean {
  return hiddenGem || visitationLevel === "hidden";
}
