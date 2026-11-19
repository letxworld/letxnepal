import { cn } from "@/lib/cn";

/** Loading placeholder that reserves space, so content never shifts (CLS). */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} aria-hidden="true" />;
}

export function SkeletonCard() {
  return (
    <div className="card" aria-hidden="true">
      <Skeleton className="mb-md h-32 w-full" />
      <Skeleton className="mb-sm h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}
