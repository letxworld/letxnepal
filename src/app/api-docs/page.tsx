import type { Metadata } from "next";
import { listDestinations } from "@/lib/destinations/repository";

export const metadata: Metadata = {
  title: "Public API",
  robots: { index: false, follow: true },
};

const ENDPOINTS = [
  { method: "GET", path: "/api/v1/destinations", description: "List destinations with filters and pagination." },
  { method: "GET", path: "/api/v1/destinations/{slug}", description: "One destination with full detail." },
  { method: "GET", path: "/api/v1/destinations/hidden", description: "Hidden gems only." },
  { method: "GET", path: "/api/v1/regions/coverage", description: "Province and district coverage report." },
  { method: "GET", path: "/api/v1/trails", description: "Walking routes." },
  { method: "GET", path: "/api/v1/health", description: "Service health." },
];

export default function ApiDocsPage() {
  const sample = listDestinations({ sort: "name", page: 1, pageSize: 2 });

  return (
    <div className="space-y-lg">
      <header className="max-w-3xl">
        <h1 className="text-2xl font-semibold text-foreground">Public API</h1>
        <p className="mt-md text-base text-muted-foreground">
          Read-only access to the destination catalogue, coverage data and trails. Hotel owners use the
          partner API to publish daily prices and room availability; this page documents the public,
          unauthenticated surface.
        </p>
      </header>

      <section aria-labelledby="endpoints-heading">
        <h2 id="endpoints-heading" className="mb-md text-lg font-semibold text-foreground">
          Endpoints
        </h2>
        <ul className="space-y-sm">
          {ENDPOINTS.map((endpoint) => (
            <li key={endpoint.path} className="card flex flex-wrap items-center gap-sm py-sm">
              <code className="rounded-sm bg-muted px-xs py-0.5 text-xs font-semibold text-foreground">
                {endpoint.method}
              </code>
              <code className="text-sm text-primary">{endpoint.path}</code>
              <span className="text-sm text-muted-foreground">{endpoint.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sample-heading">
        <h2 id="sample-heading" className="mb-md text-lg font-semibold text-foreground">
          Response shape
        </h2>
        <pre className="card overflow-x-auto text-xs text-card-foreground">
          {JSON.stringify(
            {
              data: sample.data.map((d) => ({ slug: d.slug, name: d.name, province: d.province })),
              page: sample.page,
              pageSize: sample.pageSize,
              total: sample.total,
              totalPages: sample.totalPages,
            },
            null,
            2,
          )}
        </pre>
      </section>

      <section aria-labelledby="limits-heading">
        <h2 id="limits-heading" className="mb-md text-lg font-semibold text-foreground">
          Limits
        </h2>
        <p className="text-sm text-muted-foreground">
          Anonymous requests are limited to 100 per minute; authenticated partner requests to 600 per
          minute. Every response uses the envelope shown above, and list endpoints accept{" "}
          <code>page</code> and <code>pageSize</code> (maximum 50).
        </p>
      </section>
    </div>
  );
}
