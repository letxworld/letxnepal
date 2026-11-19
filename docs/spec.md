# letxNepal — Product Specification

Status: v1 in progress. Last updated 2026-11-19.

## 1. Problem

Nepal's tourism economy is concentrated on a short list of famous places. Pokhara,
Kathmandu, Chitwan and the Annapurna and Everest trails absorb the overwhelming majority
of visitors, while hundreds of destinations across the mid-hills and the far west have no
bookable presence at all — no listing, no prices, no way for a traveller to plan a visit.

The result is economic as much as cultural: tourism revenue does not reach the districts
that need it, and travellers who want something quieter have no reliable way to find it.

## 2. Mission

Two goals, in priority order. They were stated by the product owner and they drive build
order:

1. **Surface hidden and remote destinations.** Discovery of under-visited places is the
   product's core, not a filter on the side.
2. **Grow tourism across all of Nepal.** Every province, and ultimately every district —
   not only the classic circuit.

## 3. Actors and permissions

Seven actors from the original brief, mapped to five permission roles. Enforcement is
layered: route guard, input validation, ownership check, scoped query, then Postgres
row-level security as a database-level safety net.

| Actor (brief) | Role | Scope |
|---|---|---|
| SuperAdmin | `super_admin` | Global, cross-organisation, bypasses RLS via a dedicated DB role |
| Admin | `admin` | Global content and moderation; no financial mutation |
| Hotel Owner / Manager / Lodge | `org_admin` | Own `organization` (hotel, lodge, guest house) |
| Tourism agency / Cruise / Promoter | `org_admin` | Own `organization` (agency, cruise) |
| Guide | `guide` | Own `guide_profile`; may be contracted by an agency |
| Local / Foreign tourist | `customer` | Own bookings, reviews, saved trips |

`cruise` is an organisation type, not a separate role — the permission set is identical
to an agency, and a separate role would add complexity without changing behaviour.

## 4. Discovery model

"Hidden" is a structured, filterable property. Every destination carries:

| Field | Values |
|---|---|
| `remoteness` | easy, moderate, remote, very_remote |
| `accessLevel` | road, jeep, trail, flight, boat |
| `visitationLevel` | iconic, established, emerging, hidden |
| `hiddenGem` | boolean — true when either flag says hidden |
| `permitRequired` | boolean |
| `bestSeason` | months |
| `nearestSettlement` | text |
| `localCommunity` | text |
| `localHouseholdsSupported` | integer |
| `whyHidden` | text — required for hidden gems |
| `howToGetThere` | HTML |
| `coordinatesVerified` | boolean |

Two destinations are both iconic and hidden by different routes (`visitationLevel=hidden`
or `hiddenGem=true`); `isHiddenGem()` is the single predicate the whole app uses.

## 5. Coverage — mission goal 2 made measurable

`/api/v1/regions/coverage` and `/coverage` report, for each of the 7 provinces:

- destination count, hidden-gem count, bookable count
- districts covered out of districts total
- the explicit list of districts with no destination

Current position (seed data, 2026-11-19):

| Metric | Value |
|---|---|
| Destinations | 23 |
| Hidden gems | 15 |
| Provinces covered | 7 / 7 |
| Districts covered | 21 / 77 |
| Districts with no destination | 56 |
| Estimated households supported | 8,160 |

The 56 zero-coverage districts are the platform's backlog. Without this number, "grow all
Nepal" would be unfalsifiable.

## 6. Feature list and status

| Feature | Status | Notes |
|---|---|---|
| Destination catalogue with hidden/remote taxonomy | shipped | 23 seeded |
| Province / district coverage reporting | shipped | API + page |
| Hidden gems index | shipped | sorted most remote first |
| Filterable discovery (website + API) | shipped | shared Zod schema |
| Trails and adventures | shipped | 5 trails, 6 adventures |
| Public API v1 | shipped | read-only |
| Admin HTML blog CMS with sanitized rendering | planned | Task 5 |
| Hotel inventory and availability dashboard | planned | Task 6 |
| Booking flow with payments | planned | Task 7 |
| Ready-made and pay-as-you-go packages | planned | Task 8 |
| Guide and agency listings, community submissions | planned | Task 9 |
| Admin coverage dashboard | planned | Task 9b |
| Rate limiting and API keys | planned | Task 10 |
| English / Nepali localisation | planned | Task 11 |
| Map explorer | planned | Task 4b |

### Deliberately deferred (v2+)

| Item | Reason |
|---|---|
| 360° location media | Needs a media pipeline and assets; no source material exists |
| Ride sharing | Driver onboarding, live GPS, fares and regulatory surface |
| Bus booking | Needs carrier integration; start with route search |
| Flight booking | No licensed ticketing API for Nepali carriers |

## 7. Non-functional requirements

- **Simple UI.** The original brief states: "Very simple UI, only required buttons, only
  required decorations." This is a binding constraint, recorded as an override against the
  design skill's scroll-storytelling recommendation.
- **Security.** "Fully secured, far away from hackers." Admin-authored HTML is sanitized
  server-side. Roles are stored in `app_metadata`, never in user-editable `user_metadata`.
  Postgres RLS is enabled as a second enforcement layer.
- **Accessibility.** WCAG 2.1 AA. Contrast ≥ 4.5:1 verified in CI, visible focus, 44×44px
  touch targets, reduced-motion respected, every input labelled.
- **Internationalisation.** English default, Nepali fully supported. The primary font must
  render Devanagari — see the font correction in `docs/provenance.md`.
- **Performance.** Lighthouse mobile ≥ 90 on public pages; CLS < 0.1.
- **SEO.** Structured data on destination pages, canonical URLs, sitemap, semantic HTML.

## 8. Definition of done

A change is done when:

1. It has a failing test written first, then a passing one.
2. `tsc --noEmit`, `npm run lint`, `npm test` and `npm run build` all pass.
3. It has been verified against the running application, and the real output is recorded.
4. It is committed as its own focused commit.
5. No raw hex value, emoji icon, or unlabelled input has been introduced.

## 9. Data honesty

Destination coordinates are approximate. 12 of the 23 seeded destinations carry
`coordinatesVerified: false`. They are for map placement and distance estimation only and
must be verified against an authoritative source before launch. The flag exists so that
verification can be tracked rather than assumed.
