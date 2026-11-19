import { describe, expect, it } from "vitest";
import { DESTINATIONS, TRAILS, ADVENTURES } from "../src/data/destinations";
import {
  ACCESS_LEVELS,
  DISTRICTS,
  PROVINCES,
  REMOTENESS,
  VISITATION_LEVELS,
  DIFFICULTIES,
  districtById,
  isHiddenGem,
  provinceById,
} from "../src/lib/nepal";

describe("nepal domain data integrity", () => {
  it("has exactly 7 provinces", () => {
    expect(PROVINCES).toHaveLength(7);
  });

  it("has exactly 77 districts", () => {
    expect(DISTRICTS).toHaveLength(77);
  });

  it("every district belongs to a real province", () => {
    const ids = new Set(PROVINCES.map((p) => p.id));
    for (const d of DISTRICTS) {
      expect(ids.has(d.province), `${d.id} -> ${d.province}`).toBe(true);
    }
  });

  it("every destination references a real province and district", () => {
    const provinces = new Set<string>(PROVINCES.map((p) => p.id));
    const districts = new Set<string>(DISTRICTS.map((d) => d.id));
    for (const dest of DESTINATIONS) {
      expect(provinces.has(dest.province), `${dest.slug} province`).toBe(true);
      expect(districts.has(dest.district), `${dest.slug} district`).toBe(true);
      expect(districtById(dest.district)?.province).toBe(dest.province);
    }
  });

  it("uses only valid taxonomy values", () => {
    for (const dest of DESTINATIONS) {
      expect(REMOTENESS).toContain(dest.remoteness);
      expect(ACCESS_LEVELS).toContain(dest.accessLevel);
      expect(VISITATION_LEVELS).toContain(dest.visitationLevel);
    }
    for (const trail of TRAILS) expect(DIFFICULTIES).toContain(trail.difficulty);
  });

  it("has unique slugs", () => {
    const slugs = DESTINATIONS.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("covers all 7 provinces with at least one destination", () => {
    const covered = new Set(DESTINATIONS.map((d) => d.province));
    for (const p of PROVINCES) {
      expect(covered.has(p.id), `province ${p.name} has no destination`).toBe(true);
    }
  });

  it("has hidden gems spread across at least 4 provinces", () => {
    const hidden = DESTINATIONS.filter((d) => isHiddenGem(d.visitationLevel, d.hiddenGem));
    const provinces = new Set(hidden.map((d) => d.province));
    expect(hidden.length).toBeGreaterThanOrEqual(10);
    expect(provinces.size).toBeGreaterThanOrEqual(4);
  });

  it("marks every hidden destination with a real reason", () => {
    for (const dest of DESTINATIONS) {
      if (isHiddenGem(dest.visitationLevel, dest.hiddenGem)) {
        expect(dest.whyHidden.length, dest.slug).toBeGreaterThan(20);
      }
    }
  });

  it("coordinates are inside Nepal's bounding box", () => {
    for (const dest of DESTINATIONS) {
      expect(dest.latitude, `${dest.slug} lat`).toBeGreaterThan(26.3);
      expect(dest.latitude, `${dest.slug} lat`).toBeLessThan(30.5);
      expect(dest.longitude, `${dest.slug} lng`).toBeGreaterThan(80.0);
      expect(dest.longitude, `${dest.slug} lng`).toBeLessThan(88.3);
    }
  });

  it("every trail and adventure references a real district", () => {
    const districts = new Set<string>(DISTRICTS.map((d) => d.id));
    for (const t of TRAILS) expect(districts.has(t.district), `trail ${t.slug}`).toBe(true);
    for (const a of ADVENTURES) expect(districts.has(a.district), `adventure ${a.slug}`).toBe(true);
  });

  it("provinceById and districtById resolve correctly", () => {
    expect(provinceById("KARNALI")?.name).toBe("Karnali");
    expect(districtById("KASKI")?.province).toBe("GANDAKI");
  });
});
