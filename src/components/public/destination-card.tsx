import Link from "next/link";
import { AccessBadge, HiddenGemBadge, VisitationBadge } from "./hidden-gem-badge";
import { districtName, provinceName } from "@/lib/destinations/repository";
import { isHiddenGem, type Remoteness } from "@/lib/nepal";
import type { DestinationRecord } from "@/lib/destinations/repository";

const REMOTENESS_LABEL: Record<Remoteness, string> = {
  easy: "Easy access",
  moderate: "Moderate",
  remote: "Remote",
  very_remote: "Very remote",
};

/**
 * Destination card. Deliberately plain: one name, one summary, three facts.
 * No carousels, no hover gimmicks — the product mandate is "only required
 * decorations".
 */
export function DestinationCard({
  destination,
  href,
  priority = false,
}: {
  destination: DestinationRecord;
  href?: string;
  priority?: boolean;
}) {
  const hidden = isHiddenGem(destination.visitationLevel, destination.hiddenGem);
  const inner = (
    <>
      <div className="mb-sm flex flex-wrap items-center gap-xs">
        <VisitationBadge level={destination.visitationLevel} />
        {hidden ? <HiddenGemBadge /> : null}
        {destination.permitRequired ? <AccessBadge level="permit" /> : null}
      </div>

      <h3 className="text-lg font-semibold text-card-foreground">
        {destination.name}
        <span className="ml-xs text-sm font-normal text-muted-foreground">
          {destination.nepaliName}
        </span>
      </h3>

      <p className="mt-xs line-clamp-3 text-sm text-muted-foreground">{destination.summary}</p>

      <dl className="mt-md grid grid-cols-2 gap-xs text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Region</dt>
          <dd>{provinceName(destination.province)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">District</dt>
          <dd>{districtName(destination.district)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Access</dt>
          <dd>
            {REMOTENESS_LABEL[destination.remoteness]} · {destination.accessLevel}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Elevation</dt>
          <dd>{destination.elevationM.toLocaleString()} m</dd>
        </div>
      </dl>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="card block transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2"
      >
        {inner}
      </Link>
    );
  }

  return (
    <article className="card" data-priority={priority || undefined}>
      {inner}
    </article>
  );
}
