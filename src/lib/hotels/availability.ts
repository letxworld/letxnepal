import { z } from "zod";
import {
  availabilityDaySchema,
  type AvailabilityDay,
  daysBetween,
  formatMoney,
} from "./availability-schema";

/**
 * Availability domain logic.
 *
 * Pure functions only, so the rules are testable without a database and are identical
 * whether the caller is a Server Action or a Route Handler.
 */

export type AvailabilityCell = {
  date: string;
  roomsAvailable: number;
  priceMinor: number;
  currency: string;
  closed: boolean;
};

export type AvailabilityMap = Map<string, AvailabilityCell>;

/** The single source of truth for whether a date can be sold. */
export function isSellable(cell: AvailabilityCell | undefined): cell is AvailabilityCell {
  return cell !== undefined && !cell.closed && cell.roomsAvailable > 0;
}

/**
 * Validate a stay against availability.
 *
 * This is the double-booking guard. A stay is bookable only when every night in the range
 * has at least one room free. Returns the blocking reasons rather than a boolean, so the
 * UI can tell the guest exactly which nights are short.
 */
export function checkStayAvailability(
  cells: AvailabilityMap,
  from: string,
  to: string,
  roomsWanted = 1,
): { ok: true; nights: string[] } | { ok: false; reasons: string[]; nights: string[] } {
  const dates = nightsInRange(from, to);
  if (dates.length === 0) {
    return { ok: false, reasons: ["The date range is empty."], nights: [] };
  }

  const reasons: string[] = [];
  for (const date of dates) {
    const cell = cells.get(date);
    if (cell === undefined) {
      reasons.push(`${date}: no availability recorded`);
      continue;
    }
    if (cell.closed) {
      reasons.push(`${date}: closed for bookings`);
      continue;
    }
    if (cell.roomsAvailable < roomsWanted) {
      reasons.push(
        `${date}: ${cell.roomsAvailable} of ${roomsWanted} requested room(s) available`,
      );
    }
  }

  if (reasons.length > 0) return { ok: false, reasons, nights: dates };
  return { ok: true, nights: dates };
}

/** Nights in a stay: check-in through the night before check-out. */
export function nightsInRange(checkIn: string, checkOut: string): string[] {
  const nights = daysBetween(checkIn, checkOut) - 1;
  if (nights <= 0) return [];
  const out: string[] = [];
  const start = Date.parse(`${checkIn}T00:00:00Z`);
  for (let i = 0; i < nights; i += 1) {
    out.push(new Date(start + i * 86_400_000).toISOString().slice(0, 10));
  }
  return out;
}

/**
 * Price a stay.
 *
 * Sums the per-night price and applies tax. Everything stays in minor units; the result is
 * rounded once at the end, so a multi-night quote never accumulates floating error.
 */
export function quoteStay(
  cells: AvailabilityMap,
  checkIn: string,
  checkOut: string,
  rooms = 1,
  taxRate = 0,
): { ok: true; subtotalMinor: number; taxMinor: number; totalMinor: number; currency: string; perNight: Array<{ date: string; priceMinor: number }> }
  | { ok: false; reasons: string[] } {
  const nights = nightsInRange(checkIn, checkOut);
  if (nights.length === 0) return { ok: false, reasons: ["The date range is empty."] };

  const perNight: Array<{ date: string; priceMinor: number }> = [];
  const currencies = new Set<string>();
  let subtotal = 0;

  for (const date of nights) {
    const cell = cells.get(date);
    if (!isSellable(cell)) {
      return { ok: false, reasons: [`No sellable availability on ${date}.`] };
    }
    currencies.add(cell.currency);
    const nightTotal = cell.priceMinor * rooms;
    subtotal += nightTotal;
    perNight.push({ date, priceMinor: nightTotal });
  }

  if (currencies.size > 1) {
    return {
      ok: false,
      reasons: ["The selected nights use more than one currency. Choose a single currency."],
    };
  }

  const currency = [...currencies][0] ?? "NPR";
  const tax = Math.round(subtotal * taxRate);
  return {
    ok: true,
    subtotalMinor: subtotal,
    taxMinor: tax,
    totalMinor: subtotal + tax,
    currency,
    perNight,
  };
}

/**
 * Merge an owner's update into an existing map.
 *
 * Applies per-date upserts. A date with `closed: true` is retained (price history is not
 * destroyed), which is why removal uses a soft close rather than a delete.
 */
export function applyAvailabilityUpdate(
  current: AvailabilityMap,
  updates: AvailabilityDay[],
): AvailabilityMap {
  const next = new Map(current);
  for (const day of updates) {
    const parsed = availabilityDaySchema.safeParse(day);
    if (!parsed.success) continue;
    const cell: AvailabilityCell = {
      date: parsed.data.date,
      roomsAvailable: parsed.data.roomsAvailable,
      priceMinor: parsed.data.priceMinor,
      currency: parsed.data.currency,
      closed: parsed.data.closed,
    };
    next.set(cell.date, cell);
  }
  return next;
}

/** Summary figures for the owner dashboard. */
export function summarize(cells: AvailabilityMap, from: string, to: string) {
  const dates = enumerateDates(from, to);
  let sellableDays = 0;
  let closedDays = 0;
  let unpricedDays = 0;
  let totalRooms = 0;
  let revenueIfSoldMinor = 0;
  const currencies = new Set<string>();

  for (const date of dates) {
    const cell = cells.get(date);
    if (!cell) {
      unpricedDays += 1;
      continue;
    }
    currencies.add(cell.currency);
    if (cell.closed) {
      closedDays += 1;
      continue;
    }
    if (cell.roomsAvailable <= 0) continue;
    sellableDays += 1;
    totalRooms += cell.roomsAvailable;
    revenueIfSoldMinor += cell.priceMinor * cell.roomsAvailable;
  }

  return {
    daysInRange: dates.length,
    sellableDays,
    closedDays,
    unpricedDays,
    totalRooms,
    revenueIfSoldMinor,
    currency: currencies.size === 1 ? [...currencies][0]! : "MIXED",
    revenueDisplay: currencies.size === 1
      ? formatMoney(revenueIfSoldMinor, [...currencies][0]!)
      : "—",
  };
}

function enumerateDates(from: string, to: string): string[] {
  const total = daysBetween(from, to);
  if (!Number.isFinite(total) || total <= 0) return [];
  const out: string[] = [];
  const start = Date.parse(`${from}T00:00:00Z`);
  for (let i = 0; i < total; i += 1) {
    out.push(new Date(start + i * 86_400_000).toISOString().slice(0, 10));
  }
  return out;
}

export const availabilityQuerySchema = z.object({
  from: z.string(),
  to: z.string(),
  rooms: z.coerce.number().int().min(1).max(50).default(1),
});

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
