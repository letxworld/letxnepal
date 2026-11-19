import { isRealDate } from "@/lib/hotels/availability-schema";

/**
 * Deterministic sample calendar for the owner dashboard.
 *
 * A hotel owner needs to see and edit per-date availability and prices. Real data arrives
 * through the authenticated partner API; this sample demonstrates the interaction and the
 * validation rules so the screen and its tests exist before the database is wired.
 *
 * Prices are minor units. Dates are local ISO dates.
 */

export type SampleProperty = {
  id: string;
  name: string;
  district: string;
  province: string;
  roomTypes: SampleRoomType[];
};

export type SampleRoomType = {
  id: string;
  name: string;
  sleeps: number;
  totalRooms: number;
  currency: string;
};

export const SAMPLE_PROPERTIES: SampleProperty[] = [
  {
    id: "a1111111-1111-4111-8111-111111111111",
    name: "Rara Lake Lodge",
    district: "MUGU",
    province: "KARNALI",
    roomTypes: [
      { id: "b1111111-1111-4111-8111-111111111111", name: "Deluxe lake room", sleeps: 2, totalRooms: 6, currency: "NPR" },
      { id: "b2222222-2222-4222-8222-222222222222", name: "Family suite", sleeps: 4, totalRooms: 2, currency: "NPR" },
    ],
  },
  {
    id: "a3333333-3333-4333-8333-333333333333",
    name: "Khaptad Guest House",
    district: "BAJURA",
    province: "SUDURPASHCHIM",
    roomTypes: [
      { id: "b3333333-3333-4333-8333-333333333333", name: "Standard room", sleeps: 2, totalRooms: 8, currency: "NPR" },
    ],
  },
];

export type SampleDay = {
  date: string;
  roomsAvailable: number;
  priceMinor: number;
  currency: string;
  closed: boolean;
};

/** Build a 30-day calendar from a start date, with a plausible price pattern. */
export function buildSampleCalendar(startIso: string, room: SampleRoomType): SampleDay[] {
  if (!isRealDate(startIso)) return [];
  const start = Date.parse(`${startIso}T00:00:00Z`);
  const out: SampleDay[] = [];
  for (let i = 0; i < 30; i += 1) {
    const date = new Date(start + i * 86_400_000).toISOString().slice(0, 10);
    const dayOfWeek = new Date(start + i * 86_400_000).getUTCDay();
    const weekend = dayOfWeek === 5 || dayOfWeek === 6;
    out.push({
      date,
      // Two rooms held back on weekdays, sold out on a couple of weekend nights.
      roomsAvailable: weekend ? (i % 7 === 0 ? 0 : Math.max(1, room.totalRooms - 3)) : room.totalRooms,
      priceMinor: weekend ? 850_000 : 650_000,
      currency: room.currency,
      closed: false,
    });
  }
  return out;
}

/** Today's date in YYYY-MM-DD, local to the server. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function plusDays(iso: string, days: number): string {
  const base = Date.parse(`${iso}T00:00:00Z`);
  if (!Number.isFinite(base)) return iso;
  return new Date(base + days * 86_400_000).toISOString().slice(0, 10);
}
