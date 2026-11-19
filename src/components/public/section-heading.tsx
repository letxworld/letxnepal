import Link from "next/link";
import { cn } from "@/lib/cn";

export function SectionHeading({
  title,
  description,
  href,
  hrefLabel,
  className,
}: {
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-md flex flex-wrap items-end justify-between gap-sm", className)}>
      <div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {description ? <p className="mt-xs text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="min-h-[44px] text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {hrefLabel ?? "View all"}
        </Link>
      ) : null}
    </div>
  );
}
