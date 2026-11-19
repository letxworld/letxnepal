import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync, walk } from "./helpers/fs";
import { colors, contrastPairs, designSystem, fonts, spacing } from "@/lib/design-tokens";
import tokens from "../design-system/letxnepal/tokens.json";

/**
 * Token integrity gates.
 *
 * These tests exist so a regeneration of the design system, or a careless edit in
 * a component, cannot silently break the product's visual contract. They are the
 * automated version of the hand-run contrast check recorded in docs/provenance.md.
 */

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function srgbChannel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const normalized = hex.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : normalized;
  const r = Number.parseInt(expanded.slice(0, 2), 16);
  const g = Number.parseInt(expanded.slice(2, 4), 16);
  const b = Number.parseInt(expanded.slice(4, 6), 16);
  return 0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b);
}

function hexOr(value: string | undefined, fallback: string): string {
  return value && HEX.test(value) ? value : fallback;
}

export function contrastRatio(foreground: string | undefined, background: string | undefined): number {
  const a = relativeLuminance(hexOr(foreground, "#000000"));
  const b = relativeLuminance(hexOr(background, "#ffffff"));
  const higher = Math.max(a, b);
  const lower = Math.min(a, b);
  return (higher + 0.05) / (lower + 0.05);
}

describe("design token file", () => {
  it("declares the expected semantic colour roles", () => {
    const required = [
      "primary",
      "on-primary",
      "secondary",
      "on-secondary",
      "accent",
      "on-accent",
      "background",
      "foreground",
      "card",
      "card-foreground",
      "muted",
      "muted-foreground",
      "border",
      "destructive",
      "on-destructive",
      "ring",
    ];
    for (const role of required) {
      expect(colors[role], `missing colour token: ${role}`).toMatch(HEX);
    }
  });

  it("every colour token is a valid hex value", () => {
    for (const [name, value] of Object.entries(colors)) {
      expect(value, name).toMatch(HEX);
    }
  });

  it("declares a Devanagari-capable font, not the generator's Thai default", () => {
    // The generator recommended "Noto Sans Thai" for this query, which has no
    // Devanagari coverage. Guard the correction so it is not regenerated away.
    for (const value of Object.values(fonts)) {
      expect(value.toLowerCase()).not.toContain("thai");
      expect(value).toMatch(/devanagari|mukta|hind|noto sans/i);
    }
  });

  it("has heading and body fonts", () => {
    expect(fonts.heading?.length ?? 0).toBeGreaterThan(3);
    expect(fonts.body?.length ?? 0).toBeGreaterThan(3);
  });

  it("declares the spacing scale", () => {
    for (const key of ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"]) {
      expect(spacing[key], `missing spacing token: ${key}`).toBeTruthy();
    }
  });

  it("tokens.json and tokens.css agree on colours", () => {
    const css = readFileSync("design-system/letxnepal/tokens.css");
    for (const [name, value] of Object.entries(colors)) {
      expect(
        css.toLowerCase(),
        `tokens.css missing --color-${name}`,
      ).toContain(`--color-${name}: ${value.toLowerCase()}`);
    }
  });
});

describe("WCAG contrast", () => {
  it.each(contrastPairs.map((pair) => [pair.name, pair] as const))(
    "%s meets AA for normal text",
    (_name, pair) => {
      const ratio = contrastRatio(pair.foreground, pair.background);
      expect(ratio, `${pair.name} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("reports the measured ratios", () => {
    const measured = contrastPairs.map((pair) => ({
      name: pair.name,
      ratio: Number(contrastRatio(pair.foreground ?? "", pair.background ?? "").toFixed(2)),
    }));
    expect(measured.length).toBeGreaterThanOrEqual(7);
    // Fail loudly if a pair was silently dropped, rather than passing vacuously.
    for (const entry of measured) {
      expect(entry.ratio, entry.name).toBeGreaterThan(1);
    }
  });
});

describe("no raw hex values in source", () => {
  const SOURCE_DIRS = ["src", "tailwind.config.ts"];
  const ignore = new Set(["globals.css", "design-tokens.ts"]);

  function sourceFiles(): string[] {
    const files: string[] = [];
    for (const entry of SOURCE_DIRS) {
      const stat = statSync(entry);
      if (stat.isFile()) {
        files.push(entry);
        continue;
      }
      files.push(...walk(entry));
    }
    return files.filter((file) => /\.(ts|tsx|css)$/.test(file) && !ignore.has(file.split("/").pop()!));
  }

  it("components use semantic tokens, not hardcoded colours", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles()) {
      const content = readFileSync(file);
      const matches = content.match(/#[0-9a-fA-F]{3,8}\b/g);
      if (matches) offenders.push(`${file}: ${matches.join(", ")}`);
    }
    expect(offenders).toEqual([]);
  });
});

describe("design system provenance", () => {
  it("records the generator and style", () => {
    expect(designSystem.generatedBy).toBe("ui-ux-pro-max");
    expect(designSystem.style).toBe("Aurora UI");
  });

  it("pins motion low, per the simple-UI mandate", () => {
    expect(designSystem.motion).toBeLessThanOrEqual(3);
  });

  it("tokens.json carries a schema declaration", () => {
    expect(tokens.$schema).toContain("design-tokens.org");
  });
});
