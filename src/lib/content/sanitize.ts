/**
 * HTML sanitisation for admin-authored content.
 *
 * The blog CMS lets an authorised editor store HTML, and the public site renders it.
 * This module is the boundary between editor input and the browser. It is intentionally
 * an allow-list: anything not explicitly permitted is removed, rather than trying to
 * enumerate every dangerous construct.
 *
 * Implemented without a dependency on purpose. A general-purpose sanitiser would be the
 * right call in production (DOMPurify is the standard), but it is a large dependency and
 * its behaviour changes between versions. This parser is small, auditable, and covered by
 * a dedicated attack suite in `tests/content-sanitize.test.ts`. If the CMS grows to allow
 * arbitrary embeds or rich tables, swap this for DOMPurify and keep the tests.
 */

/** Elements an editor may use. */
const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "div",
  "em",
  "h2",
  "h3",
  "h4",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "span",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
]);

/** Attributes allowed per element. Absent means none. */
const ALLOWED_ATTRIBUTES: Record<string, ReadonlySet<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title", "width", "height"]),
  div: new Set(["class", "id"]),
  span: new Set(["class"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan", "scope"]),
  ol: new Set(["start"]),
};

/**
 * Elements removed together with their entire contents.
 *
 * Only non-void elements belong here. A void element (input, meta, link, base, embed)
 * has no closing tag, so putting it in this set means a stray `</input>` elsewhere in
 * the document would decrement the drop depth and silently un-drop everything after it.
 * Void dangerous elements are dropped as individual tags instead.
 */
const DROP_WITH_CONTENT = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "form",
  "button",
  "select",
  "textarea",
  "svg",
  "math",
  "template",
  "noscript",
  "frame",
  "frameset",
  "applet",
]);

/** Dangerous void elements, dropped as individual tags with no scope tracking. */
const DROP_VOID = new Set(["input", "meta", "link", "base", "embed"]);

/** Void elements: no closing tag, so they must never open a drop scope. */
const VOID_TAGS = new Set(["br", "hr", "img", "meta", "link", "base", "input", "embed"]);

/** Safe URL schemes. Relative URLs are allowed. */
const SAFE_SCHEMES = new Set(["http", "https", "mailto"]);

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Validate a URL. Returns the safe URL, or null when it should be dropped.
 * `data:` is permitted only for raster image types on `img src`, because editors
 * legitimately paste small inline images.
 */
function safeUrl(raw: string, allowImageData: boolean): string | null {
  const value = raw.trim();
  if (value === "") return null;

  // Relative URLs (including protocol-relative and fragments) are fine.
  if (value.startsWith("/") || value.startsWith("#") || value.startsWith("./") || value.startsWith("../")) {
    return value;
  }
  if (value.startsWith("//")) return null;

  const schemeMatch = value.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (!schemeMatch) return value;

  const scheme = schemeMatch[1]!.toLowerCase();

  if (allowImageData && scheme === "data") {
    if (/^data:image\/(?:png|jpeg|jpg|gif|webp|avif);base64,/i.test(value)) return value;
    return null;
  }

  if (SAFE_SCHEMES.has(scheme)) return value;
  return null;
}

/** Drop control characters and the ASCII DEL, which confuse parsers. */
function normalise(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

type Token =
  | { type: "text"; value: string }
  | { type: "open"; tag: string; attributes: string; selfClosing: boolean }
  | { type: "close"; tag: string };

/** Minimal tokenizer. Handles comments, declarations and malformed markup. */
function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < input.length) {
    const lt = input.indexOf("<", index);
    if (lt === -1) {
      tokens.push({ type: "text", value: input.slice(index) });
      break;
    }
    if (lt > index) tokens.push({ type: "text", value: input.slice(index, lt) });

    // Comment or declaration: skip to the closing bracket.
    if (input.startsWith("<!--", lt)) {
      const end = input.indexOf("-->", lt + 4);
      index = end === -1 ? input.length : end + 3;
      continue;
    }
    if (input[lt + 1] === "!" || input[lt + 1] === "?") {
      const end = input.indexOf(">", lt);
      index = end === -1 ? input.length : end + 1;
      continue;
    }

    const gt = findTagEnd(input, lt);
    if (gt === -1) {
      // No closing bracket: treat the rest as text rather than dropping it silently.
      tokens.push({ type: "text", value: input.slice(lt) });
      break;
    }

    const raw = input.slice(lt + 1, gt);
    index = gt + 1;

    if (raw.startsWith("/")) {
      const tag = raw.slice(1).trim().toLowerCase().split(/[\s/>]/)[0] ?? "";
      if (tag) tokens.push({ type: "close", tag });
      continue;
    }

    const selfClosing = raw.endsWith("/");
    const body = selfClosing ? raw.slice(0, -1) : raw;
    const nameMatch = body.match(/^([a-zA-Z][a-zA-Z0-9-]*)/);
    if (!nameMatch) {
      tokens.push({ type: "text", value: `<${body}>` });
      continue;
    }
    const tag = nameMatch[1]!.toLowerCase();
    const attributes = body.slice(nameMatch[1]!.length);
    tokens.push({ type: "open", tag, attributes: attributes.trim(), selfClosing });
  }

  return tokens;
}

/** Find the closing `>` of a tag, respecting quoted attribute values. */
function findTagEnd(input: string, start: number): number {
  let quote: string | null = null;
  for (let i = start + 1; i < input.length; i += 1) {
    const ch = input[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === ">") return i;
  }
  return -1;
}

/** Parse an attribute string into name/value pairs, tolerating messy input. */
function parseAttributes(raw: string, tag: string): Array<[string, string]> {
  const allowed = ALLOWED_ATTRIBUTES[tag];
  if (!allowed) return [];

  const pairs: Array<[string, string]> = [];
  const pattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(raw)) !== null) {
    const name = match[1]!.toLowerCase();
    if (!allowed.has(name)) continue;

    const value = match[3] ?? match[4] ?? match[5] ?? "";
    // Event handlers are never in the allow-list, so on* is rejected by construction.
    if (name.startsWith("on")) continue;

    if (name === "href" || name === "src") {
      const isImageSource = tag === "img" && name === "src";
      const safe = safeUrl(value, isImageSource);
      if (safe === null) continue;
      pairs.push([name, safe]);
      continue;
    }

    // Numeric-looking attributes only, to keep width/height/colspan sane.
    if (["width", "height", "colspan", "rowspan", "start"].includes(name)) {
      if (!/^\d{1,5}$/.test(value.trim())) continue;
      pairs.push([name, value.trim()]);
      continue;
    }

    if (name === "target") {
      if (value.toLowerCase() !== "_blank") continue;
      pairs.push([name, "_blank"]);
      continue;
    }

    if (name === "rel") {
      // Force the safe token; never trust an editor-supplied value.
      pairs.push([name, "noopener noreferrer nofollow"]);
      continue;
    }

    if (name === "alt" || name === "title" || name === "scope") {
      pairs.push([name, value]);
      continue;
    }

    // class and id survive, but only with a conservative character set. Editors use
    // them for anchors and styling hooks; a URL or expression in a class is rejected.
    if (name === "class" || name === "id") {
      if (!/^[\w\s-]{1,120}$/.test(value)) continue;
      pairs.push([name, value]);
      continue;
    }
  }

  return pairs;
}

function renderAttributes(pairs: Array<[string, string]>): string {
  if (pairs.length === 0) return "";
  return ` ${pairs.map(([name, value]) => `${name}="${escapeAttribute(value)}"`).join(" ")}`;
}

/** Void elements that never take a closing tag. */
const CLOSABLE_VOID = new Set(["br", "hr", "img"]);

/**
 * Sanitize an HTML fragment.
 *
 * Allow-list based: unknown elements are dropped but their text content is kept, so a
 * stray tag never silently deletes an editor's writing. Dangerous elements are dropped
 * with their contents.
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== "string" || input === "") return "";

  const tokens = tokenize(normalise(input));
  const out: string[] = [];
  /** Stack of elements whose contents must be discarded. */
  let dropDepth = 0;

  for (const token of tokens) {
    if (token.type === "text") {
      if (dropDepth === 0) out.push(escapeText(token.value));
      continue;
    }

    if (token.type === "close") {
      // Must be handled before the allow-list check: a closing tag for a dropped
      // element is what ends its content scope, and skipping it here would swallow
      // the rest of the document.
      if (DROP_WITH_CONTENT.has(token.tag)) {
        dropDepth = Math.max(0, dropDepth - 1);
        continue;
      }
      if (dropDepth > 0) continue;
      if (!ALLOWED_TAGS.has(token.tag)) continue;
      if (CLOSABLE_VOID.has(token.tag)) continue;
      out.push(`</${token.tag}>`);
      continue;
    }

    // Opening tag.
    if (DROP_VOID.has(token.tag)) continue;
    if (DROP_WITH_CONTENT.has(token.tag)) {
      // Void elements never have a closing tag, so they cannot open a drop scope.
      if (!token.selfClosing && !VOID_TAGS.has(token.tag)) dropDepth += 1;
      continue;
    }
    if (dropDepth > 0) continue;
    if (!ALLOWED_TAGS.has(token.tag)) continue;

    const pairs = parseAttributes(token.attributes, token.tag);

    // Every image must have an alt attribute. Decorative images use alt="".
    if (token.tag === "img") {
      const hasAlt = pairs.some(([name]) => name === "alt");
      if (!hasAlt) pairs.push(["alt", ""]);
    }

    // External links are forced to a new tab with safe rel tokens.
    if (token.tag === "a") {
      const href = pairs.find(([name]) => name === "href");
      if (href && /^https?:\/\//i.test(href[1])) {
        if (!pairs.some(([name]) => name === "target")) pairs.push(["target", "_blank"]);
        if (!pairs.some(([name]) => name === "rel")) pairs.push(["rel", "noopener noreferrer nofollow"]);
      }
    }

    const attrs = renderAttributes(pairs);
    out.push(`<${token.tag}${attrs}>`);
  }

  return out.join("");
}

/** True when the input is already safe and would survive sanitisation unchanged. */
export function isSafeHtml(input: string): boolean {
  return sanitizeHtml(input) === input;
}

/** Plain-text extraction, for summaries and meta descriptions. */
export function htmlToText(input: string, max_length = 200): string {
  const withoutTags = sanitizeHtml(input)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return withoutTags.length <= max_length ? withoutTags : `${withoutTags.slice(0, max_length - 1)}…`;
}
