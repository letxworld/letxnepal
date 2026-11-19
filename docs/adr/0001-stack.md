# ADR 0001 — TypeScript, Next.js App Router, PostgreSQL via Supabase

Status: accepted, 2026-11-19.

## Context

letxNepal is a content-heavy public site with a multi-role authenticated dashboard and a
read-only public API. It must handle money (bookings), overlapping date-range
availability, and multi-tenant ownership. The original brief asks for a "very simple UI".

## Decision

- **TypeScript** across the whole codebase.
- **Next.js App Router** as both the rendering layer and the backend.
- **PostgreSQL via Supabase**, accessed through **Prisma**.
- **Zod** for all input validation, with one schema shared by website and API.

## Alternatives considered

**Django.** A reasonable choice, and a `django-incremental-dev` skill is installed on the
machine. Rejected: the public content side (SEO, streaming, image optimisation) and the
multi-role dashboard are both better served by React Server Components, and one language
everywhere outweighs getting an admin panel for free.

**Firebase or MongoDB.** Rejected: no transactions spanning availability, booking and
payment, which is the core integrity requirement. A double-booking bug is the one class
of defect this product cannot ship.

**Separate Node API plus React SPA.** Rejected: two deployments, two authentication
checks, two type contracts, for no benefit at this scale.

## Consequences

- Server Components handle public content with no client fetch waterfalls.
- Server Actions and Route Handlers serve authenticated and admin surfaces with one type
  contract.
- A real REST surface still exists where it is a product feature, not plumbing: the brief
  explicitly requires hotel owners to publish prices and availability "to our public api".
- No microservices, no GraphQL, no tRPC in v1. Postgres full-text search instead of
  Algolia; Supabase Storage instead of R2.

## Hosting independence

The stack does not depend on hosting. If the app is self-hosted on a VPS instead of
Vercel, nothing changes except the deploy target; Docker is available on the machine and
the Supabase CLI can run the whole data layer locally.

## Revision trigger

Revisit if: booking volume exceeds what a single Next.js deployment handles, the public
API needs a separate rate-limit or caching tier, or the team grows enough that a dedicated
backend service earns its operational cost.
