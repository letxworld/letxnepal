# letxNepal — Tourism Platform Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.
> Plan mode: no code was written, no project files changed, nothing committed or pushed.

**Goal:** Build `letxNepal`, the national tourism-growth platform for Nepal — a multi-role system whose
primary mission is to surface the country's **hidden and remote destinations** to the world (not just the
classic trail), whose main goal is to **grow tourism across all of Nepal** (every province, every
community), and which does that commercially through hotel/lodge booking, ready-made and pay-as-you-go
packages, ride sharing, bus/flight booking, and an admin-authored HTML blog/CMS — with a deliberately
minimal, accessible UI designed using the `ui-ux-pro-max` skill.

**Mission (user-stated, 2026-11-19):**
1. Surface hidden, remote, under-visited tourist destinations to tourists — discovery is the product, not
   a side feature.
2. Grow tourism for the whole of Nepal, not only Pokhara/Kathmandu/Annapurna.
3. Design the UI with `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill`.

**Architecture:** Next.js App Router (TypeScript) full-stack app. Server Components render public marketing
pages; Server Actions + Route Handlers serve the authenticated and admin surfaces. PostgreSQL via Supabase
with Prisma ORM. Authorization is RBAC + ownership + resource-state, enforced server-side and backed by
Postgres Row-Level Security as a second layer. Tenancy is `organization_id` scoped (each hotel/lodge/agency
is an organization), so one owner dashboard governs their own inventory. Content (destinations, blogs,
trails, adventures) is admin-authored HTML rendered safely. Geo-first discovery (interactive map, province /
accessibility / "hidden-gem" filters) is the differentiating core. One git commit per task/feature.

**Tech Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS + shadcn/ui · Prisma · Supabase
(Postgres, Auth, Storage) · NextAuth/Clerk-style session · Stripe + eSewa/Khalti (manual/partner fallback)
· Vercel · Vitest + Playwright · Zod · Upstash rate limiting · next-intl (en/ne) · Sentry.

---

## 1. Current context — what the source folder actually contains

`/home/letxworld/Repos/letxnepal` is an empty git repo (`main`, no commits, remote
`https://github.com/letxworld/letxnepal.git`). The only content is three photos of a handwritten notebook:
`source/WhatsApp Image 2026-11-19 at 11.24.53 AM.jpeg`, `...(1).jpeg`, `...(2).jpeg`.

Transcribed requirements (verbatim intent, grammar normalized):

**Title:** letxNepal — "a fully functional tourism development System".

**Roles ("A Platform for"):**
SuperAdmin · Admin · Hotel Owner / Manager / Lodges (guest houses) · Local Tourist · Foreign Tourist ·
Cruises · Promoters / Tourist Agencies. (Guides appear on page 2 as a distinct actor.)

**Features:**
- Fully secured, far away from hackers.
- Foreign tourist can: purchase ready-made packages; view locations in 360°; explore remote places;
  explore hotels and book; use ride sharing through the app in cities; make pay-as-you-go packages;
  book buses and national/international flights for Nepal.
- Hotel owner can: list all hotel info on the platform; update daily prices and room availability to the
  public API; promote their local area.
- Guides can: list themselves with contact info; share their experience; post blog articles.
- Tourism agencies can: list their agency; list their packages (optional).
- Developer view: content is NOT fully hard-coded — an admin inserts a place's blog as HTML, the platform
  renders it and the tourist sees a real blog page; a blog page shows a "book hotels nearby" section;
  there must be a popular-destinations section, an adventures section, and popular trails.
- **UI mandate:** very simple UI, only required buttons, only required decorations.

### 1.1 Mission consequences (the pivot changes the build order)

The user's clarification is a product mandate, not a slogan. It changes what gets built first and what the
database has to model:

**a) Every destination must carry "hidden / remote" attributes.** This is the core discovery signal:
`remoteness` (easy / moderate / remote / very_remote), `accessLevel` (road / jeep / trail / flight / boat),
`visitationLevel` (iconic / established / emerging / hidden), `bestSeason`, `permitRequired`,
`nearestSettlement`, `latitude/longitude`, `elevation`, `province` (1–7), `district`, `municipality`,
`localCommunityName`, `localName` (Nepali), `howToGetThere` (HTML), `whyItIsHidden`, and `localEconomicImpact`.
Destinations with `visitationLevel = hidden` get a **Hidden Gems** homepage rail and a dedicated
`/destinations/hidden` index — this is mission #1 made visible.

**b) Coverage targets become measurable.** Admin dashboard shows destination counts per province and per
district, with an explicit "0 destinations" gap list. Mission #2 ("grow whole Nepal") becomes a dashboard
KPI: provinces covered 7/7, districts with ≥1 bookable destination, hidden-gems published per quarter.
Without this, "grow all Nepal" is unfalsifiable.

**c) Local economic impact is a first-class field, not marketing copy.** Each destination can declare the
number of local households/beneficiaries and the community contact; booking confirmation can state which
community the stay supports. This is the strongest story for mission #2 and for promoters.

**d) Discovery UX moves ahead of booking in the build order.** The map-driven explorer and hidden-gem
filters are Task 4 (up from Task 4's plain listing). Booking stays Task 7 but the destination pages that
feed it are now richer.

**e) Content model gains local-language + community authorship.** `localName`, `localCommunityName`, and
Nepali (`ne`) translations on destination names/descriptions, so a domestic tourist in Surkhet sees local
names. Guides (Task 9) can submit destination content as drafts — that is the scalable way to cover 77
districts without a full-time content team.

**f) The "popular destinations / adventures / popular trails" sections stay**, but become a balanced set:
Popular, Hidden, Adventures, Trails — one rail each, so the homepage does not only push the famous places.

### 1.2 Explicit scope cuts (YAGNI — do not build now)

| From the notes | Decision | Reason |
|---|---|---|
| 360° location views | Phase 3, behind a feature flag. Ship photo + map first. | Needs a 360 media pipeline + viewer; no source assets exist. |
| Flight booking | Phase 4, API-partner only. | No licensed ticketing API; Nepali carriers have no public booking API. |
| Cruise operator role | Model as an `agency` with `type = cruise` (no separate role). | Avoids role sprawl; identical permission set. |
| Ride sharing | Phase 4 (driver onboarding, live GPS, fares). | Real product with regulatory + safety surface; not a v1 differentiator. |
| Bus booking | Phase 3, seat inventory + operator API. | Needs carrier integration; start with route search. |
| Guides as employees | Model as `guide_profile` owned by a user; guides can be agency-contracted. | Matches "list themselves with contact info". |

### 1.3 Decisions to confirm with the user (blocking Task 0)

1. **Primary language / market** — foreign-tourist-first with English UI, or Nepali-first? (Drives i18n default locale. Recommendation: English default, `ne` fully supported, because mission #1 targets foreign tourists while mission #2 targets domestic growth.)
2. **Currency** — NPR with USD display toggle, or USD-first? (Recommendation: store NPR, display USD toggle; domestic users see NPR.)
3. **Payments** — Stripe only (foreign cards), or also eSewa/Khalti (domestic)? Live keys or sandbox-only for v1? (Critical for mission #2: a platform that only foreign tourists can pay on does not grow local tourism.)
4. **Hosting** — Vercel + Supabase managed, or self-hosted VPS? (No `psql`/Docker-in-project requirement either way.)
5. **Definition of v1 "done"** — a working booking flow end-to-end, or a wider feature surface with stubs?
6. **Seed geography** — should v1 ship with a balanced seed (at least 1–2 destinations per province, with 6–8 flagged `hidden` across far-west/mid-west regions) or only the classic 6 destinations? (Recommendation: balanced seed; otherwise the mission is not visible on day one.)
7. **Brand assets** — logo, palette, fonts, or should `ui-ux-pro-max` generate the design system from a query?
8. **Map provider** — MapLibre + OpenMapTiles (free, self-hostable, no key) vs Mapbox (key, cost at scale)? (Recommendation: MapLibre GL + free tile source; the `ui-ux-pro-max` map guidance covers clustering, reduced-motion and colour-blind-safe symbology.)

---

## 2. Skills stack (from sickn33/agentic-awesome-skills, v21.0.0)

Repo cloned to `/tmp/aas` (3,022 skills, `skills/<id>/SKILL.md`, index `skills_index.json`).
Install command pattern (needs `npm ci` in the clone first — `sanitize-filename`/`ajv` are missing):

```bash
cd /tmp/aas && npm ci
node tools/bin/install.js --path /home/letxworld/.hermes/skills --skills <csv> --dry-run   # inspect first
node tools/bin/install.js --path /home/letxworld/.hermes/skills --skills <csv>             # then install
```

**Installed-skill note:** Hermes loads toolsets/skills at session start. After installing, start a fresh
session for the new skills to be visible in the skill picker.

**§2.0 below is the design authority and is installed first (Task 0 Step 0), because Task 1's design
system is generated from its output.**

### 2.0 UI design skill — `ui-ux-pro-max` (PRIMARY design authority)

Source: `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill`, cloned to `/tmp/uiux`. Also present in
the AAS catalog as `ui-ux-pro-max`, but **install the upstream repo version**, not the AAS copy: the repo
copy is materially richer (verified by reading both). The AAS copy is 15.5 KB, has 6 style rows and no
`references/`, no `--design-system`, no `--tokens`. The repo copy is 18.6 KB with 80 searchable styles
(51 active), 194 product palettes + reasoning profiles, 74 font pairings, 130 UX guidelines, 105 icons,
17 GSAP presets, 25 chart types, 22 stacks, plus `references/quick-reference.md` and
`references/pro-rules.md`.

Verified working on this machine (Python 3.14, no external dependencies — pure stdlib BM25 search):

```bash
python3 /tmp/uiux/.claude/skills/ui-ux-pro-max/scripts/search.py \
  "travel tourism destination discovery adventure" --design-system -p "letxNepal"
```

Install location for Hermes (project scope, so it travels with the repo):

```bash
mkdir -p /home/letxworld/Repos/letxnepal/.hermes/skills
cp -r /tmp/uiux/.claude/skills/ui-ux-pro-max /home/letxworld/Repos/letxnepal/.hermes/skills/
```

Then invoke by full path — the skill lives in the skill directory, not the project:

```bash
python3 .hermes/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system -p "letxNepal"
```

**What it returned for a letxNepal query (real output, not invented):**
- Pattern: `Scroll-Triggered Storytelling` — with explicit caveats: disable parallax and scroll-scrub under
  `prefers-reduced-motion`, keep DOM reading order complete, render each chapter in its final readable state.
- Style: `Aurora UI` — vibrant gradients, mesh/aurora blends; performance `cost:low`, accessibility
  `risk:conditional`, requires `contrast-text-4.5`, `keyboard`, `visible-focus`, `reduced-motion`.
- Palette: Primary `#0EA5E9` sky, Secondary `#38BDF8`, Accent/CTA `#EA580C` adventure orange, Background
  `#F0F9FF`, Foreground `#0C4A6E`, Destructive `#DC2626`.
- **Avoid: "Generic photos + Complex booking"** — this is the database telling us the classic travel-site
  pattern is a trap. It aligns exactly with the user's "very simple UI / only required buttons" mandate.
- Domain searches that returned real, applicable guidance:
  - `--domain ux "map exploration discovery region filter"` → 6 results, all directly relevant:
    map needs a text alternative (`role="region"` + summary + feature table), cluster dense points at low
    zoom, chip collections must wrap not clip, map camera moves must respect reduced-motion, map symbology
    must not rely on colour alone (colour-blind-safe ramps).
  - `--domain product "travel booking marketplace"` → `Travel/Tourism Agency` profile: Aurora UI +
    Motion-Driven, Storytelling-Driven + Hero-Centric landing, `rtl_level: full`.
  - `--domain landing` → `Marketplace / Directory` pattern: search-first hero, categories, featured
    listings, trust/safety, "become a host" CTA.

**Design policy derived from the skill (binding on all UI tasks):**
1. The skill's `--design-system` output must be generated and persisted to
   `design-system/letxnepal/MASTER.md` with `--persist --tokens dtcg`, and read before any page is built.
2. Override its `Scroll-Triggered Storytelling` pattern to a **static, simple** layout for v1. The skill's
   own `Avoid: Generic photos + Complex booking` plus the user's "only required decorations" mandate
   outrank the pattern recommendation. Use the pattern's *content order* (hook → problem → journey →
   solution → CTA) without scroll-scrubbing or parallax. No GSAP in v1; `--motion 2`.
3. `--density 8` for the org/admin dashboards, `--density 3` for public marketing pages.
4. The skill's non-negotiables are hard gates in Task 12: contrast ≥ 4.5:1, visible focus rings, 44×44px
   touch targets, no emoji as icons (SVG only), `prefers-reduced-motion` respected, responsive at
   375/768/1024/1440, CLS < 0.1, no placeholder-only labels, errors near the field.
5. Every UI task ends by re-querying the specific concern (`--domain ux`, `--stack nextjs`, `--stack
   shadcn`) rather than relying on memory. Query results are recommendations, not instructions.

### 2.1 Process / workflow skills (drive the build)

| Skill | Use |
|---|---|
| `spec-driven-development` | Write `docs/spec.md` before any code. |
| `requirements-writing` | Turn the notebook into user stories + acceptance criteria. |
| `planning-and-task-breakdown` | Decompose into the tasks below. |
| `writing-plans` | This document. |
| `before-you-build` | Demand/alternatives/distribution risk pass (Task 0). |
| `saas-mvp-launcher` | Stack selection + launch checklist. |
| `test-driven-development` | RED-GREEN-REFACTOR per task. |
| `verification-before-completion` | Prove each task with real output before commit. |
| `systematic-debugging` | When a check fails, root-cause before patching. |
| `clean-code` | Refactor pass per slice. |
| `subagent-driven-development` | (Hermes-local) dispatch one subagent per task. |

### 2.2 Domain / engineering skills

| Skill | Use |
|---|---|
| `ui-ux-pro-max` | **Design authority.** See §2.0. Generate MASTER.md + tokens, then query per page/component. |
| `ui-tokens` | Token structure and semantic naming, aligned with the `--tokens dtcg` export. |
| `web-design-system` | Component/token architecture that survives a multi-role app. |
| `anti-ui-slop` / `unslop-ui` | Guard against the exact failure the skill's "Avoid" line warns about. |
| `ui-lint` / `ui-review` / `ui-score` | Objective UI checks at Task 12, instead of "looks fine to me". |
| `accessibility-compliance-accessibility-audit` + `wcag-audit-patterns` | WCAG gate for contrast, focus, keyboard, reduced motion. |
| `ui-states` / `ui-a11y` / `ui-motion` | Loading/empty/error states, a11y annotations, motion constraints. |
| `ui-from-screenshot` | For later visual iteration once real pages exist. |
| `supabase` | Auth, RLS, Storage, Data API gotchas (the security checklist is gold). |
| `postgres-best-practices` | Indexing, constraints, composite FKs, enums. |
| `prisma-expert` | Schema design, migrations, `migrate diff` drift checks. |
| `database-design` | ORM selection, schema normalization, indexing strategy. |
| `saas-multi-tenant` | `organization_id` + RLS + tenant-scoped middleware. |
| `marketplace-rbac-audit` | The policy matrix for 7 actor types — directly on-topic. |
| `auth-implementation-patterns` | Token/session/resource-access boundaries. |
| `nextjs-supabase-auth` | Server/client Supabase session patterns, middleware. |
| `nextjs-app-router-patterns` | Server Components, streaming, server actions. |
| `nextjs-best-practices` | Caching, metadata, route handlers. |
| `security-and-hardening` | "Fully secured, far away from hackers" — threat surface pass. |
| `privacy-by-design` | Tourist PII, passport data minimization. |
| `api-security-best-practices` | OWASP API Top 10 for the public API. |
| `frontend-security-coder` | Safe HTML rendering of admin-authored blog content. |
| `payment-integration` + `stripe-integration` | Checkout, webhooks, PCI scope. |
| `api-patterns` + `openapi-spec-generation` | Public REST contract, pagination, versioning. |
| `upstash-ratelimit` | Public API + auth endpoint protection. |
| `i18n-localization` | en/ne string extraction, locale routing. |
| `ui-ux-designer` + `web-design-guidelines` | Interpret "very simple UI" into a concrete design system. |
| `tailwind-patterns` + `shadcn` + `react-patterns` + `typescript-expert` | Component/build conventions. |
| `frontend-dev-guidelines` | Page-level structure, loading/empty/error states. |
| `observability-engineer` | Sentry + logging from day one. |
| `vercel-deployment` + `ci-cd-and-automation` | Preview envs, branch deploys, checks. |
| `seo` + `seo-technical` + `sitemap-generator` + `structured-data-validator` | Destination/blog discoverability. |
| `blog-writing-guide` + `seo-content` | Admin authoring guidance inside the CMS. |
| `algolia-search` (optional, Phase 2) | Destination/hotel search; start with Postgres full-text. |
| `cloudflare-r2` / `object-storage` (Phase 2) | Cheaper media at scale; Supabase Storage is fine for v1. |
| `travel-planner` | Domain reference for itinerary/pay-as-you-go package logic. |
| `analytics` + `advanced-analytics-dashboard` | The province/district coverage dashboard (mission #2 KPI). |
| `dashboard-design` | Owner dashboard and admin analytics layout. |

**Catalog gaps (report, do not invent):** no `esewa`/`khalti`/Nepali-payment skill, no `tourism`/`hotel`
domain skill, no `cms` skill, no `booking`/`reservation` skill. Everything booking-specific must be designed
in-project (this plan covers it). No Nepal-specific content skill — seed data is authored locally.

---

## 3. Proposed information architecture

### 3.1 Roles (7 actors → 5 permissions roles)

| Actor (notes) | App role | Scope |
|---|---|---|
| SuperAdmin | `super_admin` | Global, cross-tenant, bypass RLS via admin role. |
| Admin | `admin` | Global content + moderation, no financial mutation. |
| Hotel Owner / Manager / Lodges | `org_admin` | Own `organization` (hotel/lodge/guest house). |
| Tourism agency / Cruise / Promoter | `org_admin` | Own `organization` (agency/cruise). |
| Guide | `guide` | Own `guide_profile`; can be contracted by an agency. |
| Local / Foreign tourist | `customer` | Own bookings, reviews, saved trips. |

Enforcement layers, in order: (1) route guard, (2) Zod input validation, (3) server-side ownership/
membership check, (4) Prisma scoped query, (5) Postgres RLS as the database safety net.

### 3.2 Data model (Prisma, v1)

Global tables (no `organization_id`): `User`, `Account`/`Session` (auth), `Role`, `Region`
(province 1–7 + district + municipality, seeded — the coverage KPI needs a fixed hierarchy),
`Destination` (with `remoteness`, `accessLevel`, `visitationLevel`, `provinceId`, `districtId`,
`latitude/longitude`, `elevation`, `bestSeason`, `permitRequired`, `localCommunityName`,
`localEconomicImpact`, `whyItIsHidden`, `howToGetThere`, `hiddenGem Bool`),
`DestinationTranslation` (`en`/`ne` name + summary), `DestinationSubmission` (guide/community draft),
`Trail`, `AdventureActivity`, `BlogPost`, `BlogCategory`, `Tag`, `MediaAsset`, `PageSection`
(homepage rails: Popular / Hidden / Adventures / Trails), `Review`, `Amenity`, `RoomType`,
`VehicleType`, `BusRoute`, `CruiseListing`, `PackageTemplate`, `Promotion`, `AuditLog`,
`Booking`, `Payment`, `Payout`, `Notification`, `SavedTrip`, `ItineraryItem`.

Organization-scoped tables (must carry `organization_id NOT NULL`, UUID, in every composite index):
`Organization`, `OrganizationMember`, `HotelProperty`, `Room`, `RoomAvailability` (per-date),
`HotelPromotion`, `AgencyPackage`, `AgencyPackageItem`, `GuideProfile`, `GuideContract`, `RideListing`,
`Vehicle`, `BusRouteInventory`, `FlightQuote` (cache), `Booking` (tenant-owned rows), `Payment`,
`Payout`, `Review` (reviewer org), `AvailabilityCalendar`.

Money: `amountMinor Int` + `currency CHAR(3)` (never floats). Dates: `timestamptz`; store user-facing
local dates as `date` + `timezone`.

### 3.3 Public API surface

```
GET  /api/v1/destinations?province=&remoteness=&accessLevel=&visitationLevel=hidden&q=&page=
GET  /api/v1/destinations/{slug}
GET  /api/v1/destinations/nearby?lat=&lng=&radiusKm=
GET  /api/v1/map/destinations            (lightweight GeoJSON for the explorer, clustered server-side)
GET  /api/v1/regions/coverage            (province/district counts — powers the coverage KPI)
GET  /api/v1/trails?difficulty=&region=
GET  /api/v1/adventures?type=
GET  /api/v1/blogs/{slug}
GET  /api/v1/hotels?destination=&checkIn=&checkOut=&guests=
GET  /api/v1/hotels/{slug}/availability
GET  /api/v1/packages?type=ready|payg
GET  /api/v1/bus-routes?from=&to=&date=
GET  /api/v1/guides?destination=
GET  /api/v1/health
```

Authenticated (owner dashboard): `POST /api/v1/org/hotels`, `PATCH /api/v1/org/hotels/{id}/availability`,
`POST /api/v1/org/packages`, `GET /api/v1/org/bookings`, ... — every route asserts membership + role.

Rate limits: 100 req/min anonymous, 600/min authenticated, 10/min on auth endpoints (Upstash sliding window).

---

## 4. Step-by-step plan

### Task 0 — Discovery, decisions, spec, and skill install

**Objective:** Lock scope and produce the spec the rest of the tasks implement.

**Files:**
- Create: `docs/spec.md`, `docs/acceptance-criteria.md`, `docs/architecture.md`, `docs/adr/0001-stack.md`
- Create: `.env.local.example`, `.gitignore` (verify Next.js defaults), `README.md`
- Create: `docs/plans/2026-11-19_113344-letxnepal-tourism-platform.md` (this file)

**Step 0 — Install the UI design skill** (project scope, upstream repo version):

```bash
mkdir -p /home/letxworld/Repos/letxnepal/.hermes/skills
cp -r /tmp/uiux/.claude/skills/ui-ux-pro-max /home/letxworld/Repos/letxnepal/.hermes/skills/
python3 .hermes/skills/ui-ux-pro-max/scripts/search.py \
  "travel tourism destination discovery adventure remote" --design-system -p "letxNepal"
```

Expected: a PATTERN, STYLE, COLORS, TYPOGRAPHY, EFFECTS and AVOID block (real output shown in §2.0).
Persist it immediately — this is the design source of truth:

```bash
python3 .hermes/skills/ui-ux-pro-max/scripts/search.py \
  "travel tourism destination discovery adventure remote" --design-system \
  --persist --tokens dtcg --preview -p "letxNepal" --output-dir /home/letxworld/Repos/letxnepal
```

Creates `design-system/letxnepal/MASTER.md`, `tokens.json`, `preview.html`. **Read MASTER.md before
designing anything.** Add page overrides later with `--page <name>` (never `--force` without authorization).

**Step 0b — Supplementary queries** (record results in `docs/design-notes.md`):

```bash
python3 .hermes/skills/ui-ux-pro-max/scripts/search.py "map exploration discovery region filter" --domain ux
python3 .hermes/skills/ui-ux-pro-max/scripts/search.py "travel booking marketplace" --domain product
python3 .hermes/skills/ui-ux-pro-max/scripts/search.py "hero search social proof" --domain landing
python3 .hermes/skills/ui-ux-pro-max/scripts/search.py "booking form validation errors" --domain ux
python3 .hermes/skills/ui-ux-pro-max/scripts/search.py "server components streaming" --stack nextjs
python3 .hermes/skills/ui-ux-pro-max/scripts/search.py "data table density" --stack shadcn
```

**Step 1 — Ask the eight blocking questions** (§1.3) using `rich-elicitation` /
`ask-questions-if-underspecified`; one batched message, not a drip of questions. Record answers in
`docs/spec.md`.

**Step 2 — Risk pass.** Run `before-you-build` against the mission: problem in one sentence; exact customer
(foreign independent traveller 25–45 planning 7–14 days, AND domestic traveller in a tier-2 Nepali city);
current workaround (Instagram/Viator/Booking.com + WhatsApp fixer, or nothing for remote areas); switching
reason (nowhere else surfaces remote destinations with a bookable stay); distribution (SEO on "nepal hidden
destinations", province tourism boards, embassy travel forums, guide/agency partners); operational burden
(onboarding remote lodge owners with no digital presence is the real cost). Output the "build bet" statement.

**Step 3 — Write `docs/spec.md`** using `spec-driven-development`. It must contain:
- Problem statement and the two mission goals (hidden destinations; all-Nepal growth).
- Users: all 7 actors with the permissions matrix from `marketplace-rbac-audit`.
- Discovery model: the `remoteness` / `accessLevel` / `visitationLevel` taxonomy, the Hidden Gems rail,
  the map explorer, and the province/district coverage KPI (mission #2 made measurable).
- Non-functional requirements: security, performance, i18n (en/ne), accessibility, SEO.
- Out-of-scope list (§1.2) and definition of done.
- The UI mandate verbatim: "very simple UI, only required buttons, only required decorations."
- A "design authority" section pointing at `design-system/letxnepal/MASTER.md`.

**Step 4 — Install skills** (dry-run first, then real):

```bash
cd /tmp/aas && npm ci
node tools/bin/install.js --path /home/letxworld/.hermes/skills --skills \
 spec-driven-development,requirements-writing,planning-and-task-breakdown,saas-mvp-launcher,test-driven-development,supabase,postgres-best-practices,prisma-expert,database-design,saas-multi-tenant,marketplace-rbac-audit,auth-implementation-patterns,nextjs-supabase-auth,nextjs-app-router-patterns,security-and-hardening,privacy-by-design,api-security-best-practices,frontend-security-coder,stripe-integration,payment-integration,api-patterns,openapi-spec-generation,upstash-ratelimit,i18n-localization,ui-ux-designer,web-design-guidelines,tailwind-patterns,shadcn,react-patterns,typescript-expert,frontend-dev-guidelines,observability-engineer,vercel-deployment,ci-cd-and-automation,seo,seo-technical,sitemap-generator,structured-data-validator,blog-writing-guide,systematic-debugging,clean-code,verification-before-completion \
 --dry-run
```

Expected: a write plan listing each skill tree, no errors about unknown/ambiguous IDs. Then re-run without
`--dry-run`. Report the installed list. **Tell the user to start a fresh Hermes session** so the skills load.

**Step 5 — Commit**

```bash
git add -A && git commit -m "docs: add letxNepal spec, acceptance criteria and architecture"
```

**Verification:** `docs/spec.md` exists and contains all 7 actors, the UI mandate, and the out-of-scope
table; `git log --oneline` shows one commit; `git status` clean.

---

### Task 1 — Repo foundation and design system

**Objective:** Scaffold the Next.js app with a minimal, enforced design language.

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`,
  `eslint.config.mjs`, `prettier.config.mjs`, `vitest.config.ts`, `playwright.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `src/components/ui/` (button, card, input, select, dialog, badge, skeleton, empty-state, error-state)
- Create: `src/lib/design-tokens.ts`
- Create: `tests/design-tokens.test.ts`

**Step 1 — Write failing test**

```ts
// tests/design-tokens.test.ts
import { tokens } from '@/lib/design-tokens'
test('exposes only the approved palette', () => {
  expect(Object.keys(tokens.colors)).toEqual(['primary', 'accent', 'neutral', 'danger'])
})
```

**Step 2 — Run:** `npm test -- tests/design-tokens.test.ts` → FAIL (module missing).

**Step 3 — Implement the design system from the skill output, not from scratch.**
Read `design-system/letxnepal/MASTER.md` and `tokens.json`. Then build the app:

```bash
npm create next-app@latest . --typescript --tailwind --app --eslint --src-dir
```

Wire the skill's tokens into `tailwind.config.ts` and `src/app/globals.css` as CSS custom properties
(`--color-primary`, `--color-on-primary`, `--color-accent`, `--font-heading`, `--space-*`). Do not hand-pick
hex values in components — semantic tokens only (`primary`, `on-primary`, `accent`, `muted-foreground`).
Apply the skill's palette with the contrast pairs it flagged, and respect the `Avoid` line: no generic
photography hero, no complex booking widget on the homepage.

If MASTER.md's `Aurora UI` style conflicts with the "very simple UI" mandate, the mandate wins and the
conflict is recorded in `docs/design-notes.md` as a deliberate override with the reason.

**Step 4 — Run:** `npm test` → PASS. `npm run lint` → 0 errors. `npm run build` → success.

**Step 5 — Commit:** `feat: scaffold Next.js app with design system from ui-ux-pro-max`

**Verification:**
- `design-system/letxnepal/MASTER.md` and `tokens.json` exist and were read before code (note the SHA in
  the commit body).
- `npm run build` shows `/` compiled.
- Render the homepage and check against the skill's pre-delivery checklist: contrast ≥ 4.5:1 (run
  `ui-lint`/`ui-score`), no emoji icons, visible focus ring, 44×44px targets, `prefers-reduced-motion`
  respected. Paste the tool output.
- Screenshot the homepage: one hero, one search field, four rails (Popular / Hidden / Adventures / Trails).
  Nothing else.

---

### Task 2 — Database schema, RLS, and tenant foundation

**Objective:** Prisma schema for all v1 entities with organization scoping and RLS policies.

**Files:**
- Create: `prisma/schema.prisma`, `prisma/migrations/0001_init/migration.sql`, `prisma/seed.ts`
- Create: `supabase/migrations/001_rls.sql`, `supabase/seed.sql`
- Create: `src/lib/db.ts`, `src/lib/tenant.ts`
- Create: `tests/schema.test.ts`, `tests/rls.test.ts`

**Step 1 — Write failing test** (`tests/schema.test.ts`): assert every model listed in
`TENANT_SCOPED_MODELS` has an `organizationId` field with a matching `@@index([organizationId, ...])`;
assert `Destination` has `remoteness`, `accessLevel`, `visitationLevel`, `latitude`, `longitude`,
`hiddenGem`, `provinceId`; assert a `Region` row exists for all 7 provinces; assert `Destination` has a
composite index on `(visitationLevel, provinceId)` for the hidden-gem query.

**Step 2 — Run:** `npm test -- tests/schema.test.ts` → FAIL.

**Step 3 — Implement schema** (highlights — full models in `prisma/schema.prisma`):

```prisma
enum Role { super_admin, admin, org_admin, guide, customer }
enum BookingType { hotel, package, bus, ride, cruise }
enum BookingStatus { pending, confirmed, cancelled, completed, refunded }

model Organization {
  id        String   @id @default(uuid())
  type      OrgType // hotel, lodge, guesthouse, agency, cruise
  name      String
  slug      String   @unique
  members   OrganizationMember[]
  hotels    HotelProperty[]
  // every tenant-scoped table carries organization_id + composite index
  @@index([slug])
}

model RoomAvailability {
  id             String   @id @default(uuid())
  organizationId String
  roomId         String
  date           DateTime @db.Date
  priceMinor     Int
  currency       String   @db.Char(3)
  roomsAvailable Int
  organization   Organization @relation(fields: [organizationId], references: [id])
  @@unique([roomId, date])
  @@index([organizationId, date])
}

model Booking {
  id             String        @id @default(uuid())
  organizationId String
  customerId     String
  type           BookingType
  status         BookingStatus @default(pending)
  amountMinor    Int
  currency       String        @db.Char(3)
  // ...
  @@index([organizationId, status, createdAt])
  @@index([customerId, createdAt])
}
```

RLS (`supabase/migrations/001_rls.sql`):

```sql
alter table "RoomAvailability" enable row level security;
alter table "RoomAvailability" force row level security;
create policy tenant_isolation on "RoomAvailability"
  using (organization_id = current_setting('app.current_tenant_id', true)::uuid);
create policy tenant_insert on "RoomAvailability"
  with check (organization_id = current_setting('app.current_tenant_id', true)::uuid);
-- UPDATE requires a SELECT policy too: Postgres RLS filters the row set first.
-- Views bypass RLS by default: use CREATE VIEW ... WITH (security_invoker = true).
```

**Step 4 — Run:** `npm test -- tests/schema.test.ts tests/rls.test.ts` → PASS.
`npx prisma validate` → "The schema is valid". `npx prisma migrate diff` → no drift.

**Step 5 — Commit:** `feat: add Prisma schema with tenant scoping and RLS policies`

**Verification:** A negative RLS test proves a tenant cannot read another tenant's availability
(`set local app.current_tenant_id = 'A'` → query B's rows → 0 rows). Run it in the local Supabase DB and
paste the real output.

---

### Task 3 — Auth, roles, and the permissions matrix

**Objective:** Working login plus the 5-role authorization layer used by every later task.

**Files:**
- Create: `src/lib/auth/session.ts`, `src/lib/auth/roles.ts`, `src/lib/auth/guards.ts`
- Create: `src/middleware.ts`, `src/app/(auth)/login/page.tsx`, `src/app/api/auth/[...nextauth]/route.ts`
- Create: `tests/roles.test.ts`, `tests/auth-guard.test.ts`

**Step 1 — Write failing test** for the canonical matrix: `org_admin` can PATCH their own hotel
availability, cannot PATCH another org's, cannot POST `/api/admin/content`; `guide` can POST a blog
draft, cannot publish; `customer` can create a booking, cannot see another customer's bookings.

**Step 2 — Run:** FAIL.

**Step 3 — Implement** with `nextjs-supabase-auth` patterns: session in middleware, `raw_app_meta_data`
carries `role` (never `user_metadata` — user-editable), a `requireRole()` guard returning a typed error,
and Zod-validated inputs. Store roles in `app_metadata` only.

**Step 4 — Run:** PASS. Manual check: log in as each role against the local DB, confirm one allowed and
one denied call per role; paste the responses.

**Step 5 — Commit:** `feat: add authentication and role-based authorization`

**Verification:** `npm run test` green; the deny paths return 403 JSON `{"error":"forbidden"}`, never a
redirect to a page the role could then reach.

---

### Task 4 — Hidden-destination discovery: map explorer, filters, and rails

**Objective:** The mission-critical task. Make hidden and remote destinations discoverable, and make
all-Nepal coverage visible.

**Files:**
- Create: `src/app/(public)/destinations/page.tsx`, `src/app/(public)/destinations/hidden/page.tsx`,
  `src/app/(public)/destinations/[slug]/page.tsx`
- Create: `src/app/(public)/map/page.tsx`, `src/components/public/destination-map.tsx`
- Create: `src/components/public/destination-card.tsx`, `hidden-gem-badge.tsx`, `filters/`
- Create: `src/lib/geo.ts`, `src/lib/destinations/query.ts`
- Create: `tests/destinations.test.ts`, `tests/coverage.test.ts`

**Step 0 — Query the skill first** (do not design from memory):

```bash
python3 .hermes/skills/ui-ux-pro-max/scripts/search.py "map exploration discovery region filter" --domain ux
python3 .hermes/skills/ui-ux-pro-max/scripts/search.py "filter chips mobile overflow" --domain ux
python3 .hermes/skills/ui-ux-pro-max/scripts/search.py "server components streaming list" --stack nextjs
python3 .hermes/skills/ui-ux-pro-max/scripts/search.py "card grid responsive" --stack shadcn
```

Apply the returned rules, at minimum: map container gets `role="region"` + `aria-label` + a text summary +
a filter-synced feature list/table as the non-map alternative; cluster markers at low zoom with counts and
keyboard-accessible zoom-into-cluster; chips wrap, never clip into a hidden overflow; no fly-to camera
animation under `prefers-reduced-motion`; map symbology pairs colour with icon/shape so `hidden` vs
`iconic` is not colour-only; colour-blind-safe ramp.

**Step 1 — Write failing tests:**
- `/destinations?visitationLevel=hidden` returns only hidden destinations, with the count in the page.
- `/destinations/hidden` returns 200 and renders a non-empty result when seed has hidden gems.
- `/destinations?province=5` filters by province; an unknown province returns 422/empty, not 500.
- `/api/v1/regions/coverage` returns 7 provinces with counts and lists districts at 0.
- `/destinations/pokhara` returns 200 with `application/ld+json` TouristDestination structured data;
  unknown slug returns 404.
- Map endpoint returns GeoJSON with coordinates; markers are clustered when count > threshold.

**Step 2 — Run:** FAIL. **Step 3 — Implement:**
- `Destination` query with filters: `province`, `remoteness`, `accessLevel`, `visitationLevel`, `q`,
  `hiddenGem`, `hasBookableHotel`, plus pagination (`{data, page, pageSize, total}`).
- MapLibre GL (no API key) with a free tile source. Server-clustered markers, client interaction only
  for pan/zoom/popup. The map is progressive enhancement — the filter list works without JS.
- Four homepage rails: Popular, Hidden, Adventures, Trails — driven by `PageSection` rows, not hard-coded.
- `/destinations/hidden` index with a "why it's hidden" summary per card, plus the access level and
  nearest settlement so a tourist can judge feasibility.
- Coverage page/section: province cards with destination counts, explicit zero-coverage districts
  highlighted as opportunities.

**Step 4 — Run:** PASS. Manual: `curl -s localhost:3000/api/v1/destinations?visitationLevel=hidden | jq '.total'`
returns the seeded hidden count; `curl -s localhost:3000/api/v1/regions/coverage` shows all 7 provinces.

**Step 5 — Commit:** `feat: add hidden-destination discovery explorer with map and coverage tracking`

**Verification:**
- Lighthouse mobile ≥ 90 performance on `/destinations` and `/map`; CLS < 0.1 with real images.
- `structured-data-validator` passes on a destination page.
- Keyboard-only walkthrough: focus reaches the map region, every marker, every filter chip; paste the tab order.
- Reduced-motion emulation: no camera animation on load (paste the DevTools media override result).
- Coverage API output proves the zero-district gap list exists — this is mission #2's evidence.

---

### Task 5 — Admin CMS: HTML blog with safe rendering + "hotels nearby"

**Objective:** Deliver the explicit developer-view requirement: admin authors HTML, tourists read a real blog.

**Files:**
- Create: `src/app/admin/blogs/new/page.tsx`, `src/app/admin/blogs/[id]/edit/page.tsx`
- Create: `src/lib/content/sanitize.ts`, `src/lib/content/render-html.tsx`
- Create: `src/app/(public)/blogs/[slug]/page.tsx`
- Create: `tests/sanitize.test.ts`, `tests/blog-render.test.ts`

**Step 1 — Failing test** (`tests/sanitize.test.ts`):

```ts
test('strips script tags and event handlers', () => {
  const out = sanitizeHtml('<p onclick="steal()">Hi</p><script>bad()</script>')
  expect(out).toBe('<p>Hi</p>')
})
test('allows the admin formatting subset', () => {
  expect(sanitizeHtml('<h2>T</h2><img src="https://x/y.jpg" alt="a"><ul><li>b</li></ul>')).toContain('<h2>')
})
```

**Step 2 — Run:** FAIL. **Step 3 — Implement** with DOMPurify (server) + a strict allow-list, rendered via
a client component that takes sanitized HTML only. `blogs/[slug]` renders the article plus a
"Book hotels nearby" section querying hotels within the post's `destinationId` radius.

**Step 4 — Run:** PASS, plus a manual XSS probe (paste `<script>` and `<img onerror>` into the editor and
confirm the public page renders text, not executable markup).

**Step 5 — Commit:** `feat: add admin HTML blog CMS with sanitized rendering and nearby hotels`

**Verification:** `tests/sanitize.test.ts` covers at least 8 attack vectors; the public blog page shows
real hotels from the seeded destination.

---

### Task 6 — Hotel inventory, availability, and owner dashboard

**Objective:** The "update daily prices & availability to the public API" requirement.

**Files:**
- Create: `src/app/org/hotels/page.tsx`, `src/app/org/hotels/[id]/availability/page.tsx`
- Create: `src/app/api/v1/org/hotels/[id]/availability/route.ts`
- Create: `src/components/org/availability-grid.tsx`, `price-input.tsx`
- Create: `tests/availability.test.ts`

**Step 1 — Failing test:** owner A's PATCH for org A returns 200 and is readable by the public API;
owner A's PATCH for org B returns 403; a bulk 30-day upsert is atomic.

**Step 2 — Run:** FAIL. **Step 3 — Implement** a month grid with per-date price + rooms, bulk
`upsertMany` in one transaction, Zod schema clamping `0 <= roomsAvailable <= 1000` and
`0 <= priceMinor <= 100_000_00`. **Step 4 — Run:** PASS.

**Step 5 — Commit:** `feat: add hotel availability dashboard and owner API`

**Verification:** Paste the public API response for a seeded hotel showing the 30-day price series; prove
cross-org 403 with a real HTTP response.

---

### Task 7 — Booking flow (hotel) with payments

**Objective:** End-to-end: search → availability → checkout → booking record → webhook confirmation.

**Files:**
- Create: `src/app/(public)/hotels/[slug]/book/page.tsx`
- Create: `src/app/api/bookings/route.ts`, `src/app/api/webhooks/stripe/route.ts`
- Create: `src/lib/booking/pricing.ts`, `src/lib/payments/stripe.ts`
- Create: `tests/pricing.test.ts`, `tests/booking.test.ts`

**Step 1 — Failing test:** `priceQuote(3 nights × 2 rooms, 15% tax)` equals expected minor units;
double-booking (same room/date, overlapping range) is rejected; a cancelled booking releases inventory.

**Step 2 — Run:** FAIL. **Step 3 — Implement** with Stripe PaymentIntent, idempotency key on the booking,
webhook signature verification, and a `pending → confirmed` transition only on `payment_intent.succeeded`.
Include an eSewa/Khalti manual-confirmation path (mark booking `pending` with a voucher reference) so
domestic users are not blocked if live keys are not yet available.

**Step 4 — Run:** PASS. Stripe CLI local webhook test (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
→ booking flips to confirmed. Paste the CLI output and the DB row.

**Step 5 — Commit:** `feat: add hotel booking flow with Stripe and manual voucher fallback`

**Verification:** Full journey in a Playwright spec: land → hotel → dates → pay (test card) → confirmation
page → booking appears in owner dashboard. Record which checks ran.

---

### Task 8 — Packages: ready-made and pay-as-you-go

**Objective:** Agencies publish ready-made packages; tourists assemble pay-as-you-go itineraries.

**Files:**
- Create: `src/app/(public)/packages/page.tsx`, `src/app/(public)/packages/[slug]/page.tsx`
- Create: `src/app/org/packages/page.tsx`, `src/lib/packages/payg-builder.ts`
- Create: `tests/packages.test.ts`

**Step 1 — Failing test:** a pay-as-you-go itinerary with 2 hotels + 1 activity + 2 bus legs totals the
correct minor-unit price; removing an item recomputes; an invalid item id errors.

**Step 2–4 —** standard RED-GREEN-REFACTOR. **Step 5 — Commit:** `feat: add ready-made and pay-as-you-go packages`

---

### Task 9 — Guides, agencies, and community destination submissions

**Objective:** Self-serve listings for guides and agencies; the scalable path to covering 77 districts.

**Files:**
- Create: `src/app/(public)/guides/page.tsx`, `src/app/(public)/agencies/page.tsx`
- Create: `src/app/org/guides/profile/page.tsx`, `src/app/org/promotions/page.tsx`
- Create: `src/app/org/destinations/submit/page.tsx` (guide/community draft → `DestinationSubmission`)
- Create: `src/app/admin/submissions/page.tsx` (admin reviews draft → creates `Destination`)
- Create: `tests/listings.test.ts`, `tests/submissions.test.ts`
- **Commit:** `feat: add guide and agency listings with community destination submissions`

**Key rules:** a guide submission cannot publish directly (admin approval required); a submission that
names a new district is flagged in the coverage dashboard so staff see where content is missing.

---

### Task 9b — National coverage dashboard (mission #2 made measurable)

**Objective:** An admin view that proves whether Nepal is actually being covered, and where the gaps are.

**Files:**
- Create: `src/app/admin/coverage/page.tsx`, `src/components/admin/province-card.tsx`,
  `src/components/admin/gap-list.tsx`
- Create: `src/lib/analytics/coverage.ts`
- Create: `tests/coverage-dashboard.test.ts`
- **Commit:** `feat: add province and district coverage dashboard`

**Query before building** (dashboard data rules, not guesses):

```bash
python3 .hermes/skills/ui-ux-pro-max/scripts/search.py "dashboard data table empty state" --domain ux
python3 .hermes/skills/ui-ux-pro-max/scripts/search.py "chart accessible legend tooltip" --domain chart
python3 .hermes/skills/ui-ux-pro-max/scripts/search.py "dashboard density layout" --stack shadcn
```

**Must show:** destinations per province (7 rows, zero rows visibly marked), districts with zero
destinations, hidden-gems count per province, bookable vs non-bookable split, and a "content needed"
queue sorted by gap severity. No charts that encode meaning in colour alone (the skill's chart rule).

**Verification:** paste the rendered table for all 7 provinces; confirm the zero-coverage districts list is
non-empty on the seed data and that clicking a gap filters to the submission form.

---

### Task 10 — Public API v1 with docs, rate limits, and API keys

**Objective:** The notebook's "to our public api" promise, done safely.

**Files:**
- Create: `src/app/api/v1/...` route handlers, `src/app/api/v1/docs/page.tsx`
- Create: `openapi.yaml`, `src/lib/api/rate-limit.ts`, `src/lib/api/pagination.ts`
- Create: `tests/api.test.ts` (contract + rate limit + auth) · **Commit:** `feat: add public API v1 with OpenAPI docs`

**Verification:** `openapi-spec-generation` output validates; 429 returned after the anonymous limit;
paginated envelope `{data, page, pageSize, total}` is stable.

---

### Task 11 — i18n (en/ne), SEO, accessibility

**Objective:** Serve foreign and local tourists; win search traffic.

**Files:**
- Create: `messages/en.json`, `messages/ne.json`, `src/i18n/routing.ts`, `src/app/[lang]/...`
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `tests/i18n.test.ts`, `tests/a11y.test.ts`
- **Commit:** `feat: add English/Nepali localization, SEO metadata and a11y audit`

**Verification:** `npm run build` emits hreflang alternates; axe-core reports 0 serious/critical violations
on `/destinations` and a blog page.

---

### Task 12 — Observability, security hardening, pre-launch

**Objective:** "Fully secured, far away from hackers" as a verifiable checklist, then ship.

**Files:**
- Create: `src/lib/observability/sentry.ts`, `src/lib/security/headers.ts`, `SECURITY.md`
- Create: `tests/security.test.ts` (headers, CSP, no `service_role` in client bundles, no secrets in repo)
- **Commit:** `feat: add security headers, Sentry and pre-launch hardening checklist`

**Checks to actually run and paste results for:**
- `npm audit` → no critical/high unresolved.
- CSP + `X-Frame-Options` + HSTS present on every route.
- `grep -R "SERVICE_ROLE\|service_role"` in `src/` → no hits.
- `tests/security.test.ts` → a client bundle contains no secret env vars.
- Negative RLS re-run against the staging DB (tenant isolation).
- `security-and-hardening` threat pass written into `SECURITY.md`.
- `vercel-deployment`: preview deploy, then production deploy from `main`.

**UI gates (from `ui-ux-pro-max`) — run and paste each result:**
- `ui-lint` and `ui-score` over every route: 0 serious issues; report the score.
- `accessibility-compliance-accessibility-audit` + `wcag-audit-patterns`: axe-core 0 serious/critical on
  `/`, `/destinations`, `/destinations/hidden`, `/map`, a blog page, `/org/hotels`, `/admin/coverage`.
- Contrast audit on the generated token pairs: every text/background pair ≥ 4.5:1 (large text ≥ 3:1).
- `prefers-reduced-motion` emulation on `/` and `/map`: no scroll-scrub, parallax, or camera animation.
- Touch-target audit at 375px: no interactive element < 44×44px.
- CLS < 0.1 and Lighthouse mobile ≥ 90 on `/`, `/destinations`, `/map`.
- No emoji used as icons anywhere in `src/` (grep for emoji ranges).
- Read `references/pro-rules.md` and tick its pre-delivery checklist.

**Mission gates:**
- `/api/v1/destinations?visitationLevel=hidden` returns a non-empty set.
- `/api/v1/regions/coverage` reports all 7 provinces and a non-empty zero-coverage district list.
- The homepage renders four rails (Popular / Hidden / Adventures / Trails).

**Step — Commit:** `chore: production readiness and launch checklist`

---

### Task 13 (Phase 2+, deferred) — 360° media, bus booking, ride sharing, flight quotes, Algolia, R2

Tracked as issues, not in v1. Each gets its own spec before any code (per `spec-driven-development`).

---

## 5. Files likely to change (summary)

```
design-system/letxnepal/MASTER.md, tokens.json, preview.html, pages/*.md   (ui-ux-pro-max output)
.hermes/skills/ui-ux-pro-max/                                             (installed UI design skill)
docs/spec.md, docs/acceptance-criteria.md, docs/architecture.md,
docs/design-notes.md, docs/adr/*.md
prisma/schema.prisma, prisma/seed.ts, prisma/migrations/*
supabase/migrations/*.sql, supabase/seed.sql
src/app/**            (public pages + map, org dashboard, admin CMS + coverage, api routes)
src/components/**     (ui/, public/, org/, admin/, filters/)
src/lib/**            (db, auth, tenant, content, geo, destinations, booking, payments, api, i18n,
                       analytics, observability)
messages/en.json, messages/ne.json
tests/**, playwright/**
package.json, tsconfig.json, next.config.ts, tailwind.config.ts, eslint.config.mjs
.env.local.example, README.md, SECURITY.md
```

## 6. Tests / validation strategy

| Layer | Tool | Gate |
|---|---|---|
| Unit (pricing, sanitize, roles, RLS) | Vitest | `npm test` green before every commit |
| API contract | Vitest + supertest | `tests/api.test.ts` |
| Browser journeys | Playwright | booking flow + admin CMS |
| Schema drift | `prisma migrate diff` | zero diff |
| Static | ESLint + `tsc --noEmit` | 0 errors |
| Build | `next build` | success |
| Security | `npm audit`, axe-core, custom header/secret tests | no critical/high |
| SEO | `structured-data-validator`, Lighthouse | ≥ 90 mobile |
| UI quality | `ui-lint`, `ui-score`, `ui-review` (from `ui-ux-pro-max`) | 0 serious issues; score recorded |
| A11y | `accessibility-compliance-accessibility-audit`, `wcag-audit-patterns`, axe-core | 0 serious/critical |
| Mission | coverage API + hidden-gem query + 4 homepage rails | all non-empty/present |

Every task ends with a real command's output pasted into the commit message body — no "should work" claims.

## 7. Risks, tradeoffs, and open questions

**Risks**
1. *Scope.* The notebook lists ~8 feature families. Building all at once is the main failure mode.
   Mitigation: the scope-cut table in §1.2 and a hard "one vertical slice at a time" rule.
2. *Mission drift.* "Hidden destinations" is easy to reduce to a filter tag and never make central.
   Mitigation: the mission gates in Task 12 (`visitationLevel=hidden` non-empty, coverage API with a real
   zero-district list, four homepage rails) are pass/fail release criteria, not nice-to-haves.
3. *Coverage is a content problem, not an engineering problem.* 77 districts cannot be seeded by one
   person. Mitigation: Task 9's community/guide submission flow plus the Task 9b gap dashboard, so content
   growth is a process with a backlog rather than a one-off seed.
4. *Map cost/complexity.* Mapbox keys and tile serving can become a real bill. Mitigation: MapLibre GL +
   free tiles, server-side clustering, map is progressive enhancement (list works without JS).
5. *Accessibility of an interactive map.* Maps are a known screen-reader failure. Mitigation: the skill's
   map rules are binding — labelled region, text summary, filter-synced table alternative, keyboard
   marker access. Verified in Task 4.
6. *Payments.* Nepali domestic gateways (eSewa/Khalti) need merchant registration; Stripe needs a
   foreign entity. Mitigation: voucher/manual-confirmation fallback keeps the flow testable without keys;
   domestic payment support is a mission #2 requirement, so it must not be dropped silently.
7. *Content.* No destination photography or copy exists. Mitigation: seed with a balanced set (~1–2 per
   province, 6–8 flagged hidden) using public-domain/CC images and clearly-marked placeholder copy;
   replace with licensed media before marketing.
8. *Security.* Admin-authored HTML is the highest-risk surface. Mitigation: DOMPurify server-side + CSP +
   sanitized-only client rendering, with negative tests.
9. *RLS complexity.* UPDATE-needs-SELECT-policy and `security_invoker` views are easy to get wrong.
   Mitigation: explicit negative tests per tenant pair, run against a real database.
10. *i18n quality.* Machine-translated Nepali will read badly. Mitigation: en-only at launch, ne behind a
   flag, human review before enabling.
11. *Multi-tenancy vs. simplicity.* `organization_id` on every table adds friction. Chosen deliberately:
   the owner dashboard is the product's core, and RLS prevents the classic cross-owner data leak.
12. *Design skill vs. mandate conflict.* `ui-ux-pro-max` recommends Aurora UI + scroll storytelling; the
   user's mandate is "very simple UI". Mitigation: the mandate wins for v1, the conflict is recorded in
   `docs/design-notes.md`, and the skill's content order is kept without its motion.

**Tradeoffs**
- Next.js + Supabase over a separate API service: fewer moving parts, matches the "simple" mandate.
- Postgres full-text search over Algolia for v1: one less dependency; upgrade path documented.
- MapLibre over Mapbox: no key, no per-load billing, self-hostable; slightly rougher out-of-the-box tiles.
- Manual voucher payments over live domestic gateway for v1: regulatory friction removed.
- Supabase Storage over R2: good enough until media volume justifies the move.
- Static homepage rails over a CMS-driven page builder: the four rails are fixed, which is exactly the
  "only required decorations" requirement.

**Open questions (must answer before Task 1 is useful)**
The eight blocking questions in §1.3, plus: is there an existing brand/logo? Who writes the seed content?
Is there a real Supabase project already, or should we start with the local CLI? Which province tourism
boards or agencies should be approached as launch partners (this determines the seed geography)?

---

## 8. Execution handoff

Plan complete and saved. Ready to execute with subagent-driven-development — one fresh subagent per task,
with a spec-compliance review then a code-quality review before the next task starts.

**Suggested order:** Task 0 (UI skill + design system + discovery + spec) → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 9b → 10 → 11 → 12.
Do not start Task 1 before the eight blocking questions are answered.
Task 4 is the mission-critical slice: everything after it builds on the destination model and the
discovery UX. If time is short, ship 0→1→2→3→4→10 (discovery + public API) before adding booking.
