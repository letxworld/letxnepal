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

Two goals, in priority order. They drive build order:

1. **Surface hidden and remote destinations.** Discovery of under-visited places is the
   product's core, not a filter on the side.
2. **Grow tourism across all of Nepal.** Every province, and ultimately every district.

## 3. Login roles

Four distinct login types. There is no combined account; each login lands on its own
dashboard.

| Login role | Lands on | Can do |
|---|---|---|
| Tourist | Customer dashboard | Book, review, save trips, manage own bookings |
| Hotel owner | Owner dashboard | Set own room availability and prices, manage own property |
| Agency | Agency dashboard | List the agency, publish packages |
| Guide | Guide dashboard | Own profile, contact details, articles |

## 4. Back-office roles

Two layers, and the distinction matters.

### SuperAdmin

- Provisions and revokes Admins, choosing their domain. This is the only role that can
  create an Admin account.
- Holds every capability across every domain.
- Cannot be used for day-to-day operations; provisioning and destructive actions are
  audit-logged.

### Admin — scoped to exactly one domain

An Admin is authoritative inside one domain and blind to the other five. This is a
two-dimensional permission check: `role = admin` **and** `domain = <one of six>`.
Enforced on every protected route, not only hidden in the UI. An Admin with the blog
domain receives `403` on a hotel route, and that is covered by a test.

| Domain | Capabilities |
|---|---|
| `blog` | Create and edit the single blog page belonging to a destination |
| `hotel` | Add a listed hotel, remove a listed hotel, assign the owner |
| `customer` | Manage customer accounts; raise cancellation and refund requests |
| `finance` | All money movement: charge, refund, payout, reconcile |
| `flight` | Flight content and booking administration (after provider API) |
| `bus` | Bus content and ticket administration (after provider API) |

An Admin account is created with exactly one domain. There is no multi-domain Admin;
granting two domains means two accounts, so no single login accumulates unrelated power.

## 5. Domain handoff: customer to finance

A cancellation raised by the customer Admin becomes a **refund request**, not a refund.
Only the finance Admin executes it. This is a deliberate handoff between two scoped roles
so that no single Admin can both raise and settle a money movement.

Rules:

- A refund cannot exceed the original charge.
- A refund is executed once; the operation is idempotent.
- Refunds are append-only ledger entries (§7).
- Above a configurable threshold, a refund requires two finance approvals.

## 6. Content model

### Destinations

A destination carries the discovery taxonomy (§7) and category flags:
`popular`, `adventurous`, `remote`, `hidden`. SuperAdmin creates destinations; the blog
Admin writes pages for them.

### Blog pages — one page per destination

A blog post belongs to exactly one destination and is created **after** the destination
exists. There is no free-floating article. `BlogPost → Destination` is many-to-one.

- The Admin form is "choose a destination, then write its page".
- The Journal index lists destination pages, not standalone articles.
- Content is stored as sanitized HTML (§8).

## 7. Discovery taxonomy

Every destination carries:

| Field | Values |
|---|---|
| `remoteness` | easy, moderate, remote, very_remote |
| `accessLevel` | road, jeep, trail, flight, boat |
| `visitationLevel` | iconic, established, emerging, hidden |
| `hiddenGem` | boolean — true when either flag says hidden |
| `categories` | popular, adventurous, remote, hidden |
| `permitRequired` | boolean |
| `bestSeason` | months |
| `nearestSettlement` | text |
| `localCommunity` | text |
| `localHouseholdsSupported` | integer |
| `whyHidden` | text — required for hidden gems |
| `howToGetThere` | HTML |
| `coordinatesVerified` | boolean |

`isHiddenGem()` is the single predicate the app uses.

## 8. Money and tenancy

### Ledger, not editable columns

Every financial movement is an **append-only ledger entry**. A correction is a new
compensating entry; no entry is ever edited or deleted, by any role including finance.
Each entry records: amount in minor units, currency, type (charge, refund, payout,
adjustment), actor, organisation, booking, idempotency key, and timestamp.

This is what makes the platform's finances auditable after the fact.

### Hotel owner data

- An owner sets availability and prices **for their own property only**.
- Enforced by organisation scoping in the query layer and by Postgres row-level security
  in the database.
- The hotel Admin does **not** edit availability or prices. The Admin adds and removes
  listings; owners hold the pricing data.

### Listing removal is a soft delete

Removing a hotel marks it `removed`, keeps the record and every booking, and hides it from
public listings. A hard delete would destroy booking history and break reconciliation.

### Public API is read-only

`/api/v1/*` accepts `GET` and `HEAD` only, for readers and developers. No write route
exists in that namespace. Availability and price writes go through the authenticated
partner API under `/api/v1/org/*`, behind authentication and tenancy.

This is enforced structurally and by a test that asserts the public namespace rejects
`POST`, `PUT`, `PATCH` and `DELETE`.

## 9. Booking providers

Flight and bus booking depend on an external provider API that is not yet connected.
The platform defines a **provider adapter** contract — search, quote, book, and a
booking-status webhook — so the provider plugs in when available.

Until it is connected, the UI states plainly that booking is unavailable rather than
pretending to work. No fake confirmation is ever shown.

Confirmed: the provider API will be fully functional with all details.

## 10. Actors summary

| Actor | Provisioned by | Scope |
|---|---|---|
| SuperAdmin | seeded, one only | everything, plus Admin provisioning |
| Admin — blog | SuperAdmin | one domain |
| Admin — hotel | SuperAdmin | one domain |
| Admin — customer | SuperAdmin | one domain |
| Admin — finance | SuperAdmin | one domain |
| Admin — flight | SuperAdmin | one domain |
| Admin — bus | SuperAdmin | one domain |
| Hotel owner | self-register, approved by hotel Admin | own organisation |
| Agency | self-register, approved by hotel Admin | own organisation |
| Guide | self-register | own profile |
| Tourist | self-register | own account |

## 11. Coverage — mission goal 2 made measurable

`/api/v1/regions/coverage` and `/coverage` report, per province: destination count,
hidden-gem count, bookable count, districts covered, and the explicit list of districts
with no destination.

Current position (seed data, 2026-11-19):

| Metric | Value |
|---|---|
| Destinations | 23 |
| Hidden gems | 15 |
| Provinces covered | 7 / 7 |
| Districts covered | 21 / 77 |
| Districts with no destination | 56 |
| Estimated households supported | 8,160 |

## 12. Feature status

| Feature | Status |
|---|---|
| Destination catalogue with hidden/remote taxonomy | shipped |
| Province / district coverage reporting | shipped |
| Hidden gems index | shipped |
| Filterable discovery (website + API) | shipped |
| Trails and adventures | shipped |
| Public read-only API v1 | shipped |
| Role and domain permission model (4 login roles, 6 admin domains) | next |
| Admin HTML blog CMS, one page per destination | planned |
| Hotel owner availability and price dashboard | planned |
| Hotel Admin add/remove listing with audit log | planned |
| Booking flow with finance ledger and refund handoff | planned |
| Flight and bus via provider adapter | planned |
| English / Nepali localisation | planned |
| Map explorer | planned |

### Deferred

| Item | Reason |
|---|---|
| 360° location media | Needs a media pipeline and assets |
| Ride sharing | Driver onboarding, live GPS, fares, regulation |

## 13. Non-functional requirements

- **Simple UI.** "Very simple UI, only required buttons, only required decorations." Binding.
- **Security.** Admin-authored HTML sanitized server-side. Roles and domains come from
  `app_metadata`, never user-editable claims. Postgres RLS as a second enforcement layer.
  Finance and provisioning actions audit-logged.
- **Accessibility.** WCAG 2.1 AA, verified in CI.
- **Internationalisation.** English default, Nepali fully supported; Devanagari-capable font.
- **Performance.** Lighthouse mobile ≥ 90; CLS < 0.1.
- **SEO.** Structured data, canonical URLs, semantic HTML.

## 14. Definition of done

1. A failing test first, then a passing one.
2. `tsc --noEmit`, `npm run lint`, `npm test`, `npm run build` all pass.
3. Verified against the running application, with the real output recorded.
4. Committed as its own focused commit.
5. No raw hex, emoji icon, or unlabelled input introduced.

## 15. Data honesty

Destination coordinates are approximate. 12 of 23 seeded destinations carry
`coordinatesVerified: false`. For map placement only; verify before launch.
