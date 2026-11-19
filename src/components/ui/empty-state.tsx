import { cn } from "@/lib/cn";

/**
 * Empty and error states. Every list in the product renders one of these rather
 * than a blank area, so a filter with no matches is explained, not silent.
 */
export function EmptyState({
  title,
  description,
  action,
  titleAs: Title = "h2",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Heading level so empty states fit the page outline instead of always being h2. */
  titleAs?: React.ElementType;
}) {
  return (
    <div className={cn("card flex flex-col items-start gap-sm p-lg")}>
      <Title className="text-lg font-medium text-foreground">{title}</Title>
      {description ? <p className="text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  retry,
  titleAs: Title = "h2",
}: {
  title: string;
  description?: string;
  retry?: React.ReactNode;
  titleAs?: React.ElementType;
}) {
  return (
    <div className="card flex flex-col items-start gap-sm border-destructive/40 p-lg" role="alert">
      <Title className="text-lg font-medium text-destructive">{title}</Title>
      {description ? <p className="text-muted-foreground">{description}</p> : null}
      {retry}
    </div>
  );
}
