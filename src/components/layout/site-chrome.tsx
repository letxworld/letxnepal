import Link from "next/link";
import type { ReactNode } from "react";

const NAV = [
  { href: "/destinations", label: "Destinations" },
  { href: "/destinations/hidden", label: "Hidden gems" },
  { href: "/trails", label: "Trails" },
  { href: "/adventures", label: "Adventures" },
  { href: "/coverage", label: "Coverage" },
  { href: "/blogs", label: "Journal" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container-page flex min-h-[64px] flex-wrap items-center justify-between gap-sm py-sm">
        <Link
          href="/"
          className="flex min-h-[44px] items-center gap-xs text-lg font-semibold text-foreground"
        >
          letx<span className="text-primary">Nepal</span>
        </Link>

        <nav aria-label="Primary">
          <ul className="flex flex-wrap items-center gap-xs">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-[44px] items-center rounded-md px-sm text-sm font-medium text-card-foreground hover:bg-muted"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container-page grid gap-lg py-lg sm:grid-cols-3">
        <div>
          <p className="text-base font-semibold text-foreground">letxNepal</p>
          <p className="mt-xs text-sm text-muted-foreground">
            A national platform for discovering Nepal, with the hidden and remote places first.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="mb-xs text-sm font-medium text-foreground">Explore</p>
          <ul className="space-y-xs text-sm text-muted-foreground">
            <li><Link href="/destinations">All destinations</Link></li>
            <li><Link href="/destinations/hidden">Hidden gems</Link></li>
            <li><Link href="/coverage">Coverage by province</Link></li>
          </ul>
        </nav>
        <div>
          <p className="mb-xs text-sm font-medium text-foreground">For partners</p>
          <ul className="space-y-xs text-sm text-muted-foreground">
            <li><Link href="/list-with-us">List a hotel or lodge</Link></li>
            <li><Link href="/list-with-us">List an agency</Link></li>
            <li><Link href="/api">Public API</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-sm">
        <p className="container-page text-xs text-muted-foreground">
          Coordinates are approximate and for trip planning only. Verify access, permits and conditions
          before travel.
        </p>
      </div>
    </footer>
  );
}

export function PageShell({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className={`flex-1 ${wide ? "" : "container-page"} py-lg`}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
