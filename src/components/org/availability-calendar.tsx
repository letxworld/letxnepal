"use client";

import { useMemo, useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/hotels/availability-schema";
import { plusDays, todayIso, type SampleDay, type SampleRoomType, type SampleProperty } from "@/lib/hotels/sample-data";

/**
 * Availability and price calendar for a hotel owner.
 *
 * Per-date rooms and price, editable in place, with a month window and a range summary.
 * Changes stay local until the owner saves, then go to the authenticated partner API —
 * never to the public read-only API.
 */

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function weekdayOf(iso: string): number {
  // getUTCDay: 0 = Sunday. Convert to Monday-first index.
  const day = new Date(`${iso}T00:00:00Z`).getUTCDay();
  return (day + 6) % 7;
}

export function AvailabilityCalendar({
  property,
  room,
  initialDays,
}: {
  property: SampleProperty;
  room: SampleRoomType;
  initialDays: SampleDay[];
}) {
  const [start, setStart] = useState(() => initialDays[0]?.date ?? todayIso());
  const [days, setDays] = useState<SampleDay[]>(initialDays);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const byDate = useMemo(() => new Map(days.map((day) => [day.date, day])), [days]);

  const visible = useMemo(() => {
    const total = 35; // five weeks, so the grid shape is stable
    const out: Array<{ date: string; day: SampleDay | undefined } | null> = [];
    const lead = weekdayOf(start);
    for (let i = 0; i < lead; i += 1) out.push(null);
    for (let i = 0; i < total - lead; i += 1) {
      const date = plusDays(start, i);
      out.push({ date, day: byDate.get(date) });
    }
    return out;
  }, [start, byDate]);

  const range = useMemo(() => {
    const cells = visible.flatMap((entry) => (entry?.day ? [entry.day] : []));
    const sellable = cells.filter((cell) => !cell.closed && cell.roomsAvailable > 0);
    const closed = cells.filter((cell) => cell.closed).length;
    const revenue = sellable.reduce((sum, cell) => sum + cell.priceMinor * cell.roomsAvailable, 0);
    return { days: cells.length, sellable: sellable.length, closed, revenue };
  }, [visible]);

  function update(date: string, patch: Partial<SampleDay>) {
    setDays((current) =>
      current.map((entry) => (entry.date === date ? { ...entry, ...patch } : entry)),
    );
    setDirty(true);
  }

  function shift(weeks: number) {
    setStart((current) => plusDays(current, weeks * 7));
  }

  function save() {
    setStatus(null);
    startTransition(() => {
      // The write goes to the authenticated partner API. Until that route exists the
      // screen reports that honestly rather than pretending to persist.
      setStatus("Availability saved locally. Syncing to the partner API is not connected yet.");
      setDirty(false);
    });
  }

  return (
    <section className="card" aria-labelledby="calendar-heading">
      <div className="mb-md flex flex-wrap items-start justify-between gap-sm">
        <div>
          <h2 id="calendar-heading" className="text-lg font-semibold text-card-foreground">
            Availability and prices
          </h2>
          <p className="mt-xs text-sm text-muted-foreground">
            {property.name} · {room.name} · up to {room.totalRooms} rooms
          </p>
        </div>
        <div className="flex gap-xs">
          <button type="button" onClick={() => shift(-1)} className="btn-secondary min-h-[44px]" aria-label="Previous week">
            ←
          </button>
          <button type="button" onClick={() => shift(1)} className="btn-secondary min-h-[44px]" aria-label="Next week">
            →
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">
            Edit rooms available and price per night. Each cell is one date.
          </caption>
          <thead>
            <tr>
              {WEEKDAYS.map((name) => (
                <th key={name} scope="col" className="pb-xs text-left text-xs font-medium text-muted-foreground">
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.ceil(visible.length / 7) }, (_, week) => (
              <tr key={week}>
                {visible.slice(week * 7, week * 7 + 7).map((entry, index) => {
                  if (!entry) return <td key={`empty-${week}-${index}`} className="p-xs" />;
                  const { date, day } = entry;
                  const closed = day?.closed ?? false;
                  return (
                    <td key={date} className="p-xs align-top">
                      <div
                        className={cn(
                          "rounded-md border p-xs",
                          closed ? "border-border bg-muted" : "border-border bg-card",
                        )}
                      >
                        <p className="mb-xs text-xs font-medium text-muted-foreground">
                          {date.slice(8)}/{date.slice(5, 7)}
                        </p>
                        <label className="mb-xs block text-xs text-muted-foreground">
                          <span className="sr-only">Rooms available on {date}</span>
                          <input
                            type="number"
                            min={0}
                            max={room.totalRooms}
                            defaultValue={day?.roomsAvailable ?? 0}
                            disabled={closed}
                            onChange={(event) =>
                              update(date, {
                                roomsAvailable: Math.max(0, Math.min(room.totalRooms, Number(event.target.value))),
                              })
                            }
                            className="input min-h-[36px] px-xs py-0.5 text-xs"
                          />
                        </label>
                        <label className="block text-xs text-muted-foreground">
                          <span className="sr-only">Price per night in minor units on {date}</span>
                          <input
                            type="number"
                            min={0}
                            step={100}
                            defaultValue={day?.priceMinor ?? 0}
                            onChange={(event) =>
                              update(date, { priceMinor: Math.max(0, Number(event.target.value)) })
                            }
                            className="input min-h-[36px] px-xs py-0.5 text-xs"
                          />
                        </label>
                        <label className="mt-xs flex min-h-[32px] items-center gap-xs text-xs text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={closed}
                            onChange={(event) => update(date, { closed: event.target.checked })}
                            className="h-4 w-4"
                          />
                          Closed
                        </label>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-md flex flex-wrap items-center justify-between gap-sm border-t border-border pt-md">
        <dl className="flex flex-wrap gap-md text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Sellable days</dt>
            <dd className="font-medium text-card-foreground">{range.sellable}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Closed</dt>
            <dd className="font-medium text-card-foreground">{range.closed}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Potential revenue</dt>
            <dd className="font-medium text-card-foreground">{formatMoney(range.revenue, room.currency)}</dd>
          </div>
        </dl>
        <div className="flex items-center gap-sm">
          {dirty ? <span className="text-xs text-accent">Unsaved changes</span> : null}
          <button type="button" onClick={save} disabled={pending} className="btn-primary">
            {pending ? "Saving…" : "Save availability"}
          </button>
        </div>
      </div>
      {status ? (
        <p className="mt-sm text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}
    </section>
  );
}
