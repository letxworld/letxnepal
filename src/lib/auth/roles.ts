/**
 * Role and domain model.
 *
 * Two dimensions, deliberately separate:
 *
 *   - login role: who the person is (tourist, hotel owner, agency, guide)
 *   - admin domain: which back-office area an Admin may act in (blog, hotel,
 *     customer, finance, flight, bus)
 *
 * An Admin account is granted exactly ONE domain. There is no multi-domain Admin, so
 * no single login accumulates unrelated power. Access checks are always
 * `role AND domain`, never role alone.
 *
 * Money and provisioning are the two most sensitive capabilities in the product. Both
 * are audit-logged and neither is reachable by a scoped Admin acting alone where a
 * handoff is required (see the refund handoff in docs/spec.md §5).
 */

/** End-user login roles. */
export const LOGIN_ROLES = ["tourist", "hotel_owner", "agency", "guide"] as const;
export type LoginRole = (typeof LOGIN_ROLES)[number];

/** Back-office roles. SuperAdmin is a superset; Admin is domain-scoped. */
export const BACKOFFICE_ROLES = ["super_admin", "admin"] as const;
export type BackofficeRole = (typeof BACKOFFICE_ROLES)[number];

/** The six Admin domains. */
export const ADMIN_DOMAINS = [
  "blog",
  "hotel",
  "customer",
  "finance",
  "flight",
  "bus",
] as const;
export type AdminDomain = (typeof ADMIN_DOMAINS)[number];

/** Every capability the product exposes. */
export const CAPABILITIES = [
  // content
  "blog:write",
  "destination:read",
  // hotels and organisations
  "hotel:create",
  "hotel:remove",
  "hotel:assign_owner",
  "availability:write_own",
  // customers
  "customer:read",
  "customer:update",
  "refund:request",
  // finance
  "finance:read",
  "charge:execute",
  "refund:execute",
  "payout:execute",
  "ledger:read",
  // booking providers
  "flight:administer",
  "bus:administer",
  // platform
  "admin:provision",
  "admin:revoke",
  "audit:read",
] as const;
export type Capability = (typeof CAPABILITIES)[number];

export type Actor = {
  userId: string;
  /** Login role for end users, back-office role for staff. */
  role: LoginRole | BackofficeRole;
  /** Required when role is `admin`. Exactly one domain per account. */
  domain?: AdminDomain;
  /** Organisation scope for hotel owners and agencies. */
  organizationId?: string;
};

/** Capabilities granted to a scoped Admin, by domain. */
export const DOMAIN_CAPABILITIES: Record<AdminDomain, readonly Capability[]> = {
  blog: ["blog:write", "destination:read"],
  hotel: ["hotel:create", "hotel:remove", "hotel:assign_owner", "destination:read"],
  customer: ["customer:read", "customer:update", "refund:request"],
  finance: ["finance:read", "charge:execute", "refund:execute", "payout:execute", "ledger:read"],
  flight: ["flight:administer"],
  bus: ["bus:administer"],
};

/** Capabilities that only SuperAdmin holds. */
export const SUPER_ADMIN_ONLY: readonly Capability[] = [
  "admin:provision",
  "admin:revoke",
  "audit:read",
];

function capabilitiesFor(actor: Actor): Set<Capability> {
  const set = new Set<Capability>();

  if (actor.role === "super_admin") {
    // SuperAdmin is a superset of every domain plus provisioning.
    for (const list of Object.values(DOMAIN_CAPABILITIES)) {
      for (const capability of list) set.add(capability);
    }
    for (const capability of SUPER_ADMIN_ONLY) set.add(capability);
    return set;
  }

  if (actor.role === "admin") {
    // Exactly one domain. A missing domain grants nothing — fail closed.
    if (!actor.domain) return set;
    for (const capability of DOMAIN_CAPABILITIES[actor.domain]) set.add(capability);
    return set;
  }

  if (actor.role === "hotel_owner") {
    set.add("availability:write_own");
    set.add("destination:read");
    return set;
  }

  return set;
}

/**
 * Authorise a capability.
 *
 * Returns a denial reason rather than throwing, so callers can map it to a 403 with
 * an accurate message. A scoped Admin attempting another domain's capability is denied
 * with `wrong_domain`, which is the case the permission matrix exists to catch.
 */
export function authorize(
  actor: Actor,
  capability: Capability,
): { allowed: true } | { allowed: false; reason: "no_role" | "wrong_domain" | "not_granted" } {
  // An Admin without a domain fails closed, regardless of the capability.
  if (actor.role === "admin" && !actor.domain) {
    return { allowed: false, reason: "wrong_domain" };
  }

  // Unknown role value: fail closed rather than assuming a default.
  const known =
    actor.role === "super_admin" ||
    actor.role === "admin" ||
    actor.role === "hotel_owner" ||
    actor.role === "tourist" ||
    actor.role === "agency" ||
    actor.role === "guide";
  if (!known) return { allowed: false, reason: "no_role" };

  const granted = capabilitiesFor(actor);
  if (!granted.has(capability)) {
    return {
      allowed: false,
      // A scoped Admin reaching outside its domain is the case worth naming,
      // because that is the mistake the two-dimensional check exists to prevent.
      reason: actor.role === "admin" ? "wrong_domain" : "not_granted",
    };
  }
  return { allowed: true };
}

/** Domains an Admin may be granted. Used by the provisioning screen. */
export function selectableDomains(): AdminDomain[] {
  return [...ADMIN_DOMAINS];
}

export function isAdminDomain(value: string): value is AdminDomain {
  return (ADMIN_DOMAINS as readonly string[]).includes(value);
}

export function isLoginRole(value: string): value is LoginRole {
  return (LOGIN_ROLES as readonly string[]).includes(value);
}

export function isBackofficeRole(value: string): value is BackofficeRole {
  return (BACKOFFICE_ROLES as readonly string[]).includes(value);
}

/** Human-readable label for a login role, used on the login screen. */
export const LOGIN_ROLE_LABELS: Record<LoginRole, string> = {
  tourist: "Tourist",
  hotel_owner: "Hotel owner",
  agency: "Agency",
  guide: "Guide",
};

/** Human-readable label for an admin domain, used on the provisioning screen. */
export const DOMAIN_LABELS: Record<AdminDomain, string> = {
  blog: "Blog management",
  hotel: "Hotel management",
  customer: "Tourist / customer management",
  finance: "Finance",
  flight: "Flight management",
  bus: "Bus ticket management",
};

export const DOMAIN_DESCRIPTIONS: Record<AdminDomain, string> = {
  blog: "Write and edit the blog page belonging to one destination.",
  hotel: "Add and remove listed hotels, and assign their owners.",
  customer: "Manage customer accounts and raise cancellation or refund requests.",
  finance: "Execute charges, refunds and payouts, and reconcile the ledger.",
  flight: "Administer flight content and bookings once the provider API is connected.",
  bus: "Administer bus routes and tickets once the provider API is connected.",
};

/**
 * Capabilities that must be audit-logged. Provisioning changes who can act; finance
 * moves money; hotel removal takes a business off the platform.
 */
export const AUDITED_CAPABILITIES: readonly Capability[] = [
  "admin:provision",
  "admin:revoke",
  "hotel:create",
  "hotel:remove",
  "hotel:assign_owner",
  "charge:execute",
  "refund:execute",
  "payout:execute",
  "refund:request",
];

/** The four login choices shown on the login screen, in display order. */
export const LOGIN_CHOICES = LOGIN_ROLES.map((role) => ({
  value: role,
  label: LOGIN_ROLE_LABELS[role],
}));
