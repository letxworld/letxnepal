# Design notes

Working log of design decisions, skill queries and their outcomes. Complements
`docs/provenance.md`, which records where generated files came from.

## Skill queries run

| Query | Mode | Outcome |
|---|---|---|
| `travel tourism destination discovery adventure remote hidden` | `--design-system` | Aurora UI, sky + adventure orange, scroll-storytelling pattern |
| `nepali devanagari sans serif multilingual` | `--domain google-fonts` | Noto Sans, IBM Plex Sans Devanagari, Anek Devanagari, Noto Sans Devanagari, Amiko, Arya |
| `travel booking marketplace` | `--domain product` | Travel/Tourism Agency profile: Aurora UI + Motion-Driven, Storytelling-Driven + Hero-Centric, `rtl_level: full` |
| `hero search social proof` | `--domain landing` | Marketplace/Directory pattern: search-first hero, categories, featured listings, trust/safety, become-a-host CTA |
| `map exploration discovery region filter` | `--domain ux` | 6 applicable rules (see below) |

## Map UX rules captured (Task 4b)

These are binding for the map explorer, from the skill's `ux-guidelines.csv`:

1. **Map text alternative** — an interactive map canvas is invisible to screen readers.
   Give the container `role="region"`, an `aria-label`, a short text summary, and a
   filter-synced feature list or table.
2. **Cluster dense points** — cluster at low zoom with a count label, set
   `clusterMaxZoom`, and zoom into a cluster on click or Enter.
3. **Chip collection reflow** — filter chips must wrap or disclose overflow with a `+n`
   control. Never force one clipped row.
4. **Map camera reduced motion** — no fly-to tours, spinning globes or looping camera
   animation. Skip camera moves under `prefers-reduced-motion`; give continuous animation
   a pause control.
5. **Map symbology not colour alone** — pair colour with an icon, shape, pattern or label
   per category. Use colour-blind-safe ramps (ColorBrewer YlGnBu, Blues, RdBu, or
   Viridis) and check the legend under deuteranopia.

## Applied to v1

- Palette, type scale, spacing, radius and shadow come from the generated tokens. No raw
  hex in components; enforced by `tests/tokens.test.ts`.
- Fonts corrected to a Devanagari-capable family (see ADR 0002).
- Motion pinned low. The homepage is static; hover transitions are 150ms.
- Filter chips wrap; every chip is a real labelled checkbox with a 44px target.
- Hidden-gem marking uses a text label, never colour alone.
- Empty states explain themselves; nothing renders as a blank area.
- No emoji as icons. SVG only.

## Deliberate override of the scroll-storytelling pattern

Kept the content order, dropped the scroll effects. Reason: the brief mandates a very
simple UI, and the skill's own anti-pattern for this product type is "Generic photos +
Complex booking". Recorded in ADR 0002 and in `MASTER.md`.

## Still to apply

- Map explorer (Task 4b): the five rules above.
- Dashboard density (`--density 8`) versus marketing pages (`--density 3`).
- Pre-delivery checklist from `references/pro-rules.md` at Task 12.
