import { cn } from "@/lib/cn";

type BadgeTone = "primary" | "accent" | "muted" | "destructive" | "outline";

const TONES: Record<BadgeTone, string> = {
  primary: "bg-primary text-on-primary",
  accent: "bg-accent text-on-accent",
  muted: "bg-muted text-muted-foreground",
  destructive: "bg-destructive text-on-destructive",
  outline: "border border-border bg-card text-card-foreground",
};

export function Badge({
  children,
  tone = "muted",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-[24px] items-center rounded-sm px-xs text-xs font-medium leading-5",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
