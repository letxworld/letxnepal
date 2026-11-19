"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { filtersToSearchParams } from "@/lib/destinations/filter-model";
import { useFilters } from "./filter-state";

/**
 * Active filter chips shown under the filter button.
 *
 * Each chip removes one filter and navigates immediately, so the user never has to reopen
 * the panel to undo a single choice. `aria-live` on the container announces the new result
 * count to screen readers.
 */
export function ActiveFilterChips({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const { filters, set, toggle, clear } = useFilters();
  const [pending, startTransition] = useTransition();
  const [removed, setRemoved] = useState<string[]>([]);

  const chips: Array<{ key: string; label: string; patch: Partial<typeof filters> }> = [];

  if (filters.province) {
    chips.push({
      key: "province",
      label: `Province ${filters.province}`,
      patch: { province: "", district: "" },
    });
  }
  if (filters.district) {
    chips.push({ key: "district", label: `District ${filters.district}`, patch: { district: "" } });
  }
  for (const value of filters.remoteness) {
    chips.push({
      key: `remoteness-${value}`,
      label: `Remoteness ${value.replace("_", " ")}`,
      patch: { remoteness: filters.remoteness.filter((v) => v !== value) },
    });
  }
  for (const value of filters.accessLevel) {
    chips.push({
      key: `access-${value}`,
      label: `Access ${value}`,
      patch: { accessLevel: filters.accessLevel.filter((v) => v !== value) },
    });
  }
  for (const value of filters.visitationLevel) {
    chips.push({
      key: `visitation-${value}`,
      label: `Known ${value}`,
      patch: { visitationLevel: filters.visitationLevel.filter((v) => v !== value) },
    });
  }
  if (filters.hiddenGem) {
    chips.push({ key: "hiddenGem", label: "Hidden gems", patch: { hiddenGem: false } });
  }
  if (filters.bookable) {
    chips.push({ key: "bookable", label: "Bookable stay", patch: { bookable: false } });
  }
  if (filters.permitRequired) {
    chips.push({
      key: "permitRequired",
      label: "Permit required",
      patch: { permitRequired: false },
    });
  }
  if (filters.q) {
    chips.push({ key: "q", label: `“${filters.q}”`, patch: { q: "" } });
  }

  if (chips.length === 0 && !pending) return null;

  function navigate(patch: Partial<typeof filters>) {
    const next = { ...filters, ...patch };
    const params = filtersToSearchParams(next);
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/destinations?${query}` : "/destinations");
    });
  }

  return (
    <div className="mt-md flex flex-wrap items-center gap-xs" aria-live="polite">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => {
            setRemoved((list) => [...list, chip.key]);
            navigate(chip.patch);
          }}
          className={cn(
            "inline-flex min-h-[32px] items-center gap-xs rounded-full border border-border bg-card px-sm text-xs font-medium text-card-foreground transition-opacity hover:border-destructive",
            removed.includes(chip.key) ? "opacity-50" : "",
          )}
          aria-label={`Remove filter ${chip.label}`}
        >
          {chip.label}
          <span aria-hidden="true">×</span>
        </button>
      ))}
      {chips.length > 1 ? (
        <button
          type="button"
          onClick={() => {
            clear();
            startTransition(() => router.push("/destinations"));
          }}
          className="min-h-[32px] text-xs text-primary underline-offset-4 hover:underline"
        >
          Clear all
        </button>
      ) : null}
      {pending ? <span className="text-xs text-muted-foreground">Updating… {resultCount}</span> : null}
    </div>
  );
}
