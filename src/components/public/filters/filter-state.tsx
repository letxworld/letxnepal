"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import {
  activeFilterCount,
  type Filters,
} from "@/lib/destinations/filter-model";

/**
 * Client-side filter state, seeded from the server so the first render matches the URL.
 *
 * The pure types and serialisation live in `src/lib/destinations/filter-model.ts`, which
 * both the server page and these client components import. This file holds only the
 * React machinery.
 */

type Action =
  | { type: "set"; patch: Partial<Filters> }
  | { type: "toggle"; field: "remoteness" | "accessLevel" | "visitationLevel"; value: string }
  | { type: "clear" };

function reducer(state: Filters, action: Action): Filters {
  switch (action.type) {
    case "set":
      return { ...state, ...action.patch };
    case "toggle": {
      const current = state[action.field];
      const next = current.includes(action.value)
        ? current.filter((value) => value !== action.value)
        : [...current, action.value];
      return { ...state, [action.field]: next };
    }
    case "clear":
      return { ...state, ...emptyState() };
    default:
      return state;
  }
}

function emptyState(): Filters {
  return {
    q: "",
    province: "",
    district: "",
    remoteness: [],
    accessLevel: [],
    visitationLevel: [],
    hiddenGem: false,
    permitRequired: false,
    bookable: false,
    sort: "remoteness",
  };
}

export { activeFilterCount, type Filters };

type FilterContextValue = {
  filters: Filters;
  set: (patch: Partial<Filters>) => void;
  toggle: (field: "remoteness" | "accessLevel" | "visitationLevel", value: string) => void;
  clear: () => void;
  count: number;
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial: Filters;
}) {
  const [filters, dispatch] = useReducer(reducer, initial);

  const value = useMemo<FilterContextValue>(
    () => ({
      filters,
      set: (patch) => dispatch({ type: "set", patch }),
      toggle: (field, value) => dispatch({ type: "toggle", field, value }),
      clear: () => dispatch({ type: "clear" }),
      count: activeFilterCount(filters),
    }),
    [filters],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters(): FilterContextValue {
  const context = useContext(FilterContext);
  if (!context) throw new Error("useFilters must be used inside <FilterProvider>");
  return context;
}
