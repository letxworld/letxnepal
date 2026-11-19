import { z } from "zod";

/**
 * Availability and pricing contracts for hotel owners.
 *
 * These validate what an owner may write through the authenticated partner API. The
 * public API is read-only; this is the write side, and it is scoped to the owner's own
 * organisation by the caller.
 *
 * Money is minor units (integer), never a float. Dates are ISO `YYYY-MM-DD` local dates,
 * not timestamps, so a night never shifts because of a timezone.
 */

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate that a `YYYY-MM-DD` string is a real calendar date.
 *
 * A regex alone accepts 2027-13-40, which would silently corrupt a calendar. This checks
 * the month and the day against the month's actual length, including leap years.
 */
export function isRealDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const parts = value.split("-").map((part) => Number.parseInt(part, 10));
  const [year, month, day] = [parts[0], parts[1], parts[2]];
  if (year === undefined || month === undefined || day === undefined) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;

  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [
    31,
    leap ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ][month - 1];
  if (daysInMonth === undefined) return false;
  return day <= daysInMonth;
}

export const isoDateSchema = z
  .string()
  .regex(DATE_PATTERN, "date must be YYYY-MM-DD")
  .refine(isRealDate, "date is not a real calendar date");

export const MAX_ROOMS_PER_PROPERTY = 200;
export const MAX_PRICE_MINOR = 100_000_000; // 1,000,000.00 in the smallest currency unit
export const MAX_BULK_DAYS = 372; // roughly a year, so a mistake cannot lock a calendar forever

export const availabilityDaySchema = z.object({
  date: isoDateSchema,
  /** Rooms available to sell on that date. */
  roomsAvailable: z.number().int().min(0).max(MAX_ROOMS_PER_PROPERTY),
  /** Price per room per night in minor units. */
  priceMinor: z.number().int().min(0).max(MAX_PRICE_MINOR),
  /** ISO 4217 currency code. */
  currency: z.string().length(3),
  /** Close the date to new bookings without deleting the price history. */
  closed: z.boolean().default(false),
});

export type AvailabilityDay = z.infer<typeof availabilityDaySchema>;

export const availabilityUpdateSchema = z
  .object({
    propertyId: z.string().uuid(),
    roomTypeId: z.string().uuid(),
    days: z.array(availabilityDaySchema).min(1).max(MAX_BULK_DAYS),
  })
  .strict();

export type AvailabilityUpdate = z.infer<typeof availabilityUpdateSchema>;

export const singleDayUpdateSchema = z
  .object({
    propertyId: z.string().uuid(),
    roomTypeId: z.string().uuid(),
    day: availabilityDaySchema,
  })
  .strict();

export type SingleDayUpdate = z.infer<typeof singleDayUpdateSchema>;

export const propertyCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase, digits and hyphens"),
    province: z.string().trim().min(2).max(40),
    district: z.string().trim().min(2).max(40),
    destinationId: z.string().uuid().optional(),
    latitude: z.number().min(26.3).max(30.5).optional(),
    longitude: z.number().min(80.0).max(88.3).optional(),
    address: z.string().trim().max(300).optional(),
    descriptionHtml: z.string().max(20_000).optional(),
  })
  .strict();

export type PropertyCreate = z.infer<typeof propertyCreateSchema>;

export const roomTypeCreateSchema = z
  .object({
    propertyId: z.string().uuid(),
    name: z.string().trim().min(2).max(80),
    sleeps: z.number().int().min(1).max(20),
    totalRooms: z.number().int().min(1).max(MAX_ROOMS_PER_PROPERTY),
    currency: z.string().length(3).default("NPR"),
    descriptionHtml: z.string().max(5_000).optional(),
  })
  .strict();

export type RoomTypeCreate = z.infer<typeof roomTypeCreateSchema>;

/**
 * Validate a calendar range request: which dates an owner wants to inspect.
 * Limits how far forward a client can ask, so a page never renders ten years.
 */
export const calendarRangeSchema = z
  .object({
    from: isoDateSchema,
    to: isoDateSchema,
  })
  .refine((range) => range.from <= range.to, { message: "from must not be after to" })
  .refine(
    (range) => daysBetween(range.from, range.to) <= MAX_BULK_DAYS,
    { message: `range must be ${MAX_BULK_DAYS} days or fewer` },
  );

export type CalendarRange = z.infer<typeof calendarRangeSchema>;

export function daysBetween(from: string, to: string): number {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return Number.POSITIVE_INFINITY;
  return Math.round((end - start) / 86_400_000) + 1;
}

/** Format minor units as a display string. Display only; never compute with this. */
export function formatMoney(minor: number, currency: string): string {
  const units = minor / 100;
  return `${currency} ${units.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** A date range as an array of ISO dates, inclusive. */
export function dateRange(from: string, to: string): string[] {
  const total = daysBetween(from, to);
  if (!Number.isFinite(total) || total <= 0) return [];
  const out: string[] = [];
  const cursor = Date.parse(`${from}T00:00:00Z`);
  for (let i = 0; i < total; i += 1) {
    out.push(new Date(cursor + i * 86_400_000).toISOString().slice(0, 10));
  }
  return out;
}
