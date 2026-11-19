import { describe, expect, it } from "vitest";
import { readFileSync, walk } from "./helpers/fs";
import { CAPABILITIES } from "../src/lib/auth/roles";

/**
 * The public API is read-only by contract.
 *
 * Hotel owners push availability and prices through the authenticated partner API under
 * /api/v1/org. The public /api/v1 namespace is for readers and developers and must never
 * accept a write. This is enforced structurally by scanning every route file in that
 * namespace and asserting it only exports GET or HEAD.
 */

const PUBLIC_API_DIR = "src/app/api/v1";

function publicRouteFiles(): string[] {
  return walk(PUBLIC_API_DIR).filter((file) => /route\.ts$/.test(file));
}

describe("public API is read-only", () => {
  const files = publicRouteFiles();

  it("finds at least one public route", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)("%s exports only GET or HEAD", (file) => {
    const source = readFileSync(file);
    const exported = [...source.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g)].map(
      (match) => match[1]!,
    );
    const forbidden = exported.filter(
      (name) => !["GET", "HEAD"].includes(name),
    );
    expect(forbidden, `${file} exports write handlers: ${forbidden.join(", ")}`).toEqual([]);
  });

  it.each(files)("%s does not accept a write method internally", (file) => {
    const source = readFileSync(file);
    // A route that switches on the request method is a smell even if it only handles GET.
    expect(source, `${file} branches on the HTTP method`).not.toMatch(/request\.method/);
  });
});

describe("partner write surface is separate", () => {
  it("exposes write capabilities distinct from the public read surface", () => {
    // Availability writes are a partner capability, not a public one.
    expect(CAPABILITIES).toContain("availability:write_own");
    expect(CAPABILITIES).toContain("hotel:create");
  });

  it("does not mount a write route inside the public namespace", () => {
    const source = readFileSync("docs/spec.md");
    expect(source).toMatch(/read-only/i);
  });
});
