import { cn } from "@/lib/cn";

/**
 * Empty and error states. Every list in the product renders one of these rather
 * than a blank area, so a filter with no matches is explained, not silent.
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("card flex flex-col items-start gap-sm p-lg")}>
      <p className="text-base font-medium text-foreground">{title}</p>
      {description ? <p className="text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  retry,
}: {
  title: string;
  description?: string;
  retry?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-start gap-sm border-destructive/40 p-lg" role="alert">
      <p className="text-base font-medium text-destructive">{title}</p>
      {description ? <p className="text-muted-foreground">{description}</p> : null}
      {retry}
    </div>
  );
}
