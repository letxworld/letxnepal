import { Badge } from "@/components/ui/badge";

const LABELS: Record<string, string> = {
  iconic: "Iconic",
  established: "Established",
  emerging: "Emerging",
  hidden: "Hidden gem",
};

/**
 * Marks a destination as a hidden gem. Carries a text label, not just colour, so
 * the distinction survives colour-blind users and screen readers
 * (ui-ux-pro-max: map symbology must not rely on colour alone).
 */
export function HiddenGemBadge({ label }: { label?: string }) {
  return (
    <Badge tone="accent" className="tracking-wide">
      {label ?? "Hidden gem"}
    </Badge>
  );
}

export function VisitationBadge({ level }: { level: string }) {
  const tone = level === "hidden" ? "accent" : level === "iconic" ? "primary" : "muted";
  return <Badge tone={tone}>{LABELS[level] ?? level}</Badge>;
}

export function AccessBadge({ level, nepaliLabel }: { level: string; nepaliLabel?: string }) {
  return (
    <Badge tone="outline">
      {nepaliLabel ? `${nepaliLabel} · ` : ""}
      {level.replace("_", " ")}
    </Badge>
  );
}
