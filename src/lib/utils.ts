import { z } from "zod";

/** Coerce an unknown value to a trimmed non-empty string, or undefined. */
export function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Parse a comma-separated query param into a clean string array. */
export function parseListParam(value: unknown): string[] {
  if (typeof value !== "string" || value.trim() === "") return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/** Clamp an integer into a range, returning fallback when unparseable. */
export function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

/** Cursor-free page params with a bounded page size. */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export type Pagination = z.infer<typeof paginationSchema>;

export function offset(pagination: Pagination): number {
  return (pagination.page - 1) * pagination.pageSize;
}

/** Stable API envelope so clients never have to guess the shape. */
export function envelope<T>(data: T, total: number, pagination: Pagination) {
  return {
    data,
    page: pagination.page,
    pageSize: pagination.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pagination.pageSize)),
  };
}
