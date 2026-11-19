import { describe, expect, it } from "vitest";
import {
  applyAvailabilityUpdate,
  checkStayAvailability,
  isSellable,
  nightsInRange,
  quoteStay,
  summarize,
  type AvailabilityCell,
  type AvailabilityMap,
} from "../src/lib/hotels/availability";
import {
  availabilityDaySchema,
  availabilityUpdateSchema,
  calendarRangeSchema,
  dateRange,
  formatMoney,
} from "../src/lib/hotels/availability-schema";

function cell(date: string, rooms: number, price: number, overrides: Partial<AvailabilityCell> = {}): AvailabilityCell {
  return { date, roomsAvailable: rooms, priceMinor: price, currency: "NPR", closed: false, ...overrides };
}

function mapOf(...cells: AvailabilityCell[]): AvailabilityMap {
  return new Map(cells.map((entry) => [entry.date, entry]));
}

const NPR_5000 = 500_000; // NPR 5,000.00

describe("availability schema", () => {
  it("accepts a well-formed day", () => {
    const parsed = availabilityDaySchema.safeParse({
      date: "2027-04-01",
      roomsAvailable: 4,
      priceMinor: NPR_5000,
      currency: "NPR",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a malformed date", () => {
    expect(availabilityDaySchema.safeParse({ date: "01-04-2027", roomsAvailable: 1, priceMinor: 1, currency: "NPR" }).success).toBe(false);
    expect(availabilityDaySchema.safeParse({ date: "2027-13-40", roomsAvailable: 1, priceMinor: 1, currency: "NPR" }).success).toBe(false);
  });

  it("rejects negative rooms and negative prices", () => {
    expect(availabilityDaySchema.safeParse({ date: "2027-04-01", roomsAvailable: -1, priceMinor: 1, currency: "NPR" }).success).toBe(false);
    expect(availabilityDaySchema.safeParse({ date: "2027-04-01", roomsAvailable: 1, priceMinor: -1, currency: "NPR" }).success).toBe(false);
  });

  it("rejects a price above the ceiling", () => {
    expect(
      availabilityDaySchema.safeParse({ date: "2027-04-01", roomsAvailable: 1, priceMinor: 999_999_999, currency: "NPR" }).success,
    ).toBe(false);
  });

  it("rejects a currency that is not three characters", () => {
    expect(availabilityDaySchema.safeParse({ date: "2027-04-01", roomsAvailable: 1, priceMinor: 1, currency: "RUPEE" }).success).toBe(false);
  });

  it("caps a bulk update at roughly a year", () => {
    const days = Array.from({ length: 400 }, (_, i) => ({
      date: `2027-01-01`,
      roomsAvailable: 1,
      priceMinor: 100,
      currency: "NPR",
    }));
    expect(availabilityUpdateSchema.safeParse({ propertyId: "11111111-1111-4111-8111-111111111111", roomTypeId: "22222222-2222-4222-8222-222222222222", days }).success).toBe(false);
  });

  it("rejects a calendar range that runs backwards or is too long", () => {
    expect(calendarRangeSchema.safeParse({ from: "2027-05-10", to: "2027-05-01" }).success).toBe(false);
    expect(calendarRangeSchema.safeParse({ from: "2027-01-01", to: "2030-01-01" }).success).toBe(false);
    expect(calendarRangeSchema.safeParse({ from: "2027-05-01", to: "2027-05-31" }).success).toBe(true);
  });
});

describe("isSellable", () => {
  it("requires a recorded, open cell with a room free", () => {
    expect(isSellable(cell("2027-04-01", 1, NPR_5000))).toBe(true);
    expect(isSellable(cell("2027-04-01", 0, NPR_5000))).toBe(false);
    expect(isSellable(cell("2027-04-01", 4, NPR_5000, { closed: true }))).toBe(false);
    expect(isSellable(undefined)).toBe(false);
  });
});

describe("nightsInRange", () => {
  it("counts check-in through the night before check-out", () => {
    expect(nightsInRange("2027-04-01", "2027-04-04")).toEqual(["2027-04-01", "2027-04-02", "2027-04-03"]);
  });

  it("is empty for a same-day or reversed range", () => {
    expect(nightsInRange("2027-04-01", "2027-04-01")).toEqual([]);
    expect(nightsInRange("2027-04-05", "2027-04-01")).toEqual([]);
  });
});

describe("checkStayAvailability — double-booking guard", () => {
  const cells = mapOf(
    cell("2027-04-01", 2, NPR_5000),
    cell("2027-04-02", 1, NPR_5000),
    cell("2027-04-03", 2, NPR_5000),
  );

  it("allows a stay when every night has a free room", () => {
    const result = checkStayAvailability(cells, "2027-04-01", "2027-04-03");
    expect(result.ok).toBe(true);
  });

  it("rejects a stay needing more rooms than the tightest night", () => {
    const result = checkStayAvailability(cells, "2027-04-01", "2027-04-04", 2);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasons.some((reason) => reason.includes("2027-04-02"))).toBe(true);
    }
  });

  it("rejects a stay covering an unrecorded date", () => {
    const result = checkStayAvailability(cells, "2027-04-03", "2027-04-06");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reasons.some((r) => r.includes("no availability recorded"))).toBe(true);
  });

  it("rejects a stay covering a closed date", () => {
    const withClosure = mapOf(
      cell("2027-04-01", 2, NPR_5000),
      cell("2027-04-02", 2, NPR_5000, { closed: true }),
    );
    const result = checkStayAvailability(withClosure, "2027-04-01", "2027-04-03");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reasons.some((r) => r.includes("closed"))).toBe(true);
  });
});

describe("quoteStay", () => {
  const cells = mapOf(
    cell("2027-04-01", 2, 100_000),
    cell("2027-04-02", 2, 150_000),
  );

  it("sums per-night prices in minor units", () => {
    const result = quoteStay(cells, "2027-04-01", "2027-04-03");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.subtotalMinor).toBe(250_000);
      expect(result.totalMinor).toBe(250_000);
      expect(result.currency).toBe("NPR");
    }
  });

  it("multiplies by rooms", () => {
    const result = quoteStay(cells, "2027-04-01", "2027-04-03", 2);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.totalMinor).toBe(500_000);
  });

  it("applies tax once, in minor units", () => {
    const result = quoteStay(cells, "2027-04-01", "2027-04-03", 1, 0.15);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.subtotalMinor).toBe(250_000);
      expect(result.taxMinor).toBe(37_500);
      expect(result.totalMinor).toBe(287_500);
    }
  });

  it("refuses a stay spanning two currencies", () => {
    const mixed = mapOf(
      cell("2027-04-01", 2, 100_000, { currency: "NPR" }),
      cell("2027-04-02", 2, 100_000, { currency: "USD" }),
    );
    const result = quoteStay(mixed, "2027-04-01", "2027-04-03");
    expect(result.ok).toBe(false);
  });

  it("refuses a stay on a closed date", () => {
    const closed = mapOf(
      cell("2027-04-01", 2, 100_000),
      cell("2027-04-02", 2, 100_000, { closed: true }),
    );
    expect(quoteStay(closed, "2027-04-01", "2027-04-03").ok).toBe(false);
  });
});

describe("applyAvailabilityUpdate", () => {
  it("upserts by date without dropping other dates", () => {
    const current = mapOf(cell("2027-04-01", 2, NPR_5000), cell("2027-04-02", 2, NPR_5000));
    const next = applyAvailabilityUpdate(current, [
      { date: "2027-04-02", roomsAvailable: 5, priceMinor: 600_000, currency: "NPR", closed: false },
      { date: "2027-04-03", roomsAvailable: 1, priceMinor: 400_000, currency: "NPR", closed: false },
    ]);
    expect(next.get("2027-04-01")?.priceMinor).toBe(NPR_5000);
    expect(next.get("2027-04-02")?.priceMinor).toBe(600_000);
    expect(next.get("2027-04-03")?.roomsAvailable).toBe(1);
  });

  it("retains a closed date rather than deleting its price", () => {
    const current = mapOf(cell("2027-04-01", 2, NPR_5000));
    const next = applyAvailabilityUpdate(current, [
      { date: "2027-04-01", roomsAvailable: 2, priceMinor: NPR_5000, currency: "NPR", closed: true },
    ]);
    expect(next.has("2027-04-01")).toBe(true);
    expect(next.get("2027-04-01")?.closed).toBe(true);
    expect(next.get("2027-04-01")?.priceMinor).toBe(NPR_5000);
  });

  it("ignores malformed days instead of corrupting the map", () => {
    const current = mapOf(cell("2027-04-01", 2, NPR_5000));
    const next = applyAvailabilityUpdate(current, [
      { date: "not-a-date", roomsAvailable: 1, priceMinor: 1, currency: "NPR", closed: false } as never,
    ]);
    expect(next.size).toBe(1);
  });
});

describe("summarize", () => {
  it("reports sellable, closed and unpriced days", () => {
    const cells = mapOf(
      cell("2027-04-01", 2, 100_000),
      cell("2027-04-02", 0, 100_000),
      cell("2027-04-03", 2, 100_000, { closed: true }),
    );
    const summary = summarize(cells, "2027-04-01", "2027-04-05");
    expect(summary.daysInRange).toBe(5);
    expect(summary.sellableDays).toBe(1);
    expect(summary.closedDays).toBe(1);
    expect(summary.unpricedDays).toBe(2);
    expect(summary.totalRooms).toBe(2);
    expect(summary.revenueIfSoldMinor).toBe(200_000);
  });
});

describe("helpers", () => {
  it("formats minor units for display", () => {
    expect(formatMoney(500_000, "NPR")).toBe("NPR 5,000.00");
    expect(formatMoney(1_234_567, "NPR")).toBe("NPR 12,345.67");
  });

  it("enumerates an inclusive date range", () => {
    expect(dateRange("2027-04-01", "2027-04-03")).toEqual(["2027-04-01", "2027-04-02", "2027-04-03"]);
  });
});
