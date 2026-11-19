import { describe, expect, it } from "vitest";
import { readFileSync } from "./helpers/fs";

/**
 * Structural accessibility gates that do not need a browser.
 *
 * These catch the defects that are easy to introduce and expensive to find by
 * hand: an input with no accessible name, a missing document language, a page
 * with no h1, or a removed focus ring. Browser-level checks (keyboard traversal,
 * screen reader output) still need Playwright and a human pass; this is the
 * cheap, permanent half.
 */

const CSS = readFileSync("src/app/globals.css");
const LAYOUT = readFileSync("src/app/layout.tsx");
const CHROME = readFileSync("src/components/layout/site-chrome.tsx");

describe("document structure", () => {
  it("declares a language on the html element", () => {
    expect(LAYOUT).toMatch(/<html lang="en">/);
  });

  it("provides a skip link to the main content", () => {
    // The skip link lives in the root layout; the #main target is in the shell.
    expect(LAYOUT).toMatch(/href="#main"/);
    expect(CHROME).toMatch(/id="main"/);
  });
});

describe("focus visibility", () => {
  it("defines a visible focus style rather than removing outlines", () => {
    expect(CSS).toMatch(/:focus-visible/);
    expect(CSS).not.toMatch(/outline:\s*none\s*;/);
  });
});

describe("reduced motion", () => {
  it("respects prefers-reduced-motion", () => {
    expect(CSS).toMatch(/prefers-reduced-motion:\s*reduce/);
  });
});

describe("touch targets", () => {
  it("sets a 44px minimum on interactive classes", () => {
    expect(CSS).toMatch(/min-h-\[44px\]/);
  });
});

describe("base typography", () => {
  it("uses a 16px base font size", () => {
    expect(CSS).toMatch(/font-size:\s*16px/);
  });

  it("uses a 1.5 line height", () => {
    expect(CSS).toMatch(/line-height:\s*1\.5/);
  });
});

describe("source-level label association", () => {
  const files = [
    "src/components/public/filters/destination-filter.tsx",
    "src/app/destinations/page.tsx",
  ];

  for (const file of files) {
    const source = readFileSync(file);

    it(`${file}: every non-hidden input has an id and a labelling label`, () => {
      const inputs = source.match(/<input[\s\S]*?\/>/g) ?? [];
      const labels = source.match(/<label[\s\S]*?<\/label>/g) ?? [];
      const labelledIds = new Set(
        labels.flatMap((label) => [...label.matchAll(/htmlFor="([^"]+)"/g)].map((m) => m[1]!)),
      );
      const problems: string[] = [];
      for (const input of inputs) {
        if (input.includes('type="hidden"')) continue;
        const rawId = input.match(/id=\{`([^`]+)`\}/)?.[1] ?? input.match(/id="([^"]+)"/)?.[1];
        const id = rawId;
        // Dynamic ids built with a template literal are fine: the matching
        // htmlFor uses the same expression, so association holds at runtime.
        const dynamic = id?.includes("${") ?? false;
        if (!id && !dynamic) {
          problems.push(`input without id: ${input.slice(0, 70)}`);
          continue;
        }
        if (dynamic) {
          // The matching htmlFor repeats the same prefix, e.g.
          // id={`remoteness-${option.value}`} / htmlFor={`remoteness-${option.value}`}
          const prefix = id!.split("${")[0];
          const associated = labels.some((label) => label.includes(`htmlFor={\`${prefix}\${`));
          if (!associated) problems.push(`dynamic input ${id} has no matching htmlFor`);
          continue;
        }
        // Either an explicit htmlFor association, or the input sits inside its label.
        const wrapped = labels.some((label) => label.includes(`id="${id}"`));
        if (!labelledIds.has(id!) && !wrapped) {
          problems.push(`input ${id} has no associated label`);
        }
      }
      expect(problems, problems.join("\n")).toEqual([]);
    });
  }
});

describe("no emoji used as icons", () => {
  const sources = ["src/app/page.tsx", "src/components/public/destination-card.tsx"];
  const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

  for (const file of sources) {
    it(`${file} contains no emoji`, () => {
      expect(readFileSync(file), `${file} uses an emoji where an SVG icon belongs`).not.toMatch(emoji);
    });
  }
});
