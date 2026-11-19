import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="space-y-md">
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="text-base text-muted-foreground">
        That page does not exist. Try the destination list, or the hidden gems index.
      </p>
      <div className="flex flex-wrap gap-sm">
        <Link href="/destinations" className="btn-primary">
          All destinations
        </Link>
        <Link href="/destinations/hidden" className="btn-secondary">
          Hidden gems
        </Link>
      </div>
    </div>
  );
}
