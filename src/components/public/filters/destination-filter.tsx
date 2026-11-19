"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ACCESS_OPTIONS, REMOTENESS_OPTIONS, VISITATION_OPTIONS } from "@/lib/destinations/repository";
import { DISTRICTS, PROVINCES } from "@/lib/nepal";
import { cn } from "@/lib/cn";
import { activeFilterCount, describeFilters, filtersToSearchParams } from "@/lib/destinations/filter-model";
import { useFilters } from "./filter-state";

/**
 * The destination filter: ONE button, one panel.
 *
 * Replaces the old inline form of a dozen controls. The button carries the state — a count
 * badge when filters are active, a filled style when anything is selected — so the control
 * reads at a glance. The panel is a real disclosure with focus handling, closes on Escape
 * and on outside click, and applies through the query string so every filtered view stays
 * linkable and indexable.
 */

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "min-h-[44px] rounded-full border px-md text-sm font-medium transition-colors duration-150",
        active
          ? "border-primary bg-primary text-on-primary"
          : "border-border bg-card text-card-foreground hover:border-primary",
      )}
    >
      {label}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-xs text-xs font-medium uppercase tracking-wide text-muted-foreground">{children}</p>;
}

export function DestinationFilter({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const { filters, set, toggle, clear, count } = useFilters();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState(filters.q);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => setTerm(filters.q), [filters.q]);

  // Escape closes and returns focus to the trigger.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>("button, input, select")?.focus();
  }, [open]);

  function apply(next = filters) {
    const params = filtersToSearchParams(next);
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/destinations?${query}` : "/destinations");
    });
    setOpen(false);
  }

  const provinces = PROVINCES;
  const districts = filters.province
    ? DISTRICTS.filter((district) => district.province === filters.province)
    : DISTRICTS;

  return (
    <div className="relative" ref={panelRef}>
      <div className="flex flex-wrap items-center gap-sm">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="destination-filter-panel"
          className={cn(
            "btn min-h-[44px] gap-sm rounded-full px-lg",
            count > 0
              ? "bg-accent text-on-accent hover:opacity-90"
              : "bg-primary text-on-primary hover:opacity-90",
          )}
        >
          {/* Filter icon, drawn as SVG — never an emoji. */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" strokeLinejoin="round" />
          </svg>
          <span>Filter</span>
          {count > 0 ? (
            <span
              className="ml-xs inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-card px-xs text-xs font-semibold text-foreground"
              aria-label={`${count} filters applied`}
            >
              {count}
            </span>
          ) : null}
        </button>

        <p className="text-sm text-muted-foreground" aria-live="polite">
          {pending ? "Updating…" : `${resultCount} ${resultCount === 1 ? "destination" : "destinations"}`}
        </p>
      </div>

      {open ? (
        <div
          id="destination-filter-panel"
          className="absolute left-0 right-0 top-full z-30 mt-sm max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-card p-lg shadow-lg"
        >
          <div className="mb-md flex items-center justify-between gap-sm">
            <p className="text-base font-semibold text-card-foreground">Filter destinations</p>
            <button type="button" onClick={clear} className="min-h-[44px] text-sm text-primary hover:underline">
              Clear all
            </button>
          </div>

          <div className="grid gap-lg sm:grid-cols-2">
            <div className="space-y-lg">
              <div>
                <label htmlFor="filter-q" className="label">
                  Search
                </label>
                <input
                  id="filter-q"
                  type="search"
                  className="input"
                  value={term}
                  onChange={(event) => setTerm(event.target.value)}
                  placeholder="Place or keyword"
                />
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div>
                  <label htmlFor="filter-province" className="label">
                    Province
                  </label>
                  <select
                    id="filter-province"
                    className="input"
                    value={filters.province}
                    onChange={(event) => set({ province: event.target.value, district: "" })}
                  >
                    <option value="">All</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.number}. {province.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="filter-sort" className="label">
                    Sort
                  </label>
                  <select
                    id="filter-sort"
                    className="input"
                    value={filters.sort}
                    onChange={(event) => set({ sort: event.target.value as typeof filters.sort })}
                  >
                    <option value="remoteness">Most remote</option>
                    <option value="name">Name</option>
                    <option value="visitation">Most known</option>
                    <option value="province">Province</option>
                  </select>
                </div>
              </div>

              <div>
                <SectionLabel>Remoteness</SectionLabel>
                <div className="flex flex-wrap gap-xs">
                  {REMOTENESS_OPTIONS.map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      active={filters.remoteness.includes(option.value)}
                      onClick={() => toggle("remoteness", option.value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <SectionLabel>Access</SectionLabel>
                <div className="flex flex-wrap gap-xs">
                  {ACCESS_OPTIONS.map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      active={filters.accessLevel.includes(option.value)}
                      onClick={() => toggle("accessLevel", option.value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <SectionLabel>How well known</SectionLabel>
                <div className="flex flex-wrap gap-xs">
                  {VISITATION_OPTIONS.map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      active={filters.visitationLevel.includes(option.value)}
                      onClick={() => toggle("visitationLevel", option.value)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-lg">
              <div>
                <SectionLabel>Practical</SectionLabel>
                <div className="flex flex-wrap gap-xs">
                  <Chip
                    label="Hidden gems only"
                    active={filters.hiddenGem}
                    onClick={() => set({ hiddenGem: !filters.hiddenGem })}
                  />
                  <Chip
                    label="Bookable stay"
                    active={filters.bookable}
                    onClick={() => set({ bookable: !filters.bookable })}
                  />
                  <Chip
                    label="Permit required"
                    active={filters.permitRequired}
                    onClick={() => set({ permitRequired: !filters.permitRequired })}
                  />
                </div>
              </div>

              <div>
                <SectionLabel>District</SectionLabel>
                <label htmlFor="filter-district" className="sr-only">
                  District
                </label>
                <select
                  id="filter-district"
                  className="input"
                  value={filters.district}
                  onChange={(event) => set({ district: event.target.value })}
                >
                  <option value="">All districts</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              {count > 0 ? (
                <div>
                  <SectionLabel>Active</SectionLabel>
                  <p className="text-sm text-muted-foreground">{describeFilters(filters).join(" · ")}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-lg flex flex-wrap items-center justify-end gap-sm border-t border-border pt-md">
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => apply({ ...filters, q: term })}
              className="btn-primary"
              disabled={pending}
            >
              {pending ? "Applying…" : `Show ${resultCount}`}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
